import { useState, useMemo } from "react";
import {
  useListBookings,
  useUpdateBookingStatus,
  getListBookingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Calendar, Clock, CheckCircle2, XCircle,
  User, FileText, ShoppingBag, Briefcase, LogIn, Store,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
type ViewRole = "customer" | "provider";

const STATUS_TABS: { value: BookingStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function getStatusColor(status: string) {
  switch (status) {
    case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "confirmed": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "completed": return "bg-green-500/10 text-green-600 border-green-500/20";
    case "cancelled": return "bg-red-500/10 text-red-600 border-red-500/20";
    default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
}

export default function Bookings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isProvider } = useAuth();
  const [, setLocation] = useLocation();

  const [role, setRole] = useState<ViewRole>("customer");
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("pending");

  const queryParams = useMemo(() => {
    if (!user) return undefined;
    return role === "customer"
      ? { customerUserId: user.id }
      : isProvider
        ? { providerId: user.providerId! }
        : undefined;
  }, [user, role, isProvider]);

  const { data: bookings, isLoading } = useListBookings(queryParams, {
    query: {
      queryKey: getListBookingsQueryKey(queryParams),
      enabled: !!queryParams,
    },
  });

  const updateStatus = useUpdateBookingStatus();

  const handleStatusUpdate = (id: number, status: BookingStatus) => {
    updateStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey(queryParams) });
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
        },
      }
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="border-border/50 shadow-sm text-center">
          <CardContent className="p-10 flex flex-col items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
              <LogIn className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-serif font-bold">Sign in to see your bookings</h2>
            <p className="text-muted-foreground">
              Track services you've booked and bookings received for the gigs you offer.
            </p>
            <Button onClick={() => setLocation("/login?redirect=/bookings")} className="mt-2">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredBookings = (bookings ?? []).filter((b) => b.status === statusFilter);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-3">Your Bookings</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Switch between services you've booked and bookings received for your gigs.
        </p>
      </div>

      {/* MAIN ROLE TABS */}
      <Tabs value={role} onValueChange={(v) => setRole(v as ViewRole)} className="space-y-6">
        <TabsList className="bg-card border h-14 w-full md:w-auto p-1.5 grid grid-cols-2 md:inline-grid md:grid-cols-2">
          <TabsTrigger
            value="customer"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full rounded-md px-6 text-sm font-semibold"
            data-testid="tab-my-orders"
          >
            <ShoppingBag className="w-4 h-4" />
            My Orders
          </TabsTrigger>
          <TabsTrigger
            value="provider"
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full rounded-md px-6 text-sm font-semibold"
            data-testid="tab-my-gig-bookings"
          >
            <Briefcase className="w-4 h-4" />
            My Gig Bookings
          </TabsTrigger>
        </TabsList>

        {/* PROVIDER TAB — show onboarding CTA if not yet a provider */}
        {role === "provider" && !isProvider && (
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-10 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Store className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-serif font-bold">Become a provider</h2>
              <p className="text-muted-foreground max-w-md">
                You haven't set up a provider profile yet. Onboard now to start receiving bookings on the gigs you list.
              </p>
              <Button onClick={() => setLocation("/provider/onboarding")} className="mt-2">
                Become a Provider
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STATUS SUB-TABS — visible whenever we have a query running */}
        {(role === "customer" || isProvider) && (
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as BookingStatus)} className="space-y-6">
            <TabsList className="bg-card border h-12 w-full md:w-auto p-1 flex overflow-x-auto overflow-y-hidden hide-scrollbar justify-start">
              {STATUS_TABS.map((s) => (
                <TabsTrigger
                  key={s.value}
                  value={s.value}
                  className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full rounded-md px-5 text-sm font-medium"
                >
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={statusFilter} className="mt-6 border-none p-0 outline-none">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="border-none shadow-sm">
                      <CardContent className="p-6">
                        <Skeleton className="h-6 w-1/3 mb-3" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-xl border">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No {statusFilter} bookings</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {role === "customer"
                      ? "You haven't placed any bookings in this status yet."
                      : "You haven't received any bookings in this status yet."}
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
                            <div className="flex items-start justify-between mb-4 gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className={`border ${getStatusColor(booking.status)}`}>
                                    {booking.status.toUpperCase()}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    ID: #{booking.id.toString().padStart(4, "0")}
                                  </span>
                                </div>
                                <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                                  <Link href={`/bookings/${booking.id}`}>{booking.gigTitle}</Link>
                                </h3>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-foreground">
                                  RM {booking.totalAmount.toFixed(2)}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm mb-4">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4 text-primary/60" />
                                <span className="font-medium text-foreground">
                                  {format(new Date(booking.scheduledDate), "PPP")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4 text-primary/60" />
                                {role === "customer" ? (
                                  <span>
                                    Provider: <span className="font-medium text-foreground">{booking.providerName}</span>
                                  </span>
                                ) : (
                                  <span>
                                    Customer: <span className="font-medium text-foreground">{booking.customerName}</span>
                                  </span>
                                )}
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
                            {/* Provider-only actions */}
                            {role === "provider" && booking.status === "pending" && (
                              <>
                                <Button
                                  onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                                  className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                                  disabled={updateStatus.isPending}
                                >
                                  <CheckCircle2 className="w-4 h-4" /> Confirm
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                                  className="w-full gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                  disabled={updateStatus.isPending}
                                >
                                  <XCircle className="w-4 h-4" /> Reject
                                </Button>
                              </>
                            )}
                            {role === "provider" && booking.status === "confirmed" && (
                              <>
                                <Button
                                  onClick={() => handleStatusUpdate(booking.id, "completed")}
                                  className="w-full gap-2"
                                  disabled={updateStatus.isPending}
                                >
                                  <CheckCircle2 className="w-4 h-4" /> Mark Completed
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                                  className="w-full gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                  disabled={updateStatus.isPending}
                                >
                                  <XCircle className="w-4 h-4" /> Cancel
                                </Button>
                              </>
                            )}

                            {/* Customer-only actions */}
                            {role === "customer" &&
                              (booking.status === "pending" || booking.status === "confirmed") && (
                                <Button
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                                  className="w-full gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                  disabled={updateStatus.isPending}
                                >
                                  <XCircle className="w-4 h-4" /> Cancel Order
                                </Button>
                              )}

                            {(booking.status === "completed" || booking.status === "cancelled") && (
                              <div className="text-center">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                                <Badge
                                  variant="outline"
                                  className={`border px-3 py-1 text-sm ${getStatusColor(booking.status)}`}
                                >
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
        )}
      </Tabs>
    </div>
  );
}
