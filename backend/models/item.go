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
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Shop Shop `json:"shop,omitempty" gorm:"foreignKey:ShopID"`
}

type Customer struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ShopID    uuid.UUID      `json:"shop_id" gorm:"not null"`
	Name      string         `json:"name" gorm:"not null"`
	Email     string         `json:"email"`
	Phone     string         `json:"phone"`
	Address   string         `json:"address"`
	GSTNumber string         `json:"gst_number"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Shop  Shop   `json:"shop,omitempty" gorm:"foreignKey:ShopID"`
	Bills []Bill `json:"bills,omitempty" gorm:"foreignKey:CustomerID"`
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
