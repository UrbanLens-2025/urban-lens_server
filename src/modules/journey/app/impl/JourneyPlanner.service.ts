import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePersonalJourneyDto } from 'src/common/dto/journey/CreatePersonalJourney.dto';
import {
  JourneyLocationDto,
  PersonalJourneyResponseDto,
} from 'src/common/dto/journey/PersonalJourneyResponse.dto';
import { IJourneyPlannerService } from '../IJourneyPlanner.service';
import { ILocationRepository } from '../../infra/repository/ILocation.repository';
import { IUserProfileRepository } from '../../infra/repository/IUserProfile.repository';
import { GoogleMapsService } from '@/common/core/google-maps/GoogleMaps.service';
import { TravelMode } from '@googlemaps/google-maps-services-js';
import {
  calculateDistance,
  estimateTravelTime,
} from '@/common/utils/distance.util';

interface LocationCandidate {
  id: string;
  name: string;
  description: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  imageUrl: string[];
  preferenceScore: number;
  tags: Array<{ id: number; displayName: string }>;
}

interface RoutePoint {
  latitude: number;
  longitude: number;
  location?: LocationCandidate;
}

@Injectable()
export class JourneyPlannerService implements IJourneyPlannerService {
  private readonly logger = new Logger(JourneyPlannerService.name);

  constructor(
    @Inject(ILocationRepository)
    private readonly locationRepository: ILocationRepository,
    @Inject(IUserProfileRepository)
    private readonly userProfileRepository: IUserProfileRepository,
    private readonly googleMapsService: GoogleMapsService,
  ) {}

  async createPersonalJourney(
    userId: string,
    dto: CreatePersonalJourneyDto,
  ): Promise<PersonalJourneyResponseDto> {
    this.logger.log(`Creating journey for user ${userId}`);

    // 1. Get user preferences
    const userProfile =
      await this.userProfileRepository.findByAccountId(userId);
    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    const userTagScores = userProfile.tagScores || {};
    const tagScoreCount = Object.keys(userTagScores).length;
    const hasLimitedPreferences = tagScoreCount < 3;

    this.logger.debug(
      `User tag scores (${tagScoreCount} tags): ${JSON.stringify(userTagScores)}`,
    );

    if (hasLimitedPreferences) {
      this.logger.log(
        'User has limited tag preferences, will prioritize locations with high ratings',
      );
    }

    // 2. Determine search area
    const searchCenter = {
      latitude: dto.preferredAreaLatitude ?? dto.currentLatitude,
      longitude: dto.preferredAreaLongitude ?? dto.currentLongitude,
    };
    // Use preferredAreaRadiusKm if specified, otherwise fall back to maxRadiusKm
    const searchRadiusKm = dto.preferredAreaRadiusKm ?? dto.maxRadiusKm ?? 10;

    this.logger.debug(
      `Search center: (${searchCenter.latitude}, ${searchCenter.longitude}), radius: ${searchRadiusKm}km`,
    );

    // 3. Find candidate locations
    const candidates = await this.locationRepository.findNearbyWithTags(
      searchCenter.latitude,
      searchCenter.longitude,
      searchRadiusKm,
    );

    if (candidates.length === 0) {
      throw new NotFoundException(
        'No locations found in the specified area. Try increasing the search radius.',
      );
    }

    this.logger.debug(`Found ${candidates.length} candidate locations`);

    // 4. Score locations based on user preferences
    const scoredCandidates = this.scoreLocations(
      candidates,
      userTagScores,
      hasLimitedPreferences,
    );

    // 5. Select top N locations
    const topLocations = scoredCandidates
      .sort((a, b) => b.preferenceScore - a.preferenceScore)
      .slice(0, dto.numberOfLocations * 2); // Get more candidates for route optimization

    if (topLocations.length < dto.numberOfLocations) {
      this.logger.warn(
        `Only found ${topLocations.length} locations, less than requested ${dto.numberOfLocations}`,
      );
    }

    // 6. Optimize route
    const startPoint: RoutePoint = {
      latitude: dto.currentLatitude,
      longitude: dto.currentLongitude,
    };

    const endPoint: RoutePoint | undefined = dto.endLatitude
      ? {
          latitude: dto.endLatitude,
          longitude: dto.endLongitude!,
        }
      : undefined;

    // Use Google Maps if available, otherwise fallback to Haversine
    const useGoogleMaps = this.googleMapsService.isEnabled();
    this.logger.debug(
      `Route optimization using: ${useGoogleMaps ? 'Google Maps API' : 'Haversine formula'}`,
    );

    const optimizedRoute = await this.optimizeRoute(
      startPoint,
      topLocations,
      dto.numberOfLocations,
      endPoint,
      useGoogleMaps,
    );

    // 7. Build response with actual distances
    return this.buildJourneyResponse(
      startPoint,
      optimizedRoute,
      endPoint,
      useGoogleMaps,
    );
  }

