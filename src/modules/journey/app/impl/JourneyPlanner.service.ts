import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePersonalJourneyDto } from 'src/common/dto/journey/CreatePersonalJourney.dto';
import {
  AIInsightsDto,
  JourneyLocationDto,
  PersonalJourneyResponseDto,
} from 'src/common/dto/journey/PersonalJourneyResponse.dto';
import { AIJourneyResponseDto } from 'src/common/dto/journey/AIJourneyResponse.dto';
import { IJourneyPlannerService } from '../IJourneyPlanner.service';
import { ILocationRepository } from '../../infra/repository/ILocation.repository';
import { IUserProfileRepository } from '../../infra/repository/IUserProfile.repository';
import { GoogleMapsService } from '@/common/core/google-maps/GoogleMaps.service';
import { OllamaService } from '@/common/core/ollama/Ollama.service';
import { TravelMode } from '@googlemaps/google-maps-services-js';
import {
  calculateDistance,
  estimateTravelTime,
} from '@/common/utils/distance.util';
import { LocationEntity } from '@/modules/business/domain/Location.entity';

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
    private readonly ollamaService: OllamaService,
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
    const hasNoPreferences = tagScoreCount === 0;
    const hasLimitedPreferences = tagScoreCount < 3;

    this.logger.debug(
      `User tag scores (${tagScoreCount} tags): ${JSON.stringify(userTagScores)}`,
    );

    if (hasNoPreferences) {
      this.logger.warn(
        '⚠️  User has NO tag preferences! Will use rating + popularity based ranking',
      );
    } else if (hasLimitedPreferences) {
      this.logger.log(
        'User has limited tag preferences, will prioritize locations with high ratings & popularity',
      );
    }

    if (
      !dto.startLocationId &&
      (dto.currentLatitude == null || dto.currentLongitude == null)
    ) {
      throw new BadRequestException(
        'Current coordinates are required when startLocationId is not provided.',
      );
    }

    let startLocation: LocationEntity | null = null;
    if (dto.startLocationId) {
      const startLocations = await this.locationRepository.findByIds([
        dto.startLocationId,
      ]);
      startLocation = startLocations[0] || null;
    } else {
      startLocation = await this.locationRepository.findNearestLocation(
        dto.currentLatitude!,
        dto.currentLongitude!,
        50,
      );
    }

    const startPoint: RoutePoint = startLocation
      ? {
          latitude: startLocation.latitude,
          longitude: startLocation.longitude,
        }
      : {
          latitude: dto.currentLatitude!,
          longitude: dto.currentLongitude!,
        };

    let endLocation: LocationEntity | null = null;
    let endPoint: RoutePoint | undefined;
    if (dto.endLocationId) {
      const endLocations = await this.locationRepository.findByIds([
        dto.endLocationId,
      ]);
      endLocation = endLocations[0] || null;
      if (endLocation) {
        endPoint = {
          latitude: endLocation.latitude,
          longitude: endLocation.longitude,
        };
      }
    } else if (dto.endLatitude && dto.endLongitude) {
      endLocation = await this.locationRepository.findNearestLocation(
        dto.endLatitude,
        dto.endLongitude,
        50,
      );
      endPoint = endLocation
        ? {
            latitude: endLocation.latitude,
            longitude: endLocation.longitude,
          }
        : {
            latitude: dto.endLatitude,
            longitude: dto.endLongitude,
          };
    }

    const searchCenter = {
      latitude: startPoint.latitude,
      longitude: startPoint.longitude,
    };
    const searchRadiusKm = 5;

    this.logger.debug(
      `Search center: (${searchCenter.latitude}, ${searchCenter.longitude}), radius: ${searchRadiusKm}km`,
    );

    let nearbyCandidates = await this.locationRepository.findNearbyWithTags(
      searchCenter.latitude,
      searchCenter.longitude,
      searchRadiusKm,
      dto.numberOfLocations * 3,
    );

    let currentRadius = searchRadiusKm;
    const maxExpandedRadius = 20;
    while (
      nearbyCandidates.length < dto.numberOfLocations &&
      currentRadius < maxExpandedRadius
    ) {
      currentRadius = Math.min(currentRadius * 1.5, maxExpandedRadius);
      this.logger.debug(
        `Not enough locations (${nearbyCandidates.length}), expanding search radius to ${currentRadius.toFixed(1)}km...`,
      );

      nearbyCandidates = await this.locationRepository.findNearbyWithTags(
        searchCenter.latitude,
        searchCenter.longitude,
        currentRadius,
        dto.numberOfLocations * 3,
      );
    }

    if (nearbyCandidates.length === 0) {
      throw new NotFoundException(
        'No locations found in the specified area. Try increasing the search radius.',
      );
    }

    this.logger.debug(
      `Found ${nearbyCandidates.length} candidate locations within ${currentRadius.toFixed(1)}km`,
    );

    // 4. Score locations based on user preferences
    const scoredCandidates = this.scoreLocations(
      nearbyCandidates,
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

    // 6. Optimize route. startPoint and endPoint already determined above.

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
      averageRating?: number;
      totalReviews?: number;
      totalCheckIns?: number;
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
      // Convert to numbers since DB might return bigint/string
      const averageRating = Number(location.averageRating || 0);
      const totalReviews = Number(location.totalReviews || 0);
      const totalCheckIns = Number(location.totalCheckIns || 0);
      const ratingScore = (averageRating / 5) * 100;

      // Calculate popularity score based on check-ins (0-100)
      // More check-ins = higher popularity
      // Use logarithmic scale: log10(checkIns + 1) * 20
      // 1 check-in ≈ 6 points, 10 ≈ 20 points, 100 ≈ 40 points, 1000 ≈ 60 points
      const popularityScore = Math.min(100, Math.log10(totalCheckIns + 1) * 20);

      // Blend scores based on user preference data availability
      let preferenceScore: number;
      let scoringMethod: string;

      if (prioritizeRating) {
        // User has limited/no tag history → prioritize rating & popularity
        if (totalReviews > 0 || totalCheckIns > 0) {
          // 50% rating, 30% popularity, 20% tag match
          preferenceScore =
            ratingScore * 0.5 + popularityScore * 0.3 + tagScore * 0.2;
          scoringMethod = 'rating+popularity';
        } else {
          // No data at all → use tag score or very low default
          preferenceScore = tagScore > 0 ? tagScore : 20; // Low score for unknown locations
          scoringMethod = 'fallback';
        }
      } else {
        // User has good tag history → prioritize tag match
        if (tagScore > 0) {
          // 70% tag match, 20% rating, 10% popularity
          preferenceScore =
            tagScore * 0.7 + ratingScore * 0.2 + popularityScore * 0.1;
          scoringMethod = 'tag-based';
        } else {
          // No tag match → fallback to rating + popularity
          if (totalReviews > 0 || totalCheckIns > 0) {
            // 60% rating, 40% popularity
            preferenceScore = ratingScore * 0.6 + popularityScore * 0.4;
            scoringMethod = 'rating+popularity (no match)';
          } else {
            // No data at all → very low score
            preferenceScore = 20;
            scoringMethod = 'unknown';
          }
        }
      }

      this.logger.debug(
        `${location.name}: score=${preferenceScore.toFixed(1)} [${scoringMethod}] ` +
          `(tag=${tagScore.toFixed(0)}, rating=${ratingScore.toFixed(0)}, pop=${popularityScore.toFixed(0)}, ` +
          `reviews=${totalReviews}, checkIns=${totalCheckIns})`,
      );

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
    prioritizeDistance: boolean = false, // New parameter for AI journey
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

          if (prioritizeDistance) {
            this.logger.debug(
              `Distances from current: ${remaining.map((c, i) => `${c.name}: ${distances[i].toFixed(2)}km`).join(', ')}`,
            );
          }
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

        let compositeScore: number;

        if (prioritizeDistance) {
          // For AI journey: Only optimize by distance (nearest neighbor)
          compositeScore = -distance; // Negative so closer = higher score
        } else {
          // For algorithm journey: Balance preference and distance
          // Composite score: preference (70%) + distance penalty (30%)
          const distancePenalty = Math.max(0, 100 - distance * 10); // 10km = 0 points
          compositeScore =
            candidate.preferenceScore * 0.7 + distancePenalty * 0.3;
        }

        if (compositeScore > bestScore) {
          bestScore = compositeScore;
          bestIndex = i;
        }
      }

      const selected = remaining.splice(bestIndex, 1)[0];

      if (prioritizeDistance) {
        this.logger.debug(
          `Selected ${selected.name} (distance: ${distances[bestIndex].toFixed(2)}km from current point)`,
        );
      }

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

    // Note: endPoint is used for route optimization but NOT included in totalDistance
    // totalDistance only includes distances between locations in the journey

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

  async createAIPoweredJourney(
    userId: string,
    dto: CreatePersonalJourneyDto,
  ): Promise<AIJourneyResponseDto> {
    const startTime = Date.now();

    if (!this.ollamaService.isEnabled()) {
      throw new BadRequestException(
        'AI-powered journey is not available. Please set OLLAMA_ENABLED=true',
      );
    }

    this.logger.log(
      `Creating AI-powered journey for user ${userId} with ${dto.numberOfLocations} locations`,
    );

    if (
      !dto.startLocationId &&
      (dto.currentLatitude == null || dto.currentLongitude == null)
    ) {
      throw new BadRequestException(
        'Current coordinates are required when startLocationId is not provided.',
      );
    }

    // Parallelize: Get user profile and determine start/end locations simultaneously
    const [userProfile, startLocationResult, endLocationResult] =
      await Promise.all([
        this.userProfileRepository.findByAccountId(userId),
        dto.startLocationId
          ? this.locationRepository
              .findByIds([dto.startLocationId])
              .then((locs) => locs[0] || null)
          : this.locationRepository.findNearestLocation(
              dto.currentLatitude!,
              dto.currentLongitude!,
              50,
            ),
        dto.endLocationId
          ? this.locationRepository
              .findByIds([dto.endLocationId])
              .then((locs) => locs[0] || null)
          : Promise.resolve(null),
      ]);

    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    const userTagScores = userProfile.tagScores || {};

    // Determine start location
    let startLocation: LocationEntity | null = startLocationResult;
    let startPoint: RoutePoint;

    if (dto.startLocationId && startLocation) {
      startPoint = {
        latitude: startLocation.latitude,
        longitude: startLocation.longitude,
      };
      this.logger.log(
        `Using provided start location: ${startLocation.name} (${startLocation.id})`,
      );
    } else if (startLocation) {
      startPoint = {
        latitude: startLocation.latitude,
        longitude: startLocation.longitude,
      };
      this.logger.log(
        `Found nearest location to current position: ${startLocation.name} (${startLocation.id})`,
      );
    } else {
      // Fallback to current position
      startPoint = {
        latitude: dto.currentLatitude!,
        longitude: dto.currentLongitude!,
      };
      this.logger.warn(
        'No nearby location found, using current position as start point',
      );
    }

    // Determine end location
    let endLocation: LocationEntity | null = endLocationResult;
    let endPoint: RoutePoint | null = null;

    if (dto.endLocationId && endLocation) {
      endPoint = {
        latitude: endLocation.latitude,
        longitude: endLocation.longitude,
      };
      this.logger.log(
        `Using provided end location: ${endLocation.name} (${endLocation.id})`,
      );
    } else if (dto.endLatitude && dto.endLongitude) {
      endPoint = {
        latitude: dto.endLatitude,
        longitude: dto.endLongitude,
      };
    }

    // Prepare wishlist location IDs (exclude start and end if they're in wishlist)
    const wishlistIds = dto.wishlistLocationIds || [];
    const excludedIds = new Set<string>();
    if (startLocation) excludedIds.add(startLocation.id);
    if (endLocation) excludedIds.add(endLocation.id);
    const filteredWishlistIds = wishlistIds.filter(
      (id) => !excludedIds.has(id),
    );

    this.logger.log(
      `Wishlist locations: ${filteredWishlistIds.length} (${filteredWishlistIds.join(', ')})`,
    );

    // 3. Determine search area based on start point (current location if fallback)
    const searchCenter = {
      latitude: startPoint.latitude,
      longitude: startPoint.longitude,
    };
    const searchRadiusKm = 5;

    this.logger.debug(
      `Search center: (${searchCenter.latitude}, ${searchCenter.longitude}), radius: ${searchRadiusKm}km`,
    );

    let nearbyCandidates = await this.locationRepository.findNearbyWithTags(
      searchCenter.latitude,
      searchCenter.longitude,
      searchRadiusKm,
      dto.numberOfLocations * 3,
    );

    let currentRadius = searchRadiusKm;
    const maxExpandedRadius = 20;
    while (
      nearbyCandidates.length < dto.numberOfLocations &&
      currentRadius < maxExpandedRadius
    ) {
      currentRadius = Math.min(currentRadius * 1.5, maxExpandedRadius);
      this.logger.debug(
        `Not enough locations (${nearbyCandidates.length}), expanding search radius to ${currentRadius.toFixed(1)}km...`,
      );

      nearbyCandidates = await this.locationRepository.findNearbyWithTags(
        searchCenter.latitude,
        searchCenter.longitude,
        currentRadius,
        dto.numberOfLocations * 3,
      );
    }

    if (nearbyCandidates.length === 0) {
      throw new NotFoundException(
        'No locations found in the specified area. Try increasing the search radius.',
      );
    }

    this.logger.debug(
      `Found ${nearbyCandidates.length} candidate locations within ${currentRadius.toFixed(1)}km`,
    );

    // Call AI agent to query database and plan journey
    const aiResponse = await this.ollamaService.generateJourneyWithDBAccess({
      userId,
      userPreferences: userTagScores,
      currentLocation: {
        latitude: startPoint.latitude,
        longitude: startPoint.longitude,
      },
      numberOfLocations: dto.numberOfLocations,
      maxRadiusKm: 5,
    });

    // Early validation - fail fast if AI response is invalid
    if (!aiResponse || !aiResponse.suggestedLocationIds) {
      throw new BadRequestException(
        'AI failed to generate journey. Cannot proceed without AI response. Please try again.',
      );
    }

    if (aiResponse.suggestedLocationIds.length === 0) {
      throw new BadRequestException(
        'AI did not return any location IDs. Cannot proceed without AI-provided locations.',
      );
    }

    this.logger.debug(
      `AI suggested ${aiResponse.suggestedLocationIds.length} locations: ${aiResponse.suggestedLocationIds.join(', ')}`,
    );

    // Prepare location IDs list (will be used for parallel fetch)
    let locationIds = [...(aiResponse.suggestedLocationIds || [])];

    // Add wishlist locations if not already included
    if (filteredWishlistIds.length > 0) {
      const aiLocationIdsSet = new Set(locationIds);
      filteredWishlistIds.forEach((id) => {
        if (!aiLocationIdsSet.has(id)) {
          locationIds.push(id);
        }
      });
    }

    // Ensure start and end locations are included if they exist
    if (startLocation && !locationIds.includes(startLocation.id)) {
      locationIds.unshift(startLocation.id); // Add to beginning
    }
    if (endLocation && !locationIds.includes(endLocation.id)) {
      locationIds.push(endLocation.id); // Add to end
    }

    // Fetch locations from database (can be parallelized with other operations if needed)
    let locations = await this.locationRepository.findByIds(locationIds);

    if (locations.length === 0) {
      throw new NotFoundException('No locations found for AI suggestions');
    }

    // Prioritize wishlist locations in the list
    if (filteredWishlistIds.length > 0) {
      const wishlistMap = new Map(
        locations
          .filter((loc) => filteredWishlistIds.includes(loc.id))
          .map((loc) => [loc.id, loc]),
      );
      const nonWishlistLocations = locations.filter(
        (loc) => !filteredWishlistIds.includes(loc.id),
      );
      // Put wishlist locations first
      locations = [
        ...Array.from(wishlistMap.values()),
        ...nonWishlistLocations,
      ];
    }

    // If AI didn't return enough locations, fail (no fallback - AI only)
    if (locations.length < dto.numberOfLocations) {
      throw new BadRequestException(
        `AI only returned ${locations.length}/${dto.numberOfLocations} locations. Cannot proceed without AI-provided locations.`,
      );
    }

    // Limit locations to numberOfLocations (excluding start/end if they're separate)
    const maxLocations = dto.numberOfLocations;
    if (locations.length > maxLocations) {
      // Keep start and end if they exist, then fill with others
      const finalLocations: LocationEntity[] = [];
      const usedIds = new Set<string>();

      // Add start location first if it exists and is not in the main list
      if (startLocation && !locations.some((l) => l.id === startLocation!.id)) {
        finalLocations.push(startLocation);
        usedIds.add(startLocation.id);
      }

      // Add locations up to limit
      for (const loc of locations) {
        if (finalLocations.length >= maxLocations) break;
        if (!usedIds.has(loc.id)) {
          finalLocations.push(loc);
          usedIds.add(loc.id);
        }
      }

      // Add end location if it exists and not already included
      if (endLocation && !usedIds.has(endLocation.id)) {
        if (finalLocations.length < maxLocations) {
          finalLocations.push(endLocation);
        } else {
          // Replace last location with end location
          finalLocations[finalLocations.length - 1] = endLocation;
        }
      }

      locations = finalLocations;
      this.logger.log(
        `Limited locations to ${locations.length} (requested: ${maxLocations})`,
      );
    }

    // Map locations to candidates with real preference scores
    // Optimized: Skip debug logging for better performance
    const candidates: LocationCandidate[] = locations.map((loc) => {
      // Calculate preference score based on analytics
      // Convert to numbers since DB might return bigint/string
      const averageRating = Number(loc.averageRating || 0);
      const totalReviews = Number(loc.totalReviews || 0);
      const totalCheckIns = Number(loc.totalCheckIns || 0);

      const ratingScore = (averageRating / 5) * 100;
      const popularityScore = Math.min(100, Math.log10(totalCheckIns + 1) * 20);

      // For AI journey: 60% rating, 40% popularity (no tag matching)
      let preferenceScore: number;
      if (totalReviews > 0 || totalCheckIns > 0) {
        preferenceScore = ratingScore * 0.6 + popularityScore * 0.4;
      } else {
        // Unknown location with no data
        preferenceScore = 30; // Low but not zero
      }

      return {
        id: loc.id,
        name: loc.name,
        description: loc.description,
        addressLine: loc.addressLine,
        latitude: loc.latitude,
        longitude: loc.longitude,
        imageUrl: loc.imageUrl || [],
        preferenceScore: Math.round(preferenceScore * 10) / 10,
        tags:
          loc.tags?.map((t) => ({
            id: t.tag.id,
            displayName: t.tag.displayName,
          })) || [],
      };
    });

    // Optimize route and calculate metrics in single pass (optimized)
    // Check Google Maps availability early (lightweight operation)
    const useGoogleMaps = this.googleMapsService.isEnabled();
    const route = await this.optimizeRouteWithMetrics(
      startPoint,
      candidates,
      candidates.length, // Use all AI-selected locations
      endPoint ?? undefined,
      useGoogleMaps,
    );

    // Add AI-suggested activities to each location (reduced logging for speed)
    // Only use AI-suggested activities (no fallback)
    route.locations.forEach((loc) => {
      if (
        aiResponse.locationActivities &&
        aiResponse.locationActivities[loc.id]
      ) {
        // Use AI suggestion only
        loc.suggestedActivity = aiResponse.locationActivities[loc.id];
      }
      // If AI didn't provide activity, leave it undefined (no fallback generation)
    });

    const responseTimeMs = Date.now() - startTime;
    const responseTimeSeconds = responseTimeMs / 1000;
    this.logger.log(
      `✅ AI journey created in ${responseTimeSeconds.toFixed(2)}s (${responseTimeMs}ms)`,
    );

    return {
      locations: route.locations,
      totalDistanceKm: route.totalDistanceKm,
      estimatedTotalTimeMinutes: route.estimatedTotalTimeMinutes,
      averagePreferenceScore: route.averagePreferenceScore,
      optimizationScore: route.optimizationScore,
      aiInsights: {
        reasoning: aiResponse.reasoning,
        tips: aiResponse.tips,
      },
      responseTimeSeconds: Math.round(responseTimeSeconds * 100) / 100, // Round to 2 decimal places
    };
  }

  /**
   * Optimize route and calculate metrics in single pass (optimized version)
   * Combines optimizeRoute + calculateRouteMetrics to reduce passes
   */
  private async optimizeRouteWithMetrics(
    startPoint: RoutePoint,
    candidates: LocationCandidate[],
    count: number,
    endPoint?: RoutePoint,
    useGoogleMaps: boolean = false,
  ): Promise<{
    locations: JourneyLocationDto[];
    totalDistanceKm: number;
    estimatedTotalTimeMinutes: number;
    averagePreferenceScore: number;
    optimizationScore: number;
  }> {
    const route: LocationCandidate[] = [];
    const remaining = [...candidates];
    let current = startPoint;
    const journeyLocations: JourneyLocationDto[] = [];
    let totalDistance = 0;
    let totalTime = 0;

    // Optimize route using greedy nearest neighbor (distance-only for AI journey)
    // OPTIMIZED: Use Haversine for route optimization (fast), Google Maps only for final calculation
    while (route.length < count && remaining.length > 0) {
      let bestIndex = 0;
      let bestScore = -Infinity;

      // Use Haversine for optimization (much faster, no API calls)
      // Google Maps will be used later for final accurate distances
      const distances = remaining.map((c) =>
        this.calculateDistance(
          current.latitude,
          current.longitude,
          c.latitude,
          c.longitude,
        ),
      );

      // Find best candidate (distance-only for AI journey)
      for (let i = 0; i < remaining.length; i++) {
        const distance = distances[i];
        const compositeScore = -distance; // Negative so closer = higher score
        if (compositeScore > bestScore) {
          bestScore = compositeScore;
          bestIndex = i;
        }
      }

      const selected = remaining.splice(bestIndex, 1)[0];
      route.push(selected);

      // Use Haversine distance for optimization (will recalculate with Google Maps later if needed)
      const segmentDistance = distances[bestIndex];
      const segmentTime = estimateTravelTime(segmentDistance);

      totalDistance += segmentDistance;
      totalTime += segmentTime;

      // Build journey location
      journeyLocations.push({
        id: selected.id,
        name: selected.name,
        description: selected.description,
        addressLine: selected.addressLine,
        latitude: selected.latitude,
        longitude: selected.longitude,
        imageUrl: selected.imageUrl[0] || null,
        preferenceScore: selected.preferenceScore,
        distanceFromPrevious: Math.round(segmentDistance * 100) / 100,
        estimatedTravelTimeMinutes: Math.round(segmentTime),
        order: route.length,
        matchingTags: selected.tags.map((t) => t.displayName),
        suggestedActivity: undefined, // Will be filled later
      });

      current = {
        latitude: selected.latitude,
        longitude: selected.longitude,
        location: selected,
      };
    }

    // Recalculate distances with Google Maps for final accurate metrics (batch all at once)
    // This replaces N API calls in loop with 1 batch call
    if (useGoogleMaps && route.length > 0) {
      try {
        // Prepare all segments for batch calculation
        const distancePairs: Array<{
          origin: { lat: number; lng: number };
          destination: { lat: number; lng: number };
        }> = [];

        let tempPoint = startPoint;
        for (const location of route) {
          distancePairs.push({
            origin: { lat: tempPoint.latitude, lng: tempPoint.longitude },
            destination: { lat: location.latitude, lng: location.longitude },
          });
          tempPoint = {
            latitude: location.latitude,
            longitude: location.longitude,
            location,
          };
        }

        // Batch calculate all distances at once (1 API call instead of N)
        const results = await this.googleMapsService.batchGetDistances(
          distancePairs,
          TravelMode.driving,
        );

        // Update journey locations with accurate distances and times
        totalDistance = 0;
        totalTime = 0;
        results.forEach((result, idx) => {
          const distance = result.distanceKm;
          const time = result.durationMinutes;
          totalDistance += distance;
          totalTime += time;

          if (journeyLocations[idx]) {
            journeyLocations[idx].distanceFromPrevious =
              Math.round(distance * 100) / 100;
            journeyLocations[idx].estimatedTravelTimeMinutes = Math.round(time);
          }
        });
      } catch (error) {
        this.logger.warn('Google Maps batch failed, using Haversine distances');
        // Keep Haversine distances already calculated
      }
    }

    // Handle end point if specified
    if (endPoint && route.length > 1) {
      // Sort last few locations to move closer to end point
      const lastSegmentSize = Math.min(3, Math.floor(route.length / 2));
      const fixedPart = route.slice(0, route.length - lastSegmentSize);
      const flexiblePart = route.slice(route.length - lastSegmentSize);

      flexiblePart.sort((a, b) => {
        const distA = this.calculateDistance(
          a.latitude,
          a.longitude,
          endPoint.latitude,
          endPoint.longitude,
        );
        const distB = this.calculateDistance(
          b.latitude,
          b.longitude,
          endPoint.latitude,
          endPoint.longitude,
        );
        return distB - distA;
      });

      // Reorder journey locations accordingly
      const reorderedRoute = [...fixedPart, ...flexiblePart];
      journeyLocations.forEach((loc, idx) => {
        const routeIdx = route.findIndex((r) => r.id === loc.id);
        const newIdx = reorderedRoute.findIndex((r) => r.id === loc.id);
        if (newIdx !== -1 && newIdx !== routeIdx) {
          loc.order = newIdx + 1;
        }
      });
    }

    // Calculate metrics
    const avgPreference =
      journeyLocations.length > 0
        ? journeyLocations.reduce((sum, loc) => sum + loc.preferenceScore, 0) /
          journeyLocations.length
        : 0;

    const preferenceVariance =
      journeyLocations.length > 1
        ? journeyLocations.reduce(
            (sum, loc) =>
              sum + Math.pow(loc.preferenceScore - avgPreference, 2),
            0,
          ) / journeyLocations.length
        : 0;

    const optimizationScore = totalDistance * 10 + preferenceVariance;

    return {
      locations: journeyLocations,
      totalDistanceKm: Math.round(totalDistance * 100) / 100,
      estimatedTotalTimeMinutes: totalTime,
      averagePreferenceScore: Math.round(avgPreference * 10) / 10,
      optimizationScore: Math.round(optimizationScore * 10) / 10,
    };
  }

  /**
   * Calculate route metrics for given locations (kept for backward compatibility)
   */
  private async calculateRouteMetrics(
    startPoint: RoutePoint,
    locations: LocationCandidate[],
    endPoint: RoutePoint | null,
    useGoogleMaps: boolean,
  ): Promise<{
    locations: JourneyLocationDto[];
    totalDistanceKm: number;
    estimatedTotalTimeMinutes: number;
    averagePreferenceScore: number;
    optimizationScore: number;
  }> {
    let totalDistance = 0;
    let totalTime = 0;
    let currentPoint = startPoint;

    const journeyLocations: JourneyLocationDto[] = [];

    // Prepare all distance pairs for batch calculation
    const distancePairs: Array<{
      origin: { lat: number; lng: number };
      destination: { lat: number; lng: number };
    }> = [];

    let tempPoint = startPoint;
    for (const location of locations) {
      distancePairs.push({
        origin: { lat: tempPoint.latitude, lng: tempPoint.longitude },
        destination: { lat: location.latitude, lng: location.longitude },
      });
      tempPoint = {
        latitude: location.latitude,
        longitude: location.longitude,
        location,
      };
    }

    // Batch calculate all distances at once (much faster than sequential calls)
    let distancesAndTimes: Array<{ distance: number; time: number }> = [];
    if (useGoogleMaps && distancePairs.length > 0) {
      try {
        const results = await this.googleMapsService.batchGetDistances(
          distancePairs,
          TravelMode.driving,
        );
        distancesAndTimes = results.map((r) => ({
          distance: r.distanceKm,
          time: r.durationMinutes,
        }));
      } catch (error) {
        this.logger.warn('Google Maps batch failed, using Haversine fallback');
        distancesAndTimes = distancePairs.map((pair) => {
          const distance = calculateDistance(
            pair.origin.lat,
            pair.origin.lng,
            pair.destination.lat,
            pair.destination.lng,
          );
          return {
            distance,
            time: estimateTravelTime(distance),
          };
        });
      }
    } else {
      // Use Haversine for all pairs
      distancesAndTimes = distancePairs.map((pair) => {
        const distance = calculateDistance(
          pair.origin.lat,
          pair.origin.lng,
          pair.destination.lat,
          pair.destination.lng,
        );
        return {
          distance,
          time: estimateTravelTime(distance),
        };
      });
    }

    // Build journey locations with batch-calculated distances
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      const { distance, time } = distancesAndTimes[i];

      totalDistance += distance;
      totalTime += time;

      journeyLocations.push({
        id: location.id,
        name: location.name,
        description: location.description,
        addressLine: location.addressLine,
        latitude: location.latitude,
        longitude: location.longitude,
        imageUrl: location.imageUrl[0] || null,
        preferenceScore: location.preferenceScore,
        distanceFromPrevious: Math.round(distance * 100) / 100,
        estimatedTravelTimeMinutes: Math.round(time),
        order: i + 1,
        matchingTags: location.tags.map((t) => t.displayName),
        suggestedActivity: undefined, // Will be filled by AI if available
      });
    }

    // Note: endPoint is used for route optimization but NOT included in totalDistance
    // totalDistance only includes distances between locations in the journey
    // If you want to include distance to endPoint, add it separately to response

    const avgPreference =
      journeyLocations.length > 0
        ? journeyLocations.reduce((sum, loc) => sum + loc.preferenceScore, 0) /
          journeyLocations.length
        : 0;

    const preferenceVariance =
      journeyLocations.length > 1
        ? journeyLocations.reduce(
            (sum, loc) =>
              sum + Math.pow(loc.preferenceScore - avgPreference, 2),
            0,
          ) / journeyLocations.length
        : 0;

    const optimizationScore = totalDistance * 10 + preferenceVariance;

    return {
      locations: journeyLocations,
      totalDistanceKm: Math.round(totalDistance * 100) / 100,
      estimatedTotalTimeMinutes: totalTime,
      averagePreferenceScore: Math.round(avgPreference * 10) / 10,
      optimizationScore: Math.round(optimizationScore * 10) / 10,
    };
  }
}
