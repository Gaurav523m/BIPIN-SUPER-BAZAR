CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "phone" TEXT,
  "role" TEXT NOT NULL DEFAULT 'customer',
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "addresses" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "type" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "zip_code" TEXT NOT NULL,
  "is_default" BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "categories" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "icon" TEXT,
  "description" TEXT
);

CREATE TABLE IF NOT EXISTS "products" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "image" TEXT,
  "price" DOUBLE PRECISION NOT NULL,
  "discount_price" DOUBLE PRECISION,
  "quantity" TEXT NOT NULL,
  "category_id" INTEGER NOT NULL REFERENCES "categories"("id"),
  "is_organic" BOOLEAN DEFAULT FALSE,
  "in_stock" BOOLEAN DEFAULT TRUE,
  "nutrition_info" JSONB,
  "sku" TEXT,
  "barcode" TEXT,
  "cost_price" DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS "cart_items" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "product_id" INTEGER NOT NULL REFERENCES "products"("id"),
  "quantity" INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "orders" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "address_id" INTEGER NOT NULL REFERENCES "addresses"("id"),
  "total_amount" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "payment_method" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "estimated_delivery_time" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "order_items" (
  "id" SERIAL PRIMARY KEY,
  "order_id" INTEGER NOT NULL REFERENCES "orders"("id"),
  "product_id" INTEGER NOT NULL REFERENCES "products"("id"),
  "quantity" INTEGER NOT NULL,
  "price" DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS "offers" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "discount_percentage" INTEGER,
  "image" TEXT,
  "category_id" INTEGER REFERENCES "categories"("id"),
  "valid_from" TIMESTAMP NOT NULL,
  "valid_to" TIMESTAMP NOT NULL,
  "is_active" BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "inventory" (
  "id" SERIAL PRIMARY KEY,
  "product_id" INTEGER NOT NULL REFERENCES "products"("id"),
  "stock_quantity" INTEGER NOT NULL DEFAULT 0,
  "min_stock_level" INTEGER DEFAULT 5,
  "max_stock_level" INTEGER,
  "location_code" TEXT,
  "last_stock_update" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "last_received_date" TIMESTAMP,
  "last_received_quantity" INTEGER
);

CREATE TABLE IF NOT EXISTS "stock_transactions" (
  "id" SERIAL PRIMARY KEY,
  "product_id" INTEGER NOT NULL REFERENCES "products"("id"),
  "transaction_type" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "transaction_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "reference" TEXT,
  "notes" TEXT,
  "user_id" INTEGER REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "pricing_tiers" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "discount_percentage" DOUBLE PRECISION,
  "description" TEXT,
  "is_active" BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "customer_pricing" (
  "id" SERIAL PRIMARY KEY,
  "product_id" INTEGER NOT NULL REFERENCES "products"("id"),
  "pricing_tier_id" INTEGER NOT NULL REFERENCES "pricing_tiers"("id"),
  "price" DOUBLE PRECISION NOT NULL,
  "is_active" BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS "user_pricing_tiers" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "pricing_tier_id" INTEGER NOT NULL REFERENCES "pricing_tiers"("id"),
  "start_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "end_date" TIMESTAMP,
  "is_active" BOOLEAN DEFAULT TRUE
);