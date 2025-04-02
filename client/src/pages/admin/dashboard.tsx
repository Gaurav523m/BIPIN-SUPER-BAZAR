import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useAdminStore } from '@/store/admin-store';
import { useToast } from '@/hooks/use-toast';
import ProductManagement from '@/components/admin/ProductManagement';
import CategoryManagement from '@/components/admin/CategoryManagement';
import { apiRequest } from '@/lib/queryClient';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, dashboardStats, setDashboardStats } = useAdminStore();

  // Check if user is logged in and is an admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You must be logged in as an admin to view this page.',
        variant: 'destructive',
      });
      setLocation('/admin/login');
    }
  }, [user, setLocation, toast]);

  // Fetch dashboard stats
  const { isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      try {
        // Add user-id header to the fetch request
        const headers = new Headers();
        headers.append('user-id', user?.id.toString() || '');
        
        const response = await fetch('/api/admin/stats', {
          headers: headers,
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const data = await response.json();
        setDashboardStats(data);
        return data;
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard statistics.',
          variant: 'destructive',
        });
        return null;
      }
    },
    enabled: !!user && user.role === 'admin',
  });

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? 'Loading...' : dashboardStats.totalOrders}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoadingStats ? 'Loading...' : dashboardStats.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? 'Loading...' : dashboardStats.totalProducts}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? 'Loading...' : dashboardStats.totalCustomers}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Management interface tabs */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <ProductManagement />
        </TabsContent>
        
        <TabsContent value="categories">
          <CategoryManagement />
        </TabsContent>
        
        <TabsContent value="orders">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Order Management Coming Soon</h3>
            <p className="text-muted-foreground">
              Order management capabilities are currently in development.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="offers">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Offer Management Coming Soon</h3>
            <p className="text-muted-foreground">
              Offer management capabilities are currently in development.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}