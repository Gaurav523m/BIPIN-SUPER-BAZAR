import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Address {
  id: number;
  type: string; // 'home', 'office', 'custom'
  address: string;
  isDefault: boolean;
}

interface UserState {
  selectedAddress: Address | null;
  savedAddresses: Address[];
  setSelectedAddress: (address: Address) => void;
  addAddress: (address: Address) => void;
  removeAddress: (id: number) => void;
  updateAddress: (id: number, updatedAddress: Partial<Address>) => void;
  setDefaultAddress: (id: number) => void;
}

// Sample default addresses
const defaultAddresses: Address[] = [
  {
    id: 1,
    type: 'home',
    address: '123 Main Street, Apt 4B, New York, NY 10001',
    isDefault: true
  },
  {
    id: 2,
    type: 'office',
    address: '456 Business Ave, Floor 12, New York, NY 10002',
    isDefault: false
  }
];

const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      selectedAddress: defaultAddresses.find(addr => addr.isDefault) || null,
      savedAddresses: defaultAddresses,
      
      setSelectedAddress: (address) => {
        set({ selectedAddress: address });
      },
      
      addAddress: (address) => {
        const { savedAddresses } = get();
        
        // If this is the first address or marked as default, make it default
        if (savedAddresses.length === 0 || address.isDefault) {
          // First reset all existing addresses to non-default
          const updatedAddresses = savedAddresses.map(addr => ({
            ...addr,
            isDefault: false
          }));
          
          set({
            savedAddresses: [...updatedAddresses, { ...address, isDefault: true }],
            selectedAddress: { ...address, isDefault: true }
          });
        } else {
          set({
            savedAddresses: [...savedAddresses, address]
          });
        }
      },
      
      removeAddress: (id) => {
        const { savedAddresses, selectedAddress } = get();
        const filteredAddresses = savedAddresses.filter(addr => addr.id !== id);
        
        // If we're removing the selected address, select a new one
        let newSelectedAddress = selectedAddress;
        if (selectedAddress && selectedAddress.id === id) {
          newSelectedAddress = filteredAddresses.length > 0 ? filteredAddresses[0] : null;
        }
        
        set({
          savedAddresses: filteredAddresses,
          selectedAddress: newSelectedAddress
        });
      },
      
      updateAddress: (id, updatedAddress) => {
        const { savedAddresses, selectedAddress } = get();
        
        const updatedAddresses = savedAddresses.map(addr =>
          addr.id === id ? { ...addr, ...updatedAddress } : addr
        );
        
        // Update selected address if it's the one being modified
        let newSelectedAddress = selectedAddress;
        if (selectedAddress && selectedAddress.id === id) {
          newSelectedAddress = { ...selectedAddress, ...updatedAddress };
        }
        
        set({
          savedAddresses: updatedAddresses,
          selectedAddress: newSelectedAddress
        });
      },
      
      setDefaultAddress: (id) => {
        const { savedAddresses } = get();
        
        const updatedAddresses = savedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === id
        }));
        
        const newDefault = updatedAddresses.find(addr => addr.id === id) || null;
        
        set({
          savedAddresses: updatedAddresses,
          selectedAddress: newDefault
        });
      }
    }),
    {
      name: 'quickcart-user-store'
    }
  )
);

export default useUserStore;
