import { useState } from "react";
import { useListBookings, useUpdateBookingStatus, getListBookingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  Calendar, Clock, CheckCircle2, XCircle, 
  MapPin, User, FileText, Banknote
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export default function Bookings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<BookingStatus>("pending");

  const { data: bookings, isLoading } = useListBookings({
    query: {
      queryKey: getListBookingsQueryKey()
    }
  });

  const updateStatus = useUpdateBookingStatus();

  const handleStatusUpdate = (id: number, status: BookingStatus) => {
    updateStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
          toast({
            title: "Booking Updated",
            description: `Booking status changed to ${status}.`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update booking status.",
            variant: "destructive",
          });
        }
      }
    );
  };

  const filteredBookings = bookings?.filter(b => b.status === activeTab) || [];

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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold mb-4">Bookings Management</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Track and manage all service requests. Ensure timely responses and maintain a trusted reputation.
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending" onValueChange={(v) => setActiveTab(v as BookingStatus)} className="space-y-6">
        <TabsList className="bg-card border h-12 w-full md:w-auto p-1 flex overflow-x-auto overflow-y-hidden hide-scrollbar justify-start">
          <TabsTrigger value="pending" className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full rounded-md px-6 text-sm font-medium">Pending Requests</TabsTrigger>
          <TabsTrigger value="confirmed" className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full rounded-md px-6 text-sm font-medium">Confirmed</TabsTrigger>
          <TabsTrigger value="completed" className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full rounded-md px-6 text-sm font-medium">Completed</TabsTrigger>
          <TabsTrigger value="cancelled" className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full rounded-md px-6 text-sm font-medium">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6 border-none p-0 outline-none">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-none shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <div className="w-full md:w-48 space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No {activeTab} bookings</h3>
              <p className="text-muted-foreground">
                You don't have any bookings in this status right now.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className={`border ${getStatusColor(booking.status)}`}>
                                {booking.status.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">ID: #{booking.id.toString().padStart(4, '0')}</span>
                            </div>
                            <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors" data-testid={`text-booking-gig-${booking.id}`}>
                              <Link href={`/bookings/${booking.id}`}>{booking.gigTitle}</Link>
                            </h3>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-foreground">RM {booking.totalAmount.toFixed(2)}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm mb-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4 text-primary/60" />
                            <span className="font-medium text-foreground">{format(new Date(booking.scheduledDate), "PPP")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="w-4 h-4 text-primary/60" />
                            <span>Customer: <span className="font-medium text-foreground">{booking.customerName}</span></span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4 text-primary/60" />
                            <span>Created: {format(new Date(booking.createdAt), "MMM d, yyyy")}</span>
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm flex items-start gap-2 border border-border/50">
                            <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-muted-foreground italic">{booking.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-muted/20 p-6 md:w-56 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-border/50">
                        {booking.status === "pending" && (
                          <>
                            <Button 
                              onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                              className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                              disabled={updateStatus.isPending}
                              data-testid={`btn-confirm-${booking.id}`}
                            >
                              <CheckCircle2 className="w-4 h-4" /> Confirm
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                              className="w-full gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                              disabled={updateStatus.isPending}
                              data-testid={`btn-reject-${booking.id}`}
                            >
                              <XCircle className="w-4 h-4" /> Reject
                            </Button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <>
                            <Button 
                              onClick={() => handleStatusUpdate(booking.id, "completed")}
                              className="w-full gap-2"
                              disabled={updateStatus.isPending}
                              data-testid={`btn-complete-${booking.id}`}
                            >
                              <CheckCircle2 className="w-4 h-4" /> Mark Completed
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                              className="w-full gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                              disabled={updateStatus.isPending}
                              data-testid={`btn-cancel-${booking.id}`}
                            >
                              <XCircle className="w-4 h-4" /> Cancel
                            </Button>
                          </>
                        )}
                        {(booking.status === "completed" || booking.status === "cancelled") && (
                          <div className="text-center">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                            <Badge variant="outline" className={`border px-3 py-1 text-sm ${getStatusColor(booking.status)}`}>
                              {booking.status.toUpperCase()}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
