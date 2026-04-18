import os
import json
import urllib.request

API_URL = 'https://api.esimaccess.com/api/v1/open/package/list'
# MUST be provided via environment variable (e.g., GitHub Secrets)
API_KEY = os.environ.get('ESIM_API_KEY')

def fetch_and_save_packages():
    if not API_KEY:
        print("Error: ESIM_API_KEY environment variable is not set.")
        print("Please configure this in your GitHub Repository Secrets.")
        exit(1)

    # The API might require empty data to process the POST request properly
    req = urllib.request.Request(API_URL, data=b"{}", method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('RT-AccessCode', API_KEY)

    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))

                # Verify the structure is what we expect
                if data and data.get('success'):
                    with open('packages.json', 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
                    print("Successfully updated packages.json")
                else:
                    print("API returned a response, but it was not successful:")
                    print(data)
                    exit(1)
            else:
                print(f"Failed to fetch packages. HTTP Status: {response.status}")
                exit(1)
    except Exception as e:
        print(f"An error occurred: {e}")
        exit(1)

if __name__ == '__main__':
    fetch_and_save_packages()
