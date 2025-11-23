import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/home/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { smartProductService } from "@/lib/smart-products";
import { Product } from "@/lib/products";

const Shop = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filterGrade, setFilterGrade] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  // Load products and categories with real-time updates
  useEffect(() => {
    const loadProductsAndCategories = async () => {
      setLoading(true);
      try {
        // Load all active products from smart service
        const allProducts = await smartProductService.getProducts();
        
        // Filter for active products with stock
        const activeProducts = allProducts.filter(product => 
          product.status === 'active' && product.stock_quantity > 0
        );
        
        console.log('🛒 Shop: Loaded products:', activeProducts.length, 'via', smartProductService.getServiceType());
        
        // Extract unique categories from products
        const uniqueCategories = [...new Set(
          activeProducts
            .map(product => product.category)
            .filter(Boolean)
        )];
        setCategories(uniqueCategories);

        // Map products to display format (keeping compatibility with existing UI)
        const displayProducts = activeProducts.map(product => ({
          ...product,
          set: product.series || 'Unknown Set',
          grade: null, // We don't have grade in the new schema
          image: product.image_url || '/placeholder.svg',
          serialNumber: null, // We don't have serial number in the new schema
          stock: product.stock_quantity
        }));
        
        setProducts(displayProducts as any);
      } catch (error) {
        console.error('🛒 Shop: Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    // Set up real-time listener for product updates
    const unsubscribe = smartProductService.subscribeToProducts((allProducts) => {
      // Filter for active products with stock
      const activeProducts = allProducts.filter(product => 
        product.status === 'active' && product.stock_quantity > 0
      );
      
      console.log('🛒 Shop: Update received:', activeProducts.length, 'active products via', smartProductService.getServiceType());
      
      // Extract unique categories
      const uniqueCategories = [...new Set(
        activeProducts
          .map(product => product.category)
          .filter(Boolean)
      )];
      setCategories(uniqueCategories);

      // Map products to display format
      const displayProducts = activeProducts.map(product => ({
        ...product,
        set: product.series || 'Unknown Set',
        grade: null,
        image: product.image_url || '/placeholder.svg',
        serialNumber: null,
        stock: product.stock_quantity
      }));
      
      setProducts(displayProducts as any);
      setLoading(false);
    });

    loadProductsAndCategories();

    return () => {
      unsubscribe();
    };
  }, []);

  const cards = products;

  // Filter products based on search term, grade filter, and category filter
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.set.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.series && product.series.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGrade = filterGrade === 'all' || 
                        (filterGrade === 'ungraded' && !product.grade) ||
                        (filterGrade !== 'ungraded' && product.grade?.toString() === filterGrade);
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesGrade && matchesCategory;
  });

  // Update sorted products when filters change
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'grade':
        const gradeA = a.grade || 0;
        const gradeB = b.grade || 0;
        return gradeB - gradeA;
      default:
        return 0;
    }
  });  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Shop Trading Cards</h1>
            <p className="text-lg text-muted-foreground">
              Browse our selection of authentic trading cards available for purchase
            </p>
            {products.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {products.length} card{products.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>

          <div className="bg-card rounded-lg p-6 shadow-card mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by product name or series..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-4">
          <Select onValueChange={setFilterGrade} defaultValue="all">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              <SelectItem value="10">Grade 10</SelectItem>
              <SelectItem value="9-9.5">Grade 9-9.5</SelectItem>
              <SelectItem value="8-8.5">Grade 8-8.5</SelectItem>
              <SelectItem value="ungraded">Ungraded</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setFilterCategory} defaultValue="all">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="grade">Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-lg">Loading products...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden shadow-card hover:shadow-card-hover transition-all">
                    <div className="aspect-[3/4] bg-secondary relative">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute top-4 right-4 bg-accent text-accent-foreground font-bold px-3 py-1 rounded-full shadow-md">
                        {product.grade !== null ? product.grade : "Ungraded"}
                      </div>
                      {product.rarity && (
                        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {product.rarity}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-bold text-xl mb-1">
                        <Link to={`/product/${product.id}`} className="hover:underline">
                          {product.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">{product.set}</p>
                      <p className="text-xs text-muted-foreground mb-4">Stock: {product.stock}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-primary">
                          £{product.price.toLocaleString()}
                        </span>
                        {product.serialNumber && (
                          <span className="text-xs text-muted-foreground">
                            {product.serialNumber}
                          </span>
                        )}
                      </div>
                      
                      <Link to={`/product/${product.id}`}>
                        <Button className="w-full" variant="premium">
                          View Product
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>

              {sortedProducts.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
                  <p className="text-muted-foreground text-lg mb-4">
                    {products.length === 0 
                      ? "No products have been added to the store yet." 
                      : "No products found matching your criteria."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Products are added through the admin portal and appear here automatically.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
