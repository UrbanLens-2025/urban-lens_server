import { Injectable } from '@nestjs/common';
import { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import PdfPrinter from 'pdfmake';
import { ItineraryEntity } from '../../domain/Itinerary.entity';
import dayjs from 'dayjs';
import { join } from 'path';
import { existsSync } from 'fs';
import axios from 'axios';

@Injectable()
export class ItineraryPdfService {
  private readonly fonts = {
    Roboto: this.getFontPaths(),
  };

  private getFontPaths() {
    const fontDir = this.getFontDirectory();
    return {
      normal: join(fontDir, 'Roboto-Regular.ttf'),
      bold: join(fontDir, 'Roboto-Medium.ttf'),
      italics: join(fontDir, 'Roboto-Italic.ttf'),
      bolditalics: join(fontDir, 'Roboto-MediumItalic.ttf'),
    };
  }

  private getFontDirectory(): string {
    // Try dist first (production), then src (development)
    const distPath = join(process.cwd(), 'dist', 'src', 'assets', 'fonts');
    const srcPath = join(process.cwd(), 'src', 'assets', 'fonts');

    if (existsSync(distPath)) {
      return distPath;
    }
    if (existsSync(srcPath)) {
      return srcPath;
    }
    // Fallback to src (for development)
    return srcPath;
  }

  async generatePdf(itinerary: ItineraryEntity): Promise<Buffer> {
    const docDefinition: TDocumentDefinitions =
      await this.createDocumentDefinition(itinerary);

    const printer = new PdfPrinter(this.fonts);

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];

        pdfDoc.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        pdfDoc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        pdfDoc.on('error', (error: Error) => {
          reject(error);
        });

        pdfDoc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async downloadImageAsBase64(
    imageUrl: string,
  ): Promise<string | null> {
    try {
      if (!imageUrl || !imageUrl.startsWith('http')) {
        return null;
      }

      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000, // 10 seconds timeout
        maxContentLength: 5 * 1024 * 1024, // 5MB max
        validateStatus: (status) => status === 200,
      });

      const buffer = Buffer.from(response.data);
      const contentType = response.headers['content-type'] || 'image/jpeg';

      // Only support JPEG and PNG
      if (
        !contentType.includes('image/jpeg') &&
        !contentType.includes('image/jpg') &&
        !contentType.includes('image/png')
      ) {
        return null;
      }

      // Convert to base64 data URL for pdfmake
      const base64 = buffer.toString('base64');
      return `data:${contentType};base64,${base64}`;
    } catch (error) {
      // If image download fails, return null (image will be skipped)
      // Log error in development but don't throw
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Failed to download image: ${imageUrl}`, error);
      }
      return null;
    }
  }

  private async createDocumentDefinition(
    itinerary: ItineraryEntity,
  ): Promise<TDocumentDefinitions> {
    const locations = itinerary.locations || [];
    const sortedLocations = [...locations].sort((a, b) => a.order - b.order);

    // Pre-download images for all locations and create images dictionary
    const locationImages: (string | null)[] = await Promise.all(
      sortedLocations.map(async (location) => {
        const imageUrl =
          location.location?.imageUrl && location.location.imageUrl.length > 0
            ? location.location.imageUrl[0]
            : null;
        if (imageUrl) {
          return await this.downloadImageAsBase64(imageUrl);
        }
        return null;
      }),
    );

    // Create images dictionary for pdfmake (using data URL strings)
    const imagesDict: Record<string, string> = {};
    locationImages.forEach((image, index) => {
      if (image) {
        imagesDict[`locationImage${index}`] = image;
      }
    });

    const content = [
      // Header
      {
        text: itinerary.title,
        style: 'header',
        margin: [0, 0, 0, 10] as [number, number, number, number],
      },

      // Description
      ...(itinerary.description
        ? [
            {
              text: itinerary.description,
              style: 'description',
              margin: [0, 0, 0, 30] as [number, number, number, number],
            },
          ]
        : []),

      // Trip Info Section
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: [
                  {
                    text: 'Thông tin chuyến đi',
                    style: 'sectionTitle',
                    margin: [0, 0, 0, 18] as [number, number, number, number],
                  },
                  {
                    table: {
                      widths: ['auto', '*'],
                      body: [
                        ...(itinerary.startDate
                          ? [
                              [
                                {
                                  text: 'Ngày bắt đầu:',
                                  style: 'infoLabel',
                                },
                                {
                                  text: dayjs(itinerary.startDate).format(
                                    'DD/MM/YYYY',
                                  ),
                                  style: 'infoValue',
                                },
                              ],
                            ]
                          : []),
                        ...(itinerary.endDate
                          ? [
                              [
                                {
                                  text: 'Ngày kết thúc:',
                                  style: 'infoLabel',
                                },
                                {
                                  text: dayjs(itinerary.endDate).format(
                                    'DD/MM/YYYY',
                                  ),
                                  style: 'infoValue',
                                },
                              ],
                            ]
                          : []),
                        [
                          {
                            text: 'Tổng quãng đường:',
                            style: 'infoLabel',
                          },
                          {
                            text: `${itinerary.totalDistanceKm.toFixed(2)} km`,
                            style: 'infoValue',
                            bold: true,
                          },
                        ],
                        [
                          {
                            text: 'Tổng thời gian:',
                            style: 'infoLabel',
                          },
                          {
                            text: this.formatTravelTime(
                              itinerary.totalTravelMinutes,
                            ),
                            style: 'infoValue',
                            bold: true,
                          },
                        ],
                        [
                          {
                            text: 'Trạng thái:',
                            style: 'infoLabel',
                          },
                          {
                            text: itinerary.isFinished
                              ? '✓ Đã hoàn thành'
                              : 'Đang lên kế hoạch',
                            style: 'infoValue',
                            color: itinerary.isFinished ? '#10b981' : '#3b82f6',
                            bold: true,
                          },
                        ],
                      ],
                    },
                    layout: 'noBorders',
                  },
                ],
                fillColor: '#f8fafc',
                border: [true, true, true, true],
                borderColor: ['#e2e8f0', '#e2e8f0', '#e2e8f0', '#e2e8f0'] as [
                  string,
                  string,
                  string,
                  string,
                ],
                margin: [20, 20, 20, 20] as [number, number, number, number],
              },
            ],
          ],
        },
        margin: [0, 0, 0, 30] as [number, number, number, number],
      },

      // AI Tips (if available)
      ...(itinerary.source === 'AI' &&
      itinerary.aiMetadata?.tips &&
      itinerary.aiMetadata.tips.length > 0
        ? ([
            {
              text: 'Mẹo từ AI',
              style: 'sectionTitle',
              margin: [0, 25, 0, 12] as [number, number, number, number],
            },
            {
              ul: itinerary.aiMetadata.tips.map((tip) => ({
                text: tip,
                style: 'tipText',
              })),
              margin: [0, 0, 0, 20] as [number, number, number, number],
            },
          ] as Content[])
        : []),

      // Locations Section
      ...(sortedLocations.length > 0
        ? ([
            {
              text: 'Lộ trình chi tiết',
              style: 'sectionTitle',
              margin: [0, 25, 0, 20] as [number, number, number, number],
            },
            // Location Cards
            ...sortedLocations.map((location, index) => {
              const locationData = location.location;
              const isLast = index === sortedLocations.length - 1;
              const locationImage = locationImages[index];

              return {
                stack: [
                  // Location Card with Image
                  {
                    table: {
                      widths: ['*'],
                      body: [
                        [
                          {
                            stack: [
                              // Location Image (if available) - at the top
                              ...(locationImage
                                ? [
                                    {
                                      image: `locationImage${index}`,
                                      width: 455,
                                      height: 280,
                                      alignment: 'left',
                                      margin: [0, 0, 0, 20] as [
                                        number,
                                        number,
                                        number,
                                        number,
                                      ],
                                    },
                                  ]
                                : []),
                              // Location Number and Name
                              {
                                columns: [
                                  {
                                    width: 65,
                                    table: {
                                      widths: [65],
                                      body: [
                                        [
                                          {
                                            text: `${location.order}`,
                                            style: 'locationNumber',
                                            alignment: 'center',
                                            fillColor: '#3b82f6',
                                            color: '#ffffff',
                                            border: [
                                              false,
                                              false,
                                              false,
                                              false,
                                            ],
                                          },
                                        ],
                                      ],
                                    },
                                    layout: 'noBorders',
                                    margin: [0, 0, 15, 0] as [
                                      number,
                                      number,
                                      number,
                                      number,
                                    ],
                                  },
                                  {
                                    width: '*',
                                    stack: [
                                      {
                                        text: locationData?.name || 'Địa điểm',
                                        style: 'locationName',
                                        margin: [0, 0, 0, 8] as [
                                          number,
                                          number,
                                          number,
                                          number,
                                        ],
                                      },
                                      ...(locationData?.addressLine
                                        ? [
                                            {
                                              text: locationData.addressLine,
                                              style: 'locationAddress',
                                              margin: [0, 0, 0, 2] as [
                                                number,
                                                number,
                                                number,
                                                number,
                                              ],
                                            },
                                          ]
                                        : []),
                                      ...(locationData?.addressLevel1 ||
                                      locationData?.addressLevel2
                                        ? [
                                            {
                                              text: [
                                                locationData.addressLevel1 ||
                                                  '',
                                                locationData.addressLevel2 ||
                                                  '',
                                              ]
                                                .filter(Boolean)
                                                .join(', '),
                                              style: 'locationAddress',
                                            },
                                          ]
                                        : []),
                                    ],
                                  },
                                ],
                                margin: [0, 0, 0, 10] as [
                                  number,
                                  number,
                                  number,
                                  number,
                                ],
                              },

                              // Description
                              ...(locationData?.description
                                ? [
                                    {
                                      text: locationData.description,
                                      style: 'locationDescription',
                                      margin: [0, 0, 0, 10] as [
                                        number,
                                        number,
                                        number,
                                        number,
                                      ],
                                    },
                                  ]
                                : []),

                              // Notes
                              ...(location.notes
                                ? [
                                    {
                                      text: [
                                        {
                                          text: 'Ghi chú: ',
                                          bold: true,
                                        },
                                        location.notes,
                                      ],
                                      style: 'locationNotes',
                                      margin: [0, 0, 0, 10] as [
                                        number,
                                        number,
                                        number,
                                        number,
                                      ],
                                    },
                                  ]
                                : []),

                              // Travel Info
                              ...(location.travelDistanceKm ||
                              location.travelDurationMinutes
                                ? [
                                    {
                                      columns: [
                                        ...(location.travelDistanceKm
                                          ? [
                                              {
                                                width: 'auto',
                                                text: `${location.travelDistanceKm.toFixed(2)} km`,
                                                style: 'travelInfo',
                                              },
                                            ]
                                          : []),
                                        ...(location.travelDurationMinutes
                                          ? [
                                              {
                                                width: 'auto',
                                                text: this.formatTravelTime(
                                                  location.travelDurationMinutes,
                                                ),
                                                style: 'travelInfo',
                                                margin: [
                                                  location.travelDistanceKm
                                                    ? 15
                                                    : 0,
                                                  0,
                                                  0,
                                                  0,
                                                ] as [
                                                  number,
                                                  number,
                                                  number,
                                                  number,
                                                ],
                                              },
                                            ]
                                          : []),
                                      ],
                                      margin: [0, 0, 0, 5] as [
                                        number,
                                        number,
                                        number,
                                        number,
                                      ],
                                    },
                                  ]
                                : []),

                              // Check-in Status
                              ...((location as any).isCheckedIn !== undefined
                                ? [
                                    {
                                      text: (location as any).isCheckedIn
                                        ? '✓ Đã check-in'
                                        : 'Chưa check-in',
                                      style: 'checkInStatus',
                                      color: (location as any).isCheckedIn
                                        ? '#10b981'
                                        : '#6b7280',
                                      margin: [0, 5, 0, 0] as [
                                        number,
                                        number,
                                        number,
                                        number,
                                      ],
                                    },
                                  ]
                                : []),
                            ],
                            fillColor: '#ffffff',
                            border: [true, true, true, true],
                            borderColor: [
                              '#cbd5e1',
                              '#cbd5e1',
                              '#cbd5e1',
                              '#cbd5e1',
                            ] as [string, string, string, string],
                            fillOpacity: 1,
                            margin: [20, 0, 20, 20] as [
                              number,
                              number,
                              number,
                              number,
                            ],
                          },
                        ],
                      ],
                    },
                    margin: [0, 0, 0, 25] as [number, number, number, number],
                  },

                  // Arrow (if not last)
                  ...(!isLast
                    ? [
                        {
                          columns: [
                            { width: '*', text: '' },
                            {
                              width: 'auto',
                              text: '↓',
                              style: 'arrow',
                              alignment: 'center',
                            },
                            { width: '*', text: '' },
                          ],
                          margin: [0, 10, 0, 10] as [
                            number,
                            number,
                            number,
                            number,
                          ],
                        },
                      ]
                    : []),
                ],
              };
            }),
          ] as Content[])
        : []),

      // Footer
      {
        text: `Tạo bởi Urban Lens - ${dayjs().format('DD/MM/YYYY HH:mm')}`,
        style: 'footer',
        margin: [0, 30, 0, 0] as [number, number, number, number],
        alignment: 'center',
      },
    ] as Content[];

    return {
      content: content as Content[],
      images: imagesDict,
      styles: {
        header: {
          fontSize: 34,
          bold: true,
          color: '#1e3a8a',
          alignment: 'center',
        },
        description: {
          fontSize: 14,
          color: '#475569',
          alignment: 'center',
          italics: true,
        },
        sectionTitle: {
          fontSize: 20,
          bold: true,
          color: '#1e40af',
          margin: [0, 0, 0, 18] as [number, number, number, number],
        },
        infoLabel: {
          fontSize: 13,
          color: '#64748b',
          bold: true,
        },
        infoValue: {
          fontSize: 13,
          color: '#0f172a',
        },
        tipText: {
          fontSize: 12,
          color: '#374151',
          margin: [0, 2, 0, 2] as [number, number, number, number],
        },
        locationNumber: {
          fontSize: 20,
          bold: true,
          color: '#ffffff',
        },
        locationName: {
          fontSize: 18,
          bold: true,
          color: '#1e40af',
        },
        locationAddress: {
          fontSize: 12,
          color: '#64748b',
        },
        locationDescription: {
          fontSize: 13,
          color: '#334155',
          lineHeight: 1.5,
        },
        locationNotes: {
          fontSize: 11,
          color: '#059669',
        },
        travelInfo: {
          fontSize: 11,
          color: '#3b82f6',
          bold: true,
        },
        checkInStatus: {
          fontSize: 11,
          bold: true,
        },
        arrow: {
          fontSize: 28,
          color: '#94a3b8',
        },
        footer: {
          fontSize: 10,
          color: '#9ca3af',
          italics: true,
        },
      },
      defaultStyle: {
        font: 'Roboto',
      },
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
    };
  }

  private formatTravelTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} giờ`;
    }
    return `${hours} giờ ${remainingMinutes} phút`;
  }
}
