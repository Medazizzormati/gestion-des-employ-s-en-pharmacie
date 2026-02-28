import pandas as pd
import numpy as np
import datetime
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, accuracy_score

def prepare_data():
    """Load and prepare data for training"""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    schedules_path = os.path.join(base_dir, 'datasets', 'schedules_dataset.csv')
    
    print(f"Loading data from {schedules_path}")
    if not os.path.exists(schedules_path):
        raise FileNotFoundError(f"Dataset not found at {schedules_path}. Run generate_pharmacy_dataset.py first.")
        
    df = pd.read_csv(schedules_path)
    
    # Extract date features
    df['date'] = pd.to_datetime(df['date'])
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
    
    # Aggregate by date to get daily workload
    daily_stats = df.groupby('date').agg(
        total_shifts=('schedule_id', 'count'),
        total_hours=('hours_worked', 'sum'),
        pharmacist_count=('role', lambda x: x.isin(['pharmacien_titulaire', 'pharmacien_adjoint']).sum()),
        is_weekend=('is_weekend', 'first'),
        day_of_week=('day_of_week', 'first'),
        month=('month', 'first')
    ).reset_index()
    
    # Add synthetic activity indicator (high/medium/low based on typical pharmacy patterns)
    # Mondays (0), Fridays (4), and winter months (flu season) typically have higher activity
    np.random.seed(42)
    daily_stats['flu_season'] = daily_stats['month'].isin([11, 12, 1, 2]).astype(int)
    
    conditions = [
        (daily_stats['day_of_week'].isin([0, 4])) | (daily_stats['flu_season'] == 1),
        (daily_stats['day_of_week'].isin([1, 2, 3]))
    ]
    choices = ['high', 'medium']
    
    daily_stats['expected_activity'] = np.select(conditions, choices, default='low')
    
    # Add random noise to simulate real-world variance
    daily_stats['total_shifts'] = daily_stats['total_shifts'] + np.random.randint(-2, 3, size=len(daily_stats))
    daily_stats['total_shifts'] = daily_stats['total_shifts'].clip(lower=2)
    
    daily_stats['total_hours'] = daily_stats['total_hours'] + np.random.normal(0, 5, size=len(daily_stats))
    daily_stats['total_hours'] = daily_stats['total_hours'].clip(lower=16)
    
    return daily_stats

def train_models():
    """Train the predictive models and save them"""
    print("Preparing data...")
    df = prepare_data()
    print(f"Prepared {len(df)} days of historical data")
    
    # Features for the model
    features = ['day_of_week', 'month', 'is_weekend', 'flu_season']
    X = df[features]
    
    # 1. Regression model for total hours prediction
    y_hours = df['total_hours']
    X_train_h, X_test_h, y_train_h, y_test_h = train_test_split(X, y_hours, test_size=0.2, random_state=42)
    
    print("Training Total Hours Regressor...")
    model_hours = RandomForestRegressor(n_estimators=100, random_state=42)
    model_hours.fit(X_train_h, y_train_h)
    
    preds_h = model_hours.predict(X_test_h)
    rmse = np.sqrt(mean_squared_error(y_test_h, preds_h))
    print(f"Hours Model RMSE: {rmse:.2f} hours")
    
    # 2. Regression model for total shifts prediction
    y_shifts = df['total_shifts']
    X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(X, y_shifts, test_size=0.2, random_state=42)
    
    print("Training Total Shifts Regressor...")
    model_shifts = RandomForestRegressor(n_estimators=100, random_state=42)
    model_shifts.fit(X_train_s, y_train_s)
    
    # 3. Classification model for expected activity level
    y_activity = df['expected_activity']
    X_train_a, X_test_a, y_train_a, y_test_a = train_test_split(X, y_activity, test_size=0.2, random_state=42)
    
    print("Training Activity Level Classifier...")
    model_activity = RandomForestClassifier(n_estimators=100, random_state=42)
    model_activity.fit(X_train_a, y_train_a)
    
    preds_a = model_activity.predict(X_test_a)
    acc = accuracy_score(y_test_a, preds_a)
    print(f"Activity Classifier Accuracy: {acc:.2f}")
    
    # Save the models in a pipeline dict
    pipeline = {
        'features': features,
        'model_hours': model_hours,
        'model_shifts': model_shifts,
        'model_activity': model_activity,
        'metadata': {
            'trained_at': datetime.datetime.now().isoformat(),
            'version': '1.0',
            'accuracy_activity': acc,
            'rmse_hours': rmse
        }
    }
    
    # Create the ML models directory
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    output_path = os.path.join(models_dir, 'forecast_pipeline.pkl')
    print(f"Saving models to {output_path}...")
    joblib.dump(pipeline, output_path)
    print("Done!")
    return output_path

if __name__ == "__main__":
    train_models()
