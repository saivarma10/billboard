package handlers

import (
	"billboard/backend/models"
	"billboard/backend/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CustomerHandler struct {
	customerService *services.CustomerService
}

func NewCustomerHandler(customerService *services.CustomerService) *CustomerHandler {
	return &CustomerHandler{
		customerService: customerService,
	}
}

// GetCustomers retrieves all customers for a shop
func (h *CustomerHandler) GetCustomers(c *gin.Context) {
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
	if isActiveStr := c.Query("is_active"); isActiveStr != "" {
		if isActive, err := strconv.ParseBool(isActiveStr); err == nil {
			filters["is_active"] = isActive
		}
	}
	if city := c.Query("city"); city != "" {
		filters["city"] = city
	}

	customers, err := h.customerService.GetCustomers(shopID, userID.(uuid.UUID), filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": customers})
}

// GetCustomer retrieves a specific customer
func (h *CustomerHandler) GetCustomer(c *gin.Context) {
	shopIDStr := c.Param("shopId")
	shopID, err := uuid.Parse(shopIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shop ID"})
		return
	}

	customerIDStr := c.Param("customerId")
	customerID, err := uuid.Parse(customerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	customer, err := h.customerService.GetCustomer(customerID, shopID, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": customer})
}

// CreateCustomer creates a new customer
func (h *CustomerHandler) CreateCustomer(c *gin.Context) {
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

	var req models.CustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	customer, err := h.customerService.CreateCustomer(shopID, userID.(uuid.UUID), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": customer})
}

// UpdateCustomer updates an existing customer
func (h *CustomerHandler) UpdateCustomer(c *gin.Context) {
	shopIDStr := c.Param("shopId")
	shopID, err := uuid.Parse(shopIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shop ID"})
		return
	}

	customerIDStr := c.Param("customerId")
	customerID, err := uuid.Parse(customerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req models.CustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	customer, err := h.customerService.UpdateCustomer(customerID, shopID, userID.(uuid.UUID), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": customer})
}

// DeleteCustomer deletes a customer
func (h *CustomerHandler) DeleteCustomer(c *gin.Context) {
	shopIDStr := c.Param("shopId")
	shopID, err := uuid.Parse(shopIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shop ID"})
		return
	}

	customerIDStr := c.Param("customerId")
	customerID, err := uuid.Parse(customerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	err = h.customerService.DeleteCustomer(customerID, shopID, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Customer deleted successfully"})
}

// GetCustomerStats retrieves customer statistics
func (h *CustomerHandler) GetCustomerStats(c *gin.Context) {
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

	stats, err := h.customerService.GetCustomerStats(shopID, userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}
