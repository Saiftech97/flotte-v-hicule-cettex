import { Observable } from '@nativescript/core';
import { Vehicle } from '../models/vehicle';
import { Maintenance } from '../models/maintenance';
import { Assignment } from '../models/assignment';

export class FleetService extends Observable {
  private vehicles: Vehicle[] = [
    {
      id: '1',
      brand: 'Renault',
      model: 'Clio',
      year: 2022,
      registration: 'AB-123-CD',
      mileage: 15000,
      status: 'available',
      lastMaintenance: new Date('2023-12-01')
    },
    {
      id: '2',
      brand: 'Peugeot',
      model: '308',
      year: 2021,
      registration: 'EF-456-GH',
      mileage: 25000,
      status: 'in-use',
      lastMaintenance: new Date('2023-11-15')
    }
  ];

  private maintenances: Maintenance[] = [];
  private assignments: Assignment[] = [];

  getVehicles(): Vehicle[] {
    return this.vehicles;
  }

  getVehicleById(id: string): Vehicle | undefined {
    return this.vehicles.find(v => v.id === id);
  }

  addVehicle(vehicle: Vehicle): void {
    vehicle.id = Date.now().toString(); // Simple ID generation
    this.vehicles.push(vehicle);
    this.notifyPropertyChange('vehicles', this.vehicles);
  }

  updateVehicleStatus(id: string, status: Vehicle['status']): void {
    const vehicle = this.getVehicleById(id);
    if (vehicle) {
      vehicle.status = status;
      this.notifyPropertyChange('vehicles', this.vehicles);
    }
  }

  addMaintenance(maintenance: Maintenance): void {
    maintenance.id = Date.now().toString();
    this.maintenances.push(maintenance);
    
    const vehicle = this.getVehicleById(maintenance.vehicleId);
    if (vehicle) {
      vehicle.lastMaintenance = maintenance.date;
      vehicle.mileage = maintenance.mileage;
      vehicle.status = 'available';
      this.notifyPropertyChange('vehicles', this.vehicles);
    }
  }

  getMaintenances(vehicleId: string): Maintenance[] {
    return this.maintenances
      .filter(m => m.vehicleId === vehicleId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  assignVehicle(assignment: Assignment): void {
    assignment.id = Date.now().toString();
    this.assignments.push(assignment);
    this.updateVehicleStatus(assignment.vehicleId, 'in-use');
  }

  completeAssignment(assignmentId: string, finalMileage: number): void {
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (assignment) {
      assignment.endDate = new Date();
      assignment.finalMileage = finalMileage;
      
      const vehicle = this.getVehicleById(assignment.vehicleId);
      if (vehicle) {
        vehicle.mileage = finalMileage;
        vehicle.status = 'available';
        this.notifyPropertyChange('vehicles', this.vehicles);
      }
    }
  }

  getActiveAssignments(): Assignment[] {
    return this.assignments
      .filter(a => !a.endDate)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  getAssignmentHistory(vehicleId: string): Assignment[] {
    return this.assignments
      .filter(a => a.vehicleId === vehicleId && a.endDate)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }
}