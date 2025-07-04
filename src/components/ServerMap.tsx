import React, { useState, useEffect, useMemo, useRef } from 'react'

interface MapInfo {
  seed: number
  size: number
  mapImage: string
  monuments: string[]
  customFeatures: string[]
  resourceDensity: string
  biomes: string[]
  timestamp: string
}

export function ServerMap() {
  // Fallback data to ensure the section always displays
  const fallbackMapInfo: MapInfo = useMemo(() => ({
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
    biomes: ['Temperate', 'Desert', 'Snow', 'Swamp'],
    timestamp: new Date().toISOString()
  }), [])

  const [mapInfo, setMapInfo] = useState<MapInfo>(fallbackMapInfo)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [selectedMonument, setSelectedMonument] = useState<string | null>(null)
  
  // Zoom and pan state
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 })
  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const response = await fetch('http://localhost:3003/api/map')
        if (response.ok) {
          const data = await response.json()
          setMapInfo(data || fallbackMapInfo)
        }
      } catch (error) {
        // Using fallback map data - API not available
      }
    }

    fetchMapData()
  }, [fallbackMapInfo])

  const monumentEmojis: Record<string, string> = {
    'Launch Site': '🚀',
    'Military Tunnels': '🏗️',
    'Power Plant': '⚡',
    'Water Treatment': '💧',
    'Airfield': '✈️',
    'Train Yard': '🚂',
    'Dome': '🏛️',
    'Satellite Dish': '📡',
    'Harbor': '⚓',
    'Lighthouse': '🗼',
    'Junkyard': '🗑️',
    'Bandit Camp': '🏕️',
    'Outpost': '🏪'
  }

  const biomeColors: Record<string, string> = {
    'Temperate': 'bg-green-500/20 text-green-400',
    'Desert': 'bg-yellow-500/20 text-yellow-400',
    'Snow': 'bg-blue-500/20 text-blue-400',
    'Swamp': 'bg-emerald-500/20 text-emerald-400'
  }

  // Zoom and pan handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 4))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleZoomReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      setLastPan(pan)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      setPan({
        x: lastPan.x + deltaX,
        y: lastPan.y + deltaY
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const mapContainer = mapContainerRef.current
    if (!mapContainer) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setZoom(prev => Math.max(0.5, Math.min(4, prev + delta)))
    }

    mapContainer.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      mapContainer.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <section className="min-h-screen bg-primary py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-heading mb-4">
            SERVER <span className="text-accent-primary">MAP</span>
          </h1>
          <div className="w-32 h-1 bg-accent-primary mx-auto mb-6" />
          <p className="text-xl text-body max-w-3xl mx-auto">
            Explore the current map layout, monument locations, and terrain features of our Rust server.
          </p>
        </div>

        {/* Map Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
            <div className="text-3xl font-bold text-accent-primary mb-2">{mapInfo.size}</div>
            <div className="text-body">Map Size</div>
          </div>
          <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
            <div className="text-3xl font-bold text-accent-primary mb-2">{mapInfo.seed}</div>
            <div className="text-body">Map Seed</div>
          </div>
          <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
            <div className="text-3xl font-bold text-accent-primary mb-2">{mapInfo.monuments.length}</div>
            <div className="text-body">Monuments</div>
          </div>
          <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
            <div className="text-3xl font-bold text-accent-primary mb-2">{mapInfo.resourceDensity}</div>
            <div className="text-body">Resource Density</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Map Display */}
          <div className="xl:col-span-2">
            <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold text-heading flex items-center gap-2">
                  🗺️ Current Map Layout
                </h2>
                <p className="text-body mt-2">Seed: {mapInfo.seed} • Size: {mapInfo.size}x{mapInfo.size}</p>
                <p className="text-xs text-gray-300 mt-1">Image URL: {`http://localhost:3003${mapInfo.mapImage}`}</p>
              </div>
              
              <div className="relative">
                {/* Map Image Container */}
                <div 
                  ref={mapContainerRef}
                  className="relative bg-black/20 aspect-square min-h-[400px] overflow-hidden cursor-move"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                >
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-body">Loading map...</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Zoomable and draggable map container */}
                  <div 
                    className="relative w-full h-full"
                    style={{
                      transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                      transformOrigin: 'center center',
                      transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                    }}
                  >
                    <img
                      src="http://localhost:3003/images/map.png"
                      alt="Server Map"
                      className={`w-full h-full object-contain transition-opacity duration-500 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => {
                        setImageLoaded(true)
                      }}
                      onError={() => {
                        setImageError(true)
                        setImageLoaded(true)
                      }}
                      onDragStart={(e) => e.preventDefault()} // Prevent default drag behavior
                    />
                    
                    {/* Fallback placeholder if image fails */}
                    {imageError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <div className="text-center">
                          <div className="text-6xl mb-4">🗺️</div>
                          <p className="text-body">Map Unavailable</p>
                          <p className="text-sm text-body opacity-75">Size: {mapInfo.size}x{mapInfo.size}</p>
                          <p className="text-xs text-body opacity-50 mt-2">Check console for details</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Map Overlay Info */}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="text-heading text-sm font-medium">Live Map</div>
                    <div className="text-gray-300 text-xs">Updated on wipe</div>
                    <div className="text-gray-400 text-xs mt-1">
                      {imageLoaded ? (imageError ? 'Error' : 'Loaded') : 'Loading...'}
                    </div>
                  </div>

                  {/* Zoom Controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button 
                      onClick={handleZoomIn}
                      className="bg-black/60 backdrop-blur-sm text-heading p-2 rounded-lg border border-white/20 hover:bg-black/80 transition-colors"
                      title="Zoom In"
                    >
                      <span className="text-lg">+</span>
                    </button>
                    <button 
                      onClick={handleZoomOut}
                      className="bg-black/60 backdrop-blur-sm text-heading p-2 rounded-lg border border-white/20 hover:bg-black/80 transition-colors"
                      title="Zoom Out"
                    >
                      <span className="text-lg">-</span>
                    </button>
                    <button 
                      onClick={handleZoomReset}
                      className="bg-black/60 backdrop-blur-sm text-heading p-2 rounded-lg border border-white/20 hover:bg-black/80 transition-colors"
                      title="Reset Zoom"
                    >
                      <span className="text-sm">⌂</span>
                    </button>
                  </div>
                  
                  {/* Zoom Level Indicator */}
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                    <div className="text-heading text-sm font-medium">
                      {Math.round(zoom * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Monuments List */}
            <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-onprimary mb-4 flex items-center gap-2">
                🏛️ Monuments ({mapInfo.monuments.length})
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {mapInfo.monuments.map((monument, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMonument(selectedMonument === monument ? null : monument)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      selectedMonument === monument
                        ? 'bg-accent-primary/20 border-accent-primary/50 text-accent-primary'
                        : 'bg-black/20 border-white/10 text-body hover:bg-accent-primary/10 hover:border-accent-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{monumentEmojis[monument] || '🏗️'}</span>
                      <span className="font-medium">{monument}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Biomes */}
            <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-onprimary mb-4 flex items-center gap-2">
                🌍 Biomes
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {mapInfo.biomes.map((biome, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border text-center font-medium ${biomeColors[biome] || 'bg-gray-500/20 text-gray-400'}`}
                  >
                    {biome}
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Features */}
            <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-onprimary mb-4 flex items-center gap-2">
                ⚙️ Custom Features
              </h3>
              <div className="space-y-3">
                {mapInfo.customFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/10"
                  >
                    <div className="w-2 h-2 bg-accent-primary rounded-full"></div>
                    <span className="text-body">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Legend */}
            <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-onprimary mb-4 flex items-center gap-2">
                📍 Legend
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-body">High Tier Monuments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-body">Medium Tier Monuments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-body">Safe Zones</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-body">Water Sources</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Monument Info */}
        {selectedMonument && (
          <div className="mt-8 bg-gradient-to-r from-accent-primary/20 to-accent-primary/5 rounded-2xl p-8 border border-accent-primary/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{monumentEmojis[selectedMonument] || '🏗️'}</span>
              <h3 className="text-3xl font-bold text-onprimary">{selectedMonument}</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-accent-primary mb-2">Monument Info</h4>
                <p className="text-body">
                  {selectedMonument === 'Launch Site' && 'High-tier monument with elite crates, requires red keycard access. Beware of scientists and radiation.'}
                  {selectedMonument === 'Military Tunnels' && 'Underground complex with valuable loot. Bring a blue keycard and watch out for heavy radiation.'}
                  {selectedMonument === 'Power Plant' && 'Industrial monument with puzzle rooms and electric switches. Good for components and scrap.'}
                  {selectedMonument === 'Water Treatment' && 'Large monument with multiple puzzle areas. Excellent source of components and military-grade loot.'}
                  {selectedMonument === 'Airfield' && 'Massive monument with hangars and control tower. High-value loot but expect heavy competition.'}
                  {selectedMonument === 'Outpost' && 'Safe zone for trading and purchasing items. No weapons allowed inside the compound.'}
                  {selectedMonument === 'Bandit Camp' && 'Safe zone with gambling wheel and shops. Trade your scrap for weapons and items.'}
                  {!['Launch Site', 'Military Tunnels', 'Power Plant', 'Water Treatment', 'Airfield', 'Outpost', 'Bandit Camp'].includes(selectedMonument) && 'Monument with various loot opportunities and challenges. Explore carefully for the best rewards.'}
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-accent-primary mb-2">Loot Tier</h4>
                <div className="flex items-center gap-2">
                  {['Launch Site', 'Military Tunnels', 'Airfield'].includes(selectedMonument) && (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-body">High Tier (Elite Crates)</span>
                    </>
                  )}
                  {['Power Plant', 'Water Treatment', 'Train Yard'].includes(selectedMonument) && (
                    <>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-body">Medium Tier (Military Crates)</span>
                    </>
                  )}
                  {['Outpost', 'Bandit Camp'].includes(selectedMonument) && (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-body">Safe Zone (Trading)</span>
                    </>
                  )}
                  {!['Launch Site', 'Military Tunnels', 'Airfield', 'Power Plant', 'Water Treatment', 'Train Yard', 'Outpost', 'Bandit Camp'].includes(selectedMonument) && (
                    <>
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-body">Various Loot</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}