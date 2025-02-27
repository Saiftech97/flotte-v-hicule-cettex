import { Observable, Frame } from '@nativescript/core';
import { FleetService } from './services/fleet-service';
import { Vehicle } from './models/vehicle';
import { Assignment } from './models/assignment';
import { Maintenance } from './models/maintenance';

export class FleetViewModel extends Observable {
  private fleetService: FleetService;
  private _vehicles: Vehicle[];
  private _selectedTabIndex: number = 0;
  private _activeAssignments: Assignment[];
  private _maintenanceHistory: Maintenance[];

  constructor() {
    super();
    this.fleetService = new FleetService();
    this._vehicles = this.fleetService.getVehicles();
    this._activeAssignments = this.fleetService.getActiveAssignments();
    this._maintenanceHistory = [];
    this.refreshData();
  }

  private refreshData(): void {
    this.notifyPropertyChange('vehicles', this._vehicles);
    this.notifyPropertyChange('activeAssignments', this._activeAssignments);
    this.notifyPropertyChange('maintenanceHistory', this._maintenanceHistory);
  }

  get vehicles(): Vehicle[] {
    return this._vehicles;
  }

  get activeAssignments(): Assignment[] {
    return this._activeAssignments;
  }

  get maintenanceHistory(): Maintenance[] {
    return this._maintenanceHistory;
  }

  get selectedTabIndex(): number {
    return this._selectedTabIndex;
  }

  set selectedTabIndex(value: number) {
    if (this._selectedTabIndex !== value) {
      this._selectedTabIndex = value;
      this.notifyPropertyChange('selectedTabIndex', value);
    }
  }

  get availableCount(): number {
    return this._vehicles.filter(v => v.status === 'available').length;
  }

  get inUseCount(): number {
    return this._vehicles.filter(v => v.status === 'in-use').length;
  }

  get maintenanceCount(): number {
    return this._vehicles.filter(v => v.status === 'maintenance').length;
  }

  onVehicleTap(args: any): void {
    const vehicle = this._vehicles[args.index];
    this._maintenanceHistory = this.fleetService.getMaintenances(vehicle.id);
    this.notifyPropertyChange('maintenanceHistory', this._maintenanceHistory);
    this.selectedTabIndex = 2;
  }

  onTrackVehicle(args: any): void {
    const vehicle = args.object.bindingContext as Vehicle;
    Frame.topmost().navigate({
      moduleName: "views/vehicle-telemetry-page",
      context: { vehicleId: vehicle.id },
      clearHistory: false
    });
  }

  onAddTap(): void {
    const currentTab = this.selectedTabIndex;
    switch (currentTab) {
      case 0:
        Frame.topmost().navigate({
          moduleName: "views/add-vehicle-page",
          clearHistory: false
        });
        break;
      case 1:
        Frame.topmost().navigate({
          moduleName: "views/add-assignment-page",
          clearHistory: false
        });
        break;
      case 2:
        Frame.topmost().navigate({
          moduleName: "views/add-maintenance-page",
          clearHistory: false
        });
        break;
    }
  }
}