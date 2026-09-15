import requests

# Azure AD & Power BI Configuration
TENANT_ID = "YOUR_AZURE_TENANT_ID"
CLIENT_ID = "YOUR_AZURE_CLIENT_ID"
CLIENT_SECRET = "YOUR_AZURE_CLIENT_SECRET"
WORKSPACE_ID = "YOUR_POWERBI_WORKSPACE_ID"
DATASET_ID = "YOUR_POWERBI_DATASET_ID"

def get_powerbi_access_token():
    """Generates an OAuth2 access token via Azure AD Service Principal."""
    url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
    payload = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scope": "https://analysis.windows.net/powerbi/api/.default"
    }
    response = requests.post(url, data=payload)
    response.raise_for_status()
    return response.json().get("access_token")

def trigger_powerbi_dataset_refresh():
    """Triggers an automated dataset refresh in Power BI Service for updated graphs."""
    token = get_powerbi_access_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    refresh_url = f"https://api.powerbi.com/v1.0/myorg/groups/{WORKSPACE_ID}/datasets/{DATASET_ID}/refreshes"
    
    response = requests.post(refresh_url, headers=headers)
    if response.status_code == 202:
        print("[POWER BI] Dataset refresh triggered successfully.")
    else:
        print(f"[POWER BI ERROR] Failed to trigger refresh: {response.text}")

if __name__ == "__main__":
    # Test triggering the Power BI auto-refresh
    trigger_powerbi_dataset_refresh()
