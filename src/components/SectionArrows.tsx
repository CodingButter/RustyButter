import React, { useState, useEffect } from 'react'

interface SectionArrowsProps {
  currentSection: string
  showUpArrow?: boolean
  showDownArrow?: boolean
}

export function SectionArrows({ currentSection, showUpArrow = true, showDownArrow = true }: SectionArrowsProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Define the order of sections
  const sections = ['home', 'server-info', 'map', 'rules', 'discord', 'shop']
  
  useEffect(() => {
    // Show arrows after a short delay for smooth entrance
    const timer = setTimeout(() => setIsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const getCurrentSectionIndex = () => {
    return sections.indexOf(currentSection)
  }

  const scrollToSection = (direction: 'up' | 'down') => {
    const currentIndex = getCurrentSectionIndex()
    let targetIndex

    if (direction === 'up') {
      targetIndex = currentIndex - 1
    } else {
      targetIndex = currentIndex + 1
    }

    // Check bounds
    if (targetIndex < 0 || targetIndex >= sections.length) {
      return
    }

    const targetSection = sections[targetIndex]
    const element = document.getElementById(targetSection)
    
    if (element) {
      // Update URL hash
      window.history.pushState(null, '', `#${targetSection}`)
      
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, direction: 'up' | 'down') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      scrollToSection(direction)
    }
  }

  const currentIndex = getCurrentSectionIndex()
  const canGoUp = currentIndex > 0
  const canGoDown = currentIndex < sections.length - 1

  return (
    <>
      {/* Up Arrow - Top of Section */}
      {showUpArrow && canGoUp && (
        <div className={`fixed top-20 right-6 z-30 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}>
          <button
            onClick={() => scrollToSection('up')}
            onKeyDown={(e) => handleKeyPress(e, 'up')}
            className="group relative bg-black/40 backdrop-blur-md hover:bg-black/60 text-white hover:text-accent-primary p-4 rounded-full border border-white/20 hover:border-accent-primary/50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:shadow-accent-primary/30 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            title={`Go to ${sections[currentIndex - 1]?.replace('-', ' ')} section`}
            aria-label={`Navigate to previous section: ${sections[currentIndex - 1]?.replace('-', ' ')}`}
          >
            {/* Enhanced background with multiple layers */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
            <div className="absolute inset-0 rounded-full bg-accent-primary/0 group-hover:bg-accent-primary/20 transition-all duration-300"></div>
            
            {/* Arrow SVG with enhanced styling */}
            <svg 
              className="w-6 h-6 relative z-10 transform group-hover:scale-110 transition-transform duration-200 drop-shadow-lg" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M5 15l7-7 7 7" 
              />
            </svg>

            {/* Enhanced Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 shadow-2xl whitespace-nowrap">
                <span className="text-sm text-white font-medium capitalize">
                  {sections[currentIndex - 1]?.replace('-', ' ')}
                </span>
                <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-black/80"></div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Down Arrow - Bottom of Section */}
      {showDownArrow && canGoDown && (
        <div className={`fixed bottom-6 right-6 z-30 transition-all duration-500 delay-100 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <button
            onClick={() => scrollToSection('down')}
            onKeyDown={(e) => handleKeyPress(e, 'down')}
            className="group relative bg-black/40 backdrop-blur-md hover:bg-black/60 text-white hover:text-accent-primary p-4 rounded-full border border-white/20 hover:border-accent-primary/50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:shadow-accent-primary/30 transform hover:translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            title={`Go to ${sections[currentIndex + 1]?.replace('-', ' ')} section`}
            aria-label={`Navigate to next section: ${sections[currentIndex + 1]?.replace('-', ' ')}`}
          >
            {/* Enhanced background with multiple layers */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
            <div className="absolute inset-0 rounded-full bg-accent-primary/0 group-hover:bg-accent-primary/20 transition-all duration-300"></div>
            
            {/* Arrow SVG with enhanced styling */}
            <svg 
              className="w-6 h-6 relative z-10 transform group-hover:scale-110 transition-transform duration-200 drop-shadow-lg" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M19 9l-7 7-7-7" 
              />
            </svg>

            {/* Enhanced Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 shadow-2xl whitespace-nowrap">
                <span className="text-sm text-white font-medium capitalize">
                  {sections[currentIndex + 1]?.replace('-', ' ')}
                </span>
                <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-black/80"></div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Floating Section Indicator */}
      <div className={`fixed right-6 top-1/2 -translate-y-1/2 z-40 transition-all duration-700 delay-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}>
        <div className="flex flex-col gap-3 bg-black/40 backdrop-blur-md p-4 rounded-full border border-white/20 shadow-2xl">
          {sections.map((section, index) => (
            <button
              key={section}
              onClick={() => {
                const element = document.getElementById(section)
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-accent-primary scale-125 shadow-lg shadow-accent-primary/50' 
                  : 'bg-white/50 hover:bg-white/80 hover:scale-110'
              }`}
              title={`Go to ${section.replace('-', ' ')} section`}
              aria-label={`Navigate to ${section.replace('-', ' ')} section`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/20 backdrop-blur-sm z-30">
        <div 
          className="h-full bg-gradient-to-r from-accent-primary to-accent-primary/80 shadow-lg transition-all duration-300"
          style={{ 
            width: `${((currentIndex + 1) / sections.length) * 100}%` 
          }}
        />
      </div>
    </>
  )
}