const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const BASE_URL = 'https://komikcast.li';
const MANGA_URL_DIRECTORY = '/daftar-komik';
const PROJECT_PAGE_STRING = '/project-list';

// Helper function to parse chapter date
function parseChapterDate(dateString) {
    if (!dateString) return 0;
    
    if (dateString.includes('ago')) {
        const parts = dateString.split(' ');
        if (parts.length < 2) return 0;
        
        const value = parseInt(parts[0]);
        const unit = parts[1].toLowerCase();
        const now = new Date();

        if (unit.includes('min')) {
            now.setMinutes(now.getMinutes() - value);
        } else if (unit.includes('hour')) {
            now.setHours(now.getHours() - value);
        } else if (unit.includes('day')) {
            now.setDate(now.getDate() - value);
        } else if (unit.includes('week')) {
            now.setDate(now.getDate() - value * 7);
        } else if (unit.includes('month')) {
            now.setMonth(now.getMonth() - value);
        } else if (unit.includes('year')) {
            now.setFullYear(now.getFullYear() - value);
        }
        return now.getTime();
    }
    
    // Try to parse other date formats
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 0 : date.getTime();
}

// Helper function to get image attribute
function getImageAttr(element) {
    return element.attr('data-src') || element.attr('src') || '';
}

// Helper function to create request headers
function getHeaders(referer = null) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    };
    
    if (referer) {
        headers['Referer'] = referer;
    }
    
    return headers;
}

// Helper function to extract manga from list item
function extractMangaFromElement($, element) {
    const $el = $(element);
    const title = $el.find('h3.title').text().trim() || $el.find('.title').text().trim();
    const link = $el.find('a').first().attr('href') || '';
    const thumbnail = getImageAttr($el.find('img').first());
    const latestChapter = $el.find('.chapter').text().trim() || $el.find('.latest').text().trim();
    
    return {
        title,
        link,
        thumbnail,
        latestChapter
    };
}

// Tambahkan helper untuk ekstrak rekomendasi
function extractRecommendationFromElement($, element) {
    const $el = $(element);
    const aTag = $el.find('a').first();
    const link = aTag.attr('href') || '';
    const title = aTag.attr('title') || $el.find('.title').text().trim();
    const thumbnail = getImageAttr($el.find('img').first());
    const type = $el.find('.type').text().trim();
    const chapter = $el.find('.chapter').text().trim();
    const rating = $el.find('.numscore').text().trim();
    // rating-bintang span style="width:80%" -> ambil angka 80
    let score = null;
    const ratingSpan = $el.find('.rating-bintang span').attr('style');
    if (ratingSpan) {
        const match = ratingSpan.match(/width:(\d+)%/);
        if (match) score = parseInt(match[1]);
    }
    return {
        title,
        link,
        thumbnail,
        type,
        chapter,
        rating,
        score
    };
}

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'KomikCast API',
        version: '1.0.0',
        endpoints: {
            popular: '/popular?page=1',
            latest: '/latest?page=1',
            search: '/search?q=naruto&page=1',
            manga_detail: '/manga/:slug',
            chapter_images: '/chapter/:slug/:chapterNumber',
            filter: '/filter?status=ongoing&type=manga&orderby=popular&page=1',
            filters: '/filters',
            recommendation: '/recommendation' // <--- Tambahkan di sini
        }
    });
});

