import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import useUserStore from '@/store/user-store';
import { useToast } from '@/hooks/use-toast';

interface Address {
  id: number;
  type: string;
  address: string;
  isDefault: boolean;
}

interface AddAddressParams {
  type: string;
  address: string;
  isDefault?: boolean;
}

// This is a wrapper around the user store that adds API integration
const useAddress = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Local state from store
  const {
    selectedAddress,
    savedAddresses,
    setSelectedAddress,
    addAddress: addAddressLocal,
    removeAddress: removeAddressLocal,
    updateAddress: updateAddressLocal,
    setDefaultAddress
  } = useUserStore();

  // In a real application with an API, we would have these queries
  // For now, we'll just use the local store state

  /*
  // Fetch addresses query
  const addressesQuery = useQuery({
    queryKey: ['/api/addresses', { userId: 1 }],
    onSuccess: (data) => {
      // Update local store with fetched addresses
    }
  });

  // Add address mutation
  const addAddressMutation = useMutation({
    mutationFn: async (data: AddAddressParams) => {
      // Mock userId for demo purposes
      const userId = 1;
      const payload = {
        userId,
        ...data
      };

      const response = await apiRequest('POST', '/api/addresses', payload);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });

      toast({
        title: 'Address Added',
        description: 'Your address has been added successfully',
        variant: 'success'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Adding Address',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AddAddressParams> }) => {
      const response = await apiRequest('PATCH', `/api/addresses/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });

      toast({
        title: 'Address Updated',
        description: 'Your address has been updated successfully',
        variant: 'success'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Updating Address',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Remove address mutation
  const removeAddressMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/addresses/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });

      toast({
        title: 'Address Removed',
        description: 'Your address has been removed successfully',
        variant: 'success'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Removing Address',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  */

  // Public methods
  const addAddress = async (address: AddAddressParams) => {
    try {
      const response = await apiRequest('POST', '/api/addresses', {
        userId: 1, // In a real app this would come from auth
        type: address.type,
        address: address.address,
        city: "New York", // These could be added to the form
        state: "NY",
        zipCode: "10001",
        isDefault: address.isDefault || false
      });

      const newAddress = await response.json();
      addAddressLocal(newAddress);

      toast({
        title: 'Address Added',
        description: 'Your address has been added successfully',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error Adding Address',
        description: error.message || 'Failed to add address',
        variant: 'destructive'
      });
    }
  };

  const updateAddress = (id: number, data: Partial<AddAddressParams>) => {
    updateAddressLocal(id, data);

    toast({
      title: 'Address Updated',
      description: 'Your address has been updated successfully',
      variant: 'success'
    });

    // updateAddressMutation.mutate({ id, data });
  };

  const removeAddress = (id: number) => {
    removeAddressLocal(id);

    toast({
      title: 'Address Removed',
      description: 'Your address has been removed successfully',
      variant: 'success'
    });

    // removeAddressMutation.mutate(id);
  };

  return {
    selectedAddress,
    savedAddresses,
    setSelectedAddress,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    // isLoading: addressesQuery.isLoading || 
    //            addAddressMutation.isPending || 
    //            updateAddressMutation.isPending || 
    //            removeAddressMutation.isPending
  };
};

export default useAddress;