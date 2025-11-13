import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { AppService } from '@/app.service';
import * as Sentry from '@sentry/nestjs';
import { sepayClient } from '@/config/sepay.config';
import qs from 'qs';

@ApiTags('_Test')
@ApiBearerAuth()
@Controller()
export class TestController {
  constructor(private readonly appService: AppService) {}

  @Get('/public/hello-world')
  getHelloWorld() {
    return 'Hello, World!';
  }

  @Get('/public/test-sentry')
  testSentry() {
    console.log('Sentry Client:');
    console.log(Sentry.getClient());
    const randomUUID = crypto.randomUUID();
    throw new Error(
      `This is a test error for Sentry integration + ${randomUUID}`,
    );
  }

  @Get('/public/hello-world-2')
  getHelloWorld2() {
    return 'Hello, World! VERSION 2';
  }

  @Get('/public/hello-world-3')
  getHelloWorld3() {
    return 'Hello, World! VERSION 3';
  }

  @ApiBearerAuth()
  @Get('/public/get-hello')
  getHello(@AuthUser() dto: JwtTokenDto) {
    if (dto.sub) {
      return dto;
    }
    return 'Hello world!';
  }

  @Get('/get-hello')
  getHelloPublic(): string {
    return this.appService.getHello();
  }

  @Roles(Role.ADMIN)
  @Get('/admin')
  getHelloAdmin(): string {
    return this.appService.getHello();
  }

  @Get('/public/test-find-error')
  async testFindError() {
    return this.appService.testFindError();
  }

  @ApiPaginationQuery(AppService.testSearchAndFilter)
  @Get('/public/test-search-and-filter')
  async testSearchAndFilter(@Paginate() query: PaginateQuery) {
    return this.appService.testSearchAndFilter(query);
  }

  @Get('/public/test-sepay')
  async testSepay() {
    const checkoutURL = sepayClient.checkout.initCheckoutUrl();
    const checkoutFields = sepayClient.checkout.initOneTimePaymentFields({
      currency: 'VND',
      order_amount: 10000,
      order_description: 'Test payment',
      order_invoice_number: '123123123123',
      operation: 'PURCHASE',
    });

    return {
      checkoutURL,
      checkoutFields,
    }
  }
}
