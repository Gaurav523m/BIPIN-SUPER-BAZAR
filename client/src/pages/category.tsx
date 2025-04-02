import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import ProductCard from "@/components/product/product-card";
import ProductDetailModal from "@/components/product/product-detail-modal";
import { Product, Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const CategoryPage: React.FC = () => {
  const params = useParams();
  const categoryId = params.categoryId;
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  console.log("Category page rendered with categoryId:", categoryId);
  
  useEffect(() => {
    if (!categoryId || isNaN(parseInt(categoryId))) {
      console.error("Invalid category ID:", categoryId);
      toast({
        title: "Error",
        description: "Invalid category ID. Redirecting to home page.",
        variant: "destructive"
      });
      setLocation("/");
    }
  }, [categoryId, setLocation, toast]);
  
  // Fetch category
  const { 
    data: category, 
    isLoading: isLoadingCategory,
    isError: isCategoryError
  } = useQuery<Category>({
    queryKey: [`/api/categories/${categoryId}`],
    enabled: !!categoryId && !isNaN(parseInt(categoryId)),
    onSuccess: (data) => {
      console.log("Category data loaded:", data);
    },
    onError: (error) => {
      console.error("Error loading category:", error);
    }
  });
  
  // Fetch products by category
  const { 
    data: products, 
    isLoading: isLoadingProducts,
    isError: isProductsError
  } = useQuery<Product[]>({
    queryKey: [`/api/products?categoryId=${categoryId}`],
    enabled: !!categoryId && !isNaN(parseInt(categoryId)),
    onSuccess: (data) => {
      console.log("Products loaded for category:", data);
    },
    onError: (error) => {
      console.error("Error loading products for category:", error);
    }
  });
  
  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };
  
  const closeProductModal = () => {
    setIsProductModalOpen(false);
  };
  
  return (
    <>
      {/* Category Header */}
      <div className="mb-6">
        {isLoadingCategory ? (
          <Skeleton className="h-8 w-64 mb-2" />
        ) : (
          <h1 className="text-2xl font-bold">{category?.name || "Category"}</h1>
        )}
        <p className="text-gray-600">
          {isLoadingCategory ? (
            <Skeleton className="h-4 w-full max-w-md" />
          ) : (
            category?.description || "Browse products in this category"
          )}
        </p>
      </div>
      
      {/* Products Grid */}
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
            <div className="text-gray-400 text-5xl mb-4">
              <i className='bx bx-package'></i>
            </div>
            <p className="text-gray-500 mb-4">No products found in this category.</p>
            <button 
              className="bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90"
              onClick={() => setLocation("/")}
            >
              Browse other categories
            </button>
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

export default CategoryPage;
