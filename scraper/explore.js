const axios = require('axios');
const https = require('https');

async function checkWpApi() {
    const agent = new https.Agent({ rejectUnauthorized: false });
    try {
        const response = await axios.get('https://events.yorku.ca/wp-json/wp/v2/tribe_events?per_page=5', { httpsAgent: agent });
        console.log(`Found ${response.data.length} post types via JSON API (tribe_events).`);
        if (response.data.length > 0) {
            console.log(response.data[0].title.rendered);
        }
    } catch (e) {
        console.log("tribe_events failed.");
        try {
            const res3 = await axios.get('https://events.yorku.ca/wp-json/tribe/events/v1/events', { httpsAgent: agent });
            console.log(`Found ${res3.data.events.length} events via TEC API.`);
        } catch (e3) {
            const rssResponse = await axios.get('https://events.yorku.ca/feed/', { httpsAgent: agent });
            console.log("RSS Feed content:", rssResponse.data.substring(0, 500));
        }
    }
}
checkWpApi();
