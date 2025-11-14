import { Card } from "@/components/ui/card";
import { Package, Search, Award, Truck, CheckCircle2 } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Package,
      title: "Submit Your Cards",
      description: "Fill out our online form, select your service tier, and securely ship your cards to our facility.",
    },
    {
      icon: Search,
      title: "Expert Inspection",
      description: "Our certified graders carefully examine each card using professional equipment and years of expertise.",
    },
    {
      icon: Award,
      title: "Grading & Encapsulation",
      description: "Cards are assigned a grade (1-10) and sealed in protective slabs with unique serial numbers.",
    },
    {
      icon: Truck,
      title: "Safe Return Shipping",
      description: "Your graded cards are securely packaged and shipped back to you with full insurance.",
    },
    {
      icon: CheckCircle2,
      title: "Verify Anytime",
      description: "Use our verification system to check authenticity and view grading details via QR code or serial number.",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, transparent process from submission to verification
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={index} 
                className="p-6 bg-gradient-card shadow-card hover:shadow-card-hover transition-all relative"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-accent rounded-full flex items-center justify-center font-bold text-accent-foreground shadow-md">
                  {index + 1}
                </div>
                <Icon className="w-12 h-12 text-accent mb-4 mt-4" />
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
