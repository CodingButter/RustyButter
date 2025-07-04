import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { db } = require('./database.cjs')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3003
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production'

// Middleware
app.use(cors())
app.use(express.json())

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' })
    req.user = user
    next()
  })
}

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user
      }
    })
  }
  next()
}

// Serve static images
app.use('/images', express.static(path.join(__dirname, '../public/images')))

// Dummy data for development
const generateDummyPlayers = () => {
  const playerNames = [
    'RustLord_2024', 'NakedBeachBob', 'ScrapQueen', 'RaidMaster', 'BowSniper47',
    'ChainSawCharlie', 'MetalDetector', 'RocketRaider', 'ShotgunSally', 'BuilderBen',
    'FarmingFrank', 'PvPPete', 'CraftingCarl', 'LootGoblin', 'BaseDefender',
    'HelicopterHunter', 'BarrelBreaker', 'RecyclerRick', 'WorkbenchWizard', 'ZergLeader',
    'SoloSurvivor', 'TeamPlayer99', 'ResourceHoarder', 'MonumentRunner', 'BeachBum',
    'AirDropChaser', 'CargoShipCrew', 'BradleyHunter', 'HeliPilot', 'ScientistSlayer',
    'WipeWarrior', 'FirstDayFarmer', 'EndGameElite', 'NoobFriendly', 'ToxicAvenger',
    'PeacefulBuilder', 'RaidDefender', 'OnlineRaider', 'OfflineProtector', 'BaseDesigner',
    'TrapMaster', 'DoorCamper', 'RoofSniper', 'UndergroupTunneler', 'SeabaseBuilder'
  ]
  
  return playerNames.slice(0, 45).map((name) => ({
    name,
    score: Math.floor(Math.random() * 5000) + 100,
    duration: Math.floor(Math.random() * 7200) + 300, // 5 min to 2+ hours
    kills: Math.floor(Math.random() * 50),
    deaths: Math.floor(Math.random() * 30),
    joinTime: new Date(Date.now() - Math.random() * 604800000).toISOString() // Within last week
  }))
}

const dummyServerStats = {
  lastWipe: '2024-12-20T18:00:00Z',
  nextWipe: '2025-01-03T18:00:00Z',
  totalPlayersRegistered: 2847,
  peakConcurrentPlayers: 98,
  averageDailyPlayers: 67,
  uptimePercentage: 99.2,
  mapSeed: 1847629,
  mapSize: 4000,
  gatherRate: '2x',
  wipeSchedule: 'Bi-Weekly (Thursdays 6PM EST)'
}

const dummyServerEvents = [
  {
    id: 1,
    type: 'announcement',
    title: 'Server Maintenance Tonight',
    message: 'Brief maintenance window from 3-4 AM EST for performance improvements.',
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    priority: 'medium'
  },
  {
    id: 2,
    type: 'event',
    title: 'Community Build Competition',
    message: 'Submit your best base designs! Winner gets VIP status and in-game rewards.',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    priority: 'high'
  },
  {
    id: 3,
    type: 'update',
    title: 'New Custom Monuments Added',
    message: 'Explore the new custom monuments scattered across the map!',
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    priority: 'medium'
  }
]

const dummyMapInfo = {
  seed: 1847629,
  size: 4000,
  mapImage: '/images/map.png',
  monuments: [
    'Launch Site', 'Military Tunnels', 'Power Plant', 'Water Treatment',
    'Airfield', 'Train Yard', 'Dome', 'Satellite Dish', 'Harbor',
    'Lighthouse', 'Junkyard', 'Bandit Camp', 'Outpost'
  ],
  customFeatures: [
    'Extra Recyclers at Outpost',
    'Increased Barrel Spawns',
    'Custom Loot Tables',
    'Enhanced Monument Puzzles'
  ],
  resourceDensity: 'High',
  biomes: ['Temperate', 'Desert', 'Snow', 'Swamp']
}

