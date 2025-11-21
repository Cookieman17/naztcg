import Navigation from "@/components/Navigation";
import Hero from "@/components/home/Hero";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import ScrollingBanner from "@/components/home/ScrollingBanner";
import WhatIsGrading from "@/components/home/WhatIsGrading";
import Carousel from "@/components/Carousel";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import FAQ from "@/components/home/FAQ";
import Footer from "@/components/home/Footer";
import ProfileCard from "@/components/ProfileCard";
import ShinyImage from "@/assets/Shiny.jpeg";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <ScrollingBanner />
      <HeroSlideshow />
      <WhatIsGrading />
      <div className="py-16 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Discover our professional card grading process and premium services
            </p>
          </div>
          <div style={{ height: '600px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Carousel
              baseWidth={350}
              autoplay={true}
              autoplayDelay={4000}
              pauseOnHover={true}
              loop={true}
              round={false}
            />
          </div>
        </div>
      </div>
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
          avatarUrl={ShinyImage}
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
