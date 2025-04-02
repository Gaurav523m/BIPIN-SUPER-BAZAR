import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Offer } from '@shared/schema';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

// Form validation schema based on the offer schema
const offerFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  discountPercentage: z.coerce.number().min(1, 'Must be at least 1%').max(100, 'Cannot exceed 100%'),
  imageUrl: z.string().url('Must be a valid URL'),
  isActive: z.boolean().default(true),
});

type OfferFormValues = z.infer<typeof offerFormSchema>;

export default function OfferManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, selectedOffer, setSelectedOffer } = useAdminStore();

  // Fetch offers
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['/api/offers'],
    queryFn: async () => {
      const response = await apiRequest('/api/offers');
      return response.json();
    },
  });

  // Form setup
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      title: '',
      description: '',
      discountPercentage: 0,
      imageUrl: '',
      isActive: true,
    },
  });

  // Create offer mutation
  const { mutate: createOffer, isPending: isCreating } = useMutation({
    mutationFn: async (data: OfferFormValues) => {
      const response = await apiRequest('/api/admin/offers', {
        method: 'POST',
        headers: {
          'user-id': user?.id.toString() || '',
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/offers'] });
      toast({
        title: 'Success',
        description: 'Offer created successfully',
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error('Error creating offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to create offer. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: OfferFormValues) => {
    createOffer(data);
  };

  const handleAddNew = () => {
    form.reset({
      title: '',
      description: '',
      discountPercentage: 0,
      imageUrl: '',
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleSelectOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    // In a full implementation, we would use this to open an edit dialog
    toast({
      title: 'Offer Selected',
      description: `Selected ${offer.title} for editing`,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Offers</h2>
        <Button onClick={handleAddNew}>Add New Offer</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Offer</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter offer title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter offer description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="discountPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Percentage (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="100" placeholder="10" {...field} />
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
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Active
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Make this offer visible to customers
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Offer'}
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
              <TableHead>Title</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No offers found
                </TableCell>
              </TableRow>
            ) : (
              offers.map((offer: Offer) => (
                <TableRow key={offer.id}>
                  <TableCell>
                    <img
                      src={offer.imageUrl}
                      alt={offer.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>{offer.title}</div>
                    <div className="text-sm text-muted-foreground">{offer.description}</div>
                  </TableCell>
                  <TableCell>{offer.discountPercentage}% OFF</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      offer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleSelectOffer(offer)}>
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