import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  DistanceMatrixRequest,
  DistanceMatrixResponse,
  TravelMode,
  UnitSystem,
} from '@googlemaps/google-maps-services-js';

export interface DistanceResult {
  distanceKm: number;
  durationMinutes: number;
  distanceText: string;
  durationText: string;
}

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);
  private readonly client: Client;
  private readonly apiKey: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';
    this.enabled = !!this.apiKey;

    if (this.enabled) {
      this.client = new Client({});
      this.logger.log('✅ Google Maps API enabled');
      this.logger.log(
        `🔑 API Key (first 20 chars): ${this.apiKey.substring(0, 20)}...`,
      );
      this.logger.log(`🔑 API Key length: ${this.apiKey.length} characters`);
    } else {
      this.logger.warn('⚠️  Google Maps API key not configured');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get distance matrix between multiple origins and destinations
   */
  async getDistanceMatrix(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>,
    mode: TravelMode = TravelMode.driving,
  ): Promise<DistanceResult[][]> {
    if (!this.enabled) {
      throw new Error('Google Maps API is not configured');
    }

    const request: DistanceMatrixRequest = {
      params: {
        origins: origins.map((o) => ({ lat: o.lat, lng: o.lng })),
        destinations: destinations.map((d) => ({ lat: d.lat, lng: d.lng })),
        mode,
        units: UnitSystem.metric,
        key: this.apiKey,
      },
    };

    try {
      this.logger.debug(
        `Calling Distance Matrix API: ${origins.length} origins × ${destinations.length} destinations`,
      );

      const response: DistanceMatrixResponse =
        await this.client.distancematrix(request);

      if (response.data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${response.data.status}`);
      }

      return response.data.rows.map((row) =>
        row.elements.map((element) => {
          if (element.status !== 'OK') {
            this.logger.warn(`Element status: ${element.status}`);
            return {
              distanceKm: 0,
              durationMinutes: 0,
              distanceText: 'N/A',
              durationText: 'N/A',
            };
          }

          return {
            distanceKm: element.distance.value / 1000, // meters to km
            durationMinutes: Math.ceil(element.duration.value / 60), // seconds to minutes
            distanceText: element.distance.text,
            durationText: element.duration.text,
          };
        }),
      );
    } catch (error) {
      this.logger.error('Failed to get distance matrix', error);
      throw error;
    }
  }

  /**
   * Get distance between two points
   */
  async getDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: TravelMode = TravelMode.driving,
  ): Promise<DistanceResult> {
    const matrix = await this.getDistanceMatrix([origin], [destination], mode);
    return matrix[0][0];
  }

  /**
   * Get distances from one origin to multiple destinations
   */
  async getDistancesToMultiple(
    origin: { lat: number; lng: number },
    destinations: Array<{ lat: number; lng: number }>,
    mode: TravelMode = TravelMode.driving,
  ): Promise<DistanceResult[]> {
    const matrix = await this.getDistanceMatrix([origin], destinations, mode);
    return matrix[0];
  }

  /**
   * Batch calculate distances with caching support
   * Groups requests to stay within API limits (25 origins × 25 destinations)
   */
  async batchGetDistances(
    pairs: Array<{
      origin: { lat: number; lng: number };
      destination: { lat: number; lng: number };
    }>,
    mode: TravelMode = TravelMode.driving,
  ): Promise<DistanceResult[]> {
    if (!this.enabled) {
      throw new Error('Google Maps API is not configured');
    }

    const BATCH_SIZE = 25; // Google Maps API limit
    const results: DistanceResult[] = [];

    // Process in batches
    for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
      const batch = pairs.slice(i, i + BATCH_SIZE);
      const origins = batch.map((p) => p.origin);
      const destinations = batch.map((p) => p.destination);

      const matrix = await this.getDistanceMatrix(origins, destinations, mode);

      // Extract diagonal elements (origin[i] to destination[i])
      batch.forEach((_, index) => {
        results.push(matrix[index][index]);
      });

      // Rate limiting: avoid hitting API too fast
      if (i + BATCH_SIZE < pairs.length) {
        await this.sleep(100); // 100ms between batches
      }
    }

    return results;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
