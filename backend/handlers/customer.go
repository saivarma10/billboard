package handlers

import (
	"billboard/backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CustomerHandler struct {
	customerService *services.CustomerService
}

func NewCustomerHandler(customerService *services.CustomerService) *CustomerHandler {
	return &CustomerHandler{customerService: customerService}
}

func (h *CustomerHandler) GetCustomers(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Get customers not implemented yet"})
}

func (h *CustomerHandler) CreateCustomer(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Create customer not implemented yet"})
}

func (h *CustomerHandler) GetCustomer(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Get customer not implemented yet"})
}

func (h *CustomerHandler) UpdateCustomer(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Update customer not implemented yet"})
}

func (h *CustomerHandler) DeleteCustomer(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Delete customer not implemented yet"})
}
