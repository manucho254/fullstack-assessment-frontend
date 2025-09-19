import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="gradient-surface border-0 shadow-large p-8 max-w-md mx-auto text-center">
        <div className="gradient-hero p-4 rounded-2xl shadow-glow mx-auto w-fit mb-6">
          <Truck className="h-16 w-16 text-primary-foreground" />
        </div>

        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Route Not Found
        </h2>
        <p className="text-muted-foreground mb-6">
          Looks like this route doesn't exist in our system. Let's get you back
          on track.
        </p>

        <Link to="/">
          <Button className="gradient-hero border-0 shadow-glow hover:shadow-large transition-smooth text-primary-foreground font-semibold">
            <Home className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;
