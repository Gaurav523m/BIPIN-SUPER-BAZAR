import {
  type User, type InsertUser,
  type Address, type InsertAddress,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type CartItem, type InsertCartItem,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Offer, type InsertOffer
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  
  private userIdCounter = 1;
  private addressIdCounter = 1;
  private categoryIdCounter = 1;
  private productIdCounter = 1;
  private cartItemIdCounter = 1;
  private orderIdCounter = 1;
  private orderItemIdCounter = 1;
  private offerIdCounter = 1;

  constructor() {
    // Initialize with some demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
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
          }
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
          }
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
          }
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
          }
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
          }
        }
      ];

      fruitProducts.forEach(prod => {
        this.createProduct(prod as InsertProduct);
      });
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

    offers.forEach(offer => {
      if (offer.categoryId) {
        this.createOffer(offer as InsertOffer);
      }
    });
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
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
}

export const storage = new MemStorage();
