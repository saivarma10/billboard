package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Item struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ShopID      uuid.UUID      `json:"shop_id" gorm:"not null"`
	Name        string         `json:"name" gorm:"not null"`
	Description string         `json:"description"`
	SKU         string         `json:"sku"`
	Price       float64        `json:"price" gorm:"not null"`
	CostPrice   float64        `json:"cost_price"`
	TaxRate     float64        `json:"tax_rate" gorm:"default:0"`
	Category    string         `json:"category"`
	Quantity    float64        `json:"quantity" gorm:"default:0"`
	MinQuantity float64        `json:"min_quantity" gorm:"default:0"`
	Unit        string         `json:"unit" gorm:"default:'PCS'"`
	Barcode     string         `json:"barcode"`
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Shop Shop `json:"shop,omitempty" gorm:"foreignKey:ShopID"`
}

// ItemRequest represents the request payload for creating/updating items
type ItemRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	SKU         string  `json:"sku"`
	Price       float64 `json:"price" binding:"required"`
	CostPrice   float64 `json:"cost_price"`
	TaxRate     float64 `json:"tax_rate"`
	Category    string  `json:"category"`
	Quantity    float64 `json:"quantity"`
	MinQuantity float64 `json:"min_quantity"`
	Unit        string  `json:"unit"`
	Barcode     string  `json:"barcode"`
	IsActive    bool    `json:"is_active"`
}

// ItemResponse represents the response payload for items
type ItemResponse struct {
	ID          uuid.UUID `json:"id"`
	ShopID      uuid.UUID `json:"shop_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	SKU         string    `json:"sku"`
	Price       float64   `json:"price"`
	CostPrice   float64   `json:"cost_price"`
	TaxRate     float64   `json:"tax_rate"`
	Category    string    `json:"category"`
	Quantity    float64   `json:"quantity"`
	MinQuantity float64   `json:"min_quantity"`
	Unit        string    `json:"unit"`
	Barcode     string    `json:"barcode"`
	IsActive    bool      `json:"is_active"`
	IsLowStock  bool      `json:"is_low_stock"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type AuditLog struct {
	ID         uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ShopID     *uuid.UUID `json:"shop_id"`
	UserID     *uuid.UUID `json:"user_id"`
	Action     string     `json:"action" gorm:"not null"`
	EntityType string     `json:"entity_type" gorm:"not null"`
	EntityID   uuid.UUID  `json:"entity_id" gorm:"not null"`
	OldValues  string     `json:"old_values" gorm:"type:jsonb"`
	NewValues  string     `json:"new_values" gorm:"type:jsonb"`
	IPAddress  string     `json:"ip_address"`
	UserAgent  string     `json:"user_agent"`
	CreatedAt  time.Time  `json:"created_at"`

	// Relationships
	Shop *Shop `json:"shop,omitempty" gorm:"foreignKey:ShopID"`
	User *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}
