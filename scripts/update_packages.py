import urllib.request
import json
import os

API_URL = "https://api.esimaccess.com/api/v1/open/package/list"
ACCESS_CODE = "c0685d58acac45dc953883ced2fe0a45"

req = urllib.request.Request(API_URL, method="POST")
req.add_header("Content-Type", "application/json")
req.add_header("RT-AccessCode", ACCESS_CODE)

data = "{}"
req.data = data.encode("utf-8")

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())

        # Ensure public directory exists


        with open("packages.json", "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        print("Successfully updated packages.json")
except Exception as e:
    print(f"Error fetching packages: {e}")
    exit(1)
