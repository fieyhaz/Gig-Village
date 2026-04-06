import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useCreateProvider } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Store, CheckCircle, ChevronRight } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  bio: z.string().min(10, "Bio must be at least 10 characters.").max(500, "Bio is too long."),
  location: z.string().min(2, "Location is required."),
  skills: z.array(z.string()).min(1, "Please select at least one skill."),
});

const SKILL_OPTIONS = [
  "Cooking", "Baking", "Catering", 
  "House Cleaning", "Deep Cleaning",
  "Plumbing", "Electrical", "Carpentry",
  "Tour Guiding", "Language Teaching",
  "Weaving", "Pottery", "Woodworking",
  "Delivery", "Moving", "Farming"
];

export default function Register() {
  const [, setLocationPath] = useLocation();
  const { toast } = useToast();
  const createProvider = useCreateProvider();
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bio: "",
      location: "",
      skills: [],
    },
  });

  const toggleSkill = (skill: string) => {
    const current = form.getValues("skills");
    const updated = current.includes(skill)
      ? current.filter(s => s !== skill)
      : [...current, skill];
    
    setSelectedSkills(updated);
    form.setValue("skills", updated, { shouldValidate: true });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createProvider.mutate(
      { data: values },
      {
        onSuccess: (provider) => {
          toast({
            title: "Registration Successful!",
            description: `Welcome to GigVillage, ${provider.name}.`,
          });
          setLocationPath("/providers");
        },
        onError: () => {
          toast({
            title: "Registration Failed",
            description: "There was an error creating your profile. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
            Formalize your skills. <br/>
            <span className="text-primary">Grow your business.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of rural entrepreneurs who have turned their informal skills into reliable income streams through GigVillage.
          </p>
          
          <ul className="space-y-4 mb-8">
            {[
              "Digital presence & verified profile",
              "Secure, transparent payments",
              "AI coaching for business growth",
              "Community trust & reviews"
            ].map((benefit, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-secondary" />
                <span className="font-medium text-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-border/50 shadow-xl overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
              <CardTitle className="text-2xl font-serif">Create Profile</CardTitle>
              <CardDescription>Tell the community about what you offer.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name or Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Mak Cik Aminah Kitchen" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Kampung Baru, Kedah" {...field} data-testid="input-register-location" />
                        </FormControl>
                        <FormDescription>Where do you primarily operate?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About You</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell customers about your experience, your story, and why they should choose you..." 
                            className="resize-none h-24"
                            {...field} 
                            data-testid="input-bio"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skills"
                    render={() => (
                      <FormItem>
                        <FormLabel>Your Skills</FormLabel>
                        <FormDescription className="mb-3">Select all that apply to your services.</FormDescription>
                        <div className="flex flex-wrap gap-2">
                          {SKILL_OPTIONS.map((skill) => {
                            const isSelected = selectedSkills.includes(skill);
                            return (
                              <Badge
                                key={skill}
                                variant={isSelected ? "default" : "outline"}
                                className={`cursor-pointer text-sm py-1.5 px-3 ${
                                  isSelected 
                                    ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary" 
                                    : "hover:bg-muted"
                                }`}
                                onClick={() => toggleSkill(skill)}
                                data-testid={`badge-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                              >
                                {skill}
                              </Badge>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-bold group" 
                    disabled={createProvider.isPending}
                    data-testid="btn-submit-register"
                  >
                    {createProvider.isPending ? "Creating Profile..." : "Complete Registration"}
                    {!createProvider.isPending && <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
