import { Observable, Frame } from '@nativescript/core';
import { FleetService } from '../services/fleet-service';
import { Vehicle } from '../models/vehicle';

export class AddVehicleViewModel extends Observable {
  private fleetService: FleetService;
  private _newVehicle: Partial<Vehicle>;

  constructor() {
    super();
    this.fleetService = new FleetService();
    this._newVehicle = {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      registration: '',
      mileage: 0,
      status: 'available'
    };
  }

  get newVehicle(): Partial<Vehicle> {
    return this._newVehicle;
  }

  onSaveVehicle(): void {
    if (this.validateVehicle()) {
      this.fleetService.addVehicle(this._newVehicle as Vehicle);
      Frame.topmost().goBack();
    }
  }

  private validateVehicle(): boolean {
    if (!this._newVehicle.brand || !this._newVehicle.model || !this._newVehicle.registration) {
      alert('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    if (this._newVehicle.mileage < 0) {
      alert('Le kilométrage ne peut pas être négatif');
      return false;
    }
    return true;
  }
}