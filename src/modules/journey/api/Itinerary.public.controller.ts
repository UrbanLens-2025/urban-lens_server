import { Controller, Get, Param, Res } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/ban-ts-comment
// @ts-ignore - express types are available via @nestjs/platform-express
import type { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IItineraryService } from '../app/IItinerary.service';

@ApiTags('Itinerary')
@Controller('/public/itinerary')
export class ItineraryPublicController {
  constructor(private readonly itineraryService: IItineraryService) {}

  @Get(':id/export-pdf')
  @ApiOperation({
    summary: 'Export itinerary to PDF (Public)',
    description:
      'Export an itinerary to a beautifully formatted PDF file. This endpoint is public and does not require authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF file generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Itinerary not found',
  })
  async exportItineraryToPdf(
    @Param('id') id: string,
    @Res({ passthrough: false }) res: Response,
  ): Promise<void> {
    const pdfBuffer =
      await this.itineraryService.exportItineraryToPdfPublic(id);

    // Get itinerary to use its title for filename
    const itinerary = await this.itineraryService.getItineraryByIdPublic(id);
    const filename = `itinerary-${itinerary.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}"`,
    );
    res.setHeader('Content-Length', pdfBuffer.length.toString());

    res.send(pdfBuffer);
  }
}
