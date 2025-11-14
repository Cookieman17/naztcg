import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/home/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { products } from "@/lib/products";

const Shop = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filterGrade, setFilterGrade] = useState("all");

  const cards = products;

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         card.set.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = filterGrade === "all" || 
                        (filterGrade === "10" && card.grade === 10) ||
                        (filterGrade === "9-9.5" && (card.grade === 9 || card.grade === 9.5)) ||
                        (filterGrade === "8-8.5" && (card.grade === 8 || card.grade === 8.5)) ||
                        (filterGrade === "ungraded" && card.grade === null);
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Shop Graded Pokémon Cards</h1>
            <p className="text-lg text-muted-foreground">
              Browse our selection of professionally graded cards ready for purchase
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-card mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by card name or set..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-4">
                <Select value={filterGrade} onValueChange={setFilterGrade}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <Card key={card.id} className="overflow-hidden shadow-card hover:shadow-card-hover transition-all">
                <div className="aspect-[3/4] bg-secondary relative">
                  <img 
                    src={card.image} 
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground font-bold px-3 py-1 rounded-full shadow-md">
                    {card.grade !== null ? card.grade : "Ungraded"}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-1">
                    <Link to={`/product/${card.id}`} className="hover:underline">
                      {card.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{card.set}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-primary">
                      £{card.price.toLocaleString()}
                    </span>
                    {card.serialNumber && (
                      <span className="text-xs text-muted-foreground">
                        {card.serialNumber}
                      </span>
                    )}
                  </div>
                  
                  <Link to={`/product/${card.id}`}>
                    <Button className="w-full" variant="premium">
                      View Product
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {filteredCards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No cards found matching your criteria</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