  /**
   * Score locations based on user tag preferences and ratings
   */
  private scoreLocations(
    locations: Array<{
      id: string;
      name: string;
      description: string;
      addressLine: string;
      latitude: number;
      longitude: number;
      imageUrl: string[];
      tags?: Array<{ tag: { id: number; displayName: string } }>;
      analytics?: { averageRating: number; totalReviews: number };
    }>,
    userTagScores: Record<string, number>,
    prioritizeRating: boolean = false,
  ): LocationCandidate[] {
    return locations.map((location) => {
      let totalScore = 0;
      let matchCount = 0;

      const tags = (location.tags || []).map((lt) => ({
        id: lt.tag.id,
        displayName: lt.tag.displayName,
      }));

      // Calculate preference score from tags
      tags.forEach((tag) => {
        const tagKey = `tag_${tag.id}`;
        const userScore = userTagScores[tagKey] ?? 0;
        if (userScore > 0) {
          totalScore += userScore;
          matchCount++;
        }
      });

      // Calculate tag-based score (0-100)
      let tagScore =
        matchCount > 0 ? Math.min(100, (totalScore / matchCount) * 2) : 0;

      // Get rating-based score (0-100)
      const averageRating = location.analytics?.averageRating || 0;
      const totalReviews = location.analytics?.totalReviews || 0;
      const ratingScore = (averageRating / 5) * 100;

      // Blend scores based on user preference data availability
      let preferenceScore: number;

      if (prioritizeRating) {
        // User has limited tag history → prioritize rating
        if (totalReviews > 0) {
          // 70% rating, 30% tag match
          preferenceScore = ratingScore * 0.7 + tagScore * 0.3;
        } else {
          // No reviews → use tag score only (might be 0)
          preferenceScore = tagScore || 50; // Default 50 if no data
        }
      } else {
        // User has good tag history → prioritize tag match
        if (tagScore > 0) {
          // 70% tag match, 30% rating boost
          preferenceScore = tagScore * 0.7 + ratingScore * 0.3;
        } else {
          // No tag match → fallback to rating
          preferenceScore = ratingScore;
        }
      }

      return {
        id: location.id,
        name: location.name,
        description: location.description,
        addressLine: location.addressLine,
        latitude: location.latitude,
        longitude: location.longitude,
        imageUrl: location.imageUrl,
        preferenceScore: Math.round(preferenceScore * 10) / 10,
        tags,
      };
    });
  }

  /**
   * Optimize route using greedy nearest neighbor with preference weighting
   */
  private async optimizeRoute(
    start: RoutePoint,
    candidates: LocationCandidate[],
    count: number,
    end?: RoutePoint,
    useGoogleMaps: boolean = false,
  ): Promise<LocationCandidate[]> {
    const route: LocationCandidate[] = [];
    const remaining = [...candidates];
    let current = start;

    // Greedy selection: balance between preference score and distance
    while (route.length < count && remaining.length > 0) {
      let bestIndex = 0;
      let bestScore = -Infinity;

      // Calculate distances (use Google Maps if enabled)
      let distances: number[];
      if (useGoogleMaps) {
        try {
          const origin = { lat: current.latitude, lng: current.longitude };
          const destinations = remaining.map((c) => ({
            lat: c.latitude,
            lng: c.longitude,
          }));

          const results = await this.googleMapsService.getDistancesToMultiple(
            origin,
            destinations,
            TravelMode.driving,
          );

          distances = results.map((r) => r.distanceKm);
        } catch (error) {
          this.logger.warn('Google Maps API failed, falling back to Haversine');
          distances = remaining.map((c) =>
            this.calculateDistance(
              current.latitude,
              current.longitude,
              c.latitude,
              c.longitude,
            ),
          );
        }
      } else {
        distances = remaining.map((c) =>
          this.calculateDistance(
            current.latitude,
            current.longitude,
            c.latitude,
            c.longitude,
          ),
        );
      }

      // Find best candidate
      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];
        const distance = distances[i];

        // Composite score: preference (70%) + distance penalty (30%)
        // Closer locations and higher preference scores are favored
        const distancePenalty = Math.max(0, 100 - distance * 10); // 10km = 0 points
        const compositeScore =
          candidate.preferenceScore * 0.7 + distancePenalty * 0.3;

        if (compositeScore > bestScore) {
          bestScore = compositeScore;
          bestIndex = i;
        }
      }

      const selected = remaining.splice(bestIndex, 1)[0];
      route.push(selected);
      current = {
        latitude: selected.latitude,
        longitude: selected.longitude,
        location: selected,
      };
    }

    // If end point is specified, try to get closer to it
    if (end && route.length > 1) {
      // Sort last few locations to move closer to end point
      const lastSegmentSize = Math.min(3, Math.floor(route.length / 2));
      const fixedPart = route.slice(0, route.length - lastSegmentSize);
      const flexiblePart = route.slice(route.length - lastSegmentSize);

      flexiblePart.sort((a, b) => {
        const distA = this.calculateDistance(
          a.latitude,
          a.longitude,
          end.latitude,
          end.longitude,
        );
        const distB = this.calculateDistance(
          b.latitude,
          b.longitude,
          end.latitude,
          end.longitude,
        );
        return distB - distA; // Furthest first, so closest is last
      });

      return [...fixedPart, ...flexiblePart];
    }

    return route;
  }

  /**
   * Calculate Haversine distance between two points (in km)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Build final response with all journey details
   */
  private async buildJourneyResponse(
    start: RoutePoint,
    route: LocationCandidate[],
    end?: RoutePoint,
    useGoogleMaps: boolean = false,
  ): Promise<PersonalJourneyResponseDto> {
    const locations: JourneyLocationDto[] = [];
    let totalDistance = 0;
    let totalTime = 0;
    let totalPreferenceScore = 0;

    let prevPoint = start;

    // Get actual distances and times if Google Maps is enabled
    let distancesAndTimes: Array<{ distance: number; time: number }> = [];

    if (useGoogleMaps) {
      try {
        const points = [
          start,
          ...route.map((r) => ({
            latitude: r.latitude,
            longitude: r.longitude,
          })),
        ];
        const pairs: Array<{
          origin: { lat: number; lng: number };
          destination: { lat: number; lng: number };
        }> = [];

        for (let i = 0; i < points.length - 1; i++) {
          pairs.push({
            origin: { lat: points[i].latitude, lng: points[i].longitude },
            destination: {
              lat: points[i + 1].latitude,
              lng: points[i + 1].longitude,
            },
          });
        }

        const results = await this.googleMapsService.batchGetDistances(
          pairs,
          TravelMode.driving,
        );

        distancesAndTimes = results.map((r) => ({
          distance: r.distanceKm,
          time: r.durationMinutes,
        }));

        this.logger.debug(
          `Got ${distancesAndTimes.length} actual distances from Google Maps`,
        );
      } catch (error) {
        this.logger.warn(
          'Failed to get Google Maps distances, using Haversine',
        );
        useGoogleMaps = false;
      }
    }

    route.forEach((location, index) => {
      let distance: number;
      let travelTime: number;

      if (useGoogleMaps && distancesAndTimes[index]) {
        distance = distancesAndTimes[index].distance;
        travelTime = distancesAndTimes[index].time;
      } else {
        distance = this.calculateDistance(
          prevPoint.latitude,
          prevPoint.longitude,
          location.latitude,
          location.longitude,
        );
        // Estimate travel time: ~30 km/h average speed in city
        travelTime = Math.ceil((distance / 30) * 60); // minutes
      }

      locations.push({
        id: location.id,
        name: location.name,
        description: location.description,
        addressLine: location.addressLine,
        latitude: location.latitude,
        longitude: location.longitude,
        imageUrl: location.imageUrl?.[0] ?? null, // Use first image or null
        preferenceScore: location.preferenceScore,
        distanceFromPrevious: Math.round(distance * 100) / 100,
        estimatedTravelTimeMinutes: travelTime,
        order: index + 1,
        matchingTags: location.tags.map((t) => t.displayName),
      });

      totalDistance += distance;
      totalTime += travelTime;
      totalPreferenceScore += location.preferenceScore;

      prevPoint = {
        latitude: location.latitude,
        longitude: location.longitude,
      };
    });

    // If end point is specified, add final leg
    if (end) {
      let finalDistance: number;
      let finalTime: number;

      if (useGoogleMaps) {
        try {
          const result = await this.googleMapsService.getDistance(
            { lat: prevPoint.latitude, lng: prevPoint.longitude },
            { lat: end.latitude, lng: end.longitude },
            TravelMode.driving,
          );
          finalDistance = result.distanceKm;
          finalTime = result.durationMinutes;
        } catch (error) {
          finalDistance = this.calculateDistance(
            prevPoint.latitude,
            prevPoint.longitude,
            end.latitude,
            end.longitude,
          );
          finalTime = Math.ceil((finalDistance / 30) * 60);
        }
      } else {
        finalDistance = this.calculateDistance(
          prevPoint.latitude,
          prevPoint.longitude,
          end.latitude,
          end.longitude,
        );
        finalTime = Math.ceil((finalDistance / 30) * 60);
      }

      totalDistance += finalDistance;
      totalTime += finalTime;
    }

    // Calculate optimization score (lower is better)
    // Factors: total distance + variance in preference scores
    const avgPreference =
      locations.length > 0 ? totalPreferenceScore / locations.length : 0;
    const preferenceVariance =
      locations.length > 0
        ? locations.reduce(
            (sum, loc) =>
              sum + Math.pow(loc.preferenceScore - avgPreference, 2),
            0,
          ) / locations.length
        : 0;

    const optimizationScore = totalDistance * 10 + preferenceVariance;

    return {
      locations,
      totalDistanceKm: Math.round(totalDistance * 100) / 100,
      estimatedTotalTimeMinutes: totalTime,
      averagePreferenceScore: Math.round(avgPreference * 10) / 10,
      optimizationScore: Math.round(optimizationScore * 10) / 10,
    };
  }
}
