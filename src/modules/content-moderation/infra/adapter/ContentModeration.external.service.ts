import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  PerspectiveAnalyzeCommentRequest,
  PerspectiveAnalyzeCommentResponse,
  PerspectiveErrorResponse,
  PerspectiveAttribute,
  PerspectiveRequestedAttributes,
} from '../PerspectiveAPI.types';

@Injectable()
export class ContentModerationExternalService {
  private readonly logger = new Logger(ContentModerationExternalService.name);
  private readonly apiKey: string | undefined;
  private readonly apiUrl =
    'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('PERSPECTIVE_API_KEY');
    if (this.apiKey) {
      this.logger.log('✅ Perspective API enabled');
    } else {
      this.logger.warn('⚠️  Perspective API key not configured');
    }
  }

  async moderateContent(
    content: string,
    requestedAttributes?: PerspectiveRequestedAttributes,
  ): Promise<PerspectiveAnalyzeCommentResponse> {
    if (!this.apiKey) {
      throw new Error('Perspective API key is not configured');
    }

    const defaultAttributes: PerspectiveRequestedAttributes = {
      [PerspectiveAttribute.SEVERE_TOXICITY]: {},
      [PerspectiveAttribute.INSULT]: {},
      [PerspectiveAttribute.IDENTITY_ATTACK]: {},
      [PerspectiveAttribute.INFLAMMATORY]: {},
      [PerspectiveAttribute.SPAM]: {},
    };

    const request: PerspectiveAnalyzeCommentRequest = {
      comment: {
        text: content,
      },
      requestedAttributes: requestedAttributes || defaultAttributes,
    };

    try {
      this.logger.debug(`Calling Perspective API for content moderation`);

      const response = await firstValueFrom(
        this.httpService.post<PerspectiveAnalyzeCommentResponse>(
          `${this.apiUrl}?key=${this.apiKey}`,
          request,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response
      ) {
        const errorData = error.response.data as PerspectiveErrorResponse;
        this.logger.error(
          `Perspective API error: ${errorData.error.message}`,
          errorData,
        );
        throw new Error(`Perspective API error: ${errorData.error.message}`);
      }
      this.logger.error('Failed to moderate content', error);
      throw error;
    }
  }
}
