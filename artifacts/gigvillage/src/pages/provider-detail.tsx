import { useParams, useLocation } from "wouter";
import { useGetProvider, getGetProviderQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ShieldCheck, Briefcase, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function ProviderDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  
  const { data: provider, isLoading } = useGetProvider(id, {
    query: {
      enabled: !!id,
      queryKey: getGetProviderQueryKey(id)
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-32 w-full mb-8 rounded-xl" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <h2 className="text-2xl font-bold">Provider not found</h2>
        <Button onClick={() => setLocation("/providers")} className="mt-4">Back to Directory</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="border-none shadow-md mb-8 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/80 to-secondary/80"></div>
        <CardContent className="p-8 pt-0 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-card border-4 border-card flex items-center justify-center text-3xl font-bold text-primary shadow-sm overflow-hidden">
              {provider.avatar ? (
                <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
              ) : (
                provider.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-serif font-bold">{provider.name}</h1>
                {provider.isVerified && <ShieldCheck className="w-6 h-6 text-green-500" />}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {provider.location}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {format(new Date(provider.joinedAt), "MMM yyyy")}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0 w-full md:w-auto">
              <Button onClick={() => setLocation(`/marketplace?search=${provider.name}`)} className="w-full md:w-auto">View Services</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-border/50 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">{provider.rating ? provider.rating.toFixed(1) : "New"}</div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-secondary text-secondary" /> Rating
              </div>
            </div>
            <div className="text-center border-l border-border/50">
              <div className="text-2xl font-bold text-foreground mb-1">{provider.reviewCount || 0}</div>
              <div className="text-xs text-muted-foreground">Reviews</div>
            </div>
            <div className="text-center border-l border-border/50">
              <div className="text-2xl font-bold text-foreground mb-1">{provider.completedGigs || 0}</div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Briefcase className="w-3 h-3" /> Gigs
              </div>
            </div>
            <div className="text-center border-l border-border/50">
              <div className="text-2xl font-bold text-primary mb-1">RM {provider.totalEarnings?.toLocaleString() || 0}</div>
              <div className="text-xs text-muted-foreground">Earned</div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">About</h3>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed mb-6">{provider.bio}</p>
            
            <h3 className="font-bold text-lg mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {provider.skills.map((skill, i) => (
                <Badge key={i} variant="secondary" className="bg-primary/5 text-primary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
