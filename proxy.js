require('dotenv').config();
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

if (!fs.existsSync(path.join(__dirname, 'qrcodes'))) {
    fs.mkdirSync(path.join(__dirname, 'qrcodes'));
}

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

app.use(express.static(__dirname));

app.use('/qrcodes', (req, res, next) => {
    if (req.url === '/' || req.url === '') {
        return res.status(403).send('Forbidden');
    }
    next();
});
app.use('/qrcodes', express.static('qrcodes'));

app.post('/api/v1/open/package/list', async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://api.esimaccess.com/api/v1/open/package/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RT-AccessCode': process.env.ESIM_ACCESS_CODE
            },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({ success: false, errorMessage: "Proxy error" });
    }
});

app.post('/api/email', async (req, res) => {
    try {
        const { orderItems, customerEmail, customerName } = req.body;
        const fetch = (await import('node-fetch')).default;
        const brevoApiKey = process.env.BREVO_API_KEY;

        if (!orderItems || !Array.isArray(orderItems)) {
            return res.status(400).json({ success: false, errorMessage: "Invalid order items" });
        }

        const emailPromises = [];

        for (const item of orderItems) {
            const quantity = item.isDaily ? 1 : (item.quantity || 1);

            for (let i = 0; i < quantity; i++) {
                const qrText = `LPA:1$smdp.plus$TEST-ACTIVATION-CODE-${uuidv4()}`;
                const fileName = `qr_${uuidv4()}.png`;
                const filePath = path.join(__dirname, 'qrcodes', fileName);

                await qrcode.toFile(filePath, qrText, { width: 300 });

                const host = req.headers.host;
                const protocol = req.protocol || 'https';
                const imageUrl = `${protocol}://${host}/qrcodes/${fileName}`;

                const emailData = {
                    to: [{ email: customerEmail, name: customerName }],
                    templateId: 2,
                    params: {
                        keresztnev: customerName,
                        logo_url: item.logo || 'https://img.icons8.com/color/80/000000/globe--v1.png',
                        orszag_nev: item.countryName,
                        adatmennyiseg: item.data,
                        ervenyesseg: item.duration + " Nap",
                        menniyseg: "1 db",
                        image_url: imageUrl
                    }
                };

                const emailPromise = new Promise((resolve) => {
                    setTimeout(async () => {
                        try {
                            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                                method: 'POST',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    'api-key': brevoApiKey
                                },
                                body: JSON.stringify(emailData)
                            });

                            if (response.ok) {
                                resolve({ success: true });
                            } else {
                                const errData = await response.json();
                                console.error('Brevo API Error:', errData);
                                resolve({ success: false, error: errData });
                            }
                        } catch (err) {
                            console.error('Fetch Error:', err);
                            resolve({ success: false, error: err.message });
                        }
                    }, i * 500);
                });

                emailPromises.push(emailPromise);
            }
        }

        const results = await Promise.all(emailPromises);
        const hasErrors = results.some(r => !r.success);

        if (hasErrors) {
             res.status(500).json({ success: false, errorMessage: "Some emails failed to send", results });
        } else {
             res.json({ success: true });
        }

    } catch (error) {
        console.error("Brevo Proxy Error:", error);
        res.status(500).json({ success: false, errorMessage: "Email proxy error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server and Proxy running on port ${PORT}`);
});
