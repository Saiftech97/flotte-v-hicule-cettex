import { Observable } from '@nativescript/core';
import { Geolocation } from '@nativescript/geolocation';
import { VehicleTelemetry } from '../models/telemetry';
import * as mqtt from 'nativescript-mqtt';

export class TelemetryService extends Observable {
  private client: mqtt.Client;
  private currentVehicleId: string;
  private telemetryData: Map<string, VehicleTelemetry> = new Map();

  constructor() {
    super();
    this.setupMQTTClient();
    this.requestLocationPermission();
  }

  private async setupMQTTClient() {
    const connectionOptions: mqtt.ConnectionOptions = {
      host: 'your-mqtt-broker.com',
      port: 8883,
      protocol: 'mqtts',
      username: 'your-username',
      password: 'your-password'
    };

    this.client = new mqtt.Client(connectionOptions);
    
    this.client.on('connected', () => {
      console.log('Connected to MQTT broker');
      if (this.currentVehicleId) {
        this.subscribeToVehicle(this.currentVehicleId);
      }
    });

    this.client.on('message', (topic: string, message: string) => {
      this.handleTelemetryMessage(topic, message);
    });

    await this.client.connect();
  }

  private async requestLocationPermission() {
    const hasPermission = await Geolocation.enableLocationRequest();
    if (!hasPermission) {
      console.error('Location permission denied');
    }
  }

  async startTracking(vehicleId: string) {
    this.currentVehicleId = vehicleId;
    await this.subscribeToVehicle(vehicleId);
    this.startLocationTracking();
  }

  private async subscribeToVehicle(vehicleId: string) {
    if (this.client.isConnected()) {
      await this.client.subscribe(`vehicle/${vehicleId}/telemetry`);
      await this.client.subscribe(`vehicle/${vehicleId}/diagnostics`);
    }
  }

  private startLocationTracking() {
    Geolocation.watchLocation(
      (location) => {
        if (this.currentVehicleId) {
          const telemetry = this.getTelemetryData(this.currentVehicleId);
          telemetry.location = {
            latitude: location.latitude,
            longitude: location.longitude,
            speed: location.speed || 0,
            heading: location.direction || 0
          };
          this.updateTelemetry(telemetry);
        }
      },
      (error) => {
        console.error('Location error:', error);
      },
      {
        desiredAccuracy: Geolocation.Accuracy.high,
        updateDistance: 10,
        minimumUpdateTime: 1000
      }
    );
  }

  private handleTelemetryMessage(topic: string, message: string) {
    const data = JSON.parse(message);
    const vehicleId = topic.split('/')[1];
    const telemetry = this.getTelemetryData(vehicleId);

    if (topic.endsWith('/diagnostics')) {
      telemetry.diagnostics = data;
    } else if (topic.endsWith('/telemetry')) {
      telemetry.engineData = data;
    }

    this.updateTelemetry(telemetry);
  }

  private getTelemetryData(vehicleId: string): VehicleTelemetry {
    if (!this.telemetryData.has(vehicleId)) {
      this.telemetryData.set(vehicleId, {
        id: Date.now().toString(),
        vehicleId,
        timestamp: new Date(),
        location: {
          latitude: 0,
          longitude: 0,
          speed: 0,
          heading: 0
        },
        engineData: {
          rpm: 0,
          temperature: 0,
          fuelLevel: 0,
          oilPressure: 0
        },
        diagnostics: {
          odometer: 0,
          batteryVoltage: 0,
          engineHours: 0,
          dtcCodes: []
        }
      });
    }
    return this.telemetryData.get(vehicleId);
  }

  private updateTelemetry(telemetry: VehicleTelemetry) {
    telemetry.timestamp = new Date();
    this.telemetryData.set(telemetry.vehicleId, telemetry);
    this.notifyPropertyChange('telemetryData', this.telemetryData);
  }

  getTelemetry(vehicleId: string): VehicleTelemetry | undefined {
    return this.telemetryData.get(vehicleId);
  }

  stopTracking() {
    if (this.currentVehicleId) {
      this.client.unsubscribe(`vehicle/${this.currentVehicleId}/telemetry`);
      this.client.unsubscribe(`vehicle/${this.currentVehicleId}/diagnostics`);
    }
    Geolocation.clearWatch();
    this.currentVehicleId = null;
  }
}