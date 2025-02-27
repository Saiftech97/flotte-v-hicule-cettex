export interface Maintenance {
  id: string;
  vehicleId: string;
  date: Date;
  type: 'revision' | 'reparation' | 'pneus' | 'autre';
  description: string;
  cost: number;
  mileage: number;
}