// Route for Available Filters
app.get('/filters', (req, res) => {
    const filters = {
        status: [
            { label: 'All', value: '' },
            { label: 'Ongoing', value: 'ongoing' },
            { label: 'Completed', value: 'completed' }
        ],
        type: [
            { label: 'All', value: '' },
            { label: 'Manga', value: 'manga' },
            { label: 'Manhwa', value: 'manhwa' },
            { label: 'Manhua', value: 'manhua' }
        ],
        orderby: [
            { label: 'Default', value: '' },
            { label: 'A-Z', value: 'titleasc' },
            { label: 'Z-A', value: 'titledesc' },
            { label: 'Latest Update', value: 'update' },
            { label: 'Most Popular', value: 'popular' }
        ],
        genres: [
            { label: '4-Koma', value: '4-koma' },
            { label: 'Action', value: 'action' },
            { label: 'Action Adventure', value: 'action-adventure' },
            { label: 'Adaptation', value: 'adaptation' },
            { label: 'Adult', value: 'adult' },
            { label: 'Adventure', value: 'adventure' },
            { label: 'Animals', value: 'animals' },
            { label: 'Anthology', value: 'anthology' },
            { label: 'Award Winning', value: 'award-winning' },
            { label: 'Bodyswap', value: 'bodyswap' },
            { label: 'Boys Love', value: 'boys-love' },
            { label: 'Bully', value: 'bully' },
            { label: 'Cartoon', value: 'cartoon' },
            { label: 'Comedy', value: 'comedy' },
            { label: 'Crime', value: 'crime' },
            { label: 'Crossdressing', value: 'crossdressing' },
            { label: 'Delinquents', value: 'delinquents' },
            { label: 'Demons', value: 'demons' },
            { label: 'Drama', value: 'drama' },
            { label: 'Ecchi', value: 'ecchi' },
            { label: 'Fantasy', value: 'fantasy' },
            { label: 'Full Color', value: 'full-color' },
            { label: 'Game', value: 'game' },
            { label: 'Gender Bender', value: 'gender-bender' },
            { label: 'Ghosts', value: 'ghosts' },
            { label: 'Girls Love', value: 'girls-love' },
            { label: 'Gore', value: 'gore' },
            { label: 'Gyaru', value: 'gyaru' },
            { label: 'Harem', value: 'harem' },
            { label: 'Historical', value: 'historical' },
            { label: 'Horror', value: 'horror' },
            { label: 'Incest', value: 'incest' },
            { label: 'Isekai', value: 'isekai' },
            { label: 'Josei', value: 'josei' },
            { label: 'Loli', value: 'loli' },
            { label: 'Long Strip', value: 'long-strip' },
            { label: 'Magic', value: 'magic' },
            { label: 'Magical Girls', value: 'magical-girls' },
            { label: 'Martial Arts', value: 'martial-arts' },
            { label: 'Mature', value: 'mature' },
            { label: 'Mecha', value: 'mecha' },
            { label: 'Medical', value: 'medical' },
            { label: 'Military', value: 'military' },
            { label: 'Monster Girls', value: 'monster-girls' },
            { label: 'Monsters', value: 'monsters' },
            { label: 'Music', value: 'music' },
            { label: 'Mystery', value: 'mystery' },
            { label: 'Ninja', value: 'ninja' },
            { label: 'Office Workers', value: 'office-workers' },
            { label: 'Oneshot', value: 'oneshot' },
            { label: 'Philosophical', value: 'philosophical' },
            { label: 'Police', value: 'police' },
            { label: 'Post-Apocalyptic', value: 'post-apocalyptic' },
            { label: 'Psychological', value: 'psychological' },
            { label: 'Reincarnation', value: 'reincarnation' },
            { label: 'Reverse Harem', value: 'reverse-harem' },
            { label: 'Romance', value: 'romance' },
            { label: 'Samurai', value: 'samurai' },
            { label: 'School Life', value: 'school-life' },
            { label: 'Sci-Fi', value: 'sci-fi' },
            { label: 'Seinen', value: 'seinen' },
            { label: 'Sexual Violence', value: 'sexual-violence' },
            { label: 'Shota', value: 'shota' },
            { label: 'Shoujo', value: 'shoujo' },
            { label: 'Shoujo Ai', value: 'shoujo-ai' },
            { label: 'Shounen', value: 'shounen' },
            { label: 'Shounen Ai', value: 'shounen-ai' },
            { label: 'Slice of Life', value: 'slice-of-life' },
            { label: 'Smut', value: 'smut' },
            { label: 'Sports', value: 'sports' },
            { label: 'Superhero', value: 'superhero' },
            { label: 'Supernatural', value: 'supernatural' },
            { label: 'Survival', value: 'survival' },
            { label: 'Thriller', value: 'thriller' },
            { label: 'Time Travel', value: 'time-travel' },
            { label: 'Traditional Games', value: 'traditional-games' },
            { label: 'Tragedy', value: 'tragedy' },
            { label: 'User Created', value: 'user-created' },
            { label: 'Vampires', value: 'vampires' },
            { label: 'Video Games', value: 'video-games' },
            { label: 'Villainess', value: 'villainess' },
            { label: 'Virtual Reality', value: 'virtual-reality' },
            { label: 'Web Comic', value: 'web-comic' },
            { label: 'Wuxia', value: 'wuxia' },
            { label: 'Yaoi', value: 'yaoi' },
            { label: 'Yuri', value: 'yuri' },
            { label: 'Zombies', value: 'zombies' }
        ],
        project: [
            { label: 'All Manga', value: false },
            { label: 'Project Only', value: true }
        ]
    };

    res.json({
        success: true,
        message: 'Available filter options for KomikCast API',
        data: filters,
        usage: {
            status: 'Use status filter to filter by completion status',
            type: 'Use type filter to filter by manga origin (Japan/Korea/China)',
            orderby: 'Use orderby filter to sort results',
            genres: 'Use genres filter with comma-separated values. Prefix with "-" to exclude (e.g., "action,-comedy")',
            project: 'Use project filter to show only project manga'
        }
    });
});

