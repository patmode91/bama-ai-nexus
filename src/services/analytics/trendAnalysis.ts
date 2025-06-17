/**
 * Calculates the moving average of a series of numbers.
 * @param data An array of numbers.
 * @param windowSize The size of the moving average window.
 * @returns An array of moving averages. Returns an empty array if windowSize is invalid or data is too short.
 */
export function calculateMovingAverage(data: number[], windowSize: number): number[] {
  if (windowSize <= 0 || windowSize > data.length) {
    console.warn('Invalid window size for moving average. Must be > 0 and <= data length.');
    return [];
  }

  const result: number[] = [];
  for (let i = 0; i <= data.length - windowSize; i++) {
    const window = data.slice(i, i + windowSize);
    const average = window.reduce((sum, val) => sum + val, 0) / windowSize;
    result.push(average);
  }
  return result;
}

export interface DataPoint {
  x: number;
  y: number;
}

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  predict: (x: number) => number;
  rSquared: number;
  trendDirection: 'upward' | 'downward' | 'stable';
  trendStrength?: number; // Could be based on slope magnitude or rSquared
}

/**
 * Calculates linear regression for a series of data points.
 * y = mx + b
 * @param data An array of DataPoint objects ({x, y}).
 * @returns An object containing the slope (m), intercept (b), a predict function, and R-squared.
 * Returns null if data is insufficient (less than 2 points).
 */
export function calculateLinearRegression(data: DataPoint[]): LinearRegressionResult | null {
  if (data.length < 2) {
    console.warn('Insufficient data for linear regression. Need at least 2 points.');
    return null;
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0; // For R-squared
  const n = data.length;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumXX += point.x * point.x;
    sumYY += point.y * point.y;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared (coefficient of determination)
  const rSquaredNumerator = Math.pow((n * sumXY - sumX * sumY), 2);
  const rSquaredDenominator = (n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY);
  const rSquared = rSquaredDenominator === 0 ? 1 : rSquaredNumerator / rSquaredDenominator; // Handle perfect correlation or flat line

  const predict = (x: number): number => slope * x + intercept;

  let trendDirection: 'upward' | 'downward' | 'stable';
  // Define thresholds for 'stable' based on slope, could be adjusted
  const STABILITY_THRESHOLD = 0.05; // Example: if slope is between -0.05 and 0.05, consider it stable relative to data scale

  // A more robust stability check might consider the scale of y values or percentage change.
  // For now, a simple check on slope magnitude.
  if (Math.abs(slope) < STABILITY_THRESHOLD) {
    trendDirection = 'stable';
  } else if (slope > 0) {
    trendDirection = 'upward';
  } else {
    trendDirection = 'downward';
  }

  return {
    slope,
    intercept,
    predict,
    rSquared,
    trendDirection,
    trendStrength: Math.abs(slope) * rSquared // Example strength metric
  };
}

/**
 * Example usage:
const timeSeriesData = [
  { x: 1, y: 2 }, { x: 2, y: 4 }, { x: 3, y: 5 }, { x: 4, y: 4 }, { x: 5, y: 6 },
  { x: 6, y: 8 }, { x: 7, y: 7 }, { x: 8, y: 9 }, { x: 9, y: 11 }, { x: 10, y: 10 }
];
const regressionResult = calculateLinearRegression(timeSeriesData);
if (regressionResult) {
  console.log(`Slope: ${regressionResult.slope}, Intercept: ${regressionResult.intercept}`);
  console.log(`R-squared: ${regressionResult.rSquared}`);
  console.log(`Prediction for x=11: ${regressionResult.predict(11)}`);
  console.log(`Trend Direction: ${regressionResult.trendDirection}`);
}

const numericalData = [10, 12, 11, 13, 14, 15, 13, 16, 17, 18];
const movingAvg = calculateMovingAverage(numericalData, 3);
console.log('Moving Averages (window 3):', movingAvg); // [ 11, 12, 12.66..., 14, 14.66..., 14.66..., 15.33..., 17 ]
 */
