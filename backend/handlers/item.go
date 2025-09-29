package handlers

import (
	"billboard/backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ItemHandler struct {
	itemService *services.ItemService
}

func NewItemHandler(itemService *services.ItemService) *ItemHandler {
	return &ItemHandler{itemService: itemService}
}

func (h *ItemHandler) GetItems(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Get items not implemented yet"})
}

func (h *ItemHandler) CreateItem(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Create item not implemented yet"})
}

func (h *ItemHandler) GetItem(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Get item not implemented yet"})
}

func (h *ItemHandler) UpdateItem(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Update item not implemented yet"})
}

func (h *ItemHandler) DeleteItem(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Delete item not implemented yet"})
}
