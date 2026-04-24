import requests
import json
import os

API_URL = "https://api.esimaccess.com/api/v1/open/package/list"
ACCESS_CODE = "c0685d58acac45dc953883ced2fe0a45"

def fetch_packages():
    headers = {
        "Content-Type": "application/json",
        "RT-AccessCode": ACCESS_CODE
    }

    try:
        response = requests.post(API_URL, headers=headers, json={})
        response.raise_for_status()
        data = response.json()

        if data.get("success") and data.get("obj") and data.get("obj", {}).get("packageList"):
            # Ensure output is in the repo root
            output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "packages.json")
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Successfully saved packages to {output_path}")
        else:
            print("API returned success: false or missing packageList")
            print(data)
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")

if __name__ == "__main__":
    fetch_packages()
