package services

type Services struct {
	Auth     *AuthService
	Bill     *BillService
	Item     *ItemService
	Customer *CustomerService
	Shop     *ShopService
	PDF      *PDFService
}

type PDFService struct{}

func NewPDFService() *PDFService {
	return &PDFService{}
}
