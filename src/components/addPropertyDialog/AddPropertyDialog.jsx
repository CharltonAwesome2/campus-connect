import { useState, useEffect } from "react";
import Dialog from "@components/dialog/Dialog";
import Input from "@components/input/Input";
import Label from "@components/label/Label";
import Select from "@components/select/Select";
import Button from "@components/button/Button";
import styles from "./AddPropertyDialog.module.css";
import { roomTypeOptions } from "@data/options";
import { useData } from "@data/DataContext";

const emptyForm = {
  name: "",
  price: "",
  distance: "",
  totalRooms: "",
  availableRooms: "",
  type: "single",
  address: "",
  description: "",
  amenityIds: [],
};

function toFormShape(data) {
  return {
    name: data.name ?? "",
    price: data.price ?? "",
    distance: data.distanceKm ?? "",
    totalRooms: data.totalRooms ?? "",
    availableRooms: data.availableRooms ?? data.totalRooms ?? "",
    type: data.type ?? "single",
    address: data.address ?? "",
    description: data.description ?? "",
    amenityIds: Array.isArray(data.amenityIds) ? [...data.amenityIds] : [],
  };
}

export default function AddPropertyDialog({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(emptyForm);
  const { amenities: amenityCatalog } = useData(); // see DataContext note below
  const isEdit = !!initialData;

  useEffect(() => {
    if (!open) return;
    setForm(initialData ? toFormShape(initialData) : emptyForm);
  }, [open, initialData]);

  const updateField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleAmenity = (id) =>
    setForm((prev) => ({
      ...prev,
      amenityIds: prev.amenityIds.includes(id) ? prev.amenityIds.filter((x) => x !== id) : [...prev.amenityIds, id],
    }));

  const total = Number(form.totalRooms) || 0;
  const available = Number(form.availableRooms) || 0;
  const occupied = Math.max(0, total - available);
  const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : "0.0";
  const availableInvalid = available > total;

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.totalRooms || availableInvalid) {
      onSubmit(null);
      return;
    }
    onSubmit({
      name: form.name,
      price: Number(form.price),
      distanceKm: Number(form.distance) || 0,
      totalRooms: Number(form.totalRooms),
      availableRooms: Number(form.availableRooms) || 0,
      type: form.type,
      address: form.address || "—",
      description: form.description || "",
      amenityIds: form.amenityIds,
    });
  };
  return (
    <Dialog open={open} onClose={onClose}>
      <h2 className={styles.title}>{isEdit ? "Edit Property" : "Add New Property"}</h2>
      <div className={styles.body}>
        <div>
          <Label htmlFor="name">Property Name</Label>
          <Input id="name" value={form.name} onChange={updateField("name")} placeholder="Enter property name" />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={form.address}
            onChange={updateField("address")}
            placeholder="123 Main Rd, Braamfontein"
          />
        </div>

        <div className={styles.row}>
          <div>
            <Label htmlFor="price">Monthly Price (R)</Label>
            <Input id="price" type="number" value={form.price} onChange={updateField("price")} placeholder="4500" />
          </div>
          <div>
            <Label htmlFor="distance">Distance (km)</Label>
            <Input
              id="distance"
              type="number"
              value={form.distance}
              onChange={updateField("distance")}
              placeholder="1.5"
            />
          </div>
        </div>

        <div className={styles.row}>
          <div>
            <Label htmlFor="total-rooms">Total Rooms</Label>
            <Input
              id="total-rooms"
              type="number"
              value={form.totalRooms}
              onChange={updateField("totalRooms")}
              placeholder="30"
            />
          </div>
          <div>
            <Label htmlFor="available-rooms">Available Rooms</Label>
            <Input
              id="available-rooms"
              type="number"
              value={form.availableRooms}
              onChange={updateField("availableRooms")}
              placeholder="30"
            />
          </div>
        </div>

        {/* Occupancy readout — derived, not editable directly */}
        <div className={styles.occupancyRow}>
          <div className={styles.occupancyLabel}>
            <span>Occupancy</span>
            <span className={styles.occupancyValue}>
              {occupancyRate}% ({occupied}/{total || 0})
            </span>
          </div>
          <div className={styles.occupancyTrack}>
            <div className={styles.occupancyFill} style={{ width: `${Math.min(100, parseFloat(occupancyRate))}%` }} />
          </div>
          {availableInvalid && <span className={styles.error}>Available rooms can’t exceed total rooms.</span>}
        </div>

        <div className={styles.row}>
          <div>
            <Label htmlFor="type">Room Type</Label>
            <Select id="type" value={form.type} onChange={updateField("type")} options={roomTypeOptions} />
          </div>
        </div>

        {/* Amenities tag input */}
        <div>
          <Label>Amenities</Label>
          <div className={styles.amenityGrid}>
            {amenityCatalog.map((a) => {
              const selected = form.amenityIds.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  className={`${styles.amenityChip} ${selected ? styles.amenityChipOn : ""}`}
                  onClick={() => toggleAmenity(a.id)}
                >
                  {a.name}
                </button>
              );
            })}
            {amenityCatalog.length === 0 && (
              <span className={styles.hint}>No amenities defined in the database yet.</span>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            className={styles.textarea}
            value={form.description}
            onChange={updateField("description")}
            placeholder="Short description of the property…"
            rows={3}
          />
        </div>

        <Button className={styles.submit} onClick={handleSubmit}>
          {isEdit ? "Save Changes" : "Add Property"}
        </Button>
      </div>
    </Dialog>
  );
}
