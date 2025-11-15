import Footer from "@/components/home/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">About NAZ Grading</h1>
            <p className="text-lg text-muted-foreground mb-6">NAZ Grading provides professional card authentication and grading services with a focus on accuracy, security, and fast turnaround. Our team of expert graders and our verification systems ensure collectors can buy and sell with confidence.</p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">Our Location</h2>
            <p className="text-sm text-muted-foreground">Based in Brighton, England. We operate from a secure grading facility and ship worldwide.</p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">Contact</h2>
            <p className="text-sm text-muted-foreground">For enquiries, please use the contact form on the site or email support@nazgrading.example (placeholder).</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
