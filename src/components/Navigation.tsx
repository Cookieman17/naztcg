import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import nazLogo from "@/assets/NAZ logo no BG.jpg";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const { totalItems } = useCart();
  const [open, setOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // lock body scroll when menu is open
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // focus trap: keep focus inside panel while open
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    panelRef.current.addEventListener('keydown', onKey as any);
    return () => panelRef.current?.removeEventListener('keydown', onKey as any);
  }, [open]);

  return (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--primary)/1)]/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile: Hamburger on left, Logo centered */}
          <div className="md:hidden flex items-center justify-between w-full">
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded-md hover:bg-white/10 text-white"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <Link to="/" className="flex items-center absolute left-1/2 transform -translate-x-1/2">
              <img src={nazLogo} alt="NAZ TCG - National Authentication Zone" className="h-10 w-auto" />
            </Link>
            
            {/* Spacer for balance */}
            <div className="w-10 h-10"></div>
          </div>

          {/* Desktop: Logo on left */}
          <Link to="/" className="hidden md:flex items-center">
            <img src={nazLogo} alt="NAZ TCG - National Authentication Zone" className="h-10 w-auto" />
          </Link>
          
          {/* Desktop navigation menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link 
              to="/shop" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/shop") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Shop
            </Link>
            <Link 
              to="/submit" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/submit") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Submit for Grading
            </Link>
            <Link 
              to="/verify" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/verify") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Verify Card
            </Link>
            <Link to="/submit">
              <Button variant="premium" size="sm">Get Started</Button>
            </Link>

            <Link to="/cart" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-3 bg-destructive text-destructive-foreground text-xs font-semibold rounded-full px-2">{totalItems}</span>
              )}
            </Link>
          </div>

          {/* Desktop-only spacer for alignment */}
          <div className="md:hidden" />
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998
        }}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* Slide-out panel (from the left) */}
      <aside
        className={`fixed top-0 left-0 h-full w-[85%] max-w-xs z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ 
          backgroundColor: '#dc2626',
          borderRight: '1px solid #b91c1c',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 9999
        }}
        aria-hidden={!open}
        role="dialog"
        aria-modal={open}
      >
        <div 
          ref={panelRef} 
          className="flex items-center justify-between p-6"
          style={{ 
            borderBottom: '1px solid #b91c1c',
            backgroundColor: '#dc2626'
          }}
        >
          <Link to="/" onClick={() => setOpen(false)} className="flex items-center">
            <img src={nazLogo} alt="NAZ" className="h-8 w-auto" />
          </Link>
          <button 
            aria-label="Close menu" 
            onClick={() => setOpen(false)} 
            className="p-2 rounded-md hover:bg-red-700"
            style={{ color: '#ffffff' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-4" style={{ backgroundColor: '#dc2626' }}>
          <Link 
            style={{ color: '#ffffff', textDecoration: 'none' }} 
            onClick={() => setOpen(false)} 
            to="/" 
            className="menu-item block text-lg font-medium hover:bg-red-700 py-3 px-2 rounded-md transition-colors"
          >
            Home
          </Link>
          <Link 
            style={{ color: '#ffffff', textDecoration: 'none' }} 
            onClick={() => setOpen(false)} 
            to="/shop" 
            className="menu-item block text-lg font-medium hover:bg-red-700 py-3 px-2 rounded-md transition-colors"
          >
            Shop
          </Link>
          <Link 
            style={{ color: '#ffffff', textDecoration: 'none' }} 
            onClick={() => setOpen(false)} 
            to="/submit" 
            className="menu-item block text-lg font-medium hover:bg-red-700 py-3 px-2 rounded-md transition-colors"
          >
            Submit for Grading
          </Link>
          <Link 
            style={{ color: '#ffffff', textDecoration: 'none' }} 
            onClick={() => setOpen(false)} 
            to="/verify" 
            className="menu-item block text-lg font-medium hover:bg-red-700 py-3 px-2 rounded-md transition-colors"
          >
            Verify Card
          </Link>

          <div className="mt-4 menu-item py-2 px-2">
            <Link to="/submit" onClick={() => setOpen(false)}>
              <Button variant="premium" size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">Get Started</Button>
            </Link>
          </div>

          <div className="mt-6 pt-4 menu-item px-2" style={{ borderTop: '1px solid #b91c1c' }}>
            <Link 
              onClick={() => setOpen(false)} 
              to="/cart" 
              className="flex items-center gap-3 py-3 rounded-md hover:bg-red-700 transition-colors"
              style={{ color: '#ffffff', textDecoration: 'none' }}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="ml-auto bg-white text-red-600 text-xs font-semibold rounded-full px-2 py-1">{totalItems}</span>
              )}
            </Link>
          </div>
        </nav>
      </aside>
    </nav>
  );
};

export default Navigation;
