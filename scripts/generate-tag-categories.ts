import { config } from 'dotenv';
import { resolve } from 'path';
import { Client } from 'pg';

// Load environment variables
config({ path: resolve(__dirname, '../.env.development') });

interface Tag {
  id: number;
  display_name: string;
  group_name: string;
}

type CategoryType = 'USER' | 'LOCATION' | 'EVENT' | 'ALL';

interface TagCategory {
  name: string;
  description: string;
  color: string;
  icon: string;
  applicableTypes: CategoryType[]; // Changed from single to array
  tagScoreWeights: Record<string, number>;
}

/**
 * Analyze tags and automatically generate tag categories
 * based on semantic meaning and common groupings
 */
async function generateTagCategories() {
  const client = new Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'urban_lens_dev',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const schema = process.env.DATABASE_SCHEMA || 'development';

    // Create tag_category table if not exists
    console.log('\n📦 Creating/updating tag_category table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.tag_category (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        tag_score_weights JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Add color column if not exists
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = '${schema}' 
          AND table_name = 'tag_category' 
          AND column_name = 'color'
        ) THEN
          ALTER TABLE ${schema}.tag_category ADD COLUMN color VARCHAR(50);
        END IF;
      END $$;
      
      -- Add icon column if not exists
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = '${schema}' 
          AND table_name = 'tag_category' 
          AND column_name = 'icon'
        ) THEN
          ALTER TABLE ${schema}.tag_category ADD COLUMN icon VARCHAR(50);
        END IF;
      END $$;
      
      -- Add applicable_types column if not exists
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = '${schema}' 
          AND table_name = 'tag_category' 
          AND column_name = 'applicable_types'
        ) THEN
          ALTER TABLE ${schema}.tag_category ADD COLUMN applicable_types JSONB DEFAULT '["USER"]'::jsonb;
        END IF;
      END $$;
      
      CREATE INDEX IF NOT EXISTS idx_tag_category_weights 
      ON ${schema}.tag_category USING gin(tag_score_weights);
      CREATE INDEX IF NOT EXISTS idx_tag_category_applicable_types 
      ON ${schema}.tag_category USING gin(applicable_types);
    `);
    console.log('✅ Table created/updated');

    // Fetch all tags
    const result = await client.query(
      `SELECT id, display_name, group_name FROM ${schema}.tag WHERE deleted_at IS NULL ORDER BY id`,
    );

    const tags: Tag[] = result.rows;
    console.log(`\n📊 Found ${tags.length} tags in database:\n`);
    tags.forEach((tag) => {
      console.log(`  [${tag.id}] ${tag.display_name} (${tag.group_name})`);
    });

    // Auto-generate categories based on tag analysis
    const categories = analyzeAndGenerateCategories(tags);

    console.log(`\n\n🎯 Generated ${categories.length} tag categories:\n`);

    // Insert categories into database
    for (const category of categories) {
      console.log(`\n📝 Creating category: ${category.name}`);
      console.log(`   Description: ${category.description}`);
      console.log(`   Weights:`, category.tagScoreWeights);

      await client.query(
        `
        INSERT INTO ${schema}.tag_category (name, description, color, icon, applicable_types, tag_score_weights)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          color = EXCLUDED.color,
          icon = EXCLUDED.icon,
          applicable_types = EXCLUDED.applicable_types,
          tag_score_weights = EXCLUDED.tag_score_weights,
          updated_at = CURRENT_TIMESTAMP
        `,
        [
          category.name,
          category.description,
          category.color,
          category.icon,
          JSON.stringify(category.applicableTypes),
          JSON.stringify(category.tagScoreWeights),
        ],
      );

      console.log(`   ✅ Created/Updated`);
    }

    // Verify results
    const verifyResult = await client.query(
      `SELECT id, name, description, color, icon, applicable_types, tag_score_weights FROM ${schema}.tag_category ORDER BY id`,
    );

    console.log(
      `\n\n✅ Successfully created ${verifyResult.rows.length} tag categories:`,
    );
    verifyResult.rows.forEach((row) => {
      const types = Array.isArray(row.applicable_types)
        ? row.applicable_types.join(', ')
        : JSON.stringify(row.applicable_types);
      console.log(`\n[${row.id}] ${row.icon} ${row.name} (${types})`);
      console.log(`   ${row.description}`);
      console.log(`   Color: ${row.color}`);
      console.log(`   Weights:`, row.tag_score_weights);
    });
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

/**
 * Analyze tags and generate categories based on semantic groupings
 */
function analyzeAndGenerateCategories(tags: Tag[]): TagCategory[] {
  const categories: TagCategory[] = [];

  // Keywords for categorization (expanded)
  const natureKeywords = [
    'thiên nhiên',
    'cây',
    'rừng',
    'biển',
    'núi',
    'hồ',
    'sông',
    'cảnh đẹp',
    'nature',
    'outdoor',
    'ngoài trời',
    'park',
    'hiking',
    'tropical',
  ];
  const quietKeywords = [
    'yên tĩnh',
    'thư giãn',
    'peaceful',
    'quiet',
    'relax',
    'zen',
    'meditation',
    'cozy',
    'minimalist',
  ];
  const livelyKeywords = [
    'sôi động',
    'vui vẻ',
    'đông người',
    'lively',
    'crowded',
    'busy',
    'nightlife',
    'party',
    'bar',
    'club',
    'dance',
  ];
  const cultureKeywords = [
    'văn hóa',
    'lịch sử',
    'bảo tàng',
    'di tích',
    'culture',
    'history',
    'museum',
    'heritage',
    'kiến trúc',
    'architecture',
  ];
  const foodKeywords = [
    'ẩm thực',
    'đồ ăn',
    'quán ăn',
    'nhà hàng',
    'cafe',
    'café',
    'cà phê',
    'food',
    'restaurant',
    'cuisine',
    'street food',
    'coffee',
    'cooking',
  ];
  const sportKeywords = [
    'thể thao',
    'gym',
    'yoga',
    'chạy',
    'bơi',
    'sport',
    'fitness',
    'exercise',
    'hoạt động',
    'wellness',
  ];
  const shoppingKeywords = [
    'mua sắm',
    'shopping',
    'chợ',
    'market',
    'mall',
    'cửa hàng',
    'store',
    'bookstore',
    'fashion',
  ];
  const artKeywords = [
    'nghệ thuật',
    'art',
    'gallery',
    'triển lãm',
    'exhibition',
    'sáng tạo',
    'creative',
    'artistic',
    'jam',
  ];
  const musicKeywords = [
    'nhạc',
    'music',
    'concert',
    'live music',
    'open mic',
    'screening',
  ];
  const techKeywords = [
    'công nghệ',
    'technology',
    'tech',
    'coworking',
    'startup',
    'hackathon',
    'workshop',
  ];
  const romanticKeywords = ['romantic', 'lãng mạn', 'rooftop', 'luxurious'];
  const familyKeywords = ['family', 'gia đình', 'pet', 'friendly'];
  const vintageKeywords = ['vintage', 'cổ điển', 'rustic', 'bohemian'];
  const modernKeywords = ['modern', 'hiện đại', 'futuristic', 'industrial'];
  const socialKeywords = ['meetup', 'workshop', 'networking', 'charity'];
  const entertainmentKeywords = [
    'giải trí',
    'entertainment',
    'game',
    'gaming',
    'board games',
    'film',
    'screening',
  ];
  const vegetarianKeywords = ['vegetarian', 'chay', 'vegan'];
  const sightseeingKeywords = ['sightseeing', 'tham quan', 'du lịch', 'tour'];

  // Categorize tags
  const natureTags: number[] = [];
  const quietTags: number[] = [];
  const livelyTags: number[] = [];
  const cultureTags: number[] = [];
  const foodTags: number[] = [];
  const sportTags: number[] = [];
  const shoppingTags: number[] = [];
  const artTags: number[] = [];
  const musicTags: number[] = [];
  const techTags: number[] = [];
  const romanticTags: number[] = [];
  const familyTags: number[] = [];
  const vintageTags: number[] = [];
  const modernTags: number[] = [];
  const socialTags: number[] = [];
  const entertainmentTags: number[] = [];
  const vegetarianTags: number[] = [];
  const sightseeingTags: number[] = [];

  tags.forEach((tag) => {
    const text = `${tag.display_name} ${tag.group_name}`.toLowerCase();

    if (matchKeywords(text, natureKeywords)) natureTags.push(tag.id);
    if (matchKeywords(text, quietKeywords)) quietTags.push(tag.id);
    if (matchKeywords(text, livelyKeywords)) livelyTags.push(tag.id);
    if (matchKeywords(text, cultureKeywords)) cultureTags.push(tag.id);
    if (matchKeywords(text, foodKeywords)) foodTags.push(tag.id);
    if (matchKeywords(text, sportKeywords)) sportTags.push(tag.id);
    if (matchKeywords(text, shoppingKeywords)) shoppingTags.push(tag.id);
    if (matchKeywords(text, artKeywords)) artTags.push(tag.id);
    if (matchKeywords(text, musicKeywords)) musicTags.push(tag.id);
    if (matchKeywords(text, techKeywords)) techTags.push(tag.id);
    if (matchKeywords(text, romanticKeywords)) romanticTags.push(tag.id);
    if (matchKeywords(text, familyKeywords)) familyTags.push(tag.id);
    if (matchKeywords(text, vintageKeywords)) vintageTags.push(tag.id);
    if (matchKeywords(text, modernKeywords)) modernTags.push(tag.id);
    if (matchKeywords(text, socialKeywords)) socialTags.push(tag.id);
    if (matchKeywords(text, entertainmentKeywords))
      entertainmentTags.push(tag.id);
    if (matchKeywords(text, vegetarianKeywords)) vegetarianTags.push(tag.id);
    if (matchKeywords(text, sightseeingKeywords)) sightseeingTags.push(tag.id);
  });

  // Generate categories with positive and negative weights
  // All categories are USER type by default (for user preferences/onboarding)
  if (quietTags.length > 0) {
    categories.push({
      name: 'Quiet & Peaceful',
      description:
        'Prefer quiet, peaceful places close to nature and relaxation',
      color: '#4CAF50',
      icon: '🌿',
      applicableTypes: ['USER', 'LOCATION'], // For user preferences and location categorization
      tagScoreWeights: {
        ...createWeights(quietTags, 10),
        ...createWeights(natureTags.slice(0, 3), 8),
        ...createWeights(livelyTags, -8),
      },
    });
  }

  if (livelyTags.length > 0) {
    categories.push({
      name: 'Lively & Energetic',
      description: 'Prefer lively, energetic, and crowded venues',
      color: '#FF5722',
      icon: '🎉',
      applicableTypes: ['USER', 'LOCATION', 'EVENT'], // Suitable for all contexts
      tagScoreWeights: {
        ...createWeights(livelyTags, 10),
        ...createWeights(musicTags.slice(0, 2), 8),
        ...createWeights(entertainmentTags.slice(0, 2), 7),
        ...createWeights(quietTags, -8),
      },
    });
  }

  if (natureTags.length > 0) {
    categories.push({
      name: 'Nature Lover',
      description: 'Love nature, green spaces, and outdoor activities',
      color: '#8BC34A',
      icon: '🌳',
      applicableTypes: ['USER', 'LOCATION', 'EVENT'], // Parks, outdoor events, hiking
      tagScoreWeights: {
        ...createWeights(natureTags, 10),
        ...createWeights(sportTags.slice(0, 2), 7),
        ...createWeights(sightseeingTags.slice(0, 2), 6),
        ...createWeights(shoppingTags, -5),
        ...createWeights(techTags, -4),
      },
    });
  }

  if (cultureTags.length > 0) {
    categories.push({
      name: 'Culture & History',
      description:
        'Interested in culture, history, heritage sites, and museums',
      color: '#795548',
      icon: '🏛️',
      applicableTypes: ['USER', 'LOCATION', 'EVENT'], // Museums, heritage sites, cultural events
      tagScoreWeights: {
        ...createWeights(cultureTags, 10),
        ...createWeights(artTags.slice(0, 2), 8),
        ...createWeights(sightseeingTags.slice(0, 2), 7),
        ...createWeights(livelyTags, -4),
      },
    });
  }

  if (foodTags.length > 0) {
    categories.push({
      name: 'Foodie',
      description: 'Passionate about exploring food, restaurants, and cafés',
      color: '#FF9800',
      icon: '🍜',
      applicableTypes: ['USER', 'LOCATION', 'EVENT'], // Restaurants, cafes, food festivals
      tagScoreWeights: {
        ...createWeights(foodTags, 10),
        ...createWeights(shoppingTags.slice(0, 2), 6),
        ...createWeights(romanticTags.slice(0, 2), 5),
        ...createWeights(sportTags, -3),
      },
    });
  }

  if (sportTags.length > 0) {
    categories.push({
      name: 'Sports & Fitness',
      description: 'Love sports activities, fitness, and active lifestyle',
      color: '#2196F3',
      icon: '💪',
      applicableTypes: ['USER', 'LOCATION', 'EVENT'], // Gyms, stadiums, sports events
      tagScoreWeights: {
        ...createWeights(sportTags, 10),
        ...createWeights(natureTags.slice(0, 2), 8),
        ...createWeights(foodTags, -2),
      },
    });
  }

  if (artTags.length > 0) {
    categories.push({
      name: 'Art Enthusiast',
      description: 'Love art, exhibitions, and creative spaces',
      color: '#9C27B0',
      icon: '🎨',
      applicableTypes: ['USER', 'LOCATION'], // User preference and location type
      tagScoreWeights: {
        ...createWeights(artTags, 10),
        ...createWeights(cultureTags.slice(0, 2), 8),
        ...createWeights(vintageTags.slice(0, 2), 6),
        ...createWeights(livelyTags, -3),
      },
    });
  }

  if (shoppingTags.length > 0) {
    categories.push({
      name: 'Shopping Lover',
      description: 'Enjoy shopping, exploring stores, markets, and malls',
      color: '#E91E63',
      icon: '🛍️',
      applicableTypes: ['USER', 'LOCATION'], // User preference and location type
      tagScoreWeights: {
        ...createWeights(shoppingTags, 10),
        ...createWeights(foodTags.slice(0, 2), 7),
        ...createWeights(natureTags, -4),
      },
    });
  }

  // New categories
  if (musicTags.length > 0) {
    categories.push({
      name: 'Music Lover',
      description: 'Passionate about music, concerts, and live performances',
      color: '#F44336',
      icon: '🎵',
      applicableTypes: ['USER', 'LOCATION'], // User preference and location type
      tagScoreWeights: {
        ...createWeights(musicTags, 10),
        ...createWeights(livelyTags.slice(0, 2), 8),
        ...createWeights(artTags.slice(0, 2), 6),
        ...createWeights(quietTags, -5),
      },
    });
  }

  if (techTags.length > 0) {
    categories.push({
      name: 'Tech Enthusiast',
      description: 'Love technology, startups, and modern workspaces',
      color: '#607D8B',
      icon: '💻',
      applicableTypes: ['USER', 'LOCATION'], // User preference and location type
      tagScoreWeights: {
        ...createWeights(techTags, 10),
        ...createWeights(modernTags.slice(0, 2), 8),
        ...createWeights(socialTags.slice(0, 2), 7),
        ...createWeights(vintageTags, -4),
      },
    });
  }

  if (romanticTags.length > 0) {
    categories.push({
      name: 'Romantic Seeker',
      description: 'Prefer romantic, luxurious venues with great views',
      color: '#E91E63',
      icon: '💕',
      applicableTypes: ['USER', 'LOCATION'], // User preference and location type
      tagScoreWeights: {
        ...createWeights(romanticTags, 10),
        ...createWeights(foodTags.slice(0, 2), 8),
        ...createWeights(quietTags.slice(0, 2), 7),
        ...createWeights(livelyTags, -6),
        ...createWeights(familyTags, -4),
      },
    });
  }

  if (familyTags.length > 0) {
    categories.push({
      name: 'Family Friendly',
      description: 'Suitable for families, children, and pets',
      color: '#FFEB3B',
      icon: '👨‍👩‍👧‍👦',
      applicableTypes: ['USER', 'LOCATION'], // User preference and location type
      tagScoreWeights: {
        ...createWeights(familyTags, 10),
        ...createWeights(natureTags.slice(0, 2), 8),
        ...createWeights(foodTags.slice(0, 2), 6),
        ...createWeights(livelyTags, -5),
        ...createWeights(romanticTags, -3),
      },
    });
  }

  if (vintageTags.length > 0) {
    categories.push({
      name: 'Vintage Style',
      description: 'Love vintage, retro, and bohemian styles',
      color: '#8D6E63',
      icon: '📻',
      applicableTypes: ['USER', 'LOCATION'], // User preference and location type
      tagScoreWeights: {
        ...createWeights(vintageTags, 10),
        ...createWeights(artTags.slice(0, 2), 8),
        ...createWeights(cultureTags.slice(0, 2), 6),
        ...createWeights(modernTags, -6),
        ...createWeights(techTags, -5),
      },
    });
  }

  if (modernTags.length > 0) {
    categories.push({
      name: 'Modern Style',
      description: 'Prefer modern, minimalist, and industrial design',
      color: '#9E9E9E',
      icon: '🏢',
      applicableTypes: ['USER', 'LOCATION'], // User preference and location type
      tagScoreWeights: {
        ...createWeights(modernTags, 10),
        ...createWeights(techTags.slice(0, 2), 8),
        ...createWeights(artTags.slice(0, 2), 6),
        ...createWeights(vintageTags, -6),
      },
    });
  }

  if (socialTags.length > 0) {
    categories.push({
      name: 'Social Butterfly',
      description: 'Enjoy networking events, workshops, and meetups',
      color: '#00BCD4',
      icon: '🤝',
      applicableTypes: ['USER', 'LOCATION'], // User preference and location type
      tagScoreWeights: {
        ...createWeights(socialTags, 10),
        ...createWeights(techTags.slice(0, 2), 8),
        ...createWeights(cultureTags.slice(0, 2), 6),
        ...createWeights(quietTags, -5),
      },
    });
  }

  if (entertainmentTags.length > 0) {
    categories.push({
      name: 'Entertainment Seeker',
      description: 'Love games, movies, and entertainment activities',
      color: '#FFC107',
      icon: '🎮',
      applicableTypes: ['USER', 'LOCATION'], // User preference and location type
      tagScoreWeights: {
        ...createWeights(entertainmentTags, 10),
        ...createWeights(livelyTags.slice(0, 2), 7),
        ...createWeights(foodTags.slice(0, 2), 6),
        ...createWeights(sportTags, -3),
      },
    });
  }

  if (vegetarianTags.length > 0) {
    categories.push({
      name: 'Healthy Lifestyle',
      description: 'Prefer vegetarian food and healthy living',
      color: '#8BC34A',
      icon: '🥗',
      applicableTypes: ['USER', 'LOCATION'], // User preference and location type
      tagScoreWeights: {
        ...createWeights(vegetarianTags, 10),
        ...createWeights(sportTags.slice(0, 2), 8),
        ...createWeights(foodTags.slice(0, 2), 7),
        ...createWeights(livelyTags, -3),
      },
    });
  }

  if (sightseeingTags.length > 0) {
    categories.push({
      name: 'Travel & Sightseeing',
      description: 'Love exploring and discovering new places',
      color: '#03A9F4',
      icon: '📸',
      applicableTypes: ['USER', 'LOCATION'], // User preference and location type
      tagScoreWeights: {
        ...createWeights(sightseeingTags, 10),
        ...createWeights(cultureTags.slice(0, 2), 8),
        ...createWeights(natureTags.slice(0, 2), 7),
        ...createWeights(techTags, -3),
      },
    });
  }

  // Fallback: Create a general category if no specific matches
  if (categories.length === 0 && tags.length > 0) {
    const topTags = tags.slice(0, 5).map((t) => t.id);
    categories.push({
      name: 'Diverse Explorer',
      description: 'Enjoy exploring diverse types of places',
      color: '#9C27B0',
      icon: '🌟',
      applicableTypes: ['USER', 'LOCATION'], // User preference and location type
      tagScoreWeights: createWeights(topTags, 8),
    });
  }

  return categories;
}

/**
 * Check if text matches any of the keywords
 */
function matchKeywords(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

/**
 * Create tag score weights object
 */
function createWeights(
  tagIds: number[],
  score: number,
): Record<string, number> {
  const weights: Record<string, number> = {};
  tagIds.forEach((id) => {
    weights[`tag_${id}`] = score;
  });
  return weights;
}

// Run the script
generateTagCategories()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
