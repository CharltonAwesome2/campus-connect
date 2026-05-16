import { MapPin, Users, Wifi, Car, Utensils, Dumbbell, Check } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Residence } from '../data/mock-data';

interface ResidenceCardProps {
  residence: Residence;
  onApply?: (residenceId: string) => void;
  showActions?: boolean;
  onEdit?: (residenceId: string) => void;
  onDelete?: (residenceId: string) => void;
}

const getAmenityIcon = (amenity: string) => {
  const amenityLower = amenity.toLowerCase();
  if (amenityLower.includes('wifi')) return <Wifi className="w-4 h-4" />;
  if (amenityLower.includes('gym')) return <Dumbbell className="w-4 h-4" />;
  if (amenityLower.includes('parking') || amenityLower.includes('car')) return <Car className="w-4 h-4" />;
  if (amenityLower.includes('kitchen') || amenityLower.includes('cafeteria')) return <Utensils className="w-4 h-4" />;
  return <Check className="w-4 h-4" />;
};

export function ResidenceCard({ 
  residence, 
  onApply, 
  showActions = false,
  onEdit,
  onDelete 
}: ResidenceCardProps) {
  const isAvailable = residence.availableRooms > 0;
  const occupancyRate = ((residence.totalRooms - residence.availableRooms) / residence.totalRooms * 100).toFixed(0);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={residence.image}
          alt={residence.name}
          className="w-full h-full object-cover"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
            <Badge variant="secondary" className="bg-white text-gray-900">
              Fully Occupied
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{residence.name}</h3>
          <Badge variant="outline" className="capitalize">
            {residence.type}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{residence.distance} km</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{residence.availableRooms}/{residence.totalRooms} available</span>
          </div>
        </div>

        {showActions && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Occupancy</span>
              <span className="font-medium text-gray-900">{occupancyRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {residence.amenities.slice(0, 4).map((amenity, index) => (
            <div
              key={index}
              className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded"
            >
              {getAmenityIcon(amenity)}
              <span>{amenity}</span>
            </div>
          ))}
        </div>

        <div className="text-2xl font-bold text-blue-600">
          R{residence.price.toLocaleString()}
          <span className="text-sm text-gray-500 font-normal">/month</span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        {!showActions && onApply && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => onApply(residence.id)}
            disabled={!isAvailable}
          >
            {isAvailable ? 'Apply for Residence' : 'Not Available'}
          </Button>
        )}
        {showActions && (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEdit?.(residence.id)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete?.(residence.id)}
            >
              Remove
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
