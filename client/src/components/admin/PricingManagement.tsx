import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminStore } from '@/store/admin-store';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LucideEdit, LucideTrash2, LucideTag, LucideUsers, LucidePercent } from "lucide-react";
import { apiRequest } from '@/lib/queryClient';
import { Switch } from "@/components/ui/switch";

export const PricingManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const adminId = useAdminStore(state => state.user?.id);
  const [openCreateTier, setOpenCreateTier] = useState(false);
  const [openEditTier, setOpenEditTier] = useState(false);
  const [openCreatePricing, setOpenCreatePricing] = useState(false);
  const [openAssignTier, setOpenAssignTier] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("tiers");
  const [filterProduct, setFilterProduct] = useState<number | null>(null);
  const [filterTier, setFilterTier] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch pricing tiers
  const { data: pricingTiers, isLoading: loadingTiers, refetch: refetchTiers } = useQuery({
    queryKey: ['/api/admin/pricing-tiers'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/pricing-tiers', {
        headers: { 'user-id': adminId?.toString() || '' }
      });
      return response;
    },
    enabled: !!adminId
  });

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    enabled: activeTab === 'customPricing' || openCreatePricing
  });

  // Fetch users
  const { data: users } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/users', {
        headers: { 'user-id': adminId?.toString() || '' }
      });
      return response;
    },
    enabled: !!adminId && activeTab === 'assignments'
  });

  // Fetch customer pricing
  const { data: customerPricing, isLoading: loadingPricing, refetch: refetchPricing } = useQuery({
    queryKey: ['/api/admin/customer-pricing', filterProduct, filterTier],
    queryFn: async () => {
      let url = '/api/admin/customer-pricing';
      const params = [];
      
      if (filterProduct) params.push(`productId=${filterProduct}`);
      if (filterTier) params.push(`tierId=${filterTier}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await apiRequest(url, {
        headers: { 'user-id': adminId?.toString() || '' }
      });
      return response;
    },
    enabled: !!adminId && activeTab === 'customPricing'
  });

  // Fetch user tier assignments
  const { data: userAssignments, isLoading: loadingAssignments, refetch: refetchAssignments } = useQuery({
    queryKey: ['/api/admin/user-pricing-tiers'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/user-pricing-tiers', {
        headers: { 'user-id': adminId?.toString() || '' }
      });
      return response;
    },
    enabled: !!adminId && activeTab === 'assignments'
  });

  const createPricingTier = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      discountPercentage: formData.get('discountPercentage') ? parseInt(formData.get('discountPercentage') as string) : null,
      isActive: formData.get('isActive') === 'on'
    };

    try {
      await apiRequest('/api/admin/pricing-tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': adminId?.toString() || ''
        },
        body: JSON.stringify(data)
      });

      toast({
        title: "Success",
        description: "Pricing tier created successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing-tiers'] });
      setOpenCreateTier(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create pricing tier",
        variant: "destructive"
      });
    }
  };

  const updatePricingTier = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      discountPercentage: formData.get('discountPercentage') ? parseInt(formData.get('discountPercentage') as string) : null,
      isActive: formData.get('isActive') === 'on'
    };

    try {
      await apiRequest(`/api/admin/pricing-tiers/${selectedTier.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'user-id': adminId?.toString() || ''
        },
        body: JSON.stringify(data)
      });

      toast({
        title: "Success",
        description: "Pricing tier updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pricing-tiers'] });
      setOpenEditTier(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update pricing tier",
        variant: "destructive"
      });
    }
  };

  const createCustomPricing = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      productId: parseInt(formData.get('productId') as string),
      pricingTierId: parseInt(formData.get('pricingTierId') as string),
      price: parseFloat(formData.get('price') as string),
      isActive: formData.get('isActive') === 'on'
    };

    try {
      await apiRequest('/api/admin/customer-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': adminId?.toString() || ''
        },
        body: JSON.stringify(data)
      });

      toast({
        title: "Success",
        description: "Custom product pricing created successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/customer-pricing'] });
      setOpenCreatePricing(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create custom pricing. This product may already have custom pricing for this tier.",
        variant: "destructive"
      });
    }
  };

  const assignUserTier = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    
    const data = {
      userId: parseInt(formData.get('userId') as string),
      pricingTierId: parseInt(formData.get('pricingTierId') as string),
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : null,
      isActive: true
    };

    try {
      await apiRequest('/api/admin/user-pricing-tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': adminId?.toString() || ''
        },
        body: JSON.stringify(data)
      });

      toast({
        title: "Success",
        description: "User pricing tier assigned successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-pricing-tiers'] });
      setOpenAssignTier(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign pricing tier to user",
        variant: "destructive"
      });
    }
  };

  const deactivateUserTier = async (id: number) => {
    try {
      await apiRequest(`/api/admin/user-pricing-tiers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'user-id': adminId?.toString() || ''
        },
        body: JSON.stringify({
          isActive: false,
          endDate: new Date().toISOString()
        })
      });

      toast({
        title: "Success",
        description: "User pricing tier deactivated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-pricing-tiers'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate user pricing tier",
        variant: "destructive"
      });
    }
  };

  const handleEditTier = (tier: any) => {
    setSelectedTier(tier);
    setOpenEditTier(true);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  // Pagination
  const getPaginatedData = (data: any[] = []) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = (data: any[] = []) => Math.ceil(data.length / itemsPerPage);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="tiers" value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="tiers">
            <LucidePercent className="w-4 h-4 mr-2" />
            Pricing Tiers
          </TabsTrigger>
          <TabsTrigger value="customPricing">
            <LucideTag className="w-4 h-4 mr-2" />
            Custom Product Pricing
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <LucideUsers className="w-4 h-4 mr-2" />
            User Tier Assignments
          </TabsTrigger>
        </TabsList>

        {/* Pricing Tiers Tab */}
        <TabsContent value="tiers">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Pricing Tiers</h2>
            <Dialog open={openCreateTier} onOpenChange={setOpenCreateTier}>
              <DialogTrigger asChild>
                <Button>
                  <LucidePercent className="w-4 h-4 mr-2" />
                  Create New Tier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Pricing Tier</DialogTitle>
                  <DialogDescription>
                    Create a new pricing tier for special customer groups
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={createPricingTier} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tier Name</Label>
                    <Input name="name" required placeholder="e.g. Premium, Wholesale, VIP" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input name="description" placeholder="Description of this pricing tier" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountPercentage">Discount Percentage (optional)</Label>
                    <Input 
                      type="number" 
                      name="discountPercentage" 
                      placeholder="e.g. 10 for 10% discount"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty for tiers with custom product pricing only
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="isActive" name="isActive" defaultChecked />
                    <Label htmlFor="isActive">Active</Label>
                  </div>

                  <DialogFooter>
                    <Button type="submit">Create Tier</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loadingTiers ? (
            <div className="h-40 flex items-center justify-center">
              <div className="text-center text-muted-foreground">Loading pricing tiers...</div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tier Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Discount %</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingTiers?.length ? (
                      pricingTiers.map((tier: any) => (
                        <TableRow key={tier.id}>
                          <TableCell className="font-medium">{tier.name}</TableCell>
                          <TableCell>{tier.description || 'N/A'}</TableCell>
                          <TableCell>{tier.discountPercentage !== null ? `${tier.discountPercentage}%` : 'Custom'}</TableCell>
                          <TableCell>
                            <Badge variant={tier.isActive ? "success" : "destructive"} 
                                  className={tier.isActive ? "bg-green-500" : ""}>
                              {tier.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mr-2"
                              onClick={() => handleEditTier(tier)}
                            >
                              <LucideEdit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No pricing tiers found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Edit Tier Dialog */}
          <Dialog open={openEditTier} onOpenChange={setOpenEditTier}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Pricing Tier</DialogTitle>
                <DialogDescription>
                  Update pricing tier details
                </DialogDescription>
              </DialogHeader>

              {selectedTier && (
                <form onSubmit={updatePricingTier} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tier Name</Label>
                    <Input 
                      name="name" 
                      required 
                      defaultValue={selectedTier.name} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input 
                      name="description" 
                      defaultValue={selectedTier.description || ''} 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountPercentage">Discount Percentage (optional)</Label>
                    <Input 
                      type="number" 
                      name="discountPercentage" 
                      defaultValue={selectedTier.discountPercentage || ''}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="isActive" 
                      name="isActive" 
                      defaultChecked={selectedTier.isActive} 
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>

                  <DialogFooter>
                    <Button type="submit">Update Tier</Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Custom Product Pricing Tab */}
        <TabsContent value="customPricing">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">Custom Product Pricing</h2>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="filterProduct">Filter by Product:</Label>
                <Select 
                  value={filterProduct?.toString() || ''} 
                  onValueChange={(value) => setFilterProduct(value ? parseInt(value) : null)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Products</SelectItem>
                    {products?.map((product: any) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="filterTier">Filter by Tier:</Label>
                <Select 
                  value={filterTier?.toString() || ''} 
                  onValueChange={(value) => setFilterTier(value ? parseInt(value) : null)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Tiers</SelectItem>
                    {pricingTiers?.map((tier: any) => (
                      <SelectItem key={tier.id} value={tier.id.toString()}>
                        {tier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Dialog open={openCreatePricing} onOpenChange={setOpenCreatePricing}>
              <DialogTrigger asChild>
                <Button>
                  <LucideTag className="w-4 h-4 mr-2" />
                  Add Product Pricing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Custom Product Pricing</DialogTitle>
                  <DialogDescription>
                    Set specific product pricing for a customer tier
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={createCustomPricing} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productId">Product</Label>
                    <Select name="productId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product: any) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} (Regular: ${product.price.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricingTierId">Pricing Tier</Label>
                    <Select name="pricingTierId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {pricingTiers?.map((tier: any) => (
                          <SelectItem key={tier.id} value={tier.id.toString()}>
                            {tier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Special Price</Label>
                    <Input 
                      type="number" 
                      name="price" 
                      step="0.01"
                      min="0"
                      required
                      placeholder="Enter special price"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="isActive" name="isActive" defaultChecked />
                    <Label htmlFor="isActive">Active</Label>
                  </div>

                  <DialogFooter>
                    <Button type="submit">Create Pricing</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loadingPricing ? (
            <div className="h-40 flex items-center justify-center">
              <div className="text-center text-muted-foreground">Loading custom pricing data...</div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Regular Price</TableHead>
                      <TableHead>Pricing Tier</TableHead>
                      <TableHead>Special Price</TableHead>
                      <TableHead>Savings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerPricing?.length ? (
                      getPaginatedData(customerPricing).map((pricing: any) => {
                        const regularPrice = pricing.product.price;
                        const specialPrice = pricing.price;
                        const savings = regularPrice - specialPrice;
                        const savingsPercent = (savings / regularPrice) * 100;
                        
                        return (
                          <TableRow key={pricing.id}>
                            <TableCell>{pricing.product.name}</TableCell>
                            <TableCell>${regularPrice.toFixed(2)}</TableCell>
                            <TableCell>{pricing.pricingTier.name}</TableCell>
                            <TableCell>${specialPrice.toFixed(2)}</TableCell>
                            <TableCell>
                              {savings > 0 ? (
                                <span className="text-green-600">
                                  {savingsPercent.toFixed(0)}% (${savings.toFixed(2)})
                                </span>
                              ) : (
                                <span>No discount</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={pricing.isActive ? "success" : "destructive"} 
                                    className={pricing.isActive ? "bg-green-500" : ""}>
                                {pricing.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mr-2"
                                onClick={() => {
                                  // Edit functionality would go here
                                }}
                              >
                                <LucideEdit className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No custom product pricing found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              
              {customerPricing && customerPricing.length > itemsPerPage && (
                <div className="flex justify-center space-x-2 p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <span className="px-4 py-2 bg-muted rounded">
                    Page {currentPage} of {totalPages(customerPricing)}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages(customerPricing), p + 1))}
                    disabled={currentPage === totalPages(customerPricing)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card>
          )}
        </TabsContent>

        {/* User Tier Assignments Tab */}
        <TabsContent value="assignments">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">User Tier Assignments</h2>
            
            <Dialog open={openAssignTier} onOpenChange={setOpenAssignTier}>
              <DialogTrigger asChild>
                <Button>
                  <LucideUsers className="w-4 h-4 mr-2" />
                  Assign Tier to User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Pricing Tier</DialogTitle>
                  <DialogDescription>
                    Assign a pricing tier to a customer
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={assignUserTier} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userId">User</Label>
                    <Select name="userId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users?.map((user: any) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricingTierId">Pricing Tier</Label>
                    <Select name="pricingTierId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {pricingTiers?.filter((tier: any) => tier.isActive).map((tier: any) => (
                          <SelectItem key={tier.id} value={tier.id.toString()}>
                            {tier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input 
                        type="date" 
                        name="startDate" 
                        defaultValue={new Date().toISOString().substr(0, 10)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date (Optional)</Label>
                      <Input 
                        type="date" 
                        name="endDate" 
                        min={new Date().toISOString().substr(0, 10)}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="submit">Assign Tier</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loadingAssignments ? (
            <div className="h-40 flex items-center justify-center">
              <div className="text-center text-muted-foreground">Loading user tier assignments...</div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Pricing Tier</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userAssignments?.length ? (
                      getPaginatedData(userAssignments).map((assignment: any) => {
                        const now = new Date();
                        const endDate = assignment.endDate ? new Date(assignment.endDate) : null;
                        const isExpired = endDate && endDate < now;
                        const isActive = assignment.isActive && !isExpired;
                        
                        return (
                          <TableRow key={assignment.id}>
                            <TableCell>{assignment.user?.name || 'Unknown'}</TableCell>
                            <TableCell>{assignment.pricingTier.name}</TableCell>
                            <TableCell>{new Date(assignment.startDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {assignment.endDate 
                                ? new Date(assignment.endDate).toLocaleDateString() 
                                : 'No end date'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={isActive ? "success" : "destructive"} 
                                    className={isActive ? "bg-green-500" : ""}>
                                {isActive ? 'Active' : 'Inactive'}
                                {isExpired && ' (Expired)'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {isActive && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deactivateUserTier(assignment.id)}
                                >
                                  <LucideTrash2 className="w-4 h-4 mr-1" />
                                  Deactivate
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No user tier assignments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              
              {userAssignments && userAssignments.length > itemsPerPage && (
                <div className="flex justify-center space-x-2 p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <span className="px-4 py-2 bg-muted rounded">
                    Page {currentPage} of {totalPages(userAssignments)}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages(userAssignments), p + 1))}
                    disabled={currentPage === totalPages(userAssignments)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PricingManagement;