import { db } from './db';
import { eq, and, or, ilike, desc, isNull } from 'drizzle-orm';
import { 
  User, InsertUser, 
  Address, InsertAddress, 
  Category, InsertCategory, 
  Product, InsertProduct, 
  CartItem, InsertCartItem, 
  Order, InsertOrder, 
  OrderItem, InsertOrderItem, 
  Offer, InsertOffer,
  Inventory, InsertInventory,
  StockTransaction, InsertStockTransaction,
  PricingTier, InsertPricingTier,
  CustomerPricing, InsertCustomerPricing,
  UserPricingTier, InsertUserPricingTier,
  users, addresses, categories, products, cartItems, orders, orderItems, offers,
  inventory, stockTransactions, pricingTiers, customerPricing, userPricingTiers
} from '@shared/schema';
import { IStorage } from './storage';

export class PgStorage implements IStorage {

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Addresses
  async getAddresses(userId: number): Promise<Address[]> {
    return await db.select().from(addresses).where(eq(addresses.userId, userId));
  }

  async getAddress(id: number): Promise<Address | undefined> {
    const result = await db.select().from(addresses).where(eq(addresses.id, id));
    return result[0];
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    // If this is a default address, reset all other addresses for this user
    if (address.isDefault) {
      await db.update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, address.userId));
    }
    const result = await db.insert(addresses).values(address).returning();
    return result[0];
  }

  async updateAddress(id: number, addressUpdate: Partial<InsertAddress>): Promise<Address | undefined> {
    // If setting as default, reset all other addresses for this user
    if (addressUpdate.isDefault) {
      const addr = await this.getAddress(id);
      if (addr) {
        await db.update(addresses)
          .set({ isDefault: false })
          .where(eq(addresses.userId, addr.userId));
      }
    }
    const result = await db.update(addresses)
      .set(addressUpdate)
      .where(eq(addresses.id, id))
      .returning();
    return result[0];
  }

  async deleteAddress(id: number): Promise<boolean> {
    const result = await db.delete(addresses).where(eq(addresses.id, id)).returning();
    return result.length > 0;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id));
    return result[0];
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.name, name));
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db.select().from(products).where(
      or(
        ilike(products.name, `%${query}%`),
        ilike(products.description, `%${query}%`)
      )
    );
  }

  // Cart
  async getCartItems(userId: number): Promise<(CartItem & { product: Product })[]> {
    const result = await db.select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId))
      .leftJoin(products, eq(cartItems.productId, products.id));
    
    return result.map(item => {
      if (!item.products) {
        throw new Error("Product not found for cart item");
      }
      return {
        ...item.cart_items,
        product: item.products
      };
    });
  }

  async getCartItem(id: number): Promise<CartItem | undefined> {
    const result = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return result[0];
  }

  async getCartItemByProductId(userId: number, productId: number): Promise<CartItem | undefined> {
    const result = await db.select().from(cartItems).where(
      and(
        eq(cartItems.userId, userId),
        eq(cartItems.productId, productId)
      )
    );
    return result[0];
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if the product is already in the cart
    const existingItem = await this.getCartItemByProductId(cartItem.userId, cartItem.productId);
    
    if (existingItem) {
      // Update quantity if exists
      const result = await db.update(cartItems)
        .set({ quantity: existingItem.quantity + (cartItem.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return result[0];
    } else {
      // Add new item
      const result = await db.insert(cartItems)
        .values({ ...cartItem, quantity: cartItem.quantity || 1 })
        .returning();
      return result[0];
    }
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const result = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return result[0];
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id)).returning();
    return result.length > 0;
  }

  async clearCart(userId: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId)).returning();
    return result.length > 0;
  }

  // Orders
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Create order
    const newOrder = await db.insert(orders).values(order).returning();
    const orderId = newOrder[0].id;

    // Create order items
    for (const item of items) {
      await db.insert(orderItems).values({ ...item, orderId });
    }

    return newOrder[0];
  }

  async getOrders(userId: number): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const orderResult = await db.select().from(orders).where(eq(orders.id, id));
    
    if (orderResult.length === 0) {
      return undefined;
    }
    
    const order = orderResult[0];
    
    const orderItemsResult = await db.select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id))
      .leftJoin(products, eq(orderItems.productId, products.id));
    
    const items = orderItemsResult.map(item => {
      if (!item.products) {
        throw new Error("Product not found for order item");
      }
      return {
        ...item.order_items,
        product: item.products
      };
    });
    
    return { ...order, items };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  // Offers
  async getOffers(): Promise<Offer[]> {
    return await db.select().from(offers);
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    const result = await db.select().from(offers).where(eq(offers.id, id));
    return result[0];
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    const result = await db.insert(offers).values(offer).returning();
    return result[0];
  }

  // Inventory Management methods
  async getInventory(productId: number): Promise<Inventory | undefined> {
    const result = await db.select().from(inventory).where(eq(inventory.productId, productId));
    return result[0];
  }

  async getInventoryItems(): Promise<(Inventory & { product: Product })[]> {
    const result = await db.select()
      .from(inventory)
      .leftJoin(products, eq(inventory.productId, products.id));
    
    return result.map(item => {
      if (!item.products) {
        throw new Error(`Product with id ${item.inventory.productId} not found`);
      }
      return {
        ...item.inventory,
        product: item.products
      };
    });
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    // Check if inventory for this product already exists
    const existingInventory = await this.getInventory(insertInventory.productId);
    if (existingInventory) {
      throw new Error(`Inventory for product ID ${insertInventory.productId} already exists`);
    }

    const lastStockUpdate = new Date();
    const result = await db.insert(inventory).values({
      ...insertInventory,
      lastStockUpdate,
      minStockLevel: insertInventory.minStockLevel || 5,
      stockQuantity: insertInventory.stockQuantity || 0
    }).returning();

    // Create a stock transaction record if initial stock is greater than 0
    if (insertInventory.stockQuantity && insertInventory.stockQuantity > 0) {
      await this.createStockTransaction({
        productId: insertInventory.productId,
        transactionType: "received",
        quantity: insertInventory.stockQuantity,
        notes: "Initial inventory setup"
      });
    }

    return result[0];
  }

  async updateInventory(id: number, inventoryUpdate: Partial<InsertInventory>): Promise<Inventory | undefined> {
    const result = await db.update(inventory)
      .set({
        ...inventoryUpdate,
        lastStockUpdate: new Date()
      })
      .where(eq(inventory.id, id))
      .returning();
    return result[0];
  }

  async updateStockQuantity(productId: number, quantity: number): Promise<Inventory | undefined> {
    // Find inventory by productId
    const inventoryItem = await this.getInventory(productId);
    if (!inventoryItem) return undefined;

    // Calculate new stock level
    const newQuantity = inventoryItem.stockQuantity + quantity;
    const stockQuantity = newQuantity >= 0 ? newQuantity : 0;
    
    // Update inventory
    const result = await db.update(inventory)
      .set({
        stockQuantity,
        lastStockUpdate: new Date()
      })
      .where(eq(inventory.id, inventoryItem.id))
      .returning();

    // Update product inStock status
    const product = await this.getProduct(productId);
    if (product && product.inStock !== (stockQuantity > 0)) {
      await db.update(products)
        .set({ inStock: stockQuantity > 0 })
        .where(eq(products.id, productId));
    }

    return result[0];
  }

  // Stock Transaction methods
  async getStockTransactions(productId?: number): Promise<(StockTransaction & { product: Product })[]> {
    let query = db.select()
      .from(stockTransactions)
      .leftJoin(products, eq(stockTransactions.productId, products.id))
      .orderBy(desc(stockTransactions.transactionDate));
    
    if (productId) {
      query = query.where(eq(stockTransactions.productId, productId));
    }

    const result = await query;
    
    return result.map(item => {
      if (!item.products) {
        throw new Error(`Product with id ${item.stock_transactions.productId} not found`);
      }
      return {
        ...item.stock_transactions,
        product: item.products
      };
    });
  }

  async createStockTransaction(insertTransaction: InsertStockTransaction): Promise<StockTransaction> {
    const transactionDate = new Date();
    const result = await db.insert(stockTransactions).values({
      ...insertTransaction,
      transactionDate,
      reference: insertTransaction.reference || null,
      notes: insertTransaction.notes || null,
      userId: insertTransaction.userId || null
    }).returning();
    return result[0];
  }

  // Pricing Tier methods
  async getPricingTiers(): Promise<PricingTier[]> {
    return await db.select().from(pricingTiers);
  }

  async getPricingTier(id: number): Promise<PricingTier | undefined> {
    const result = await db.select().from(pricingTiers).where(eq(pricingTiers.id, id));
    return result[0];
  }

  async createPricingTier(insertTier: InsertPricingTier): Promise<PricingTier> {
    const result = await db.insert(pricingTiers).values({
      ...insertTier,
      discountPercentage: insertTier.discountPercentage || null,
      description: insertTier.description || null,
      isActive: insertTier.isActive !== false
    }).returning();
    return result[0];
  }

  async updatePricingTier(id: number, tierUpdate: Partial<InsertPricingTier>): Promise<PricingTier | undefined> {
    const result = await db.update(pricingTiers)
      .set(tierUpdate)
      .where(eq(pricingTiers.id, id))
      .returning();
    return result[0];
  }

  // Customer Product Pricing methods
  async getCustomerPricings(productId?: number, tierId?: number): Promise<(CustomerPricing & { product: Product, pricingTier: PricingTier })[]> {
    let query = db.select()
      .from(customerPricing)
      .leftJoin(products, eq(customerPricing.productId, products.id))
      .leftJoin(pricingTiers, eq(customerPricing.pricingTierId, pricingTiers.id));
    
    if (productId) {
      query = query.where(eq(customerPricing.productId, productId));
    }

    if (tierId) {
      query = query.where(eq(customerPricing.pricingTierId, tierId));
    }

    const result = await query;
    
    return result.map(item => {
      if (!item.products || !item.pricing_tiers) {
        throw new Error('Product or pricing tier not found');
      }
      return {
        ...item.customer_pricing,
        product: item.products,
        pricingTier: item.pricing_tiers
      };
    });
  }

  async getCustomerPricing(id: number): Promise<(CustomerPricing & { product: Product, pricingTier: PricingTier }) | undefined> {
    const result = await db.select()
      .from(customerPricing)
      .where(eq(customerPricing.id, id))
      .leftJoin(products, eq(customerPricing.productId, products.id))
      .leftJoin(pricingTiers, eq(customerPricing.pricingTierId, pricingTiers.id));
    
    if (result.length === 0 || !result[0].products || !result[0].pricing_tiers) {
      return undefined;
    }
    
    return {
      ...result[0].customer_pricing,
      product: result[0].products,
      pricingTier: result[0].pricing_tiers
    };
  }

  async createCustomerPricing(insertPricing: InsertCustomerPricing): Promise<CustomerPricing> {
    // Check if a pricing for this product and tier already exists
    const existingPricings = await db.select()
      .from(customerPricing)
      .where(and(
        eq(customerPricing.productId, insertPricing.productId),
        eq(customerPricing.pricingTierId, insertPricing.pricingTierId)
      ));

    if (existingPricings.length > 0) {
      throw new Error(`Pricing for product ID ${insertPricing.productId} and tier ID ${insertPricing.pricingTierId} already exists`);
    }

    const result = await db.insert(customerPricing).values({
      ...insertPricing,
      isActive: insertPricing.isActive !== false
    }).returning();
    return result[0];
  }

  async updateCustomerPricing(id: number, pricingUpdate: Partial<InsertCustomerPricing>): Promise<CustomerPricing | undefined> {
    const result = await db.update(customerPricing)
      .set(pricingUpdate)
      .where(eq(customerPricing.id, id))
      .returning();
    return result[0];
  }

  // User Pricing Tier methods
  async getUserPricingTiers(userId: number): Promise<(UserPricingTier & { pricingTier: PricingTier })[]> {
    const currentDate = new Date();
    const result = await db.select()
      .from(userPricingTiers)
      .leftJoin(pricingTiers, eq(userPricingTiers.pricingTierId, pricingTiers.id))
      .where(and(
        eq(userPricingTiers.userId, userId),
        eq(userPricingTiers.isActive, true),
        or(
          isNull(userPricingTiers.endDate),
          userPricingTiers.endDate >= currentDate
        )
      ));
    
    return result.map(item => {
      if (!item.pricing_tiers) {
        throw new Error(`Pricing tier not found`);
      }
      return {
        ...item.user_pricing_tiers,
        pricingTier: item.pricing_tiers
      };
    });
  }

  async createUserPricingTier(insertUserTier: InsertUserPricingTier): Promise<UserPricingTier> {
    const result = await db.insert(userPricingTiers).values({
      ...insertUserTier,
      startDate: insertUserTier.startDate || new Date(),
      endDate: insertUserTier.endDate || null,
      isActive: insertUserTier.isActive !== false
    }).returning();
    return result[0];
  }

  async updateUserPricingTier(id: number, userTierUpdate: Partial<InsertUserPricingTier>): Promise<UserPricingTier | undefined> {
    const result = await db.update(userPricingTiers)
      .set(userTierUpdate)
      .where(eq(userPricingTiers.id, id))
      .returning();
    return result[0];
  }

  async getCustomerProductPrice(userId: number, productId: number): Promise<number> {
    // Get the product's regular price
    const productResult = await db.select().from(products).where(eq(products.id, productId));
    if (productResult.length === 0) {
      throw new Error(`Product with id ${productId} not found`);
    }
    const product = productResult[0];
    
    const regularPrice = product.discountPrice || product.price;
    
    // Check if user has any active pricing tiers
    const userTiers = await this.getUserPricingTiers(userId);
    if (userTiers.length === 0) return regularPrice;
    
    // Find specific product pricing for the user's tiers
    let bestPrice = regularPrice;
    
    for (const userTier of userTiers) {
      // Check for specific product pricing in this tier
      const specificPricings = await db.select()
        .from(customerPricing)
        .where(and(
          eq(customerPricing.productId, productId),
          eq(customerPricing.pricingTierId, userTier.pricingTierId),
          eq(customerPricing.isActive, true)
        ));
      
      if (specificPricings.length > 0) {
        // Use the specific product pricing
        const pricing = specificPricings[0];
        if (pricing.price < bestPrice) {
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

// Function to initialize the database with demo data
export async function initializeDatabase() {
  // Check if tables are empty
  const categoryCount = await db.select().from(categories);
  const userCount = await db.select().from(users);
  
  // Create admin user if no users exist
  if (userCount.length === 0) {
    await db.insert(users).values({
      username: "admin",
      password: "admin123", // In a real app, this would be hashed
      name: "Admin User",
      email: "admin@groceryapp.com",
      role: "admin"
    });
    
    console.log('Admin user created');
  }
  
  if (categoryCount.length === 0) {
    console.log('Initializing database with demo data...');
    
    // Add categories
    const fruitsCategory = await db.insert(categories).values({ 
      name: 'Fruits & Vegetables',
      icon: 'bx-lemon',
      description: 'Fresh fruits and vegetables'
    }).returning();

    const dairyCategory = await db.insert(categories).values({ 
      name: 'Dairy & Breakfast',
      icon: 'bx-coffee',
      description: 'Milk, cheese, eggs, breakfast items'
    }).returning();

    const snacksCategory = await db.insert(categories).values({ 
      name: 'Snacks',
      icon: 'bx-cookie',
      description: 'Chips, cookies, nuts, etc.'
    }).returning();

    const beveragesCategory = await db.insert(categories).values({ 
      name: 'Beverages',
      icon: 'bx-drink',
      description: 'Water, juice, soda, etc.'
    }).returning();

    const bakeryCategory = await db.insert(categories).values({ 
      name: 'Bakery',
      icon: 'bx-baguette',
      description: 'Bread, cakes, pastries'
    }).returning();

    // Add products
    await db.insert(products).values([
      { 
        name: 'Organic Banana',
        description: 'Our organic bananas are sourced from sustainable farms. Sweet and ready to eat!',
        price: 1.99,
        quantity: '1 bunch',
        categoryId: fruitsCategory[0].id,
        image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80&w=2127&ixlib=rb-4.0.3',
        isOrganic: true,
        inStock: true
      },
      { 
        name: 'Red Apples',
        description: 'Sweet and juicy red apples. Perfect for snacking or baking.',
        price: 2.49,
        quantity: '4 pcs',
        categoryId: fruitsCategory[0].id,
        image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3',
        isOrganic: false,
        inStock: true
      },
      { 
        name: 'Whole Milk',
        description: 'Farm-fresh whole milk, pasteurized for safety.',
        price: 3.49,
        quantity: '1 L',
        categoryId: dairyCategory[0].id,
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=2072&ixlib=rb-4.0.3',
        isOrganic: false,
        inStock: true
      },
      { 
        name: 'Greek Yogurt',
        description: 'Thick and creamy Greek yogurt, plain flavor.',
        price: 4.99,
        quantity: '500 g',
        categoryId: dairyCategory[0].id,
        image: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&q=80&w=2076&ixlib=rb-4.0.3',
        isOrganic: false,
        inStock: true
      },
      { 
        name: 'Potato Chips',
        description: 'Crunchy potato chips with sea salt.',
        price: 2.99,
        quantity: '150 g',
        categoryId: snacksCategory[0].id,
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3',
        isOrganic: false,
        inStock: true
      },
      { 
        name: 'Mixed Nuts',
        description: 'A healthy mix of almonds, cashews, and walnuts.',
        price: 7.99,
        quantity: '250 g',
        categoryId: snacksCategory[0].id,
        image: 'https://images.unsplash.com/photo-1626200913858-5e74c5819389?auto=format&fit=crop&q=80&w=2032&ixlib=rb-4.0.3',
        isOrganic: false,
        inStock: true
      },
      { 
        name: 'Mineral Water',
        description: 'Natural spring water, bottled at source.',
        price: 1.49,
        quantity: '1 L',
        categoryId: beveragesCategory[0].id,
        image: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&q=80&w=2071&ixlib=rb-4.0.3',
        isOrganic: false,
        inStock: true
      },
      { 
        name: 'Orange Juice',
        description: 'Freshly squeezed orange juice, no added sugar.',
        price: 3.99,
        quantity: '1 L',
        categoryId: beveragesCategory[0].id,
        image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=1974&ixlib=rb-4.0.3',
        isOrganic: true,
        inStock: true
      },
      { 
        name: 'Whole Wheat Bread',
        description: 'Freshly baked whole wheat bread.',
        price: 2.99,
        quantity: '500 g',
        categoryId: bakeryCategory[0].id,
        image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3',
        isOrganic: false,
        inStock: true
      },
      { 
        name: 'Chocolate Muffins',
        description: 'Soft chocolate muffins with chocolate chips.',
        price: 4.99,
        quantity: '4 pcs',
        categoryId: bakeryCategory[0].id,
        image: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?auto=format&fit=crop&q=80&w=1974&ixlib=rb-4.0.3',
        isOrganic: false,
        inStock: true
      }
    ]);

    // Add offers
    await db.insert(offers).values([
      {
        title: 'Fresh Vegetables',
        description: 'Get 30% off on all fresh vegetables',
        validFrom: new Date(),
        validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=2069&ixlib=rb-4.0.3',
        categoryId: fruitsCategory[0].id,
        discountPercentage: 30,
        isActive: true
      },
      {
        title: 'Bakery Bonanza',
        description: 'Buy 1 Get 1 Free on all bakery items',
        validFrom: new Date(),
        validTo: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&q=80&w=2032&ixlib=rb-4.0.3',
        categoryId: bakeryCategory[0].id,
        discountPercentage: null,
        isActive: true
      }
    ]);

    // Get all products to create inventory for them
    const allProducts = await db.select().from(products);
    
    // Add inventory for each product
    for (const product of allProducts) {
      await db.insert(inventory).values({
        productId: product.id,
        stockQuantity: Math.floor(Math.random() * 100) + 20, // Random stock between 20-120
        minStockLevel: 10,
        maxStockLevel: 200,
        reorderPoint: 15,
        lastStockUpdate: new Date()
      });
    }

    // Create stock transactions for initial inventory
    const inventoryItems = await db.select().from(inventory);
    for (const item of inventoryItems) {
      await db.insert(stockTransactions).values({
        productId: item.productId,
        transactionType: 'received',
        quantity: item.stockQuantity,
        transactionDate: new Date(),
        notes: 'Initial inventory setup'
      });
    }

    // Add pricing tiers
    const standardTier = await db.insert(pricingTiers).values({
      name: 'Standard',
      description: 'Regular retail pricing for all customers',
      discountPercentage: null,
      isActive: true
    }).returning();

    const premiumTier = await db.insert(pricingTiers).values({
      name: 'Premium',
      description: 'Loyal customers with a 5% discount on all products',
      discountPercentage: 5,
      isActive: true
    }).returning();

    const vipTier = await db.insert(pricingTiers).values({
      name: 'VIP',
      description: 'VIP customers with a 10% discount on all products',
      discountPercentage: 10,
      isActive: true
    }).returning();

    const wholesaleTier = await db.insert(pricingTiers).values({
      name: 'Wholesale',
      description: 'Pricing for bulk purchases and business customers',
      discountPercentage: 15,
      isActive: true
    }).returning();

    // Create some specific product pricing for wholesale tier
    const bulkItems = allProducts.filter(p => 
      p.name.includes('Banana') || 
      p.name.includes('Apples') || 
      p.name.includes('Bread')
    );

    for (const item of bulkItems) {
      await db.insert(customerPricing).values({
        productId: item.id,
        pricingTierId: wholesaleTier[0].id,
        price: item.price * 0.70, // 30% off for wholesale
        isActive: true
      });
    }

    // Create a regular user and assign them to premium tier
    const regularUser = await db.insert(users).values({
      username: "customer",
      password: "customer123", // In a real app, this would be hashed
      name: "Regular Customer",
      email: "customer@example.com",
      role: "customer"
    }).returning();

    await db.insert(userPricingTiers).values({
      userId: regularUser[0].id,
      pricingTierId: premiumTier[0].id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isActive: true
    });

    console.log('Demo data initialized');
  }
}