import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";


// Define schema for profile completion form
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format").nullable().optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function CompleteProfile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, setUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to home if user is not logged in or profile is already complete
  useEffect(() => {
    if (!user) {
      setLocation("/login");
    } else if (user.isProfileComplete) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Initialize form with default values from user state if available
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting profile data:", data);
      console.log("Current user:", user);
      
      // First update the user profile
      const userResponse = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name || user.name,
          email: data.email || null, // Handle null email case
          isProfileComplete: true
        }),
        credentials: "include"
      });
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        console.error("Profile update API error:", errorData);
        throw new Error(`Failed to update user profile: ${errorData.error || errorData.message || 'Unknown error'}`);
      }
      
      const updatedUser = await userResponse.json();
      console.log("Updated user:", updatedUser);
      
      // Then create the address
      const addressData = {
        userId: user.id,
        type: "Home",
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        isDefault: true
      };
      
      console.log("Creating address with data:", addressData);
      
      const addressResponse = await fetch("/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
        credentials: "include"
      });
      
      if (!addressResponse.ok) {
        const errorData = await addressResponse.json();
        console.error("Address creation API error:", errorData);
        throw new Error(`Failed to create address: ${errorData.error || errorData.message || 'Unknown error'}`);
      }
      
      const newAddress = await addressResponse.json();
      console.log("Created address:", newAddress);
      
      // Update the user in state
      setUser(updatedUser);
      
      toast({
        title: "Profile completed!",
        description: "Your profile has been successfully completed.",
      });
      
      // Redirect to home page
      setLocation("/");
      
    } catch (error) {
      console.error("Error completing profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to complete your profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null; // Don't render anything if user is not logged in

  return (
    <div className="flex justify-center py-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Please fill in the details below to complete your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="john@example.com" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      {user.phone ? "Optional if you signed in with phone" : "Required for your account"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4">
                <h3 className="font-medium mb-2">Delivery Address</h3>
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New Delhi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="Delhi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP / Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="110001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <CardFooter className="px-0 pt-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Complete Profile"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CompleteProfile;