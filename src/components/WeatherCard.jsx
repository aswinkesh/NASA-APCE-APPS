import { motion, AnimatePresence } from 'framer-motion'
import { animated } from '@react-spring/web'

export default function WeatherCard({ weatherData, coordinates, weatherCardSpring, onClose }) {
  if (!weatherData) return null

  return (
    <animated.div style={weatherCardSpring} className="weather-card">
      <button 
        className="close-button" 
        onClick={onClose}
        aria-label="Close weather information"
      >
        ×
      </button>

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

      <div className="weather-classification">
        {Array.isArray(weatherData.classification) && weatherData.classification.map((class_type, index) => (
          <div key={index} className="classification-tag">
            {class_type}
          </div>
        ))}
      </div>

      <div className="weather-details">
        <div className="detail-item">
          <span className="label">Temperature</span>
          <span className="value">{weatherData.temperature}</span>
        </div>
        <div className="detail-item">
          <span className="label">Precipitation</span>
          <span className="value">{weatherData.precipitation}</span>
        </div>
        <div className="detail-item">
          <span className="label">Snowfall</span>
          <span className="value">{weatherData.snowfall}</span>
        </div>
        <div className="detail-item">
          <span className="label">Wind Speed</span>
          <span className="value">{weatherData.windSpeed}</span>
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
          <h3>Climate Analysis Graphs</h3>
          <div className="graphs-container">
            <div className="graph-item">
              <h4>Temperature Analysis</h4>
              <img src={`https://nasa-space-apps-1.onrender.com${weatherData.graphs.temperature}`} alt="Temperature Graph" />
            </div>
            <div className="graph-item">
              <h4>Precipitation Analysis</h4>
              <img src={`https://nasa-space-apps-1.onrender.com${weatherData.graphs.total_precipitation}`} alt="Total Precipitation Graph" />
            </div>
            <div className="graph-item">
              <h4>Snowfall Analysis</h4>
              <img src={`https://nasa-space-apps-1.onrender.com${weatherData.graphs.snowfall}`} alt="Snowfall Graph" />
            </div>
            <div className="graph-item">
              <h4>Wind Speed Analysis</h4>
              <img src={`https://nasa-space-apps-1.onrender.com${weatherData.graphs.wind_speed}`} alt="Wind Speed Graph" />
            </div>
            <div className="graph-item">
              <h4>Air Quality Index (AQI)</h4>
              <img src={`https://nasa-space-apps-1.onrender.com${weatherData.graphs.aqi}`} alt="Air Quality Graph" />
            </div>
            <div className="data-source">
              <p>Data Source: NASA DISC - <a href="https://disc.gsfc.nasa.gov/data-access" target="_blank" rel="noopener noreferrer">GSFC Data Access</a></p>
            </div>
          </div>
        </div>
      )}
    </animated.div>
  )
}