// Route for Popular Manga
app.get('/popular', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pagePath = page > 1 ? `page/${page}/` : '';
        const url = `${BASE_URL}${MANGA_URL_DIRECTORY}/${pagePath}?orderby=popular`;

        console.log(`Fetching popular manga from: ${url}`);

        const { data } = await axios.get(url, {
            headers: getHeaders(),
            timeout: 10000
        });
        
        const $ = cheerio.load(data);
        const mangaList = [];

        $('div.list-update_item').each((i, el) => {
            const manga = extractMangaFromElement($, el);
            if (manga.title) {
                mangaList.push(manga);
            }
        });

        res.json({
            success: true,
            page: page,
            data: mangaList,
            total: mangaList.length
        });
    } catch (error) {
        console.error('Error fetching popular manga:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch popular manga',
            message: error.message 
        });
    }
});

// Route for Latest Updates
app.get('/latest', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pagePath = page > 1 ? `page/${page}/` : '';
        const url = `${BASE_URL}${MANGA_URL_DIRECTORY}/${pagePath}?sortby=update`;

        console.log(`Fetching latest updates from: ${url}`);

        const { data } = await axios.get(url, {
            headers: getHeaders(),
            timeout: 10000
        });
        
        const $ = cheerio.load(data);
        const mangaList = [];

        $('div.list-update_item').each((i, el) => {
            const manga = extractMangaFromElement($, el);
            if (manga.title) {
                mangaList.push(manga);
            }
        });

        res.json({
            success: true,
            page: page,
            data: mangaList,
            total: mangaList.length
        });
    } catch (error) {
        console.error('Error fetching latest updates:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch latest updates',
            message: error.message 
        });
    }
});

// Route for Manga Search
app.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const page = parseInt(req.query.page) || 1;

        if (!query) {
            return res.status(400).json({ 
                success: false,
                error: 'Query parameter "q" is required for search.' 
            });
        }

        const url = `${BASE_URL}/page/${page}/?s=${encodeURIComponent(query)}`;

        console.log(`Searching manga with query "${query}" from: ${url}`);

        const { data } = await axios.get(url, {
            headers: getHeaders(),
            timeout: 10000
        });
        
        const $ = cheerio.load(data);
        const searchResults = [];

        $('div.list-update_item').each((i, el) => {
            const manga = extractMangaFromElement($, el);
            if (manga.title) {
                searchResults.push(manga);
            }
        });

        res.json({
            success: true,
            query: query,
            page: page,
            data: searchResults,
            total: searchResults.length
        });
    } catch (error) {
        console.error('Error during search:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'Failed to perform search',
            message: error.message 
        });
    }
});

// Route for Manga Details
app.get('/manga/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const url = `${BASE_URL}/manga/${slug}/`;

        console.log(`Fetching manga details from: ${url}`);

        const { data } = await axios.get(url, {
            headers: getHeaders(),
            timeout: 15000
        });
        
        const $ = cheerio.load(data);

        const mangaDetails = {
            title: '',
            alternative_title: '',
            author: '',
            artist: '',
            description: '',
            genre: [],
            status: '',
            type: '',
            thumbnail_url: '',
            chapters: []
        };

        // Extract manga details
        const seriesDetails = $("div.komik_info");
        if (seriesDetails.length > 0) {
            // Title
            let title = seriesDetails.find("h1.komik_info-content-body-title").text().trim();
            title = title.replace(/bahasa indonesia/i, '').trim();
            mangaDetails.title = title;

            // Alternative title
            const altName = seriesDetails.find(".komik_info-content-native").text().trim();
            mangaDetails.alternative_title = altName;

            // Author and Artist
            mangaDetails.author = seriesDetails.find(".komik_info-content-info:contains('Author') span").text().trim();
            mangaDetails.artist = seriesDetails.find(".komik_info-content-info:contains('Artist') span").text().trim();

            // Description
            const description = seriesDetails.find(".komik_info-description-sinopsis").map((i, el) => $(el).text().trim()).get().join('\n').trim();
            mangaDetails.description = description;

            // Genres
            const genres = seriesDetails.find(".komik_info-content-genre a").map((i, el) => $(el).text().trim()).get();
            
            // Type
            const seriesType = seriesDetails.find(".komik_info-content-info:contains('Type') span").text().trim();
            mangaDetails.type = seriesType;
            
            if (seriesType) {
                genres.push(seriesType);
            }
            
            mangaDetails.genre = genres.map(g => g.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()));

            // Status
            const statusText = seriesDetails.find(".komik_info-content-info:contains('Status')").text();
            mangaDetails.status = statusText.replace('Status', '').replace(':', '').trim();

            // Thumbnail
            mangaDetails.thumbnail_url = getImageAttr(seriesDetails.find(".komik_info-content-thumbnail img"));
        }

        // Extract chapters
        $('div.komik_info-chapters li').each((i, el) => {
            const $el = $(el);
            const chapterLinkElement = $el.find('a');
            const chapterName = $el.find('.chapter-link-item').text().trim();
            const chapterUrl = chapterLinkElement.attr('href') || '';
            const chapterDate = $el.find('.chapter-link-time').text().trim();

            if (chapterName && chapterUrl) {
                mangaDetails.chapters.push({
                    name: chapterName,
                    url: chapterUrl,
                    date_upload: parseChapterDate(chapterDate)
                });
            }
        });

        res.json({
            success: true,
            data: mangaDetails
        });

    } catch (error) {
        console.error('Error fetching manga details:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch manga details',
            message: error.message 
        });
    }
});

