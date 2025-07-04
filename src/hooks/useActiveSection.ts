import { useState, useEffect } from 'react'

export function useActiveSection() {
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const sections = ['home', 'server-info', 'map', 'rules', 'discord', 'shop']
    
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -20% 0px', // Trigger when section is 20% visible from top/bottom
      threshold: 0.3 // At least 30% of the section must be visible
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Find the section that's most visible
      let mostVisibleSection = activeSection
      let maxVisibility = 0

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const visibilityRatio = entry.intersectionRatio
          if (visibilityRatio > maxVisibility) {
            maxVisibility = visibilityRatio
            mostVisibleSection = entry.target.id
          }
        }
      })

      if (mostVisibleSection !== activeSection && maxVisibility > 0) {
        setActiveSection(mostVisibleSection)
      }
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe all sections
    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        observer.observe(element)
      }
    })

    // Handle scroll events for immediate feedback
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const rect = element.getBoundingClientRect()
          const elementTop = rect.top + window.scrollY
          const elementBottom = elementTop + element.offsetHeight

          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            if (sectionId !== activeSection) {
              setActiveSection(sectionId)
            }
            break
          }
        }
      }
    }

    // Initial check
    handleScroll()

    // Add scroll listener with throttling
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', throttledScroll)
    }
  }, [activeSection])

  return activeSection
}