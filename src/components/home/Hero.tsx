import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/naz-logo.jpg";
import { Shield, Award, Clock } from "lucide-react";

const Hero = () => {
  return (
    <section className="overflow-hidden">
      {/* Full-bleed hero image */}
      <div className="w-full h-64 md:h-96 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} aria-hidden />

      {/* Content container overlaps the image slightly */}
      <div className="container mx-auto px-4 -mt-20 md:-mt-28 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center">
          {/* Left spacer to push content to the right */}
          <div className="hidden md:block md:w-[35%]" />
          <div className="w-full md:w-[65%] text-right text-primary-foreground bg-transparent">
            <section className="mb-8">
              <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
                <Shield className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Professional Card Authentication</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Authenticate Your Pokémon Cards with Confidence
              </h1>

              <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                Industry-leading grading services backed by expertise, precision, and trust. Join thousands of collectors worldwide.
              </p>
            </section>

            <section className="mb-12 flex flex-col sm:flex-row gap-4 justify-end">
              <Link to="/submit">
                <Button variant="hero" size="lg" className="text-lg px-8 py-6 h-auto">
                  Submit Your Cards
                </Button>
              </Link>
              <Link to="/shop">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6 h-auto bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
                >
                  Browse Graded Cards
                </Button>
              </Link>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 justify-items-end">
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-6 border border-primary-foreground/20 text-right">
                <Shield className="w-10 h-10 text-accent mb-3 mx-auto" />
                <h3 className="font-semibold text-lg mb-2">Certified Authentication</h3>
                <p className="text-sm text-primary-foreground/80">Expert graders with years of experience</p>
              </div>
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-6 border border-primary-foreground/20 text-right">
                <Award className="w-10 h-10 text-accent mb-3 mx-auto" />
                <h3 className="font-semibold text-lg mb-2">Trusted Standards</h3>
                <p className="text-sm text-primary-foreground/80">Industry-recognized grading system</p>
              </div>
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-6 border border-primary-foreground/20 text-right">
                <Clock className="w-10 h-10 text-accent mb-3 mx-auto" />
                <h3 className="font-semibold text-lg mb-2">Fast Turnaround</h3>
                <p className="text-sm text-primary-foreground/80">Quick processing without compromising quality</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
