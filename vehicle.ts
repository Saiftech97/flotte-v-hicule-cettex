export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  registration: string;
  mileage: number;
  status: 'available' | 'in-use' | 'maintenance';
  lastMaintenance?: Date;
}