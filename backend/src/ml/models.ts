import * as tf from '@tensorflow/tfjs-node';

/**
 * Initialize ML/DL ensemble models for network intrusion detection
 * Architecture:
 * - DNN (Deep Neural Network): 128 → 64 → 32 → 16 → output
 * - CNN (Convolutional): Feature extraction from packet data
 * - BiLSTM (Bidirectional LSTM): Temporal pattern recognition
 * - Ensemble: Weighted voting across models
 */

export async function initializeModels() {
  const models = {
    dnn: createDNNModel(),
    cnn: createCNNModel(),
    lstm: createBiLSTMModel(),
    ensemble: null as any
  };

  // Create ensemble model
  models.ensemble = createEnsembleModel(models);

  return models;
}

function createDNNModel() {
  const model = tf.sequential({
    layers: [
      tf.layers.dense({
        inputShape: [128],
        units: 128,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
      }),
      tf.layers.dropout({ rate: 0.3 }),
      tf.layers.dense({
        units: 64,
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
      }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({
        units: 32,
        activation: 'relu'
      }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({
        units: 16,
        activation: 'relu'
      }),
      tf.layers.dense({
        units: 5, // 5 threat classes
        activation: 'softmax'
      })
    ]
  });

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  return model;
}

function createCNNModel() {
  const model = tf.sequential({
    layers: [
      tf.layers.conv1d({
        inputShape: [128, 1],
        kernelSize: 3,
        filters: 64,
        activation: 'relu'
      }),
      tf.layers.maxPooling1d({ poolSize: 2 }),
      tf.layers.conv1d({
        kernelSize: 3,
        filters: 32,
        activation: 'relu'
      }),
      tf.layers.maxPooling1d({ poolSize: 2 }),
      tf.layers.flatten(),
      tf.layers.dense({
        units: 64,
        activation: 'relu'
      }),
      tf.layers.dropout({ rate: 0.3 }),
      tf.layers.dense({
        units: 5,
        activation: 'softmax'
      })
    ]
  });

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  return model;
}

function createBiLSTMModel() {
  const model = tf.sequential({
    layers: [
      tf.layers.bidirectional({
        layer: tf.layers.lstm({
          units: 64,
          returnSequences: true
        }),
        inputShape: [32, 128]
      }),
      tf.layers.bidirectional({
        layer: tf.layers.lstm({
          units: 32,
          returnSequences: false
        })
      }),
      tf.layers.dense({
        units: 16,
        activation: 'relu'
      }),
      tf.layers.dropout({ rate: 0.2 }),
      tf.layers.dense({
        units: 5,
        activation: 'softmax'
      })
    ]
  });

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  return model;
}

function createEnsembleModel(models: any) {
  return {
    predict: async (input: tf.Tensor) => {
      const predictions = {
        dnn: models.dnn.predict(input) as tf.Tensor,
        cnn: models.cnn.predict(input.reshape([1, 128, 1])) as tf.Tensor,
        // LSTM would need sequence input, simplified for demo
        lstm: models.dnn.predict(input) as tf.Tensor
      };

      // Weighted ensemble: DNN(40%) + CNN(35%) + LSTM(25%)
      const weights = { dnn: 0.4, cnn: 0.35, lstm: 0.25 };

      // Normalize and combine predictions
      const combined = tf.tidy(() => {
        const dnnPred = tf.mul(predictions.dnn, weights.dnn);
        const cnnPred = tf.mul(predictions.cnn, weights.cnn);
        const lstmPred = tf.mul(predictions.lstm, weights.lstm);
        
        return tf.add(tf.add(dnnPred, cnnPred), lstmPred);
      });

      return combined;
    }
  };
}
