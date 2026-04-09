import { useParams, useLocation, Link } from "wouter";
import {
  useGetGig, useCreateBooking, getGetGigQueryKey,
  useUpdateGig,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin, Star, Calendar as CalendarIcon, User, Clock, Pencil, X, Check, Camera, ImagePlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const GIG_CATEGORIES = [
  "Cooking", "Cleaning", "Repairs", "Guiding", "Handicrafts",
  "Teaching", "Photography", "Delivery", "Gardening", "Technology", "Other",
];

function PhotoUploader({
  current,
  onChange,
}: {
  current: string | null | undefined;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Image must be under 3 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const src = preview || current;

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Service Photo</p>
      <div
        className="relative w-full h-52 rounded-xl overflow-hidden border-2 border-dashed border-border cursor-pointer group bg-muted"
        onClick={() => inputRef.current?.click()}
      >
        {src ? (
          <img src={src} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/50">
            <ImagePlus className="w-10 h-10" />
            <span className="text-sm">Click to upload photo</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
          <Camera className="w-6 h-6 text-white" />
          <span className="text-white text-sm font-medium">Change Photo</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">Max 3 MB · JPG, PNG, WebP</p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

export default function GigDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gig, isLoading } = useGetGig(id, {
    query: { enabled: !!id, queryKey: getGetGigQueryKey(id) }
  });

  const createBooking = useCreateBooking();
  const updateGig = useUpdateGig();

  // Booking form
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [notes, setNotes] = useState("");

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);

  const startEditing = () => {
    if (!gig) return;
    setEditTitle(gig.title);
    setEditDescription(gig.description);
    setEditCategory(gig.category);
    setEditPrice(String(gig.price));
    setEditLocation(gig.location);
    setEditStatus(gig.status);
    setEditImageUrl(null);
    setIsEditing(true);
  };

  const handleSaveListing = () => {
    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({ title: "Invalid price", description: "Please enter a valid price.", variant: "destructive" });
      return;
    }
    updateGig.mutate(
      {
        id,
        data: {
          title: editTitle.trim(),
          description: editDescription.trim(),
          category: editCategory,
          price: priceNum,
          location: editLocation.trim(),
          status: editStatus as "active" | "paused" | "completed",
          ...(editImageUrl ? { imageUrl: editImageUrl } : {}),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetGigQueryKey(id) });
          toast({ title: "Listing updated!", description: "Your changes have been saved." });
          setIsEditing(false);
          setEditImageUrl(null);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
        },
      }
    );
  };

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

  const currentImage = editImageUrl || gig.imageUrl;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Edit Listing Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-8"
          >
            <Card className="border-2 border-primary/20 bg-primary/5 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-primary" /> Edit Listing
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Photo upload */}
                  <div>
                    <PhotoUploader
                      current={gig.imageUrl}
                      onChange={(dataUrl) => setEditImageUrl(dataUrl)}
                    />
                  </div>

                  {/* Fields */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Service Title</label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="e.g. Traditional Kuih Catering"
                        data-testid="input-edit-title"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Category</label>
                        <Select value={editCategory} onValueChange={setEditCategory}>
                          <SelectTrigger data-testid="select-edit-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GIG_CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Price (RM)</label>
                        <Input
                          type="number"
                          min="1"
                          step="0.01"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          placeholder="e.g. 150"
                          data-testid="input-edit-price"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Location</label>
                        <Input
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          placeholder="e.g. Kota Bharu"
                          data-testid="input-edit-location"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Availability</label>
                        <Select value={editStatus} onValueChange={setEditStatus}>
                          <SelectTrigger data-testid="select-edit-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active — Available</SelectItem>
                            <SelectItem value="paused">Paused — Temporarily Unavailable</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description below */}
                <div className="mt-4 space-y-1.5">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Describe your service in detail..."
                    className="min-h-[100px] resize-none"
                    data-testid="textarea-edit-description"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/50">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button
                    onClick={handleSaveListing}
                    disabled={updateGig.isPending}
                    className="gap-2"
                    data-testid="btn-save-listing"
                  >
                    <Check className="w-4 h-4" />
                    {updateGig.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Gig image */}
          <div className="relative w-full h-64 rounded-xl mb-6 overflow-hidden shadow-sm bg-muted">
            {currentImage ? (
              <img src={currentImage} alt={gig.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/5 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImagePlus className="w-10 h-10 opacity-30" />
                <p className="text-sm">No photo yet — click Edit Listing to add one</p>
              </div>
            )}
            {/* Edit button overlay */}
            {!isEditing && (
              <button
                onClick={startEditing}
                className="absolute top-3 right-3 bg-background/90 backdrop-blur text-foreground rounded-lg px-3 py-1.5 text-sm font-medium shadow flex items-center gap-1.5 hover:bg-background transition-colors"
                data-testid="btn-edit-listing"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Listing
              </button>
            )}
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{gig.category}</Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" /> {gig.location}
            </div>
            <Badge
              variant="outline"
              className={
                gig.status === "active"
                  ? "border-green-300 text-green-700 bg-green-50"
                  : gig.status === "paused"
                  ? "border-amber-300 text-amber-700 bg-amber-50"
                  : "border-muted-foreground/30 text-muted-foreground"
              }
            >
              {gig.status === "active" ? "Available" : gig.status === "paused" ? "Paused" : "Completed"}
            </Badge>
          </div>

          <h1 className="text-3xl font-serif font-bold mb-4">{gig.title}</h1>
          <p className="text-lg text-muted-foreground mb-8 whitespace-pre-line">{gig.description}</p>

          {/* Provider card */}
          <Card className="border-border/50 shadow-sm mb-8">
            <CardContent className="p-6 flex items-center gap-4">
              <Link href={`/providers/${gig.providerId}`}>
                <div className="w-16 h-16 bg-muted rounded-full overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                  {gig.providerAvatar ? (
                    <img src={gig.providerAvatar} alt={gig.providerName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                      {gig.providerName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
              <div>
                <p className="text-sm text-muted-foreground mb-0.5">Provided by</p>
                <Link href={`/providers/${gig.providerId}`}>
                  <h3 className="text-xl font-bold hover:text-primary transition-colors cursor-pointer">{gig.providerName}</h3>
                </Link>
                <div className="flex items-center gap-1 text-sm mt-1">
                  <Star className="w-4 h-4 fill-secondary text-secondary" />
                  <span>{gig.rating ? gig.rating.toFixed(1) : "New"}</span>
                  <span className="text-muted-foreground">({gig.reviewCount || 0} reviews)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking sidebar */}
        <div className="md:col-span-1">
          <Card className="border-border/50 shadow-md sticky top-24">
            <CardContent className="p-6">
              <div className="text-3xl font-bold mb-6">RM {gig.price.toFixed(2)}</div>

              <h3 className="font-bold mb-4 text-lg border-b pb-2">Book this Service</h3>

              <form onSubmit={handleBook} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Your Name</label>
                  <Input required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Full Name" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Details</label>
                  <Input required value={customerContact} onChange={e => setCustomerContact(e.target.value)} placeholder="Phone or Email" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> Date & Time</label>
                  <Input type="datetime-local" required value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Notes (Optional)</label>
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requests?" className="resize-none h-20" />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 font-bold mt-2"
                  disabled={createBooking.isPending || gig.status !== "active"}
                >
                  {createBooking.isPending ? "Processing..." : gig.status === "active" ? "Request Booking" : "Service Unavailable"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
