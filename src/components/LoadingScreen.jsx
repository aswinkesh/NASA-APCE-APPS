import { motion } from 'framer-motion';
import styles from './LoadingScreen.module.css';

export default function LoadingScreen({ onClose }) {
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
      </div>
    </div>
  );
}