import { motion } from 'framer-motion'

export default function PredictionControls({ 
  predictionDate, 
  setPredictionDate, 
  handlePrediction, 
  isLoading, 
  coordinates 
}) {
  return (
    <motion.div 
      className="prediction-controls"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
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
        onClick={handlePrediction}
        disabled={!coordinates.lat || !predictionDate || isLoading}
      >
        {isLoading ? 'Predicting...' : 'Predict Weather'}
      </motion.button>
    </motion.div>
  )
}