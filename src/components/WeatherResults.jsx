import { motion } from 'framer-motion';
import styles from './WeatherResults.module.css';

export default function WeatherResults({ weatherData, onClose }) {
  return (
    <motion.div 
      className={styles.resultsContainer}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3 }}
    >
      <button className={styles.closeButton} onClick={onClose}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      
      <div className={styles.content}>
        <div className={styles.section}>
          <h2>Weather Analysis</h2>
          <div className={styles.weatherGrid}>
            <div className={styles.weatherItem}>
              <span className={styles.label}>Temperature</span>
              <span className={styles.value}>{weatherData.temperature}</span>
            </div>
            <div className={styles.weatherItem}>
              <span className={styles.label}>Precipitation</span>
              <span className={styles.value}>{weatherData.precipitation}</span>
            </div>
            <div className={styles.weatherItem}>
              <span className={styles.label}>Wind Speed</span>
              <span className={styles.value}>{weatherData.windSpeed}</span>
            </div>
            <div className={styles.weatherItem}>
              <span className={styles.label}>Snowfall</span>
              <span className={styles.value}>{weatherData.snowfall}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Air Quality</h3>
          <div className={styles.aqiSection}>
            <div className={styles.aqiBar}>
              <div 
                className={styles.aqiFill} 
                style={{ width: `${weatherData.airQuality.index}%` }}
              />
            </div>
            <span className={styles.aqiValue}>{weatherData.airQuality.quality}</span>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Classification</h3>
          <div className={styles.classificationTags}>
            {weatherData.classification.map((cls, index) => (
              <span key={index} className={styles.tag}>{cls}</span>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3>Analysis</h3>
          <p className={styles.explanation}>{weatherData.explanation}</p>
        </div>

        <div className={styles.section}>
          <h3>Weather Graphs</h3>
          <div className={styles.graphsGrid}>
            {Object.entries(weatherData.graphs || {}).map(([key, url], index) => (
              <div key={key} className={styles.graphCard}>
                <img src={url} alt={`Weather graph ${index + 1}`} className={styles.graph} />
                <div className={styles.graphLabel}>Graph {index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}