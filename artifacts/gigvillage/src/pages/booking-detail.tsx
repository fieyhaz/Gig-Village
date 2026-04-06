import { useParams, useLocation } from "wouter";
import { useGetBooking, getGetBookingQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, User, FileText, Banknote, Clock } from "lucide-react";

export default function BookingDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  
  const { data: booking, isLoading } = useGetBooking(id, {
    query: {
      enabled: !!id,
      queryKey: getGetBookingQueryKey(id)
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl text-center">
        <h2 className="text-2xl font-bold">Booking not found</h2>
        <Button onClick={() => setLocation("/bookings")} className="mt-4">Back to Bookings</Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'confirmed': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'completed': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold">Booking #{booking.id.toString().padStart(4, '0')}</h1>
        <Badge variant="outline" className={`border text-sm py-1 px-3 ${getStatusColor(booking.status)}`}>
          {booking.status.toUpperCase()}
        </Badge>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Service Requested</p>
                <h3 className="text-xl font-bold text-primary">{booking.gigTitle}</h3>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><User className="w-4 h-4" /> Provider</p>
                <p className="font-medium">{booking.providerName}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><User className="w-4 h-4" /> Customer</p>
                <p className="font-medium">{booking.customerName}</p>
                <p className="text-sm text-muted-foreground">{booking.customerContact}</p>
              </div>
            </div>

            <div className="space-y-6 md:pl-8 md:border-l border-border/50">
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Calendar className="w-4 h-4" /> Scheduled For</p>
                <p className="font-medium">{format(new Date(booking.scheduledDate), "EEEE, MMMM d, yyyy")}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(booking.scheduledDate), "h:mm a")}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Banknote className="w-4 h-4" /> Total Amount</p>
                <p className="text-2xl font-bold text-foreground">RM {booking.totalAmount.toFixed(2)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Clock className="w-4 h-4" /> Requested On</p>
                <p className="text-sm font-medium">{format(new Date(booking.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Additional Notes</p>
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm">
                {booking.notes}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
