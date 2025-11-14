import Navigation from "@/components/Navigation";
import Footer from "@/components/home/Footer";
import { useCart } from "@/context/CartContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Cart = () => {
  const { items, removeFromCart, clearCart, totalItems } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Your Cart</h1>
            <p className="text-muted-foreground">{totalItems} item(s)</p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Your cart is empty</div>
          ) : (
            <div className="space-y-4">
              {items.map(({ product, quantity }) => (
                <Card key={product.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-secondary">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-sm text-muted-foreground">Qty: {quantity}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="font-bold">£{(product.price * quantity).toLocaleString()}</div>
                    <Button variant="outline" onClick={() => removeFromCart(product.id)}>Remove</Button>
                  </div>
                </Card>
              ))}

              <div className="flex justify-between items-center">
                <Button variant="destructive" onClick={clearCart}>Clear Cart</Button>
                <Button variant="premium">Proceed to Checkout</Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
