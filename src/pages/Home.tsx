import Navigation from "@/components/Navigation";
import Hero from "@/components/home/Hero";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import ScrollingBanner from "@/components/home/ScrollingBanner";
import WhatIsGrading from "@/components/home/WhatIsGrading";
import HowItWorks from "@/components/home/HowItWorks";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import FAQ from "@/components/home/FAQ";
import Footer from "@/components/home/Footer";
import ProfileCard from "@/components/ProfileCard";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <ScrollingBanner />
      <HeroSlideshow />
      <WhatIsGrading />
      <HowItWorks />
      <WhyChooseUs />
      <FAQ />
      
      {/* Profile Card Section */}
      <div className="py-16 px-4 flex justify-center">
        <ProfileCard
          name=""
          title=""
          handle=""
          status=""
          contactText=""
          avatarUrl="/src/assets/Shiny.jpeg"
          showUserInfo={false}
          enableTilt={true}
          enableMobileTilt={false}
          onContactClick={() => console.log('Contact clicked')}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default Home;
