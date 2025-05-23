import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import LocationModal from "@/components/location/location-modal";
import useAddress from "@/hooks/use-address";
import { EditProfileForm } from "@/components/profile/edit-profile-form";

// Get the user from auth context

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const { savedAddresses, removeAddress } = useAddress();
  const { toast } = useToast();
  const { user, logout } = useAuth();

  // Fetch orders using the authenticated user's ID
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["/api/orders", { userId: user?.id || 0 }],
    // Don't attempt to fetch if there's no authenticated user
    enabled: !!user,
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`/api/orders?userId=${user?.id || 0}`);
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    }
  });
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-gray-600">Manage your profile and orders</p>
        </div>
        <Button 
          variant="outline" 
          className="mt-2 md:mt-0"
          onClick={handleLogout}
        >
          <i className='bx bx-log-out mr-2'></i> Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="text-lg">{user?.name || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                    <p className="text-lg">{user?.email || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                    <p className="text-lg">{user?.phone || 'Not set'}</p>
                  </div>
                  <div className="pt-4">
                    <Button 
                      variant="outline"
                      onClick={() => setIsEditProfileOpen(true)}
                    >
                      <i className='bx bx-edit mr-2'></i> Edit Profile
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-6">
                  <Skeleton className="h-32 w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : orders && Array.isArray(orders) && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:border-primary">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium">Order #{order.id}</div>
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            order.status === 'delivered' ? 'bg-green-500' : 
                            order.status === 'processing' ? 'bg-yellow-500' : 
                            'bg-primary'
                          }`}></span>
                          <span className="text-sm capitalize">{order.status}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {new Date(order.createdAt).toLocaleDateString()} • 
                        {order.items?.length || 0} items • ₹{order.totalAmount.toFixed(2)}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          <i className='bx bx-time mr-1'></i>
                          Delivery: {order.estimatedDeliveryTime} mins
                        </span>
                        <Button variant="link" size="sm" className="text-primary">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-gray-400 text-5xl mb-4">
                    <i className='bx bx-package'></i>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
                  <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                  <Button onClick={() => window.location.href = "/"}>
                    Start Shopping
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Saved Addresses</CardTitle>
              <Button 
                onClick={() => setIsLocationModalOpen(true)}
                size="sm"
              >
                <i className='bx bx-plus mr-2'></i> Add New
              </Button>
            </CardHeader>
            <CardContent>
              {savedAddresses && savedAddresses.length > 0 ? (
                <div className="space-y-4">
                  {savedAddresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-4 hover:border-primary">
                      <div className="flex gap-3">
                        <div className="text-primary mt-1">
                          <i className={`bx ${address.type === 'home' ? 'bx-home' : 'bx-building-house'} text-xl`}></i>
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium">{address.type === 'home' ? 'Home' : 'Office'}</h3>
                          <p className="text-sm text-gray-600">{address.address}</p>
                          {address.isDefault && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded mt-1 inline-block">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="text-gray-500 hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddress(address);
                              setIsLocationModalOpen(true);
                            }}
                          >
                            <i className='bx bx-edit'></i>
                          </button>
                          <button 
                            className="text-gray-500 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm("Are you sure you want to delete this address?")) {
                                removeAddress(address.id);
                              }
                            }}
                          >
                            <i className='bx bx-trash'></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-gray-400 text-5xl mb-4">
                    <i className='bx bx-map'></i>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Addresses Saved</h3>
                  <p className="text-gray-500 mb-4">Add a delivery address to get started.</p>
                  <Button onClick={() => setIsLocationModalOpen(true)}>
                    Add Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <LocationModal 
        isOpen={isLocationModalOpen}
        onClose={() => {
          setIsLocationModalOpen(false);
          setEditingAddress(null);
        }}
        editAddress={editingAddress}
      />
      
      {user && (
        <EditProfileForm
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          user={user}
        />
      )}
    </>
  );
};

export default AccountPage;
