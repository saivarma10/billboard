package handlers

import (
	"billboard/backend/models"
	"billboard/backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type BillHandler struct {
	billService *services.BillService
}

func NewBillHandler(billService *services.BillService) *BillHandler {
	return &BillHandler{
		billService: billService,
	}
}

// GetBills retrieves all bills for a shop
func (h *BillHandler) GetBills(c *gin.Context) {
	shopIDStr := c.Param("shopId")
	shopID, err := uuid.Parse(shopIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shop ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Parse query parameters for filtering
	filters := make(map[string]interface{})
	if search := c.Query("search"); search != "" {
		filters["search"] = search
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	if customerID := c.Query("customer_id"); customerID != "" {
		filters["customer_id"] = customerID
	}
	if startDate := c.Query("start_date"); startDate != "" {
		filters["start_date"] = startDate
	}
	if endDate := c.Query("end_date"); endDate != "" {
		filters["end_date"] = endDate
	}

	bills, err := h.billService.GetBills(shopID, userID.(uuid.UUID), filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": bills})
}

// GetBill retrieves a specific bill
func (h *BillHandler) GetBill(c *gin.Context) {
	shopIDStr := c.Param("shopId")
	shopID, err := uuid.Parse(shopIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shop ID"})
		return
	}

	billIDStr := c.Param("billId")
	billID, err := uuid.Parse(billIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid bill ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	bill, err := h.billService.GetBill(billID, shopID, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": bill})
}

// CreateBill creates a new bill
func (h *BillHandler) CreateBill(c *gin.Context) {
	shopIDStr := c.Param("shopId")
	shopID, err := uuid.Parse(shopIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shop ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.BillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	bill, err := h.billService.CreateBill(shopID, userID.(uuid.UUID), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": bill})
}

// UpdateBill updates an existing bill
func (h *BillHandler) UpdateBill(c *gin.Context) {
	shopIDStr := c.Param("shopId")
	shopID, err := uuid.Parse(shopIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shop ID"})
		return
	}

	billIDStr := c.Param("billId")
	billID, err := uuid.Parse(billIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid bill ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.BillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	bill, err := h.billService.UpdateBill(billID, shopID, userID.(uuid.UUID), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": bill})
}

// DeleteBill deletes a bill
func (h *BillHandler) DeleteBill(c *gin.Context) {
	shopIDStr := c.Param("shopId")
	shopID, err := uuid.Parse(shopIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shop ID"})
		return
	}

	billIDStr := c.Param("billId")
	billID, err := uuid.Parse(billIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid bill ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	err = h.billService.DeleteBill(billID, shopID, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bill deleted successfully"})
}

// AddPayment adds a payment to a bill
func (h *BillHandler) AddPayment(c *gin.Context) {
	shopIDStr := c.Param("shopId")
	shopID, err := uuid.Parse(shopIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shop ID"})
		return
	}

	billIDStr := c.Param("billId")
	billID, err := uuid.Parse(billIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid bill ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	payment, err := h.billService.AddPayment(billID, shopID, userID.(uuid.UUID), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": payment})
}

// GetBillStats retrieves bill statistics
func (h *BillHandler) GetBillStats(c *gin.Context) {
	shopIDStr := c.Param("shopId")
	shopID, err := uuid.Parse(shopIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shop ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	stats, err := h.billService.GetBillStats(shopID, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GeneratePDF generates a PDF for a bill
func (h *BillHandler) GeneratePDF(c *gin.Context) {
	shopIDStr := c.Param("shopId")
	shopID, err := uuid.Parse(shopIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shop ID"})
		return
	}

	billIDStr := c.Param("billId")
	billID, err := uuid.Parse(billIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid bill ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get the bill
	bill, err := h.billService.GetBill(billID, shopID, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement PDF generation
	// For now, return a placeholder response
	c.JSON(http.StatusOK, gin.H{
		"message": "PDF generation not implemented yet",
		"bill":    bill,
	})
}
