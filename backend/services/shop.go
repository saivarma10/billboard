package services

import (
	"billboard/backend/models"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ShopService struct {
	db *gorm.DB
}

func NewShopService(db *gorm.DB) *ShopService {
	return &ShopService{db: db}
}

// GetShops retrieves all shops for a user
func (s *ShopService) GetShops(userID uuid.UUID) ([]models.ShopResponse, error) {
	var shopUsers []models.ShopUser
	if err := s.db.Preload("Shop").Where("user_id = ? AND is_active = ?", userID, true).Find(&shopUsers).Error; err != nil {
		return nil, err
	}

	var shops []models.ShopResponse
	for _, shopUser := range shopUsers {
		shops = append(shops, s.shopToResponse(shopUser.Shop))
	}

	return shops, nil
}

// CreateShop creates a new shop
func (s *ShopService) CreateShop(userID uuid.UUID, req models.ShopRequest) (*models.ShopResponse, error) {
	// Validate required fields
	if req.Name == "" {
		return nil, errors.New("name is required")
	}

	// Check for duplicate shop name for this user
	var existingShop models.Shop
	var shopUser models.ShopUser
	if err := s.db.Preload("Shop").Where("user_id = ? AND is_active = ?", userID, true).First(&shopUser).Error; err == nil {
		if err := s.db.Where("id = ? AND name = ?", shopUser.ShopID, req.Name).First(&existingShop).Error; err == nil {
			return nil, errors.New("a shop with this name already exists")
		}
	}

	// Check for duplicate email if provided
	if req.Email != "" {
		if err := s.db.Where("email = ?", req.Email).First(&existingShop).Error; err == nil {
			return nil, errors.New("a shop with this email already exists")
		}
	}

	// Check for duplicate GST number if provided
	if req.GSTNumber != "" {
		if err := s.db.Where("gst_number = ?", req.GSTNumber).First(&existingShop).Error; err == nil {
			return nil, errors.New("a shop with this GST number already exists")
		}
	}

	// Create shop
	shop := models.Shop{
		Name:      req.Name,
		Address:   req.Address,
		Phone:     req.Phone,
		Email:     req.Email,
		GSTNumber: req.GSTNumber,
		LogoURL:   req.LogoURL,
		Settings:  "{}", // Default empty JSON object
		IsActive:  req.IsActive,
	}

	if err := s.db.Create(&shop).Error; err != nil {
		return nil, err
	}

	// Create shop-user relationship (owner)
	newShopUser := models.ShopUser{
		ShopID:      shop.ID,
		UserID:      userID,
		Role:        "owner",
		Permissions: `{"all": true}`,
		IsActive:    true,
	}

	if err := s.db.Create(&newShopUser).Error; err != nil {
		// If shop-user creation fails, delete the shop
		s.db.Delete(&shop)
		return nil, err
	}

	response := s.shopToResponse(shop)
	return &response, nil
}

// GetShop retrieves a single shop by ID
func (s *ShopService) GetShop(shopID, userID uuid.UUID) (*models.ShopResponse, error) {
	var shopUser models.ShopUser
	if err := s.db.Preload("Shop").Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("shop not found or access denied")
		}
		return nil, err
	}

	response := s.shopToResponse(shopUser.Shop)
	return &response, nil
}

// UpdateShop updates an existing shop
func (s *ShopService) UpdateShop(shopID, userID uuid.UUID, req models.ShopRequest) (*models.ShopResponse, error) {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("shop not found or access denied")
		}
		return nil, err
	}

	// Update shop
	updates := map[string]interface{}{
		"name":       req.Name,
		"address":    req.Address,
		"phone":      req.Phone,
		"email":      req.Email,
		"gst_number": req.GSTNumber,
		"logo_url":   req.LogoURL,
		"settings":   "{}", // Default empty JSON object
		"is_active":  req.IsActive,
		"updated_at": time.Now(),
	}

	if err := s.db.Model(&models.Shop{}).Where("id = ?", shopID).Updates(updates).Error; err != nil {
		return nil, err
	}

	// Get updated shop
	var shop models.Shop
	if err := s.db.Where("id = ?", shopID).First(&shop).Error; err != nil {
		return nil, err
	}

	response := s.shopToResponse(shop)
	return &response, nil
}

