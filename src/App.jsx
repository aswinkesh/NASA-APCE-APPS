import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpring, animated } from '@react-spring/web'
import * as THREE from 'three'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { fromLonLat } from 'ol/proj'
import { Style, Icon } from 'ol/style'
import { Point } from 'ol/geom'
import Feature from 'ol/Feature'
import axios from 'axios'
import 'ol/ol.css'
import './App.css'

export default function App() {
  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [coordinates, setCoordinates] = useState({ lat: 20, lng: 0 })
  const [weatherData, setWeatherData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeView, setActiveView] = useState('satellite')
  const [showMap, setShowMap] = useState(false)
  const [isPredictionMode, setIsPredictionMode] = useState(false)
  const [predictionDate, setPredictionDate] = useState('')

  // Refs
  const globeContainer = useRef(null)
  const mapContainer = useRef(null)
  const scene = useRef(null)
  const camera = useRef(null)
  const renderer = useRef(null)
  const earth = useRef(null)
  const map = useRef(null)
  const vectorSource = useRef(null)
  const vectorLayer = useRef(null)
  const animationFrameId = useRef(null)
  const marker = useRef(null)

  // Animation for the weather card
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

        // First rotate the globe to the location
        const phi = (90 - newCoords.lat) * (Math.PI / 180)
        const theta = (newCoords.lng + 180) * (Math.PI / 180)
        const radius = 5

        const startRotation = earth.current.rotation.y
        const targetRotation = -theta
        const duration = 1000
        const startTime = Date.now()

        const animateToLocation = () => {
          const progress = (Date.now() - startTime) / duration
          
          if (progress < 1) {
            earth.current.rotation.y = startRotation + (targetRotation - startRotation) * progress
            requestAnimationFrame(animateToLocation)
          } else {
            // After globe rotation, show the map
            setShowMap(true)
            setTimeout(() => {
              // Initialize map after transition
              if (!map.current && mapContainer.current) {
                vectorSource.current = new VectorSource()
                vectorLayer.current = new VectorLayer({
                  source: vectorSource.current,
                  style: new Style({
                    image: new Icon({
                      anchor: [0.5, 1],
                      src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23FF0000" d="M12 0C7.6 0 4 3.6 4 8c0 7 8 16 8 16s8-9 8-16c0-4.4-3.6-8-8-8zm0 11c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/></svg>',
                      scale: 1
                    })
                  })
                })

                map.current = new Map({
                  target: mapContainer.current,
                  layers: [
                    new TileLayer({
                      source: new XYZ({
                        url: activeView === 'satellite' 
                          ? 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                          : 'https://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
                        maxZoom: 19,
                        crossOrigin: 'anonymous'
                      })
                    }),
                    vectorLayer.current
                  ],
                  view: new View({
                    center: fromLonLat([newCoords.lng, newCoords.lat]),
                    zoom: 12,
                    minZoom: 2,
                    maxZoom: 19
                  }),
                  controls: []
                })
              } else {
                // Update existing map view
                map.current.getView().animate({
                  center: fromLonLat([newCoords.lng, newCoords.lat]),
                  zoom: 12,
                  duration: 1000
                })
              }

              // Update marker
              vectorSource.current.clear()
              const marker = new Feature({
                geometry: new Point(fromLonLat([newCoords.lng, newCoords.lat]))
              })
              vectorSource.current.addFeature(marker)
            }, 500)
          }
        }
        
        animateToLocation()


        // Get weather data from API
        let weatherUrl =`https://nasa-space-apps-1.onrender.com/climate?date=${predictionDate}&lat=${newCoords.lat}&lon=${newCoords.lng}`
          

        const weatherResponse = await axios.get(weatherUrl)
        const data = weatherResponse.data

        const weatherData = {
          temperature: `${data.values.temperature}°C`,
          feelsLike: `${data.values.temperature}°C`,
          condition: data.ai_classification.classification.join(', '),
          rainChance: `${data.values.total_precipitation}mm/month`,
          humidity: `${data.values.total_precipitation}mm/month`,
          windSpeed: `${data.values.wind_speed}km/h`,
          airQuality: {
            index: Math.min(100, data.values.aqi * 100),
            quality: data.ai_classification.classification.find(c => c.includes('Air Quality')) || 'Good'
          },
          graphs: data.graphs,
          explanation: data.ai_classification.explanation
        }
        setWeatherData(weatherData)
      }
    } catch (error) {
      console.error('Error:', error)
    }
    
    setIsLoading(false)
  }

  useEffect(() => {
    if (!globeContainer.current) {
      console.error('Globe container not found');
      return;
    }
    console.log('Initializing globe...');

    try {
      // Initialize Three.js scene
    scene.current = new THREE.Scene()
    camera.current = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    renderer.current = new THREE.WebGLRenderer({ antialias: true, alpha: true })

    // Set up renderer
    renderer.current.setSize(window.innerWidth, window.innerHeight)
    renderer.current.setPixelRatio(window.devicePixelRatio)
    renderer.current.setClearColor(0x000000, 1)
    globeContainer.current.innerHTML = ''
    globeContainer.current.appendChild(renderer.current.domElement)
    
    // Set initial scene background
    scene.current.background = new THREE.Color(0x000000)

    // Create Earth
    const geometry = new THREE.SphereGeometry(5, 64, 64)
    const loader = new THREE.TextureLoader()

    // Load Earth textures based on active view
    const textureUrl = activeView === 'satellite'
      ? 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
      : 'https://unpkg.com/three-globe/example/img/earth-day.jpg'

    loader.load(textureUrl, (texture) => {
      console.log('Texture loaded successfully')
      const material = new THREE.MeshPhongMaterial({
        map: texture,
        bumpMap: texture,
        bumpScale: 0.05,
      })
      earth.current = new THREE.Mesh(geometry, material)
      scene.current.add(earth.current)
    })

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.current.add(ambientLight)

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 3, 5)
    scene.current.add(directionalLight)

    // Position camera
    camera.current.position.z = 15

    // Add marker for searched location
    const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16)
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    marker.current = new THREE.Mesh(markerGeometry, markerMaterial)
    marker.current.visible = false
    scene.current.add(marker.current)

    // Animation loop
    const animate = () => {
      if (earth.current) {
        earth.current.rotation.y += 0.001
      }
      renderer.current.render(scene.current, camera.current)
      animationFrameId.current = requestAnimationFrame(animate)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (camera.current && renderer.current) {
        camera.current.aspect = window.innerWidth / window.innerHeight
        camera.current.updateProjectionMatrix()
        renderer.current.setSize(window.innerWidth, window.innerHeight)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      if (globeContainer.current) {
        globeContainer.current.innerHTML = ''
      }
      if (map.current) {
        map.current.setTarget(undefined)
      }
      scene.current = null
      camera.current = null
      renderer.current = null
      earth.current = null
    }
    } catch (error) {
      console.error('Error initializing globe:', error);
    }
  }, [showMap, activeView])

  // Update marker position when coordinates change
  useEffect(() => {
    if (!earth.current || !marker.current) return

    // Convert lat/lng to 3D position
    const phi = (90 - coordinates.lat) * (Math.PI / 180)
    const theta = (coordinates.lng + 180) * (Math.PI / 180)
    const radius = 5

    const position = new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    )

    marker.current.position.copy(position)
    marker.current.visible = true
  }, [coordinates])

  return (
    <div className="app-container">
      <motion.div 
        className="search-container"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-controls">
            <div className="prediction-controls">
              <motion.input
                type="date"
                value={predictionDate}
                onChange={(e) => setPredictionDate(e.target.value)}
                className="date-input"
              />
              <motion.button
                className="predict-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async (e) => {
                  e.preventDefault();
                  if (!coordinates.lat || !predictionDate) return;
                  
                  setIsLoading(true);
                  try {
                    // Format date from YYYY-MM-DD to DD-MM-YYYY
                    const formattedDate = predictionDate.split('-').reverse().join('-');
                    const weatherUrl = `https://nasa-space-apps-1.onrender.com/climate?date=${formattedDate}&lat=${coordinates.lat}&lon=${coordinates.lng}`;
                    console.log('Fetching prediction for:', {
                      date: formattedDate,
                      latitude: coordinates.lat,
                      longitude: coordinates.lng,
                      url: weatherUrl
                    });
                    const weatherResponse = await axios.get(weatherUrl);
                    const data = weatherResponse.data;
                    
                    console.log('Prediction response:', data);
                    
                    setWeatherData({
                      ...data,
                      temperature: `${data.values.temperature}°C`,
                      feelsLike: `${data.values.temperature}°C`,
                      condition: data.ai_classification.classification.join(', '),
                      rainChance: `${data.values.total_precipitation}mm/month`,
                      humidity: `${data.values.total_precipitation}mm/month`,
                      windSpeed: `${data.values.wind_speed}km/h`,
                      airQuality: {
                        index: Math.min(100, data.values.aqi * 100),
                        quality: data.ai_classification.classification.find(c => c.includes('Air Quality')) || 'Good'
                      },
                      coordinates: coordinates
                    });
                  } catch (error) {
                    console.error('Error:', error);
                  }
                  setIsLoading(false);
                }}
                disabled={!coordinates.lat || !predictionDate || isLoading}
              >
                {isLoading ? 'Predicting...' : 'Predict Weather'}
              </motion.button>
            </div>
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
                disabled={isLoading || (isPredictionMode && !predictionDate)}
              >
                {isLoading ? 'Searching...' : 'Search'}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>

      <div className="view-toggle">
        <button 
          className={`toggle-btn ${activeView === 'globe' ? 'active' : ''}`}
          onClick={() => setActiveView('globe')}
        >
          Standard View
        </button>
        <button 
          className={`toggle-btn ${activeView === 'satellite' ? 'active' : ''}`}
          onClick={() => setActiveView('satellite')}
        >
          Satellite View
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
        />
        <motion.div 
          ref={mapContainer} 
          className="map-container"
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{
            opacity: showMap ? 1 : 0,
            scale: showMap ? 1 : 1.2,
          }}
          transition={{ duration: 0.5 }}
        />
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
          <animated.div style={weatherCardSpring} className="weather-card">
            <div className="location-info">
              <h3>Location Details</h3>
              <div className="coordinates">
                <div className="coordinate-item">
                  <div className="coordinate-label">Latitude</div>
                  <div className="coordinate-value">{coordinates.lat.toFixed(4)}°</div>
                </div>
                <div className="coordinate-item">
                  <div className="coordinate-label">Longitude</div>
                  <div className="coordinate-value">{coordinates.lng.toFixed(4)}°</div>
                </div>
              </div>
            </div>
            <div className="weather-header">
              <h2>Weather Information</h2>
              <div className="current-temp">{weatherData.temperature}</div>
            </div>
            
            <div className="weather-details">
              <div className="detail-item">
                <span className="label">Feels Like</span>
                <span className="value">{weatherData.feelsLike}</span>
              </div>
              <div className="detail-item">
                <span className="label">Humidity</span>
                <span className="value">{weatherData.humidity}</span>
              </div>
              <div className="detail-item">
                <span className="label">Wind Speed</span>
                <span className="value">{weatherData.windSpeed}</span>
              </div>
              <div className="detail-item">
                <span className="label">Rain Chance</span>
                <span className="value">{weatherData.rainChance}</span>
              </div>
            </div>

            <div className="air-quality">
              <h3>Air Quality</h3>
              <div className="aqi-indicator">
                <div 
                  className="aqi-bar" 
                  style={{ 
                    width: `${weatherData.airQuality.index}%`,
                    backgroundColor: weatherData.airQuality.index < 50 ? '#4ade80' : '#fb923c'
                  }}
                />
                <span className="aqi-text">{weatherData.airQuality.quality}</span>
              </div>
            </div>

            {weatherData.explanation && (
              <div className="weather-explanation">
                <h3>Analysis</h3>
                <p>{weatherData.explanation}</p>
              </div>
            )}
            {weatherData.graphs && (
              <div className="weather-graphs">
                <h3>Climate Graphs</h3>
                <div className="graphs-container">
                  <img src={`https://nasa-space-apps-1.onrender.com${weatherData.graphs.temperature}`} alt="Temperature Graph" />
                  <img src={`https://nasa-space-apps-1.onrender.com${weatherData.graphs.total_precipitation}`} alt="Precipitation Graph" />
                  <img src={`https://nasa-space-apps-1.onrender.com${weatherData.graphs.wind_speed}`} alt="Wind Speed Graph" />
                  <img src={`https://nasa-space-apps-1.onrender.com${weatherData.graphs.aqi}`} alt="Air Quality Graph" />
                </div>
              </div>
            )}
          </animated.div>
        )}
      </AnimatePresence>
    </div>
  )
}