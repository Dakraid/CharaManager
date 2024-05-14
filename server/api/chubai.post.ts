// noinspection ExceptionCaughtLocallyJS
import ApiResponse from '~/models/ApiResponse';
import StatusCode from '~/models/enums/StatusCode';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const body = await readBody<string>(event);
    if (!body) {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'The request body is malformed or corrupted.');
    }

    const baseUrl = body.split('/characters/')[0];
    const characterPath = body.split('/characters/')[1];
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

            // noinspection ExceptionCaughtLocallyJS
            throw 'Unexpected response from Chub API received.';
        } catch (err) {
            return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Error occurred while trying to download from ChubAI', err);
        }
    } else {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'Unknown URL given.');
    }
});
