package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Customer represents a customer in the system
type Customer struct {
	ID         uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ShopID     uuid.UUID      `json:"shop_id" gorm:"type:uuid;not null"`
	Name       string         `json:"name" gorm:"not null"`
	Email      string         `json:"email"`
	Phone      string         `json:"phone"`
	Address    string         `json:"address"`
	City       string         `json:"city"`
	State      string         `json:"state"`
	Country    string         `json:"country"`
	PostalCode string         `json:"postal_code"`
	TaxNumber  string         `json:"tax_number"`
	Notes      string         `json:"notes"`
	IsActive   bool           `json:"is_active" gorm:"default:true"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

// CustomerRequest represents the request payload for creating/updating a customer
type CustomerRequest struct {
	Name       string `json:"name" binding:"required"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	Address    string `json:"address"`
	City       string `json:"city"`
	State      string `json:"state"`
	Country    string `json:"country"`
	PostalCode string `json:"postal_code"`
	TaxNumber  string `json:"tax_number"`
	Notes      string `json:"notes"`
	IsActive   bool   `json:"is_active"`
}

// CustomerResponse represents the response payload for customer data
type CustomerResponse struct {
	ID         uuid.UUID `json:"id"`
	ShopID     uuid.UUID `json:"shop_id"`
	Name       string    `json:"name"`
	Email      string    `json:"email"`
	Phone      string    `json:"phone"`
	Address    string    `json:"address"`
	City       string    `json:"city"`
	State      string    `json:"state"`
	Country    string    `json:"country"`
	PostalCode string    `json:"postal_code"`
	TaxNumber  string    `json:"tax_number"`
	Notes      string    `json:"notes"`
	IsActive   bool      `json:"is_active"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
