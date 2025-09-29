package handlers

import (
	"billboard/backend/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ShopHandler struct {
	shopService *services.ShopService
}

func NewShopHandler(shopService *services.ShopService) *ShopHandler {
	return &ShopHandler{shopService: shopService}
}

func (h *ShopHandler) GetShops(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Get shops not implemented yet"})
}

func (h *ShopHandler) CreateShop(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Create shop not implemented yet"})
}

func (h *ShopHandler) GetShop(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Get shop not implemented yet"})
}

func (h *ShopHandler) UpdateShop(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Update shop not implemented yet"})
}

func (h *ShopHandler) DeleteShop(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Delete shop not implemented yet"})
}

func (h *ShopHandler) InviteUser(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Invite user not implemented yet"})
}

func (h *ShopHandler) GetDashboard(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Get dashboard not implemented yet"})
}

func (h *ShopHandler) GetSalesAnalytics(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Get sales analytics not implemented yet"})
}

func (h *ShopHandler) GetPendingAmounts(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Get pending amounts not implemented yet"})
}
