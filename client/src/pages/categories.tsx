import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const CategoriesPage: React.FC = () => {
  // Fetch categories
  const { 
    data: categories, 
    isLoading,
    isError
  } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  if (isError) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-5xl mb-4">
          <i className='bx bx-error-circle'></i>
        </div>
        <p className="text-gray-500 mb-4">Failed to load categories. Please try again later.</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">All Categories</h1>
        <p className="text-gray-600">Browse our selection of categories to find what you need.</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {isLoading ? (
          // Skeleton loading for categories
          Array(8).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4 flex flex-col items-center">
                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))
        ) : categories && categories.length > 0 ? (
          categories.map((category) => (
            <Link key={category.id} to={`/category/${category.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="text-primary text-4xl mb-3">
                    <i className={`bx ${category.icon || 'bx-package'}`}></i>
                  </div>
                  <h3 className="font-medium text-center mb-1">{category.name}</h3>
                  {category.description && (
                    <p className="text-gray-500 text-sm text-center line-clamp-2">{category.description}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-400 text-5xl mb-4">
              <i className='bx bx-category'></i>
            </div>
            <p className="text-gray-500 mb-4">No categories found. Check back soon!</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CategoriesPage;