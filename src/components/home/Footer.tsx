import { Link } from "react-router-dom";
import { Shield, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-accent" />
              <span className="font-bold text-xl">NAZ Grading</span>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Professional Pokémon card authentication and grading services trusted by collectors worldwide.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-primary-foreground/80 hover:text-accent transition-colors">Home</Link></li>
              <li><Link to="/shop" className="text-primary-foreground/80 hover:text-accent transition-colors">Shop</Link></li>
              <li><Link to="/submit" className="text-primary-foreground/80 hover:text-accent transition-colors">Submit for Grading</Link></li>
              <li><Link to="/verify" className="text-primary-foreground/80 hover:text-accent transition-colors">Verify Card</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>Standard Grading</li>
              <li>Express Service</li>
              <li>Bulk Submissions</li>
              <li>Card Authentication</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@nazgrading.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>1-800-NAZ-CARD</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Brighton, England</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} NAZ Grading. All rights reserved.</p>
          <div className="mt-2">
            <Link 
              to="/admin/login" 
              className="text-primary-foreground/40 hover:text-primary-foreground/60 transition-colors text-xs"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
