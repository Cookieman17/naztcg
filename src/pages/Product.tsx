import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/home/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { firebaseProductService } from "@/lib/firebase-products";
import { Product as ProductType } from "@/lib/products";
import { useCart } from "@/context/CartContext";

const Product = () => {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const foundProduct = await firebaseProductService.getProduct(id);
        console.log('🔥 Product: Loaded from Firebase:', foundProduct?.name);
        setProduct(foundProduct);
      } catch (error) {
        console.error('🔥 Product: Error loading from Firebase:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const { addToCart } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg">Loading product...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24">
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold">Product not found</h2>
            <p className="mt-4">We couldn't find that product.</p>
            <Link to="/shop" className="inline-block mt-6">
              <Button>Back to Shop</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
            <Card className="p-0 overflow-hidden">
              <div className="aspect-square bg-secondary">
                <img 
                  src={product.image_url || '/placeholder.svg'} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
            </Card>

            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  {product.series && `${product.series} • `}
                  {product.category}
                  {product.rarity && ` • ${product.rarity}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Condition: {product.condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
                <p className="text-sm text-muted-foreground">
                  Stock: {product.stock_quantity} available
                </p>
              </div>
              <div className="text-3xl font-bold text-primary mb-6">£{product.price.toLocaleString()}</div>
              <p className="text-muted-foreground mb-6">{product.description}</p>

              <div className="flex gap-4">
                <Button 
                  variant="premium" 
                  onClick={() => addToCart(product)}
                  disabled={product.stock_quantity === 0 || product.status !== 'active'}
                >
                  {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Link to="/shop">
                  <Button variant="outline">Back to Shop</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Product;
