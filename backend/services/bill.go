package services

import (
	"billboard/backend/models"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BillService struct {
	db *gorm.DB
}

func NewBillService(db *gorm.DB) *BillService {
	return &BillService{db: db}
}

// CreateBill creates a new bill
func (s *BillService) CreateBill(shopID, userID uuid.UUID, req models.BillRequest) (*models.BillResponse, error) {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		return nil, errors.New("access denied to shop")
	}

	// Parse bill date
	billDate, err := time.Parse("2006-01-02", req.BillDate)
	if err != nil {
		return nil, errors.New("invalid bill date format")
	}

	// Parse due date if provided
	var dueDate *time.Time
	if req.DueDate != nil && *req.DueDate != "" {
		parsedDueDate, err := time.Parse("2006-01-02", *req.DueDate)
		if err != nil {
			return nil, errors.New("invalid due date format")
		}
		dueDate = &parsedDueDate
	}

	// Generate bill number
	billNumber, err := s.generateBillNumber(shopID)
	if err != nil {
		return nil, err
	}

	// Calculate totals
	subTotal := 0.0
	for _, item := range req.Items {
		subTotal += float64(item.Quantity) * item.UnitPrice
	}

	taxAmount := subTotal * (req.TaxRate / 100)
	totalAmount := subTotal + taxAmount - req.Discount

	// Ensure totalAmount is not negative
	if totalAmount < 0 {
		totalAmount = 0
	}

	// Create bill
	bill := models.Bill{
		ShopID:        shopID,
		CustomerID:    req.CustomerID,
		BillNumber:    billNumber,
		BillDate:      billDate,
		DueDate:       dueDate,
		SubTotal:      subTotal,
		TaxAmount:     taxAmount,
		Discount:      req.Discount,
		TotalAmount:   totalAmount,
		PaidAmount:    0,
		PendingAmount: totalAmount, // Initially pending amount equals total amount
		Balance:       totalAmount,
		Status:        "draft",
		Notes:         req.Notes,
		Terms:         req.Terms,
		CreatedBy:     userID.String(), // Set the user who created the bill
	}

	// Debug logging
	fmt.Printf("Creating bill with SubTotal: %f, TaxAmount: %f, TotalAmount: %f\n", subTotal, taxAmount, totalAmount)

	if err := s.db.Create(&bill).Error; err != nil {
		return nil, err
	}

	// Create bill items
	for _, itemReq := range req.Items {
		// Get item details
		var item models.Item
		if err := s.db.Where("id = ? AND shop_id = ?", itemReq.ItemID, shopID).First(&item).Error; err != nil {
			return nil, errors.New("item not found")
		}

		billItem := models.BillItem{
			BillID:      bill.ID,
			ItemID:      itemReq.ItemID,
			ItemName:    item.Name,
			Description: itemReq.Description,
			Quantity:    itemReq.Quantity,
			UnitPrice:   itemReq.UnitPrice,
			TotalPrice:  float64(itemReq.Quantity) * itemReq.UnitPrice,
		}

		if err := s.db.Create(&billItem).Error; err != nil {
			return nil, err
		}

		// Update item quantity
		if err := s.db.Model(&item).Update("quantity", int(item.Quantity)-itemReq.Quantity).Error; err != nil {
			return nil, err
		}
	}

	// Fetch the complete bill with relationships
	return s.getBillWithRelations(bill.ID, shopID)
}

// GetBills retrieves all bills for a shop
func (s *BillService) GetBills(shopID, userID uuid.UUID, filters map[string]interface{}) ([]models.BillResponse, error) {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		return nil, errors.New("access denied to shop")
	}

	var bills []models.Bill
	query := s.db.Where("shop_id = ? AND deleted_at IS NULL", shopID)

	// Apply filters
	if search, ok := filters["search"].(string); ok && search != "" {
		query = query.Where("bill_number ILIKE ? OR notes ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if status, ok := filters["status"].(string); ok && status != "" {
		query = query.Where("status = ?", status)
	}

	if customerID, ok := filters["customer_id"].(string); ok && customerID != "" {
		query = query.Where("customer_id = ?", customerID)
	}

	if startDate, ok := filters["start_date"].(string); ok && startDate != "" {
		query = query.Where("bill_date >= ?", startDate)
	}

	if endDate, ok := filters["end_date"].(string); ok && endDate != "" {
		query = query.Where("bill_date <= ?", endDate)
	}

	if err := query.Order("created_at DESC").Find(&bills).Error; err != nil {
		return nil, err
	}

	var responses []models.BillResponse
	for _, bill := range bills {
		response, err := s.getBillWithRelations(bill.ID, shopID)
		if err != nil {
			continue
		}
		responses = append(responses, *response)
	}

	return responses, nil
}

