import { Card } from "@/components/ui/card";
import { Shield, Clock, Users, TrendingUp, Lock, Globe } from "lucide-react";
import TargetCursor from "@/components/TargetCursor";

const WhyChooseUs = () => {
  const features = [
    {
      icon: Shield,
      title: "Industry Expertise",
      description: "Certified graders with decades of combined experience in card authentication and grading.",
    },
    {
      icon: Clock,
      title: "Fast Turnaround",
      description: "Standard service in 10-15 business days, with express options available for urgent needs.",
    },
    {
      icon: Users,
      title: "Trusted by Thousands",
      description: "Join over 50,000+ satisfied collectors who trust NAZ Grading with their prized cards.",
    },
    {
      icon: TrendingUp,
      title: "Maximize Value",
      description: "High-grade slabs can significantly increase resale value and buyer confidence.",
    },
    {
      icon: Lock,
      title: "Secure Process",
      description: "Fully insured shipping, state-of-the-art facility security, and tamper-evident encapsulation.",
    },
    {
      icon: Globe,
      title: "Global Recognition",
      description: "Our grades are recognized by collectors, dealers, and auction houses worldwide.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-hero text-primary-foreground">
      <TargetCursor 
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
      />
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose NAZ Grading?</h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            The trusted choice for serious collectors and investors
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="cursor-target p-6 bg-primary-foreground/10 backdrop-blur-sm border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all"
              >
                <Icon className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-primary-foreground/80">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
