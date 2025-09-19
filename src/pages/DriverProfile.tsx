import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DriverProfile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Driver Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Overview */}
      <Card className="gradient-surface border-0 shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-lg font-semibold">{user.first_name} {user.last_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
              <p className="text-lg">{user.phone_number}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">CDL Number</label>
              <p className="text-lg font-mono">{user.cdl_number}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card className="gradient-surface border-0 shadow-medium">
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Badge variant="default" className="bg-success text-white">
              Active
            </Badge>
            <p className="text-muted-foreground">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverProfile;