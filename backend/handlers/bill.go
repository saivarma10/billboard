package handlers

import (
	"billboard/backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type BillHandler struct {
	billService *services.BillService
}

func NewBillHandler(billService *services.BillService) *BillHandler {
	return &BillHandler{billService: billService}
}

func (h *BillHandler) GetBills(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Get bills not implemented yet"})
}

func (h *BillHandler) CreateBill(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Create bill not implemented yet"})
}

func (h *BillHandler) GetBill(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Get bill not implemented yet"})
}

func (h *BillHandler) UpdateBill(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Update bill not implemented yet"})
}

func (h *BillHandler) DeleteBill(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Delete bill not implemented yet"})
}

func (h *BillHandler) GeneratePDF(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Generate PDF not implemented yet"})
}

func (h *BillHandler) AddPayment(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Add payment not implemented yet"})
}
