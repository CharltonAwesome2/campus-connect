import { MapPin, Users, Wifi, Car, Utensils, Dumbbell, Check } from 'lucide-react';
import Button from '@components/button/Button';
import Card from '@components/card/Card';
import Badge from '@components/badge/Badge';
import styles from './ResidenceCard.module.css';

function AmenityIcon({ amenity }) {
  const a = amenity.toLowerCase();
  if (a.includes('wifi')) return <Wifi size={14} />;
  if (a.includes('gym')) return <Dumbbell size={14} />;
  if (a.includes('parking') || a.includes('car')) return <Car size={14} />;
  if (a.includes('kitchen') || a.includes('cafeteria')) return <Utensils size={14} />;
  return <Check size={14} />;
}

export default function ResidenceCard({ residence, onApply, showActions = false, onEdit, onDelete }) {
  const isAvailable = residence.availableRooms > 0;
  const occupancyRate = (
    ((residence.totalRooms - residence.availableRooms) / residence.totalRooms) * 100
  ).toFixed(0);

  return (
    <Card className={styles.card}>
      <div className={styles.imageWrap}>
        <img src={residence.image} alt={residence.name} className={styles.image} />
        {!isAvailable && (
          <div className={styles.occupiedOverlay}>
            <Badge className={styles.occupiedBadge}>Fully Occupied</Badge>
          </div>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.name}>{residence.name}</h3>
          <Badge className={styles.typeBadge}>{residence.type}</Badge>
        </div>

        <div className={styles.metaRow}>
          <div className={styles.meta}>
            <MapPin size={16} />
            <span>{residence.distance} km</span>
          </div>
          <div className={styles.meta}>
            <Users size={16} />
            <span>
              {residence.availableRooms}/{residence.totalRooms} available
            </span>
          </div>
        </div>

        {showActions && (
          <div className={styles.occupancy}>
            <div className={styles.occupancyLabel}>
              <span>Occupancy</span>
              <span className={styles.occupancyValue}>{occupancyRate}%</span>
            </div>
            <div className={styles.occupancyTrack}>
              <div className={styles.occupancyFill} style={{ width: `${occupancyRate}%` }} />
            </div>
          </div>
        )}

        <div className={styles.amenities}>
          {residence.amenities.slice(0, 4).map((amenity, i) => (
            <div key={i} className={styles.amenity}>
              <AmenityIcon amenity={amenity} />
              <span>{amenity}</span>
            </div>
          ))}
        </div>

        <div className={styles.price}>
          R{residence.price.toLocaleString()}
          <span className={styles.priceUnit}>/month</span>
        </div>
      </div>

      <div className={styles.footer}>
        {!showActions && onApply && (
          <Button
            className={styles.applyBtn}
            onClick={() => onApply(residence.id)}
            disabled={!isAvailable}
          >
            {isAvailable ? 'Apply for Residence' : 'Not Available'}
          </Button>
        )}
        {showActions && (
          <>
            <Button className={styles.editBtn} onClick={() => onEdit?.(residence.id)}>
              Edit
            </Button>
            <Button className={styles.removeBtn} onClick={() => onDelete?.(residence.id)}>
              Remove
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}