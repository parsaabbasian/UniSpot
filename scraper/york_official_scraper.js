const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

async function scrapeOfficialEvents() {
    const url = 'https://events.yorku.ca/';
    const agent = new https.Agent({ rejectUnauthorized: false });

    try {
        const response = await axios.get(url, { httpsAgent: agent });
        const $ = cheerio.load(response.data);
        const events = [];

        // Selecting event entries based on the structure observed in read_url_content
        $('.tribe-events-calendar-list__event-row').each((i, el) => {
            const titleEl = $(el).find('.tribe-events-calendar-list__event-title-link');
            const title = titleEl.text().trim();
            const link = titleEl.attr('href');

            const dateEl = $(el).find('.tribe-events-calendar-list__event-datetime');
            const dateStr = dateEl.text().trim();

            const descriptionEl = $(el).find('.tribe-events-calendar-list__event-description p');
            const description = descriptionEl.text().trim();

            events.push({ title, link, dateStr, description });
        });

        if (events.length === 0) {
            // Fallback for different view or layout
            $('article').each((i, el) => {
                const title = $(el).find('h2, h3').text().trim();
                const link = $(el).find('a').attr('href');
                if (title && link && link.includes('/events/')) {
                    events.push({ title, link });
                }
            });
        }

        console.log(`Found ${events.length} events from York U Official Calendar.`);
        events.forEach(e => {
            console.log(`- ${e.title} (${e.dateStr || 'No date found'})\n  Link: ${e.link}`);
        });

    } catch (error) {
        console.error('Error scraping official events:', error.message);
    }
}

scrapeOfficialEvents();
