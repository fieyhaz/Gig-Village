import { useParams, useLocation } from "wouter";
import { useGetGig, useCreateBooking, getGetGigQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Star, Calendar as CalendarIcon, User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function GigDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: gig, isLoading } = useGetGig(id, {
    query: {
      enabled: !!id,
      queryKey: getGetGigQueryKey(id)
    }
  });

  const createBooking = useCreateBooking();

  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gig) return;

    createBooking.mutate({
      data: {
        gigId: gig.id,
        customerName,
        customerContact,
        scheduledDate: new Date(scheduledDate).toISOString(),
        notes
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Booking Requested",
          description: "The provider will confirm your booking soon."
        });
        setLocation("/bookings");
      },
      onError: () => {
        toast({
          title: "Booking Failed",
          description: "Could not create booking. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-64 w-full mb-8 rounded-xl" />
        <Skeleton className="h-10 w-2/3 mb-4" />
        <Skeleton className="h-20 w-full mb-8" />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <h2 className="text-2xl font-bold">Gig not found</h2>
        <Button onClick={() => setLocation("/marketplace")} className="mt-4">Back to Marketplace</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {gig.imageUrl ? (
            <img src={gig.imageUrl} alt={gig.title} className="w-full h-64 object-cover rounded-xl mb-6 shadow-sm" />
          ) : (
            <div className="w-full h-64 bg-muted rounded-xl mb-6 flex items-center justify-center">
              <span className="text-muted-foreground">No image available</span>
            </div>
          )}
          
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{gig.category}</Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" /> {gig.location}
            </div>
          </div>

          <h1 className="text-3xl font-serif font-bold mb-4">{gig.title}</h1>
          <p className="text-lg text-muted-foreground mb-8 whitespace-pre-line">{gig.description}</p>
          
          <Card className="border-border/50 shadow-sm mb-8">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-full overflow-hidden flex-shrink-0">
                {gig.providerAvatar ? (
                  <img src={gig.providerAvatar} alt={gig.providerName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                    {gig.providerName.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Provided by</p>
                <h3 className="text-xl font-bold">{gig.providerName}</h3>
                <div className="flex items-center gap-1 text-sm mt-1">
                  <Star className="w-4 h-4 fill-secondary text-secondary" />
                  <span>{gig.rating ? gig.rating.toFixed(1) : "New"}</span>
                  <span className="text-muted-foreground">({gig.reviewCount || 0} reviews)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="border-border/50 shadow-md sticky top-24">
            <CardContent className="p-6">
              <div className="text-3xl font-bold mb-6">RM {gig.price.toFixed(2)}</div>
              
              <h3 className="font-bold mb-4 text-lg border-b pb-2">Book this Service</h3>
              
              <form onSubmit={handleBook} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Name</label>
                  <Input required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Full Name" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Details</label>
                  <Input required value={customerContact} onChange={e => setCustomerContact(e.target.value)} placeholder="Phone or Email" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date & Time</label>
                  <Input type="datetime-local" required value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes (Optional)</label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requests?" className="resize-none h-20" />
                </div>
                
                <Button type="submit" className="w-full h-12 font-bold mt-2" disabled={createBooking.isPending}>
                  {createBooking.isPending ? "Processing..." : "Request Booking"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
