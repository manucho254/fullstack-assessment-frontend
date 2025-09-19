import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import truckingHero from '@/assets/trucking-hero.jpg';

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${truckingHero})` }}
        >
          <div className="absolute inset-0 gradient-hero" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Professional HOS
            <span className="block text-secondary">Compliance</span>
          </h1>
          <p className="text-xl mb-8 text-white/90">
            Streamline your hours of service tracking with intelligent route planning 
            and real-time compliance monitoring
          </p>
          <ul className="space-y-4 text-lg">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-success rounded-full mr-4" />
              FMCSA compliant logging
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-success rounded-full mr-4" />
              Smart route optimization
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-success rounded-full mr-4" />
              Real-time violation prevention
            </li>
          </ul>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-background to-muted/30">
        <div className="w-full max-w-md">
          {isLoginMode ? (
            <LoginForm onToggleMode={toggleMode} />
          ) : (
            <RegisterForm onToggleMode={toggleMode} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;