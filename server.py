import os
import time
import uuid
import requests
import qrcode
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BREVO_API_KEY = os.environ.get("BREVO_API_KEY", "xkeysib-REPLACED-FOR-SECURITY")
BREVO_URL = "https://api.brevo.com/v3/smtp/email"

QR_DIR = os.path.join(os.path.dirname(__file__), "qrcodes")
os.makedirs(QR_DIR, exist_ok=True)

@app.route('/qrcodes/<path:filename>')
def serve_qr(filename):
    return send_from_directory(QR_DIR, filename)

def generate_qr(text):
    filename = f"qr_{uuid.uuid4().hex}.png"
    filepath = os.path.join(QR_DIR, filename)

    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(text)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(filepath)

    return filename

@app.route('/checkout', methods=['POST'])
def checkout():
    data = request.json
    cart = data.get('cart', [])
    email = data.get('email')
    name = data.get('name')

    if not cart or not email or not name:
        return jsonify({"error": "Missing required data"}), 400

    host_url = request.host_url.rstrip('/')

    for item in cart:
        # Generate QR code image locally
        qr_text = "LPA:1$smdp.plus$TEST-ACTIVATION-CODE-" + uuid.uuid4().hex
        qr_filename = generate_qr(qr_text)
        qr_url = f"{host_url}/qrcodes/{qr_filename}"

        # Calculate details
        country_name = item.get('countryName', '')
        duration = item.get('duration', '30')
        data_amount = item.get('data', '1 GB')

        # Determine flag or globe
        logo_url = "https://img.icons8.com/color/80/000000/globe--v1.png"
        # We try to use a flag if we can deduce country code, but default fallback is fine

        # Note the typo requirement from memory: "menniyseg"
        params = {
            "keresztnev": name,
            "logo_url": logo_url,
            "orszag_nev": country_name,
            "adatmennyiseg": data_amount,
            "ervenyesseg": f"{duration} Nap",
            "menniyseg": "1 db", # Hardcoded 1 db
            "image_url": qr_url
        }

        # Send Email via Brevo
        payload = {
            "to": [{"email": email, "name": name}],
            "templateId": 2,
            "params": params
        }

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "api-key": BREVO_API_KEY
        }

        try:
            resp = requests.post(BREVO_URL, headers=headers, json=payload)
            resp.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Brevo API Error: {e}")
            import sys; sys.stdout.flush()
            if e.response is not None:
                print(e.response.text)
                sys.stdout.flush()
            return jsonify({"error": "Failed to send email"}), 500

        time.sleep(0.5) # Sleep 0.5s between emails

    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(port=5000)