const dummyDiscordData = {
  memberCount: 1247,
  onlineMembers: 384,
  boostLevel: 2,
  recentAnnouncements: [
    {
      title: 'Wipe Day Reminder',
      content: 'Next wipe is Thursday 6PM EST! Get ready for a fresh start.',
      timestamp: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
    },
    {
      title: 'New Role: VIP Builder',
      content: 'Recognition role for amazing base builders! Apply in #applications.',
      timestamp: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    }
  ]
}

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, rustUsername } = req.body

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' })
    }

    // Check if user already exists
    db.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }
        if (row) {
          return res.status(409).json({ error: 'User already exists' })
        }

        // Hash password
        const saltRounds = 10
        const passwordHash = bcrypt.hashSync(password, saltRounds)

        // Create user
        db.run(
          'INSERT INTO users (username, email, password_hash, rust_username) VALUES (?, ?, ?, ?)',
          [username, email, passwordHash, rustUsername || null],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create user' })
            }

            const token = jwt.sign(
              { id: this.lastID, username, email, role: 'user' },
              JWT_SECRET,
              { expiresIn: '7d' }
            )

            res.json({
              message: 'User created successfully',
              token,
              user: {
                id: this.lastID,
                username,
                email,
                rustUsername,
                role: 'user'
              }
            })
          }
        )
      }
    )
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Find user by username or email
    db.get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username],
      (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }
        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' })
        }

        // Check password
        const isValid = bcrypt.compareSync(password, user.password_hash)
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid credentials' })
        }

        // Update last login
        db.run(
          'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
          [user.id]
        )

        const token = jwt.sign(
          { id: user.id, username: user.username, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '7d' }
        )

        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            rustUsername: user.rust_username,
            role: user.role,
            vipStatus: user.vip_status,
            loyaltyPoints: user.loyalty_points
          }
        })
      }
    )
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, username, email, rust_username, role, vip_status, loyalty_points, total_spent, created_at FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          rustUsername: user.rust_username,
          role: user.role,
          vipStatus: user.vip_status,
          loyaltyPoints: user.loyalty_points,
          totalSpent: user.total_spent,
          createdAt: user.created_at
        }
      })
    }
  )
})

// Update user profile
app.put('/api/auth/update-profile', authenticateToken, (req, res) => {
  const { username, email, rustUsername } = req.body
  
  // Validate input
  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required' })
  }
  
  // Check if username or email already exists (excluding current user)
  db.get(
    'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
    [username, email, req.user.id],
    (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      if (existingUser) {
        return res.status(409).json({ error: 'Username or email already exists' })
      }
      
      // Update user profile
      db.run(
        'UPDATE users SET username = ?, email = ?, rust_username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [username, email, rustUsername || null, req.user.id],
        function(err) {
          if (err) {
            console.error('Profile update error:', err)
            return res.status(500).json({ error: 'Failed to update profile' })
          }
          
          res.json({ message: 'Profile updated successfully' })
        }
      )
    }
  )
})

// Change password
app.put('/api/auth/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body
  
  // Validate input
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' })
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' })
  }
  
  // Get current user with password hash
  db.get(
    'SELECT password_hash FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      
      // Verify current password
      const isValidPassword = bcrypt.compareSync(currentPassword, user.password_hash)
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' })
      }
      
      // Hash new password
      const newPasswordHash = bcrypt.hashSync(newPassword, 10)
      
      // Update password
      db.run(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newPasswordHash, req.user.id],
        function(err) {
          if (err) {
            console.error('Password change error:', err)
            return res.status(500).json({ error: 'Failed to change password' })
          }
          
          res.json({ message: 'Password changed successfully' })
        }
      )
    }
  )
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Server status endpoint with dummy data
app.get('/api/server/status', (req, res) => {
  const players = generateDummyPlayers()
  
  res.json({
    online: true,
    server: {
      name: 'Rusty Butter - 2x Gather | Bi-Weekly Wipes',
      players: players.length,
      maxPlayers: 100,
      map: 'Procedural Map 4000'
    },
    players: players.slice(0, 10), // Only return first 10 for status endpoint
    connectionString: 'steam://connect/23.136.68.2:28015',
    timestamp: new Date().toISOString()
  })
})

