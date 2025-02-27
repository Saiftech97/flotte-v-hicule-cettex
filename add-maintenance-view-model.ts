import { Observable, Frame } from '@nativescript/core';
import { FleetService } from '../services/fleet-service';
import { Maintenance } from '../models/maintenance';
import { Vehicle } from '../models/vehicle';

export class AddMaintenanceViewModel extends Observable {
  private fleetService: FleetService;
  private _newMaintenance: Partial<Maintenance>;
  private _maintenanceTypes: string[];
  private _selectedTypeIndex: number;
  private _vehicle: Vehicle;

  constructor(vehicleId: string) {
    super();
    this.fleetService = new FleetService();
    this._vehicle = this.fleetService.getVehicleById(vehicleId);
    this._maintenanceTypes = ['revision', 'reparation', 'pneus', 'autre'];
    this._selectedTypeIndex = 0;
    this._newMaintenance = {
      vehicleId: vehicleId,
      date: new Date(),
      mileage: this._vehicle?.mileage || 0,
      cost: 0
    };
  }

  get maintenanceTypes(): string[] {
    return this._maintenanceTypes;
  }

  get selectedTypeIndex(): number {
    return this._selectedTypeIndex;
  }

  set selectedTypeIndex(value: number) {
    if (this._selectedTypeIndex !== value) {
      this._selectedTypeIndex = value;
      this._newMaintenance.type = this._maintenanceTypes[value] as Maintenance['type'];
      this.notifyPropertyChange('selectedTypeIndex', value);
    }
  }

  get newMaintenance(): Partial<Maintenance> {
    return this._newMaintenance;
  }

  onSaveMaintenance(): void {
    if (this.validateMaintenance()) {
      this.fleetService.addMaintenance(this._newMaintenance as Maintenance);
      Frame.topmost().goBack();
    }
  }

  private validateMaintenance(): boolean {
    if (!this._newMaintenance.description || !this._newMaintenance.type) {
      alert('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    if (this._newMaintenance.cost < 0) {
      alert('Le coût ne peut pas être négatif');
      return false;
    }
    if (this._newMaintenance.mileage < (this._vehicle?.mileage || 0)) {
      alert('Le kilométrage ne peut pas être inférieur au kilométrage actuel');
      return false;
    }
    return true;
  }
}