import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "How much does grading cost?",
      answer: "Our pricing varies by service tier. Standard grading starts at £15 per card, Express at £30, and Super Express at £50. Bulk discounts are available for submissions of 20+ cards.",
    },
    {
      question: "How long does the grading process take?",
      answer: "Standard service takes 10-15 business days, Express service 5-7 business days, and Super Express 2-3 business days. Processing times begin once we receive your cards at our facility.",
    },
    {
      question: "What cards do you grade?",
      answer: "We specialize in Pokémon Trading Cards from all sets and languages. We grade both vintage and modern cards, including promotional cards, Japanese cards, and limited editions.",
    },
    {
      question: "How is the grade determined?",
      answer: "Cards are evaluated on four main criteria: Centering, Corners, Edges, and Surface quality. Our expert graders use magnification tools and standardized lighting to assess each card, resulting in a grade from 1 (Poor) to 10 (Gem Mint).",
    },
    {
      question: "Is my card insured during shipping?",
      answer: "Yes! All submissions include insurance coverage up to the declared value of your cards. We recommend using our prepaid shipping labels which include full tracking and insurance.",
    },
    {
      question: "Can I verify a graded card's authenticity?",
      answer: "Absolutely! Every graded card has a unique serial number and QR code. Simply scan the QR code or enter the serial number on our verification page to view the card's complete grading details.",
    },
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our grading service
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card rounded-lg px-6 border shadow-sm"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
