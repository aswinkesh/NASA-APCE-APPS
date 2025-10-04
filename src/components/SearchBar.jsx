import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import styles from './SearchBar.module.css'

export default function SearchBar({ searchQuery, setSearchQuery, handleSearch }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const suggestionsRef = useRef(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 3) {
        setSuggestions([])
        return
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=5`
        )
        const data = await response.json()
        setSuggestions(data)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value)
    setShowSuggestions(true)
    setSelectedIndex(-1)
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.display_name)
    setShowSuggestions(false)
    handleSearch(null, {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    })
  }

  const handleKeyDown = (e) => {
    if (!suggestions.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSuggestionClick(suggestions[selectedIndex])
    }
  }

  return (
    <div className={styles['search-container']} ref={suggestionsRef}>
      <form onSubmit={handleSearch} className={styles['search-form']}>
        <div className={styles['search-input-container']}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Enter location..."
            className={styles['search-input']}
            autoComplete="off"
          />
          <motion.button 
            type="submit" 
            className={styles['search-button']}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Search
          </motion.button>
        </div>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <ul className={styles['suggestions-list']} style={{ backgroundColor: 'white' }}>
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.place_id}
              className={`${styles['suggestion-item']} ${index === selectedIndex ? styles.selected : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}