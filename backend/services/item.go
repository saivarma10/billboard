package services

import (
	"billboard/backend/models"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ItemService handles item-related business logic
type ItemService struct {
	db *gorm.DB
}

// NewItemService creates a new ItemService instance
func NewItemService(db *gorm.DB) *ItemService {
	return &ItemService{db: db}
}

// GetItems retrieves all items for a shop with optional filtering
func (s *ItemService) GetItems(shopID uuid.UUID, filters map[string]interface{}) ([]models.ItemResponse, error) {
	var items []models.Item
	query := s.db.Where("shop_id = ?", shopID)

	// Apply filters
	if category, ok := filters["category"].(string); ok && category != "" {
		query = query.Where("category = ?", category)
	}

	if search, ok := filters["search"].(string); ok && search != "" {
		searchTerm := "%" + strings.ToLower(search) + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(sku) LIKE ?",
			searchTerm, searchTerm, searchTerm)
	}

	if lowStock, ok := filters["low_stock"].(bool); ok && lowStock {
		query = query.Where("quantity <= min_quantity")
	}

	if isActive, ok := filters["is_active"].(bool); ok {
		query = query.Where("is_active = ?", isActive)
	}

	if err := query.Find(&items).Error; err != nil {
		return nil, err
	}

	// Convert to response format
	var responses []models.ItemResponse
	for _, item := range items {
		responses = append(responses, s.itemToResponse(item))
	}

	return responses, nil
}

// GetItem retrieves a single item by ID
func (s *ItemService) GetItem(shopID, itemID uuid.UUID) (*models.ItemResponse, error) {
	var item models.Item
	if err := s.db.Where("shop_id = ? AND id = ?", shopID, itemID).First(&item).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("item not found")
		}
		return nil, err
	}

	response := s.itemToResponse(item)
	return &response, nil
}

// CreateItem creates a new item
func (s *ItemService) CreateItem(shopID uuid.UUID, req models.ItemRequest) (*models.ItemResponse, error) {
	// Validate required fields
	if req.Name == "" {
		return nil, errors.New("name is required")
	}
	if req.Price <= 0 {
		return nil, errors.New("price must be greater than 0")
	}

	// Check for duplicate SKU if provided
	if req.SKU != "" {
		var existingItem models.Item
		if err := s.db.Where("shop_id = ? AND sku = ?", shopID, req.SKU).First(&existingItem).Error; err == nil {
			return nil, errors.New("SKU already exists")
		}
	}

	// Create item
	item := models.Item{
		ShopID:      shopID,
		Name:        req.Name,
		Description: req.Description,
		SKU:         req.SKU,
		Price:       req.Price,
		CostPrice:   req.CostPrice,
		TaxRate:     req.TaxRate,
		Category:    req.Category,
		Quantity:    req.Quantity,
		MinQuantity: req.MinQuantity,
		Unit:        req.Unit,
		Barcode:     req.Barcode,
		IsActive:    req.IsActive,
	}

	if item.Unit == "" {
		item.Unit = "PCS"
	}

	if err := s.db.Create(&item).Error; err != nil {
		return nil, err
	}

	response := s.itemToResponse(item)
	return &response, nil
}

// UpdateItem updates an existing item
func (s *ItemService) UpdateItem(shopID, itemID uuid.UUID, req models.ItemRequest) (*models.ItemResponse, error) {
	var item models.Item
	if err := s.db.Where("shop_id = ? AND id = ?", shopID, itemID).First(&item).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("item not found")
		}
		return nil, err
	}

	// Check for duplicate SKU if provided and different from current
	if req.SKU != "" && req.SKU != item.SKU {
		var existingItem models.Item
		if err := s.db.Where("shop_id = ? AND sku = ? AND id != ?", shopID, req.SKU, itemID).First(&existingItem).Error; err == nil {
			return nil, errors.New("SKU already exists")
		}
	}

	// Update fields
	item.Name = req.Name
	item.Description = req.Description
	item.SKU = req.SKU
	item.Price = req.Price
	item.CostPrice = req.CostPrice
	item.TaxRate = req.TaxRate
	item.Category = req.Category
	item.Quantity = req.Quantity
	item.MinQuantity = req.MinQuantity
	item.Unit = req.Unit
	item.Barcode = req.Barcode
	item.IsActive = req.IsActive

	if item.Unit == "" {
		item.Unit = "PCS"
	}

	if err := s.db.Save(&item).Error; err != nil {
		return nil, err
	}

	response := s.itemToResponse(item)
	return &response, nil
}

