import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Truck } from "lucide-react";

interface TripFormProps {
  onSubmit: (data: TripData) => void;
}

export interface TripData {
  currentLocation: string;
  pickupLocation: string;
  dropoffLocation: string;
  currentCycleHours: number;
}

interface LocationAutocompleteProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  iconColor: "primary" | "success" | "destructive";
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  value,
  onChange,
  placeholder,
  iconColor,
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&limit=5`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    };
    const timeout = setTimeout(fetchSuggestions, 300); // debounce
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="space-y-3 relative">
      <Label className="flex items-center text-sm font-semibold text-foreground">
        <div className={`p-2 bg-${iconColor}/10 rounded-lg mr-3`}>
          <MapPin className={`h-4 w-4 text-${iconColor}`} />
        </div>
        {label}
      </Label>
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-4 pr-4 py-3 text-base"
          required
        />
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2">
            <div className="bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
              <ul className="max-h-48 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="px-4 py-3 hover:bg-muted cursor-pointer text-sm text-foreground border-b border-border/20 last:border-0 transition-colors duration-200"
                    onClick={() => {
                      onChange(s.display_name);
                      setSuggestions([]);
                      setShowDropdown(false);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{s.display_name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const TripForm: React.FC<TripFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<TripData>({
    currentLocation: "",
    pickupLocation: "",
    dropoffLocation: "",
    currentCycleHours: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof TripData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-card border shadow-lg rounded-xl p-8">
        {/* Header with clean styling */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center p-4 bg-muted/30 rounded-xl border">
            <Truck className="h-10 w-10 text-primary mr-3" />
            <div className="text-left">
              <h2 className="text-3xl font-bold text-foreground">
                Plan Your Trip
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Smart HOS Compliance Planning
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Horizontal location inputs layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-muted/20 rounded-lg p-4 border border-border">
              <LocationAutocomplete
                label="Current Location"
                value={formData.currentLocation}
                onChange={(val) => handleInputChange("currentLocation", val)}
                placeholder="Where are you now?"
                iconColor="primary"
              />
            </div>

            <div className="bg-muted/20 rounded-lg p-4 border border-border">
              <LocationAutocomplete
                label="Pickup Location"
                value={formData.pickupLocation}
                onChange={(val) => handleInputChange("pickupLocation", val)}
                placeholder="Where to pickup?"
                iconColor="success"
              />
            </div>

            <div className="bg-muted/20 rounded-lg p-4 border border-border">
              <LocationAutocomplete
                label="Drop-off Location"
                value={formData.dropoffLocation}
                onChange={(val) => handleInputChange("dropoffLocation", val)}
                placeholder="Final destination?"
                iconColor="destructive"
              />
            </div>
          </div>

          {/* Bottom row with hours input and submit button */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-end">
            {/* Hours input */}
            <div className="bg-muted/20 rounded-lg p-5 border border-border">
              <Label
                htmlFor="cycle-hours"
                className="flex items-center text-sm font-semibold mb-3"
              >
                <div className="p-2 bg-warning/10 rounded-lg mr-3">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <span className="text-foreground">Current Cycle Hours</span>
                  <p className="text-xs text-muted-foreground font-normal">
                    Hours used in current 8-day cycle (max 70)
                  </p>
                </div>
              </Label>
              <div className="relative">
                <Input
                  id="cycle-hours"
                  type="number"
                  min="0"
                  max="70"
                  step="0.25"
                  value={formData.currentCycleHours}
                  onChange={(e) =>
                    handleInputChange(
                      "currentCycleHours",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0.00"
                  className="text-lg font-semibold pl-4 pr-12 py-3"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground font-medium">
                  hrs
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg h-[76px]"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Truck className="h-6 w-6" />
                  <span>Plan Trip & Generate Log</span>
                </div>
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};
