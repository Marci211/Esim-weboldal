const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Parse JSON bodies

app.use(express.static('public'));

app.post('/api/v1/open/package/list', async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://api.esimaccess.com/api/v1/open/package/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RT-AccessCode': 'c0685d58acac45dc953883ced2fe0a45'
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server and Proxy running on port ${PORT}`);
});
