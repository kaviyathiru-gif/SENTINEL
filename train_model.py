"""
Sentinel - Model Training Script
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import os
from datetime import datetime

from .intrusion_detector import get_model

def generate_training_data(num_samples=5000):
    """Generate synthetic training data"""
    print(f"Generating {num_samples} training samples...")
    
    data = []
    for _ in range(num_samples):
        is_attack = np.random.random() > 0.7
        
        # Normal traffic features
        features = {
            'packetSize': np.random.normal(512, 150) if not is_attack else np.random.normal(800, 300),
            'protocol': np.random.choice([6, 17, 1], p=[0.6, 0.3, 0.1]),
            'srcPort': np.random.randint(1024, 65535),
            'dstPort': np.random.choice([80, 443, 22, 53, 25, 110, 143, 993, 3389, 23], 
                                       p=[0.3, 0.3, 0.1, 0.05, 0.05, 0.05, 0.05, 0.05, 0.025, 0.025]),
            'flowDuration': np.random.exponential(10),
            'totalFwdPackets': np.random.poisson(5) if not is_attack else np.random.poisson(20),
            'totalBackwardPackets': np.random.poisson(3) if not is_attack else np.random.poisson(15),
            'fwdPacketLength': np.random.gamma(2, 20),
            'bwdPacketLength': np.random.gamma(2, 15),
            'flowBytesPerSecond': np.random.gamma(2, 500),
            'flowPacketsPerSecond': np.random.gamma(2, 10) if not is_attack else np.random.gamma(2, 50),
            'initWindowFwd': np.random.gamma(2, 200),
            'initWindowBwd': np.random.gamma(2, 150),
            'fwdAvgSegSize': np.random.gamma(2, 30),
            'bwdAvgSegSize': np.random.gamma(2, 25),
            'fwdAvgBytesPerBulk': np.random.gamma(2, 300),
            'bwdAvgBytesPerBulk': np.random.gamma(2, 250),
            'fwdAvgPacketsPerBulk': np.random.gamma(2, 20),
            'bwdAvgPacketsPerBulk': np.random.gamma(2, 15),
            'fwdAvgBulkRate': np.random.gamma(2, 10),
            'label': 1 if is_attack else 0
        }
        data.append(features)
    
    df = pd.DataFrame(data)
    
    # Add some attack-specific patterns
    attack_indices = df[df['label'] == 1].index
    for idx in attack_indices[:len(attack_indices)//2]:
        # Make some attacks more obvious
        attack_type = np.random.choice(['dos', 'probe', 'r2l', 'u2r'])
        if attack_type == 'dos':
            df.loc[idx, 'flowPacketsPerSecond'] *= 3
            df.loc[idx, 'totalFwdPackets'] *= 2
        elif attack_type == 'probe':
            df.loc[idx, 'dstPort'] = np.random.choice([23, 22, 445, 3389])
            df.loc[idx, 'flowPacketsPerSecond'] *= 1.5
        elif attack_type == 'r2l':
            df.loc[idx, 'packetSize'] = np.random.choice([64, 128, 512, 1024, 1500])
            df.loc[idx, 'srcPort'] = np.random.choice([22, 23, 3389])
        elif attack_type == 'u2r':
            df.loc[idx, 'packetSize'] = np.random.uniform(100, 1000)
            df.loc[idx, 'protocol'] = np.random.choice([2, 3, 4, 5])
    
    return df

def train_model_from_data(df, model_type='lstm', epochs=50, batch_size=64):
    """Train the model with the given data"""
    print("🚀 Starting model training...")
    
    # Prepare features and labels
    feature_cols = [col for col in df.columns if col != 'label']
    X = df[feature_cols].values
    y = df['label'].values
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Standardize features
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    
    # Convert to PyTorch tensors
    X_train_tensor = torch.tensor(X_train, dtype=torch.float32)
    y_train_tensor = torch.tensor(y_train, dtype=torch.float32)
    X_test_tensor = torch.tensor(X_test, dtype=torch.float32)
    y_test_tensor = torch.tensor(y_test, dtype=torch.float32)
    
    # Create DataLoaders
    train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
    test_dataset = TensorDataset(X_test_tensor, y_test_tensor)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    # Create model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    input_size = X.shape[1]
    model = get_model(model_type, input_size, 1).to(device)
    
    # Loss and optimizer
    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=5, factor=0.5)
    
    # Training loop
    best_accuracy = 0
    print(f"Training for {epochs} epochs...")
    
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        correct = 0
        total = 0
        
        for batch_X, batch_y in train_loader:
            batch_X = batch_X.to(device)
            batch_y = batch_y.to(device)
            
            # Reshape for LSTM: (batch, seq_len, features)
            if model_type in ['lstm', 'cnn']:
                batch_X = batch_X.unsqueeze(1)  # (batch, 1, features)
            # For DNN, use as is
            
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs.squeeze(), batch_y)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            
            predictions = torch.sigmoid(outputs.squeeze()) > 0.5
            correct += (predictions == batch_y.bool()).sum().item()
            total += batch_y.size(0)
        
        train_accuracy = correct / total
        
        # Validation
        model.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for batch_X, batch_y in test_loader:
                batch_X = batch_X.to(device)
                batch_y = batch_y.to(device)
                
                if model_type in ['lstm', 'cnn']:
                    batch_X = batch_X.unsqueeze(1)
                
                outputs = model(batch_X)
                predictions = torch.sigmoid(outputs.squeeze()) > 0.5
                val_correct += (predictions == batch_y.bool()).sum().item()
                val_total += batch_y.size(0)
        
        val_accuracy = val_correct / val_total
        scheduler.step(val_accuracy)
        
        if (epoch + 1) % 10 == 0:
            print(f"Epoch {epoch+1}/{epochs} | Loss: {total_loss/len(train_loader):.4f} | "
                  f"Train Acc: {train_accuracy:.4f} | Val Acc: {val_accuracy:.4f}")
        
        if val_accuracy > best_accuracy:
            best_accuracy = val_accuracy
            # Save best model
            model_path = 'models/intrusion_model.pth'
            os.makedirs('models', exist_ok=True)
            torch.save(model.state_dict(), model_path)
            print(f"✅ Model saved at {model_path} with accuracy {best_accuracy:.4f}")
    
    print(f"\n✅ Training complete! Best accuracy: {best_accuracy:.4f}")
    return best_accuracy

def train_model():
    """Train the model with default settings"""
    df = generate_training_data(5000)
    return train_model_from_data(df, model_type='lstm', epochs=50)


if __name__ == '__main__':
    train_model()
