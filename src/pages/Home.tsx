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
      <div className="py-16 px-4 bg-gradient-to-br from-red-900 via-red-800 to-red-700">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-red-100 mb-4">How It Works</h2>
            <p className="text-xl text-red-200 max-w-3xl mx-auto">
              Discover our professional card grading process and premium services
            </p>
          </div>
          <div className="flex justify-center items-center w-full">
            <Carousel
              baseWidth={450}
              autoplay={true}
              autoplayDelay={5000}
              pauseOnHover={true}
              loop={true}
              round={true}
            />
          </div>
        </div>
      </div>
      <WhyChooseUs />
      
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
      
      <FAQ />
      <Footer />
    </div>
  );
};

export default Home;