// Players endpoint - full player list
app.get('/api/server/players', (req, res) => {
  const players = generateDummyPlayers()
  
  res.json({
    players: players,
    totalCount: players.length,
    timestamp: new Date().toISOString()
  })
})

// Server statistics endpoint
app.get('/api/server/stats', (req, res) => {
  res.json({
    ...dummyServerStats,
    currentPlayers: generateDummyPlayers().length,
    timestamp: new Date().toISOString()
  })
})

// Server events endpoint
app.get('/api/server/events', (req, res) => {
  res.json({
    events: dummyServerEvents,
    totalCount: dummyServerEvents.length,
    timestamp: new Date().toISOString()
  })
})

// Map information endpoint
app.get('/api/map', (req, res) => {
  res.json({
    ...dummyMapInfo,
    timestamp: new Date().toISOString()
  })
})

// Discord information endpoint
app.get('/api/discord', (req, res) => {
  res.json({
    ...dummyDiscordData,
    timestamp: new Date().toISOString()
  })
})

// Shop data with Unsplash images
const generateShopItems = () => {
  return [
    {
      id: 'vip-monthly',
      name: 'VIP Monthly Membership',
      description: 'Unlock premium features, exclusive kits, priority queue access, and special privileges on the server. Includes custom chat colors, VIP-only areas, and enhanced gather rates.',
      shortDescription: 'Premium server access with exclusive perks',
      price: 9.99,
      category: 'vip',
      images: [
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center'
      ],
      features: [
        'Priority queue access',
        'Custom chat colors and tags',
        'VIP-only building areas',
        '1.5x gather rate bonus',
        'Exclusive VIP kits',
        'No decay on VIP structures',
        'Access to VIP Discord channels'
      ],
      popular: true,
      inStock: true,
      badge: 'Most Popular'
    },
    {
      id: 'starter-kit',
      name: 'Starter Survival Kit',
      description: 'Perfect for new players! This comprehensive kit includes essential tools, weapons, and resources to give you a strong start on the server. Contains everything you need to establish your first base.',
      shortDescription: 'Essential items for new players',
      price: 4.99,
      category: 'kits',
      images: [
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=800&h=600&fit=crop&crop=center'
      ],
      features: [
        'Stone pickaxe and hatchet',
        'Bow with 30 arrows',
        'Bandages and medical syringes',
        '1000 wood and 500 stone',
        'Building plan and hammer',
        'Code lock and key lock',
        'Sleeping bag'
      ],
      inStock: true,
      maxQuantity: 3
    },
    {
      id: 'raid-kit',
      name: 'Elite Raid Kit',
      description: 'Advanced raiding equipment for experienced players. Contains high-tier explosives, weapons, and armor needed for successful raids. Use responsibly!',
      shortDescription: 'High-tier raiding equipment',
      price: 24.99,
      originalPrice: 29.99,
      discount: 17,
      category: 'kits',
      images: [
        'https://images.unsplash.com/photo-1562454392-7e4fc5d57dd3?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1516912678625-19fbe9292a8b?w=800&h=600&fit=crop&crop=center'
      ],
      features: [
        '10x Rocket Launcher rockets',
        '20x Satchel charges',
        'Metal chest plate and helmet',
        'AK-47 with 240 ammo',
        'Medical kit and syringes',
        'Advanced building materials',
        'C4 explosive (2x)'
      ],
      inStock: true,
      limited: true,
      badge: 'Limited Time'
    },
    {
      id: 'skin-bear',
      name: 'Legendary Bear Skin',
      description: 'Stand out with this exclusive animated bear skin. Features custom animations, particle effects, and unique sound effects. This premium cosmetic shows your status on the server.',
      shortDescription: 'Exclusive animated bear skin with effects',
      price: 12.99,
      category: 'cosmetics',
      images: [
        'https://images.unsplash.com/photo-1446642459837-9c512a47a7e4?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1612212188158-a3842d3f72f1?w=800&h=600&fit=crop&crop=center'
      ],
      features: [
        'Animated bear model',
        'Custom particle effects',
        'Unique roar sound effects',
        'Glowing eyes at night',
        'Premium fur textures',
        'Season exclusive design'
      ],
      popular: true,
      inStock: true,
      badge: 'Exclusive'
    },
    {
      id: 'wolf-skin',
      name: 'Alpha Wolf Skin',
      description: 'Dominate the server with this fierce alpha wolf skin. Features realistic wolf movements, howling sounds, and intimidating presence that strikes fear into enemies.',
      shortDescription: 'Fierce alpha wolf skin with howling effects',
      price: 14.99,
      category: 'cosmetics',
      images: [
        'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1605034313761-73ea4a0cfbf3?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=800&h=600&fit=crop&crop=center'
      ],
      features: [
        'Realistic wolf animations',
        'Intimidating howl sounds',
        'Pack leader aura effects',
        'Enhanced night vision',
        'Alpha status indicators',
        'Seasonal coat variations'
      ],
      inStock: true,
      badge: 'New'
    },
    {
      id: 'dragon-skin',
      name: 'Mythical Dragon Skin',
      description: 'Become a legend with this epic dragon transformation skin. Breathe fire, spread mighty wings, and rule the skies with this ultimate cosmetic upgrade.',
      shortDescription: 'Epic dragon skin with fire breath effects',
      price: 19.99,
      originalPrice: 24.99,
      discount: 20,
      category: 'cosmetics',
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1618671276673-26ddc21a3c89?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&crop=center'
      ],
      features: [
        'Fire breathing animations',
        'Massive wing spread effects',
        'Roaring sound effects',
        'Magical aura particles',
        'Flight movement patterns',
        'Legendary status badge'
      ],
      popular: true,
      inStock: true,
      limited: true,
      badge: 'Legendary'
    },
    {
      id: 'xp-booster',
      name: '2x XP Booster (24h)',
      description: 'Double your experience gains for 24 hours! Perfect for quickly leveling up your character and unlocking new abilities. Stack with other boosters for maximum efficiency.',
      shortDescription: 'Double XP gains for 24 hours',
      price: 3.99,
      category: 'boosters',
      images: [
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop&crop=center'
      ],
      features: [
        '2x experience gain',
        '24-hour duration',
        'Applies to all activities',
        'Stackable with other bonuses',
        'Instant activation',
        'Progress tracking'
      ],
      inStock: true,
      maxQuantity: 10
    },
    {
      id: 'resource-booster',
      name: '3x Resource Booster (12h)',
      description: 'Triple your resource gathering speed for 12 hours! Collect wood, stone, and ore at lightning speed. Perfect for building massive bases quickly.',
      shortDescription: 'Triple resource gathering for 12 hours',
      price: 5.99,
      category: 'boosters',
      images: [
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&crop=center'
      ],
      features: [
        '3x gathering speed',
        '12-hour duration',
        'Works on all resources',
        'Visual particle effects',
        'Activity notifications',
        'Efficiency tracking'
      ],
      inStock: true,
      maxQuantity: 5
    },
    {
      id: 'mega-bundle',
      name: 'Mega Survivor Bundle',
      description: 'The ultimate package for serious players! Combines VIP membership, premium kits, exclusive skins, and boosters at an incredible value. Everything you need to dominate the server.',
      shortDescription: 'Ultimate survival package with everything included',
      price: 49.99,
      originalPrice: 75.96,
      discount: 34,
      category: 'bundles',
      images: [
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&h=600&fit=crop&crop=center'
      ],
      features: [
        'VIP Monthly Membership',
        'Starter + Raid Kits',
        'Legendary Bear Skin',
        '5x XP Boosters (24h each)',
        'Exclusive bundle badge',
        'Priority customer support',
        'Future DLC access'
      ],
      popular: true,
      inStock: true,
      badge: 'Best Value',
      limited: true
    },
    {
      id: 'cosmetic-bundle',
      name: 'Animal Kingdom Bundle',
      description: 'Transform into any creature with this exclusive skin collection! Includes Bear, Wolf, and Dragon skins with all their unique effects and animations.',
      shortDescription: 'Complete animal skin collection',
      price: 39.99,
      originalPrice: 47.97,
      discount: 17,
      category: 'bundles',
      images: [
        'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600&fit=crop&crop=center'
      ],
      features: [
        'Legendary Bear Skin',
        'Alpha Wolf Skin',
        'Mythical Dragon Skin',
        'All unique animations',
        'Exclusive bundle effects',
        'Collector achievement'
      ],
      inStock: true,
      badge: 'Collection'
    }
  ]
}

// Shop endpoints - Updated to use database
app.get('/api/shop/products', (req, res) => {
  const { category, search, sort } = req.query

  let query = `
    SELECT p.*, c.name as category_name, c.icon as category_icon,
           GROUP_CONCAT(DISTINCT pi.image_url) as images,
           GROUP_CONCAT(DISTINCT pf.feature_text) as features
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON p.id = pi.product_id
    LEFT JOIN product_features pf ON p.id = pf.product_id
    WHERE p.active = 1
  `
  
  const params = []
  
  // Filter by category
  if (category && category !== 'all') {
    query += ` AND c.slug = ?`
    params.push(category)
  }
  
  // Filter by search
  if (search) {
    query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.short_description LIKE ?)`
    const searchTerm = `%${search}%`
    params.push(searchTerm, searchTerm, searchTerm)
  }
  
  query += ` GROUP BY p.id`
  
  // Sort products
  if (sort) {
    switch (sort) {
      case 'price':
        query += ` ORDER BY p.price ASC`
        break
      case 'name':
        query += ` ORDER BY p.name ASC`
        break
      case 'popular':
        query += ` ORDER BY p.popular DESC, p.featured DESC`
        break
      default:
        query += ` ORDER BY p.featured DESC, p.popular DESC, p.created_at DESC`
    }
  } else {
    query += ` ORDER BY p.featured DESC, p.popular DESC, p.created_at DESC`
  }
  
  db.all(query, params, (err, products) => {
    if (err) {
      console.error('Database error:', err)
      // Fallback to static data if database fails
      const fallbackProducts = generateShopItems()
      return res.json({
        products: fallbackProducts,
        totalCount: fallbackProducts.length,
        timestamp: new Date().toISOString()
      })
    }
    
    const formattedProducts = products.map(product => ({
      id: product.slug,
      name: product.name,
      description: product.description,
      shortDescription: product.short_description,
      price: product.price,
      originalPrice: product.original_price,
      discount: product.discount_percentage,
      category: product.category_name?.toLowerCase(),
      images: product.images ? product.images.split(',') : [],
      features: product.features ? product.features.split(',') : [],
      popular: Boolean(product.popular),
      limited: Boolean(product.limited_edition),
      badge: product.badge,
      inStock: product.stock_quantity > 0,
      maxQuantity: product.max_quantity_per_order
    }))
    
    res.json({
      products: formattedProducts,
      totalCount: formattedProducts.length,
      timestamp: new Date().toISOString()
    })
  })
})

// Get single product - Updated to use database
app.get('/api/shop/products/:id', (req, res) => {
  const query = `
    SELECT p.*, c.name as category_name, c.slug as category_slug,
           GROUP_CONCAT(DISTINCT pi.image_url) as images,
           GROUP_CONCAT(DISTINCT pf.feature_text) as features
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON p.id = pi.product_id
    LEFT JOIN product_features pf ON p.id = pf.product_id
    WHERE p.slug = ? AND p.active = 1
    GROUP BY p.id
  `
  
  db.get(query, [req.params.id], (err, product) => {
    if (err) {
      console.error('Database error:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    const formattedProduct = {
      id: product.slug,
      name: product.name,
      description: product.description,
      shortDescription: product.short_description,
      price: product.price,
      originalPrice: product.original_price,
      discount: product.discount_percentage,
      category: product.category_slug,
      images: product.images ? product.images.split(',') : [],
      features: product.features ? product.features.split(',') : [],
      popular: Boolean(product.popular),
      limited: Boolean(product.limited_edition),
      badge: product.badge,
      inStock: product.stock_quantity > 0,
      maxQuantity: product.max_quantity_per_order
    }
    
    res.json({
      product: formattedProduct,
      timestamp: new Date().toISOString()
    })
  })
})

// Get shop categories - Updated to use database
app.get('/api/shop/categories', (req, res) => {
  const query = `
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id AND p.active = 1
    WHERE c.active = 1
    GROUP BY c.id
    ORDER BY c.sort_order ASC
  `
  
  db.all(query, [], (err, categories) => {
    if (err) {
      console.error('Database error:', err)
      // Fallback to static categories
      const fallbackCategories = [
        { id: 'all', name: 'All Items', icon: '🛍️', count: 0 },
        { id: 'vip', name: 'VIP', icon: '👑', count: 0 },
        { id: 'kits', name: 'Kits', icon: '📦', count: 0 },
        { id: 'cosmetics', name: 'Skins', icon: '🎨', count: 0 },
        { id: 'boosters', name: 'Boosters', icon: '⚡', count: 0 },
        { id: 'bundles', name: 'Bundles', icon: '🎁', count: 0 }
      ]
      return res.json({
        categories: fallbackCategories,
        timestamp: new Date().toISOString()
      })
    }
    
    // Add "All Items" category
    const totalProducts = categories.reduce((sum, cat) => sum + cat.product_count, 0)
    const formattedCategories = [
      { id: 'all', name: 'All Items', icon: '🛍️', count: totalProducts },
      ...categories.map(cat => ({
        id: cat.slug,
        name: cat.name,
        icon: cat.icon,
        count: cat.product_count
      }))
    ]
    
    res.json({
      categories: formattedCategories,
      timestamp: new Date().toISOString()
    })
  })
})

// Create order endpoint - Updated to use database
app.post('/api/shop/orders', optionalAuth, (req, res) => {
  const { items, customerInfo, paymentMethod } = req.body
  const userId = req.user?.id || null

  // Validate request
  if (!items || !items.length || !customerInfo || !customerInfo.email || !customerInfo.username) {
    return res.status(400).json({ error: 'Invalid order data' })
  }

  // Get products from database using slugs
  const productSlugs = items.map(item => item.id)
  const placeholders = productSlugs.map(() => '?').join(',')
  const query = `SELECT * FROM products WHERE slug IN (${placeholders}) AND active = 1`
  
  db.all(query, productSlugs, (err, products) => {
    if (err) {
      console.error('Database error in order creation:', err)
      return res.status(500).json({ error: 'Database error' })
    }
    
    let total = 0
    const orderItems = []
    
    // Calculate total and validate items
    for (const item of items) {
      const product = products.find(p => p.slug === item.id)
      if (product && product.stock_quantity > 0) {
        const quantity = Math.min(item.quantity, product.max_quantity_per_order || 99)
        orderItems.push({
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          quantity,
          totalPrice: product.price * quantity
        })
        total += product.price * quantity
      }
    }
    
    if (orderItems.length === 0) {
      return res.status(400).json({ error: 'No valid items in order' })
    }
    
    // Generate order number
    const orderNumber = `RB${Date.now()}${Math.floor(Math.random() * 1000)}`
    
    // Create order (simplified without complex transaction)
    db.run(
      `INSERT INTO orders (
        order_number, user_id, status, payment_status, payment_method,
        subtotal, total_amount, customer_email, customer_rust_username
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        userId,
        'completed',
        'paid',
        paymentMethod || 'stripe',
        total,
        total,
        customerInfo.email,
        customerInfo.username
      ],
      function(orderErr) {
        if (orderErr) {
          console.error('Failed to create order:', orderErr)
          return res.status(500).json({ error: 'Failed to create order' })
        }
        
        const orderId = this.lastID
        
        // Insert order items (simplified)
        let itemsInserted = 0
        const totalItems = orderItems.length
        let hasError = false
        
        orderItems.forEach(orderItem => {
          db.run(
            `INSERT INTO order_items (
              order_id, product_id, product_name, product_price, quantity, total_price
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              orderId,
              orderItem.productId,
              orderItem.productName,
              orderItem.productPrice,
              orderItem.quantity,
              orderItem.totalPrice
            ],
            (itemErr) => {
              if (itemErr && !hasError) {
                hasError = true
                console.error('Failed to create order item:', itemErr)
                return res.status(500).json({ error: 'Failed to create order items' })
              }
              
              itemsInserted++
              
              if (itemsInserted === totalItems && !hasError) {
                // Update user stats if authenticated
                if (userId) {
                  db.run(
                    'UPDATE users SET total_spent = total_spent + ?, loyalty_points = loyalty_points + ? WHERE id = ?',
                    [total, Math.floor(total), userId]
                  )
                  
                  // Clear user cart
                  db.run('DELETE FROM cart_items WHERE user_id = ?', [userId])
                }
                res.json({
                  success: true,
                  order: {
                    id: orderId,
                    orderNumber,
                    items: orderItems,
                    customerInfo,
                    total: parseFloat(total.toFixed(2)),
                    status: 'completed',
                    paymentStatus: 'paid',
                    createdAt: new Date().toISOString(),
                    deliveryStatus: 'pending',
                    estimatedDelivery: new Date(Date.now() + 5 * 60 * 1000).toISOString()
                  },
                  message: 'Order completed successfully! Items will be delivered to your account within 5 minutes.'
                })
              }
            }
          )
        })
      }
    )
  })
})

// User cart endpoints
app.get('/api/cart', authenticateToken, (req, res) => {
  const query = `
    SELECT ci.*, p.name, p.price, p.slug, pi.image_url
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
  `
  
  db.all(query, [req.user.id], (err, cartItems) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }
    
    res.json({
      cartItems: cartItems.map(item => ({
        id: item.product_id,
        slug: item.slug,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image_url
      })),
      timestamp: new Date().toISOString()
    })
  })
})

app.post('/api/cart', authenticateToken, (req, res) => {
  const { productId, quantity } = req.body
  
  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Invalid product ID or quantity' })
  }
  
  // Check if item already in cart
  db.get(
    'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
    [req.user.id, productId],
    (err, existingItem) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      
      if (existingItem) {
        // Update existing item
        db.run(
          'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [existingItem.quantity + quantity, existingItem.id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to update cart' })
            }
            res.json({ message: 'Cart updated successfully' })
          }
        )
      } else {
        // Add new item
        db.run(
          'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [req.user.id, productId, quantity],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to add to cart' })
            }
            res.json({ message: 'Item added to cart successfully' })
          }
        )
      }
    }
  )
})

app.delete('/api/cart/:productId', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
    [req.user.id, req.params.productId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      res.json({ message: 'Item removed from cart' })
    }
  )
})

// User orders endpoint
app.get('/api/orders', authenticateToken, (req, res) => {
  const query = `
    SELECT o.*, GROUP_CONCAT(oi.product_name || ' x' || oi.quantity) as items_summary
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `
  
  db.all(query, [req.user.id], (err, orders) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }
    
    res.json({
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        total: order.total_amount,
        status: order.status,
        paymentStatus: order.payment_status,
        deliveryStatus: order.delivery_status,
        itemsSummary: order.items_summary,
        createdAt: order.created_at
      })),
      timestamp: new Date().toISOString()
    })
  })
})

// Public themes endpoint
app.get('/api/themes', (req, res) => {
  db.all('SELECT * FROM themes WHERE is_active = 1 ORDER BY created_at DESC', (err, themes) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }
    
    res.json({
      themes: themes.map(theme => ({
        ...theme,
        css_variables: JSON.parse(theme.css_variables)
      }))
    })
  })
})

// Admin Routes

// Get all themes
app.get('/api/admin/themes', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM themes ORDER BY created_at DESC', (err, themes) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }
    
    res.json({
      themes: themes.map(theme => ({
        ...theme,
        css_variables: JSON.parse(theme.css_variables)
      }))
    })
  })
})

// Create new theme
app.post('/api/admin/themes', authenticateToken, requireAdmin, (req, res) => {
  const { name, slug, description, css_variables } = req.body
  
  if (!name || !slug || !css_variables) {
    return res.status(400).json({ error: 'Name, slug, and CSS variables are required' })
  }
  
  db.run(
    'INSERT INTO themes (name, slug, description, css_variables, is_active) VALUES (?, ?, ?, ?, ?)',
    [name, slug, description, JSON.stringify(css_variables), true],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create theme' })
      }
      
      res.json({
        message: 'Theme created successfully',
        themeId: this.lastID
      })
    }
  )
})

// Update theme
app.put('/api/admin/themes/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params
  const { name, slug, description, css_variables, is_active } = req.body
  
  db.run(
    `UPDATE themes 
     SET name = ?, slug = ?, description = ?, css_variables = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, slug, description, JSON.stringify(css_variables), is_active, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update theme' })
      }
      
      res.json({ message: 'Theme updated successfully' })
    }
  )
})

// Delete theme
app.delete('/api/admin/themes/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params
  
  db.run('DELETE FROM themes WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete theme' })
    }
    
    res.json({ message: 'Theme deleted successfully' })
  })
})

