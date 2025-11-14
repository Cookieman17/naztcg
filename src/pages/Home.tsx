import Navigation from "@/components/Navigation";
import Hero from "@/components/home/Hero";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import WhatIsGrading from "@/components/home/WhatIsGrading";
import HowItWorks from "@/components/home/HowItWorks";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import FAQ from "@/components/home/FAQ";
import Footer from "@/components/home/Footer";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
  <HeroSlideshow />
      <WhatIsGrading />
      <HowItWorks />
      <WhyChooseUs />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Home;
