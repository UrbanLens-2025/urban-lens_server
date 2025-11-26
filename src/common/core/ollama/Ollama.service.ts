import { Injectable, Logger } from '@nestjs/common';
import { Ollama } from 'ollama';
import { DataSource } from 'typeorm';

interface JourneyContext {
  userId: string;
  userPreferences: Record<string, number>;
  currentLocation: { latitude: number; longitude: number };
  numberOfLocations: number;
  maxRadiusKm?: number;
}

interface AIJourneyResponse {
  reasoning: string;
  tips: string[];
  suggestedLocationIds?: string[];
  locationActivities?: Record<string, string>; // locationId -> suggested activity
}

interface DatabaseTool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private ollama: Ollama;
  private readonly model: string;
  private readonly enabled: boolean;

  constructor(private readonly dataSource: DataSource) {
    this.enabled = process.env.OLLAMA_ENABLED === 'true';
    this.model = process.env.OLLAMA_MODEL || 'qwen2.5:7b';

    if (this.enabled) {
      this.ollama = new Ollama({
        host: process.env.OLLAMA_HOST || 'http://localhost:11434',
      });
      this.logger.log(`Ollama enabled with model: ${this.model}`);
    } else {
      this.logger.log('Ollama disabled');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Generate AI-powered journey with database access
   * AI can query database to find best locations
   */
  async generateJourneyWithDBAccess(
    context: JourneyContext,
  ): Promise<AIJourneyResponse | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const schema = process.env.DATABASE_SCHEMA || 'development';
      const tools = this.getDatabaseTools(schema);
      const conversationHistory: any[] = [];

      // Initial prompt
      const initialPrompt = this.buildAgentPrompt(context);
      conversationHistory.push({
        role: 'user',
        content: initialPrompt,
      });

      this.logger.debug('Starting AI agent conversation...');

      // Agent loop - AI can call tools multiple times
      let iterations = 0;
      const maxIterations = 3; // Reduce to prevent long waits

      while (iterations < maxIterations) {
        iterations++;
        this.logger.debug(`Agent iteration ${iterations}/${maxIterations}`);

        const response = await this.ollama.chat({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPromptWithTools(tools),
            },
            ...conversationHistory,
          ],
          options: {
            temperature: 0.7,
            num_predict: 1500, // Increased to ensure all 5 activities are generated
          },
        });

        const content = response.message.content;
        this.logger.debug(
          `AI response (${content.length} chars): ${content.slice(0, 150)}...`,
        );

        conversationHistory.push({
          role: 'assistant',
          content,
        });

        const toolCall = this.parseToolCall(content);

        if (toolCall) {
          this.logger.debug(
            `AI calling tool: ${toolCall.name} with params: ${JSON.stringify(toolCall.parameters)}`,
          );

          // Execute tool
          const toolResult = await this.executeTool(
            toolCall.name,
            toolCall.parameters,
            schema,
          );

          this.logger.debug(
            `Tool returned ${toolResult.length || 0} locations. First 3 distances: ${toolResult
              .slice(0, 3)
              .map((l: any) => `${l.name}: ${l.distance?.toFixed(2)}km`)
              .join(', ')}`,
          );

          // Send result back to AI with format reminder
          conversationHistory.push({
            role: 'user',
            content: `Tool result (${toolResult.length || 0} items):\n${JSON.stringify(toolResult, null, 2)}\n\nNow provide your final response using EXACTLY this format:\n\nREASONING: [your reasoning in Vietnamese]\nTIPS:\n- [tip 1]\n- [tip 2]\n- [tip 3]\nLOCATION_IDS: [comma-separated UUIDs from the id field above]\nACTIVITIES:\n[uuid]: [activity description]\n[uuid]: [activity description]\n...\n\nREMEMBER: Copy exact UUIDs from "id" field in the results above!`,
          });
        } else {
          // AI finished, return final response
          this.logger.debug('AI finished, parsing final response...');
          this.logger.debug(`Full AI response:\n${content}`); // Log full response
          const parsed = this.parseAIResponse(content);
          this.logger.debug(
            `Parsed: ${parsed.suggestedLocationIds?.length || 0} locations, ${parsed.tips.length} tips, ${Object.keys(parsed.locationActivities || {}).length} activities`,
          );

          if (
            parsed.suggestedLocationIds &&
            parsed.suggestedLocationIds.length > 0
          ) {
            this.logger.log(
              `✅ Successfully parsed ${parsed.suggestedLocationIds.length} location IDs`,
            );
          } else {
            this.logger.warn(`⚠️ No location IDs found in AI response!`);
          }

          return parsed;
        }
      }

      this.logger.warn('AI agent reached max iterations without completing');
      this.logger.debug(
        `Conversation history length: ${conversationHistory.length}`,
      );

      // Try to parse last response anyway
      const lastResponse = conversationHistory[conversationHistory.length - 1];
      if (lastResponse && lastResponse.role === 'assistant') {
        this.logger.debug(
          `Attempting to parse last response: ${lastResponse.content.slice(0, 200)}...`,
        );
        const parsed = this.parseAIResponse(lastResponse.content);
        if (parsed.reasoning || parsed.suggestedLocationIds) {
          this.logger.log(
            `Successfully parsed incomplete response: ${parsed.suggestedLocationIds?.length || 0} locations`,
          );
          return parsed;
        }
      }

      this.logger.error('Failed to parse any valid response from AI');
      return null;
    } catch (error) {
      this.logger.error('Ollama agent error:', error);
      return null;
    }
  }

  /**
   * Define database tools that AI can use
   */
  private getDatabaseTools(schema: string): DatabaseTool[] {
    return [
      {
        name: 'query_nearby_locations',
        description:
          'Query locations from database within a radius. Returns location details including name, address, tags, and ratings.',
        parameters: {
          type: 'object',
          properties: {
            latitude: {
              type: 'number',
              description: 'Center latitude',
            },
            longitude: {
              type: 'number',
              description: 'Center longitude',
            },
            radiusKm: {
              type: 'number',
              description: 'Search radius in kilometers',
            },
            limit: {
              type: 'number',
              description:
                'Maximum number of locations to return (default: 20)',
            },
          },
          required: ['latitude', 'longitude', 'radiusKm'],
        },
      },
      {
        name: 'query_locations_by_tags',
        description:
          'Query locations that have specific tags. Useful for finding locations matching user preferences.',
        parameters: {
          type: 'object',
          properties: {
            tagIds: {
              type: 'array',
              description: 'Array of tag IDs to filter by',
              items: { type: 'number' },
            },
            latitude: {
              type: 'number',
              description: 'Center latitude for distance calculation',
            },
            longitude: {
              type: 'number',
              description: 'Center longitude for distance calculation',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of locations (default: 10)',
            },
          },
          required: ['tagIds', 'latitude', 'longitude'],
        },
      },
    ];
  }

  /**
   * Build system prompt with tool descriptions
   */
  private getSystemPromptWithTools(tools: DatabaseTool[]): string {
    return `You are an AI travel planning agent for Ho Chi Minh City, Vietnam.

You can query a database to find locations.

Available tool: query_nearby_locations
- Finds locations within a radius
- Parameters: latitude (number), longitude (number), radiusKm (number), limit (number, optional)

To use the tool, respond EXACTLY like this:
TOOL_CALL: query_nearby_locations
PARAMETERS: {"latitude": 10.762622, "longitude": 106.660172, "radiusKm": 5, "limit": 20}

⚠️ CRITICAL FORMAT REQUIREMENT ⚠️
After receiving query results, you MUST provide your final response in THIS EXACT FORMAT.
DO NOT use markdown, bullets with numbers, or conversational text.
ONLY use this structure:

REASONING: [2-3 sentences in Vietnamese]
TIPS:
- [tip 1]
- [tip 2]
- [tip 3]
LOCATION_IDS: uuid1, uuid2, uuid3, uuid4, uuid5
ACTIVITIES:
uuid1: [activity for location 1 based on its name]
uuid2: [activity for location 2 based on its name]
uuid3: [activity for location 3 based on its name]
uuid4: [activity for location 4 based on its name]
uuid5: [activity for location 5 based on its name]

❌ WRONG FORMATS (DO NOT USE):
1. **Museum Name**: - suggestion 1 - suggestion 2
2. "These suggestions..." or any conversational closing
3. Markdown formatting with ** or numbered lists

✅ CORRECT FORMAT (USE THIS):
REASONING: ...
TIPS:
- ...
LOCATION_IDS: uuid1, uuid2, ...
ACTIVITIES:
uuid1: activity description
uuid2: activity description

CRITICAL REQUIREMENTS:
- Call the tool ONLY ONCE
- After getting results, provide final response immediately in the correct format
- DO NOT write conversational responses or use markdown
- Select EXACTLY the requested number of locations
- COPY the exact UUID (id field) from query results - DO NOT modify or reorder
- Format: "uuid: activity description" (one line per location)
- YOU MUST WRITE EXACTLY 5 ACTIVITIES LINES (one for each UUID in LOCATION_IDS)
- DO NOT STOP after 2-3 activities - CONTINUE until you have written ALL 5
- Each activity MUST match the location's actual name from query results

Example tool call:
TOOL_CALL: query_nearby_locations
PARAMETERS: {"latitude": 10.762622, "longitude": 106.660172, "radiusKm": 10, "limit": 20}

Example final response (for 5 locations):
REASONING: Các địa điểm phù hợp với sở thích yên tĩnh. Bắt đầu với cafe, sau đó công viên và bảo tàng.
TIPS:
- Đi buổi sáng tránh đông
- Mang nước uống
- Địa điểm 3 đẹp lúc hoàng hôn
LOCATION_IDS: fa5c272f-4e3b-43f0-830d-9c16a4c7408f, e2898146-7768-4f9b-886d-26b1fac82bb8, b433956a-137b-408c-a5c0-3ddb700a36e1, 4edf4616-4651-44c5-87aa-0aa33d1ef457, 041f4377-ecc1-4d12-8019-5b417d58a51c
ACTIVITIES:
fa5c272f-4e3b-43f0-830d-9c16a4c7408f: Thưởng thức cà phê và làm việc trong không gian yên tĩnh tại Highlands Coffee
e2898146-7768-4f9b-886d-26b1fac82bb8: Chụp ảnh kiến trúc Gothic và tham quan bên trong Nhà thờ Đức Bà
b433956a-137b-408c-a5c0-3ddb700a36e1: Khám phá ẩm thực đường phố và trải nghiệm văn hóa tại Phố đi bộ Bùi Viện
4edf4616-4651-44c5-87aa-0aa33d1ef457: Dạo bộ, tập thể dục và thư giãn trong Tao Dan Park
041f4377-ecc1-4d12-8019-5b417d58a51c: Tham quan di tích lịch sử và chụp ảnh kiến trúc tại Dinh Độc Lập

VALIDATION CHECK (DO THIS BEFORE WRITING ACTIVITIES):
✓ 4edf4616... from query result has name "Tao Dan Park" → activity mentions "Tao Dan Park" ✓
✓ 041f4377... from query result has name "Dinh Độc Lập" → activity mentions "Dinh Độc Lập" ✓
✗ WRONG: 4edf4616... (Tao Dan Park) → activity about "Dinh Độc Lập" ✗
✗ WRONG: 041f4377... (Dinh Độc Lập) → activity about "Tao Dan Park" ✗

REMEMBER: Write ALL 5 activities - do not stop early!

IMPORTANT: Write activities based on location name and type:
- Read the location "name" field from query results
- Infer the location type from its name (cafe, park, market, museum, church, etc.)
- Suggest activities that match that specific type
- Include the location name in the activity description for clarity

Examples of good activity suggestions:
- Cafe/Coffee shop → coffee, working, reading
- Park/Garden → walking, exercise, relaxing
- Market/Shopping → shopping, local food
- Museum/Gallery → learning history/culture/art
- Church/Temple → sightseeing, architecture photos
- Street/Walking street → street food, nightlife, culture
- Palace/Historical site → historical tour, architecture

DO NOT copy activities between locations! Each must be unique and specific.`;
  }

  /**
   * Build initial agent prompt
   */
  private buildAgentPrompt(context: JourneyContext): string {
    const topPreferences = Object.entries(context.userPreferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, score]) => `tag_${tag.replace('tag_', '')}: ${score}`);

    return `Plan a journey for a user in Ho Chi Minh City.

User ID: ${context.userId}
User preferences (tag scores):
${topPreferences.join(', ')}

Current location: ${context.currentLocation.latitude}, ${context.currentLocation.longitude}
Number of locations needed: ${context.numberOfLocations}
Maximum radius: ${context.maxRadiusKm || 10}km

Task:
1. Query the database to find suitable locations (use query_nearby_locations)
2. Analyze the results - PRIORITIZE locations with SMALLER "distance" values (closer to start)
3. Select EXACTLY ${context.numberOfLocations} locations that are CLOSE to the start point
4. For EACH selected location, write down: UUID + Name (e.g., "fa5c272f... = Highlands Coffee")
5. Provide reasoning explaining why these locations match user preferences
6. Give EXACTLY 3 practical tips for the journey
7. List ALL ${context.numberOfLocations} location IDs (UUIDs)
8. Write activities - DOUBLE CHECK that each UUID matches the correct location name

CRITICAL SELECTION CRITERIA:
- Query results include "distance" field - USE IT to select closer locations
- Prefer locations with distance < 3km over locations with distance > 5km
- Balance between user preferences AND proximity to start point

CRITICAL VALIDATION:
- Before writing ACTIVITIES, verify each UUID corresponds to the correct location name
- Example: If UUID is "4edf4616..." and name is "Tao Dan Park", activity MUST be about park, NOT about palace
- If UUID is "041f4377..." and name is "Dinh Độc Lập", activity MUST be about palace, NOT about park

Start by querying nearby locations within the radius.`;
  }

  /**
   * Parse tool call from AI response
   */
  private parseToolCall(content: string): {
    name: string;
    parameters: any;
  } | null {
    const lines = content.split('\n');

    let toolName = '';
    let parametersJson = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('TOOL_CALL:')) {
        toolName = line.replace('TOOL_CALL:', '').trim();
      } else if (line.startsWith('PARAMETERS:')) {
        // Collect JSON (might be multi-line)
        parametersJson = line.replace('PARAMETERS:', '').trim();

        // Check if JSON continues on next lines
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j].trim();

          // Stop if we hit another section marker
          if (
            nextLine.startsWith('TOOL_CALL:') ||
            nextLine.startsWith('REASONING:') ||
            nextLine.startsWith('TIPS:') ||
            nextLine.startsWith('LOCATION_IDS:')
          ) {
            break;
          }

          // Add line if it looks like part of JSON
          if (
            nextLine &&
            (nextLine.includes('{') ||
              nextLine.includes('}') ||
              nextLine.includes('"') ||
              nextLine.includes(','))
          ) {
            parametersJson += ' ' + nextLine;
          }

          j++;
        }
      }
    }

    if (toolName && parametersJson) {
      try {
        // Try to extract JSON object (handle nested braces)
        const firstBrace = parametersJson.indexOf('{');
        if (firstBrace !== -1) {
          let braceCount = 0;
          let endIndex = firstBrace;

          for (let i = firstBrace; i < parametersJson.length; i++) {
            if (parametersJson[i] === '{') braceCount++;
            if (parametersJson[i] === '}') braceCount--;

            if (braceCount === 0) {
              endIndex = i + 1;
              break;
            }
          }

          parametersJson = parametersJson.substring(firstBrace, endIndex);
        }

        const parameters = JSON.parse(parametersJson);
        return { name: toolName, parameters };
      } catch (error) {
        this.logger.error('Failed to parse tool parameters:', error);
        this.logger.debug('Raw parameters string:', parametersJson);
        return null;
      }
    }

    return null;
  }

  /**
   * Execute database tool
   */
  private async executeTool(
    toolName: string,
    parameters: any,
    schema: string,
  ): Promise<any> {
    this.logger.debug(`Executing tool: ${toolName}`, parameters);

    switch (toolName) {
      case 'query_nearby_locations':
        return this.queryNearbyLocations(parameters, schema);

      case 'query_locations_by_tags':
        return this.queryLocationsByTags(parameters, schema);

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  }

  /**
   * Query nearby locations from database
   */
  private async queryNearbyLocations(
    params: {
      latitude: number;
      longitude: number;
      radiusKm: number;
      limit?: number;
    },
    schema: string,
  ): Promise<any> {
    const limit = params.limit || 20;

    const query = `
      SELECT 
        l.id,
        l.name,
        l.address_line as "addressLine",
        l.latitude,
        l.longitude,
        l.image_url as "imageUrl",
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(l.latitude)) *
            cos(radians(l.longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(l.latitude))
          )
        ) as distance,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', t.id,
              'name', t.display_name
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags,
        l.average_rating as "averageRating",
        l.total_reviews as "totalReviews"
      FROM ${schema}.locations l
      LEFT JOIN ${schema}.location_tags lt ON l.id = lt.location_id
      LEFT JOIN ${schema}.tag t ON lt.tag_id = t.id
      WHERE l.is_visible_on_map = true
        AND (
          6371 * acos(
            cos(radians($1)) * cos(radians(l.latitude)) *
            cos(radians(l.longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(l.latitude))
          )
        ) <= $3
      GROUP BY l.id, l.name, l.address_line, l.latitude, l.longitude, l.image_url, l.average_rating, l.total_reviews
      ORDER BY distance ASC
      LIMIT $4
    `;

    const result = await this.dataSource.query(query, [
      params.latitude,
      params.longitude,
      params.radiusKm,
      limit,
    ]);

    return result;
  }

  /**
   * Query locations by tags
   */
  private async queryLocationsByTags(
    params: {
      tagIds: number[];
      latitude: number;
      longitude: number;
      limit?: number;
    },
    schema: string,
  ): Promise<any> {
    const limit = params.limit || 10;

    const query = `
      SELECT 
        l.id,
        l.name,
        l.address_line as "addressLine",
        l.latitude,
        l.longitude,
        (
          6371 * acos(
            cos(radians($1)) * cos(radians(l.latitude)) *
            cos(radians(l.longitude) - radians($2)) +
            sin(radians($1)) * sin(radians(l.latitude))
          )
        ) as distance,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', t.id,
              'name', t.display_name
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) as tags,
        l.average_rating as "averageRating"
      FROM ${schema}.locations l
      INNER JOIN ${schema}.location_tags lt ON l.id = lt.location_id
      LEFT JOIN ${schema}.tag t ON lt.tag_id = t.id
      WHERE l.is_visible_on_map = true
        AND lt.tag_id = ANY($3::int[])
      GROUP BY l.id, l.name, l.address_line, l.latitude, l.longitude, l.average_rating
      ORDER BY l.average_rating DESC NULLS LAST, distance ASC
      LIMIT $4
    `;

    const result = await this.dataSource.query(query, [
      params.latitude,
      params.longitude,
      params.tagIds,
      limit,
    ]);

    return result;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(content: string): AIJourneyResponse {
    const lines = content.split('\n').filter((line) => line.trim());

    let reasoning = '';
    const tips: string[] = [];
    let locationIds: string[] = [];
    const locationActivities: Record<string, string> = {};

    let currentSection: 'reasoning' | 'tips' | 'activities' | null = null;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('REASONING:')) {
        currentSection = 'reasoning';
        reasoning = trimmed.replace('REASONING:', '').trim();
      } else if (trimmed.startsWith('TIPS:')) {
        currentSection = 'tips';
      } else if (trimmed.startsWith('ACTIVITIES:')) {
        currentSection = 'activities';
      } else if (trimmed.startsWith('LOCATION_IDS:')) {
        const idsStr = trimmed.replace('LOCATION_IDS:', '').trim();
        locationIds = idsStr
          .split(',')
          .map((id) => id.trim())
          .filter((id) => {
            // Validate UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
            const uuidRegex =
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const isValid = uuidRegex.test(id);
            if (!isValid) {
              this.logger.warn(`⚠️ Invalid UUID format: "${id}" - skipping`);
            }
            return isValid;
          });
      } else if (trimmed.startsWith('-') && currentSection === 'tips') {
        tips.push(trimmed.replace(/^-\s*/, ''));
      } else if (currentSection === 'activities' && trimmed.includes(':')) {
        // Parse various formats:
        // "uuid: activity"
        // "uuid (Name): activity"
        // "uuid = Name: activity"
        const colonIndex = trimmed.indexOf(':');
        let locationId = trimmed.substring(0, colonIndex).trim();
        const activity = trimmed.substring(colonIndex + 1).trim();

        // Remove location name if present:
        // "uuid (Name)" -> "uuid"
        // "uuid = Name" -> "uuid"
        const parenIndex = locationId.indexOf('(');
        const equalIndex = locationId.indexOf('=');

        if (parenIndex > 0) {
          locationId = locationId.substring(0, parenIndex).trim();
        } else if (equalIndex > 0) {
          locationId = locationId.substring(0, equalIndex).trim();
        }

        if (locationId && activity) {
          locationActivities[locationId] = activity;
          this.logger.debug(`📍 Parsed activity: ${locationId} -> ${activity}`);
        }
      } else if (currentSection === 'reasoning' && reasoning) {
        reasoning += ' ' + trimmed;
      } else if (currentSection === 'reasoning' && !reasoning) {
        reasoning = trimmed;
      }
    }

    // Fallback if parsing fails
    if (!reasoning) {
      reasoning = content.slice(0, 200);
    }

    return {
      reasoning: reasoning || 'AI insights not available',
      tips: tips.length > 0 ? tips : ['Enjoy your journey!'],
      suggestedLocationIds: locationIds.length > 0 ? locationIds : undefined,
      locationActivities:
        Object.keys(locationActivities).length > 0
          ? locationActivities
          : undefined,
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      await this.ollama.list();
      return true;
    } catch (error) {
      this.logger.error('Ollama health check failed:', error);
      return false;
    }
  }
}
