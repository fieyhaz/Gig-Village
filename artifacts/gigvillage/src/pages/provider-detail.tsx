import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import {
  useGetProvider, getGetProviderQueryKey,
  useGetProviderGigs, getGetProviderGigsQueryKey,
  useGetProviderReviews, getGetProviderReviewsQueryKey,
  useCreateProviderReview,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  MapPin, Star, ShieldCheck, Briefcase, Calendar,
  ArrowLeft, ArrowRight, MessageSquare, Send, ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const reviewFormSchema = z.object({
  gigId: z.string().min(1, "Please select a service"),
  reviewerName: z.string().min(2, "Name must be at least 2 characters"),
  rating: z.string().min(1, "Please select a rating"),
  comment: z.string().min(10, "Review must be at least 10 characters").max(500, "Review must be under 500 characters"),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const starSize = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${star <= rating ? "fill-secondary text-secondary" : "fill-muted text-muted"}`}
        />
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-8 text-right text-muted-foreground">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-secondary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
      </div>
      <span className="w-6 text-muted-foreground">{count}</span>
    </div>
  );
}

export default function ProviderDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: provider, isLoading } = useGetProvider(id, {
    query: { enabled: !!id, queryKey: getGetProviderQueryKey(id) }
  });
  const { data: providerGigs, isLoading: gigsLoading } = useGetProviderGigs(id, {
    query: { enabled: !!id, queryKey: getGetProviderGigsQueryKey(id) }
  });
  const { data: reviews, isLoading: reviewsLoading } = useGetProviderReviews(id, {
    query: { enabled: !!id, queryKey: getGetProviderReviewsQueryKey(id) }
  });

  const createReview = useCreateProviderReview();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { gigId: "", reviewerName: "", rating: "", comment: "" },
  });

  const onSubmitReview = (values: ReviewFormValues) => {
    createReview.mutate(
      {
        id,
        data: {
          gigId: parseInt(values.gigId),
          reviewerName: values.reviewerName,
          rating: parseInt(values.rating),
          comment: values.comment,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProviderReviewsQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetProviderQueryKey(id) });
          toast({ title: "Review submitted!", description: "Thank you for your feedback." });
          form.reset();
          setShowReviewForm(false);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to submit review. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  // Compute rating breakdown from reviews
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    label: `${star}`,
    count: reviews?.filter((r) => r.rating === star).length ?? 0,
  }));

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <h2 className="text-2xl font-bold mb-4">Provider not found</h2>
        <Button onClick={() => setLocation("/providers")}>Back to Directory</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back link */}
      <button
        onClick={() => setLocation("/providers")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        data-testid="btn-back-providers"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Providers
      </button>

      {/* Hero banner + avatar */}
      <Card className="border-none shadow-md mb-6 overflow-hidden">
        <div className="h-36 bg-gradient-to-r from-primary to-primary/70 relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/batik.png')]" />
        </div>
        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row gap-5 items-start md:items-end -mt-14 mb-6">
            <div className="w-28 h-28 rounded-2xl bg-card border-4 border-background shadow-lg overflow-hidden flex items-center justify-center text-3xl font-bold text-primary flex-shrink-0">
              {provider.avatar ? (
                <img src={provider.avatar} alt={provider.name} className="w-full h-full object-cover" />
              ) : (
                <span className="bg-primary/10 w-full h-full flex items-center justify-center">
                  {provider.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-3xl font-serif font-bold" data-testid="text-provider-name">{provider.name}</h1>
                {provider.isVerified && (
                  <Badge className="bg-green-100 text-green-700 border-green-200 gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary/60" /> {provider.location}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary/60" /> Member since {format(new Date(provider.joinedAt), "MMMM yyyy")}</span>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Link href="/marketplace">
                <Button className="gap-2 w-full md:w-auto" data-testid="btn-browse-services">
                  Browse Services <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-y border-border/50">
            <div className="text-center" data-testid="stat-rating">
              <div className="text-2xl font-bold mb-0.5">{provider.rating ? provider.rating.toFixed(1) : "New"}</div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-secondary text-secondary" /> Avg Rating
              </div>
            </div>
            <div className="text-center border-l border-border/50" data-testid="stat-reviews">
              <div className="text-2xl font-bold mb-0.5">{reviews?.length ?? provider.reviewCount ?? 0}</div>
              <div className="text-xs text-muted-foreground">Reviews</div>
            </div>
            <div className="text-center border-l border-border/50" data-testid="stat-gigs">
              <div className="text-2xl font-bold mb-0.5">{provider.completedGigs ?? 0}</div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Briefcase className="w-3 h-3" /> Gigs Done
              </div>
            </div>
            <div className="text-center border-l border-border/50" data-testid="stat-earnings">
              <div className="text-2xl font-bold text-primary mb-0.5">RM {(provider.totalEarnings ?? 0).toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — About + Gigs + Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{provider.bio}</p>
            </CardContent>
          </Card>

          {/* Services Offered */}
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Services Offered</h2>
              {gigsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                </div>
              ) : providerGigs?.length === 0 ? (
                <p className="text-muted-foreground text-sm">No services listed yet.</p>
              ) : (
                <div className="space-y-3">
                  {providerGigs?.map((gig) => (
                    <Link key={gig.id} href={`/gigs/${gig.id}`}>
                      <div
                        className="flex items-center justify-between p-4 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer"
                        data-testid={`gig-link-${gig.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs bg-primary/5 text-primary border-primary/10">
                              {gig.category}
                            </Badge>
                            {gig.status === "active" && (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Available
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {gig.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-secondary text-secondary" /> {gig.rating?.toFixed(1) ?? "New"} ({gig.reviewCount ?? 0})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                          <span className="text-lg font-bold text-foreground">RM {gig.price.toFixed(0)}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card className="border-none shadow-sm" id="reviews">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Customer Reviews</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="gap-2"
                  data-testid="btn-write-review"
                >
                  <MessageSquare className="w-4 h-4" />
                  {showReviewForm ? "Cancel" : "Write a Review"}
                </Button>
              </div>

              {/* Write Review Form */}
              <AnimatePresence>
                {showReviewForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-6 p-5 bg-muted/30 rounded-xl border border-border/60">
                      <h3 className="font-semibold mb-4">Share Your Experience</h3>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="reviewerName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Your Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Ahmad Bin Razak" {...field} data-testid="input-reviewer-name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="gigId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Service Booked</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-gig">
                                        <SelectValue placeholder="Select service" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {providerGigs?.map((gig) => (
                                        <SelectItem key={gig.id} value={String(gig.id)}>
                                          {gig.title}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rating</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-rating">
                                      <SelectValue placeholder="Select rating" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {[5, 4, 3, 2, 1].map((n) => (
                                      <SelectItem key={n} value={String(n)}>
                                        {"★".repeat(n)}{"☆".repeat(5 - n)} — {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][n]}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Review</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Share your experience with this provider..."
                                    className="min-h-[100px] resize-none"
                                    {...field}
                                    data-testid="textarea-comment"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="submit"
                            className="gap-2 w-full sm:w-auto"
                            disabled={createReview.isPending}
                            data-testid="btn-submit-review"
                          >
                            <Send className="w-4 h-4" />
                            {createReview.isPending ? "Submitting..." : "Submit Review"}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Review list */}
              {reviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              ) : reviews?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No reviews yet</p>
                  <p className="text-sm">Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {reviews?.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      data-testid={`review-card-${review.id}`}
                    >
                      <div className="flex gap-4">
                        <Avatar className="w-10 h-10 flex-shrink-0 border border-border">
                          <AvatarFallback className="bg-secondary/10 text-secondary-foreground font-bold text-sm">
                            {review.reviewerName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-foreground" data-testid={`review-author-${review.id}`}>{review.reviewerName}</span>
                            <span className="text-xs text-muted-foreground">{format(new Date(review.createdAt), "d MMM yyyy")}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <StarRating rating={review.rating} />
                            <span className="text-xs text-muted-foreground border border-border/50 rounded px-1.5 py-0.5 bg-muted/30">
                              {review.gigTitle}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed" data-testid={`review-comment-${review.id}`}>
                            {review.comment}
                          </p>
                        </div>
                      </div>
                      {index < (reviews?.length ?? 0) - 1 && <Separator className="mt-5" />}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar — Rating breakdown + Skills */}
        <div className="space-y-6">
          {/* Rating overview */}
          <Card className="border-none shadow-sm sticky top-4">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Rating Overview</h3>
              <div className="flex items-center gap-4 mb-5">
                <div className="text-5xl font-bold text-foreground">
                  {provider.rating ? provider.rating.toFixed(1) : "—"}
                </div>
                <div>
                  <StarRating rating={Math.round(provider.rating ?? 0)} size="lg" />
                  <p className="text-sm text-muted-foreground mt-1">{reviews?.length ?? 0} reviews</p>
                </div>
              </div>
              <div className="space-y-2">
                {ratingCounts.map(({ label, count }) => (
                  <RatingBar
                    key={label}
                    label={label}
                    count={count}
                    total={reviews?.length ?? 0}
                  />
                ))}
              </div>
            </CardContent>

            <Separator />

            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-3">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {provider.skills.map((skill, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 transition-colors"
                    data-testid={`skill-badge-${i}`}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>

            <Separator />

            <CardFooter className="p-6">
              <Button
                className="w-full gap-2"
                onClick={() => setShowReviewForm(true)}
                data-testid="btn-write-review-sidebar"
              >
                <MessageSquare className="w-4 h-4" /> Write a Review
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
