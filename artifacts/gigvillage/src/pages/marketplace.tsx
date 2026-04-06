import { useState } from "react";
import { useListGigs, useGetGigCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Search, MapPin, Star, Filter, ArrowRight 
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const { data: gigs, isLoading } = useListGigs({ search, category, location }, {
    query: {
      queryKey: ["gigs", search, category, location]
    }
  });

  const { data: categories } = useGetGigCategories({
    query: {
      queryKey: ["gigCategories"]
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4">Service Marketplace</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Discover skilled individuals in your community offering quality services. Support local talent and build a stronger economy.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-card border rounded-xl p-4 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search for services..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-gigs"
            />
          </div>
          <div className="md:col-span-3 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Location" 
              className="pl-9"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              data-testid="input-location"
            />
          </div>
          <div className="md:col-span-4 flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <Button 
              variant={category === "" ? "default" : "outline"} 
              onClick={() => setCategory("")}
              className="whitespace-nowrap"
              data-testid="btn-filter-all"
            >
              All
            </Button>
            {categories?.map((cat) => (
              <Button 
                key={cat}
                variant={category === cat ? "default" : "outline"} 
                onClick={() => setCategory(cat)}
                className="whitespace-nowrap"
                data-testid={`btn-filter-${cat}`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Gig Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden border-none shadow-sm">
              <Skeleton className="h-48 w-full rounded-none" />
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-6" />
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : gigs?.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No services found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Try adjusting your search criteria or location to find available services in your area.
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => { setSearch(""); setCategory(""); setLocation(""); }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {gigs?.map((gig, index) => (
            <motion.div
              key={gig.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow group cursor-pointer border-border/50">
                <div className="relative h-48 overflow-hidden bg-muted">
                  {gig.imageUrl ? (
                    <img 
                      src={gig.imageUrl} 
                      alt={gig.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary/10 flex items-center justify-center">
                      <BriefcaseIcon category={gig.category} className="w-12 h-12 text-secondary/40" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-background/90 backdrop-blur text-foreground font-medium shadow-sm">
                      {gig.category}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    RM {gig.price.toFixed(2)}
                  </div>
                </div>
                
                <CardContent className="p-5 flex-1">
                  <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors" data-testid={`text-gig-title-${gig.id}`}>
                    {gig.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
                    {gig.description}
                  </p>
                  
                  <div className="flex items-center gap-3 mt-auto">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={gig.providerAvatar} alt={gig.providerName} />
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                        {gig.providerName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{gig.providerName}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{gig.location}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-5 pt-0 flex items-center justify-between border-t border-border/50 bg-muted/10 mt-auto">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                    <span>{gig.rating ? gig.rating.toFixed(1) : "New"}</span>
                    <span className="text-muted-foreground font-normal">
                      ({gig.reviewCount || 0})
                    </span>
                  </div>
                  
                  {/* We are making the whole card a fake button for now, later we can add individual pages */}
                  <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 gap-1 rounded-full px-4" data-testid={`btn-book-${gig.id}`} onClick={(e) => {
                    e.stopPropagation();
                  }}>
                    <Link href={`/gigs/${gig.id}`}>Book <ArrowRight className="w-4 h-4" /></Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper component for default icons based on category
function BriefcaseIcon({ category, className }: { category: string, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
