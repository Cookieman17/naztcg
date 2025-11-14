import { useEffect, useState } from "react";

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

const images = [
  slide1,
  slide2,
  slide3,
  slide4,
  slide5,
  slide6,
  slide7,
  slide8,
  slide10,
  slide11,
];

const Slideshow = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-lg overflow-hidden">
          {images.map((src, i) => (
            <div key={i} className={`${i === index ? "opacity-100" : "opacity-0 absolute inset-0"} transition-opacity duration-700` }>
              <div style={{ paddingTop: '100%' }} className="w-full relative">
                <img
                  src={src}
                  alt={`slide-${i}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-3 h-3 rounded-full ${i === index ? "bg-primary" : "bg-primary/40"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Slideshow;
