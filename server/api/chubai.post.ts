// noinspection ExceptionCaughtLocallyJS
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

    const baseUrl = body.characterUrl.split('/characters/')[0];
    const characterPath = body.characterUrl.split('/characters/')[1];
    const fileName = 'main_' + characterPath.split('/')[1] + '_spec_v2.png';

    if (baseUrl.includes('chub.ai') || baseUrl.includes('characterhub.org')) {
        try {
            const apiResponse = await $fetch('https://api.chub.ai/api/characters/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullPath: characterPath,
                    format: 'tavern',
                    version: 'main',
                }),
            });

            if (!apiResponse) {
                event.context.logger.error('Error occurred while trying to download from ChubAI.');
                return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Error occurred while trying to download from ChubAI');
            }

            if (apiResponse instanceof Blob) {
                const buffer = Buffer.from(await apiResponse.arrayBuffer());
                return new ApiResponse(StatusCode.OK, 'Downloaded Character from ChubAI.', {
                    name: fileName,
                    lastModified: Date.now(),
                    content: 'data:' + apiResponse.type + ';base64,' + buffer.toString('base64'),
                });
            }

            event.context.logger.error('Unexpected response from Chub API received. Response: ' + apiResponse);
            // noinspection ExceptionCaughtLocallyJS
            throw 'Unexpected response from Chub API received.';
        } catch (err) {
            event.context.logger.error(err);
            return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Error occurred while trying to download from ChubAI', err);
        }
    } else {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'Unknown URL given.');
    }
});
