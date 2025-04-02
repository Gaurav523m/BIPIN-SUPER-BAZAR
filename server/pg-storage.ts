import { db } from './db';
import { eq, and, or, ilike, desc } from 'drizzle-orm';
import { 
  User, InsertUser, 
  Address, InsertAddress, 
  Category, InsertCategory, 
  Product, InsertProduct, 
  CartItem, InsertCartItem, 
  Order, InsertOrder, 
  OrderItem, InsertOrderItem, 
  Offer, InsertOffer, 
  users, addresses, categories, products, cartItems, orders, orderItems, offers
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

    console.log('Demo data initialized');
  }
}