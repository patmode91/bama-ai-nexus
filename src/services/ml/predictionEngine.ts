import * as tf from '@tensorflow/tfjs';
// Supabase client for fetching training data if trainNewModel is called (now for offline use)
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: This URL must point to a publicly accessible or presigned URL
// for the model.json file of a TensorFlow.js Layers Model.
// In a real deployment, get this from an environment variable.
// e.g., Deno.env.get('PRETRAINED_MODEL_URL') or process.env.PRETRAINED_MODEL_URL
const PRETRAINED_MODEL_URL = 'https://your-storage-bucket.com/path/to/your_tfjs_model/model.json'; // Placeholder

const supabase = createClient(
  // These env vars would be for client-side Supabase access if trainNewModel is run in browser.
  // For serverless, Deno.env.get() would be used.
  import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_anon_key'
);

tf.ENV.set('WEBGL_PACK', false); // Recommended for server-side/Node.js tfjs

export class PredictionEngine {
  private static instance: PredictionEngine;
  private model: tf.LayersModel | null = null;
  private modelVersion: string = '1.0.0'; // Could be loaded from model metadata if available
  private isTraining: boolean = false; // Should ideally be true only during offline training phase
  // private readonly MODEL_KEY = 'bama-ai-prediction-model'; // No longer used for IndexedDB

  private constructor() {}

  static getInstance(): PredictionEngine {
    if (!PredictionEngine.instance) {
      PredictionEngine.instance = new PredictionEngine();
    }
    return PredictionEngine.instance;
  }

  async initialize() {
    try {
      await this.loadModel(); // Attempt to load from URL
      console.log('Prediction engine initialized with pre-trained model.');
    } catch (error) {
      console.warn(
        'Failed to load pre-trained model from URL. Initializing with default model as fallback. Error:',
        (error as Error).message
      );
      await this.initializeDefaultModel(); // Fallback to default model
      console.log('Prediction engine initialized with default model.');
    }
  }

  private async loadModel() {
    // Check if PRETRAINED_MODEL_URL is a placeholder or not configured
    // In a serverless function, Deno.env.get('PRETRAINED_MODEL_URL') would be used.
    // For client-side src/, import.meta.env.VITE_PRETRAINED_MODEL_URL could be used.
    // This example uses the global const for simplicity here.
    const modelUrl = PRETRAINED_MODEL_URL;

    if (!modelUrl || modelUrl === 'https://your-storage-bucket.com/path/to/your_tfjs_model/model.json' || modelUrl.includes('placeholder')) {
      console.warn('PRETRAINED_MODEL_URL is not configured or is using a placeholder value.');
      throw new Error('PRETRAINED_MODEL_URL not configured.');
    }

    try {
      console.log(`Loading pre-trained model from: ${modelUrl}`);
      this.model = await tf.loadLayersModel(modelUrl);
      console.log('Pre-trained model loaded successfully from URL.');
      // Optionally, you could try to load model metadata if you save it alongside your model
      // For example, this.modelVersion = loadedModel.userDefinedMetadata?.version || 'unknown';
    } catch (error) {
      console.error(`Error loading pre-trained model from ${modelUrl}:`, error);
      throw error; // Re-throw to be handled by initialize(), which will call initializeDefaultModel()
    }
  }

  /**
   * Trains a new model. This method is intended for offline training environments.
   * The trained model (model.json, weights.bin) should then be uploaded to the PRETRAINED_MODEL_URL.
   * It no longer saves to IndexedDB.
   */
  private async trainNewModel() { // Renamed to indicate offline/manual use
    if (this.isTraining) {
      console.warn("Training is already in progress.");
      return;
    }
    this.isTraining = true;
    console.log('Starting offline model training process...');
    
    try {
      const { data: trainingData, error } = await supabase
        .from('training_data')
        .select('*')
        .limit(1000); // Example limit

      if (error || !trainingData || trainingData.length === 0) {
        console.error('Failed to fetch training data or no data available:', error?.message);
        // Not initializing default model here, as this is an explicit training call
        return;
      }

      const { features, labels } = this.preprocessData(trainingData);
      if (features.length === 0) {
        console.error("No features to train on after preprocessing.");
        return;
      }
      
      this.model = this.createModel(features[0].length);
      console.log('Model created, starting training...');
      
      await this.model.fit(tf.tensor2d(features), tf.tensor1d(labels), {
        epochs: 50, // Example
        batchSize: 32, // Example
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Offline Training Epoch ${epoch + 1}: loss = ${logs?.loss?.toFixed(4)}, accuracy = ${logs?.acc?.toFixed(4)}`);
          }
        }
      });

      console.log('Offline model training completed.');
      console.log('IMPORTANT: To use this model, save it and upload to your PRETRAINED_MODEL_URL.');
      // Example: await this.model.save('downloads://my-model'); // For browser download
      // Or: await this.model.save('file://./my-model'); // For Node.js tfjs
      // Then upload 'my-model.json' and 'my-model.weights.bin' to your hosting.
      
    } catch (error) {
      console.error('Error during offline model training:', error);
    } finally {
      this.isTraining = false;
    }
  }

  private async initializeDefaultModel() {
    console.log("Initializing default fallback model.");
    this.model = tf.sequential({
      layers: [
        // Ensure inputShape matches the expected feature vector length (e.g., 10)
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
    if (!this.model) {
      await this.initialize();
    }

    try {
      // Ensure features match model's expected input shape
      const input = tf.tensor2d([features]);
      const prediction = this.model!.predict(input) as tf.Tensor;
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

// Initialize the prediction engine when the module loads
predictionEngine.initialize().catch(console.error);
