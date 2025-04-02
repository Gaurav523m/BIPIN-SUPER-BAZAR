import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertAddressSchema, 
  insertCartItemSchema, 
  insertOrderSchema, 
  insertOrderItemSchema, 
  insertCategorySchema, 
  insertProductSchema, 
  insertOfferSchema,
  insertInventorySchema,
  insertStockTransactionSchema,
  insertPricingTierSchema,
  insertCustomerPricingSchema,
  insertUserPricingTierSchema
} from "@shared/schema";
import { users, orders, orderItems } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = app.route("/api");
  
  // Categories
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  app.get("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      console.log("Category request received for ID:", req.params.id);
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        console.log("Invalid category ID:", req.params.id);
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategory(id);
      console.log("Category found:", category);
      
      if (!category) {
        console.log("Category not found for ID:", id);
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });
  
  // Products
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      console.log("Products request received with query params:", req.query);
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const search = req.query.search as string | undefined;
      
      let products;
      if (categoryId && !isNaN(categoryId)) {
        console.log("Fetching products for category ID:", categoryId);
        products = await storage.getProductsByCategory(categoryId);
      } else if (search) {
        console.log("Searching products with query:", search);
        products = await storage.searchProducts(search);
      } else {
        console.log("Fetching all products");
        products = await storage.getProducts();
      }
      
      console.log(`Products found: ${products.length}`);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  
  // Users
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userInput = insertUserSchema.parse(req.body);
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(userInput.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userInput);
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Auth
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't return password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });
  
  // Addresses
  app.get("/api/addresses", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const addresses = await storage.getAddresses(userId);
      res.json(addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });
  
  app.post("/api/addresses", async (req: Request, res: Response) => {
    try {
      const addressInput = insertAddressSchema.parse(req.body);
      const address = await storage.createAddress(addressInput);
      res.status(201).json(address);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid address data", errors: error.errors });
      }
      console.error("Error creating address:", error);
      res.status(500).json({ message: "Failed to create address" });
    }
  });
  
  // Cart
  app.get("/api/cart", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });
  
  app.post("/api/cart", async (req: Request, res: Response) => {
    try {
      const cartItemInput = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addToCart(cartItemInput);
      const cartWithProduct = await storage.getCartItems(cartItemInput.userId);
      const addedItemWithProduct = cartWithProduct.find(item => item.id === cartItem.id);
      res.status(201).json(addedItemWithProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });
  
  app.patch("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (isNaN(id) || typeof quantity !== 'number') {
        return res.status(400).json({ message: "Invalid cart item ID or quantity" });
      }
      
      const updatedItem = await storage.updateCartItemQuantity(id, quantity);
      if (!updatedItem && quantity > 0) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({ success: true, item: updatedItem });
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  
  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }
      
      const success = await storage.removeFromCart(id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });
  
  app.delete("/api/cart", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      await storage.clearCart(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });
  
  // Orders
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const { order, items } = req.body;
      
      const orderInput = insertOrderSchema.parse(order);
      
      // First create the order
      const newOrder = await db.insert(orders).values(orderInput).returning();
      const orderId = newOrder[0].id;
      
      // Add the orderId to each order item
      const orderItemsWithId = items.map((item: any) => ({
        ...item,
        orderId: orderId
      }));
      
      // Now validate the order items with the orderId
      const orderItemsInput = z.array(insertOrderItemSchema).parse(orderItemsWithId);
      
      // Insert the order items
      for (const item of orderItemsInput) {
        await db.insert(orderItems).values(item);
      }
      
      // Get the full order with items
      const orderWithItems = await storage.getOrder(orderId);
      
      res.status(201).json(orderWithItems);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  
  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  
  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  
  // Offers
  app.get("/api/offers", async (req: Request, res: Response) => {
    try {
      const offers = await storage.getOffers();
      res.json(offers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  // Admin routes
  // Middleware to check if the user is an admin
  const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // In a real app, we would get user from session or token
      const userId = req.headers['user-id'];
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized: Login required" });
      }
      
      const user = await storage.getUser(parseInt(userId.toString()));
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      next();
    } catch (error) {
      console.error("Admin authorization error:", error);
      return res.status(500).json({ message: "Error authorizing admin request" });
    }
  };
  
  // Get dashboard stats
  app.get("/api/admin/stats", isAdmin, async (req: Request, res: Response) => {
    try {
      // In a real app, you would calculate these stats from actual data
      // For now, just return some placeholder stats
      const stats = {
        totalOrders: 10,
        totalRevenue: 500,
        totalProducts: (await storage.getProducts()).length,
        totalCustomers: 5
      };
      
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Error getting admin stats:", error);
      return res.status(500).json({ message: "Error getting admin stats" });
    }
  });
  
  // Product management
  app.post("/api/admin/products", isAdmin, async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(productData);
      return res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      console.error("Error creating product:", error);
      return res.status(500).json({ message: "Error creating product" });
    }
  });
  
  // Category management
  app.post("/api/admin/categories", isAdmin, async (req: Request, res: Response) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(categoryData);
      return res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      console.error("Error creating category:", error);
      return res.status(500).json({ message: "Error creating category" });
    }
  });
  
  // Order management
  app.get("/api/admin/orders", isAdmin, async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would get ALL orders, not just for one user
      // For now, just return orders for the first user as an example
      const allUsers = await db.select().from(users);
      const allOrders = [];
      
      for (const user of allUsers) {
        const userOrders = await storage.getOrders(user.id);
        allOrders.push(...userOrders);
      }
      
      return res.status(200).json(allOrders);
    } catch (error) {
      console.error("Error getting admin orders:", error);
      return res.status(500).json({ message: "Error getting admin orders" });
    }
  });
  
  app.patch("/api/admin/orders/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      return res.status(200).json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      return res.status(500).json({ message: "Error updating order status" });
    }
  });
  
  // Offer management
  app.post("/api/admin/offers", isAdmin, async (req: Request, res: Response) => {
    try {
      const offerData = insertOfferSchema.parse(req.body);
      const newOffer = await storage.createOffer(offerData);
      return res.status(201).json(newOffer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid offer data", errors: error.errors });
      }
      console.error("Error creating offer:", error);
      return res.status(500).json({ message: "Error creating offer" });
    }
  });

  // Inventory Management
  app.get("/api/admin/inventory", isAdmin, async (req: Request, res: Response) => {
    try {
      const inventory = await storage.getInventoryItems();
      return res.status(200).json(inventory);
    } catch (error) {
      console.error("Error getting inventory:", error);
      return res.status(500).json({ message: "Error getting inventory" });
    }
  });

  app.get("/api/admin/inventory/product/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const inventoryItem = await storage.getInventory(productId);
      if (!inventoryItem) {
        return res.status(404).json({ message: "Inventory not found for this product" });
      }
      
      return res.status(200).json(inventoryItem);
    } catch (error) {
      console.error("Error getting product inventory:", error);
      return res.status(500).json({ message: "Error getting product inventory" });
    }
  });

  app.post("/api/admin/inventory", isAdmin, async (req: Request, res: Response) => {
    try {
      const inventoryData = insertInventorySchema.parse(req.body);
      const newInventory = await storage.createInventory(inventoryData);
      return res.status(201).json(newInventory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inventory data", errors: error.errors });
      }
      console.error("Error creating inventory:", error);
      return res.status(500).json({ message: "Error creating inventory", error: error.message });
    }
  });

  app.patch("/api/admin/inventory/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inventory ID" });
      }
      
      const updateData = req.body;
      const updatedInventory = await storage.updateInventory(id, updateData);
      
      if (!updatedInventory) {
        return res.status(404).json({ message: "Inventory not found" });
      }
      
      return res.status(200).json(updatedInventory);
    } catch (error) {
      console.error("Error updating inventory:", error);
      return res.status(500).json({ message: "Error updating inventory" });
    }
  });

  app.patch("/api/admin/inventory/stock/:productId", isAdmin, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.productId);
      const { quantity } = req.body;
      
      if (isNaN(productId) || typeof quantity !== 'number') {
        return res.status(400).json({ message: "Invalid product ID or quantity" });
      }
      
      const updatedInventory = await storage.updateStockQuantity(productId, quantity);
      
      if (!updatedInventory) {
        return res.status(404).json({ message: "Inventory not found for this product" });
      }
      
      return res.status(200).json(updatedInventory);
    } catch (error) {
      console.error("Error updating stock quantity:", error);
      return res.status(500).json({ message: "Error updating stock quantity" });
    }
  });

  // Stock Transactions
  app.get("/api/admin/transactions", isAdmin, async (req: Request, res: Response) => {
    try {
      const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
      const transactions = await storage.getStockTransactions(productId);
      return res.status(200).json(transactions);
    } catch (error) {
      console.error("Error getting stock transactions:", error);
      return res.status(500).json({ message: "Error getting stock transactions" });
    }
  });

  app.post("/api/admin/transactions", isAdmin, async (req: Request, res: Response) => {
    try {
      const transactionData = insertStockTransactionSchema.parse(req.body);
      const newTransaction = await storage.createStockTransaction(transactionData);
      
      // Update inventory if it's a stock adjustment transaction
      if (['received', 'adjusted', 'sold'].includes(transactionData.transactionType)) {
        const quantityChange = transactionData.transactionType === 'sold' 
          ? -Math.abs(transactionData.quantity) 
          : (transactionData.transactionType === 'received' 
              ? Math.abs(transactionData.quantity) 
              : transactionData.quantity);
        
        await storage.updateStockQuantity(transactionData.productId, quantityChange);
      }
      
      return res.status(201).json(newTransaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      console.error("Error creating stock transaction:", error);
      return res.status(500).json({ message: "Error creating stock transaction" });
    }
  });

  // Pricing Tiers
  app.get("/api/admin/pricing-tiers", isAdmin, async (req: Request, res: Response) => {
    try {
      const pricingTiers = await storage.getPricingTiers();
      return res.status(200).json(pricingTiers);
    } catch (error) {
      console.error("Error getting pricing tiers:", error);
      return res.status(500).json({ message: "Error getting pricing tiers" });
    }
  });

  app.get("/api/admin/pricing-tiers/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid pricing tier ID" });
      }
      
      const pricingTier = await storage.getPricingTier(id);
      if (!pricingTier) {
        return res.status(404).json({ message: "Pricing tier not found" });
      }
      
      return res.status(200).json(pricingTier);
    } catch (error) {
      console.error("Error getting pricing tier:", error);
      return res.status(500).json({ message: "Error getting pricing tier" });
    }
  });

  app.post("/api/admin/pricing-tiers", isAdmin, async (req: Request, res: Response) => {
    try {
      const tierData = insertPricingTierSchema.parse(req.body);
      const newTier = await storage.createPricingTier(tierData);
      return res.status(201).json(newTier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid pricing tier data", errors: error.errors });
      }
      console.error("Error creating pricing tier:", error);
      return res.status(500).json({ message: "Error creating pricing tier" });
    }
  });

  app.patch("/api/admin/pricing-tiers/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid pricing tier ID" });
      }
      
      const tierData = req.body;
      const updatedTier = await storage.updatePricingTier(id, tierData);
      
      if (!updatedTier) {
        return res.status(404).json({ message: "Pricing tier not found" });
      }
      
      return res.status(200).json(updatedTier);
    } catch (error) {
      console.error("Error updating pricing tier:", error);
      return res.status(500).json({ message: "Error updating pricing tier" });
    }
  });

  // Customer Product Pricing
  app.get("/api/admin/customer-pricing", isAdmin, async (req: Request, res: Response) => {
    try {
      const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
      const tierId = req.query.tierId ? parseInt(req.query.tierId as string) : undefined;
      
      const customerPricings = await storage.getCustomerPricings(productId, tierId);
      return res.status(200).json(customerPricings);
    } catch (error) {
      console.error("Error getting customer pricings:", error);
      return res.status(500).json({ message: "Error getting customer pricings" });
    }
  });

  app.post("/api/admin/customer-pricing", isAdmin, async (req: Request, res: Response) => {
    try {
      const pricingData = insertCustomerPricingSchema.parse(req.body);
      const newPricing = await storage.createCustomerPricing(pricingData);
      return res.status(201).json(newPricing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer pricing data", errors: error.errors });
      }
      console.error("Error creating customer pricing:", error);
      return res.status(500).json({ message: "Error creating customer pricing", error: error.message });
    }
  });

  app.patch("/api/admin/customer-pricing/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid customer pricing ID" });
      }
      
      const pricingData = req.body;
      const updatedPricing = await storage.updateCustomerPricing(id, pricingData);
      
      if (!updatedPricing) {
        return res.status(404).json({ message: "Customer pricing not found" });
      }
      
      return res.status(200).json(updatedPricing);
    } catch (error) {
      console.error("Error updating customer pricing:", error);
      return res.status(500).json({ message: "Error updating customer pricing" });
    }
  });

  // User Pricing Tier Associations
  app.get("/api/user-pricing-tiers/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const userPricingTiers = await storage.getUserPricingTiers(userId);
      return res.status(200).json(userPricingTiers);
    } catch (error) {
      console.error("Error getting user pricing tiers:", error);
      return res.status(500).json({ message: "Error getting user pricing tiers" });
    }
  });

  app.post("/api/admin/user-pricing-tiers", isAdmin, async (req: Request, res: Response) => {
    try {
      const userTierData = insertUserPricingTierSchema.parse(req.body);
      const newUserTier = await storage.createUserPricingTier(userTierData);
      return res.status(201).json(newUserTier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user pricing tier data", errors: error.errors });
      }
      console.error("Error creating user pricing tier:", error);
      return res.status(500).json({ message: "Error creating user pricing tier" });
    }
  });

  app.patch("/api/admin/user-pricing-tiers/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user pricing tier ID" });
      }
      
      const userTierData = req.body;
      const updatedUserTier = await storage.updateUserPricingTier(id, userTierData);
      
      if (!updatedUserTier) {
        return res.status(404).json({ message: "User pricing tier not found" });
      }
      
      return res.status(200).json(updatedUserTier);
    } catch (error) {
      console.error("Error updating user pricing tier:", error);
      return res.status(500).json({ message: "Error updating user pricing tier" });
    }
  });

  // Get customer-specific product price
  app.get("/api/product-price/:productId/user/:userId", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.productId);
      const userId = parseInt(req.params.userId);
      
      if (isNaN(productId) || isNaN(userId)) {
        return res.status(400).json({ message: "Invalid product ID or user ID" });
      }
      
      const price = await storage.getCustomerProductPrice(userId, productId);
      return res.status(200).json({ price });
    } catch (error) {
      console.error("Error getting customer product price:", error);
      return res.status(500).json({ message: "Error getting customer product price" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
