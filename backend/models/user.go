package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null"`
	Password  string         `json:"-" gorm:"not null"`
	FirstName string         `json:"first_name" gorm:"not null"`
	LastName  string         `json:"last_name" gorm:"not null"`
	Phone     string         `json:"phone"`
	IsActive  bool           `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	ShopUsers []ShopUser `json:"shop_users,omitempty" gorm:"foreignKey:UserID"`
}

type Shop struct {
	ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name      string         `json:"name" gorm:"not null"`
	Address   string         `json:"address"`
	Phone     string         `json:"phone"`
	Email     string         `json:"email"`
	GSTNumber string         `json:"gst_number"`
	LogoURL   string         `json:"logo_url"`
	Settings  string         `json:"settings" gorm:"type:jsonb"`
	IsActive  bool           `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	ShopUsers []ShopUser `json:"shop_users,omitempty" gorm:"foreignKey:ShopID"`
	Items     []Item     `json:"items,omitempty" gorm:"foreignKey:ShopID"`
	Bills     []Bill     `json:"bills,omitempty" gorm:"foreignKey:ShopID"`
	Customers []Customer `json:"customers,omitempty" gorm:"foreignKey:ShopID"`
}

type ShopUser struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ShopID      uuid.UUID      `json:"shop_id" gorm:"not null"`
	UserID      uuid.UUID      `json:"user_id" gorm:"not null"`
	Role        string         `json:"role" gorm:"not null"` // owner, manager, cashier
	Permissions string         `json:"permissions" gorm:"type:jsonb"`
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Shop Shop `json:"shop,omitempty" gorm:"foreignKey:ShopID"`
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// ShopRequest represents the request payload for creating/updating a shop
type ShopRequest struct {
	Name      string `json:"name" binding:"required"`
	Address   string `json:"address"`
	Phone     string `json:"phone"`
	Email     string `json:"email"`
	GSTNumber string `json:"gst_number"`
	LogoURL   string `json:"logo_url"`
	Settings  string `json:"settings"`
	IsActive  bool   `json:"is_active"`
}

// ShopResponse represents the response payload for shop data
type ShopResponse struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Address   string    `json:"address"`
	Phone     string    `json:"phone"`
	Email     string    `json:"email"`
	GSTNumber string    `json:"gst_number"`
	LogoURL   string    `json:"logo_url"`
	Settings  string    `json:"settings"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
