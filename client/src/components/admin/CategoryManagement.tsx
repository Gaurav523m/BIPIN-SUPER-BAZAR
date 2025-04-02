import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Category } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useAdminStore } from '@/store/admin-store';
import { useToast } from '@/hooks/use-toast';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Form validation schema based on category schema
const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  imageUrl: z.string().url('Must be a valid URL'),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function CategoryManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, selectedCategory, setSelectedCategory } = useAdminStore();

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await apiRequest('/api/categories');
      return response.json();
    },
  });

  // Form setup
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
    },
  });

  // Create category mutation
  const { mutate: createCategory, isPending: isCreating } = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const response = await apiRequest('/api/admin/categories', {
        method: 'POST',
        headers: {
          'user-id': user?.id.toString() || '',
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast({
        title: 'Error',
        description: 'Failed to create category. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CategoryFormValues) => {
    createCategory(data);
  };

  const handleAddNew = () => {
    form.reset({
      name: '',
      imageUrl: '',
    });
    setIsDialogOpen(true);
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    // In a full implementation, we would use this to open an edit dialog
    toast({
      title: 'Category Selected',
      description: `Selected ${category.name} for editing`,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={handleAddNew}>Add New Category</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Category'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Product Count</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category: Category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    {/* In a full implementation, we would fetch this count from the API */}
                    -
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleSelectCategory(category)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}