import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/home/Footer";
import { useCart } from "@/context/CartContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Loader } from "lucide-react";
import { useState } from "react";

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount, loading, error } = useCart();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow pt-24 pb-12">
          <div className="container mx-auto px-4">
            <div className="text-center py-12">
              <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading your cart...</p>
            </div>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Your Cart</h1>
            <p className="text-muted-foreground">{totalItems} item(s)</p>
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">Your cart is empty</p>
              <Button onClick={() => navigate('/shop')} variant="outline">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const isUpdating = updatingItems.has(item.id);
                return (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-secondary rounded overflow-hidden">
                        <img 
                          src={item.product.image_url || '/placeholder.svg'} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-semibold">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.product.series && `${item.product.series} • `}
                          {item.product.category}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Condition: {item.product.condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-lg font-bold mt-2">
                          £{item.product.price.toLocaleString()} each
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={isUpdating || item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          
                          <div className="w-16 text-center">
                            {isUpdating ? (
                              <Loader className="h-4 w-4 animate-spin mx-auto" />
                            ) : (
                              <span className="font-semibold">{item.quantity}</span>
                            )}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={isUpdating || item.quantity >= item.product.stock_quantity}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right min-w-[100px]">
                          <div className="font-bold text-lg">
                            £{(item.product.price * item.quantity).toLocaleString()}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isUpdating}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}

              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    £{totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <Button variant="destructive" onClick={clearCart} disabled={loading}>
                    Clear Cart
                  </Button>
                  <Button 
                    variant="premium" 
                    onClick={() => navigate('/checkout')}
                    className="flex-1 max-w-xs"
                    disabled={loading || items.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
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
