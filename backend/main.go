package main

import (
	"log"
	"os"

	"billboard/backend/config"
	"billboard/backend/database"
	"billboard/backend/routes"
	"billboard/backend/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// @title Billboard API
// @version 1.0
// @description A comprehensive billing application API
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api/v1
func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Printf("Warning: Failed to connect to database: %v", err)
		log.Println("Starting server without database connection...")
	}

	// Initialize Redis
	redisClient := database.InitializeRedis(cfg.RedisURL)

	// Initialize services
	authService := services.NewAuthService(db, redisClient)
	billService := services.NewBillService(db)
	itemService := services.NewItemService(db)
	customerService := services.NewCustomerService(db)
	shopService := services.NewShopService(db)
	pdfService := services.NewPDFService()

	// Initialize Gin router
	router := gin.Default()

	// CORS configuration
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3005", "http://localhost:3001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Add health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "message": "Billboard API is running"})
	})

	// Initialize routes
	routes.SetupRoutes(router, &services.Services{
		Auth:     authService,
		Bill:     billService,
		Item:     itemService,
		Customer: customerService,
		Shop:     shopService,
		PDF:      pdfService,
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