// GetBill retrieves a specific bill
func (s *BillService) GetBill(billID, shopID, userID uuid.UUID) (*models.BillResponse, error) {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		return nil, errors.New("access denied to shop")
	}

	var bill models.Bill
	if err := s.db.Where("id = ? AND shop_id = ? AND deleted_at IS NULL", billID, shopID).First(&bill).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("bill not found")
		}
		return nil, err
	}

	return s.getBillWithRelations(bill.ID, shopID)
}

// UpdateBill updates an existing bill
func (s *BillService) UpdateBill(billID, shopID, userID uuid.UUID, req models.BillRequest) (*models.BillResponse, error) {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		return nil, errors.New("access denied to shop")
	}

	var bill models.Bill
	if err := s.db.Where("id = ? AND shop_id = ? AND deleted_at IS NULL", billID, shopID).First(&bill).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("bill not found")
		}
		return nil, err
	}

	// Only allow updates for draft bills
	if bill.Status != "draft" {
		return nil, errors.New("only draft bills can be updated")
	}

	// Parse bill date
	billDate, err := time.Parse("2006-01-02", req.BillDate)
	if err != nil {
		return nil, errors.New("invalid bill date format")
	}

	// Parse due date if provided
	var dueDate *time.Time
	if req.DueDate != nil && *req.DueDate != "" {
		parsedDueDate, err := time.Parse("2006-01-02", *req.DueDate)
		if err != nil {
			return nil, errors.New("invalid due date format")
		}
		dueDate = &parsedDueDate
	}

	// Calculate totals
	subTotal := 0.0
	for _, item := range req.Items {
		subTotal += float64(item.Quantity) * item.UnitPrice
	}

	taxAmount := subTotal * (req.TaxRate / 100)
	totalAmount := subTotal + taxAmount - req.Discount

	// Update bill
	newBalance := totalAmount - bill.PaidAmount
	updates := map[string]interface{}{
		"customer_id":    req.CustomerID,
		"bill_date":      billDate,
		"due_date":       dueDate,
		"sub_total":      subTotal,
		"tax_amount":     taxAmount,
		"discount":       req.Discount,
		"total_amount":   totalAmount,
		"pending_amount": newBalance, // Update pending amount
		"balance":        newBalance,
		"notes":          req.Notes,
		"terms":          req.Terms,
		"updated_at":     time.Now(),
	}

	if err := s.db.Model(&models.Bill{}).Where("id = ?", billID).Updates(updates).Error; err != nil {
		return nil, err
	}

	// Delete existing bill items
	if err := s.db.Where("bill_id = ?", billID).Delete(&models.BillItem{}).Error; err != nil {
		return nil, err
	}

	// Create new bill items
	for _, itemReq := range req.Items {
		// Get item details
		var item models.Item
		if err := s.db.Where("id = ? AND shop_id = ?", itemReq.ItemID, shopID).First(&item).Error; err != nil {
			return nil, errors.New("item not found")
		}

		billItem := models.BillItem{
			BillID:      bill.ID,
			ItemID:      itemReq.ItemID,
			ItemName:    item.Name,
			Description: itemReq.Description,
			Quantity:    itemReq.Quantity,
			UnitPrice:   itemReq.UnitPrice,
			TotalPrice:  float64(itemReq.Quantity) * itemReq.UnitPrice,
		}

		if err := s.db.Create(&billItem).Error; err != nil {
			return nil, err
		}
	}

	// Fetch the updated bill with relationships
	return s.getBillWithRelations(bill.ID, shopID)
}

// DeleteBill soft deletes a bill
func (s *BillService) DeleteBill(billID, shopID, userID uuid.UUID) error {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		return errors.New("access denied to shop")
	}

	var bill models.Bill
	if err := s.db.Where("id = ? AND shop_id = ? AND deleted_at IS NULL", billID, shopID).First(&bill).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("bill not found")
		}
		return err
	}

	// Only allow deletion for draft bills
	if bill.Status != "draft" {
		return errors.New("only draft bills can be deleted")
	}

	if err := s.db.Delete(&bill).Error; err != nil {
		return err
	}

	return nil
}

