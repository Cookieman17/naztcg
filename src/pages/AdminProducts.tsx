import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { firebaseProductService } from "@/lib/firebase-products";
import { Product } from "@/lib/products";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Package,
  DollarSign,
  Eye,
  AlertTriangle,
  Cloud,
  Wifi,
  WifiOff
} from "lucide-react";

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [seriesFilter, setSeriesFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    series: "",
    rarity: "",
    stock: "",
    image: "",
    condition: "mint" as const,
    status: "active" as const
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const products = await firebaseProductService.getProducts();
        console.log('🔥 AdminProducts: Loaded products from Firebase:', products.length);
        setProducts(products);
        setFilteredProducts(products);
      } catch (error) {
        console.error('🔥 AdminProducts: Error loading products from Firebase:', error);
        setError('Failed to load products from Firebase. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    // Set up Firebase real-time listener
    const unsubscribe = firebaseProductService.subscribeToProducts((products) => {
      console.log('🔥 AdminProducts: Real-time update from Firebase:', products.length, 'products');
      setProducts(products);
      setFilteredProducts(products);
      setLoading(false);
    });

    loadProducts();

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Filter products based on search, category, and series
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.series && product.series.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.rarity && product.rarity.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    if (seriesFilter !== "all") {
      filtered = filtered.filter(product => product.series === seriesFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter, seriesFilter]);

  const categories = ["Grading", "Trading Cards", "Accessories", "Supplies"];
  const tcgSeries = [
    "Base Set", "Jungle", "Fossil", "Team Rocket", "Gym Heroes", "Gym Challenge",
    "Neo Genesis", "Neo Discovery", "Neo Destiny", "Neo Revelation",
    "Expedition", "Aquapolis", "Skyridge",
    "Ruby & Sapphire", "Sandstorm", "Dragon", "Team Magma vs Team Aqua",
    "Hidden Legends", "FireRed & LeafGreen", "Team Rocket Returns",
    "Deoxys", "Emerald", "Unseen Forces", "Delta Species",
    "Legend Maker", "Holon Phantoms", "Crystal Guardians", "Dragon Frontiers",
    "Power Keepers", "Diamond & Pearl", "Mysterious Treasures", "Secret Wonders",
    "Great Encounters", "Majestic Dawn", "Legends Awakened", "Stormfront",
    "Platinum", "Rising Rivals", "Supreme Victors", "Arceus",
    "HeartGold & SoulSilver", "Unleashed", "Undaunted", "Triumphant",
    "Black & White", "Emerging Powers", "Noble Victories", "Next Destinies",
    "Dark Explorers", "Dragons Exalted", "Boundaries Crossed", "Plasma Storm",
    "Plasma Freeze", "Plasma Blast", "Legendary Treasures",
    "XY", "Flashfire", "Furious Fists", "Phantom Forces", "Primal Clash",
    "Roaring Skies", "Ancient Origins", "BREAKthrough", "BREAKpoint",
    "Generations", "Fates Collide", "Steam Siege", "Evolutions",
    "Sun & Moon", "Guardians Rising", "Burning Shadows", "Crimson Invasion",
    "Ultra Prism", "Forbidden Light", "Celestial Storm", "Dragon Majesty",
    "Lost Thunder", "Team Up", "Detective Pikachu", "Unbroken Bonds",
    "Unified Minds", "Hidden Fates", "Cosmic Eclipse",
    "Sword & Shield", "Rebel Clash", "Darkness Ablaze", "Vivid Voltage",
    "Battle Styles", "Chilling Reign", "Evolving Skies", "Fusion Strike",
    "Brilliant Stars", "Astral Radiance", "Pokemon GO", "Lost Origin",
    "Silver Tempest", "Paldea Evolved", "Obsidian Flames", "151",
    "Paradox Rift", "Paldean Fates", "Temporal Forces", "Twilight Masquerade",
    "Shrouded Fable", "Stellar Crown", "Surging Sparks"
  ];
  const rarities = ["Common", "Uncommon", "Rare", "Rare Holo", "Ultra Rare", "Secret Rare", "Promo"];
  const conditions = [
    { value: "mint", label: "Mint" },
    { value: "near_mint", label: "Near Mint" },
    { value: "lightly_played", label: "Lightly Played" },
    { value: "moderately_played", label: "Moderately Played" },
    { value: "heavily_played", label: "Heavily Played" },
    { value: "damaged", label: "Damaged" }
  ];

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      series: "",
      rarity: "",
      stock: "",
      image: "",
      condition: "mint",
      status: "active"
    });
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        series: formData.series || null,
        rarity: formData.rarity || null,
        stock_quantity: parseInt(formData.stock),
        image_url: formData.image || imagePreview || "/api/placeholder/300/200",
        condition: formData.condition,
        status: formData.status
      };

      if (editingProduct) {
        await firebaseProductService.updateProduct(editingProduct.id, productData);
        console.log('🔥 AdminProducts: Updated product in Firebase:', editingProduct.id);
      } else {
        const newProduct = await firebaseProductService.createProduct(productData);
        console.log('🔥 AdminProducts: Created new product in Firebase:', newProduct.id);
      }
      // Firebase real-time listener will update the UI automatically
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      category: product.category,
      series: product.series || "",
      rarity: product.rarity || "",
      stock: product.stock_quantity.toString(),
      image: product.image_url || "",
      condition: product.condition,
      status: product.status
    });
    setImagePreview(product.image_url || "");
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        setSaving(true);
        setError(null);
        await firebaseProductService.deleteProduct(productId);
        console.log('🔥 AdminProducts: Deleted product from Firebase:', productId);
        // Firebase real-time listener will update the UI automatically
      } catch (error) {
        console.error('🔥 AdminProducts: Error deleting product:', error);
        setError('Failed to delete product. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-800', text: 'Out of Stock' };
    if (stock < 10) return { color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' };
    return { color: 'bg-green-100 text-green-800', text: 'In Stock' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Cloud className="h-3 w-3" />
              Firebase (Real-time)
            </div>
          </div>
          <p className="text-gray-600">
            Manage your product catalog with Firebase real-time synchronization
          </p>
          {error && (
            <div className="mt-2 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2" disabled={loading || saving}>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update product information' : 'Create a new product listing'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">TCG Series</label>
                  <Select
                    value={formData.series}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, series: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select TCG series" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {tcgSeries.map(series => (
                        <SelectItem key={series} value={series}>{series}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Rarity</label>
                  <Select
                    value={formData.rarity}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, rarity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select rarity" />
                    </SelectTrigger>
                    <SelectContent>
                      {rarities.map(rarity => (
                        <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Condition</label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value: "mint" | "near_mint" | "lightly_played" | "moderately_played" | "heavily_played" | "damaged") => setFormData(prev => ({ ...prev, condition: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mint">Mint</SelectItem>
                      <SelectItem value="near_mint">Near Mint</SelectItem>
                      <SelectItem value="lightly_played">Lightly Played</SelectItem>
                      <SelectItem value="moderately_played">Moderately Played</SelectItem>
                      <SelectItem value="heavily_played">Heavily Played</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Price (£)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stock Quantity</label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive") => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Product Image</label>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="cursor-pointer"
                  />
                  <div className="text-sm text-gray-500">
                    Upload from your phone or device. Supported formats: JPG, PNG, GIF
                  </div>
                  
                  {imagePreview && (
                    <div className="mt-4">
                      <label className="text-sm font-medium">Preview:</label>
                      <div className="mt-2 border rounded-lg p-2 bg-gray-50">
                        <img 
                          src={imagePreview} 
                          alt="Product preview" 
                          className="max-w-full h-32 object-cover rounded"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400">
                    Or enter image URL manually:
                  </div>
                  <Input
                    value={formData.image}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, image: e.target.value }));
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products by name, description, series, or rarity..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={seriesFilter} onValueChange={setSeriesFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by series" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="all">All Series</SelectItem>
                  {tcgSeries.map(series => (
                    <SelectItem key={series} value={series}>{series}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock_quantity);
            return (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                  <img
                    src={product.image_url || "/api/placeholder/300/200"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(product.price)}
                      </span>
                      <Badge className={stockStatus.color}>
                        {stockStatus.text}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                      <span>Stock: {product.stock_quantity}</span>
                      <span>{product.category}</span>
                      {product.series && <span>Series: {product.series}</span>}
                      {product.rarity && <span>Rarity: {product.rarity}</span>}
                      <span>Condition: {conditions.find(c => c.value === product.condition)?.label || product.condition}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                      {product.stock_quantity === 0 && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        disabled={saving}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || categoryFilter !== "all" 
                      ? "Try adjusting your search or filter criteria" 
                      : "Start by adding your first product to the catalog"}
                  </p>
                  {!searchTerm && categoryFilter === "all" && (
                    <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Your First Product
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;