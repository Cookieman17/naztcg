import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/home/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, QrCode, CheckCircle2, Calendar, User } from "lucide-react";

const Verify = () => {
  const [serialNumber, setSerialNumber] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock verification result - replace with real API call later
    setVerificationResult({
      cardName: "Charizard Base Set Holo",
      set: "Base Set",
      grade: 10,
      serialNumber: serialNumber || "NAZ-2024-001234",
      dateGraded: "March 15, 2024",
      graderInitials: "JD",
      centering: "10",
      corners: "10",
      edges: "10",
      surface: "10",
      image: "/placeholder.svg",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold mb-4">Verify Graded Card</h1>
              <p className="text-lg text-muted-foreground">
                Enter the serial number or scan the QR code to verify authenticity
              </p>
            </div>

            <Card className="p-8 shadow-card mb-8">
              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <Label htmlFor="serial">Serial Number</Label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="serial"
                        placeholder="NAZ-2024-XXXXXX"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                    <Button type="submit" variant="premium">
                      Verify
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full" size="lg">
                  <QrCode className="mr-2" />
                  Scan QR Code
                </Button>
              </form>
            </Card>

            {verificationResult && (
              <Card className="p-8 shadow-card-hover border-accent/50">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                  <CheckCircle2 className="w-8 h-8 text-accent" />
                  <div>
                    <h2 className="text-2xl font-bold">Verified Authentic</h2>
                    <p className="text-muted-foreground">This card is certified by NAZ Grading</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="aspect-[3/4] bg-secondary rounded-lg mb-4 relative">
                      <img 
                        src={verificationResult.image} 
                        alt={verificationResult.cardName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute top-4 right-4 bg-accent text-accent-foreground font-bold text-2xl px-4 py-2 rounded-full shadow-premium">
                        {verificationResult.grade}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{verificationResult.cardName}</h3>
                      <p className="text-muted-foreground">{verificationResult.set}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Centering</p>
                        <p className="text-2xl font-bold">{verificationResult.centering}</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Corners</p>
                        <p className="text-2xl font-bold">{verificationResult.corners}</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Edges</p>
                        <p className="text-2xl font-bold">{verificationResult.edges}</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Surface</p>
                        <p className="text-2xl font-bold">{verificationResult.surface}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <Search className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Serial Number</p>
                          <p className="font-mono font-semibold">{verificationResult.serialNumber}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date Graded</p>
                          <p className="font-semibold">{verificationResult.dateGraded}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Grader</p>
                          <p className="font-semibold">{verificationResult.graderInitials}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Verify;
