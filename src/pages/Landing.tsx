import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  Shield, 
  Route, 
  BarChart3, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle,
  Star,
  ArrowRight,
  PlayCircle
} from 'lucide-react';
import truckingHero from '@/assets/trucking-hero.jpg';

const Landing = () => {
  const features = [
    {
      icon: Shield,
      title: "FMCSA Compliant",
      description: "Full regulatory compliance with automated violation detection and real-time monitoring.",
      color: "text-emerald-500"
    },
    {
      icon: Route,
      title: "Smart Route Planning",
      description: "AI-powered route optimization with mandatory rest stops and fuel efficiency calculations.",
      color: "text-blue-500"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Live monitoring, detailed compliance reporting, and performance insights.",
      color: "text-purple-500"
    },
    {
      icon: Clock,
      title: "Automated Logging",
      description: "Seamless hours of service tracking with intelligent duty status detection.",
      color: "text-orange-500"
    }
  ];

  const benefits = [
    "Reduce compliance violations by 95%",
    "Save 3+ hours per week on paperwork", 
    "Optimize fuel costs by 15%",
    "Eliminate manual log errors"
  ];

  const testimonials = [
    {
      name: "Mike Rodriguez",
      role: "Fleet Manager",
      company: "TransLogistics Inc.",
      content: "TruckLog Pro transformed our compliance process. Zero violations in 8 months!",
      rating: 5
    },
    {
      name: "Sarah Chen",
      role: "Owner Operator", 
      company: "Independent Driver",
      content: "The route optimization alone saved me $200/week in fuel costs. Game changer!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">TruckLog Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link to="/login">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
          style={{ backgroundImage: `url(${truckingHero})` }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 animate-fade-in">
              <Shield className="w-3 h-3 mr-1" />
              FMCSA Certified Platform
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-in">
              Professional HOS
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Compliance Made Simple
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Streamline your hours of service tracking with intelligent route planning, 
              real-time compliance monitoring, and automated reporting that keeps you safe and profitable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in">
              <Link to="/login">
                <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 group">
                <PlayCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground animate-fade-in">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                No Setup Fees
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                14-Day Free Trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                Cancel Anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for HOS Compliance
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for professional drivers and fleet managers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="gradient-surface border-0 shadow-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex p-3 rounded-full bg-muted/50 mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Drive Smarter, Stay Compliant
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of professional drivers who trust TruckLog Pro for their HOS compliance needs.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link to="/login">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Get Started Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:pl-8">
              <Card className="gradient-surface border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Live Dashboard Preview</h3>
                    <p className="text-muted-foreground">Real-time compliance monitoring</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Driving Time</span>
                      <Badge className="bg-emerald-500/10 text-emerald-600">8.5h / 11h</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">On-Duty Time</span>
                      <Badge className="bg-blue-500/10 text-blue-600">12h / 14h</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Cycle Hours</span>
                      <Badge className="bg-orange-500/10 text-orange-600">45h / 70h</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Professional Drivers
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our customers say about TruckLog Pro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="gradient-surface border-0 shadow-medium">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role} • {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your HOS Compliance?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of drivers who've made the switch to smarter compliance management.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white/10">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xl font-bold text-foreground">TruckLog Pro</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Professional HOS compliance made simple. Trusted by drivers nationwide.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-3">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>Updates</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-3">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Help Center</li>
                <li>Contact</li>
                <li>Documentation</li>
                <li>Community</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/40 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 TruckLog Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;