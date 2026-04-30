require('dotenv').config();
const express = require('express');
const cors = require('cors');
const requestIp = require('request-ip');
const geoip = require('geoip-lite');

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

app.use(express.static('public'));


app.get('/api/config', (req, res) => {
    let lang = 'hu'; // Default to Hungarian
    const clientIp = requestIp.getClientIp(req);

    // For local testing
    if (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.includes('::ffff:127.0.0.1')) {
        lang = 'hu';
    } else {
        const geo = geoip.lookup(clientIp);
        if (geo && geo.country) {
            lang = geo.country.toLowerCase(); // Use country code as language code heuristic
        }
    }
    res.json({ success: true, lang, ip: clientIp });
});

app.post('/api/v1/open/package/list', async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://api.esimaccess.com/api/v1/open/package/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RT-AccessCode': process.env.ESIM_ACCESS_CODE || 'c0685d58acac45dc953883ced2fe0a45'
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


const QRCode = require('qrcode');
const uuid = require('uuid');
const fs = require('fs');

app.post('/api/generate-qr', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ success: false, error: "Text is required" });
        }

        const filename = `qr_${uuid.v4()}.png`;
        const filepath = `public/qrcodes/${filename}`;

        await QRCode.toFile(filepath, text);

        // Returns the relative URL path
        res.json({ success: true, url: `/qrcodes/${filename}` });
    } catch (error) {
        console.error("QR Generation Error:", error);
        res.status(500).json({ success: false, errorMessage: "QR Generation error" });
    }
});


const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

app.post('/api/email', async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const { email, name, items } = req.body;

        if (!email || !name || !items || !Array.isArray(items)) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        const host = req.protocol + '://' + req.get('host');

        let emailsSent = 0;

        for (const item of items) {
            // item needs: countryName, data, duration, logo, isDaily, quantity, qr_text

            const numEmails = item.isDaily ? 1 : (item.quantity || 1);

            for (let i = 0; i < numEmails; i++) {
                // Generate QR code
                const filename = `qr_${uuid.v4()}.png`;
                const filepath = `public/qrcodes/${filename}`;
                await QRCode.toFile(filepath, item.qr_text || `LPA:1$smdp.plus$TEST-ACTIVATION-CODE-${Date.now()}`);

                const imageUrl = `${host}/qrcodes/${filename}`;

                const params = {
                    keresztnev: name,
                    logo_url: item.logo,
                    orszag_nev: item.countryName,
                    adatmennyiseg: item.data,
                    ervenyesseg: `${item.duration} Nap`,
                    menniyseg: "1 db",
                    image_url: imageUrl
                };

                const payload = {
                    to: [{ email, name }],
                    templateId: 2,
                    params: params
                };

                const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'api-key': process.env.BREVO_API_KEY
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errData = await response.json();
                    console.error("Brevo Error:", errData);
                    return res.status(500).json({ success: false, error: errData });
                }

                emailsSent++;
                if (emailsSent > 0) {
                    await sleep(500); // 500ms delay between emails
                }
            }
        }

        res.json({ success: true, emailsSent });

    } catch (error) {
        console.error("Brevo Proxy Error:", error);
        res.status(500).json({ success: false, errorMessage: "Email proxy error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server and Proxy running on port ${PORT}`);
});
