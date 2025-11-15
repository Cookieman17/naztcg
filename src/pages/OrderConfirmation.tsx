import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/home/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Clock, Mail, Download, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // Get order details from URL parameters or localStorage
    const orderData = {
      orderId: searchParams.get('orderId') || `NAZ-${Date.now()}`,
      amount: searchParams.get('amount') || '0',
      service: searchParams.get('service') || 'Standard Service',
      cardCount: searchParams.get('cardCount') || '1',
      customerEmail: searchParams.get('email') || 'customer@example.com',
      hasDiamondSleeve: searchParams.get('diamondSleeve') === 'true',
      timestamp: new Date().toISOString()
    };
    
    setOrderDetails(orderData);
  }, [searchParams]);

  if (!orderDetails) {
    return <div>Loading...</div>;
  }

  const formatAmount = (amount: string) => {
    return `£${(parseInt(amount) / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Success Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="w-16 h-16 text-green-600" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4 text-green-600">Payment Successful!</h1>
              <p className="text-xl text-muted-foreground">
                Your order has been confirmed and is being processed
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              
              {/* Order Summary */}
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Package className="w-6 h-6 text-accent" />
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Order ID:</span>
                    <span className="font-mono text-accent">{orderDetails.orderId}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Service:</span>
                    <span>{orderDetails.service}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Number of Cards:</span>
                    <span>{orderDetails.cardCount}</span>
                  </div>
                  
                  {orderDetails.hasDiamondSleeve && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Diamond Sleeve:</span>
                      <span className="text-accent">✓ Included</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Email:</span>
                    <span className="text-sm">{orderDetails.customerEmail}</span>
                  </div>
                  
                  <div className="flex justify-between py-3 text-xl font-bold text-accent border-t-2">
                    <span>Total Paid:</span>
                    <span>{formatAmount(orderDetails.amount)}</span>
                  </div>
                </div>

                <Button className="w-full mb-4" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                
                <Button className="w-full" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Receipt
                </Button>
              </Card>

              {/* What Happens Next */}
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-accent" />
                  What Happens Next
                </h2>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h3 className="font-semibold mb-1">Confirmation Email</h3>
                      <p className="text-sm text-muted-foreground">
                        You'll receive a confirmation email with shipping instructions within 15 minutes.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h3 className="font-semibold mb-1">Ship Your Cards</h3>
                      <p className="text-sm text-muted-foreground">
                        Follow the provided shipping instructions to send us your cards securely.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h3 className="font-semibold mb-1">Professional Grading</h3>
                      <p className="text-sm text-muted-foreground">
                        Our experts will grade your cards according to industry standards.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div>
                      <h3 className="font-semibold mb-1">Secure Return</h3>
                      <p className="text-sm text-muted-foreground">
                        Your graded cards will be returned in protective slabs with tracking.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/verify">
                  <Button size="lg" className="w-full sm:w-auto">
                    Track Your Order
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                
                <Link to="/submit">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Submit More Cards
                  </Button>
                </Link>
                
                <Link to="/">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Back to Home
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-muted-foreground mt-6">
                Questions? Contact us at{" "}
                <a href="mailto:support@naztcg.com" className="text-accent hover:underline">
                  support@naztcg.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;