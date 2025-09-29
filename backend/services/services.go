package services

import (
	"gorm.io/gorm"
)

type Services struct {
	Auth     *AuthService
	Bill     *BillService
	Item     *ItemService
	Customer *CustomerService
	Shop     *ShopService
	PDF      *PDFService
}

type BillService struct {
	db *gorm.DB
}

type ItemService struct {
	db *gorm.DB
}

type CustomerService struct {
	db *gorm.DB
}

type ShopService struct {
	db *gorm.DB
}

type PDFService struct{}

func NewBillService(db *gorm.DB) *BillService {
	return &BillService{db: db}
}

func NewItemService(db *gorm.DB) *ItemService {
	return &ItemService{db: db}
}

func NewCustomerService(db *gorm.DB) *CustomerService {
	return &CustomerService{db: db}
}

func NewShopService(db *gorm.DB) *ShopService {
	return &ShopService{db: db}
}

func NewPDFService() *PDFService {
	return &PDFService{}
}
