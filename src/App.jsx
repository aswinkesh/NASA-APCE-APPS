import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpring } from '@react-spring/web'
import axios from 'axios'
import 'ol/ol.css'
import './App.css'
import SearchBar from './components/SearchBar'
import PredictionControls from './components/PredictionControls'
import Globe from './components/Globe'
import Map from './components/Map'
import WeatherCard from './components/WeatherCard'

export default function App() {
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [coordinates, setCoordinates] = useState({ lat: 20, lng: 0 })
  const [showPredictionControls, setShowPredictionControls] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [weatherData, setWeatherData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeView, setActiveView] = useState('standard')
  const [showMap, setShowMap] = useState(false)
  const [predictionDate, setPredictionDate] = useState('')

  // Refs
  const globeContainer = useRef(null)
  const mapContainer = useRef(null)
  const map = useRef(null)
  const vectorSource = useRef(null)
  const vectorLayer = useRef(null)

  // Animation for the weather card
  const weatherCardSpring = useSpring({
    opacity: weatherData ? 1 : 0,
    transform: weatherData ? 'translateX(0)' : 'translateX(100px)',
  })

  const handleSearch = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Geocode the location using OpenStreetMap's Nominatim service
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: searchQuery,
            format: 'json',
            limit: 1
          },
          headers: {
            'User-Agent': 'WeatherApp/1.0'
          }
        }
      )

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0]
        const newCoords = { lat: parseFloat(lat), lng: parseFloat(lon) }
        setCoordinates(newCoords)
        setShowMap(true)

        // Get weather data from API
        const weatherResponse = await axios.get(
          `https://nasa-space-apps-1.onrender.com/climate?date=${predictionDate}&lat=${newCoords.lat}&lon=${newCoords.lng}`
        )
        const data = weatherResponse.data

        setWeatherData({
          temperature: `${data.values.temperature}°C`,
          precipitation: `${data.values.total_precipitation}mm/month`,
          snowfall: data.values.snowfall ? `${data.values.snowfall}mm/month` : 'No snowfall',
          windSpeed: `${data.values.wind_speed}km/h`,
          airQuality: {
            index: Math.min(100, data.values.aqi * 100),
            quality: (data.ai_classification.classification || []).find(c => c.includes('Air Quality')) || 'Good'
          },
          classification: data.ai_classification.classification || [],
          graphs: data.graphs || {},
          explanation: data.ai_classification.explanation || ''
        })
        
        // Show prediction controls after successful search
        setShowPredictionControls(true)
      }
    } catch (error) {
      console.error('Error:', error)
    }
    
    setIsLoading(false)
  }



  return (
    <div className="app-container">
      {/* Search and prediction controls */}
      <motion.div 
        className="search-container top-right"
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          isLoading={isLoading}
        />

        <AnimatePresence>
          {showPredictionControls && (
            <PredictionControls
              predictionDate={predictionDate}
              setPredictionDate={setPredictionDate}
              handlePrediction={async () => {
                // Validate date
                if (!predictionDate) {
                  alert('Please select a date for weather prediction');
                  return;
                }

                // Validate coordinates
                if (!coordinates.lat || !coordinates.lng) {
                  alert('Please select a location first');
                  return;
                }
                
                setIsLoading(true);
                try {
                  // Format date from YYYY-MM-DD to DD-MM-YYYY
                  const formattedDate = predictionDate.split('-').reverse().join('-');
                  const weatherUrl = `https://nasa-space-apps-1.onrender.com/climate?date=${formattedDate}&lat=${coordinates.lat}&lon=${coordinates.lng}`;
                  console.log('Fetching weather data from:', weatherUrl);
                  const weatherResponse = await axios.get(weatherUrl);
                  
                  if (!weatherResponse.data) {
                    throw new Error('No data received from the weather API');
                  }
                  
                  const data = weatherResponse.data;
                  console.log('Weather API response:', data);
                  
                  setWeatherData({
                    temperature: `${data.values.temperature}°C`,
                    precipitation: `${data.values.total_precipitation}mm/month`,
                    snowfall: data.values.snowfall ? `${data.values.snowfall}mm/month` : 'No snowfall',
                    windSpeed: `${data.values.wind_speed}km/h`,
                    airQuality: {
                      index: Math.min(100, data.values.aqi * 100),
                      quality: (data.ai_classification.classification || []).find(c => c.includes('Air Quality')) || 'Good'
                    },
                    classification: data.ai_classification.classification || [],
                    graphs: data.graphs || {},
                    explanation: data.ai_classification.explanation || '',
                    coordinates: coordinates
                  });
                } catch (error) {
                  console.error('Error fetching weather data:', error);
                  alert('Failed to fetch weather data. Please try again later.');
                }
                setIsLoading(false);
              }}
              isLoading={isLoading}
              coordinates={coordinates}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <div className="view-toggle">
        <button 
          className={`toggle-btn ${activeView === 'standard' ? 'active' : ''}`}
          onClick={() => setActiveView('standard')}
        >
          Standard View
        </button>
        <button 
          className={`toggle-btn ${activeView === 'satellite' ? 'active' : ''}`}
          onClick={() => setActiveView('satellite')}
        >
          Satellite View
        </button>
        <button 
          className={`toggle-btn ${activeView === 'night' ? 'active' : ''}`}
          onClick={() => setActiveView('night')}
        >
          Night View
        </button>
        <button 
          className={`toggle-btn ${activeView === 'topology' ? 'active' : ''}`}
          onClick={() => setActiveView('topology')}
        >
          Topology View
        </button>
      </div>

      <div className="visualization-container">
        <motion.div 
          ref={globeContainer} 
          className="globe-container"
          initial={{ opacity: 1 }}
          animate={{
            opacity: showMap ? 0 : 1,
            scale: showMap ? 0.8 : 1,
          }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Globe
            key={activeView}
            coordinates={coordinates}
            activeView={activeView}
            onGlobeReady={() => console.log('Globe ready')}
            globeRef={globeContainer}
          />
        </motion.div>
        <motion.div 
          ref={mapContainer} 
          className="map-container"
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{
            opacity: showMap ? 1 : 0,
            scale: showMap ? 1 : 1.2,
          }}
          transition={{ duration: 0.5 }}
        >
          {showMap && (
            <Map
              mapRef={mapContainer}
              coordinates={coordinates}
              setCoordinates={setCoordinates}
              activeView={activeView}
              vectorSource={vectorSource}
              vectorLayer={vectorLayer}
              map={map}
              setShowPredictionControls={setShowPredictionControls}
              setIsFullScreen={setIsFullScreen}
            />
          )}
        </motion.div>
        {showMap && (
          <motion.button
            className="back-to-globe"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              setShowMap(false)
              if (map.current) {
                map.current.setTarget(undefined)
              }
            }}
          >
            Return to Globe
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {weatherData && (
          <WeatherCard
            weatherData={weatherData}
            coordinates={coordinates}
            weatherCardSpring={weatherCardSpring}
            onClose={() => setWeatherData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}