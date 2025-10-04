import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import styles from './LoadingScreen.module.css';

const weatherFacts = [
  "Lightning is hotter than the sun's surface.",
  "Raindrops aren't actually tear-shaped.",
  "The highest temperature ever recorded is 56.7°C.",
  "Snow can be any color, including pink or orange.",
  "A rainbow can only appear when the sun is behind you.",
  "The coldest place on Earth is Antarctica.",
  "Hurricanes can release more energy than nuclear bombs.",
  "Some deserts are cold, not hot.",
  "Thunder is the sound of lightning heating the air.",
  "Clouds can weigh millions of kilograms.",
  "Tornadoes can spin faster than 480 km/h.",
  "There are over 10 types of clouds.",
  "The smell of rain is called petrichor.",
  "A sunshower happens when rain falls during sunshine.",
  "Snowflakes always have six sides.",
  "Fog is just a cloud on the ground.",
  "Some places get rain made of diamonds — on Neptune and Saturn!",
  "Hailstones can be larger than a cricket ball.",
  "Weather on Mount Everest can drop below -60°C.",
  "Rain has different scents depending on the soil type.",
  "The world's rainiest place is Mawsynram, India.",
  "Acid rain can damage buildings and forests.",
  "Rainbows form when sunlight refracts through rain droplets.",
  "Rain can fall at speeds up to 30 km/h."
];

const networkMessages = [
  "Processing data...",
  "Network latency detected, please wait...",
  "Syncing with weather servers...",
  "Large dataset incoming...",
  "Optimizing connection...",
  "Fetching satellite data..."
];

export default function LoadingScreen({ onClose }) {
  const [currentFact, setCurrentFact] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    // Change weather fact every 5 seconds
    const factInterval = setInterval(() => {
      const randomFact = weatherFacts[Math.floor(Math.random() * weatherFacts.length)];
      setCurrentFact(randomFact);
    }, 10000);

    // Show network messages randomly (30% chance every 3 seconds)
    const messageInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance
        const randomMessage = networkMessages[Math.floor(Math.random() * networkMessages.length)];
        setCurrentMessage(randomMessage);
        // Clear message after 2 seconds
        setTimeout(() => setCurrentMessage(''), 2000);
      }
    }, 3000);

    // Set initial fact
    setCurrentFact(weatherFacts[Math.floor(Math.random() * weatherFacts.length)]);

    return () => {
      clearInterval(factInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className={styles.loadingContainer}>
      <button 
        onClick={onClose}
        className={styles.closeButton}
        aria-label="Close loading screen"
      >
        ×
      </button>
      <div className={styles.content}>
        <div className={styles.mainContent}>
          {/* Loading Icon */}
          <motion.div
            className={styles.weatherIcon}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <motion.path
                d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.circle
                cx="12"
                cy="12"
                r="5"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1.2 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
            </svg>
          </motion.div>

          {/* Loading Steps */}
          <motion.div
            className={styles.loadingText}
            animate={{
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <h2>Analyzing Weather Patterns</h2>
            <div className={styles.loadingSteps}>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Gathering meteorological data...
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                Processing satellite imagery...
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                Calculating predictions...
              </motion.p>
            </div>
          </motion.div>

          {/* Weather Facts */}
          <motion.div
            className={styles.weatherFact}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key={currentFact}
          >
            <h3>Did you know?</h3>
            <p>{currentFact}</p>
          </motion.div>

          {/* Network Messages */}
          <AnimatePresence>
            {currentMessage && (
              <motion.div
                className={styles.networkMessage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <p>{currentMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}