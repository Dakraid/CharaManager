import fs from 'node:fs';
import playwright from 'playwright';
import { addExtra } from 'playwright-extra';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import ApiResponse from '~/models/ApiResponse';
import StatusCode from '~/models/enums/StatusCode';

async function setupPlaywrightChromium(captchaSolverKey: string) {
    const chromium = addExtra(playwright.chromium);
    chromium.use(StealthPlugin());
    if (captchaSolverKey != '') {
        chromium.use(RecaptchaPlugin({ provider: { id: '2captcha', token: captchaSolverKey } }));
    }
    // For some reason dependency resolution fails by default, so we import the defaults here manually
    chromium.plugins.setDependencyResolution('stealth/evasions/chrome.app', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/chrome.csi', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/chrome.loadTimes', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/chrome.runtime', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/defaultArgs', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/iframe.contentWindow', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/media.codecs', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/navigator.hardwareConcurrency', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/navigator.languages', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/navigator.permissions', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/navigator.plugins', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/navigator.webdriver', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/sourceurl', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/user-agent-override', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/webgl.vendor', StealthPlugin);
    chromium.plugins.setDependencyResolution('stealth/evasions/window.outerdimensions', StealthPlugin);
    return await chromium.launch({ headless: true });
}

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);

    const apiKey = event.headers.get('x-api-key');
    if (!apiKey || apiKey !== config.apiKey) {
        return new ApiResponse(StatusCode.FORBIDDEN, 'Missing or invalid API key given.');
    }

    const body = await readBody(event);
    if (!body) {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'The request body is malformed or corrupted.');
    }

    const characterUrl = body.characterUrl;
    const characterFilename = body.characterUrl.split('characters/')[1];

    try {
        const browser = await setupPlaywrightChromium(config.captchaSolverKey);
        const context = await browser.newContext({ acceptDownloads: true });
        const page = await context.newPage();
        await page.goto(characterUrl);
        await page.waitForURL(characterUrl);
        await page.click('button:has-text("Download")');
        const download = await page.waitForEvent('download');
        await download.saveAs(`./temp/${characterFilename}.png`);
        await browser.close();
    } catch (err) {
        event.context.logger.error(err);
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Error occurred while trying to download from JanitorAI.me', err);
    }

    let characterFile = '';
    try {
        characterFile = fs.readFileSync(`./temp/${characterFilename}.png`).toString('base64');
        fs.unlinkSync(`./temp/${characterFilename}.png`);
    } catch (err) {
        event.context.logger.error(err);
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Failed to handle downloaded file', err);
    }

    if (characterFile.length > 0) {
        return new ApiResponse(StatusCode.OK, 'Downloaded Character from JanitorAI.me.', {
            name: `${characterFilename}.png`,
            lastModified: Date.now(),
            content: 'data:image/png;base64,' + characterFile,
        });
    }

    return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Unknown error occurred.');
});
