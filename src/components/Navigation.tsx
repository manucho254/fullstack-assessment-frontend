import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Menu, Shield, Clock, User, Settings } from "lucide-react";

interface NavigationProps {
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ className = "" }) => {
  return (
    <nav
      className={`bg-white border-b border-border shadow-subtle ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="gradient-primary p-2 rounded-xl shadow-medium mr-3">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  TruckLog Pro
                </h1>
                <p className="text-xs text-muted-foreground">HOS Compliance</p>
              </div>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Button
                variant="ghost"
                className="flex items-center transition-smooth hover:shadow-glow"
              >
                <Clock className="h-4 w-4 mr-2" />
                Log Book
              </Button>
              <Button
                variant="ghost"
                className="flex items-center transition-smooth hover:shadow-glow"
              >
                <Shield className="h-4 w-4 mr-2" />
                Compliance
              </Button>
              <Button
                variant="ghost"
                className="flex items-center transition-smooth hover:shadow-glow"
              >
                Reports
              </Button>
            </div>
          </div>

          {/* Status & User Section */}
          <div className="flex items-center space-x-4">
            <Badge
              variant="secondary"
              className="bg-success text-success-foreground"
            >
              <Shield className="h-3 w-3 mr-1" />
              Compliant
            </Badge>

            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Driver ID: 12345</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="transition-smooth hover:shadow-glow"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden transition-smooth hover:shadow-glow"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu - Hidden by default */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-muted/50">
          <Button
            variant="ghost"
            className="w-full justify-start transition-smooth hover:shadow-glow"
          >
            <Clock className="h-4 w-4 mr-2" />
            Log Book
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start transition-smooth hover:shadow-glow"
          >
            <Shield className="h-4 w-4 mr-2" />
            Compliance
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start transition-smooth hover:shadow-glow"
          >
            Reports
          </Button>
        </div>
      </div>
    </nav>
  );
};
