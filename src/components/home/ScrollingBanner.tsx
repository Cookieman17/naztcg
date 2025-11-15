const ScrollingBanner = () => {
  const messages = [
    { text: "NAZ TCG", style: "filled" },
    { text: "AUTHENTICATE CARDS", style: "outlined" }, 
    { text: "PROFESSIONAL GRADING", style: "filled" },
    { text: "TRUSTED RESULTS", style: "outlined" },
    { text: "EXPERT AUTHENTICATION", style: "filled" }, 
    { text: "QUALITY ASSURANCE", style: "outlined" }
  ];

  return (
    <div className="bg-accent overflow-hidden py-10 mt-20 relative">
      <div className="flex animate-scroll whitespace-nowrap">
        {/* First set of messages */}
        <div className="flex items-center" style={{ gap: '30px', paddingLeft: '30px', paddingRight: '30px' }}>
          {messages.map((message, index) => (
            <span 
              key={`first-${index}`} 
              className={`text-8xl font-black tracking-wider ${
                message.style === 'filled' 
                  ? 'text-white' 
                  : 'text-transparent'
              }`}
              style={message.style === 'outlined' ? {
                WebkitTextStroke: '2px white',
                textStroke: '2px white'
              } : {}}
            >
              {message.text}
            </span>
          ))}
        </div>
        {/* Duplicate set for seamless loop */}
        <div className="flex items-center" style={{ gap: '30px', paddingLeft: '30px', paddingRight: '30px' }}>
          {messages.map((message, index) => (
            <span 
              key={`second-${index}`} 
              className={`text-8xl font-black tracking-wider ${
                message.style === 'filled' 
                  ? 'text-white' 
                  : 'text-transparent'
              }`}
              style={message.style === 'outlined' ? {
                WebkitTextStroke: '2px white',
                textStroke: '2px white'
              } : {}}
            >
              {message.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollingBanner;