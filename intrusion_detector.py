"""
Sentinel - PyTorch Intrusion Detection Model
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

class IntrusionDetector(nn.Module):
    """
    Deep Neural Network for Intrusion Detection
    """
    def __init__(self, input_size=20, hidden_sizes=[128, 64, 32], num_classes=2):
        super(IntrusionDetector, self).__init__()
        
        layers = []
        prev_size = input_size
        
        for hidden_size in hidden_sizes:
            layers.append(nn.Linear(prev_size, hidden_size))
            layers.append(nn.BatchNorm1d(hidden_size))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(0.3))
            prev_size = hidden_size
        
        layers.append(nn.Linear(prev_size, num_classes))
        
        self.network = nn.Sequential(*layers)
    
    def forward(self, x):
        return self.network(x)


class IntrusionDetectionLSTM(nn.Module):
    """
    LSTM-based Intrusion Detection Model
    Best for sequential/temporal data
    """
    def __init__(self, input_size=20, hidden_size=64, num_layers=2, num_classes=2):
        super(IntrusionDetectionLSTM, self).__init__()
        
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.2 if num_layers > 1 else 0
        )
        
        self.fc = nn.Linear(hidden_size, num_classes)
        self.dropout = nn.Dropout(0.3)
    
    def forward(self, x):
        # x shape: (batch, seq_len, input_size)
        lstm_out, _ = self.lstm(x)
        # Take the last output
        last_output = lstm_out[:, -1, :]
        last_output = self.dropout(last_output)
        output = self.fc(last_output)
        return output


class IntrusionDetectionCNN(nn.Module):
    """
    CNN-based Intrusion Detection Model
    """
    def __init__(self, input_size=20, num_classes=2):
        super(IntrusionDetectionCNN, self).__init__()
        
        self.conv1 = nn.Conv1d(1, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv1d(32, 64, kernel_size=3, padding=1)
        self.conv3 = nn.Conv1d(64, 128, kernel_size=3, padding=1)
        
        self.pool = nn.MaxPool1d(2)
        self.dropout = nn.Dropout(0.3)
        
        # Calculate the size after convolutions
        conv_output_size = self._get_conv_output(input_size)
        self.fc1 = nn.Linear(conv_output_size, 128)
        self.fc2 = nn.Linear(128, num_classes)
    
    def _get_conv_output(self, input_size):
        x = torch.randn(1, 1, input_size)
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = F.relu(self.conv3(x))
        return x.view(1, -1).size(1)
    
    def forward(self, x):
        # x shape: (batch, seq_len, input_size)
        x = x.unsqueeze(1)  # (batch, 1, seq_len, input_size) -> (batch, 1, seq_len * input_size)
        # Reshape for Conv1d
        batch_size = x.size(0)
        x = x.view(batch_size, 1, -1)
        
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = F.relu(self.conv3(x))
        
        x = x.view(batch_size, -1)
        x = self.dropout(x)
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        output = self.fc2(x)
        return output


def get_model(model_type='lstm', input_size=20, num_classes=2):
    """
    Factory function to get the specified model
    """
    if model_type == 'dnn':
        return IntrusionDetector(input_size, [128, 64, 32], num_classes)
    elif model_type == 'lstm':
        return IntrusionDetectionLSTM(input_size, 64, 2, num_classes)
    elif model_type == 'cnn':
        return IntrusionDetectionCNN(input_size, num_classes)
    else:
        raise ValueError(f"Unknown model type: {model_type}")


if __name__ == '__main__':
    # Test the models
    print("Testing models...")
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    for model_type in ['dnn', 'lstm', 'cnn']:
        print(f"\nTesting {model_type.upper()} model...")
        model = get_model(model_type).to(device)
        
        # Create dummy input
        dummy_input = torch.randn(1, 10, 20).to(device)  # (batch, seq_len, features)
        
        if model_type == 'dnn':
            # DNN expects flattened input
            dummy_input = dummy_input.view(1, -1)
        
        output = model(dummy_input)
        print(f"  Output shape: {output.shape}")
        print(f"  Parameters: {sum(p.numel() for p in model.parameters()):,}")


