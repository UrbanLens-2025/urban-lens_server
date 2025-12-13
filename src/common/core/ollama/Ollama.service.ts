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
    // Use smaller model for faster response on M4
    // Recommended: qwen2.5:3b (balanced), qwen2.5:1.5b (fastest), llama3.2:3b, or gemma2:2b
    // 7b models are slower but more accurate. For speed, use 3b or smaller models.
    this.model = process.env.OLLAMA_MODEL || 'qwen2.5:3b';

    if (this.enabled) {
      this.ollama = new Ollama({
        host: process.env.OLLAMA_HOST || 'http://localhost:11434',
      });
      this.logger.log(`Ollama enabled with model: ${this.model}`);
      this.logger.log(
        `💡 M4 Optimization: Using 8 threads. For faster response, try: qwen2.5:1.5b, gemma2:2b, or llama3.2:3b`,
      );
      this.logger.log(
        `💡 Ensure Ollama uses Metal/GPU: Run 'ollama run ${this.model}' to verify GPU usage`,
      );
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

      // Validate currentLocation coordinates
      if (
        context.currentLocation.latitude == null ||
        context.currentLocation.longitude == null ||
        isNaN(context.currentLocation.latitude) ||
        isNaN(context.currentLocation.longitude)
      ) {
        throw new Error(
          `Invalid currentLocation coordinates: lat=${context.currentLocation.latitude}, lng=${context.currentLocation.longitude}`,
        );
      }

      // Initial prompt - store context for later use
      const initialPrompt = this.buildAgentPrompt(context);
      conversationHistory.push({
        role: 'user',
        content:
          initialPrompt +
          '\n\n🚨 MANDATORY: Your FIRST response MUST call the tool:\nTOOL_CALL: query_nearby_locations\nPARAMETERS: {"latitude": ' +
          Number(context.currentLocation.latitude) +
          ', "longitude": ' +
          Number(context.currentLocation.longitude) +
          ', "radiusKm": ' +
          (context.maxRadiusKm || 10) +
          ', "limit": 6}\n\nDo NOT write anything else. Just call the tool.',
      });

      this.logger.debug('Starting AI agent conversation...');

      // Store context for use in tool result message
      const storedContext = context;

      // Store tool result for fallback extraction if needed
      let lastToolResult: any[] = [];

      // Agent loop - AI can call tools multiple times
      let iterations = 0;
      const maxIterations = 2; // Need 2 iterations: 1 for tool call, 1 for final response (optimized for speed)
      let toolExecuted = false;

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
            temperature: 0.1, // Very low temperature for fastest, most deterministic responses
            num_predict: iterations === 1 ? 150 : 180, // Increased for second iteration to ensure complete UUIDs
            top_p: 0.6, // Lower top_p for faster generation (was 0.7)
            num_thread: 8, // M4 has 10 cores (4P+6E), use 8 threads for optimal performance
            // M4 automatically uses Metal/GPU acceleration via Ollama, no manual config needed
          },
        });

        const content = response.message.content;
        // Log first iteration response to debug tool call issues
        if (iterations === 1) {
          this.logger.debug(
            `AI first response (${content.length} chars): ${content.slice(0, 300)}...`,
          );
        } else if (content.length > 500) {
          this.logger.debug(
            `AI response (${content.length} chars): ${content.slice(0, 100)}...`,
          );
        }

        conversationHistory.push({
          role: 'assistant',
          content,
        });

        const toolCall = this.parseToolCall(content);

        if (toolCall) {
          toolExecuted = true;
          this.logger.debug(
            `AI calling tool: ${toolCall.name} with params: ${JSON.stringify(toolCall.parameters)}`,
          );

          // Execute tool
          const toolResult = await this.executeTool(
            toolCall.name,
            toolCall.parameters,
            schema,
          );

          // Store for potential fallback extraction
          lastToolResult = toolResult;

          this.logger.debug(
            `Tool returned ${toolResult.length || 0} locations. First 3 distances: ${toolResult
              .slice(0, 3)
              .map((l: any) => `${l.name}: ${l.distance?.toFixed(2)}km`)
              .join(', ')}`,
          );

          // Send result back to AI with concise format reminder
          // Limit result size to speed up processing - only need numberOfLocations + 1 for buffer
          const neededCount = storedContext.numberOfLocations + 1;
          const limitedResults = toolResult.slice(0, Math.min(neededCount, 6)); // Max 6 for speed
          const resultSummary = limitedResults.map((loc: any) => ({
            id: loc.id,
            n: loc.name.substring(0, 25), // Truncate to 25 chars (was 30)
            d: parseFloat(loc.distance).toFixed(1), // Just number, no 'km'
          }));

          // Force AI to respond immediately after tool result - ultra concise
          // Show exact UUIDs to make it easier for AI to copy
          const uuidList = resultSummary.map((loc: any) => loc.id).join(', ');
          conversationHistory.push({
            role: 'user',
            content: `${limitedResults.length} locs:\n${JSON.stringify(resultSummary)}\n\n🚨 MANDATORY FORMAT (copy EXACTLY):\nREASONING: [2 sentences Vietnamese]\nTIPS:\n- [tip 1]\n- [tip 2]\nLOCATION_IDS: ${uuidList}\nACTIVITIES:\n${resultSummary.map((loc: any) => `${loc.id}: [activity]`).join('\n')}\n\n⚠️ YOU MUST include LOCATION_IDS line with UUIDs above. Copy them EXACTLY: ${uuidList}`,
          });
        } else {
          // AI finished, return final response
          // If tool wasn't called in first iteration, fail immediately (no fallback)
          if (iterations === 1 && !toolExecuted) {
            this.logger.error(
              '❌ AI did not call tool in first iteration. Cannot proceed without AI tool call.',
            );
            return null;
          }
          this.logger.debug('AI finished, parsing final response...');
          this.logger.debug(`Full AI response:\n${content}`); // Log full response
          const parsed = this.parseAIResponse(content);
          this.logger.debug(
            `Parsed: ${parsed.suggestedLocationIds?.length || 0} locations, ${parsed.tips.length} tips, ${Object.keys(parsed.locationActivities || {}).length} activities`,
          );

          // If not enough location IDs found, supplement from tool result (fallback extraction)
          const neededCount = storedContext.numberOfLocations;
          const currentCount = parsed.suggestedLocationIds?.length || 0;

          if (currentCount < neededCount) {
            this.logger.warn(
              `⚠️ AI returned only ${currentCount}/${neededCount} location IDs. Supplementing from tool result...`,
            );
            this.logger.debug(
              `🔍 lastToolResult has ${lastToolResult?.length || 0} locations:`,
              lastToolResult?.slice(0, 5).map((l: any) => ({
                id: l.id,
                name: l.name,
                distance: l.distance,
              })) || 'null',
            );
            if (lastToolResult && lastToolResult.length > 0) {
              // Extract locations from tool result
              const toolResultIds = lastToolResult
                .slice(0, neededCount)
                .map((loc: any) => loc.id)
                .filter((id: string) => id);

              // Merge: use AI IDs first, then fill with tool result IDs
              const existingIds = new Set(parsed.suggestedLocationIds || []);
              const additionalIds = toolResultIds.filter(
                (id: string) => !existingIds.has(id),
              );
              const finalIds = [
                ...(parsed.suggestedLocationIds || []),
                ...additionalIds,
              ].slice(0, neededCount);

              if (finalIds.length >= neededCount) {
                this.logger.log(
                  `✅ Extracted ${finalIds.length} location IDs (${currentCount} from AI + ${additionalIds.length} from tool result)`,
                );
                parsed.suggestedLocationIds = finalIds;
              } else {
                this.logger.error(
                  `❌ Could only extract ${finalIds.length}/${neededCount} location IDs`,
                );
                return null;
              }
            } else {
              this.logger.error('❌ No tool result available for extraction');
              return null;
            }
          } else if (parsed.suggestedLocationIds) {
            this.logger.log(
              `✅ Successfully parsed ${parsed.suggestedLocationIds.length} location IDs`,
            );
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
    return `You are a HCMC travel agent. You MUST call the tool FIRST before responding.

STEP 1 - FIRST RESPONSE (MANDATORY):
You MUST start your response with:
TOOL_CALL: query_nearby_locations
PARAMETERS: {"latitude": 10.762622, "longitude": 106.660172, "radiusKm": 10, "limit": 6}

STEP 2 - AFTER RECEIVING TOOL RESULTS:
REASONING: [2 sentences Vietnamese]
TIPS:
- [tip 1]
- [tip 2]
LOCATION_IDS: [UUIDs comma-separated from "id" field]
ACTIVITIES:
[uuid]: [activity]
[uuid]: [activity]

CRITICAL:
- Your FIRST response MUST call the tool (TOOL_CALL + PARAMETERS)
- NO markdown (###, ##, #)
- NO placeholders
- Copy UUIDs exactly from "id" field`;
  }

  /**
   * Build initial agent prompt
   */
  private buildAgentPrompt(context: JourneyContext): string {
    const topPreferences = Object.entries(context.userPreferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 1) // Only top 1 preference for speed (was 2)
      .map(([tag, score]) => `${tag.replace('tag_', '')}:${score}`);

    return `Plan ${context.numberOfLocations} locs, ${context.maxRadiusKm || 10}km.
Start: ${Number(context.currentLocation.latitude)}, ${Number(context.currentLocation.longitude)}
Pref: ${topPreferences[0] || 'none'}

⚠️ Call tool FIRST (NO markdown):
TOOL_CALL: query_nearby_locations
PARAMETERS: {"latitude": ${Number(context.currentLocation.latitude)}, "longitude": ${Number(context.currentLocation.longitude)}, "radiusKm": ${context.maxRadiusKm || 10}, "limit": 6}

Then respond EXACT format (NO ###, NO markdown):
REASONING: [2 sentences Vietnamese]
TIPS:
- [tip 1]
- [tip 2]
LOCATION_IDS: [UUIDs comma-separated]
ACTIVITIES:
[uuid]: [activity]
...

Select ${context.numberOfLocations} closest, copy REAL UUIDs from "id" field.`;
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

      // Handle formats: "TOOL_CALL: ..." or "Step 1: TOOL_CALL: ..." or "Step 1:TOOL_CALL: ..."
      if (line.includes('TOOL_CALL:')) {
        const toolCallMatch = line.match(/TOOL_CALL:\s*(.+)/i);
        if (toolCallMatch) {
          toolName = toolCallMatch[1].trim();
        }
      } else if (line.includes('PARAMETERS:')) {
        // Collect JSON (might be multi-line) - handle "PARAMETERS:" or "Step 1: PARAMETERS:"
        const paramsMatch = line.match(/PARAMETERS:\s*(.+)/i);
        if (paramsMatch) {
          parametersJson = paramsMatch[1].trim();
        } else {
          parametersJson = line.replace(/.*PARAMETERS:/i, '').trim();
        }

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
    // Limit to 6 locations for faster query and response (was 8)
    const limit = Math.min(params.limit || 6, 6);

    // Ensure minimum radius of 5km to get enough locations
    const minRadius = 5;
    const radiusKm = Math.max(params.radiusKm, minRadius);

    this.logger.debug(
      `🔍 queryNearbyLocations: lat=${params.latitude}, lng=${params.longitude}, radius=${radiusKm}km (requested: ${params.radiusKm}km), limit=${limit}`,
    );

    // Optimized query - removed image_url and tags aggregation for faster query
    // Tags not needed for AI selection, can be fetched later if needed
    const query = `
      SELECT 
        l.id,
        l.name,
        l.latitude,
        l.longitude,
        (
          6371 * acos(
            GREATEST(-1, LEAST(1,
              cos(radians($1)) * cos(radians(l.latitude)) *
              cos(radians(l.longitude) - radians($2)) +
              sin(radians($1)) * sin(radians(l.latitude))
            ))
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
            GREATEST(-1, LEAST(1,
              cos(radians($1)) * cos(radians(l.latitude)) *
              cos(radians(l.longitude) - radians($2)) +
              sin(radians($1)) * sin(radians(l.latitude))
            ))
          )
        ) <= $3
      GROUP BY l.id, l.name, l.address_line, l.latitude, l.longitude, l.image_url, l.average_rating, l.total_reviews
      ORDER BY distance ASC
      LIMIT $4
    `;

    const result = await this.dataSource.query(query, [
      params.latitude,
      params.longitude,
      radiusKm,
      limit,
    ]);

    this.logger.debug(
      `🔍 Query returned ${result.length} locations:`,
      result.map((r: any) => ({
        id: r.id,
        name: r.name,
        distance: r.distance,
      })),
    );

    // If not enough locations and radius is small, retry with larger radius
    const minRequiredLocations = 3; // Minimum for journey planning
    if (result.length < minRequiredLocations && radiusKm < 20) {
      this.logger.warn(
        `⚠️ Only found ${result.length} locations with radius ${radiusKm}km. Retrying with 20km...`,
      );
      return this.queryNearbyLocations(
        {
          ...params,
          radiusKm: 20, // Retry with larger radius
        },
        schema,
      );
    }

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
            GREATEST(-1, LEAST(1,
              cos(radians($1)) * cos(radians(l.latitude)) *
              cos(radians(l.longitude) - radians($2)) +
              sin(radians($1)) * sin(radians(l.latitude))
            ))
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

      // Handle markdown formats: ### REASONING:, ## REASONING:, REASONING:
      if (trimmed.match(/^#*\s*REASONING:/i)) {
        currentSection = 'reasoning';
        reasoning = trimmed.replace(/^#*\s*REASONING:/i, '').trim();
      } else if (trimmed.match(/^#*\s*TIPS:/i)) {
        currentSection = 'tips';
      } else if (trimmed.match(/^#*\s*ACTIVITIES:/i)) {
        currentSection = 'activities';
      } else if (
        trimmed.match(/^#*\s*LOCATION_IDS:/i) ||
        trimmed.match(/^#*\s*LOCATION IDS:/i) ||
        trimmed.match(/^#*\s*LOCATION IDS AND ACTIVITIES:/i)
      ) {
        // Handle various formats (including markdown)
        let idsStr = trimmed
          .replace(/^#*\s*LOCATION_IDS:/i, '')
          .replace(/^#*\s*LOCATION IDS:/i, '')
          .replace(/^#*\s*LOCATION IDS AND ACTIVITIES:/i, '')
          .trim();

        // If format is "LOCATION IDS AND ACTIVITIES:", skip to next line
        if (trimmed.includes('AND ACTIVITIES')) {
          // Try to extract from next lines
          continue;
        }

        // Parse UUIDs - handle incomplete UUIDs by trying to complete them from tool result
        const rawIds = idsStr.split(',').map((id) => id.trim());
        locationIds = rawIds
          .map((id) => {
            // Skip placeholders like UUID1, UUID2, etc.
            if (/^UUID\d+$/i.test(id)) {
              this.logger.warn(`⚠️ Skipping placeholder: "${id}"`);
              return null;
            }
            // Validate UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
            const uuidRegex =
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(id)) {
              return id;
            }
            // Try to fix incomplete UUID (e.g., "3b0" -> try to find matching UUID)
            if (id.length < 36 && id.length > 3) {
              this.logger.warn(
                `⚠️ Incomplete UUID detected: "${id}" - will try to match from tool result`,
              );
              return null; // Will be handled by fallback extraction
            }
            this.logger.warn(`⚠️ Invalid UUID format: "${id}" - skipping`);
            return null;
          })
          .filter((id): id is string => id !== null);
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
   * Generic chat method for dynamic prompts
   */
  async chat(dto: {
    prompt: string;
    systemMessage?: string;
  }): Promise<{ content: string; model: string }> {
    if (!this.enabled) {
      throw new Error('Ollama is not enabled');
    }

    try {
      const messages: any[] = [];

      // Add system message if provided
      if (dto.systemMessage) {
        messages.push({
          role: 'system',
          content: dto.systemMessage,
        });
      }

      // Add user prompt
      messages.push({
        role: 'user',
        content: dto.prompt,
      });

      const response = await this.ollama.chat({
        model: this.model,
        messages,
        options: {
          temperature: 0.7,
          num_predict: 500,
          top_p: 0.9,
          num_thread: 8,
        },
      });

      return {
        content: response.message.content,
        model: this.model,
      };
    } catch (error) {
      this.logger.error('Ollama chat error:', error);
      throw error;
    }
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
