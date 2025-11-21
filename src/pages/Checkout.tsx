import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/home/Footer";
import { useCart } from "@/context/CartContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { orderService } from "@/services/orderService";
import StripePaymentButton from "@/components/StripePaymentButton";
import type { PaymentData } from "@/components/StripePaymentButton";
import type { DiscountCode } from "./AdminDiscountCodes";
import { Loader } from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, clearCart, loading: cartLoading, totalAmount } = useCart();
  const [processing, setProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    country: "United Kingdom"
  });
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscounts, setAppliedDiscounts] = useState<DiscountCode[]>([]);
  const [discountError, setDiscountError] = useState("");

  // Calculate totals
  const subtotal = totalAmount; // Use the totalAmount from cart context
  const shipping = subtotal > 50 ? 0 : 4.99; // Free shipping over £50
  
  // Calculate discount amounts
  let productDiscountAmount = 0;
  let shippingDiscountAmount = 0;
  let hasFreeShipping = false;
  
  appliedDiscounts.forEach(discount => {
    if (discount.type === 'free_shipping') {
      hasFreeShipping = true;
      shippingDiscountAmount = shipping;
    } else if (discount.type === 'percentage') {
      productDiscountAmount += (subtotal * discount.value) / 100;
    } else if (discount.type === 'fixed') {
      productDiscountAmount += discount.value;
    }
  });
  
  // Ensure product discount doesn't exceed subtotal
  productDiscountAmount = Math.min(productDiscountAmount, subtotal);
  const totalDiscountAmount = productDiscountAmount + shippingDiscountAmount;
  
  const finalShipping = hasFreeShipping ? 0 : shipping;
  const total = subtotal - productDiscountAmount + finalShipping;

  // Show loading state
  if (cartLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow pt-24 pb-12">
          <div className="container mx-auto px-4 text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading checkout...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow pt-24 pb-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some items to your cart before checking out.</p>
            <Button onClick={() => navigate('/shop')} variant="premium">
              Continue Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateDiscountCode = () => {
    if (!discountCode.trim()) {
      setDiscountError("Please enter a discount code");
      return;
    }

    // Get discount codes from localStorage
    const savedCodes = localStorage.getItem('adminDiscountCodes');
    const discountCodes: DiscountCode[] = savedCodes ? JSON.parse(savedCodes) : [];
    
    // Find the discount code
    const code = discountCodes.find(c => 
      c.code.toLowerCase() === discountCode.toLowerCase().trim()
    );

    if (!code) {
      setDiscountError("Invalid discount code");
      return;
    }

    // Check if code is already applied
    if (appliedDiscounts.some(d => d.id === code.id)) {
      setDiscountError("This discount code is already applied");
      return;
    }

    // Check if we can stack this discount
    const hasNonStackableDiscount = appliedDiscounts.some(d => !d.isStackable);
    const isCodeStackable = code.isStackable;
    
    if (appliedDiscounts.length > 0 && (!isCodeStackable || hasNonStackableDiscount)) {
      setDiscountError("This discount cannot be combined with other offers");
      return;
    }

    // Check for conflicting free shipping codes
    if (code.type === 'free_shipping' && appliedDiscounts.some(d => d.type === 'free_shipping')) {
      setDiscountError("Only one free shipping code can be applied");
      return;
    }

    // Check if code is active
    if (!code.isActive) {
      setDiscountError("This discount code is not active");
      return;
    }

    // Check if code has started
    if (code.startDate && new Date(code.startDate) > new Date()) {
      setDiscountError("This discount code is not yet valid");
      return;
    }

    // Check if code has expired
    if (code.endDate && new Date(code.endDate) < new Date()) {
      setDiscountError("This discount code has expired");
      return;
    }

    // Check minimum order amount
    if (code.minimumOrder > 0 && subtotal < code.minimumOrder) {
      setDiscountError(`Minimum order of £${code.minimumOrder.toFixed(2)} required for this discount`);
      return;
    }

    // Check usage limit
    if (code.maxUses > 0 && code.currentUses >= code.maxUses) {
      setDiscountError("This discount code has reached its usage limit");
      return;
    }

    // Apply the discount
    setAppliedDiscounts(prev => [...prev, code]);
    setDiscountCode("");
    setDiscountError("");
    
    const discountText = code.type === 'free_shipping' 
      ? 'Free Shipping'
      : code.type === 'percentage' 
        ? code.value + '% off'
        : '£' + code.value.toFixed(2) + ' off';
    
    toast({
      title: "Discount Applied!",
      description: `${code.description} - ${discountText}`,
    });
  };

  const removeDiscount = (discountId: string) => {
    setAppliedDiscounts(prev => prev.filter(d => d.id !== discountId));
    setDiscountError("");
    toast({
      title: "Discount Removed",
      description: "Discount code has been removed from your order.",
    });
  };

  const removeAllDiscounts = () => {
    setAppliedDiscounts([]);
    setDiscountCode("");
    setDiscountError("");
    toast({
      title: "All Discounts Removed",
      description: "All discount codes have been removed from your order.",
    });
  };

  const handlePaymentSuccess = async (paymentData: PaymentData) => {
    try {
      setProcessing(true);
      
      // Create order data
      const orderData = {
        customerInfo: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          postcode: customerInfo.postcode,
          country: customerInfo.country
        },
        appliedDiscounts: appliedDiscounts.map(d => ({
          code: d.code,
          type: d.type,
          value: d.value,
          description: d.description
        })),
        paymentIntentId: paymentData.paymentIntentId
      };

      // Create order using orderService
      const order = await orderService.createOrder(orderData);

      // Clear cart after successful order creation
      await clearCart();
      
      // Navigate to order confirmation with order data
      navigate('/order-confirmation', { 
        state: { 
          orderData: order,
          isProductOrder: true
        } 
      });

      toast({
        title: "Order confirmed!",
        description: "Thank you for your purchase. Your order has been confirmed.",
      });
    } catch (error: any) {
      console.error('Order creation error:', error);
      toast({
        title: "Order processing failed",
        description: error.message || "There was an error processing your order. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const isFormValid = customerInfo.name && customerInfo.email && customerInfo.address && 
                     customerInfo.city && customerInfo.postcode;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">Complete your purchase</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Customer Information */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={customerInfo.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="postcode">Postcode *</Label>
                      <Input
                        id="postcode"
                        value={customerInfo.postcode}
                        onChange={(e) => handleInputChange('postcode', e.target.value)}
                        placeholder="Enter postcode"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={customerInfo.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="United Kingdom"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-secondary rounded">
                        <img 
                          src={item.product.image_url || '/placeholder.svg'} 
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × £{item.product.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="font-medium">
                        £{(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>£{subtotal.toLocaleString()}</span>
                    </div>
                    {appliedDiscounts.map((discount) => (
                      <div key={discount.id} className="flex justify-between text-green-600">
                        <span>{discount.type === 'free_shipping' ? 'Free Shipping' : `Discount (${discount.code})`}</span>
                        <span>
                          {discount.type === 'free_shipping' 
                            ? `-£${shipping.toFixed(2)}` 
                            : discount.type === 'percentage'
                              ? `-£${((subtotal * discount.value) / 100).toFixed(2)}`
                              : `-£${Math.min(discount.value, subtotal).toFixed(2)}`
                          }
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{finalShipping === 0 ? 'Free' : `£${finalShipping.toFixed(2)}`}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>£{total.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {subtotal < 50 && (
                    <p className="text-sm text-muted-foreground">
                      Add £{(50 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  )}
                </div>
              </Card>

              {/* Discount Code Section */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Discount Codes</h2>
                  {appliedDiscounts.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={removeAllDiscounts}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove All
                    </Button>
                  )}
                </div>
                
                {appliedDiscounts.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {appliedDiscounts.map((discount) => (
                      <div key={discount.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-800">{discount.code}</p>
                            <p className="text-sm text-green-600">{discount.description}</p>
                            <p className="text-sm text-green-600">
                              {discount.type === 'free_shipping' 
                                ? `Free Shipping: £${shipping.toFixed(2)} saved`
                                : `Savings: £${discount.type === 'percentage' 
                                    ? ((subtotal * discount.value) / 100).toFixed(2)
                                    : Math.min(discount.value, subtotal).toFixed(2)}`
                              }
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removeDiscount(discount.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {(appliedDiscounts.length === 0 || appliedDiscounts.some(d => d.isStackable)) && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter discount code"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value);
                          setDiscountError("");
                        }}
                        className={discountError ? "border-red-500" : ""}
                      />
                      <Button 
                        onClick={validateDiscountCode}
                        disabled={!discountCode.trim()}
                        variant="outline"
                      >
                        Apply
                      </Button>
                    </div>
                    {discountError && (
                      <p className="text-sm text-red-600">{discountError}</p>
                    )}
                  </div>
                )}
              </Card>

              {/* Payment Section */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Payment</h2>
                {isFormValid ? (
                  <>
                    {processing && (
                      <div className="text-center py-4 mb-4">
                        <Loader className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Processing your order...</p>
                      </div>
                    )}
                    <StripePaymentButton
                      amount={Math.round(total * 100)} // Convert to pence
                      currency="gbp"
                      description={`Purchase of ${items.length} item(s)`}
                      customerEmail={customerInfo.email}
                      onSuccess={handlePaymentSuccess}
                      onError={(error) => {
                        console.error('Payment error:', error);
                        setProcessing(false);
                        toast({
                          title: "Payment failed",
                          description: error.message || "Please try again.",
                          variant: "destructive",
                        });
                      }}
                      disabled={processing}
                    />
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      Please fill in all required shipping information to continue.
                    </p>
                    <Button disabled variant="outline">
                      Complete Payment
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;