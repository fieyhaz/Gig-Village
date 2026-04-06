import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, ShieldCheck, CreditCard, 
  BarChart3, Users, Leaf, ArrowUpRight 
} from "lucide-react";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596404396011-88f6154f8eb3?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-secondary/20 text-secondary-foreground text-sm font-semibold mb-6 border border-secondary/30">
                Empowering Malaysia's Rural Youth
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground mb-6 leading-tight tracking-tight">
                Turn your skills into a <span className="text-primary relative whitespace-nowrap">sustainable<svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" /></svg></span> livelihood.
              </h1>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                GigVillage connects graduate entrepreneurs and skilled individuals with their local community. Secure digital payments, AI coaching, and real impact.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/marketplace" data-testid="hero-btn-marketplace">
                  <Button size="lg" className="h-14 px-8 text-base font-semibold rounded-full w-full sm:w-auto shadow-lg hover:shadow-xl transition-all">
                    Explore Services
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/register" data-testid="hero-btn-register">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold rounded-full w-full sm:w-auto bg-background/50 backdrop-blur-sm border-2">
                    Become a Provider
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-serif font-bold mb-4">An Ecosystem Built for Growth</h2>
            <p className="text-muted-foreground">Everything you need to offer your services, build a reputation, and grow your local business.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Service Marketplace",
                description: "List your skills, set your prices, and connect with clients in your village and beyond.",
                icon: Users,
                color: "bg-blue-500/10 text-blue-600"
              },
              {
                title: "Digital Payments",
                description: "Secure, fast, and transparent transactions that help you build a verifiable financial history.",
                icon: CreditCard,
                color: "bg-green-500/10 text-green-600"
              },
              {
                title: "Impact Reporting",
                description: "Track your earnings, see your contribution to the local economy, and measure your success.",
                icon: BarChart3,
                color: "bg-primary/10 text-primary"
              },
              {
                title: "Trusted Community",
                description: "Verified profiles and community reviews ensure a safe and reliable environment for everyone.",
                icon: ShieldCheck,
                color: "bg-secondary/20 text-secondary-foreground"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-sm hover:shadow-md transition-all bg-background/50 backdrop-blur">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">How GigVillage Works</h2>
              <p className="text-lg text-muted-foreground mb-8">We've designed a simple path for rural talent to formalize their skills and connect with opportunities.</p>
              
              <div className="space-y-8">
                {[
                  { step: "01", title: "Create Your Profile", desc: "Sign up and list your skills—whether it's repairing, catering, guiding, or handicrafts." },
                  { step: "02", title: "Receive Bookings", desc: "Local customers find your services and book you directly through the platform." },
                  { step: "03", title: "Complete & Get Paid", desc: "Deliver your service and receive secure digital payments." },
                  { step: "04", title: "Grow Your Impact", desc: "Build reviews and track your contribution to the community's economic growth." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 relative">
              <div className="absolute inset-0 bg-secondary/20 rounded-[2rem] transform rotate-3 scale-105"></div>
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-background bg-muted aspect-[4/5] md:aspect-square flex items-center justify-center">
                 <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200" alt="Community members" className="object-cover w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary-foreground mb-6">Ready to Empower Your Community?</h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-10">
            Join GigVillage today. Whether you're looking to offer your skills or support local talent, there's a place for you here.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-base font-bold rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full sm:w-auto shadow-xl">
                Start Providing Services
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold rounded-full bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto">
                Find Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
