from __future__ import print_function
import os
import time
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from pprint import pprint

# Securely load the API key from an environment variable (Do not hardcode it here!)
# Ensure you set BREVO_API_KEY in your deployment environment (e.g., Netlify, Heroku, AWS Lambda)
api_key = os.environ.get('BREVO_API_KEY')

if not api_key:
    print("Error: BREVO_API_KEY environment variable is not set. Cannot send email.")
    exit(1)

configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = api_key

api_client = sib_api_v3_sdk.ApiClient(configuration)
api_instance = sib_api_v3_sdk.TransactionalEmailsApi(api_client)

def send_esim_qr(buyer_email, buyer_name, qr_url):
    """
    Sends an email with the generated eSIM QR code using Brevo.
    This function should be called from your secure backend server
    when a purchase is finalized.
    """
    to = [{"email": buyer_email, "name": buyer_name}]

    # Pass dynamic variables to the Brevo template
    params = {
        "image_url": qr_url,
        "keresztnev": buyer_name
    }

    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=to,
        template_id=2, # Make sure this matches your template ID in Brevo
        params=params
    )

    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"Szuper, az e-mail a sablonnal sikeresen elküldve {buyer_email} címre!")
        pprint(api_response)
        return True
    except ApiException as e:
        print("Hoppá, hiba történt az e-mail küldésekor: %s\n" % e)
        return False

# Example usage (for testing on your backend server):
if __name__ == '__main__':
    # You could read this from command line args or a POST request body
    test_email = os.environ.get('TEST_EMAIL', 'zatrokmarton@gmail.com')
    test_qr = "https://quickchart.io/qr?text=LPA:1$esim.test$123456789"

    print("Testing email send...")
    send_esim_qr(test_email, "Márton", test_qr)
