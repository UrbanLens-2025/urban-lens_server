import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ILocationService } from '../ILocation.service';
import { CreateLocationDto } from '@/common/dto/location/CreateLocation.dto';
import { UpdateLocationDto } from '@/common/dto/location/UpdateLocation.dto';
import { GetLocationsQueryDto } from '@/common/dto/location/GetLocationsQuery.dto';
import { UpdateLocationStatusDto } from '@/common/dto/location/UpdateLocationStatus.dto';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { LocationRepository } from '@/modules/business/infra/repository/Location.repository';
import { BusinessRepository } from '@/modules/account/infra/repository/Business.repository';
import { PaginationResult } from '@/common/services/base.service';
import { FindOptionsWhere, ILike } from 'typeorm';
import { BusinessRequestStatus } from '@/common/constants/Business.constant';
import { LocationRequestStatus } from '@/common/constants/Location.constant';

@Injectable()
export class LocationService implements ILocationService {
  constructor(
    private readonly locationRepository: LocationRepository,
    private readonly businessRepository: BusinessRepository,
  ) {}

  async createLocation(
    createLocationDto: CreateLocationDto,
    businessOwnerId: string,
  ): Promise<LocationEntity> {
    // Find business owned by the user
    const business = await this.businessRepository.repo.findOne({
      where: {
        accountId: businessOwnerId,
        status: BusinessRequestStatus.APPROVED, // Only approved businesses can create locations
      },
    });

    if (!business) {
      throw new NotFoundException(
        'Approved business not found. Please ensure your business is approved by admin.',
      );
    }

    // Set businessId from the found business
    createLocationDto.businessId = business.accountId;

    // Create and save location
    const location = this.locationRepository.repo.create(createLocationDto);
    return await this.locationRepository.repo.save(location);
  }

