import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import ProductCard from "@/components/product/product-card";
import ProductDetailModal from "@/components/product/product-detail-modal";
import CategoryIcon from "@/components/ui/category-icon";
import { Product, Category, Offer } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const Home: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [location] = useLocation();
  
  // Extract search query from URL if present
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const searchQuery = searchParams.get('search');
  
  // Fetch products
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products", searchQuery ? { search: searchQuery } : null],
  });
  
  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Fetch offers
  const { data: offers, isLoading: isLoadingOffers } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
  });
  
  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };
  
  const closeProductModal = () => {
    setIsProductModalOpen(false);
  };
  
  // Map category icon to color
  const getCategoryColor = (index: number) => {
    const colors = ["primary", "blue", "orange", "purple", "yellow", "red"] as const;
    return colors[index % colors.length];
  };
  
  return (
    <>
      {/* Delivery Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-yellow-100 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="font-bold text-lg">Get your groceries in 10 minutes!</p>
          <p className="text-sm">Order now and enjoy lightning-fast delivery</p>
        </div>
        <div className="bg-primary text-white py-2 px-4 rounded-full text-sm font-medium flex items-center gap-2">
          <i className='bx bx-time'></i> 10 min delivery
        </div>
      </div>

      {/* Special Offers Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Special Offers</h2>
          <a href="#" className="text-primary text-sm font-medium">View All</a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoadingOffers ? (
            // Skeleton loading for offers
            Array(2).fill(0).map((_, index) => (
              <div key={index} className="rounded-lg overflow-hidden shadow-md">
                <Skeleton className="w-full h-40" />
                <div className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-3" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
              </div>
            ))
          ) : offers && offers.length > 0 ? (
            offers.map((offer) => (
              <div key={offer.id} className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <img 
                  src={offer.image} 
                  alt={offer.title} 
                  className="w-full h-40 object-cover" 
                />
                <div className="p-4">
                  <div className="mb-2 bg-accent/10 text-accent text-xs font-bold py-1 px-2 rounded inline-block">
                    {offer.discountPercentage ? `${offer.discountPercentage}% OFF` : 'BUY 1 GET 1'}
                  </div>
                  <h3 className="font-bold">{offer.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                  <button 
                    className="bg-primary text-white py-2 px-4 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors w-full"
                    onClick={() => {
                      // In a real app, this would navigate to the offer's category
                    }}
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No special offers available at the moment.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Products Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Fruits & Vegetables"}
          </h2>
          <a href="#" className="text-primary text-sm font-medium">View All</a>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {isLoadingProducts ? (
            // Skeleton loading for products
            Array(10).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                <Skeleton className="w-full h-40" />
                <div className="p-3">
                  <div className="flex justify-between items-start mb-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-3 w-32 mb-2" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-7 w-7 rounded-full" />
                  </div>
                </div>
              </div>
            ))
          ) : products && products.length > 0 ? (
            products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onViewDetails={openProductModal} 
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">
                {searchQuery ? `No products found for "${searchQuery}"` : "No products available."}
              </p>
            </div>
          )}
        </div>
      </section>
      
      {/* Featured Categories Section */}
      <section className="mt-12">
        <h2 className="text-xl font-bold mb-4">Shop by Category</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {isLoadingCategories ? (
            // Skeleton loading for categories
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col items-center p-4">
                <Skeleton className="w-16 h-16 rounded-full mb-3" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          ) : categories && categories.length > 0 ? (
            categories.map((category, index) => (
              <a 
                key={category.id} 
                href={`/category/${category.id}`}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col items-center p-4"
              >
                <CategoryIcon 
                  icon={category.icon || "bx-package"} 
                  color={getCategoryColor(index)}
                  size="md"
                />
                <h3 className="text-sm font-medium text-center mt-3">{category.name}</h3>
              </a>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No categories available.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Product Detail Modal */}
      <ProductDetailModal 
        isOpen={isProductModalOpen} 
        onClose={closeProductModal} 
        product={selectedProduct}
      />
    </>
  );
};

export default Home;