// Get active themes (public endpoint)
app.get('/api/themes', (req, res) => {
  db.all('SELECT * FROM themes WHERE is_active = 1', (err, themes) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }
    
    res.json({
      themes: themes.map(theme => ({
        id: theme.id,
        name: theme.name,
        slug: theme.slug,
        description: theme.description,
        css_variables: JSON.parse(theme.css_variables)
      }))
    })
  })
})

// Get server configuration
app.get('/api/admin/config', authenticateToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM server_config', (err, configs) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }
    
    const configMap = {}
    configs.forEach(config => {
      configMap[config.key] = {
        value: config.value,
        description: config.description,
        type: config.config_type
      }
    })
    
    res.json({ config: configMap })
  })
})

// Update server configuration
app.put('/api/admin/config', authenticateToken, requireAdmin, (req, res) => {
  const { configs } = req.body
  
  if (!configs || typeof configs !== 'object') {
    return res.status(400).json({ error: 'Invalid configuration data' })
  }
  
  const updatePromises = Object.entries(configs).map(([key, value]) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE server_config SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
        [value, key],
        (err) => {
          if (err) reject(err)
          else resolve(true)
        }
      )
    })
  })
  
  Promise.all(updatePromises)
    .then(() => {
      res.json({ message: 'Configuration updated successfully' })
    })
    .catch(() => {
      res.status(500).json({ error: 'Failed to update configuration' })
    })
})

