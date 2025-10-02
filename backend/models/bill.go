package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Bill represents a bill/invoice in the system
type Bill struct {
	ID            uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ShopID        uuid.UUID      `json:"shop_id" gorm:"not null"`
	CustomerID    *uuid.UUID     `json:"customer_id" gorm:"type:uuid"`
	BillNumber    string         `json:"bill_number" gorm:"not null;unique"`
	BillDate      time.Time      `json:"bill_date" gorm:"not null"`
	DueDate       *time.Time     `json:"due_date"`
	SubTotal      float64        `json:"sub_total" gorm:"column:subtotal;not null;default:0"`
	TaxAmount     float64        `json:"tax_amount" gorm:"not null;default:0"`
	Discount      float64        `json:"discount" gorm:"column:discount_amount;not null;default:0"`
	TotalAmount   float64        `json:"total_amount" gorm:"not null;default:0"`
	PaidAmount    float64        `json:"paid_amount" gorm:"not null;default:0"`
	PendingAmount float64        `json:"pending_amount" gorm:"not null;default:0"`
	Balance       float64        `json:"balance" gorm:"not null;default:0"`
	Status        string         `json:"status" gorm:"not null;default:'draft'"` // draft, sent, paid, overdue, cancelled
	Notes         string         `json:"notes"`
	Terms         string         `json:"terms" gorm:"column:payment_terms"`
	CreatedBy     string         `json:"created_by" gorm:"not null"`
	PdfURL        string         `json:"pdf_url" gorm:"column:pdf_url"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"deleted_at" gorm:"index"`

	// Relationships
	Shop     Shop       `json:"shop,omitempty" gorm:"foreignKey:ShopID"`
	Customer *Customer  `json:"customer,omitempty" gorm:"foreignKey:CustomerID"`
	Items    []BillItem `json:"items,omitempty" gorm:"foreignKey:BillID"`
	Payments []Payment  `json:"payments,omitempty" gorm:"foreignKey:BillID"`
}

// BillItem represents an item in a bill
type BillItem struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	BillID      uuid.UUID `json:"bill_id" gorm:"not null"`
	ItemID      uuid.UUID `json:"item_id" gorm:"not null"`
	ItemName    string    `json:"item_name" gorm:"not null"`
	Description string    `json:"description"`
	Quantity    int       `json:"quantity" gorm:"not null"`
	UnitPrice   float64   `json:"unit_price" gorm:"not null"`
	TotalPrice  float64   `json:"total_price" gorm:"not null"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relationships
	Bill Bill `json:"bill,omitempty" gorm:"foreignKey:BillID"`
	Item Item `json:"item,omitempty" gorm:"foreignKey:ItemID"`
}

// Payment represents a payment for a bill
type Payment struct {
	ID            uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	BillID        uuid.UUID `json:"bill_id" gorm:"not null"`
	Amount        float64   `json:"amount" gorm:"not null"`
	PaymentDate   time.Time `json:"payment_date" gorm:"not null"`
	PaymentMethod string    `json:"payment_method" gorm:"not null"` // cash, card, bank_transfer, check, other
	Reference     string    `json:"reference"`
	Notes         string    `json:"notes"`
	CreatedBy     string    `json:"created_by" gorm:"not null"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	// Relationships
	Bill Bill `json:"bill,omitempty" gorm:"foreignKey:BillID"`
}

// BillRequest represents the request payload for creating/updating a bill
type BillRequest struct {
	CustomerID *uuid.UUID        `json:"customer_id"`
	BillDate   string            `json:"bill_date" binding:"required"`
	DueDate    *string           `json:"due_date"`
	Items      []BillItemRequest `json:"items" binding:"required"`
	Discount   float64           `json:"discount"`
	TaxRate    float64           `json:"tax_rate"`
	Notes      string            `json:"notes"`
	Terms      string            `json:"terms"`
}

// BillItemRequest represents an item in a bill request
type BillItemRequest struct {
	ItemID      uuid.UUID `json:"item_id" binding:"required"`
	Quantity    int       `json:"quantity" binding:"required,min=1"`
	UnitPrice   float64   `json:"unit_price" binding:"required,min=0"`
	Description string    `json:"description"`
}

// PaymentRequest represents a payment request
type PaymentRequest struct {
	Amount        float64 `json:"amount" binding:"required,min=0"`
	PaymentDate   string  `json:"payment_date" binding:"required"`
	PaymentMethod string  `json:"payment_method" binding:"required"`
	Reference     string  `json:"reference"`
	Notes         string  `json:"notes"`
}

// BillResponse represents the response payload for bill data
type BillResponse struct {
	ID          uuid.UUID          `json:"id"`
	ShopID      uuid.UUID          `json:"shop_id"`
	CustomerID  *uuid.UUID         `json:"customer_id"`
	BillNumber  string             `json:"bill_number"`
	BillDate    time.Time          `json:"bill_date"`
	DueDate     *time.Time         `json:"due_date"`
	SubTotal    float64            `json:"sub_total"`
	TaxAmount   float64            `json:"tax_amount"`
	Discount    float64            `json:"discount"`
	TotalAmount float64            `json:"total_amount"`
	PaidAmount  float64            `json:"paid_amount"`
	Balance     float64            `json:"balance"`
	Status      string             `json:"status"`
	Notes       string             `json:"notes"`
	Terms       string             `json:"terms"`
	Customer    *CustomerResponse  `json:"customer,omitempty"`
	Items       []BillItemResponse `json:"items"`
	Payments    []PaymentResponse  `json:"payments"`
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
}

// BillItemResponse represents the response payload for bill item data
type BillItemResponse struct {
	ID          uuid.UUID `json:"id"`
	BillID      uuid.UUID `json:"bill_id"`
	ItemID      uuid.UUID `json:"item_id"`
	ItemName    string    `json:"item_name"`
	Description string    `json:"description"`
	Quantity    int       `json:"quantity"`
	UnitPrice   float64   `json:"unit_price"`
	TotalPrice  float64   `json:"total_price"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// PaymentResponse represents the response payload for payment data
type PaymentResponse struct {
	ID            uuid.UUID `json:"id"`
	BillID        uuid.UUID `json:"bill_id"`
	Amount        float64   `json:"amount"`
	PaymentDate   time.Time `json:"payment_date"`
	PaymentMethod string    `json:"payment_method"`
	Reference     string    `json:"reference"`
	Notes         string    `json:"notes"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// BillStats represents bill statistics
type BillStats struct {
	TotalBills        int     `json:"total_bills"`
	TotalAmount       float64 `json:"total_amount"`
	PaidAmount        float64 `json:"paid_amount"`
	OutstandingAmount float64 `json:"outstanding_amount"`
	OverdueAmount     float64 `json:"overdue_amount"`
	ThisMonthBills    int     `json:"this_month_bills"`
	ThisMonthAmount   float64 `json:"this_month_amount"`
}
