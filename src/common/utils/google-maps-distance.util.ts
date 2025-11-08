import { Logger } from '@nestjs/common';

const logger = new Logger('GoogleMapsDistance');

interface DistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      distance?: { value: number; text: string }; // meters
      duration?: { value: number; text: string }; // seconds
      status: string;
    }>;
  }>;
  status: string;
}

export interface DistanceResult {
  distanceKm: number;
  durationMinutes: number;
  distanceText: string;
  durationText: string;
}

/**
 * Calculate actual driving distance using Google Maps Distance Matrix API
 *
 * @param origins - Array of origin coordinates [lat, lng]
 * @param destinations - Array of destination coordinates [lat, lng]
 * @param mode - Travel mode: driving, walking, bicycling, transit
 * @param apiKey - Google Maps API key
 * @returns Distance and duration for each origin-destination pair
 *
 * Cost: $5 per 1,000 requests (after 40,000 free/month)
 */
export async function getActualDistances(
  origins: Array<[number, number]>,
  destinations: Array<[number, number]>,
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
  apiKey: string,
): Promise<DistanceResult[][]> {
  const originsStr = origins.map(([lat, lng]) => `${lat},${lng}`).join('|');
  const destinationsStr = destinations
    .map(([lat, lng]) => `${lat},${lng}`)
    .join('|');

  const url = new URL(
    'https://maps.googleapis.com/maps/api/distancematrix/json',
  );
  url.searchParams.set('origins', originsStr);
  url.searchParams.set('destinations', destinationsStr);
  url.searchParams.set('mode', mode);
  url.searchParams.set('key', apiKey);

  try {
    logger.debug(`Calling Google Maps API for ${origins.length} origins`);
    const response = await fetch(url.toString());
    const data: DistanceMatrixResponse = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${data.status}`);
    }

    return data.rows.map((row) =>
      row.elements.map((element) => {
        if (element.status !== 'OK' || !element.distance || !element.duration) {
          return {
            distanceKm: 0,
            durationMinutes: 0,
            distanceText: 'N/A',
            durationText: 'N/A',
          };
        }

        return {
          distanceKm: element.distance.value / 1000, // Convert meters to km
          durationMinutes: Math.ceil(element.duration.value / 60), // Convert seconds to minutes
          distanceText: element.distance.text,
          durationText: element.duration.text,
        };
      }),
    );
  } catch (error) {
    logger.error('Failed to get distances from Google Maps', error);
    throw error;
  }
}

/**
 * Calculate distance between two points using Google Maps
 *
 * @param fromLat - Origin latitude
 * @param fromLon - Origin longitude
 * @param toLat - Destination latitude
 * @param toLon - Destination longitude
 * @param mode - Travel mode
 * @param apiKey - Google Maps API key
 * @returns Distance and duration
 */
export async function getDistanceBetweenPoints(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
  apiKey: string,
): Promise<DistanceResult> {
  const results = await getActualDistances(
    [[fromLat, fromLon]],
    [[toLat, toLon]],
    mode,
    apiKey,
  );

  return results[0][0];
}

/**
 * Optimize route using Google Maps Directions API with waypoints
 * This uses waypoint optimization to find the best order
 *
 * Cost: $5 per 1,000 requests (after 40,000 free/month)
 * Additional: $10 per 1,000 with optimization enabled
 */
export async function optimizeRoute(
  origin: [number, number],
  waypoints: Array<[number, number]>,
  destination: [number, number],
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
  apiKey: string,
): Promise<{
  optimizedOrder: number[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
}> {
  const originStr = `${origin[0]},${origin[1]}`;
  const destinationStr = `${destination[0]},${destination[1]}`;
  const waypointsStr = waypoints.map(([lat, lng]) => `${lat},${lng}`).join('|');

  const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
  url.searchParams.set('origin', originStr);
  url.searchParams.set('destination', destinationStr);
  url.searchParams.set('waypoints', `optimize:true|${waypointsStr}`);
  url.searchParams.set('mode', mode);
  url.searchParams.set('key', apiKey);

  try {
    logger.debug(`Optimizing route with ${waypoints.length} waypoints`);
    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${data.status}`);
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    return {
      optimizedOrder: route.waypoint_order || [],
      totalDistanceKm: leg.distance.value / 1000,
      totalDurationMinutes: Math.ceil(leg.duration.value / 60),
    };
  } catch (error) {
    logger.error('Failed to optimize route', error);
    throw error;
  }
}
