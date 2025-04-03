import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import useUserStore from '@/store/user-store';
import { useToast } from '@/hooks/use-toast';

interface Address {
  id: number;
  type: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isDefault: boolean;
}

interface AddAddressParams {
  type: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
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

  // Fetch addresses from the API
  const { user } = useUserStore();
  
  // Fetch addresses query
  const addressesQuery = useQuery({
    queryKey: ['/api/addresses', { userId: user?.id }],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/addresses?userId=${user.id}`);
      const addresses = await response.json();
      return addresses;
    },
    enabled: !!user?.id,
    onSuccess: (data) => {
      // Update local store with fetched addresses
      if (data && Array.isArray(data)) {
        // Replace all addresses in the store with the fetched ones
        data.forEach(address => {
          addAddressLocal(address);
        });
      }
    }
  });

  // Public methods
  const addAddress = async (address: any) => {
    try {
      const response = await apiRequest('POST', '/api/addresses', {
        userId: address.userId,
        type: address.type,
        address: address.address,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        isDefault: address.isDefault || false
      });

      const newAddress = await response.json();
      addAddressLocal(newAddress);

      toast({
        title: 'Address Added',
        description: 'Your address has been added successfully',
      });
      
      // Refresh addresses from server
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      
      return newAddress;
    } catch (error: any) {
      console.error("Error adding address:", error);
      toast({
        title: 'Error Adding Address',
        description: error.message || 'Failed to add address',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateAddress = async (id: number, data: any) => {
    try {
      const response = await apiRequest('PATCH', `/api/addresses/${id}`, data);
      const updatedAddress = await response.json();
      
      // Update local store
      updateAddressLocal(id, data);

      toast({
        title: 'Address Updated',
        description: 'Your address has been updated successfully',
      });
      
      // Refresh addresses from server
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      
      return updatedAddress;
    } catch (error: any) {
      console.error("Error updating address:", error);
      toast({
        title: 'Error Updating Address',
        description: error.message || 'Failed to update address',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const removeAddress = async (id: number) => {
    try {
      const response = await apiRequest('DELETE', `/api/addresses/${id}`);
      const result = await response.json();
      
      // Update local store
      removeAddressLocal(id);

      toast({
        title: 'Address Removed',
        description: 'Your address has been removed successfully',
      });
      
      // Refresh addresses from server
      queryClient.invalidateQueries({ queryKey: ['/api/addresses'] });
      
      return result;
    } catch (error: any) {
      console.error("Error removing address:", error);
      toast({
        title: 'Error Removing Address',
        description: error.message || 'Failed to remove address',
        variant: 'destructive'
      });
      throw error;
    }
  };

  return {
    selectedAddress,
    savedAddresses,
    setSelectedAddress,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    isLoading: addressesQuery.isLoading
  };
};

export default useAddress;