import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import { Shield, Clock, Users, TrendingUp, Lock, Globe } from "lucide-react";
import TargetCursor from "@/components/TargetCursor";

const WhyChooseUs = () => {
  const features = [
    {
      icon: Shield,
      title: "Industry Expertise",
      description: "Certified graders with decades of combined experience in card authentication and grading.",
      bgColor: "bg-gradient-to-br from-red-600 to-red-800"
    },
    {
      icon: Clock,
      title: "Fast Turnaround",
      description: "Standard service in 10-15 business days, with express options available for urgent needs.",
      bgColor: "bg-gradient-to-br from-red-500 to-red-700"
    },
    {
      icon: Users,
      title: "Trusted by Thousands",
      description: "Join over 50,000+ satisfied collectors who trust NAZ Grading with their prized cards.",
      bgColor: "bg-gradient-to-br from-red-700 to-red-900"
    },
    {
      icon: TrendingUp,
      title: "Maximize Value",
      description: "High-grade slabs can significantly increase resale value and buyer confidence.",
      bgColor: "bg-gradient-to-br from-red-800 to-red-950"
    },
    {
      icon: Lock,
      title: "Secure Process",
      description: "Fully insured shipping, state-of-the-art facility security, and tamper-evident encapsulation.",
      bgColor: "bg-gradient-to-br from-red-600 to-red-900"
    },
    {
      icon: Globe,
      title: "Global Recognition",
      description: "Our grades are recognized by collectors, dealers, and auction houses worldwide.",
      bgColor: "bg-gradient-to-br from-red-500 to-red-800"
    },
  ];

  return (
    <section className="bg-gradient-hero text-primary-foreground relative">
      <TargetCursor 
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
      />
      
      {/* Header */}
      <div className="text-center py-20 px-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose NAZ Grading?</h2>
        <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
          The trusted choice for serious collectors and investors
        </p>
      </div>

      {/* ScrollStack Animation */}
      <div className="relative">
        <ScrollStack
          itemDistance={50}
          itemScale={0.05}
          itemStackDistance={10}
          stackPosition="20%"
          scaleEndPosition="10%"
          baseScale={0.9}
          useWindowScroll={true}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <ScrollStackItem
                key={index}
                itemClassName={`cursor-target ${feature.bgColor} text-white shadow-2xl`}
              >
                <div className="flex flex-col items-center text-center h-full justify-center">
                  <Icon className="w-16 h-16 mb-6 text-white drop-shadow-lg" />
                  <h3 className="text-3xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-lg text-white/90 max-w-md leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </ScrollStackItem>
            );
          })}
        </ScrollStack>
      </div>
    </section>
  );
};

export default WhyChooseUs;
