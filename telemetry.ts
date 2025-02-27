export interface VehicleTelemetry {
  id: string;
  vehicleId: string;
  timestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
  };
  engineData: {
    rpm: number;
    temperature: number;
    fuelLevel: number;
    oilPressure: number;
  };
  diagnostics: {
    odometer: number;
    batteryVoltage: number;
    engineHours: number;
    dtcCodes: string[];
  };
}