const puppeteer = require('puppeteer');
const fs = require('fs');

async function read(dollName) {
    let data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

    // creates browser instance
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true
    });

    // opens pages for 3 websites
    await pageFactory(browser, data);
    var pages = await browser.pages();      // array of the pages
    var linkChoices = [];
    for (let i = 0; i < data.length; i++) {
        let results = await searchLinks(pages[i + 1], dollName, data[i].searchBox, data[i].searchResults, data[i].analysisText, data[i].dollTitle);
        linkChoices[i] = results;
    }
    browser.close();
    return linkChoices;
}

async function pageFactory(browser, data) {
    for (i = 0; i < data.length; i++) {
        let page = await browser.newPage();
        let url = data[i].url;
        // Blocks all javascript, css, imgs, fonts
        await page.setRequestInterception(true);
        page.on('request', request => {
            if (request.resourceType() === 'script' || request.resourceType() == 'stylesheet' || request.resourceType() == 'font' || request.resourceType() == 'image')
                request.abort();
            else
                request.continue();
        });

        console.log(`Navigating to ${url}...`);
        await page.goto(url);
    }
    return;
}

async function searchLinks(page, dollName, searchBox, searchResults, analysisText, dollTitle) {
    await page.bringToFront();

    // Uses website search bar to navigate to search page
    await page.focus(searchBox);
    await page.keyboard.type(dollName);
    await page.keyboard.press('Enter');
    console.log(`Searching for ${dollName}...... `);

    await page.waitForNavigation();
    // This checks for search results, and returns results + links in an object
    if ((await page.$(searchResults)) !== null) {
        let search = await page.$(searchResults);
        let links = await search.$$eval('a', el => el.map(n => n.href));
        let linksText = await search.$$eval('a', el => el.map(n => n.innerText));
        const regex = /( – )([\s\S]*)/;
        linksText = linksText.map(el => el.replace(regex, ''));
        // This turns the search results into a 'dict'
        let obj = {};
        for (let i = 0; i < links.length; i++) {
            obj[linksText[i]] = links[i];
        }
        console.log(obj);
        return obj;
    // This checks for an analysis, and returns the identifier and analysis text
    } else if ((await page.$(analysisText)) !== null) {
        let dollName = await page.$eval(dollTitle, el => el.innerText);
        let url = page.url();
        let obj = {};
        obj[dollName] = url;
        return obj;
    } else {
        return 0;    // Returns error code
    }
}

async function searchAnalysis(page, analysisText) {
    await page.bringToFront();

    if ((await page.$(analysisText)) !== null) {
        let analysis = await page.$eval(analysisText, el => el.innerText);
        return analysis;
    }
}

async function getAnalysis(links) {
    let data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true
    });
    await pageFactory(browser, links);
    let pages = await browser.pages();      // array of the pages
    let analysis = [];
    for (let i = 0; i < links.length; i++) {
        let results = await searchAnalysis(pages[i + 1], data[i].analysisText);
        analysis[i] = results;
    }
    return analysis;
}

module.exports = {
    read, getAnalysis
};
