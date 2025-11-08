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

interface TagCategory {
  name: string;
  description: string;
  color: string;
  icon: string;
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
      
      CREATE INDEX IF NOT EXISTS idx_tag_category_weights 
      ON ${schema}.tag_category USING gin(tag_score_weights);
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
        INSERT INTO ${schema}.tag_category (name, description, color, icon, tag_score_weights)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          color = EXCLUDED.color,
          icon = EXCLUDED.icon,
          tag_score_weights = EXCLUDED.tag_score_weights,
          updated_at = CURRENT_TIMESTAMP
        `,
        [
          category.name,
          category.description,
          category.color,
          category.icon,
          JSON.stringify(category.tagScoreWeights),
        ],
      );

      console.log(`   ✅ Created/Updated`);
    }

    // Verify results
    const verifyResult = await client.query(
      `SELECT id, name, description, color, icon, tag_score_weights FROM ${schema}.tag_category ORDER BY id`,
    );

    console.log(
      `\n\n✅ Successfully created ${verifyResult.rows.length} tag categories:`,
    );
    verifyResult.rows.forEach((row) => {
      console.log(`\n[${row.id}] ${row.icon} ${row.name}`);
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
  if (quietTags.length > 0) {
    categories.push({
      name: 'Thích yên tĩnh',
      description:
        'Ưa thích những địa điểm yên tĩnh, thư giãn, gần thiên nhiên',
      color: '#4CAF50',
      icon: '🌿',
      tagScoreWeights: {
        ...createWeights(quietTags, 10),
        ...createWeights(natureTags.slice(0, 3), 8),
        ...createWeights(livelyTags, -8),
      },
    });
  }

  if (livelyTags.length > 0) {
    categories.push({
      name: 'Thích sôi động',
      description: 'Ưa thích những địa điểm sôi động, vui vẻ, đông người',
      color: '#FF5722',
      icon: '🎉',
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
      name: 'Ưa thiên nhiên',
      description:
        'Yêu thích cảnh quan thiên nhiên, không gian xanh, hoạt động ngoài trời',
      color: '#8BC34A',
      icon: '🌳',
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
      name: 'Thích văn hóa - lịch sử',
      description: 'Quan tâm đến văn hóa, lịch sử, di tích, bảo tàng',
      color: '#795548',
      icon: '🏛️',
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
      name: 'Thích ẩm thực',
      description: 'Đam mê khám phá ẩm thực, quán ăn, cafe',
      color: '#FF9800',
      icon: '🍜',
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
      name: 'Thích hoạt động thể thao',
      description: 'Yêu thích các hoạt động thể thao, vận động, năng động',
      color: '#2196F3',
      icon: '💪',
      tagScoreWeights: {
        ...createWeights(sportTags, 10),
        ...createWeights(natureTags.slice(0, 2), 8),
        ...createWeights(foodTags, -2),
      },
    });
  }

  if (artTags.length > 0) {
    categories.push({
      name: 'Thích nghệ thuật',
      description: 'Yêu thích nghệ thuật, triển lãm, không gian sáng tạo',
      color: '#9C27B0',
      icon: '🎨',
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
      name: 'Thích mua sắm',
      description:
        'Yêu thích mua sắm, khám phá các cửa hàng, chợ, trung tâm thương mại',
      color: '#E91E63',
      icon: '🛍️',
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
      name: 'Yêu âm nhạc',
      description: 'Đam mê âm nhạc, hòa nhạc, biểu diễn trực tiếp',
      color: '#F44336',
      icon: '🎵',
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
      name: 'Đam mê công nghệ',
      description: 'Yêu thích công nghệ, startup, không gian làm việc hiện đại',
      color: '#607D8B',
      icon: '💻',
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
      name: 'Tìm không gian lãng mạn',
      description: 'Ưa thích những địa điểm lãng mạn, sang trọng, view đẹp',
      color: '#E91E63',
      icon: '💕',
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
      name: 'Thân thiện gia đình',
      description: 'Phù hợp cho gia đình, trẻ em, thú cưng',
      color: '#FFEB3B',
      icon: '👨‍👩‍👧‍👦',
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
      name: 'Phong cách cổ điển',
      description: 'Yêu thích phong cách vintage, retro, bohemian',
      color: '#8D6E63',
      icon: '📻',
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
      name: 'Phong cách hiện đại',
      description: 'Ưa thích thiết kế hiện đại, tối giản, công nghiệp',
      color: '#9E9E9E',
      icon: '🏢',
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
      name: 'Thích giao lưu - networking',
      description: 'Yêu thích các sự kiện gặp gỡ, workshop, networking',
      color: '#00BCD4',
      icon: '🤝',
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
      name: 'Thích giải trí',
      description: 'Yêu thích game, phim ảnh, các hoạt động giải trí',
      color: '#FFC107',
      icon: '🎮',
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
      name: 'Ăn chay - Healthy lifestyle',
      description: 'Ưa thích đồ ăn chay, lối sống lành mạnh',
      color: '#8BC34A',
      icon: '🥗',
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
      name: 'Thích tham quan du lịch',
      description: 'Yêu thích khám phá, tham quan các địa điểm mới',
      color: '#03A9F4',
      icon: '📸',
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
      name: 'Khám phá đa dạng',
      description: 'Thích khám phá nhiều loại địa điểm khác nhau',
      color: '#9C27B0',
      icon: '🌟',
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
