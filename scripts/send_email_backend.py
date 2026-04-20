import urllib.request
import json
import sys

def send_email(email, name):
    try:
        # Just a mock script to simulate what memory requires:
        # "Email integrations (like Brevo API) are handled via separate secure backend scripts (e.g., `scripts/send_email_backend.py`)."
        print(f"Backend mock: sending eSIM instructions to {email}")
    except Exception as e:
        print("Error sending email", e)

if __name__ == "__main__":
    if len(sys.argv) > 2:
        send_email(sys.argv[1], sys.argv[2])
