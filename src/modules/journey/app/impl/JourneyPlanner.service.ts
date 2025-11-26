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
import { generateFallbackActivity } from '@/common/utils/activity-suggestion.util';

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

    // 3. Find candidate locations with auto-expanding radius
    let candidates = await this.locationRepository.findNearbyWithTags(
      searchCenter.latitude,
      searchCenter.longitude,
      searchRadiusKm,
    );

    // If not enough locations, gradually expand radius
    let currentRadius = searchRadiusKm;
    const maxExpandedRadius = 20; // Maximum 20km
    while (
      candidates.length < dto.numberOfLocations &&
      currentRadius < maxExpandedRadius
    ) {
      currentRadius = Math.min(currentRadius * 1.5, maxExpandedRadius);
      this.logger.debug(
        `Not enough locations (${candidates.length}), expanding search radius to ${currentRadius.toFixed(1)}km...`,
      );

      candidates = await this.locationRepository.findNearbyWithTags(
        searchCenter.latitude,
        searchCenter.longitude,
        currentRadius,
      );
    }

    if (candidates.length === 0) {
      throw new NotFoundException(
        'No locations found in the specified area. Try increasing the search radius.',
      );
    }

    this.logger.debug(
      `Found ${candidates.length} candidate locations within ${currentRadius.toFixed(1)}km`,
    );

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

  /**
   * Create AI-powered journey where AI queries database and plans route
   */
  async createAIPoweredJourney(
    userId: string,
    dto: CreatePersonalJourneyDto,
  ): Promise<AIJourneyResponseDto> {
    if (!this.ollamaService.isEnabled()) {
      throw new BadRequestException(
        'AI-powered journey is not available. Please set OLLAMA_ENABLED=true',
      );
    }

    this.logger.log(
      `Creating AI-powered journey for user ${userId} with ${dto.numberOfLocations} locations`,
    );

    // Get user preferences
    const userProfile =
      await this.userProfileRepository.findByAccountId(userId);
    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    const userTagScores = userProfile.tagScores || {};

    // Call AI agent to query database and plan journey
    const aiResponse = await this.ollamaService.generateJourneyWithDBAccess({
      userId,
      userPreferences: userTagScores,
      currentLocation: {
        latitude: dto.currentLatitude,
        longitude: dto.currentLongitude,
      },
      numberOfLocations: dto.numberOfLocations,
      maxRadiusKm: dto.maxRadiusKm || 10,
    });

    if (!aiResponse || !aiResponse.suggestedLocationIds) {
      throw new BadRequestException(
        'AI failed to generate journey. Please try the standard endpoint.',
      );
    }

    this.logger.debug(
      `AI suggested ${aiResponse.suggestedLocationIds.length} locations: ${aiResponse.suggestedLocationIds.join(', ')}`,
    );

    // Fetch suggested locations from database
    let locations = await this.locationRepository.findByIds(
      aiResponse.suggestedLocationIds,
    );

    if (locations.length === 0) {
      throw new NotFoundException('No locations found for AI suggestions');
    }

    // If AI didn't return enough locations, fill with nearby ones
    if (locations.length < dto.numberOfLocations) {
      this.logger.warn(
        `AI only returned ${locations.length}/${dto.numberOfLocations} locations. Filling with nearby locations...`,
      );

      // Use larger radius for fallback search (1.5x original or minimum 5km)
      const baseRadius = dto.preferredAreaRadiusKm ?? dto.maxRadiusKm ?? 10;
      const searchRadiusKm = Math.max(baseRadius * 1.5, 5);
      const searchLat = dto.preferredAreaLatitude ?? dto.currentLatitude;
      const searchLng = dto.preferredAreaLongitude ?? dto.currentLongitude;

      this.logger.debug(
        `Searching for additional locations with radius ${searchRadiusKm}km from (${searchLat}, ${searchLng})`,
      );

      const nearbyLocations = await this.locationRepository.findNearbyWithTags(
        searchLat,
        searchLng,
        searchRadiusKm,
      );

      this.logger.debug(`Found ${nearbyLocations.length} nearby locations`);

      // Filter out already selected locations and score them
      const existingIds = new Set(locations.map((l) => l.id));
      const candidateLocations = nearbyLocations.filter(
        (loc) => !existingIds.has(loc.id),
      );

      // Score candidates by rating + popularity
      const scoredCandidates = candidateLocations
        .map((loc) => {
          const avgRating = Number(loc.averageRating || 0);
          const totalReviews = Number(loc.totalReviews || 0);
          const totalCheckIns = Number(loc.totalCheckIns || 0);

          const ratingScore = (avgRating / 5) * 100;
          const popularityScore = Math.min(
            100,
            Math.log10(totalCheckIns + 1) * 20,
          );

          // 60% rating, 40% popularity
          const score =
            totalReviews > 0 || totalCheckIns > 0
              ? ratingScore * 0.6 + popularityScore * 0.4
              : 20;

          return { location: loc, score };
        })
        .sort((a, b) => b.score - a.score);

      const needed = dto.numberOfLocations - locations.length;
      const additionalLocations = scoredCandidates
        .slice(0, needed)
        .map((c) => c.location);

      locations = [...locations, ...additionalLocations];

      this.logger.log(
        `Added ${additionalLocations.length} additional locations (scored by rating+popularity). Total: ${locations.length}`,
      );

      if (locations.length < dto.numberOfLocations) {
        this.logger.warn(
          `⚠️  Could only find ${locations.length} locations within ${searchRadiusKm}km radius. User requested ${dto.numberOfLocations}.`,
        );
      }
    }

    // Calculate distances and times
    const startPoint: RoutePoint = {
      latitude: dto.currentLatitude,
      longitude: dto.currentLongitude,
    };

    const endPoint = dto.endLatitude
      ? {
          latitude: dto.endLatitude,
          longitude: dto.endLongitude!,
        }
      : null;

    // Map locations to candidates with real preference scores
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

      this.logger.debug(
        `AI location ${loc.name}: score=${preferenceScore.toFixed(1)} ` +
          `(rating=${averageRating.toFixed(1)}★/${totalReviews} reviews, checkIns=${totalCheckIns})`,
      );

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

    // Optimize route using greedy nearest neighbor algorithm
    const useGoogleMaps = this.googleMapsService.isEnabled();
    this.logger.debug(
      `Optimizing route for ${candidates.length} AI-selected locations (distance-only)...`,
    );
    const optimizedRoute = await this.optimizeRoute(
      startPoint,
      candidates,
      candidates.length, // Use all AI-selected locations
      endPoint ?? undefined,
      useGoogleMaps,
      true, // prioritizeDistance = true for AI journey
    );

    // Calculate route with distances
    const route = await this.calculateRouteMetrics(
      startPoint,
      optimizedRoute,
      endPoint,
      useGoogleMaps,
    );

    // Add AI-suggested activities to each location
    this.logger.debug(
      `AI locationActivities: ${JSON.stringify(aiResponse.locationActivities, null, 2)}`,
    );
    this.logger.debug(
      `Route location IDs: ${route.locations.map((l) => `${l.name} (${l.id})`).join(', ')}`,
    );

    route.locations.forEach((loc) => {
      if (
        aiResponse.locationActivities &&
        aiResponse.locationActivities[loc.id]
      ) {
        // Use AI suggestion if available
        loc.suggestedActivity = aiResponse.locationActivities[loc.id];
        this.logger.debug(
          `✅ Matched AI activity for ${loc.name}: ${loc.suggestedActivity}`,
        );
      } else {
        // Fallback: Generate activity based on tags
        const location = candidates.find((c) => c.id === loc.id);
        if (location) {
          loc.suggestedActivity = generateFallbackActivity(
            location.name,
            location.tags.map((t) => t.displayName),
          );
          this.logger.debug(
            `⚠️ Using fallback activity for ${loc.name}: ${loc.suggestedActivity}`,
          );
        }
      }
    });

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
    };
  }

  /**
   * Calculate route metrics for given locations
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

    // Calculate distances between consecutive points
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      const nextPoint: RoutePoint = {
        latitude: location.latitude,
        longitude: location.longitude,
        location,
      };

      let distance: number;
      let travelTime: number;

      if (useGoogleMaps) {
        try {
          const result = await this.googleMapsService.getDistance(
            { lat: currentPoint.latitude, lng: currentPoint.longitude },
            { lat: nextPoint.latitude, lng: nextPoint.longitude },
            TravelMode.driving,
          );
          distance = result.distanceKm;
          travelTime = result.durationMinutes;
        } catch (error) {
          this.logger.warn('Google Maps failed, using Haversine fallback');
          distance = calculateDistance(
            currentPoint.latitude,
            currentPoint.longitude,
            nextPoint.latitude,
            nextPoint.longitude,
          );
          travelTime = estimateTravelTime(distance);
        }
      } else {
        distance = calculateDistance(
          currentPoint.latitude,
          currentPoint.longitude,
          nextPoint.latitude,
          nextPoint.longitude,
        );
        travelTime = estimateTravelTime(distance);
      }

      totalDistance += distance;
      totalTime += travelTime;

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
        estimatedTravelTimeMinutes: Math.round(travelTime),
        order: i + 1,
        matchingTags: location.tags.map((t) => t.displayName),
        suggestedActivity: undefined, // Will be filled by AI if available
      });

      currentPoint = nextPoint;
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
