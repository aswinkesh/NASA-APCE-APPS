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
import WeatherResults from './components/WeatherResults'
import LoadingScreen from './components/LoadingScreen'

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
  const [locationName, setLocationName] = useState('')
  const [isFirstView, setIsFirstView] = useState(true)

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
        const location = response.data[0];
        const newCoords = { lat: parseFloat(location.lat), lng: parseFloat(location.lon) };
        const formattedName = location.display_name;
        setLocationName(formattedName);
        setCoordinates(newCoords);
        setShowMap(true);
        
        // Show prediction controls after successful search
        setShowPredictionControls(true);
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="app-container">
      <div className="watermark">WeatherDoc by NovaSpark</div>
      {/* Search and prediction controls */}
      <motion.div 
        className={`search-container top-right ${weatherData ? 'hidden' : ''}`}
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
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
                  // Get location name from coordinates
                  const locationResponse = await axios.get(
                    'https://nominatim.openstreetmap.org/reverse',
                    {
                      params: {
                        lat: coordinates.lat,
                        lon: coordinates.lng,
                        format: 'json'
                      },
                      headers: {
                        'User-Agent': 'WeatherApp/1.0'
                      }
                    }
                  );

                  const locationData = locationResponse.data;
                  let locationName = '';
                  if (locationData) {
                    // Extract the most relevant name (usually city/town/village)
                    const addressParts = [];
                    if (locationData.address) {
                      const address = locationData.address;
                      // Try to get the most specific location name
                      const specificLocation = 
                        address.city || 
                        address.town || 
                        address.village || 
                        address.suburb ||
                        address.municipality;
                      if (specificLocation) addressParts.push(specificLocation);
                      if (address.state) addressParts.push(address.state);
                      if (address.country) addressParts.push(address.country);
                    }
                    locationName = addressParts.length > 0 ? addressParts.join(', ') : locationData.display_name;
                  }
                  
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
                  
                  console.log('Raw graphs data:', data.graphs);
                  const processedData = {
                    temperature: `${data.values.temperature}°C`,
                    precipitation: `${data.values.total_precipitation}mm/month`,
                    snowfall: data.values.snowfall ? `${data.values.snowfall}mm/month` : 'No snowfall',
                    windSpeed: `${data.values.wind_speed}km/h`,
                    airQuality: {
                      index: Math.min(100, data.values.aqi * 100),
                      quality: (data.ai_classification.classification || []).find(c => c.includes('Air Quality')) || 'Good'
                    },
                    classification: data.ai_classification.classification || [],
                    explanation: data.ai_classification.explanation || '',
                    coordinates: coordinates,
                    locationName: locationName || 'Unknown Location',
                    locationName: locationName,
                    graphs: []
                  };

                  // Process graphs if they exist
                  if (data.graphs && typeof data.graphs === 'object') {
                    processedData.graphs = Object.entries(data.graphs).map(([key, url]) => ({
                      id: key,
                      url: url.startsWith('http') ? url : `https://nasa-space-apps-1.onrender.com${url}`,
                      title: key.replace(/_/g, ' ').split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')
                    }));
                  }
                  
                  console.log('Processed weather data:', processedData);
                  setWeatherData(processedData);
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
        <div>
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
        <div className="dimension-toggle">
          <button 
            className={`toggle-btn ${showMap ? 'active' : ''}`}
            disabled={isLoading || weatherData}
            onClick={async () => {
              if (isLoading) {
                return;
              }

              // If showing weather results and switching to 3D
              if (showMap && weatherData) {
                setWeatherData(null); // Close the prediction results
                setTimeout(() => {
                  setShowMap(false);
                  if (map.current) {
                    map.current.setTarget(undefined);
                  }
                }, 300); // Wait for results to fade out
                return;
              }

              // Normal toggle behavior
              if (showMap) {
                setShowMap(false);
                if (map.current) {
                  map.current.setTarget(undefined);
                }
              } else {
                if (isFirstView) {
                  try {
                    const response = await axios.get(
                      `https://nominatim.openstreetmap.org/search`,
                      {
                        params: {
                          q: 'Kottayam, Kerala, India',
                          format: 'json',
                          limit: 1
                        },
                        headers: {
                          'User-Agent': 'WeatherApp/1.0'
                        }
                      }
                    );
                    if (response.data.length > 0) {
                      const location = response.data[0];
                      setCoordinates({ 
                        lat: parseFloat(location.lat), 
                        lng: parseFloat(location.lon) 
                      });
                      setLocationName(location.display_name);
                      setShowPredictionControls(true);
                    }
                    setIsFirstView(false);
                  } catch (error) {
                    console.error('Error setting default location:', error);
                  }
                }
                setShowMap(true);
              }
            }}
          >
            {showMap ? '3D' : '2D'}
          </button>
          {/* Show tooltip when loading or weather results are shown */}
          {(isLoading || weatherData) && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: 'var(--background-dark)',
                color: 'var(--text-primary)',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                marginTop: '8px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000
              }}
            >
              Close prediction window to enable 3D view
            </div>
          )}
        </div>
      </div>

      <div className={`visualization-container ${isLoading || weatherData ? 'split' : ''}`}>
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
            coordinates={coordinates}
            activeView={activeView}
            onGlobeReady={() => console.log('Globe ready')}
            globeRef={globeContainer}
            onZoomThreshold={() => {
              // Wait for rotation animation to complete before showing map
              setTimeout(() => setShowMap(true), 1000);
            }}
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
              setLocationName={setLocationName}
            />
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {isLoading ? (
          <LoadingScreen onClose={() => setIsLoading(false)} />
        ) : weatherData ? (
          <WeatherResults
            weatherData={weatherData}
            locationName={locationName}
            onClose={() => setWeatherData(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}