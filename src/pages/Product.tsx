import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/home/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProductById } from "@/lib/products";
import { useCart } from "@/context/CartContext";

const Product = () => {
  const params = useParams();
  const id = params.id as string;
  const product = getProductById(id);

  const { addToCart } = useCart();

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
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
            </Card>

            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-sm text-muted-foreground mb-4">{product.set} • {product.serialNumber ?? "No serial"}</p>
              <div className="text-3xl font-bold text-primary mb-6">£{product.price.toLocaleString()}</div>
              <p className="text-muted-foreground mb-6">{product.description}</p>

              <div className="flex gap-4">
                <Button variant="premium" onClick={() => addToCart(product)}>Add to Cart</Button>
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
