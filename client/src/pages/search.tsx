import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/product/product-card";
import ProductDetailModal from "@/components/product/product-detail-modal";
import { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  // Debounce search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce the search to avoid too many requests
    if (query.length === 0) {
      setDebouncedQuery(""); // Immediately clear if empty
    } else if (query.length >= 2) {
      const timeout = setTimeout(() => {
        setDebouncedQuery(query);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  };
  
  // Fetch search results
  const { 
    data: products, 
    isLoading: isLoadingProducts,
    isError: isProductsError
  } = useQuery<Product[]>({
    queryKey: ['/api/products', { search: debouncedQuery }],
    queryFn: () => debouncedQuery ? 
      fetch(`/api/products?search=${encodeURIComponent(debouncedQuery)}`).then(res => res.json()) : 
      Promise.resolve([]),
    enabled: debouncedQuery.length >= 2
  });
  
  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };
  
  const closeProductModal = () => {
    setIsProductModalOpen(false);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(searchQuery);
  };
  
  return (
    <>
      {/* Search Form */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Search Products</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="flex-1"
            autoFocus
          />
          <Button type="submit">
            <i className='bx bx-search mr-2'></i>
            Search
          </Button>
        </form>
      </div>
      
      {/* Results Message */}
      {debouncedQuery && !isLoadingProducts && (
        <p className="text-gray-600 mb-4">
          {products?.length ? 
            `Found ${products.length} results for "${debouncedQuery}"` : 
            `No results found for "${debouncedQuery}"`}
        </p>
      )}
      
      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {isLoadingProducts ? (
          // Skeleton loading for products
          Array(4).fill(0).map((_, index) => (
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
        ) : debouncedQuery ? (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-400 text-5xl mb-4">
              <i className='bx bx-search-alt'></i>
            </div>
            <p className="text-gray-500 mb-1">No products found matching "{debouncedQuery}".</p>
            <p className="text-gray-500 mb-4">Try a different search term or browse categories.</p>
          </div>
        ) : (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-400 text-5xl mb-4">
              <i className='bx bx-search'></i>
            </div>
            <p className="text-gray-500 mb-4">Enter a search term to find products.</p>
          </div>
        )}
      </div>
      
      {/* Product Detail Modal */}
      <ProductDetailModal 
        isOpen={isProductModalOpen} 
        onClose={closeProductModal} 
        product={selectedProduct}
      />
    </>
  );
};

export default SearchPage;