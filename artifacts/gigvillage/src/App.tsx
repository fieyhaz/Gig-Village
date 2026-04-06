import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { useHealthCheck } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Marketplace from "@/pages/marketplace";
import Providers from "@/pages/providers";
import Bookings from "@/pages/bookings";
import Impact from "@/pages/impact";
import Register from "@/pages/register";
import PostGig from "@/pages/post-gig";
import GigDetail from "@/pages/gig-detail";
import ProviderDetail from "@/pages/provider-detail";
import BookingDetail from "@/pages/booking-detail";

const queryClient = new QueryClient();

// Helper component to run healthcheck on app mount
function AppInitializer({ children }: { children: React.ReactNode }) {
  useHealthCheck();
  return <>{children}</>;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/providers" component={Providers} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/impact" component={Impact} />
        <Route path="/register" component={Register} />
        <Route path="/post-gig" component={PostGig} />
        <Route path="/gigs/:id" component={GigDetail} />
        <Route path="/providers/:id" component={ProviderDetail} />
        <Route path="/bookings/:id" component={BookingDetail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppInitializer>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AppInitializer>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
