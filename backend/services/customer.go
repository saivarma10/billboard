package services

import (
	"billboard/backend/models"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CustomerService struct {
	db *gorm.DB
}

func NewCustomerService(db *gorm.DB) *CustomerService {
	return &CustomerService{db: db}
}

// CreateCustomer creates a new customer
func (s *CustomerService) CreateCustomer(shopID, userID uuid.UUID, req models.CustomerRequest) (*models.CustomerResponse, error) {
	// Validate required fields
	if req.Name == "" {
		return nil, errors.New("name is required")
	}

	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		return nil, errors.New("access denied to shop")
	}

	// Check for duplicate customer email in the same shop
	if req.Email != "" {
		var existingCustomer models.Customer
		if err := s.db.Where("shop_id = ? AND email = ? AND deleted_at IS NULL", shopID, req.Email).First(&existingCustomer).Error; err == nil {
			return nil, errors.New("a customer with this email already exists in this shop")
		}
	}

	// Check for duplicate customer phone in the same shop
	if req.Phone != "" {
		var existingCustomer models.Customer
		if err := s.db.Where("shop_id = ? AND phone = ? AND deleted_at IS NULL", shopID, req.Phone).First(&existingCustomer).Error; err == nil {
			return nil, errors.New("a customer with this phone number already exists in this shop")
		}
	}

	// Create customer
	customer := models.Customer{
		ShopID:     shopID,
		Name:       req.Name,
		Email:      req.Email,
		Phone:      req.Phone,
		Address:    req.Address,
		City:       req.City,
		State:      req.State,
		Country:    req.Country,
		PostalCode: req.PostalCode,
		TaxNumber:  req.TaxNumber,
		Notes:      req.Notes,
		IsActive:   req.IsActive,
	}

	if err := s.db.Create(&customer).Error; err != nil {
		return nil, err
	}

	response := s.customerToResponse(customer)
	return &response, nil
}

// GetCustomers retrieves all customers for a shop
func (s *CustomerService) GetCustomers(shopID, userID uuid.UUID, filters map[string]interface{}) ([]models.CustomerResponse, error) {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		return nil, errors.New("access denied to shop")
	}

	var customers []models.Customer
	query := s.db.Where("shop_id = ? AND deleted_at IS NULL", shopID)

	// Apply filters
	if search, ok := filters["search"].(string); ok && search != "" {
		query = query.Where("name ILIKE ? OR email ILIKE ? OR phone ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	if isActive, ok := filters["is_active"].(bool); ok {
		query = query.Where("is_active = ?", isActive)
	}

	if city, ok := filters["city"].(string); ok && city != "" {
		query = query.Where("city ILIKE ?", "%"+city+"%")
	}

	if err := query.Order("created_at DESC").Find(&customers).Error; err != nil {
		return nil, err
	}

	var responses []models.CustomerResponse
	for _, customer := range customers {
		responses = append(responses, s.customerToResponse(customer))
	}

	return responses, nil
}

// GetCustomer retrieves a specific customer
func (s *CustomerService) GetCustomer(customerID, shopID, userID uuid.UUID) (*models.CustomerResponse, error) {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		return nil, errors.New("access denied to shop")
	}

	var customer models.Customer
	if err := s.db.Where("id = ? AND shop_id = ? AND deleted_at IS NULL", customerID, shopID).First(&customer).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("customer not found")
		}
		return nil, err
	}

	response := s.customerToResponse(customer)
	return &response, nil
}

// UpdateCustomer updates an existing customer
func (s *CustomerService) UpdateCustomer(customerID, shopID, userID uuid.UUID, req models.CustomerRequest) (*models.CustomerResponse, error) {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		return nil, errors.New("access denied to shop")
	}

	var customer models.Customer
	if err := s.db.Where("id = ? AND shop_id = ? AND deleted_at IS NULL", customerID, shopID).First(&customer).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("customer not found")
		}
		return nil, err
	}

	// Check for duplicate email (excluding current customer)
	if req.Email != "" && req.Email != customer.Email {
		var existingCustomer models.Customer
		if err := s.db.Where("shop_id = ? AND email = ? AND id != ? AND deleted_at IS NULL", shopID, req.Email, customerID).First(&existingCustomer).Error; err == nil {
			return nil, errors.New("a customer with this email already exists in this shop")
		}
	}

	// Check for duplicate phone (excluding current customer)
	if req.Phone != "" && req.Phone != customer.Phone {
		var existingCustomer models.Customer
		if err := s.db.Where("shop_id = ? AND phone = ? AND id != ? AND deleted_at IS NULL", shopID, req.Phone, customerID).First(&existingCustomer).Error; err == nil {
			return nil, errors.New("a customer with this phone number already exists in this shop")
		}
	}

	// Update customer
	updates := map[string]interface{}{
		"name":        req.Name,
		"email":       req.Email,
		"phone":       req.Phone,
		"address":     req.Address,
		"city":        req.City,
		"state":       req.State,
		"country":     req.Country,
		"postal_code": req.PostalCode,
		"tax_number":  req.TaxNumber,
		"notes":       req.Notes,
		"is_active":   req.IsActive,
		"updated_at":  time.Now(),
	}

	if err := s.db.Model(&models.Customer{}).Where("id = ?", customerID).Updates(updates).Error; err != nil {
		return nil, err
	}

	// Fetch updated customer
	if err := s.db.First(&customer, "id = ?", customerID).Error; err != nil {
		return nil, err
	}

	response := s.customerToResponse(customer)
	return &response, nil
}

// DeleteCustomer soft deletes a customer
func (s *CustomerService) DeleteCustomer(customerID, shopID, userID uuid.UUID) error {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		return errors.New("access denied to shop")
	}

	var customer models.Customer
	if err := s.db.Where("id = ? AND shop_id = ? AND deleted_at IS NULL", customerID, shopID).First(&customer).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("customer not found")
		}
		return err
	}

	if err := s.db.Delete(&customer).Error; err != nil {
		return err
	}

	return nil
}

// GetCustomerStats retrieves customer statistics for a shop
func (s *CustomerService) GetCustomerStats(shopID, userID uuid.UUID) (map[string]interface{}, error) {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		return nil, errors.New("access denied to shop")
	}

	var totalCustomers int64
	var activeCustomers int64
	var newCustomersThisMonth int64

	// Total customers
	s.db.Model(&models.Customer{}).Where("shop_id = ? AND deleted_at IS NULL", shopID).Count(&totalCustomers)

	// Active customers
	s.db.Model(&models.Customer{}).Where("shop_id = ? AND is_active = ? AND deleted_at IS NULL", shopID, true).Count(&activeCustomers)

	// New customers this month
	startOfMonth := time.Now().AddDate(0, 0, -time.Now().Day()+1)
	s.db.Model(&models.Customer{}).Where("shop_id = ? AND created_at >= ? AND deleted_at IS NULL", shopID, startOfMonth).Count(&newCustomersThisMonth)

	return map[string]interface{}{
		"total_customers":          totalCustomers,
		"active_customers":         activeCustomers,
		"new_customers_this_month": newCustomersThisMonth,
	}, nil
}

// customerToResponse converts a Customer model to CustomerResponse
func (s *CustomerService) customerToResponse(customer models.Customer) models.CustomerResponse {
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
