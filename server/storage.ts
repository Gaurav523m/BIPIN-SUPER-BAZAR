import {
  type User, type InsertUser,
  type Address, type InsertAddress,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Offer, type InsertOffer,
  type Inventory, type InsertInventory,
  type StockTransaction, type InsertStockTransaction,
  type PricingTier, type InsertPricingTier,
  type CustomerPricing, type InsertCustomerPricing,
  type UserPricingTier, type InsertUserPricingTier
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // Addresses
  getAddresses(userId: number): Promise<Address[]>;
  getAddress(id: number): Promise<Address | undefined>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, address: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: number): Promise<boolean>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  searchProducts(query: string): Promise<Product[]>;
  
  // Cart
  getCartItems(userId: number): Promise<(CartItem & { product: Product })[]>;
  getCartItem(id: number): Promise<CartItem | undefined>;
  getCartItemByProductId(userId: number, productId: number): Promise<CartItem | undefined>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Orders
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Offers
  getOffers(): Promise<Offer[]>;
  getOffer(id: number): Promise<Offer | undefined>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  
  // Inventory Management
  getInventory(productId: number): Promise<Inventory | undefined>;
  getInventoryItems(): Promise<(Inventory & { product: Product })[]>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;
  updateInventory(id: number, inventory: Partial<InsertInventory>): Promise<Inventory | undefined>;
  updateStockQuantity(productId: number, quantity: number): Promise<Inventory | undefined>;
  
  // Stock Transactions
  getStockTransactions(productId?: number): Promise<(StockTransaction & { product: Product })[]>;
  createStockTransaction(transaction: InsertStockTransaction): Promise<StockTransaction>;
  
  // Customer Pricing Tiers
  getPricingTiers(): Promise<PricingTier[]>;
  getPricingTier(id: number): Promise<PricingTier | undefined>;
  createPricingTier(tier: InsertPricingTier): Promise<PricingTier>;
  updatePricingTier(id: number, tier: Partial<InsertPricingTier>): Promise<PricingTier | undefined>;
  
  // Customer Product Pricing
  getCustomerPricings(productId?: number, tierId?: number): Promise<(CustomerPricing & { product: Product, pricingTier: PricingTier })[]>;
  getCustomerPricing(id: number): Promise<(CustomerPricing & { product: Product, pricingTier: PricingTier }) | undefined>;
  createCustomerPricing(pricing: InsertCustomerPricing): Promise<CustomerPricing>;
  updateCustomerPricing(id: number, pricing: Partial<InsertCustomerPricing>): Promise<CustomerPricing | undefined>;
  
  // User Pricing Tier Associations
  getUserPricingTiers(userId: number): Promise<(UserPricingTier & { pricingTier: PricingTier })[]>;
  createUserPricingTier(userTier: InsertUserPricingTier): Promise<UserPricingTier>;
  updateUserPricingTier(id: number, userTier: Partial<InsertUserPricingTier>): Promise<UserPricingTier | undefined>;
  getCustomerProductPrice(userId: number, productId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private addresses: Map<number, Address> = new Map();
  private categories: Map<number, Category> = new Map();
  private products: Map<number, Product> = new Map();
  private cartItems: Map<number, CartItem> = new Map();
  private orders: Map<number, Order> = new Map();
  private orderItems: Map<number, OrderItem> = new Map();
  private offers: Map<number, Offer> = new Map();
  private inventory: Map<number, Inventory> = new Map();
  private stockTransactions: Map<number, StockTransaction> = new Map();
  private pricingTiers: Map<number, PricingTier> = new Map();
  private customerPricing: Map<number, CustomerPricing> = new Map();
  private userPricingTiers: Map<number, UserPricingTier> = new Map();
  
  private userIdCounter = 1;
  private addressIdCounter = 1;
  private categoryIdCounter = 1;
  private productIdCounter = 1;
  private cartItemIdCounter = 1;
  private orderIdCounter = 1;
  private orderItemIdCounter = 1;
  private offerIdCounter = 1;
  private inventoryIdCounter = 1;
  private stockTransactionIdCounter = 1;
  private pricingTierIdCounter = 1;
  private customerPricingIdCounter = 1;
  private userPricingTierIdCounter = 1;

  constructor() {
    // Initialize with some demo data
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Add categories
    const categories = [
      { name: "Fruits & Vegetables", icon: "bx-lemon", description: "Fresh fruits and vegetables" },
      { name: "Dairy & Breakfast", icon: "bx-coffee", description: "Milk, cheese, eggs, bread" },
      { name: "Snacks", icon: "bx-cookie", description: "Chips, biscuits, chocolates" },
      { name: "Beverages", icon: "bx-drink", description: "Juices, soft drinks, water" },
      { name: "Bakery", icon: "bx-baguette", description: "Bread, cakes, pastries" },
      { name: "Household", icon: "bx-basket", description: "Cleaning, laundry, kitchen items" },
      { name: "Personal Care", icon: "bx-shower", description: "Bath, skin care, hair care" }
    ];

    categories.forEach(cat => {
      const category: InsertCategory = {
        name: cat.name,
        icon: cat.icon,
        description: cat.description
      };
      this.createCategory(category);
    });

    // Add products
    const fruitsCategory = Array.from(this.categories.values()).find(c => c.name === "Fruits & Vegetables");
    if (fruitsCategory) {
      const fruitProducts = [
        {
          name: "Organic Banana",
          description: "Our organic bananas are sourced from certified organic farms. They are rich in potassium and fiber, making them a healthy snack option.",
          image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba",
          price: 2.99,
          discountPrice: 3.49,
          quantity: "6 pcs (approx. 1 kg)",
          categoryId: fruitsCategory.id,
          isOrganic: true,
          inStock: true,
          nutritionInfo: {
            energy: "89 kcal",
            carbohydrates: "23g",
            protein: "1.1g",
            fat: "0.3g"
          },
          sku: "FRTS-BAN-ORG-01",
          barcode: "8901234567890",
          costPrice: 1.75
        },
        {
          name: "Fresh Strawberries",
          description: "Sweet and juicy strawberries freshly picked from local farms. Perfect for desserts or as a healthy snack.",
          image: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e",
          price: 4.49,
          discountPrice: null,
          quantity: "250g pack",
          categoryId: fruitsCategory.id,
          isOrganic: false,
          inStock: true,
          nutritionInfo: {
            energy: "32 kcal",
            carbohydrates: "7.7g",
            protein: "0.7g",
            fat: "0.3g"
          },
          sku: "FRTS-STR-250-01",
          barcode: "8901234567891",
          costPrice: 2.85
        },
        {
          name: "Organic Avocado",
          description: "Creamy, organic avocados rich in healthy fats. Perfect for salads, sandwiches, or making guacamole.",
          image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b",
          price: 3.99,
          discountPrice: 4.99,
          quantity: "2 pcs (approx. 450g)",
          categoryId: fruitsCategory.id,
          isOrganic: true,
          inStock: true,
          nutritionInfo: {
            energy: "160 kcal",
            carbohydrates: "8.5g",
            protein: "2g",
            fat: "14.7g"
          },
          sku: "FRTS-AVO-ORG-01",
          barcode: "8901234567892",
          costPrice: 2.50
        },
        {
          name: "Red Bell Peppers",
          description: "Vibrant red bell peppers with a sweet taste and crunchy texture. Great for salads, stir-fries, or stuffing.",
          image: "https://images.unsplash.com/photo-1590005354167-6da97870c757",
          price: 3.29,
          discountPrice: null,
          quantity: "3 pcs (approx. 500g)",
          categoryId: fruitsCategory.id,
          isOrganic: false,
          inStock: true,
          nutritionInfo: {
            energy: "31 kcal",
            carbohydrates: "6g",
            protein: "1g",
            fat: "0.3g"
          },
          sku: "FRTS-PEP-RED-01",
          barcode: "8901234567893",
          costPrice: 1.95
        },
        {
          name: "Organic Broccoli",
          description: "Fresh, organic broccoli florets packed with nutrients. A versatile vegetable for many dishes.",
          image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716",
          price: 2.79,
          discountPrice: null,
          quantity: "1 pc (approx. 450g)",
          categoryId: fruitsCategory.id,
          isOrganic: true,
          inStock: true,
          nutritionInfo: {
            energy: "34 kcal",
            carbohydrates: "7g",
            protein: "2.8g",
            fat: "0.4g"
          },
          sku: "FRTS-BRC-ORG-01",
          barcode: "8901234567894",
          costPrice: 1.65
        }
      ];

      const createdProducts = [];
      for (const prod of fruitProducts) {
        const product = await this.createProduct(prod as InsertProduct);
        createdProducts.push(product);
      }

      // Add inventory for the products
      for (const product of createdProducts) {
        await this.createInventory({
          productId: product.id,
          stockQuantity: Math.floor(Math.random() * 50) + 10, // Random stock between 10-60
          minStockLevel: 5,
          maxStockLevel: 100,
          locationCode: `ZONE-A-${Math.floor(Math.random() * 20) + 1}`,
        });
      }
    }

    // Add offers
    const offers = [
      {
        title: "Fresh Vegetables",
        description: "Get 30% off on select items",
        discountPercentage: 30,
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e",
        categoryId: fruitsCategory?.id,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true
      },
      {
        title: "Dairy Products",
        description: "Buy one get one free",
        discountPercentage: null,
        image: "https://images.unsplash.com/photo-1621685945458-74975aae2da7",
        categoryId: Array.from(this.categories.values()).find(c => c.name === "Dairy & Breakfast")?.id,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true
      }
    ];

    for (const offer of offers) {
      if (offer.categoryId) {
        await this.createOffer(offer as InsertOffer);
      }
    }

    // Add pricing tiers
    const pricingTierData = [
      {
        name: "Retail",
        description: "Standard retail pricing",
        discountPercentage: null,
        isActive: true
      },
      {
        name: "Wholesale",
        description: "Pricing for wholesale customers",
        discountPercentage: 15,
        isActive: true
      },
      {
        name: "Premium",
        description: "Premium customer pricing",
        discountPercentage: 5,
        isActive: true
      },
      {
        name: "Employee",
        description: "Staff discount pricing",
        discountPercentage: 20,
        isActive: true
      }
    ];

    const createdTiers = [];
    for (const tier of pricingTierData) {
      const pricingTier = await this.createPricingTier(tier);
      createdTiers.push(pricingTier);
    }

    // Add some specific product pricings for the wholesale tier
    const products = Array.from(this.products.values());
    const wholesaleTier = createdTiers.find(tier => tier.name === "Wholesale");
    
    if (wholesaleTier && products.length > 0) {
      for (let i = 0; i < 3 && i < products.length; i++) {
        const product = products[i];
        // Apply a steeper 25% discount for specific wholesale pricing
        const specificPrice = product.price * 0.75;
        
        await this.createCustomerPricing({
          productId: product.id,
          pricingTierId: wholesaleTier.id,
          price: specificPrice,
          isActive: true
        });
      }
    }

    // Add admin user
    const admin = await this.createUser({
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      name: "Admin User",
      email: "admin@groceryapp.com",
      role: "admin",
      phone: null
    });

    // Add a demo wholesale customer
    const wholesaleCustomer = await this.createUser({
      username: "wholesale",
      password: "password", // In a real app, this would be hashed
      name: "Wholesale Customer",
      email: "wholesale@example.com",
      role: "customer",
      phone: "555-1234"
    });

    // Assign wholesale customer to the wholesale pricing tier
    if (wholesaleTier && wholesaleCustomer) {
      await this.createUserPricingTier({
        userId: wholesaleCustomer.id,
        pricingTierId: wholesaleTier.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        isActive: true
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.phone === phone,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Address methods
  async getAddresses(userId: number): Promise<Address[]> {
    return Array.from(this.addresses.values()).filter(
      (address) => address.userId === userId,
    );
  }

  async getAddress(id: number): Promise<Address | undefined> {
    return this.addresses.get(id);
  }

  async createAddress(insertAddress: InsertAddress): Promise<Address> {
    const id = this.addressIdCounter++;
    const address: Address = { ...insertAddress, id };
    this.addresses.set(id, address);
    return address;
  }

  async updateAddress(id: number, addressUpdate: Partial<InsertAddress>): Promise<Address | undefined> {
    const address = this.addresses.get(id);
    if (!address) return undefined;
    
    const updatedAddress: Address = { ...address, ...addressUpdate };
    this.addresses.set(id, updatedAddress);
    return updatedAddress;
  }

  async deleteAddress(id: number): Promise<boolean> {
    return this.addresses.delete(id);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId,
    );
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) => product.name.toLowerCase().includes(lowerQuery) || 
                  product.description.toLowerCase().includes(lowerQuery)
    );
  }

  // Cart methods
  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    const items = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );
    
    return items.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product with id ${item.productId} not found`);
      return { ...item, product };
    });
  }

  async getCartItem(id: number): Promise<CartItem | undefined> {
    return this.cartItems.get(id);
  }

  async getCartItemByProductId(userId: number, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.userId === userId && item.productId === productId,
    );
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = await this.getCartItemByProductId(insertCartItem.userId, insertCartItem.productId);
    
    if (existingItem) {
      // Update quantity
      const updatedItem = await this.updateCartItemQuantity(existingItem.id, existingItem.quantity + insertCartItem.quantity);
      if (!updatedItem) throw new Error("Failed to update cart item");
      return updatedItem;
    }

    // Add new item
    const id = this.cartItemIdCounter++;
    const cartItem: CartItem = { ...insertCartItem, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      this.cartItems.delete(id);
      return undefined;
    }
    
    const updatedItem: CartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const cartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );
    
    for (const item of cartItems) {
      this.cartItems.delete(item.id);
    }
    
    return true;
  }

  // Order methods
  async createOrder(insertOrder: InsertOrder, insertOrderItems: InsertOrderItem[]): Promise<Order> {
    const id = this.orderIdCounter++;
    const createdAt = new Date();
    const order: Order = { ...insertOrder, id, createdAt };
    this.orders.set(id, order);
    
    // Create order items
    for (const item of insertOrderItems) {
      const orderItemId = this.orderItemIdCounter++;
      const orderItem: OrderItem = { ...item, id: orderItemId, orderId: id };
      this.orderItems.set(orderItemId, orderItem);
    }
    
    // Clear user's cart
    await this.clearCart(insertOrder.userId);
    
    return order;
  }

  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by most recent
  }

  async getOrder(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const orderItems = Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === id,
    );
    
    const itemsWithProducts = orderItems.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product with id ${item.productId} not found`);
      return { ...item, product };
    });
    
    return { ...order, items: itemsWithProducts };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder: Order = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Offer methods
  async getOffers(): Promise<Offer[]> {
    return Array.from(this.offers.values()).filter(
      (offer) => offer.isActive && offer.validTo >= new Date(),
    );
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    return this.offers.get(id);
  }

  async createOffer(insertOffer: InsertOffer): Promise<Offer> {
    const id = this.offerIdCounter++;
    const offer: Offer = { ...insertOffer, id };
    this.offers.set(id, offer);
    return offer;
  }

  // Inventory Management methods
  async getInventory(productId: number): Promise<Inventory | undefined> {
    return Array.from(this.inventory.values()).find(
      (inv) => inv.productId === productId
    );
  }

  async getInventoryItems(): Promise<(Inventory & { product: Product })[]> {
    const items = Array.from(this.inventory.values());
    return items.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product with id ${item.productId} not found`);
      return { ...item, product };
    });
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    // Check if inventory for this product already exists
    const existingInventory = await this.getInventory(insertInventory.productId);
    if (existingInventory) {
      throw new Error(`Inventory for product ID ${insertInventory.productId} already exists`);
    }

    const id = this.inventoryIdCounter++;
    const lastStockUpdate = new Date();
    const inventory: Inventory = {
      ...insertInventory,
      id,
      lastStockUpdate,
      lastReceivedDate: insertInventory.lastReceivedDate || null,
      lastReceivedQuantity: insertInventory.lastReceivedQuantity || null,
      maxStockLevel: insertInventory.maxStockLevel || null,
      locationCode: insertInventory.locationCode || null,
      minStockLevel: insertInventory.minStockLevel || 5,
      stockQuantity: insertInventory.stockQuantity || 0
    };

    this.inventory.set(id, inventory);

    // Create a stock transaction record if initial stock is greater than 0
    if (inventory.stockQuantity > 0) {
      await this.createStockTransaction({
        productId: inventory.productId,
        transactionType: "received",
        quantity: inventory.stockQuantity,
        notes: "Initial inventory setup",
        reference: null,
        userId: null
      });
    }

    return inventory;
  }

  async updateInventory(id: number, inventoryUpdate: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const inventory = this.inventory.get(id);
    if (!inventory) return undefined;

    const updatedInventory: Inventory = {
      ...inventory,
      ...inventoryUpdate,
      lastStockUpdate: new Date()
    };

    this.inventory.set(id, updatedInventory);
    return updatedInventory;
  }

  async updateStockQuantity(productId: number, quantity: number): Promise<Inventory | undefined> {
    // Find inventory by productId
    const inventoryItem = await this.getInventory(productId);
    if (!inventoryItem) return undefined;

    // Calculate new stock level
    const newQuantity = inventoryItem.stockQuantity + quantity;
    
    // Update inventory
    const updatedInventory = await this.updateInventory(inventoryItem.id, {
      stockQuantity: newQuantity >= 0 ? newQuantity : 0
    });

    // Update product inStock status
    const product = await this.getProduct(productId);
    if (product && product.inStock !== (newQuantity > 0)) {
      const updatedProduct = { ...product, inStock: newQuantity > 0 };
      this.products.set(productId, updatedProduct);
    }

    // Create transaction record
    const transactionType = quantity > 0 ? "received" : "adjusted";
    await this.createStockTransaction({
      productId,
      transactionType,
      quantity: Math.abs(quantity),
      notes: quantity > 0 ? "Stock received" : "Stock adjusted",
      reference: null,
      userId: null
    });

    return updatedInventory;
  }

  // Stock Transaction methods
  async getStockTransactions(productId?: number): Promise<(StockTransaction & { product: Product })[]> {
    let transactions = Array.from(this.stockTransactions.values());
    
    if (productId) {
      transactions = transactions.filter(tx => tx.productId === productId);
    }

    return transactions.map(tx => {
      const product = this.products.get(tx.productId);
      if (!product) throw new Error(`Product with id ${tx.productId} not found`);
      return { ...tx, product };
    }).sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime());
  }

  async createStockTransaction(insertTransaction: InsertStockTransaction): Promise<StockTransaction> {
    const id = this.stockTransactionIdCounter++;
    const transactionDate = new Date();
    const transaction: StockTransaction = {
      ...insertTransaction,
      id,
      transactionDate,
      reference: insertTransaction.reference || null,
      notes: insertTransaction.notes || null,
      userId: insertTransaction.userId || null
    };

    this.stockTransactions.set(id, transaction);
    return transaction;
  }

  // Pricing Tier methods
  async getPricingTiers(): Promise<PricingTier[]> {
    return Array.from(this.pricingTiers.values());
  }

  async getPricingTier(id: number): Promise<PricingTier | undefined> {
    return this.pricingTiers.get(id);
  }

  async createPricingTier(insertTier: InsertPricingTier): Promise<PricingTier> {
    const id = this.pricingTierIdCounter++;
    const tier: PricingTier = {
      ...insertTier,
      id,
      discountPercentage: insertTier.discountPercentage || null,
      description: insertTier.description || null,
      isActive: insertTier.isActive !== false
    };

    this.pricingTiers.set(id, tier);
    return tier;
  }

  async updatePricingTier(id: number, tierUpdate: Partial<InsertPricingTier>): Promise<PricingTier | undefined> {
    const tier = this.pricingTiers.get(id);
    if (!tier) return undefined;

    const updatedTier: PricingTier = { ...tier, ...tierUpdate };
    this.pricingTiers.set(id, updatedTier);
    return updatedTier;
  }

  // Customer Product Pricing methods
  async getCustomerPricings(productId?: number, tierId?: number): Promise<(CustomerPricing & { product: Product, pricingTier: PricingTier })[]> {
    let pricings = Array.from(this.customerPricing.values());
    
    if (productId) {
      pricings = pricings.filter(p => p.productId === productId);
    }

    if (tierId) {
      pricings = pricings.filter(p => p.pricingTierId === tierId);
    }

    return pricings.map(pricing => {
      const product = this.products.get(pricing.productId);
      const pricingTier = this.pricingTiers.get(pricing.pricingTierId);
      
      if (!product) throw new Error(`Product with id ${pricing.productId} not found`);
      if (!pricingTier) throw new Error(`Pricing tier with id ${pricing.pricingTierId} not found`);
      
      return { ...pricing, product, pricingTier };
    });
  }

  async getCustomerPricing(id: number): Promise<(CustomerPricing & { product: Product, pricingTier: PricingTier }) | undefined> {
    const pricing = this.customerPricing.get(id);
    if (!pricing) return undefined;

    const product = this.products.get(pricing.productId);
    const pricingTier = this.pricingTiers.get(pricing.pricingTierId);
    
    if (!product) throw new Error(`Product with id ${pricing.productId} not found`);
    if (!pricingTier) throw new Error(`Pricing tier with id ${pricing.pricingTierId} not found`);
    
    return { ...pricing, product, pricingTier };
  }

  async createCustomerPricing(insertPricing: InsertCustomerPricing): Promise<CustomerPricing> {
    // Check if a pricing for this product and tier already exists
    const existingPricing = Array.from(this.customerPricing.values()).find(
      p => p.productId === insertPricing.productId && p.pricingTierId === insertPricing.pricingTierId
    );

    if (existingPricing) {
      throw new Error(`Pricing for product ID ${insertPricing.productId} and tier ID ${insertPricing.pricingTierId} already exists`);
    }

    const id = this.customerPricingIdCounter++;
    const pricing: CustomerPricing = {
      ...insertPricing,
      id,
      isActive: insertPricing.isActive !== false
    };

    this.customerPricing.set(id, pricing);
    return pricing;
  }

  async updateCustomerPricing(id: number, pricingUpdate: Partial<InsertCustomerPricing>): Promise<CustomerPricing | undefined> {
    const pricing = this.customerPricing.get(id);
    if (!pricing) return undefined;

    const updatedPricing: CustomerPricing = { ...pricing, ...pricingUpdate };
    this.customerPricing.set(id, updatedPricing);
    return updatedPricing;
  }

  // User Pricing Tier methods
  async getUserPricingTiers(userId: number): Promise<(UserPricingTier & { pricingTier: PricingTier })[]> {
    const userTiers = Array.from(this.userPricingTiers.values()).filter(
      ut => ut.userId === userId && ut.isActive && (!ut.endDate || ut.endDate >= new Date())
    );

    return userTiers.map(userTier => {
      const pricingTier = this.pricingTiers.get(userTier.pricingTierId);
      if (!pricingTier) throw new Error(`Pricing tier with id ${userTier.pricingTierId} not found`);
      return { ...userTier, pricingTier };
    });
  }

  async createUserPricingTier(insertUserTier: InsertUserPricingTier): Promise<UserPricingTier> {
    const id = this.userPricingTierIdCounter++;
    const userTier: UserPricingTier = {
      ...insertUserTier,
      id,
      startDate: insertUserTier.startDate || new Date(),
      endDate: insertUserTier.endDate || null,
      isActive: insertUserTier.isActive !== false
    };

    this.userPricingTiers.set(id, userTier);
    return userTier;
  }

  async updateUserPricingTier(id: number, userTierUpdate: Partial<InsertUserPricingTier>): Promise<UserPricingTier | undefined> {
    const userTier = this.userPricingTiers.get(id);
    if (!userTier) return undefined;

    const updatedUserTier: UserPricingTier = { ...userTier, ...userTierUpdate };
    this.userPricingTiers.set(id, updatedUserTier);
    return updatedUserTier;
  }

  async getCustomerProductPrice(userId: number, productId: number): Promise<number> {
    // Get the product's regular price
    const product = await this.getProduct(productId);
    if (!product) throw new Error(`Product with id ${productId} not found`);
    
    const regularPrice = product.discountPrice || product.price;
    
    // Check if user has any active pricing tiers
    const userTiers = await this.getUserPricingTiers(userId);
    if (userTiers.length === 0) return regularPrice;
    
    // Find specific product pricing for the user's tiers
    let bestPrice = regularPrice;
    
    for (const userTier of userTiers) {
      // Check for specific product pricing in this tier
      const productPricings = await this.getCustomerPricings(productId, userTier.pricingTierId);
      
      if (productPricings.length > 0) {
        // Use the specific product pricing
        const pricing = productPricings[0];
        if (pricing.isActive && pricing.price < bestPrice) {
          bestPrice = pricing.price;
        }
      } else if (userTier.pricingTier.discountPercentage) {
        // Apply tier discount percentage
        const discountedPrice = regularPrice * (1 - userTier.pricingTier.discountPercentage / 100);
        if (discountedPrice < bestPrice) {
          bestPrice = discountedPrice;
        }
      }
    }
    
    return bestPrice;
  }
}

export const storage = new MemStorage();
