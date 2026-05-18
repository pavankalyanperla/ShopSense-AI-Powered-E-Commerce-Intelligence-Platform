import pandas as pd
import numpy as np
import os


def create_synthetic_fraud_data(n_samples=50000):
    """
    Creates a realistic synthetic fraud dataset
    mimicking the Kaggle fraudulent e-commerce transactions
    dataset structure for Indian e-commerce context.
    """
    np.random.seed(42)
    n_fraud = int(n_samples * 0.096)  # ~9.6% fraud rate
    n_legit = n_samples - n_fraud

    payment_methods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'COD', 'Wallet']
    categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty', 'Books', 'Sports', 'Grocery', 'Toys']
    devices = ['Mobile', 'Desktop', 'Tablet']

    def make_records(n, is_fraud):
        if is_fraud:
            amounts = np.random.exponential(8000, n)
            amounts = np.clip(amounts, 500, 150000)
            ages = np.random.choice(
                [18, 19, 20, 21, 65, 70, 75, 80],
                n, p=[0.15, 0.15, 0.15, 0.15, 0.1, 0.1, 0.1, 0.1])
            account_age = np.random.randint(0, 30, n)
            hours = np.random.choice(list(range(0, 6)) + list(range(22, 24)), n)
            payment = np.random.choice(['Credit Card', 'Debit Card', 'Wallet'], n, p=[0.5, 0.3, 0.2])
            qty = np.random.randint(5, 20, n)
        else:
            amounts = np.random.exponential(1500, n)
            amounts = np.clip(amounts, 50, 50000)
            ages = np.random.randint(18, 70, n)
            account_age = np.random.randint(30, 3000, n)
            hours = np.random.randint(8, 22, n)
            payment = np.random.choice(payment_methods, n)
            qty = np.random.randint(1, 5, n)

        return {
            'Transaction_Amount': amounts.astype(int),
            'Payment_Method': payment,
            'Product_Category': np.random.choice(categories, n),
            'Quantity': qty,
            'Customer_Age': ages,
            'Device_Used': np.random.choice(devices, n),
            'Account_Age_Days': account_age,
            'Transaction_Hour': hours,
            'Is_Fraudulent': [int(is_fraud)] * n
        }

    fraud_records = make_records(n_fraud, True)
    legit_records = make_records(n_legit, False)

    df_fraud = pd.DataFrame(fraud_records)
    df_legit = pd.DataFrame(legit_records)
    df = pd.concat([df_fraud, df_legit]).sample(frac=1, random_state=42).reset_index(drop=True)

    os.makedirs('data', exist_ok=True)
    df.to_csv('data/fraud_transactions.csv', index=False)
    print(f"Created synthetic dataset: {len(df)} records")
    print(f"Fraud rate: {df['Is_Fraudulent'].mean():.1%}")
    print(f"Saved to: data/fraud_transactions.csv")
    return df


if __name__ == '__main__':
    create_synthetic_fraud_data(50000)