// DeleteItem soft deletes an item
func (s *ItemService) DeleteItem(shopID, itemID uuid.UUID) error {
	var item models.Item
	if err := s.db.Where("shop_id = ? AND id = ?", shopID, itemID).First(&item).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("item not found")
		}
		return err
	}

	return s.db.Delete(&item).Error
}

// UpdateItemQuantity updates the quantity of an item
func (s *ItemService) UpdateItemQuantity(shopID, itemID uuid.UUID, quantity float64) (*models.ItemResponse, error) {
	var item models.Item
	if err := s.db.Where("shop_id = ? AND id = ?", shopID, itemID).First(&item).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("item not found")
		}
		return nil, err
	}

	item.Quantity = quantity
	if err := s.db.Save(&item).Error; err != nil {
		return nil, err
	}

	response := s.itemToResponse(item)
	return &response, nil
}

// GetCategories retrieves all unique categories for a shop
func (s *ItemService) GetCategories(shopID uuid.UUID) ([]string, error) {
	var categories []string
	if err := s.db.Model(&models.Item{}).
		Where("shop_id = ? AND category != ''", shopID).
		Distinct("category").
		Pluck("category", &categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

// GetLowStockItems retrieves items with quantity below minimum threshold
func (s *ItemService) GetLowStockItems(shopID uuid.UUID) ([]models.ItemResponse, error) {
	var items []models.Item
	if err := s.db.Where("shop_id = ? AND quantity <= min_quantity", shopID).Find(&items).Error; err != nil {
		return nil, err
	}

	var responses []models.ItemResponse
	for _, item := range items {
		responses = append(responses, s.itemToResponse(item))
	}

	return responses, nil
}

// BulkCreateItems creates multiple items at once
func (s *ItemService) BulkCreateItems(shopID uuid.UUID, items []models.ItemRequest) ([]models.ItemResponse, error) {
	var createdItems []models.Item
	var responses []models.ItemResponse

	// Start transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	for _, req := range items {
		// Validate required fields
		if req.Name == "" {
			tx.Rollback()
			return nil, errors.New("name is required for all items")
		}
		if req.Price <= 0 {
			tx.Rollback()
			return nil, errors.New("price must be greater than 0 for all items")
		}

		item := models.Item{
			ShopID:      shopID,
			Name:        req.Name,
			Description: req.Description,
			SKU:         req.SKU,
			Price:       req.Price,
			CostPrice:   req.CostPrice,
			TaxRate:     req.TaxRate,
			Category:    req.Category,
			Quantity:    req.Quantity,
			MinQuantity: req.MinQuantity,
			Unit:        req.Unit,
			Barcode:     req.Barcode,
			IsActive:    req.IsActive,
		}

		if item.Unit == "" {
			item.Unit = "PCS"
		}

		if err := tx.Create(&item).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to create item %s: %v", req.Name, err)
		}

		createdItems = append(createdItems, item)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Convert to response format
	for _, item := range createdItems {
		responses = append(responses, s.itemToResponse(item))
	}

	return responses, nil
}

// itemToResponse converts Item model to ItemResponse
func (s *ItemService) itemToResponse(item models.Item) models.ItemResponse {
	return models.ItemResponse{
		ID:          item.ID,
		ShopID:      item.ShopID,
		Name:        item.Name,
		Description: item.Description,
		SKU:         item.SKU,
		Price:       item.Price,
		CostPrice:   item.CostPrice,
		TaxRate:     item.TaxRate,
		Category:    item.Category,
		Quantity:    item.Quantity,
		MinQuantity: item.MinQuantity,
		Unit:        item.Unit,
		Barcode:     item.Barcode,
		IsActive:    item.IsActive,
		IsLowStock:  item.Quantity <= item.MinQuantity,
		CreatedAt:   item.CreatedAt,
		UpdatedAt:   item.UpdatedAt,
	}
}