// DeleteShop deletes a shop
func (s *ShopService) DeleteShop(shopID, userID uuid.UUID) error {
	// Check if user is the owner of the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND role = ? AND is_active = ?", shopID, userID, "owner", true).First(&shopUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("shop not found or you don't have permission to delete it")
		}
		return err
	}

	// Soft delete the shop
	if err := s.db.Where("id = ?", shopID).Delete(&models.Shop{}).Error; err != nil {
		return err
	}

	// Soft delete all shop-user relationships
	if err := s.db.Where("shop_id = ?", shopID).Delete(&models.ShopUser{}).Error; err != nil {
		return err
	}

	return nil
}

// InviteUser invites a user to a shop
func (s *ShopService) InviteUser(shopID, userID uuid.UUID, email, role string) error {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("shop not found or access denied")
		}
		return err
	}

	// Find the user by email
	var targetUser models.User
	if err := s.db.Where("email = ?", email).First(&targetUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user not found")
		}
		return err
	}

	// Check if user is already a member of the shop
	var existingShopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ?", shopID, targetUser.ID).First(&existingShopUser).Error; err == nil {
		return errors.New("user is already a member of this shop")
	}

	// Set default role if not provided
	if role == "" {
		role = "cashier"
	}

	// Create shop-user relationship
	newShopUser := models.ShopUser{
		ShopID:      shopID,
		UserID:      targetUser.ID,
		Role:        role,
		Permissions: `{"read": true, "write": false}`,
		IsActive:    true,
	}

	if err := s.db.Create(&newShopUser).Error; err != nil {
		return err
	}

	return nil
}

// GetDashboard retrieves dashboard analytics for a shop
func (s *ShopService) GetDashboard(shopID, userID uuid.UUID, startDate, endDate string) (map[string]interface{}, error) {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("shop not found or access denied")
		}
		return nil, err
	}

	// Get basic counts
	var totalItems int64
	var totalCustomers int64
	var totalBills int64

	s.db.Model(&models.Item{}).Where("shop_id = ?", shopID).Count(&totalItems)
	s.db.Model(&models.Customer{}).Where("shop_id = ?", shopID).Count(&totalCustomers)
	s.db.Model(&models.Bill{}).Where("shop_id = ?", shopID).Count(&totalBills)

	// Get total sales amount
	var totalSales float64
	s.db.Model(&models.Bill{}).Where("shop_id = ? AND status = ?", shopID, "paid").Select("COALESCE(SUM(total_amount), 0)").Scan(&totalSales)

	dashboard := map[string]interface{}{
		"total_items":     totalItems,
		"total_customers": totalCustomers,
		"total_bills":     totalBills,
		"total_sales":     totalSales,
		"shop_id":         shopID,
	}

	return dashboard, nil
}

// GetSalesAnalytics retrieves sales analytics for a shop
func (s *ShopService) GetSalesAnalytics(shopID, userID uuid.UUID, startDate, endDate, period string) (map[string]interface{}, error) {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("shop not found or access denied")
		}
		return nil, err
	}

	// For now, return basic analytics
	// In a real implementation, you would query based on date ranges and period
	analytics := map[string]interface{}{
		"period":     period,
		"start_date": startDate,
		"end_date":   endDate,
		"shop_id":    shopID,
		"sales":      []map[string]interface{}{},
	}

	return analytics, nil
}

// GetPendingAmounts retrieves pending amounts for a shop
func (s *ShopService) GetPendingAmounts(shopID, userID uuid.UUID, limit int) ([]map[string]interface{}, error) {
	// Check if user has access to the shop
	var shopUser models.ShopUser
	if err := s.db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("shop not found or access denied")
		}
		return nil, err
	}

	// Get pending bills
	var bills []models.Bill
	if err := s.db.Where("shop_id = ? AND status = ?", shopID, "pending").Limit(limit).Find(&bills).Error; err != nil {
		return nil, err
	}

	var pendingAmounts []map[string]interface{}
	for _, bill := range bills {
		pendingAmounts = append(pendingAmounts, map[string]interface{}{
			"bill_id":     bill.ID,
			"customer_id": bill.CustomerID,
			"amount":      bill.TotalAmount,
			"created_at":  bill.CreatedAt,
		})
	}

	return pendingAmounts, nil
}

// shopToResponse converts a Shop model to ShopResponse
func (s *ShopService) shopToResponse(shop models.Shop) models.ShopResponse {
	return models.ShopResponse{
		ID:        shop.ID,
		Name:      shop.Name,
		Address:   shop.Address,
		Phone:     shop.Phone,
		Email:     shop.Email,
		GSTNumber: shop.GSTNumber,
		LogoURL:   shop.LogoURL,
		Settings:  shop.Settings,
		IsActive:  shop.IsActive,
		CreatedAt: shop.CreatedAt,
		UpdatedAt: shop.UpdatedAt,
	}
}