// Start server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  // eslint-disable-next-line no-console
  console.log(`📊 API endpoints:`)
  // eslint-disable-next-line no-console
  console.log(`   - Health: http://localhost:${PORT}/api/health`)
  // eslint-disable-next-line no-console
  console.log(`   - Authentication: http://localhost:${PORT}/api/auth/*`)
  // eslint-disable-next-line no-console
  console.log(`   - Server Status: http://localhost:${PORT}/api/server/status`)
  // eslint-disable-next-line no-console
  console.log(`   - Players: http://localhost:${PORT}/api/server/players`)
  // eslint-disable-next-line no-console
  console.log(`   - Statistics: http://localhost:${PORT}/api/server/stats`)
  // eslint-disable-next-line no-console
  console.log(`   - Events: http://localhost:${PORT}/api/server/events`)
  // eslint-disable-next-line no-console
  console.log(`   - Map Info: http://localhost:${PORT}/api/map`)
  // eslint-disable-next-line no-console
  console.log(`   - Discord: http://localhost:${PORT}/api/discord`)
  // eslint-disable-next-line no-console
  console.log(`   - Shop Products: http://localhost:${PORT}/api/shop/products`)
  // eslint-disable-next-line no-console
  console.log(`   - Shop Categories: http://localhost:${PORT}/api/shop/categories`)
  // eslint-disable-next-line no-console
  console.log(`   - Shop Orders: http://localhost:${PORT}/api/shop/orders`)
  // eslint-disable-next-line no-console
  console.log(`   - User Cart: http://localhost:${PORT}/api/cart`)
  // eslint-disable-next-line no-console
  console.log(`   - User Orders: http://localhost:${PORT}/api/orders`)
})