// Route for Chapter Images
app.get('/chapter/:slug/:chapterNumber', async (req, res) => {
    try {
        const { slug, chapterNumber } = req.params;
        const chapterUrl = `${BASE_URL}/chapter/${slug}-${chapterNumber}/`;

        console.log(`Fetching chapter images from: ${chapterUrl}`);

        const { data } = await axios.get(chapterUrl, {
            headers: getHeaders(`${BASE_URL}/`),
            timeout: 15000
        });
        
        const $ = cheerio.load(data);

        const images = [];
        $('div#chapter_body .main-reading-area img').each((i, el) => {
            const imageUrl = getImageAttr($(el));
            if (imageUrl && !images.some(img => img.url === imageUrl)) {
                images.push({
                    index: i,
                    url: imageUrl
                });
            }
        });

        // Alternative selector if the first one doesn't work
        if (images.length === 0) {
            $('.main-reading-area img, .reading-content img, #chapter_body img').each((i, el) => {
                const imageUrl = getImageAttr($(el));
                if (imageUrl && !images.some(img => img.url === imageUrl)) {
                    images.push({
                        index: i,
                        url: imageUrl
                    });
                }
            });
        }

        res.json({
            success: true,
            chapter: `${slug}-${chapterNumber}`,
            data: images,
            total: images.length
        });

    } catch (error) {
        console.error('Error fetching chapter images:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch chapter images',
            message: error.message 
        });
    }
});

// Route for Filtered Search
app.get('/filter', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const status = req.query.status || '';
        const type = req.query.type || '';
        const orderby = req.query.orderby || '';
        const genres = req.query.genres ? req.query.genres.split(',') : [];
        const project = req.query.project === 'true';

        let url = `${BASE_URL}`;
        const pagePath = page > 1 ? `page/${page}/` : '';

        if (project) {
            url += `${PROJECT_PAGE_STRING}/${pagePath}`;
        } else {
            url += `${MANGA_URL_DIRECTORY}/${pagePath}`;
        }

        const queryParams = [];
        if (status) queryParams.push(`status=${status}`);
        if (type) queryParams.push(`type=${type}`);
        if (orderby) queryParams.push(`orderby=${orderby}`);

        genres.forEach(genre => {
            const isExcluded = genre.startsWith('-');
            const genreValue = isExcluded ? genre.substring(1) : genre;
            queryParams.push(`genre[]=${isExcluded ? '-' : ''}${encodeURIComponent(genreValue)}`);
        });

        if (queryParams.length > 0) {
            url += `?${queryParams.join('&')}`;
        }

        console.log(`Fetching filtered manga from: ${url}`);

        const { data } = await axios.get(url, {
            headers: getHeaders(),
            timeout: 10000
        });
        
        const $ = cheerio.load(data);
        const mangaList = [];

        $('div.list-update_item').each((i, el) => {
            const manga = extractMangaFromElement($, el);
            if (manga.title) {
                mangaList.push(manga);
            }
        });

        res.json({
            success: true,
            page: page,
            filters: {
                status,
                type,
                orderby,
                genres,
                project
            },
            data: mangaList,
            total: mangaList.length
        });
    } catch (error) {
        console.error('Error fetching filtered manga:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch filtered manga',
            message: error.message 
        });
    }
});

// Endpoint Recommendation
app.get('/recommendation', async (req, res) => {
    try {
        const url = `${BASE_URL}/`;
        console.log(`Fetching recommendations from: ${url}`);
        const { data } = await axios.get(url, {
            headers: getHeaders(),
            timeout: 10000
        });
        const $ = cheerio.load(data);
        const recommendations = [];
        // Ambil semua .swiper-slide.splide-slide di dalam .swiper-wrapper
        $('.swiper-wrapper .swiper-slide.splide-slide').each((i, el) => {
            const rec = extractRecommendationFromElement($, el);
            if (rec.title && rec.link) recommendations.push(rec);
        });
        res.json({
            success: true,
            data: recommendations,
            total: recommendations.length
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recommendations',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        message: `The endpoint ${req.method} ${req.path} does not exist`
    });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KomikCast API Server is running on port ${PORT}`);
    console.log(`📖 Access API at http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}`);
});

module.exports = app;

