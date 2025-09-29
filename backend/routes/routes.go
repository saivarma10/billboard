package routes

import (
	"billboard/backend/handlers"
	"billboard/backend/middleware"
	"billboard/backend/services"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, services *services.Services) {
	// Initialize handlers
	authHandler := handlers.NewAuthHandler(services.Auth)
	shopHandler := handlers.NewShopHandler(services.Shop)
	billHandler := handlers.NewBillHandler(services.Bill)
	itemHandler := handlers.NewItemHandler(services.Item)
	customerHandler := handlers.NewCustomerHandler(services.Customer)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Auth routes
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.RefreshToken)
			auth.POST("/logout", middleware.AuthMiddleware(services.Auth), authHandler.Logout)
		}

		// Protected routes
		protected := v1.Group("/")
		protected.Use(middleware.AuthMiddleware(services.Auth))
		{
			// Shop routes
			shops := protected.Group("/shops")
			{
				shops.GET("", shopHandler.GetShops)
				shops.POST("", shopHandler.CreateShop)
				shops.GET("/:shopId", middleware.ShopAccessMiddleware(), shopHandler.GetShop)
				shops.PUT("/:shopId", middleware.ShopAccessMiddleware(), shopHandler.UpdateShop)
				shops.DELETE("/:shopId", middleware.ShopAccessMiddleware(), shopHandler.DeleteShop)
				shops.POST("/:shopId/invite", middleware.ShopAccessMiddleware(), shopHandler.InviteUser)
			}

			// Shop-specific routes
			shopRoutes := protected.Group("/shops/:shopId")
			shopRoutes.Use(middleware.ShopAccessMiddleware())
			{
				// Items
				items := shopRoutes.Group("/items")
				{
					items.GET("", itemHandler.GetItems)
					items.POST("", itemHandler.CreateItem)
					items.GET("/:id", itemHandler.GetItem)
					items.PUT("/:id", itemHandler.UpdateItem)
					items.DELETE("/:id", itemHandler.DeleteItem)
				}

				// Customers
				customers := shopRoutes.Group("/customers")
				{
					customers.GET("", customerHandler.GetCustomers)
					customers.POST("", customerHandler.CreateCustomer)
					customers.GET("/:id", customerHandler.GetCustomer)
					customers.PUT("/:id", customerHandler.UpdateCustomer)
					customers.DELETE("/:id", customerHandler.DeleteCustomer)
				}

				// Bills
				bills := shopRoutes.Group("/bills")
				{
					bills.GET("", billHandler.GetBills)
					bills.POST("", billHandler.CreateBill)
					bills.GET("/:id", billHandler.GetBill)
					bills.PUT("/:id", billHandler.UpdateBill)
					bills.DELETE("/:id", billHandler.DeleteBill)
					bills.POST("/:id/pdf", billHandler.GeneratePDF)
					bills.POST("/:id/payments", billHandler.AddPayment)
				}

				// Analytics
				analytics := shopRoutes.Group("/analytics")
				{
					analytics.GET("/dashboard", shopHandler.GetDashboard)
					analytics.GET("/sales", shopHandler.GetSalesAnalytics)
					analytics.GET("/pending-amounts", shopHandler.GetPendingAmounts)
				}
			}
		}
	}
}
