import { motion } from 'framer-motion';
import { useState } from 'react';
import styles from './WeatherResults.module.css';

export default function WeatherResults({ weatherData, onClose }) {
  const locationName = weatherData.locationName;
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

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
      source: 'NASA Space Apps Climate API',
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
        'Explanation'
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
        metadata.explanation
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