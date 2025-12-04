import pandas as pd
from ucimlrepo import fetch_ucirepo

def process_data():
    print("Fetching dataset...")
    # fetch dataset 
    default_of_credit_card_clients = fetch_ucirepo(id=350) 
      
    # data (as pandas dataframes) 
    X = default_of_credit_card_clients.data.features 
    
    # Keep only relevant columns: Sex (X2) and Bill/Pay amounts
    # X12-X17: Bill Amount (Sept-Apr)
    # X18-X23: Pay Amount (Sept-Apr)
    cols = ['X2'] + [f'X{i}' for i in range(12, 24)]
    df = X[cols].copy()
    
    # Rename Sex for clarity (1=Male, 2=Female)
    df['Sex'] = df['X2'].map({1: 'Male', 2: 'Female'})
    
    # Define mapping from column to (Month, Type)
    # Year is 2005 for all
    # Bill: X12(Sept) -> X17(Apr)
    # Pay: X18(Sept) -> X23(Apr)
    
    month_map = {
        'X12': ('2005-09-01', 'Bill Statement'),
        'X13': ('2005-08-01', 'Bill Statement'),
        'X14': ('2005-07-01', 'Bill Statement'),
        'X15': ('2005-06-01', 'Bill Statement'),
        'X16': ('2005-05-01', 'Bill Statement'),
        'X17': ('2005-04-01', 'Bill Statement'),
        'X18': ('2005-09-01', 'Amount Paid'),
        'X19': ('2005-08-01', 'Amount Paid'),
        'X20': ('2005-07-01', 'Amount Paid'),
        'X21': ('2005-06-01', 'Amount Paid'),
        'X22': ('2005-05-01', 'Amount Paid'),
        'X23': ('2005-04-01', 'Amount Paid'),
    }
    
    # List to store processed rows
    processed_data = []
    
    # Group by Sex and calculate mean for each column
    grouped = df.groupby('Sex')[cols[1:]].mean()
    
    print("Processing data...")
    for sex in grouped.index:
        for col in grouped.columns:
            date, type_ = month_map[col]
            value = grouped.loc[sex, col]
            
            category = f"{sex} - {type_}"
            
            processed_data.append({
                'date': date,
                'category': category,
                'value': round(value, 2)
            })
            
    # Create DataFrame and sort
    result_df = pd.DataFrame(processed_data)
    result_df['date'] = pd.to_datetime(result_df['date'])
    result_df = result_df.sort_values(['category', 'date'])
    
    # Save to CSV
    output_path = 'Assignment_3/visualization/data.csv'
    result_df.to_csv(output_path, index=False)
    print(f"Data saved to {output_path}")
    print(result_df.head())

if __name__ == "__main__":
    process_data()

