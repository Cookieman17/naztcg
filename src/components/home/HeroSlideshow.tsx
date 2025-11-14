import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import slide1 from "@/assets/Slideshow/slide 1 .jpg";
import slide2 from "@/assets/Slideshow/slide 2 .jpg";
import slide3 from "@/assets/Slideshow/slide 3 .jpg";
import slide4 from "@/assets/Slideshow/slide 4 .jpg";
import slide5 from "@/assets/Slideshow/slide 5 .jpg";
import slide6 from "@/assets/Slideshow/slide 6 .jpg";
import slide7 from "@/assets/Slideshow/slide 7 .jpg";
import slide8 from "@/assets/Slideshow/slide 8.jpg";
import slide10 from "@/assets/Slideshow/slide 10 .jpg";
import slide11 from "@/assets/Slideshow/slide 11.jpg";

const images = [slide1, slide2, slide3, slide4, slide5, slide6, slide7, slide8, slide10, slide11];

const HeroSlideshow = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row items-stretch gap-4">
          <div className="md:w-2/5 bg-secondary/10 p-8 flex flex-col justify-center items-start rounded-lg">
            <div className="inline-flex items-center gap-2 bg-accent/20 px-3 py-1 rounded-full mb-4">
              <span className="text-xs font-semibold text-accent">Featured</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold mb-3">Explore Graded Cards</h3>
            <p className="text-base text-muted-foreground mb-6">Discover professionally graded cards, updated daily. Secure, authenticated, and ready for collectors.</p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Certified grading & tamper-proof slab</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Fast, tracked shipping</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Verified authenticity</span>
              </li>
            </ul>

            <Link to="/shop">
              <Button variant="premium" size="lg" className="px-6 py-4 text-lg">Shop Now</Button>
            </Link>
          </div>

          <div className="md:w-3/5 flex items-center">
            <div className="relative rounded-lg overflow-hidden md:ml-auto max-w-[560px] w-full">
              {images.map((src, i) => (
                <div key={i} className={`${i === index ? "opacity-100" : "opacity-0 absolute inset-0"} transition-opacity duration-700`}>
                  <div style={{ paddingTop: '100%' }} className="w-full relative">
                    <img src={src} alt={`slide-${i}`} className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                </div>
              ))}
              <div className="absolute bottom-3 left-1/2 md:left-auto md:right-3 md:translate-x-0 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setIndex(i)} className={`w-3 h-3 rounded-full ${i === index ? "bg-primary" : "bg-primary/40"}`} aria-label={`Go to slide ${i + 1}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSlideshow;