  async getLocationById(locationId: string): Promise<LocationEntity> {
    const location = await this.locationRepository.repo.findOne({
      where: { id: locationId },
      relations: ['business', 'business.account'],
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async getLocationsByBusinessId(
    businessId: string,
    queryParams: GetLocationsQueryDto,
  ): Promise<PaginationResult<LocationEntity>> {
    const {
      page = 1,
      limit = 10,
      search,
      isAvailableForRent,
      maxPricePerHour,
      maxPricePerDay,
      maxPricePerMonth,
      status,
    } = queryParams;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: FindOptionsWhere<LocationEntity> = {
      businessId,
    };

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    if (isAvailableForRent !== undefined) {
      where.isAvailableForRent = isAvailableForRent;
    }

    if (status) {
      where.status = status;
    }

    const queryBuilder = this.locationRepository.repo
      .createQueryBuilder('location')
      .where(where)
      .leftJoinAndSelect('location.business', 'business')
      .leftJoinAndSelect('business.account', 'account');

    // Add price filters
    if (maxPricePerHour !== undefined) {
      queryBuilder.andWhere(
        '(location.rentalPricePerHour IS NULL OR location.rentalPricePerHour <= :maxPricePerHour)',
        { maxPricePerHour },
      );
    }

    if (maxPricePerDay !== undefined) {
      queryBuilder.andWhere(
        '(location.rentalPricePerDay IS NULL OR location.rentalPricePerDay <= :maxPricePerDay)',
        { maxPricePerDay },
      );
    }

    if (maxPricePerMonth !== undefined) {
      queryBuilder.andWhere(
        '(location.rentalPricePerMonth IS NULL OR location.rentalPricePerMonth <= :maxPricePerMonth)',
        { maxPricePerMonth },
      );
    }

    const [locations, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('location.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: locations,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async updateLocation(
    locationId: string,
    updateLocationDto: UpdateLocationDto,
    businessOwnerId: string,
  ): Promise<LocationEntity> {
    // Find location with business relationship
    const location = await this.locationRepository.repo.findOne({
      where: { id: locationId },
      relations: ['business'],
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Check if the business owner owns this location
    if (location.business.accountId !== businessOwnerId) {
      throw new ForbiddenException(
        'You can only update locations of your own business',
      );
    }

    // Update location
    Object.assign(location, updateLocationDto);
    return await this.locationRepository.repo.save(location);
  }

  async deleteLocation(
    locationId: string,
    businessOwnerId: string,
  ): Promise<void> {
    // Find location with business relationship
    const location = await this.locationRepository.repo.findOne({
      where: { id: locationId },
      relations: ['business'],
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Check if the business owner owns this location
    if (location.business.accountId !== businessOwnerId) {
      throw new ForbiddenException(
        'You can only delete locations of your own business',
      );
    }

    await this.locationRepository.repo.remove(location);
  }

  async getLocationsWithFilters(
    queryParams: GetLocationsQueryDto,
  ): Promise<PaginationResult<LocationEntity>> {
    const {
      page = 1,
      limit = 10,
      search,
      city,
      isAvailableForRent,
      maxPricePerHour,
      maxPricePerDay,
      maxPricePerMonth,
      status,
    } = queryParams;
    const skip = (page - 1) * limit;

    const queryBuilder = this.locationRepository.repo
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.business', 'business')
      .leftJoinAndSelect('business.account', 'account');

    // Only show locations from approved businesses
    queryBuilder.where('business.status = :businessStatus', {
      businessStatus: BusinessRequestStatus.APPROVED,
    });

    // Add location status filter (default to APPROVED for public view, but allow override)
    if (status && status !== undefined) {
      queryBuilder.andWhere('location.status = :locationStatus', {
        locationStatus: status,
      });
    } else {
      queryBuilder.andWhere('location.status = :locationStatus', {
        locationStatus: LocationRequestStatus.APPROVED,
      });
    }

    console.log('=== DEBUG FILTER VALUES ===');
    console.log(
      'isAvailableForRent:',
      isAvailableForRent,
      'type:',
      typeof isAvailableForRent,
    );
    console.log(
      'isAvailableForRent === undefined:',
      isAvailableForRent === undefined,
    );
    console.log('isAvailableForRent === null:', isAvailableForRent === null);
    console.log('isAvailableForRent === false:', isAvailableForRent === false);

    // Also check what's in the database
    const dbCheck = await this.locationRepository.repo.count({
      where: {
        status: LocationRequestStatus.APPROVED,
      },
      relations: ['business'],
    });
    console.log('Total APPROVED locations in DB:', dbCheck);

    const businessCheck = await this.businessRepository.repo.count({
      where: {
        status: BusinessRequestStatus.APPROVED,
      },
    });
    console.log('Total APPROVED businesses in DB:', businessCheck);
    console.log('============================');

    if (search) {
      console.log('APPLYING SEARCH FILTER:', search);
      queryBuilder.andWhere(
        '(location.name ILIKE :search OR location.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (city) {
      console.log('APPLYING CITY FILTER:', city);
      queryBuilder.andWhere('location.city ILIKE :city', { city: `%${city}%` });
    }

    if (isAvailableForRent !== undefined && isAvailableForRent !== null) {
      console.log('APPLYING RENTAL AVAILABILITY FILTER:', isAvailableForRent);
      queryBuilder.andWhere(
        'location.isAvailableForRent = :isAvailableForRent',
        { isAvailableForRent },
      );
    }

    // Price filters
    if (
      maxPricePerHour !== undefined &&
      maxPricePerHour !== null &&
      !isNaN(maxPricePerHour)
    ) {
      console.log('APPLYING MAX PRICE PER HOUR FILTER:', maxPricePerHour);
      queryBuilder.andWhere(
        '(location.rentalPricePerHour IS NULL OR location.rentalPricePerHour <= :maxPricePerHour)',
        { maxPricePerHour },
      );
    }

    if (
      maxPricePerDay !== undefined &&
      maxPricePerDay !== null &&
      !isNaN(maxPricePerDay)
    ) {
      console.log('APPLYING MAX PRICE PER DAY FILTER:', maxPricePerDay);
      queryBuilder.andWhere(
        '(location.rentalPricePerDay IS NULL OR location.rentalPricePerDay <= :maxPricePerDay)',
        { maxPricePerDay },
      );
    }

    if (
      maxPricePerMonth !== undefined &&
      maxPricePerMonth !== null &&
      !isNaN(maxPricePerMonth)
    ) {
      console.log('APPLYING MAX PRICE PER MONTH FILTER:', maxPricePerMonth);
      queryBuilder.andWhere(
        '(location.rentalPricePerMonth IS NULL OR location.rentalPricePerMonth <= :maxPricePerMonth)',
        { maxPricePerMonth },
      );
    }

    // Optional: Enable for debugging
    // console.log('SQL Query:', queryBuilder.getSql());
    // console.log('Query Parameters:', queryBuilder.getParameters());

    const [locations, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('location.createdAt', 'DESC')
      .getManyAndCount();

    // Optional: Enable for debugging
    // console.log('Total found:', total);
    // console.log('Locations count:', locations.length);

    return {
      data: locations,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async updateLocationStatus(
    locationId: string,
    updateStatusDto: UpdateLocationStatusDto,
    adminId: string,
  ): Promise<LocationEntity> {
    // Find location by ID
    const location = await this.locationRepository.repo.findOne({
      where: { id: locationId },
      relations: ['business', 'business.account'],
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    if (updateStatusDto.status === LocationRequestStatus.REJECTED) {
      if (
        !updateStatusDto.adminNotes ||
        updateStatusDto.adminNotes.trim() === ''
      ) {
        throw new BadRequestException(
          'Admin notes are required when rejecting a location',
        );
      }
    }

    location.status = updateStatusDto.status;
    location.adminNotes =
      updateStatusDto.adminNotes || updateStatusDto.adminNotesOptional || null;

    return await this.locationRepository.repo.save(location);
  }

  async updateLocationByOwner(
    locationId: string,
    updateLocationDto: UpdateLocationDto,
    businessOwnerId: string,
  ): Promise<LocationEntity> {
    // Find location with business relationship
    const location = await this.locationRepository.repo.findOne({
      where: { id: locationId },
      relations: ['business'],
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    // Check if the business owner owns this location
    if (location.business.accountId !== businessOwnerId) {
      throw new ForbiddenException(
        'You can only update locations of your own business',
      );
    }

    // Only allow updates if location is PENDING or REJECTED
    if (location.status === LocationRequestStatus.APPROVED) {
      throw new BadRequestException(
        'Cannot update an approved location. Please contact admin for changes.',
      );
    }

    // Update location fields
    Object.assign(location, updateLocationDto);

    // Reset status to PENDING when business owner updates after rejection
    if (location.status === LocationRequestStatus.REJECTED) {
      location.status = LocationRequestStatus.PENDING;
      location.adminNotes = null; // Clear previous admin notes
    }

    return await this.locationRepository.repo.save(location);
  }

  async getAllLocationsDebug(): Promise<LocationEntity[]> {
    console.log('=== Debug: Getting all locations ===');

    // First, check locations without relations
    const locationsOnly = await this.locationRepository.repo.find();
    console.log('Locations without relations:', locationsOnly.length);

    // Then check with relations
    const allLocations = await this.locationRepository.repo.find({
      relations: ['business', 'business.account'],
    });

    console.log('Total locations in DB (with relations):', allLocations.length);

    // Also check businesses separately
    const allBusinesses = await this.businessRepository.repo.find();
    console.log('Total businesses in DB:', allBusinesses.length);

    allLocations.forEach((location, index) => {
      console.log(`Location ${index + 1}:`, {
        id: location.id,
        name: location.name,
        status: location.status,
        businessId: location.businessId,
        business: location.business
          ? {
              accountId: location.business.accountId,
              status: location.business.status,
              name: location.business.name,
            }
          : 'No business relation',
      });
    });

    // Check if there are any businesses that match the location businessIds
    if (locationsOnly.length > 0) {
      console.log('--- Checking business relationships ---');
      for (const location of locationsOnly) {
        const business = await this.businessRepository.repo.findOne({
          where: { accountId: location.businessId },
        });
        console.log(
          `Location ${location.id} -> Business ${location.businessId}:`,
          business ? 'FOUND' : 'NOT FOUND',
        );
        if (business) {
          console.log('Business details:', {
            accountId: business.accountId,
            name: business.name,
            status: business.status,
          });
        }
      }
    }

    console.log('=====================================');

    return allLocations;
  }

  async getLocationsSimple(): Promise<PaginationResult<LocationEntity>> {
    console.log('=== Simple Location Query (No Filters) ===');

    // Just get all locations with business relation, no filters
    const [locations, total] = await this.locationRepository.repo.findAndCount({
      relations: ['business', 'business.account'],
      take: 10,
      order: {
        createdAt: 'DESC',
      },
    });

    console.log('Simple query results:');
    console.log('Total found:', total);
    console.log('Locations returned:', locations.length);

    if (locations.length > 0) {
      console.log('First location details:', {
        id: locations[0].id,
        name: locations[0].name,
        status: locations[0].status,
        businessId: locations[0].businessId,
        business: locations[0].business
          ? {
              accountId: locations[0].business.accountId,
              name: locations[0].business.name,
              status: locations[0].business.status,
            }
          : 'No business',
      });
    }

    console.log('==========================================');

    return {
      data: locations,
      meta: {
        page: 1,
        limit: 10,
        totalItems: total,
        totalPages: Math.ceil(total / 10),
        hasNextPage: total > 10,
        hasPrevPage: false,
      },
    };
  }

  async getLocationsNoFilters(): Promise<PaginationResult<LocationEntity>> {
    console.log('=== No Filters Query ===');

    // Exact same query as getLocationsWithFilters but with hardcoded empty params
    const queryBuilder = this.locationRepository.repo
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.business', 'business')
      .leftJoinAndSelect('business.account', 'account');

    console.log('SQL Query (no filters):', queryBuilder.getSql());
    console.log('Query Parameters (no filters):', queryBuilder.getParameters());

    const [locations, total] = await queryBuilder
      .take(10)
      .orderBy('location.createdAt', 'DESC')
      .getManyAndCount();

    console.log('No filters results:');
    console.log('Total found:', total);
    console.log('Locations returned:', locations.length);
    console.log('========================');

    return {
      data: locations,
      meta: {
        page: 1,
        limit: 10,
        totalItems: total,
        totalPages: Math.ceil(total / 10),
        hasNextPage: total > 10,
        hasPrevPage: false,
      },
    };
  }
}
