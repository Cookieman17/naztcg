import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/home/Footer";
import StripePayment from "@/components/StripePayment";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Clock, Zap, Award, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Submit = () => {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState("standard");
  const [cardCount, setCardCount] = useState<number>(1);
  const [diamondSleeve, setDiamondSleeve] = useState<boolean>(false);
  const [showPayment, setShowPayment] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "", 
    phone: "",
    address: "",
    notes: ""
  });
  const DIAMOND_SLEEVE_PRICE = 50; // per card

  const tiers = [
    {
      id: "standard",
      name: "Standard Service",
      price: 15,
      turnaround: "10-15 business days",
      icon: Check,
      features: [
        "Professional grading",
        "Protective slab",
        "Serial number & QR code",
        "Insurance up to £500",
      ],
    },
    {
      id: "express",
      name: "Express Service",
      price: 30,
      turnaround: "5-7 business days",
      icon: Clock,
      popular: true,
      features: [
        "Priority handling",
        "Professional grading",
        "Protective slab",
        "Serial number & QR code",
        "Insurance up to £1,000",
      ],
    },
    {
      id: "super-express",
      name: "Super Express",
      price: 50,
      turnaround: "2-3 business days",
      icon: Zap,
      features: [
        "Highest priority",
        "Professional grading",
        "Protective slab",
        "Serial number & QR code",
        "Insurance up to £2,500",
      ],
    },
  ];

  // Special Diamond Tier (displayed as a full-width row beneath the 3-column tiers)
  const diamondTier = {
    id: "diamond",
    name: "Diamond Tier",
    price: 750,
    turnaround: "Premium 1-2 business days",
    icon: Award,
    features: [
      "Diamond-incrusted NAZ verified sleeve",
      "Top-priority handling",
      "Premium display casing",
      "Insurance up to £10,000",
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    
    setFormData({
      name: form.get("name") as string,
      email: form.get("email") as string,
      phone: form.get("phone") as string,
      address: form.get("address") as string,
      notes: form.get("notes") as string || ""
    });
    
    setShowPayment(true);
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    toast({
      title: "Order Confirmed!",
      description: `Payment successful! Order ID: ${paymentIntentId}. Check your email for shipping instructions.`,
    });
    // Here you would typically redirect to a success page or reset the form
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  // Calculate total cost
  const getTotalCost = () => {
    const selectedTierData = [...tiers, diamondTier].find(t => t.id === selectedTier);
    const tierPrice = selectedTierData?.price || 0;
    const sleevePrice = diamondSleeve ? DIAMOND_SLEEVE_PRICE : 0;
    const perCardCost = tierPrice + sleevePrice;
    return perCardCost * cardCount;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Payment Section */}
            {showPayment && (
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <Button 
                    variant="outline" 
                    onClick={handlePaymentCancel}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Form
                  </Button>
                  <h2 className="text-2xl font-bold">Complete Your Order</h2>
                </div>
                
                <StripePayment
                  amount={getTotalCost()}
                  currency="gbp"
                  metadata={{
                    tier: selectedTier,
                    cardCount,
                    customerName: formData.name,
                    customerEmail: formData.email,
                    diamondSleeve
                  }}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
                
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <p>After payment, we'll email you shipping instructions and a prepaid label.</p>
                </div>
              </div>
            )}

            {!showPayment && (
              <>
                <div className="mb-12 text-center">
                  <h1 className="text-4xl font-bold mb-4">Submit Cards for Grading</h1>
                  <p className="text-lg text-muted-foreground">
                    Choose your service tier and complete the submission form
                  </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-6">
              {tiers.map((tier) => {
                const Icon = tier.icon;
                const isSelected = selectedTier === tier.id;
                
                return (
                  <Card
                    key={tier.id}
                    className={`p-6 cursor-pointer transition-all relative ${
                      isSelected 
                        ? "ring-2 ring-accent shadow-premium" 
                        : "shadow-card hover:shadow-card-hover"
                    }`}
                    onClick={() => setSelectedTier(tier.id)}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <Icon className="w-12 h-12 text-accent mx-auto mb-3" />
                      <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                      <div className="text-3xl font-bold mb-1">
                        £{tier.price}
                        <span className="text-sm font-normal text-muted-foreground">/card</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{tier.turnaround}</p>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-accent shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <RadioGroup value={selectedTier} onValueChange={setSelectedTier}>
                      <div className="flex items-center justify-center">
                        <RadioGroupItem value={tier.id} id={tier.id} />
                        <Label htmlFor={tier.id} className="ml-2 cursor-pointer">
                          Select this tier
                        </Label>
                      </div>
                    </RadioGroup>
                  </Card>
                );
                  })}
                </div>

                {/* Diamond tier row (full-width) */}
                <div className="mb-12">
              <Card
                className={`p-6 cursor-pointer transition-all relative diamond-card ${
                  selectedTier === diamondTier.id ? "ring-2 ring-accent shadow-premium" : "shadow-card hover:shadow-card-hover"
                }`}
                onClick={() => setSelectedTier(diamondTier.id)}
              >
                {/* Glossy overlay and shimmer */}
                <div className="diamond-gloss" aria-hidden />
                <div className="diamond-shimmer" aria-hidden />

                {/* sparkles positioned absolutely */}
                <div className="diamond-sparkle" style={{ left: '12%', top: '18%', animationDelay: '0s' }} aria-hidden />
                <div className="diamond-sparkle" style={{ left: '36%', top: '8%', animationDelay: '0.6s' }} aria-hidden />
                <div className="diamond-sparkle" style={{ left: '64%', top: '22%', animationDelay: '1.2s' }} aria-hidden />
                <div className="diamond-sparkle" style={{ left: '78%', top: '48%', animationDelay: '0.9s' }} aria-hidden />
                <div className="diamond-sparkle" style={{ left: '52%', top: '62%', animationDelay: '1.6s' }} aria-hidden />

                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-3 mb-3">
                      <Award className="w-6 h-6 text-accent" />
                      <h3 className="text-xl font-bold">{diamondTier.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{diamondTier.turnaround}</p>

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-4">
                      {diamondTier.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-accent shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="w-full md:w-56 text-right">
                    <div className="text-3xl font-bold mb-2">£{diamondTier.price}</div>
                    <div className="mb-4 text-sm text-muted-foreground">{diamondTier.turnaround}</div>

                    <RadioGroup value={selectedTier} onValueChange={setSelectedTier}>
                      <div className="flex items-center justify-end">
                        <RadioGroupItem value={diamondTier.id} id={diamondTier.id} />
                        <Label htmlFor={diamondTier.id} className="ml-2 cursor-pointer">
                          Select Diamond Tier
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                  </Card>
                </div>

                <Card className="p-8 shadow-card">
              <h2 className="text-2xl font-bold mb-6">Submission Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" placeholder="Ash Ketchum" required />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" placeholder="ash@pokemon.com" required />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="07700 900123" required />
                  </div>
                  
                    <div>
                      <Label htmlFor="cardCount">Number of Cards *</Label>
                      <Input 
                        id="cardCount" 
                        name="cardCount"
                        type="number" 
                        min="1" 
                        value={cardCount} 
                        onChange={(e) => setCardCount(Number(e.target.value) || 1)} 
                        placeholder="5" 
                        required 
                      />
                    </div>
                </div>

                <div>
                  <Label htmlFor="address">Shipping Address *</Label>
                  <Textarea 
                    id="address" 
                    name="address"
                    placeholder="1 Pallet Town Road, Kanto, London, SW1A 1AA"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea 
                    id="notes" 
                    name="notes"
                    placeholder="Any special handling requirements or notes about your cards..."
                    rows={4}
                  />
                </div>

                <div className="bg-secondary/50 rounded-lg p-6 relative diamond-card">
                  {/* overlays for sparkle */}
                  <div className="diamond-gloss" aria-hidden />
                  <div className="diamond-shimmer" aria-hidden />
                  <div className="diamond-sparkle" style={{ left: '18%', top: '22%', animationDelay: '0.2s' }} aria-hidden />
                  <div className="diamond-sparkle" style={{ left: '42%', top: '12%', animationDelay: '0.8s' }} aria-hidden />
                  <div className="diamond-sparkle" style={{ left: '72%', top: '36%', animationDelay: '1.4s' }} aria-hidden />

                  <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center gap-3">
                      <input id="diamondSleeve" type="checkbox" checked={diamondSleeve} onChange={(e) => setDiamondSleeve(e.target.checked)} className="w-4 h-4" />
                      <span className="text-sm">Add NAZ Diamond Sleeve</span>
                    </label>
                    <span className="text-sm text-muted-foreground">+£{DIAMOND_SLEEVE_PRICE} per card</span>
                  </div>

                  {
                    /* compute prices */
                  }
                  
                  {
                    (() => {
                      const tierPrice = tiers.find(t => t.id === selectedTier)?.price ?? 0;
                      const perCard = tierPrice + (diamondSleeve ? DIAMOND_SLEEVE_PRICE : 0);
                      const total = perCard * (cardCount || 0);
                      return (
                        <>
                          <h3 className="font-semibold mb-2">Estimated Total</h3>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-accent">£{perCard.toLocaleString()}</span>
                            <span className="text-muted-foreground">per card</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">Estimated order total: <strong>£{total.toLocaleString()}</strong></p>
                        </>
                      );
                    })()
                  }
                  
                </div>

                <Button type="submit" variant="premium" size="lg" className="w-full premium-button">
                  Proceed to Payment - £{getTotalCost().toFixed(2)}
                </Button>
                  </form>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Submit;