// AddPayment adds a payment to a bill
func (s *BillService) AddPayment(billID, shopID, userID uuid.UUID, req models.PaymentRequest) (*models.PaymentResponse, error) {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		return nil, errors.New("access denied to shop")
	}

	var bill models.Bill
	if err := s.db.Where("id = ? AND shop_id = ? AND deleted_at IS NULL", billID, shopID).First(&bill).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("bill not found")
		}
		return nil, err
	}

	// Parse payment date
	paymentDate, err := time.Parse("2006-01-02", req.PaymentDate)
	if err != nil {
		return nil, errors.New("invalid payment date format")
	}

	// Create payment
	payment := models.Payment{
		BillID:        billID,
		Amount:        req.Amount,
		PaymentDate:   paymentDate,
		PaymentMethod: req.PaymentMethod,
		Reference:     req.Reference,
		Notes:         req.Notes,
		CreatedBy:     userID.String(), // Set the user who created the payment
	}

	if err := s.db.Create(&payment).Error; err != nil {
		return nil, err
	}

	// Update bill paid amount and balance
	newPaidAmount := bill.PaidAmount + req.Amount
	newBalance := bill.TotalAmount - newPaidAmount

	// Update bill status based on balance
	newStatus := bill.Status
	if newBalance <= 0 {
		newStatus = "paid"
	} else if bill.DueDate != nil && time.Now().After(*bill.DueDate) {
		newStatus = "overdue"
	} else {
		newStatus = "sent"
	}

	updates := map[string]interface{}{
		"paid_amount":    newPaidAmount,
		"pending_amount": newBalance, // Pending amount is the remaining balance
		"balance":        newBalance,
		"status":         newStatus,
		"updated_at":     time.Now(),
	}

	if err := s.db.Model(&models.Bill{}).Where("id = ?", billID).Updates(updates).Error; err != nil {
		return nil, err
	}

	response := s.paymentToResponse(payment)
	return &response, nil
}

// GetBillStats retrieves bill statistics for a shop
func (s *BillService) GetBillStats(shopID, userID uuid.UUID) (*models.BillStats, error) {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		return nil, errors.New("access denied to shop")
	}

	var stats models.BillStats
	var totalBills, thisMonthBills int64

	// Total bills
	s.db.Model(&models.Bill{}).Where("shop_id = ? AND deleted_at IS NULL", shopID).Count(&totalBills)
	stats.TotalBills = int(totalBills)

	// Total amount
	s.db.Model(&models.Bill{}).Where("shop_id = ? AND deleted_at IS NULL", shopID).Select("COALESCE(SUM(total_amount), 0)").Scan(&stats.TotalAmount)

	// Paid amount
	s.db.Model(&models.Bill{}).Where("shop_id = ? AND deleted_at IS NULL", shopID).Select("COALESCE(SUM(paid_amount), 0)").Scan(&stats.PaidAmount)

	// Outstanding amount
	s.db.Model(&models.Bill{}).Where("shop_id = ? AND deleted_at IS NULL", shopID).Select("COALESCE(SUM(balance), 0)").Scan(&stats.OutstandingAmount)

	// Overdue amount
	s.db.Model(&models.Bill{}).Where("shop_id = ? AND status = 'overdue' AND deleted_at IS NULL", shopID).Select("COALESCE(SUM(balance), 0)").Scan(&stats.OverdueAmount)

	// This month bills
	startOfMonth := time.Now().AddDate(0, 0, -time.Now().Day()+1)
	s.db.Model(&models.Bill{}).Where("shop_id = ? AND bill_date >= ? AND deleted_at IS NULL", shopID, startOfMonth).Count(&thisMonthBills)
	stats.ThisMonthBills = int(thisMonthBills)

	// This month amount
	s.db.Model(&models.Bill{}).Where("shop_id = ? AND bill_date >= ? AND deleted_at IS NULL", shopID, startOfMonth).Select("COALESCE(SUM(total_amount), 0)").Scan(&stats.ThisMonthAmount)

	return &stats, nil
}

