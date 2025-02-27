export interface Assignment {
  id: string;
  vehicleId: string;
  driverName: string;
  startDate: Date;
  endDate?: Date;
  purpose: string;
  initialMileage: number;
  finalMileage?: number;
}