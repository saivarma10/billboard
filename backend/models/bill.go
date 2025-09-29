package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Bill struct {
	ID             uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ShopID         uuid.UUID      `json:"shop_id" gorm:"not null"`
	CustomerID     *uuid.UUID     `json:"customer_id"`
	BillNumber     string         `json:"bill_number" gorm:"not null"`
	BillDate       time.Time      `json:"bill_date" gorm:"not null"`
	DueDate        *time.Time     `json:"due_date"`
	Subtotal       float64        `json:"subtotal" gorm:"not null"`
	TaxAmount      float64        `json:"tax_amount" gorm:"default:0"`
	DiscountAmount float64        `json:"discount_amount" gorm:"default:0"`
	TotalAmount    float64        `json:"total_amount" gorm:"not null"`
	PaidAmount     float64        `json:"paid_amount" gorm:"default:0"`
	PendingAmount  float64        `json:"pending_amount" gorm:"not null"`
	Status         string         `json:"status" gorm:"default:'pending'"` // pending, paid, overdue
	PaymentTerms   string         `json:"payment_terms"`
	Notes          string         `json:"notes"`
	PDFURL         string         `json:"pdf_url"`
	CreatedBy      uuid.UUID      `json:"created_by" gorm:"not null"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Shop     Shop       `json:"shop,omitempty" gorm:"foreignKey:ShopID"`
	Customer *Customer  `json:"customer,omitempty" gorm:"foreignKey:CustomerID"`
	Items    []BillItem `json:"items,omitempty" gorm:"foreignKey:BillID"`
	Payments []Payment  `json:"payments,omitempty" gorm:"foreignKey:BillID"`
}

type BillItem struct {
	ID         uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	BillID     uuid.UUID  `json:"bill_id" gorm:"not null"`
	ItemID     *uuid.UUID `json:"item_id"`
	ItemName   string     `json:"item_name" gorm:"not null"`
	Quantity   float64    `json:"quantity" gorm:"not null"`
	UnitPrice  float64    `json:"unit_price" gorm:"not null"`
	TotalPrice float64    `json:"total_price" gorm:"not null"`
	TaxRate    float64    `json:"tax_rate" gorm:"default:0"`
	CreatedAt  time.Time  `json:"created_at"`

	// Relationships
	Bill Bill  `json:"bill,omitempty" gorm:"foreignKey:BillID"`
	Item *Item `json:"item,omitempty" gorm:"foreignKey:ItemID"`
}

type Payment struct {
	ID              uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	BillID          uuid.UUID `json:"bill_id" gorm:"not null"`
	Amount          float64   `json:"amount" gorm:"not null"`
	PaymentMethod   string    `json:"payment_method" gorm:"not null"` // cash, card, upi, bank_transfer
	PaymentDate     time.Time `json:"payment_date" gorm:"not null"`
	ReferenceNumber string    `json:"reference_number"`
	Notes           string    `json:"notes"`
	CreatedBy       uuid.UUID `json:"created_by" gorm:"not null"`
	CreatedAt       time.Time `json:"created_at"`

	// Relationships
	Bill Bill `json:"bill,omitempty" gorm:"foreignKey:BillID"`
}