// generateBillNumber generates a unique bill number
func (s *BillService) generateBillNumber(shopID uuid.UUID) (string, error) {
	// Get the count of bills for this shop
	var count int64
	s.db.Model(&models.Bill{}).Where("shop_id = ?", shopID).Count(&count)

	// Generate bill number: BILL-YYYY-NNNNNN
	year := time.Now().Year()
	billNumber := fmt.Sprintf("BILL-%d-%06d", year, count+1)

	// Check if bill number already exists
	var existingBill models.Bill
	if err := s.db.Where("bill_number = ?", billNumber).First(&existingBill).Error; err == nil {
		// If exists, increment and try again
		return s.generateBillNumber(shopID)
	}

	return billNumber, nil
}

// getBillWithRelations fetches a bill with all its relationships
func (s *BillService) getBillWithRelations(billID, shopID uuid.UUID) (*models.BillResponse, error) {
	var bill models.Bill
	if err := s.db.Preload("Customer").Preload("Items").Preload("Payments").Where("id = ? AND shop_id = ?", billID, shopID).First(&bill).Error; err != nil {
		return nil, err
	}

	response := s.billToResponse(bill)
	return &response, nil
}

// billToResponse converts a Bill model to BillResponse
func (s *BillService) billToResponse(bill models.Bill) models.BillResponse {
	var customer *models.CustomerResponse
	if bill.Customer != nil {
		customerResp := s.customerToResponse(*bill.Customer)
		customer = &customerResp
	}

	var items []models.BillItemResponse
	for _, item := range bill.Items {
		items = append(items, s.billItemToResponse(item))
	}

	var payments []models.PaymentResponse
	for _, payment := range bill.Payments {
		payments = append(payments, s.paymentToResponse(payment))
	}

	return models.BillResponse{
		ID:          bill.ID,
		ShopID:      bill.ShopID,
		CustomerID:  bill.CustomerID,
		BillNumber:  bill.BillNumber,
		BillDate:    bill.BillDate,
		DueDate:     bill.DueDate,
		SubTotal:    bill.SubTotal,
		TaxAmount:   bill.TaxAmount,
		Discount:    bill.Discount,
		TotalAmount: bill.TotalAmount,
		PaidAmount:  bill.PaidAmount,
		Balance:     bill.Balance,
		Status:      bill.Status,
		Notes:       bill.Notes,
		Terms:       bill.Terms,
		Customer:    customer,
		Items:       items,
		Payments:    payments,
		CreatedAt:   bill.CreatedAt,
		UpdatedAt:   bill.UpdatedAt,
	}
}

// billItemToResponse converts a BillItem model to BillItemResponse
func (s *BillService) billItemToResponse(item models.BillItem) models.BillItemResponse {
	return models.BillItemResponse{
		ID:          item.ID,
		BillID:      item.BillID,
		ItemID:      item.ItemID,
		ItemName:    item.ItemName,
		Description: item.Description,
		Quantity:    item.Quantity,
		UnitPrice:   item.UnitPrice,
		TotalPrice:  item.TotalPrice,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
	}
}

// paymentToResponse converts a Payment model to PaymentResponse
func (s *BillService) paymentToResponse(payment models.Payment) models.PaymentResponse {
	return models.PaymentResponse{
		ID:            payment.ID,
		BillID:        payment.BillID,
		Amount:        payment.Amount,
		PaymentDate:   payment.PaymentDate,
		PaymentMethod: payment.PaymentMethod,
		Reference:     payment.Reference,
		Notes:         payment.Notes,
		CreatedAt:     payment.CreatedAt,
		UpdatedAt:     payment.UpdatedAt,
	}
}

// customerToResponse converts a Customer model to CustomerResponse (helper method)
func (s *BillService) customerToResponse(customer models.Customer) models.CustomerResponse {
	return models.CustomerResponse{
		ID:         customer.ID,
		ShopID:     customer.ShopID,
		Name:       customer.Name,
		Email:      customer.Email,
		Phone:      customer.Phone,
		Address:    customer.Address,
		City:       customer.City,
		State:      customer.State,
		Country:    customer.Country,
		PostalCode: customer.PostalCode,
		TaxNumber:  customer.TaxNumber,
		Notes:      customer.Notes,
		IsActive:   customer.IsActive,
		CreatedAt:  customer.CreatedAt,
		UpdatedAt:  customer.UpdatedAt,
	}
}
