import React from "react";
import { Badge } from "@/components/ui/badge";
import { Truck, Shield, Clock, Phone, Mail, MapPin } from "lucide-react";

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <footer className={`bg-primary text-primary-foreground ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="bg-white/10 p-2 rounded-xl mr-3">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">TruckLog Pro</h3>
                <p className="text-sm text-primary-foreground/80">
                  HOS Compliance
                </p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Professional Hours of Service compliance and trip planning
              software for the trucking industry.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="bg-white/10 text-white border-white/20"
              >
                <Shield className="h-3 w-3 mr-1" />
                FMCSA Certified
              </Badge>
              <Badge
                variant="secondary"
                className="bg-white/10 text-white border-white/20"
              >
                <Clock className="h-3 w-3 mr-1" />
                Real-time
              </Badge>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Digital Log Book
              </li>
              <li className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                HOS Compliance
              </li>
              <li className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Route Planning
              </li>
              <li className="flex items-center">
                <Truck className="h-4 w-4 mr-2" />
                Fleet Management
              </li>
            </ul>
          </div>

          {/* Compliance */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Compliance</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>49 CFR Part 395</li>
              <li>Electronic Logging Device (ELD)</li>
              <li>Property Carrying</li>
              <li>Passenger Carrying</li>
              <li>70-Hour/8-Day Rule</li>
              <li>60-Hour/7-Day Rule</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <div className="space-y-3 text-sm text-primary-foreground/80">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>1-800-TRUCK-LOG</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>support@trucklogpro.com</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  24/7 Roadside Support
                  <br />
                  Emergency Compliance Assistance
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-primary-foreground/80">
              © 2024 TruckLog Pro. All rights reserved. | Federal Motor Carrier
              Safety Administration Compliant
            </div>
            <div className="flex space-x-6 text-sm text-primary-foreground/80">
              <a href="#" className="transition-smooth hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="transition-smooth hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="transition-smooth hover:text-white">
                FMCSA Resources
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
