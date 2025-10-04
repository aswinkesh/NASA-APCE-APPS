import { motion } from 'framer-motion'

export default function SearchBar({ searchQuery, setSearchQuery, handleSearch, isLoading }) {
  return (
    <form onSubmit={handleSearch} className="search-form">
      <div className="search-input-container">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter location..."
          className="search-input"
        />
        <motion.button 
          type="submit" 
          className="search-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </motion.button>
      </div>
    </form>
  )
}