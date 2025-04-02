import { pgTable, text, serial, bigserial, integer, boolean, timestamp, json, doublePrecision, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role").default("customer").notNull(), // 'customer' or 'admin'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
  role: true,
});

// Address schema
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // home, office, etc.
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  isDefault: boolean("is_default").default(false),
});

export const insertAddressSchema = createInsertSchema(addresses).pick({
  userId: true,
  type: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  isDefault: true,
});

// Category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon"),
  description: text("description"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  icon: true,
  description: true,
});

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  price: doublePrecision("price").notNull(),
  discountPrice: doublePrecision("discount_price"),
  quantity: text("quantity").notNull(), // e.g., "500g", "1kg", "6pcs" - display quantity (packaging)
  categoryId: integer("category_id").notNull().references(() => categories.id),
  isOrganic: boolean("is_organic").default(false),
  inStock: boolean("in_stock").default(true),
  nutritionInfo: json("nutrition_info"),
  sku: text("sku"), // Stock Keeping Unit - unique product identifier
  barcode: text("barcode"), // UPC/EAN barcode
  costPrice: doublePrecision("cost_price"), // Cost price for inventory valuation
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  image: true,
  price: true,
  discountPrice: true,
  quantity: true,
  categoryId: true,
  isOrganic: true,
  inStock: true,
  nutritionInfo: true,
  sku: true,
  barcode: true,
  costPrice: true,
});

// Cart schema
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  productId: true,
  quantity: true,
});

// Order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  addressId: integer("address_id").notNull().references(() => addresses.id),
  totalAmount: doublePrecision("total_amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, delivered, cancelled
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  estimatedDeliveryTime: integer("estimated_delivery_time").notNull(), // in minutes
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  addressId: true,
  totalAmount: true,
  status: true,
  paymentMethod: true,
  estimatedDeliveryTime: true,
});

// Order items schema
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true,
});

// Offers schema
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  discountPercentage: integer("discount_percentage"),
  image: text("image"),
  categoryId: integer("category_id").references(() => categories.id),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to").notNull(),
  isActive: boolean("is_active").default(true),
});

export const insertOfferSchema = createInsertSchema(offers).pick({
  title: true,
  description: true,
  discountPercentage: true,
  image: true,
  categoryId: true,
  validFrom: true,
  validTo: true,
  isActive: true,
});

// Inventory schema
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  minStockLevel: integer("min_stock_level").default(5), // Threshold for reordering
  maxStockLevel: integer("max_stock_level"), // Maximum stock capacity
  locationCode: text("location_code"), // Storage location identifier
  lastStockUpdate: timestamp("last_stock_update").defaultNow(),
  lastReceivedDate: timestamp("last_received_date"),
  lastReceivedQuantity: integer("last_received_quantity"),
});

export const insertInventorySchema = createInsertSchema(inventory).pick({
  productId: true,
  stockQuantity: true,
  minStockLevel: true,
  maxStockLevel: true,
  locationCode: true,
  lastReceivedDate: true,
  lastReceivedQuantity: true,
});

// Stock Transaction History schema
export const stockTransactions = pgTable("stock_transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  transactionType: text("transaction_type").notNull(), // "received", "sold", "adjusted", "damaged", "returned"
  quantity: integer("quantity").notNull(),
  transactionDate: timestamp("transaction_date").defaultNow(),
  reference: text("reference"), // Could be order ID, adjustment ID, etc.
  notes: text("notes"),
  userId: integer("user_id").references(() => users.id), // Who performed the transaction
});

export const insertStockTransactionSchema = createInsertSchema(stockTransactions).pick({
  productId: true,
  transactionType: true,
  quantity: true,
  reference: true,
  notes: true,
  userId: true
});

// Customer Pricing Tiers schema
export const pricingTiers = pgTable("pricing_tiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // "Retail", "Wholesale", "Premium", etc.
  discountPercentage: doublePrecision("discount_percentage"), // Overall tier discount
  description: text("description"),
  isActive: boolean("is_active").default(true),
});

export const insertPricingTierSchema = createInsertSchema(pricingTiers).pick({
  name: true,
  discountPercentage: true,
  description: true,
  isActive: true,
});

// Customer Pricing schema (for specific product pricing)
export const customerPricing = pgTable("customer_pricing", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  pricingTierId: integer("pricing_tier_id").notNull().references(() => pricingTiers.id),
  price: doublePrecision("price").notNull(), // Specific price for this product in this tier
  isActive: boolean("is_active").default(true),
});

export const insertCustomerPricingSchema = createInsertSchema(customerPricing).pick({
  productId: true,
  pricingTierId: true,
  price: true,
  isActive: true,
});

// User Pricing Tier Association
export const userPricingTiers = pgTable("user_pricing_tiers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  pricingTierId: integer("pricing_tier_id").notNull().references(() => pricingTiers.id),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"), // null for no expiration
  isActive: boolean("is_active").default(true),
});

export const insertUserPricingTierSchema = createInsertSchema(userPricingTiers).pick({
  userId: true,
  pricingTierId: true,
  startDate: true,
  endDate: true,
  isActive: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  cartItems: many(cartItems),
  stockTransactions: many(stockTransactions),
  userPricingTiers: many(userPricingTiers),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
  offers: many(offers),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  inventory: many(inventory),
  stockTransactions: many(stockTransactions),
  customerPricing: many(customerPricing),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  address: one(addresses, {
    fields: [orders.addressId],
    references: [addresses.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const offersRelations = relations(offers, ({ one }) => ({
  category: one(categories, {
    fields: [offers.categoryId],
    references: [categories.id],
  }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
}));

export const stockTransactionsRelations = relations(stockTransactions, ({ one }) => ({
  product: one(products, {
    fields: [stockTransactions.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [stockTransactions.userId],
    references: [users.id],
  }),
}));

export const pricingTiersRelations = relations(pricingTiers, ({ many }) => ({
  customerPricing: many(customerPricing),
  userPricingTiers: many(userPricingTiers),
}));

export const customerPricingRelations = relations(customerPricing, ({ one }) => ({
  product: one(products, {
    fields: [customerPricing.productId],
    references: [products.id],
  }),
  pricingTier: one(pricingTiers, {
    fields: [customerPricing.pricingTierId],
    references: [pricingTiers.id],
  }),
}));

export const userPricingTiersRelations = relations(userPricingTiers, ({ one }) => ({
  user: one(users, {
    fields: [userPricingTiers.userId],
    references: [users.id],
  }),
  pricingTier: one(pricingTiers, {
    fields: [userPricingTiers.pricingTierId],
    references: [pricingTiers.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type StockTransaction = typeof stockTransactions.$inferSelect;
export type InsertStockTransaction = z.infer<typeof insertStockTransactionSchema>;

export type PricingTier = typeof pricingTiers.$inferSelect;
export type InsertPricingTier = z.infer<typeof insertPricingTierSchema>;

export type CustomerPricing = typeof customerPricing.$inferSelect;
export type InsertCustomerPricing = z.infer<typeof insertCustomerPricingSchema>;

export type UserPricingTier = typeof userPricingTiers.$inferSelect;
export type InsertUserPricingTier = z.infer<typeof insertUserPricingTierSchema>;