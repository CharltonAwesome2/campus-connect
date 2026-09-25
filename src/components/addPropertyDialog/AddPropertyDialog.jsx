import { useState } from 'react';
import Dialog from '@components/dialog/Dialog';
import Input from '@components/input/Input';
import Label from '@components/label/Label';
import Select from '@components/select/Select';
import Button from '@components/button/Button';
import styles from './AddPropertyDialog.module.css';
import { roomTypeOptions } from '@data/options';

const emptyForm = {
  name: '',
  price: '',
  distance: '',
  totalRooms: '',
  type: 'single',
};

export default function AddPropertyDialog({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);

  const updateField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.totalRooms) {
      onSubmit(null);
      return;
    }
    onSubmit({
      name: form.name,
      price: Number(form.price),
      distance: Number(form.distance) || 0,
      totalRooms: Number(form.totalRooms),
      type: form.type,
    });
    setForm(emptyForm);
  };

  const handleClose = () => {
    setForm(emptyForm);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <h2 className={styles.title}>Add New Property</h2>
      <div className={styles.body}>
        <div>
          <Label htmlFor="name">Property Name</Label>
          <Input id="name" value={form.name} onChange={updateField('name')} placeholder="Enter property name" />
        </div>
        <div className={styles.row}>
          <div>
            <Label htmlFor="price">Monthly Price (R)</Label>
            <Input id="price" type="number" value={form.price} onChange={updateField('price')} placeholder="4500" />
          </div>
          <div>
            <Label htmlFor="distance">Distance (km)</Label>
            <Input id="distance" type="number" value={form.distance} onChange={updateField('distance')} placeholder="1.5" />
          </div>
        </div>
        <div className={styles.row}>
          <div>
            <Label htmlFor="total-rooms">Total Rooms</Label>
            <Input id="total-rooms" type="number" value={form.totalRooms} onChange={updateField('totalRooms')} placeholder="30" />
          </div>
          <div>
            <Label htmlFor="type">Room Type</Label>
            <Select id="type" value={form.type} onChange={updateField('type')} options={roomTypeOptions} />
          </div>
        </div>
        <Button className={styles.submit} onClick={handleSubmit}>
          Add Property
        </Button>
      </div>
    </Dialog>
  );
}