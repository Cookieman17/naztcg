const ScrollingBanner = () => {
  const messages = [
    "NAZ TCG • Professional Card Authentication",
    "Expert Grading • Trusted by Collectors Worldwide", 
    "Fast Turnaround • Secure Processing",
    "Industry Standards • Certified Authentication",
    "Premium Quality • Reliable Results"
  ];

  return (
    <div className="bg-accent overflow-hidden py-3 relative">
      <div className="flex animate-scroll whitespace-nowrap">
        {/* First set of messages */}
        <div className="flex space-x-8 text-accent-foreground font-semibold text-lg">
          {messages.map((message, index) => (
            <span key={`first-${index}`} className="px-4">
              {message}
            </span>
          ))}
        </div>
        {/* Duplicate set for seamless loop */}
        <div className="flex space-x-8 text-accent-foreground font-semibold text-lg">
          {messages.map((message, index) => (
            <span key={`second-${index}`} className="px-4">
              {message}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollingBanner;