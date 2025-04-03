import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import useAddress from "@/hooks/use-address";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAddress?: any;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, editAddress }) => {
  const isEditing = !!editAddress;
  const [addressData, setAddressData] = useState({
    type: editAddress?.type || "home",
    address: editAddress?.address || "",
    city: editAddress?.city || "",
    state: editAddress?.state || "",
    zipCode: editAddress?.zipCode || "",
    isDefault: editAddress?.isDefault || false
  });
  
  const { user } = useAuth();
  const { savedAddresses, setSelectedAddress, addAddress, updateAddress, removeAddress } = useAddress();
  const { toast } = useToast();
  
  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you would reverse geocode here
          toast({
            title: "Location detected",
            description: "Your current location has been detected",
          });
          setAddressData(prev => ({
            ...prev,
            address: "Current Location (detected)"
          }));
        },
        (error) => {
          toast({
            title: "Error detecting location",
            description: error.message,
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive",
      });
    }
  };
  
  const handleSelectAddress = (addr: any) => {
    setSelectedAddress(addr);
    onClose();
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleTypeChange = (value: string) => {
    setAddressData(prev => ({
      ...prev,
      type: value
    }));
  };
  
  const handleDefaultChange = (checked: boolean) => {
    setAddressData(prev => ({
      ...prev,
      isDefault: checked
    }));
  };
  
  const handleSaveAddress = async () => {
    // Validate required fields
    if (!addressData.address.trim() || !addressData.city.trim() || !addressData.state.trim() || !addressData.zipCode.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all address fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isEditing) {
        // Update existing address
        await updateAddress(editAddress.id, addressData);
        toast({
          title: "Address Updated",
          description: "Your address has been updated successfully",
        });
      } else {
        // Add new address
        if (!user) {
          toast({
            title: "Error",
            description: "You must be logged in to add an address",
            variant: "destructive",
          });
          return;
        }
        
        await addAddress({
          userId: user.id,
          ...addressData
        });
        
        toast({
          title: "Address Added",
          description: "Your new address has been saved",
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving address:", error);
      toast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteAddress = async () => {
    if (isEditing) {
      try {
        await removeAddress(editAddress.id);
        toast({
          title: "Address Removed",
          description: "Your address has been removed successfully",
        });
        onClose();
      } catch (error) {
        console.error("Error removing address:", error);
        toast({
          title: "Error",
          description: "Failed to remove address. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-lg max-w-lg w-full">
        <DialogTitle className="text-xl font-bold">
          {isEditing ? "Edit Address" : "Add New Address"}
        </DialogTitle>
        
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Address Type</Label>
              <Select 
                value={addressData.type} 
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="address">Full Address</Label>
              <div className="relative">
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Enter your address"
                  value={addressData.address}
                  onChange={handleInputChange}
                />
                <button 
                  className="absolute right-3 top-3 text-gray-500"
                  onClick={handleDetectLocation}
                  type="button"
                >
                  <i className='bx bx-current-location text-xl'></i>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  placeholder="City"
                  value={addressData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="State"
                  value={addressData.state}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                type="text"
                placeholder="Zip Code"
                value={addressData.zipCode}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isDefault" 
                checked={addressData.isDefault}
                onCheckedChange={handleDefaultChange}
              />
              <Label htmlFor="isDefault" className="font-normal">
                Set as default address
              </Label>
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            {isEditing && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteAddress}
              >
                Delete Address
              </Button>
            )}
            <div className={`${isEditing ? '' : 'w-full'} flex gap-2 justify-end`}>
              <Button 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveAddress}
              >
                {isEditing ? "Update" : "Save"} Address
              </Button>
            </div>
          </div>
        </div>
        
        {!isEditing && savedAddresses.length > 0 && (
          <div className="p-4 border-t">
            <h3 className="font-medium mb-3">Saved Addresses</h3>
            <div className="space-y-3">
              {savedAddresses.map((addr) => (
                <div 
                  key={addr.id}
                  className="border border-gray-200 rounded-lg p-3 hover:border-primary cursor-pointer"
                  onClick={() => handleSelectAddress(addr)}
                >
                  <div className="flex gap-3">
                    <div className="text-primary mt-1">
                      <i className={`bx ${addr.type === 'home' ? 'bx-home' : addr.type === 'office' ? 'bx-building-house' : 'bx-map'} text-xl`}></i>
                    </div>
                    <div>
                      <h4 className="font-medium capitalize">{addr.type}</h4>
                      <p className="text-sm text-gray-600">{addr.address}</p>
                      <p className="text-xs text-gray-500">{addr.city}, {addr.state} {addr.zipCode}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LocationModal;
