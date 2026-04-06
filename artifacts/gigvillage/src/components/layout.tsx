import { Link, useLocation } from "wouter";
import { Menu, X, Briefcase, Users, LayoutDashboard, BarChart3, PlusCircle, LogIn } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Marketplace", href: "/marketplace", icon: Briefcase },
    { name: "Providers", href: "/providers", icon: Users },
    { name: "Bookings", href: "/bookings", icon: LayoutDashboard },
    { name: "Impact", href: "/impact", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center gap-2" data-testid="link-home">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-lg">G</span>
              </div>
              <span className="font-serif font-bold text-xl tracking-tight hidden sm:inline-block">
                GigVillage
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === item.href ? "text-primary" : "text-muted-foreground"
                  }`}
                  data-testid={`link-nav-${item.name.toLowerCase()}`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/register" data-testid="link-register">
              <Button variant="ghost" className="text-sm">Join as Provider</Button>
            </Link>
            <Link href="/post-gig" data-testid="link-post-gig">
              <Button className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Post a Gig
              </Button>
            </Link>
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="btn-mobile-menu">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-serif font-bold text-lg">G</span>
                </div>
                <span className="font-serif font-bold text-xl tracking-tight">GigVillage</span>
              </div>
              
              <nav className="flex flex-col gap-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 text-sm font-medium p-2 rounded-md transition-colors ${
                        location === item.href 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              
              <div className="mt-auto flex flex-col gap-3">
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <LogIn className="w-4 h-4" />
                    Join as Provider
                  </Button>
                </Link>
                <Link href="/post-gig" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-start gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Post a Gig
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="border-t bg-muted/40 py-12 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-lg">G</span>
              </div>
              <span className="font-serif font-bold text-xl tracking-tight">GigVillage</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              Empowering rural youth and graduate entrepreneurs in Malaysia to turn informal skills into sustainable livelihoods.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-serif text-foreground">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/marketplace" className="hover:text-primary">Marketplace</Link></li>
              <li><Link href="/providers" className="hover:text-primary">Providers</Link></li>
              <li><Link href="/impact" className="hover:text-primary">Impact Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-serif text-foreground">Join</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/register" className="hover:text-primary">Register as Provider</Link></li>
              <li><Link href="/post-gig" className="hover:text-primary">Post a Gig</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} GigVillage Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
