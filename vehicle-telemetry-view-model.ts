import { Observable, Frame } from '@nativescript/core';
import { TelemetryService } from '../services/telemetry-service';
import { VehicleTelemetry } from '../models/telemetry';

export class VehicleTelemetryViewModel extends Observable {
  private telemetryService: TelemetryService;
  private _telemetry: VehicleTelemetry;
  private _mapUrl: string;

  constructor(vehicleId: string) {
    super();
    this.telemetryService = new TelemetryService();
    
    // Initialiser le suivi
    this.telemetryService.startTracking(vehicleId);
    
    // Observer les mises à jour de télémétrie
    this.telemetryService.on('telemetryDataChange', () => {
      this._telemetry = this.telemetryService.getTelemetry(vehicleId);
      this.updateMapUrl();
      this.notifyPropertyChange('telemetry', this._telemetry);
    });
  }

  get telemetry(): VehicleTelemetry {
    return this._telemetry;
  }

  get mapUrl(): string {
    return this._mapUrl;
  }

  private updateMapUrl(): void {
    if (this._telemetry?.location) {
      const { latitude, longitude } = this._telemetry.location;
      this._mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;
      this.notifyPropertyChange('mapUrl', this._mapUrl);
    }
  }

  onUnloaded(): void {
    this.telemetryService.stopTracking();
  }
}