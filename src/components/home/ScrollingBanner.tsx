import React from 'react';

const ScrollingBanner = () => {
  const bannerItems = [
    { text: "AUTHENTIC CARD GRADING", style: "outlined" },
    { text: "NAZ CARD GRADING", style: "filled" },
    { text: "PROFESSIONAL AUTHENTICATION", style: "outlined" },
    { text: "TRUSTED BY COLLECTORS", style: "filled" },
    { text: "SECURE VERIFICATION", style: "outlined" },
    { text: "PREMIUM GRADING SERVICES", style: "filled" }
  ];

  const renderBannerText = () => {
    return bannerItems.map((item, index) => (
      <span key={index}>
        <span className={item.style === "outlined" ? "text-outline" : "font-black"}>
          {item.text}
        </span>
        <span className="mx-4">•</span>
      </span>
    ));
  };

  return (
    <section className="bg-accent text-accent-foreground py-6 overflow-hidden relative mt-4">
      <div className="flex animate-scroll whitespace-nowrap">
        <div className="flex items-center text-8xl tracking-wider">
          {Array(3).fill(null).map((_, i) => (
            <div key={i} className="flex items-center">
              {renderBannerText()}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollingBanner;