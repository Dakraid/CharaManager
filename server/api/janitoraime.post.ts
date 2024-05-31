import fs from 'node:fs';
import playwright from 'playwright';
import ApiResponse from '~/models/ApiResponse';
import StatusCode from '~/models/enums/StatusCode';

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
        const browser = await playwright.chromium.launch({ headless: true });
        const context = await browser.newContext({ acceptDownloads: true });
        const page = await context.newPage();
        await page.goto(characterUrl);
        await page.click('button:has-text("Download")');
        const download = await page.waitForEvent('download');
        await download.saveAs(`./temp/${characterFilename}.png`);
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
