const Parser = require('rss-parser');
const axios = require('axios');
const https = require('https');
const cheerio = require('cheerio');

const parser = new Parser({
    customFields: {
        item: [
            ['content:encoded', 'contentEncoded'],
            ['description', 'description']
        ],
    }
});

const YORK_API_URL = 'http://localhost:8081/api/events';
// Override max distance rules when scraping to DB directly if needed, but since we hit our own API, we just pass Vari Hall coords by default if unknown.

const DEFAULT_COORDS = { lat: 43.7735, lng: -79.5019 }; // Vari Hall

// A simple map of building names to approximate coordinates on Keele Campus
const BUILDINGS = {
    'tait mckenzie': { lat: 43.7766, lng: -79.5074 },
    'dbac': { lat: 43.7749, lng: -79.5042 }, // Dahdaleh
    'ross': { lat: 43.7731, lng: -79.5034 },
    'scott library': { lat: 43.7732, lng: -79.5020 },
    'bergeron': { lat: 43.7758, lng: -79.5065 },
    'student centre': { lat: 43.7738, lng: -79.5008 },
    'york lanes': { lat: 43.7744, lng: -79.5009 },
    'life sciences': { lat: 43.7719, lng: -79.5048 },
    'schulich': { lat: 43.7745, lng: -79.4990 },
};

function inferLocationAndCategory(text) {
    let lat = DEFAULT_COORDS.lat;
    let lng = DEFAULT_COORDS.lng;
    let category = "Social"; // default

    const lowerText = text.toLowerCase();

    // Attempt building match
    for (const [building, coords] of Object.entries(BUILDINGS)) {
        if (lowerText.includes(building)) {
            lat = coords.lat;
            lng = coords.lng;
            break;
        }
    }

    // Infer category
    if (lowerText.includes('food') || lowerText.includes('pizza') || lowerText.includes('lunch')) category = "Food";
    else if (lowerText.includes('study') || lowerText.includes('workshop') || lowerText.includes('seminar') || lowerText.includes('lecture')) category = "Study";
    else if (lowerText.includes('tech') || lowerText.includes('hack') || lowerText.includes('code')) category = "Tech";
    else if (lowerText.includes('music') || lowerText.includes('concert') || lowerText.includes('choir')) category = "Music";
    else if (lowerText.includes('sport') || lowerText.includes('game') || lowerText.includes('gym')) category = "Sports";
    else if (lowerText.includes('sale') || lowerText.includes('market')) category = "Sale";

    // Add a tiny bit of random jitter so multiple default events don't perfectly overlap
    lat += (Math.random() - 0.5) * 0.001;
    lng += (Math.random() - 0.5) * 0.001;

    return { lat, lng, category };
}

async function scrapeEvents() {
    console.log("Starting York U Reddit scrape...");
    try {
        const response = await axios.get('https://www.reddit.com/r/yorku/new.json?limit=15', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        const posts = response.data.data.children;
        console.log(`Found ${posts.length} community posts on Reddit.`);

        let successCount = 0;

        for (const postWrapper of posts) {
            const item = postWrapper.data;
            if (item.stickied) continue;

            // Ensure post is relatively recent (last 24-48h)
            const postTime = item.created_utc * 1000;
            const now = Date.now();
            if (now - postTime > 24 * 60 * 60 * 1000) {
                console.log(`[Skip] Too old: ${item.title}`);
                continue;
            }

            let cleanDesc = item.selftext.replace(/\s+/g, ' ').substring(0, 300).trim();
            if (cleanDesc.length === 0) cleanDesc = "Student chatter from Reddit.";

            // Add a clear indicator that this event was extracted
            const postLink = `https://reddit.com${item.permalink}`;
            const scrapedTag = `\n\n📌 *Automated entry extracted from Reddit: ${postLink}*`;

            const rawText = item.title + " " + cleanDesc;
            let lat = DEFAULT_COORDS.lat + (Math.random() - 0.5) * 0.005;
            let lng = DEFAULT_COORDS.lng + (Math.random() - 0.5) * 0.005;
            let category = "Social"; // default

            const lowerText = rawText.toLowerCase();

            // Attempt building match
            for (const [building, coords] of Object.entries(BUILDINGS)) {
                if (lowerText.includes(building)) {
                    lat = coords.lat + (Math.random() - 0.5) * 0.0005;
                    lng = coords.lng + (Math.random() - 0.5) * 0.0005;
                    break;
                }
            }

            // Infer category
            if (lowerText.includes('food') || lowerText.includes('pizza') || lowerText.includes('lunch')) category = "Food";
            else if (lowerText.includes('study') || lowerText.includes('exam') || lowerText.includes('test') || lowerText.includes('lecture')) category = "Study";
            else if (lowerText.includes('gym') || lowerText.includes('tait')) category = "Sports";
            else if (lowerText.includes('sale') || lowerText.includes('buy') || lowerText.includes('sell')) category = "Sale";
            else if (lowerText.includes('strike') || lowerText.includes('protest') || lowerText.includes('police')) category = "Safety";

            const eventPayload = {
                title: item.title.substring(0, 50),
                description: cleanDesc + scrapedTag,
                category: category,
                lat: lat,
                lng: lng,
                duration_hours: 24, // keep it up for a day
                creator_name: item.author + " (Scraped)",
                creator_email: "scraper_bot@unispot.ca" // Dedicated tag for scraped data
            };

            try {
                await axios.post(YORK_API_URL, eventPayload);
                console.log(`[OK] Pushed: ${eventPayload.title} (${category})`);
                successCount++;
            } catch (err) {
                // Ignore silent failures
            }
        }

        console.log(`\nScrape request completed. Added ${successCount} items.`);

    } catch (error) {
        console.error("Scraping failed:", error.message);
    }
}

scrapeEvents();
