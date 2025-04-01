import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAddress from "@/hooks/use-address";
import { useToast } from "@/hooks/use-toast";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const [address, setAddress] = useState("");
  const { savedAddresses, setSelectedAddress } = useAddress();
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
          setAddress("Current Location (detected)");
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
  
  const handleSelectAddress = (addressData: any) => {
    setSelectedAddress(addressData);
    onClose();
  };
  
  const handleConfirmLocation = () => {
    if (address.trim()) {
      const newAddress = {
        id: Date.now(),
        type: "custom",
        address: address,
        isDefault: false,
      };
      setSelectedAddress(newAddress);
      onClose();
    } else {
      toast({
        title: "Address Required",
        description: "Please enter an address or select a saved one",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-lg max-w-lg w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Choose Delivery Location</h2>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <i className='bx bx-x text-2xl'></i>
            </button>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Deliver to</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full py-3 px-4 pr-10 rounded-lg border border-gray-300"
              />
              <button 
                className="absolute right-3 top-3 text-gray-500"
                onClick={handleDetectLocation}
              >
                <i className='bx bx-current-location text-xl'></i>
              </button>
            </div>
          </div>
          
          <div className="mb-6">
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
                      <i className={`bx ${addr.type === 'home' ? 'bx-home' : 'bx-building-house'} text-xl`}></i>
                    </div>
                    <div>
                      <h4 className="font-medium">{addr.type === 'home' ? 'Home' : 'Office'}</h4>
                      <p className="text-sm text-gray-600">{addr.address}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Button 
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            onClick={handleConfirmLocation}
          >
            Confirm Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationModal;
