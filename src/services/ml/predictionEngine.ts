
import * as tf from '@tensorflow/tfjs';
import { supabase } from '@/integrations/supabase/client';

tf.ENV.set('WEBGL_PACK', false);

export class PredictionEngine {
  private static instance: PredictionEngine;
  private model: tf.LayersModel | null = null;
  private modelVersion: string = '1.0.0';
  private isTraining: boolean = false;
  private readonly MODEL_KEY = 'bama-ai-prediction-model';
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): PredictionEngine {
    if (!PredictionEngine.instance) {
      PredictionEngine.instance = new PredictionEngine();
    }
    return PredictionEngine.instance;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Check if we have a valid Supabase configuration
      if (!supabase) {
        console.warn('Supabase not configured, skipping prediction engine initialization');
        return;
      }
      
      await this.loadModel();
      this.isInitialized = true;
      console.log('Prediction engine initialized');
    } catch (error) {
      console.error('Failed to initialize prediction engine:', error);
      try {
        await this.trainNewModel();
        this.isInitialized = true;
      } catch (trainError) {
        console.error('Failed to train new model:', trainError);
        // Initialize with default model as fallback
        await this.initializeDefaultModel();
        this.isInitialized = true;
      }
    }
  }

  private async loadModel() {
    try {
      // Try to load model from IndexedDB
      const models = await tf.io.listModels();
      const modelInfo = models[this.MODEL_KEY];
      
      if (modelInfo) {
        this.model = await tf.loadLayersModel(`indexeddb://${this.MODEL_KEY}`);
        console.log('Model loaded from IndexedDB');
      } else {
        await this.trainNewModel();
      }
    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    }
  }

  private async trainNewModel() {
    if (this.isTraining) return;
    this.isTraining = true;
    
    try {
      console.log('Training new prediction model...');
      
      // Fetch training data from Supabase if available
      let trainingData = null;
      try {
        const { data, error } = await supabase
          .from('training_data')
          .select('*')
          .limit(1000);

        if (!error && data && data.length > 0) {
          trainingData = data;
        }
      } catch (supabaseError) {
        console.warn('Could not fetch training data from Supabase:', supabaseError);
      }

      if (!trainingData || trainingData.length === 0) {
        console.warn('No training data available, using default model');
        await this.initializeDefaultModel();
        return;
      }

      // Preprocess data
      const { features, labels } = this.preprocessData(trainingData);
      
      // Create and train model
      this.model = this.createModel(features[0].length);
      
      await this.model.fit(tf.tensor2d(features), tf.tensor1d(labels), {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs?.loss}, accuracy = ${logs?.acc}`);
          }
        }
      });

      // Save model to IndexedDB
      await this.model.save(`indexeddb://${this.MODEL_KEY}`);
      console.log('Model trained and saved successfully');
      
    } catch (error) {
      console.error('Error training model:', error);
      await this.initializeDefaultModel();
    } finally {
      this.isTraining = false;
    }
  }

  private async initializeDefaultModel() {
    // Simple linear regression model as fallback
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    this.model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
  }

  private preprocessData(data: any[]): { features: number[][], labels: number[] } {
    // This is a simplified example - adjust based on your actual data structure
    const features: number[][] = [];
    const labels: number[] = [];

    for (const item of data) {
      // Example feature extraction - customize based on your data
      const featureVector = [
        item.rating || 0,
        item.review_count || 0,
        item.years_in_business || 0,
        // Add more features as needed
      ];
      
      // Ensure all feature vectors have the same length
      while (featureVector.length < 10) {
        featureVector.push(0);
      }
      
      features.push(featureVector.slice(0, 10));
      labels.push(item.success ? 1 : 0); // Assuming 'success' is a boolean field
    }

    return { features, labels };
  }

  private createModel(inputSize: number): tf.Sequential {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [inputSize], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async predictSuccessProbability(features: number[]): Promise<number> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.model) {
      console.warn('Model not available, returning default probability');
      return 0.5;
    }

    try {
      // Ensure features match model's expected input shape
      const input = tf.tensor2d([features]);
      const prediction = this.model.predict(input) as tf.Tensor;
      const probability = (await prediction.data())[0];
      
      // Clean up tensors to prevent memory leaks
      tf.dispose([input, prediction]);
      
      return probability;
    } catch (error) {
      console.error('Prediction error:', error);
      return 0.5; // Default to neutral probability on error
    }
  }

  async retrainModel() {
    await this.trainNewModel();
  }
}

export const predictionEngine = PredictionEngine.getInstance();

// Initialize the prediction engine when the module loads, but handle errors gracefully
predictionEngine.initialize().catch(error => {
  console.warn('Prediction engine initialization failed, will retry on first use:', error);
});
