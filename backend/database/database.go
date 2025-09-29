package database

import (
	"billboard/backend/models"

	"github.com/redis/go-redis/v9"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Initialize(databaseURL string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto-migrate the schema
	err = db.AutoMigrate(
		&models.User{},
		&models.Shop{},
		&models.ShopUser{},
		&models.Item{},
		&models.Customer{},
		&models.Bill{},
		&models.BillItem{},
		&models.Payment{},
		&models.AuditLog{},
	)
	if err != nil {
		return nil, err
	}

	return db, nil
}

func InitializeRedis(redisURL string) *redis.Client {
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		panic(err)
	}

	return redis.NewClient(opt)
}
