import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import styles from './WeatherResults.module.css';

const ANIMATION_DURATION = 20000; // 5 seconds

export default function WeatherResults({ weatherData, onClose }) {
  const locationName = weatherData.locationName;
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [showAnimation, setShowAnimation] = useState(true);
  
  useEffect(() => {
    // Hide animation after ANIMATION_DURATION
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, ANIMATION_DURATION);

    return () => clearTimeout(timer);
  }, []);

  const getWeatherAnimation = () => {
    const classifications = weatherData.classification || [];
    
    if (classifications.includes('Very Hot')) {
      return (
        <div className={`${styles.weatherAnimation} ${styles.sunAnimation}`}>
          {/* Add extra sun rays */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                width: '4px',
                height: '50px',
                background: 'rgba(255, 165, 0, 0.4)',
                transformOrigin: 'bottom',
                transform: `translate(-50%, -100%) rotate(${i * 45}deg)`
              }}
            />
          ))}
        </div>
      );
    }

    if (classifications.includes('Very Wet')) {
      return (
        <div className={`${styles.weatherAnimation} ${styles.rainAnimation}`}>
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className={styles.rainDrop}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1.5}s`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.4 + 0.6
              }}
            />
          ))}
        </div>
      );
    }

    if (classifications.includes('Very Snowy')) {
      return (
        <div className={`${styles.weatherAnimation} ${styles.snowAnimation}`}>
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={styles.snowflake}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                fontSize: `${Math.random() * 10 + 10}px`
              }}
            >
              ❄
            </div>
          ))}
        </div>
      );
    }

    if (classifications.includes('Very Windy')) {
      return (
        <div className={`${styles.weatherAnimation} ${styles.windAnimation}`}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={styles.windLine}
              style={{
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 100 + 50}px`,
                opacity: Math.random() * 0.5 + 0.2,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      );
    }

    if (classifications.includes('Very Cold')) {
      return (
        <div className={`${styles.weatherAnimation} ${styles.frostAnimation}`}>
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={styles.frostCrystal}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      );
    }

    if (classifications.includes('Very Uncomfortable')) {
      return (
        <div className={`${styles.weatherAnimation} ${styles.uncomfortableAnimation}`}>
          <div className={styles.uncomfortableSun} />
          <div className={styles.uncomfortableRing} />
          <div className={styles.uncomfortableWind}>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={styles.windStreak}
                style={{
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 200 + 100}px`,
                  opacity: Math.random() * 0.5 + 0.3,
                  animationDelay: `${Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 20 - 10}deg) translateX(-100%)`
                }}
              />
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const downloadData = (format) => {
    // Helper function to extract numeric values from strings with units
    const extractNumericValue = (str) => {
      if (!str) return 0;
      const matches = str.toString().match(/[\d.]+/);
      return matches ? parseFloat(matches[0]) : 0;
    };

    const currentDate = new Date().toISOString().split('T')[0];
    
    const metadata = {
      date: weatherData.date || currentDate,
      location: {
        name: weatherData.locationName || 'Unknown Location',
        latitude: weatherData.coordinates?.lat || 0,
        longitude: weatherData.coordinates?.lng || 0
      },
      source: {
        name: 'NASA Space Apps Climate API',
        details: 'Data derived from NASA satellite observations and climate models',
        apiEndpoint: 'https://nasa-space-apps-1.onrender.com/climate',
        dataDate: weatherData.date || currentDate,
        attribution: 'Powered by NASA Earth Science Data',
        datasets: [
          'NASA POWER (Prediction of Worldwide Energy Resources)',
          'NASA NEO (NASA Earth Observations)',
          'GEOS-5 Atmospheric Data'
        ]
      },
      values: {
        temperature: {
          value: extractNumericValue(weatherData.temperature),
          unit: '°C'
        },
        precipitation: {
          value: extractNumericValue(weatherData.precipitation),
          unit: 'mm/month'
        },
        snowfall: {
          value: extractNumericValue(weatherData.snowfall),
          unit: 'mm/month'
        },
        windSpeed: {
          value: extractNumericValue(weatherData.windSpeed),
          unit: 'km/h'
        },
        airQuality: {
          index: weatherData.airQuality?.index || 0,
          quality: weatherData.airQuality?.quality || 'Unknown'
        }
      },
      classification: weatherData.classification,
      explanation: weatherData.explanation
    };

    if (format === 'json') {
      const jsonString = JSON.stringify(metadata, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'weather-data.json';
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // Define headers and corresponding values
      const headers = [
        'Date',
        'Location',
        'Latitude',
        'Longitude',
        'Temperature (°C)',
        'Precipitation (mm/month)',
        'Snowfall (mm/month)',
        'Wind Speed (km/h)',
        'Air Quality Index',
        'Air Quality Status',
        'Classifications',
        'Explanation',
        'Data Source',
        'Source Details',
        'API Endpoint',
        'Data Collection Date',
        'Attribution',
        'Source Datasets'
      ];

      const values = [
        metadata.date,
        metadata.location.name,
        metadata.location.latitude,
        metadata.location.longitude,
        metadata.values.temperature.value,
        metadata.values.precipitation.value,
        metadata.values.snowfall.value,
        metadata.values.windSpeed.value,
        metadata.values.airQuality.index,
        metadata.values.airQuality.quality,
        metadata.classification.join('; '),
        metadata.explanation,
        metadata.source.name,
        metadata.source.details,
        metadata.source.apiEndpoint,
        metadata.source.dataDate,
        metadata.source.attribution,
        metadata.source.datasets.join('; ')
      ];

      // Function to escape and format CSV cell
      const formatCSVCell = (cell) => {
        if (typeof cell === 'string') {
          const escaped = cell.replace(/"/g, '""');
          return /[,"\n\r;]/.test(cell) ? `"${escaped}"` : escaped;
        }
        return cell;
      };

      // Create CSV content with headers and single row of values
      const csvContent = [
        headers.join(','),
        values.map(formatCSVCell).join(',')
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'weather-data.csv';
      a.click();
      URL.revokeObjectURL(url);
    }

    setShowDownloadOptions(false);
  };
  return (
    <motion.div 
      className={styles.resultsContainer}
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {getWeatherAnimation()}
          </motion.div>
        )}
      </AnimatePresence>
      <div className={styles.headerButtons}>
        <div className={styles.downloadContainer}>
          <button 
            className={styles.downloadButton} 
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            title="Download Data"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15V3M12 15L8 11M12 15L16 11M3 15V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {showDownloadOptions && (
            <div className={styles.downloadOptions}>
              <button onClick={() => downloadData('json')}>Download JSON</button>
              <button onClick={() => downloadData('csv')}>Download CSV</button>
            </div>
          )}
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div className={styles.content}>
        <div className={styles.section}>
          <h2>Weather Analysis</h2>
          <h3 className={styles.locationName}>{weatherData.locationName}</h3>
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
            {weatherData.graphs && weatherData.graphs.length > 0 ? (
              weatherData.graphs.map((graph, index) => (
                <div key={graph.id} className={styles.graphCard}>
                  <div className={styles.graphHeader}>
                    <div className={styles.graphLabel}>{graph.title}</div>
                    <button 
                      className={styles.graphDownloadButton}
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = graph.url;
                        a.download = `${graph.title.toLowerCase().replace(/ /g, '_')}.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                      title="Download Graph"
                    >
                      Download
                    </button>
                  </div>
                  <img 
                    src={graph.url} 
                    alt={graph.title} 
                    className={styles.graph}
                    onError={(e) => {
                      console.error(`Failed to load graph: ${graph.url}`);
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiMxYTFhMWEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9XCJBcmlhbFwiIGZvbnQtc2l6ZT1cIjE0XCI+VW5hYmxlIHRvIGxvYWQgZ3JhcGguPC90ZXh0PjwvcmVjdD48L3N2Zz4=';
                      e.target.classList.add(styles.errorGraph);
                    }}
                  />
                  <div className={styles.graphLabel}>{graph.title}</div>
                </div>
              ))
            ) : (
              <div className={styles.noGraphs}>No graphs available</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}