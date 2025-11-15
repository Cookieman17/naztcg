import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/naz-logo.jpg";
import { Shield, Award, Clock } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      {/* Background pattern similar to TAG's clean aesthetic */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 25% 25%, hsl(0 72% 51%) 0%, transparent 50%), radial-gradient(circle at 75% 75%, hsl(0 84% 60%) 0%, transparent 50%)',
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="container-narrow relative z-10 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Badge similar to TAG's style */}
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-8 backdrop-blur-sm border border-primary/20">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Professional Card Authentication & Grading</span>
          </div>

          {/* Main heading with TAG-inspired typography */}
          <h1 className="heading-xl mb-8 text-gradient max-w-4xl mx-auto">
            Understand Every Grade.<br />
            <span className="text-foreground">Completely Transparent.</span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Revolutionary grading technology that brings transparency and precision to card authentication. 
            Join the future of collectible card grading with crystal-clear results.
          </p>

          {/* CTA buttons with TAG styling */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/submit">
              <Button variant="premium" size="lg" className="premium-button hover-glow text-lg px-10 py-4 h-auto min-w-[200px]">
                Submit Now
              </Button>
            </Link>
            <Link to="/shop">
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-10 py-4 h-auto min-w-[200px] hover-lift"
              >
                Browse Graded Cards
              </Button>
            </Link>
          </div>

          {/* Feature cards with glass effect */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="glass-card rounded-xl p-8 hover-lift tag-glow">
              <Shield className="w-12 h-12 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-3">Certified Authentication</h3>
              <p className="text-muted-foreground">Advanced technology ensures every grade is accurate, consistent, and trustworthy.</p>
            </div>
            <div className="glass-card rounded-xl p-8 hover-lift tag-glow">
              <Award className="w-12 h-12 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-3">Industry Standards</h3>
              <p className="text-muted-foreground">1-10 grading scale with precise scoring and detailed digital reports.</p>
            </div>
            <div className="glass-card rounded-xl p-8 hover-lift tag-glow">
              <Clock className="w-12 h-12 text-primary mb-4 mx-auto" />
              <h3 className="font-semibold text-xl mb-3">Crystal Clear Results</h3>
              <p className="text-muted-foreground">Transparent encapsulation with grade inscribed directly on the slab.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating logo similar to TAG's hero */}
      <div className="absolute top-20 right-8 opacity-20 hidden lg:block">
        <img src={heroImage} alt="" className="w-32 h-32 rounded-full object-cover" />
      </div>
    </section>
  );
};

export default Hero;
