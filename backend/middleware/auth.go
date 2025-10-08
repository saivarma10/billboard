package middleware

import (
	"billboard/backend/models"
	"billboard/backend/services"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func AuthMiddleware(authService *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Bearer token required"})
			c.Abort()
			return
		}

		claims, err := authService.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Next()
	}
}

func ShopAccessMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		shopIDStr := c.Param("shopId")
		if shopIDStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Shop ID required"})
			c.Abort()
			return
		}

		// Parse shop ID
		shopID, err := uuid.Parse(shopIDStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shop ID"})
			c.Abort()
			return
		}

		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		// Check if user has access to this shop
		var shopUser models.ShopUser
		if err := db.Where("shop_id = ? AND user_id = ? AND is_active = ?", shopID, userID, true).First(&shopUser).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusForbidden, gin.H{"error": "Access denied to this shop"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			}
			c.Abort()
			return
		}

		// Set shop_id and user role for use in handlers
		c.Set("shop_id", shopID)
		c.Set("user_role", shopUser.Role)
		c.Next()
	}
}
