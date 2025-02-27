import { Observable, Frame } from '@nativescript/core';
import { FleetService } from '../services/fleet-service';
import { Assignment } from '../models/assignment';
import { Vehicle } from '../models/vehicle';

export class AddAssignmentViewModel extends Observable {
  private fleetService: FleetService;
  private _newAssignment: Partial<Assignment>;
  private _availableVehicles: Vehicle[];
  private _selectedVehicleIndex: number;

  constructor() {
    super();
    this.fleetService = new FleetService();
    this._availableVehicles = this.fleetService.getVehicles().filter(v => v.status === 'available');
    this._selectedVehicleIndex = 0;
    this._newAssignment = {
      driverName: '',
      purpose: '',
      startDate: new Date()
    };
  }

  get availableVehicles(): string[] {
    return this._availableVehicles.map(v => `${v.brand} ${v.model} (${v.registration})`);
  }

  get selectedVehicleIndex(): number {
    return this._selectedVehicleIndex;
  }

  set selectedVehicleIndex(value: number) {
    if (this._selectedVehicleIndex !== value) {
      this._selectedVehicleIndex = value;
      this.notifyPropertyChange('selectedVehicleIndex', value);
    }
  }

  get newAssignment(): Partial<Assignment> {
    return this._newAssignment;
  }

  onSaveAssignment(): void {
    if (this.validateAssignment()) {
      const selectedVehicle = this._availableVehicles[this._selectedVehicleIndex];
      this._newAssignment.vehicleId = selectedVehicle.id;
      this._newAssignment.initialMileage = selectedVehicle.mileage;
      
      this.fleetService.assignVehicle(this._newAssignment as Assignment);
      Frame.topmost().goBack();
    }
  }

  private validateAssignment(): boolean {
    if (!this._newAssignment.driverName || !this._newAssignment.purpose) {
      alert('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    if (this._availableVehicles.length === 0) {
      alert('Aucun véhicule disponible');
      return false;
    }
    return true;
  }
}