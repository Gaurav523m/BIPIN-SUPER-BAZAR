import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminStore } from '@/store/admin-store';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { LucideAlertTriangle, LucideCheck, LucideX, LucidePackage, LucidePackagePlus, LucidePackageMinus } from "lucide-react";
import { apiRequest } from '@/lib/queryClient';

export const InventoryManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const adminId = useAdminStore(state => state.user?.id);
  const [openCreateInventory, setOpenCreateInventory] = useState(false);
  const [openAddStock, setOpenAddStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [transactionType, setTransactionType] = useState('received');
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  
  // Fetch all inventory items
  const { data: inventory, isLoading: loadingInventory, refetch: refetchInventory } = useQuery({
    queryKey: ['/api/admin/inventory'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/inventory', {
        headers: { 'user-id': adminId?.toString() || '' }
      });
      return response;
    },
    enabled: !!adminId
  });

  // Fetch all products (for creating new inventory items)
  const { data: products } = useQuery({
    queryKey: ['/api/products'],
    enabled: openCreateInventory
  });

  // Fetch stock transactions
  const { data: transactions, refetch: refetchTransactions } = useQuery({
    queryKey: ['/api/admin/transactions', selectedProduct?.productId],
    queryFn: async () => {
      const url = selectedProduct?.productId 
        ? `/api/admin/transactions?productId=${selectedProduct.productId}` 
        : '/api/admin/transactions';
      
      const response = await apiRequest(url, {
        headers: { 'user-id': adminId?.toString() || '' }
      });
      return response;
    },
    enabled: !!adminId && !!selectedProduct
  });

  const createInventory = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      productId: parseInt(formData.get('productId') as string),
      stockQuantity: parseInt(formData.get('stockQuantity') as string),
      minStockLevel: parseInt(formData.get('minStockLevel') as string),
      maxStockLevel: parseInt(formData.get('maxStockLevel') as string),
      reorderPoint: parseInt(formData.get('reorderPoint') as string)
    };

    try {
      await apiRequest('/api/admin/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': adminId?.toString() || ''
        },
        body: JSON.stringify(data)
      });

      toast({
        title: "Success",
        description: "Inventory created successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inventory'] });
      setOpenCreateInventory(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create inventory",
        variant: "destructive"
      });
    }
  };

  const createTransaction = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      await apiRequest('/api/admin/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': adminId?.toString() || ''
        },
        body: JSON.stringify({
          productId: selectedProduct.productId,
          transactionType,
          quantity: transactionType === 'sold' ? -Math.abs(quantity) : quantity,
          notes,
          userId: adminId
        })
      });

      toast({
        title: "Success",
        description: "Stock updated successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
      setOpenAddStock(false);
      setQuantity(0);
      setNotes('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive"
      });
    }
  };

  // Filter inventory items
  const filteredInventory = inventory?.filter(item => {
    const matchesSearch = search 
      ? item.product.name.toLowerCase().includes(search.toLowerCase()) 
      : true;
      
    const isLowStock = showLowStock 
      ? item.stockQuantity <= item.reorderPoint 
      : true;
      
    return matchesSearch && isLowStock;
  });

  const handleProductSelect = (item: any) => {
    setSelectedProduct(item);
    setOpenAddStock(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="lowStock"
              checked={showLowStock}
              onChange={() => setShowLowStock(!showLowStock)}
            />
            <Label htmlFor="lowStock">Show Low Stock Only</Label>
          </div>
        </div>
        
        <Dialog open={openCreateInventory} onOpenChange={setOpenCreateInventory}>
          <DialogTrigger asChild>
            <Button>
              <LucidePackage className="mr-2 h-4 w-4" />
              Create Inventory Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Inventory Item</DialogTitle>
              <DialogDescription>
                Set up stock tracking for a product
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={createInventory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product</Label>
                <Select name="productId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product: any) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Initial Stock</Label>
                  <Input type="number" name="stockQuantity" min="0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStockLevel">Min Stock Level</Label>
                  <Input type="number" name="minStockLevel" min="0" defaultValue="5" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStockLevel">Max Stock Level</Label>
                  <Input type="number" name="maxStockLevel" min="0" defaultValue="100" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorderPoint">Reorder Point</Label>
                  <Input type="number" name="reorderPoint" min="0" defaultValue="10" required />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">Create Inventory</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loadingInventory ? (
        <div className="h-40 flex items-center justify-center">
          <div className="text-center text-muted-foreground">Loading inventory data...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>Manage product stock levels and inventory settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min Level</TableHead>
                    <TableHead>Reorder Point</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory?.length ? (
                    filteredInventory.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>{item.stockQuantity}</TableCell>
                        <TableCell>{item.minStockLevel}</TableCell>
                        <TableCell>{item.reorderPoint}</TableCell>
                        <TableCell>{new Date(item.lastStockUpdate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {item.stockQuantity === 0 ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : item.stockQuantity <= item.reorderPoint ? (
                            <Badge variant="warning" className="bg-orange-500">Low Stock</Badge>
                          ) : (
                            <Badge variant="success" className="bg-green-500">In Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProductSelect(item)}
                          >
                            Update Stock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No inventory items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {selectedProduct && (
            <Card>
              <CardHeader>
                <CardTitle>Stock Transaction History: {selectedProduct.product.name}</CardTitle>
                <CardDescription>All stock movements for this product</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions?.length ? (
                      transactions.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{new Date(transaction.transactionDate).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.transactionType === 'sold' ? 'destructive' : 'default'}>
                              {transaction.transactionType}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.quantity}</TableCell>
                          <TableCell>{transaction.notes || 'N/A'}</TableCell>
                          <TableCell>{transaction.reference || 'N/A'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No transaction history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Dialog open={openAddStock} onOpenChange={setOpenAddStock}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              {selectedProduct && `Update stock for ${selectedProduct.product.name}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={createTransaction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionType">Transaction Type</Label>
              <Select
                value={transactionType}
                onValueChange={setTransactionType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="adjusted">Adjusted</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="damaged">Damaged/Waste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this transaction"
              />
            </div>

            <DialogFooter>
              <Button type="submit">Update Stock</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryManagement;