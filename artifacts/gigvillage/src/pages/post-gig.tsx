import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useCreateGig, useGetGigCategories, getListGigsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PlusCircle, MapPin, Tag, DollarSign, FileText, LayoutList } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title is too long."),
  description: z.string().min(20, "Please provide a detailed description (min 20 characters)."),
  category: z.string().min(1, "Please select a category."),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  location: z.string().min(2, "Location is required."),
  providerId: z.number() // Hardcoded for this mockup since we don't have auth context
});

export default function PostGig() {
  const [, setLocationPath] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createGig = useCreateGig();
  const { data: categories } = useGetGigCategories();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: 0,
      location: "",
      providerId: 1, // Mocking a logged-in provider ID
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createGig.mutate(
      { data: values },
      {
        onSuccess: (gig) => {
          queryClient.invalidateQueries({ queryKey: getListGigsQueryKey() });
          toast({
            title: "Gig Posted Successfully",
            description: `Your service "${gig.title}" is now live on the marketplace.`,
          });
          setLocationPath("/marketplace");
        },
        onError: () => {
          toast({
            title: "Failed to Post Gig",
            description: "There was an error creating your listing. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const DEFAULT_CATEGORIES = [
    "Cooking/Catering", "Cleaning", "Repairs", "Guiding", "Handicrafts", "Delivery", "Other"
  ];
  const displayCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-background shadow-sm">
            <PlusCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-3">Post a New Gig</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Create a detailed listing for your service to attract local customers and start earning securely.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-border/50 shadow-md">
          <CardHeader className="bg-muted/20 border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <LayoutList className="w-5 h-5 text-primary" />
              Service Details
            </CardTitle>
            <CardDescription>Fill out the form below accurately to stand out.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Gig Title</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input 
                              placeholder="e.g. Professional Deep Cleaning Service" 
                              className="pl-10 h-12 text-base" 
                              {...field} 
                              data-testid="input-gig-title"
                            />
                          </div>
                        </FormControl>
                        <FormDescription>Make it catchy and descriptive.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-base" data-testid="select-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {displayCategories.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Price (RM)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">RM</span>
                              <Input 
                                type="number" 
                                placeholder="0.00" 
                                className="pl-12 h-12 text-base font-medium" 
                                {...field} 
                                data-testid="input-gig-price"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Location</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input 
                              placeholder="Where is this service available?" 
                              className="pl-10 h-12 text-base" 
                              {...field} 
                              data-testid="input-post-gig-location"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Full Description</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FileText className="absolute left-3 top-4 text-muted-foreground w-5 h-5" />
                            <Textarea 
                              placeholder="Describe your service in detail. What is included? What should the customer prepare? Why should they choose you?" 
                              className="pl-10 min-h-[150px] resize-y text-base pt-4" 
                              {...field} 
                              data-testid="input-gig-desc"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-6 border-t border-border/50 flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="h-12 px-8 text-base font-bold w-full md:w-auto"
                    disabled={createGig.isPending}
                    data-testid="btn-submit-gig"
                  >
                    {createGig.isPending ? "Publishing..." : "Publish Gig"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
