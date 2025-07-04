const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const bcrypt = require('bcryptjs')

// Create database connection
const dbPath = path.join(__dirname, 'shop.db')
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message)
  } else {
    console.log('📄 Connected to SQLite database')
  }
})

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON')

// Initialize database tables
const initializeDatabase = () => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rust_username VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user',
    steam_id VARCHAR(20),
    discord_id VARCHAR(20),
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    loyalty_points INTEGER DEFAULT 0,
    vip_status BOOLEAN DEFAULT FALSE,
    vip_expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  )`)

  // Categories table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category_id INTEGER NOT NULL,
    weight INTEGER DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    max_quantity_per_order INTEGER DEFAULT 99,
    is_digital BOOLEAN DEFAULT TRUE,
    delivery_time_minutes INTEGER DEFAULT 5,
    popular BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    limited_edition BOOLEAN DEFAULT FALSE,
    discount_percentage INTEGER DEFAULT 0,
    badge VARCHAR(50),
    game_item_id VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id)
  )`)

  // Product images table
  db.run(`CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
  )`)

  // Product features table
  db.run(`CREATE TABLE IF NOT EXISTS product_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    feature_text VARCHAR(200) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
  )`)

  // Orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_intent_id VARCHAR(100),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    customer_email VARCHAR(100),
    customer_rust_username VARCHAR(50),
    delivery_status VARCHAR(20) DEFAULT 'pending',
    delivered_at DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`)

  // Order items table
  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    delivered BOOLEAN DEFAULT FALSE,
    delivered_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`)

  // Cart table (persistent cart for logged-in users)
  db.run(`CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
  )`)

  // User sessions table (for auth tokens)
  db.run(`CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )`)

  // Themes table
  db.run(`CREATE TABLE IF NOT EXISTS themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    css_variables TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // Server configuration table
  db.run(`CREATE TABLE IF NOT EXISTS server_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    config_type VARCHAR(50) DEFAULT 'string',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  console.log('📊 Database tables initialized - v2')
}

// Seed initial data
const seedDatabase = () => {
  // Check if categories exist
  db.get('SELECT COUNT(*) as count FROM categories', (err, row) => {
    if (err) {
      console.error('Error checking categories:', err)
      return
    }

    if (row.count === 0) {
      console.log('🌱 Seeding database with initial data...')
      
      // Insert categories
      const categories = [
        { name: 'VIP Membership', slug: 'vip', description: 'Premium server access and privileges', icon: '👑', sort_order: 1 },
        { name: 'Survival Kits', slug: 'kits', description: 'Essential items and equipment packages', icon: '📦', sort_order: 2 },
        { name: 'Cosmetic Skins', slug: 'cosmetics', description: 'Character skins and visual customizations', icon: '🎨', sort_order: 3 },
        { name: 'Boosters', slug: 'boosters', description: 'Experience and resource multipliers', icon: '⚡', sort_order: 4 },
        { name: 'Bundles', slug: 'bundles', description: 'Value packages with multiple items', icon: '🎁', sort_order: 5 }
      ]

      categories.forEach((category, index) => {
        db.run(
          'INSERT INTO categories (name, slug, description, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
          [category.name, category.slug, category.description, category.icon, category.sort_order],
          function(err) {
            if (err) {
              console.error('Error inserting category:', err)
            } else {
              console.log(`🌱 Seeding products for category: ${category.name}`)
              // Insert products for this category
              seedProductsForCategory(this.lastID, category.slug)
            }
          }
        )
      })

      // Create admin user
      const adminPassword = bcrypt.hashSync('change me', 10)
      db.run(
        'INSERT INTO users (username, email, password_hash, role, rust_username) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@rustybutter.com', adminPassword, 'admin', 'RustyAdmin'],
        (err) => {
          if (err) {
            console.error('Error creating admin user:', err)
          } else {
            console.log('👤 Admin user created (username: admin / password: change me)')
            console.log('⚠️  IMPORTANT: Please change the admin password after first login!')
          }
        }
      )

      // Seed themes
      seedThemes()
      
      // Seed server configuration
      seedServerConfig()
    }
  })
}

// Seed products for each category
const seedProductsForCategory = (categoryId, categorySlug) => {
  let products = []

  switch (categorySlug) {
    case 'vip':
      products = [
        {
          name: 'VIP Monthly Membership',
          slug: 'vip-monthly',
          description: 'Unlock premium features, exclusive kits, priority queue access, and special privileges on the server. Includes custom chat colors, VIP-only areas, and enhanced gather rates.',
          short_description: 'Premium server access with exclusive perks',
          price: 9.99,
          weight: 0,
          stock_quantity: 999,
          popular: true,
          badge: 'Most Popular',
          game_item_id: 'vip_monthly_access',
          features: [
            'Priority queue access',
            'Custom chat colors and tags',
            'VIP-only building areas',
            '1.5x gather rate bonus',
            'Exclusive VIP kits',
            'No decay on VIP structures',
            'Access to VIP Discord channels'
          ],
          images: [
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center'
          ]
        }
      ]
      break

    case 'kits':
      products = [
        {
          name: 'Starter Survival Kit',
          slug: 'starter-kit',
          description: 'Perfect for new players! This comprehensive kit includes essential tools, weapons, and resources to give you a strong start on the server.',
          short_description: 'Essential items for new players',
          price: 4.99,
          weight: 50,
          stock_quantity: 100,
          max_quantity_per_order: 3,
          game_item_id: 'kit_starter_bundle',
          features: [
            'Stone pickaxe and hatchet',
            'Bow with 30 arrows',
            'Bandages and medical syringes',
            '1000 wood and 500 stone',
            'Building plan and hammer',
            'Code lock and key lock',
            'Sleeping bag'
          ],
          images: [
            'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop&crop=center'
          ]
        },
        {
          name: 'Elite Raid Kit',
          slug: 'raid-kit',
          description: 'Advanced raiding equipment for experienced players. Contains high-tier explosives, weapons, and armor needed for successful raids.',
          short_description: 'High-tier raiding equipment',
          price: 24.99,
          original_price: 29.99,
          discount_percentage: 17,
          weight: 150,
          stock_quantity: 50,
          limited_edition: true,
          badge: 'Limited Time',
          game_item_id: 'kit_raid_elite',
          features: [
            '10x Rocket Launcher rockets',
            '20x Satchel charges',
            'Metal chest plate and helmet',
            'AK-47 with 240 ammo',
            'Medical kit and syringes',
            'C4 explosive (2x)'
          ],
          images: [
            'https://images.unsplash.com/photo-1526800544336-d2f0d0346f65?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1591154669695-5f2a8d20c089?w=800&h=600&fit=crop&crop=center'
          ]
        }
      ]
      break

    case 'cosmetics':
      products = [
        {
          name: 'Legendary Bear Skin',
          slug: 'skin-bear',
          description: 'Stand out with this exclusive animated bear skin. Features custom animations, particle effects, and unique sound effects.',
          short_description: 'Exclusive animated bear skin with effects',
          price: 12.99,
          weight: 0,
          stock_quantity: 999,
          popular: true,
          badge: 'Exclusive',
          game_item_id: 'skin_bear_legendary',
          features: [
            'Animated bear model',
            'Custom particle effects',
            'Unique roar sound effects',
            'Glowing eyes at night',
            'Premium fur textures'
          ],
          images: [
            'https://images.unsplash.com/photo-1564419434-8d4a1a1f0c4a?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=800&h=600&fit=crop&crop=center'
          ]
        },
        {
          name: 'Mythical Dragon Skin',
          slug: 'skin-dragon',
          description: 'Become a legend with this epic dragon transformation skin. Breathe fire, spread mighty wings, and rule the skies.',
          short_description: 'Epic dragon skin with fire breath effects',
          price: 19.99,
          original_price: 24.99,
          discount_percentage: 20,
          weight: 0,
          stock_quantity: 999,
          popular: true,
          limited_edition: true,
          badge: 'Legendary',
          game_item_id: 'skin_dragon_mythical',
          features: [
            'Fire breathing animations',
            'Massive wing spread effects',
            'Roaring sound effects',
            'Magical aura particles',
            'Flight movement patterns'
          ],
          images: [
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1618671276673-26ddc21a3c89?w=800&h=600&fit=crop&crop=center'
          ]
        }
      ]
      break

    case 'boosters':
      products = [
        {
          name: '2x XP Booster (24h)',
          slug: 'xp-booster-24h',
          description: 'Double your experience gains for 24 hours! Perfect for quickly leveling up your character and unlocking new abilities.',
          short_description: 'Double XP gains for 24 hours',
          price: 3.99,
          weight: 0,
          stock_quantity: 999,
          max_quantity_per_order: 10,
          game_item_id: 'booster_xp_2x_24h',
          features: [
            '2x experience gain',
            '24-hour duration',
            'Applies to all activities',
            'Stackable with other bonuses',
            'Instant activation'
          ],
          images: [
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center'
          ]
        }
      ]
      break

    case 'bundles':
      products = [
        {
          name: 'Mega Survivor Bundle',
          slug: 'mega-bundle',
          description: 'The ultimate package for serious players! Combines VIP membership, premium kits, exclusive skins, and boosters at incredible value.',
          short_description: 'Ultimate survival package with everything included',
          price: 49.99,
          original_price: 75.96,
          discount_percentage: 34,
          weight: 200,
          stock_quantity: 25,
          popular: true,
          featured: true,
          limited_edition: true,
          badge: 'Best Value',
          game_item_id: 'bundle_mega_survivor',
          features: [
            'VIP Monthly Membership',
            'Starter + Raid Kits',
            'Legendary Bear Skin',
            '5x XP Boosters (24h each)',
            'Exclusive bundle badge',
            'Priority customer support'
          ],
          images: [
            'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&crop=center',
            'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop&crop=center'
          ]
        }
      ]
      break
  }

  // Insert products
  products.forEach(product => {
    db.run(
      `INSERT INTO products (
        name, slug, description, short_description, price, original_price, 
        category_id, weight, stock_quantity, max_quantity_per_order, 
        popular, featured, limited_edition, discount_percentage, badge, game_item_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.name, product.slug, product.description, product.short_description,
        product.price, product.original_price, categoryId, product.weight,
        product.stock_quantity, product.max_quantity_per_order,
        product.popular || false, product.featured || false, product.limited_edition || false,
        product.discount_percentage || 0, product.badge, product.game_item_id
      ],
      function(err) {
        if (err) {
          console.error('Error inserting product:', err)
        } else {
          const productId = this.lastID
          console.log(`📦 Created product: ${product.name} with ID ${productId}`)
          
          // Insert product images
          product.images.forEach((imageUrl, index) => {
            db.run(
              'INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES (?, ?, ?, ?, ?)',
              [productId, imageUrl, `${product.name} - Image ${index + 1}`, index, index === 0],
              (err) => {
                if (err) console.error('Error inserting product image:', err)
              }
            )
          })

          // Insert product features
          product.features.forEach((feature, index) => {
            db.run(
              'INSERT INTO product_features (product_id, feature_text, sort_order) VALUES (?, ?, ?)',
              [productId, feature, index],
              (err) => {
                if (err) console.error('Error inserting product feature:', err)
              }
            )
          })
        }
      }
    )
  })
}

// Seed themes
const seedThemes = () => {
  const themes = [
    {
      name: 'Organic',
      slug: 'organic',
      description: 'Natural greens and browns with earthy tones',
      css_variables: JSON.stringify({
        '--color-bg-primary': '#fae8c0',
        '--color-bg-secondary': '#e2cab7',
        '--color-surface-card': '#e2cab7',
        '--color-text-base': '#2a1f0a',
        '--color-text-onprimary': '#2a1f0a',
        '--color-border-muted': '#c0c9bc',
        '--color-accent-primary': '#679a4b',
        '--color-accent-secondary': '#8fc370',
        '--color-accent-tertiary': '#4a7c2e',
        '--color-gradient-start': '#679a4b',
        '--color-gradient-end': '#8fc370',
        '--color-button-bg': '#679a4b',
        '--color-button-hover': '#4a7c2e',
        '--color-button-text': '#ffffff',
        '--color-overlay': 'rgba(103, 154, 75, 0.1)',
        '--color-shadow': 'rgba(42, 31, 10, 0.1)',
        '--color-text-heading': '#1a1000',
        '--color-text-body': '#2a1f0a',
        '--color-text-muted': '#4a3a1a',
        '--color-surface-primary': '#f5f5f5',
        '--color-text-primary': '#2a1f0a',
        '--color-text-secondary': '#4a3a1a',
        '--color-border-primary': '#c0c9bc'
      })
    },
    {
      name: 'Organic Light',
      slug: 'organic-light',
      description: 'Bright natural theme with light colors',
      css_variables: JSON.stringify({
        '--color-bg-primary': '#fefefe',
        '--color-bg-secondary': '#f5f0e8',
        '--color-surface-card': '#fae8c0',
        '--color-text-base': '#3a422a',
        '--color-text-onprimary': '#332713',
        '--color-border-muted': '#e2cab7',
        '--color-accent-primary': '#679a4b',
        '--color-accent-secondary': '#8fc370',
        '--color-accent-tertiary': '#4a7c2e',
        '--color-gradient-start': '#8fc370',
        '--color-gradient-end': '#fae8c0',
        '--color-button-bg': '#679a4b',
        '--color-button-hover': '#4a7c2e',
        '--color-button-text': '#ffffff',
        '--color-overlay': 'rgba(250, 232, 192, 0.2)',
        '--color-shadow': 'rgba(58, 66, 42, 0.08)',
        '--color-text-heading': '#1a1000',
        '--color-text-body': '#3a422a',
        '--color-text-muted': '#5a523a',
        '--color-surface-primary': '#ffffff',
        '--color-text-primary': '#3a422a',
        '--color-text-secondary': '#5a523a',
        '--color-border-primary': '#e2cab7'
      })
    },
    {
      name: 'Organic Dark',
      slug: 'organic-dark',
      description: 'Deep forest theme with dark greens',
      css_variables: JSON.stringify({
        '--color-bg-primary': '#3a422a',
        '--color-bg-secondary': '#2e3621',
        '--color-surface-card': '#332713',
        '--color-text-base': '#fefefe',
        '--color-text-onprimary': '#fae8c0',
        '--color-border-muted': '#679a4b',
        '--color-accent-primary': '#e2cab7',
        '--color-accent-secondary': '#fae8c0',
        '--color-accent-tertiary': '#c9a890',
        '--color-gradient-start': '#e2cab7',
        '--color-gradient-end': '#679a4b',
        '--color-button-bg': '#e2cab7',
        '--color-button-hover': '#c9a890',
        '--color-button-text': '#332713',
        '--color-overlay': 'rgba(103, 154, 75, 0.15)',
        '--color-shadow': 'rgba(0, 0, 0, 0.3)',
        '--color-text-heading': '#fae8c0',
        '--color-text-body': '#fefefe',
        '--color-text-muted': '#c0c9bc',
        '--color-surface-primary': '#2a1f0a',
        '--color-text-primary': '#fefefe',
        '--color-text-secondary': '#e2cab7',
        '--color-border-primary': '#679a4b'
      })
    },
    {
      name: 'Cyberpunk',
      slug: 'cyberpunk',
      description: 'Neon lights and dark nights',
      css_variables: JSON.stringify({
        '--color-bg-primary': '#1B1B2A',
        '--color-bg-secondary': '#0f0f1a',
        '--color-surface-card': '#2A2A3F',
        '--color-text-base': '#FFFFFF',
        '--color-text-onprimary': '#FFFFFF',
        '--color-border-muted': '#FF007A',
        '--color-accent-primary': '#00FFB3',
        '--color-accent-secondary': '#FF007A',
        '--color-accent-tertiary': '#FFD700',
        '--color-gradient-start': '#00FFB3',
        '--color-gradient-end': '#FF007A',
        '--color-button-bg': '#00FFB3',
        '--color-button-hover': '#00cc8f',
        '--color-button-text': '#1B1B2A',
        '--color-overlay': 'rgba(0, 255, 179, 0.1)',
        '--color-shadow': 'rgba(255, 0, 122, 0.3)',
        '--color-text-heading': '#FFFFFF',
        '--color-text-body': '#FFFFFF',
        '--color-text-muted': '#CCCCCC',
        '--color-surface-primary': '#1B1B2A',
        '--color-text-primary': '#FFFFFF',
        '--color-text-secondary': '#CCCCCC',
        '--color-border-primary': '#FF007A'
      })
    },
    {
      name: 'Electric',
      slug: 'electric',
      description: 'High voltage modern theme',
      css_variables: JSON.stringify({
        '--color-bg-primary': '#0A0A0F',
        '--color-bg-secondary': '#16161F',
        '--color-surface-card': '#1A1A2E',
        '--color-text-base': '#FFFFFF',
        '--color-text-onprimary': '#FFFFFF',
        '--color-border-muted': '#00BFFF',
        '--color-accent-primary': '#FF6F61',
        '--color-accent-secondary': '#00BFFF',
        '--color-accent-tertiary': '#FF4081',
        '--color-gradient-start': '#FF6F61',
        '--color-gradient-end': '#00BFFF',
        '--color-button-bg': '#FF6F61',
        '--color-button-hover': '#ff4a3a',
        '--color-button-text': '#FFFFFF',
        '--color-overlay': 'rgba(0, 191, 255, 0.1)',
        '--color-shadow': 'rgba(255, 111, 97, 0.3)',
        '--color-text-heading': '#FFFFFF',
        '--color-text-body': '#FFFFFF',
        '--color-text-muted': '#B8B8B8',
        '--color-surface-primary': '#0A0A0F',
        '--color-text-primary': '#FFFFFF',
        '--color-text-secondary': '#B8B8B8',
        '--color-border-primary': '#00BFFF'
      })
    },
    {
      name: 'Synthwave',
      slug: 'synthwave',
      description: 'Retro 80s aesthetic',
      css_variables: JSON.stringify({
        '--color-bg-primary': '#2D1B69',
        '--color-bg-secondary': '#1a0f3d',
        '--color-surface-card': '#4A0E78',
        '--color-text-base': '#FFFFFF',
        '--color-text-onprimary': '#FFFFFF',
        '--color-border-muted': '#FF00FF',
        '--color-accent-primary': '#00FFFF',
        '--color-accent-secondary': '#FF00FF',
        '--color-accent-tertiary': '#FFD700',
        '--color-gradient-start': '#FF00FF',
        '--color-gradient-end': '#00FFFF',
        '--color-button-bg': '#00FFFF',
        '--color-button-hover': '#00cccc',
        '--color-button-text': '#2D1B69',
        '--color-overlay': 'rgba(255, 0, 255, 0.15)',
        '--color-shadow': 'rgba(0, 255, 255, 0.3)',
        '--color-text-heading': '#FFFFFF',
        '--color-text-body': '#FFFFFF',
        '--color-text-muted': '#E6E6E6',
        '--color-surface-primary': '#2D1B69',
        '--color-text-primary': '#FFFFFF',
        '--color-text-secondary': '#E6E6E6',
        '--color-border-primary': '#FF00FF'
      })
    },
    {
      name: 'Forest Dark',
      slug: 'forest-dark',
      description: 'Deep forest theme',
      css_variables: JSON.stringify({
        '--color-bg-primary': '#1A2E1A',
        '--color-bg-secondary': '#0f1f0f',
        '--color-surface-card': '#2D4A2D',
        '--color-text-base': '#F0F0F0',
        '--color-text-onprimary': '#FFFFFF',
        '--color-border-muted': '#4A7C59',
        '--color-accent-primary': '#7FB069',
        '--color-accent-secondary': '#9FD086',
        '--color-accent-tertiary': '#5F9049',
        '--color-gradient-start': '#7FB069',
        '--color-gradient-end': '#4A7C59',
        '--color-button-bg': '#7FB069',
        '--color-button-hover': '#5F9049',
        '--color-button-text': '#FFFFFF',
        '--color-overlay': 'rgba(127, 176, 105, 0.1)',
        '--color-shadow': 'rgba(26, 46, 26, 0.3)',
        '--color-text-heading': '#FFFFFF',
        '--color-text-body': '#F0F0F0',
        '--color-text-muted': '#D0D0D0',
        '--color-surface-primary': '#1A2E1A',
        '--color-text-primary': '#F0F0F0',
        '--color-text-secondary': '#D0D0D0',
        '--color-border-primary': '#4A7C59'
      })
    },
    {
      name: 'Ocean',
      slug: 'ocean',
      description: 'Deep sea blues',
      css_variables: JSON.stringify({
        '--color-bg-primary': '#0F1419',
        '--color-bg-secondary': '#0a0d11',
        '--color-surface-card': '#1E2A3A',
        '--color-text-base': '#FFFFFF',
        '--color-text-onprimary': '#FFFFFF',
        '--color-border-muted': '#2E8B91',
        '--color-accent-primary': '#4FC3F7',
        '--color-accent-secondary': '#29B6F6',
        '--color-accent-tertiary': '#0288D1',
        '--color-gradient-start': '#4FC3F7',
        '--color-gradient-end': '#0288D1',
        '--color-button-bg': '#4FC3F7',
        '--color-button-hover': '#29B6F6',
        '--color-button-text': '#0F1419',
        '--color-overlay': 'rgba(79, 195, 247, 0.1)',
        '--color-shadow': 'rgba(2, 136, 209, 0.3)',
        '--color-text-heading': '#FFFFFF',
        '--color-text-body': '#FFFFFF',
        '--color-text-muted': '#B3B3B3',
        '--color-surface-primary': '#0F1419',
        '--color-text-primary': '#FFFFFF',
        '--color-text-secondary': '#B3B3B3',
        '--color-border-primary': '#2E8B91'
      })
    },
    {
      name: 'Sunset',
      slug: 'sunset',
      description: 'Warm orange sunset',
      css_variables: JSON.stringify({
        '--color-bg-primary': '#2A1810',
        '--color-bg-secondary': '#1f110b',
        '--color-surface-card': '#3D2518',
        '--color-text-base': '#FFFFFF',
        '--color-text-onprimary': '#FFFFFF',
        '--color-border-muted': '#D2691E',
        '--color-accent-primary': '#FF6B35',
        '--color-accent-secondary': '#FF8C42',
        '--color-accent-tertiary': '#E55100',
        '--color-gradient-start': '#FF6B35',
        '--color-gradient-end': '#FF8C42',
        '--color-button-bg': '#FF6B35',
        '--color-button-hover': '#E55100',
        '--color-button-text': '#FFFFFF',
        '--color-overlay': 'rgba(255, 107, 53, 0.1)',
        '--color-shadow': 'rgba(42, 24, 16, 0.3)',
        '--color-text-heading': '#FFFFFF',
        '--color-text-body': '#FFFFFF',
        '--color-text-muted': '#D4B5A5',
        '--color-surface-primary': '#2A1810',
        '--color-text-primary': '#FFFFFF',
        '--color-text-secondary': '#D4B5A5',
        '--color-border-primary': '#D2691E'
      })
    },
    {
      name: 'Midnight Purple',
      slug: 'midnight-purple',
      description: 'Deep purple nights',
      css_variables: JSON.stringify({
        '--color-bg-primary': '#1A0033',
        '--color-bg-secondary': '#0d001a',
        '--color-surface-card': '#2B0052',
        '--color-text-base': '#FFFFFF',
        '--color-text-onprimary': '#FFFFFF',
        '--color-border-muted': '#9B59B6',
        '--color-accent-primary': '#E74C3C',
        '--color-accent-secondary': '#9B59B6',
        '--color-accent-tertiary': '#F39C12',
        '--color-gradient-start': '#E74C3C',
        '--color-gradient-end': '#9B59B6',
        '--color-button-bg': '#E74C3C',
        '--color-button-hover': '#C0392B',
        '--color-button-text': '#FFFFFF',
        '--color-overlay': 'rgba(155, 89, 182, 0.1)',
        '--color-shadow': 'rgba(231, 76, 60, 0.3)',
        '--color-text-heading': '#FFFFFF',
        '--color-text-body': '#FFFFFF',
        '--color-text-muted': '#DDD',
        '--color-surface-primary': '#1A0033',
        '--color-text-primary': '#FFFFFF',
        '--color-text-secondary': '#DDD',
        '--color-border-primary': '#9B59B6'
      })
    },
    {
      name: 'Arctic',
      slug: 'arctic',
      description: 'Cool blues and whites',
      css_variables: JSON.stringify({
        '--color-bg-primary': '#E8F4F8',
        '--color-bg-secondary': '#D1E7ED',
        '--color-surface-card': '#FFFFFF',
        '--color-text-base': '#1A3A4B',
        '--color-text-onprimary': '#1A3A4B',
        '--color-border-muted': '#B8D4DE',
        '--color-accent-primary': '#2196F3',
        '--color-accent-secondary': '#03A9F4',
        '--color-accent-tertiary': '#0288D1',
        '--color-gradient-start': '#2196F3',
        '--color-gradient-end': '#03A9F4',
        '--color-button-bg': '#2196F3',
        '--color-button-hover': '#0288D1',
        '--color-button-text': '#FFFFFF',
        '--color-overlay': 'rgba(33, 150, 243, 0.05)',
        '--color-shadow': 'rgba(26, 58, 75, 0.1)',
        '--color-text-heading': '#0D2936',
        '--color-text-body': '#1A3A4B',
        '--color-text-muted': '#5C7A8A',
        '--color-surface-primary': '#FFFFFF',
        '--color-text-primary': '#1A3A4B',
        '--color-text-secondary': '#5C7A8A',
        '--color-border-primary': '#B8D4DE'
      })
    },
    {
      name: 'Volcanic',
      slug: 'volcanic',
      description: 'Fiery reds and dark ash',
      css_variables: JSON.stringify({
        '--color-bg-primary': '#1A0E0E',
        '--color-bg-secondary': '#0D0707',
        '--color-surface-card': '#2A1616',
        '--color-text-base': '#FFFFFF',
        '--color-text-onprimary': '#FFFFFF',
        '--color-border-muted': '#8B0000',
        '--color-accent-primary': '#FF4444',
        '--color-accent-secondary': '#FF6B6B',
        '--color-accent-tertiary': '#CC0000',
        '--color-gradient-start': '#FF4444',
        '--color-gradient-end': '#CC0000',
        '--color-button-bg': '#FF4444',
        '--color-button-hover': '#CC0000',
        '--color-button-text': '#FFFFFF',
        '--color-overlay': 'rgba(255, 68, 68, 0.1)',
        '--color-shadow': 'rgba(139, 0, 0, 0.3)',
        '--color-text-heading': '#FFFFFF',
        '--color-text-body': '#FFFFFF',
        '--color-text-muted': '#FFB3B3',
        '--color-surface-primary': '#1A0E0E',
        '--color-text-primary': '#FFFFFF',
        '--color-text-secondary': '#FFB3B3',
        '--color-border-primary': '#8B0000'
      })
    }
  ]

  themes.forEach(theme => {
    db.run(
      'INSERT INTO themes (name, slug, description, css_variables, is_active) VALUES (?, ?, ?, ?, ?)',
      [theme.name, theme.slug, theme.description, theme.css_variables, true],
      (err) => {
        if (err) {
          console.error('Error inserting theme:', err)
        } else {
          console.log(`🎨 Created theme: ${theme.name}`)
        }
      }
    )
  })
}

// Seed server configuration
const seedServerConfig = () => {
  const configs = [
    {
      key: 'server_ip',
      value: '23.136.68.2',
      description: 'Rust game server IP address',
      config_type: 'string'
    },
    {
      key: 'server_port',
      value: '28015',
      description: 'Rust game server port',
      config_type: 'number'
    },
    {
      key: 'query_port',
      value: '28017',
      description: 'Steam query port for server status',
      config_type: 'number'
    },
    {
      key: 'rcon_port',
      value: '28016',
      description: 'RCON port for server administration',
      config_type: 'number'
    },
    {
      key: 'rcon_password',
      value: '',
      description: 'RCON password (encrypted)',
      config_type: 'password'
    },
    {
      key: 'server_name',
      value: 'Rusty Butter Server',
      description: 'Display name of the server',
      config_type: 'string'
    },
    {
      key: 'wipe_schedule',
      value: 'Bi-Weekly (Thursdays 6PM EST)',
      description: 'Server wipe schedule',
      config_type: 'string'
    },
    {
      key: 'max_players',
      value: '100',
      description: 'Maximum concurrent players',
      config_type: 'number'
    }
  ]

  configs.forEach(config => {
    db.run(
      'INSERT INTO server_config (key, value, description, config_type) VALUES (?, ?, ?, ?)',
      [config.key, config.value, config.description, config.config_type],
      (err) => {
        if (err) {
          console.error('Error inserting server config:', err)
        } else {
          console.log(`⚙️  Created config: ${config.key}`)
        }
      }
    )
  })
}

// Initialize database on startup
initializeDatabase()
setTimeout(seedDatabase, 1000) // Wait for tables to be created

module.exports = {
  db,
  initializeDatabase,
  seedDatabase
}