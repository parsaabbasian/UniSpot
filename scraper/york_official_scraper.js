const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const BUILDINGS = {
    'tait mckenzie': { lat: 43.7766, lng: -79.5074 },
    'dbac': { lat: 43.7749, lng: -79.5042 },
    'ross': { lat: 43.7731, lng: -79.5034 },
    'scott library': { lat: 43.7732, lng: -79.5020 },
    'bergeron': { lat: 43.7758, lng: -79.5065 },
    'student centre': { lat: 43.7738, lng: -79.5008 },
    'york lanes': { lat: 43.7744, lng: -79.5009 },
    'life sciences': { lat: 43.7719, lng: -79.5048 },
    'schulich': { lat: 43.7745, lng: -79.4990 },
    'vanier': { lat: 43.7753, lng: -79.5015 },
    'vari hall': { lat: 43.7735, lng: -79.5019 },
    'stong': { lat: 43.7763, lng: -79.5025 },
    'bethune': { lat: 43.7771, lng: -79.5045 },
    'calumet': { lat: 43.7760, lng: -79.5035 },
    'winter college': { lat: 43.7742, lng: -79.5028 },
    'mclaughlin': { lat: 43.7740, lng: -79.5035 },
    'founders': { lat: 43.7725, lng: -79.5055 },
    'atkinson': { lat: 43.7715, lng: -79.5050 },
};

async function getEventDetails(link, agent) {
    try {
        const response = await axios.get(link, { httpsAgent: agent });
        const $ = cheerio.load(response.data);
        const locationText = $('.tribe-events-header__event-venue-title, h6').first().text().trim();
        const description = $('.tribe-events-calendar-list__event-description, .tribe-events-single-event-description').text().trim();
        return { locationText, description };
    } catch (e) {
        return { locationText: 'Unknown', description: '' };
    }
}

async function scrapeOfficialEvents() {
    const url = 'https://events.yorku.ca/';
    const agent = new https.Agent({ rejectUnauthorized: false });

    try {
        const response = await axios.get(url, { httpsAgent: agent });
        const $ = cheerio.load(response.data);
        const events = [];

        let currentYearMonth = '';
        let currentDay = '';

        $('h2, h3, h4').each((i, el) => {
            const tagName = el.name;
            const text = $(el).text().trim();

            if (tagName === 'h2' && text.match(/(January|February|March|April|May|June|July|August|September|October|November|December) \d{4}/)) {
                currentYearMonth = text;
            } else if (tagName === 'h3' && text.match(/\d+(st|nd|rd|th)/)) {
                currentDay = text.replace(/[^0-9]/g, '');
            } else if (tagName === 'h4') {
                const linkEl = $(el).find('a');
                if (linkEl.length > 0) {
                    const title = linkEl.text().trim();
                    const link = linkEl.attr('href');
                    if (link && link.includes('/events/')) {
                        events.push({
                            title,
                            link,
                            dateStr: `${currentDay} ${currentYearMonth}`.trim()
                        });
                    }
                }
            }
        });

        console.log(`Found ${events.length} total events. Checking details for the next 10...`);

        const results = [];
        for (const e of events.slice(0, 10)) {
            const details = await getEventDetails(e.link, agent);
            let lat = 43.7735, lng = -79.5019; // Default Vari Hall
            const locLower = (details.locationText + " " + e.title).toLowerCase();

            for (const [building, coords] of Object.entries(BUILDINGS)) {
                if (locLower.includes(building)) {
                    lat = coords.lat;
                    lng = coords.lng;
                    break;
                }
            }

            results.push({
                ...e,
                location: details.locationText,
                description: details.description.substring(0, 150) + "...",
                coords: { lat, lng }
            });
        }

        console.log(JSON.stringify(results, null, 2));

    } catch (error) {
        console.error('Error scraping official events:', error.message);
    }
}

scrapeOfficialEvents();
