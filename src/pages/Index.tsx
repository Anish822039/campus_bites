import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import FoodCard from '@/components/menu/FoodCard';
import CategoryFilter from '@/components/menu/CategoryFilter';
import { categories } from '@/data/menuData';
import { useFoodItems } from '@/hooks/useFoodItems';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Index: React.FC = () => {
  const { foodItems, loading } = useFoodItems();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = foodItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6">
        {/* Hero Section */}
        <section className="mb-8 animate-slide-up">
          <div className="rounded-2xl gradient-primary p-8 text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary-foreground" />
              <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-primary-foreground" />
            </div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome to CampusBites! 🍽️
              </h1>
              <p className="text-lg opacity-90 mb-6 max-w-xl">
                Order your favorite food digitally. No queues, no waiting. Just delicious food delivered to your table.
              </p>
              
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-card text-foreground border-0 shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </section>

        {/* Menu Grid */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">
              {selectedCategory === 'all' 
                ? 'All Items' 
                : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredItems.length} items
            </span>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No items found matching your search.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
