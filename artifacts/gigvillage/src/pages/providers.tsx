import { useState } from "react";
import { useListProviders } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Search, MapPin, Star, ShieldCheck, Briefcase
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Providers() {
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");

  const { data: providers, isLoading } = useListProviders({ skill, location }, {
    query: {
      queryKey: ["providers", skill, location]
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-4">Providers Directory</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Meet the skilled individuals driving our local economy. Browse verified profiles and connect with trusted talent.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-card border rounded-xl p-4 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search by skill (e.g. Cooking, Repair)..." 
              className="pl-9"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              data-testid="input-search-skill"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Location" 
              className="pl-9"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              data-testid="input-provider-location"
            />
          </div>
        </div>
      </div>

      {/* Provider Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : providers?.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No providers found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Try adjusting your search criteria to find available service providers.
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => { setSkill(""); setLocation(""); }}
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers?.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow border-border/50">
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarImage src={provider.avatar} alt={provider.name} />
                      <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                        {provider.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Link href={`/providers/${provider.id}`} className="hover:text-primary transition-colors">
                      <h3 className="text-lg font-bold truncate" data-testid={`text-provider-name-${provider.id}`}>
                        {provider.name}
                      </h3>
                    </Link>
                    {provider.isVerified && (
                      <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{provider.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-secondary text-secondary" />
                          <span className="font-medium text-foreground">{provider.rating ? provider.rating.toFixed(1) : "New"}</span>
                          <span className="text-muted-foreground">({provider.reviewCount || 0})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4 py-3 border-y border-border/50">
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Gigs</span>
                      <span className="font-bold text-foreground">{provider.completedGigs || 0}</span>
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-xs text-muted-foreground mb-1">Joined</span>
                      <span className="font-bold text-foreground text-sm">{new Date(provider.joinedAt).getFullYear()}</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                    {provider.bio}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {provider.skills.map(s => (
                      <Badge key={s} variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 border border-primary/10">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
