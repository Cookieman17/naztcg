import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const WhatIsGrading = () => {
  const benefits = [
    "Authentication of card authenticity",
    "Professional condition assessment (1-10 scale)",
    "Protective slab encapsulation",
    "Increased resale value for high-grade cards",
    "Verification via unique serial number & QR code",
    "Tamper-proof protective case",
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What is NAZ Grading?</h2>
            <p className="text-lg text-muted-foreground">
              Professional card authentication and grading service trusted by collectors worldwide
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-8 bg-gradient-card shadow-card hover:shadow-card-hover transition-all">
              <h3 className="text-2xl font-bold mb-4">Professional Grading</h3>
              <p className="text-muted-foreground mb-6">
                Our expert team evaluates each card using industry-standard criteria including centering, 
                corners, edges, and surface quality. Each card receives a grade from 1-10, with 10 being 
                pristine gem mint condition.
              </p>
              <p className="text-muted-foreground">
                Your graded card is then sealed in a protective case with a tamper-evident holder, 
                ensuring long-term preservation and authenticity verification.
              </p>
            </Card>
            
            <Card className="p-8 bg-gradient-card shadow-card hover:shadow-card-hover transition-all">
              <h3 className="text-2xl font-bold mb-4">Why Grade Your Cards?</h3>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsGrading;
