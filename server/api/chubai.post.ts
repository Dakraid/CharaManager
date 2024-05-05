import type { ChubAiGetRequest } from '~/models/ChubAiGetRequest';
import { status_failure_chubai_get, status_success_chubai_get } from '~/models/StatusResponses';

export default defineEventHandler(async (event) => {
    const body = await readBody<ChubAiGetRequest>(event);
    if (!body) {
        return null;
    }

    const characterPath = body.characterUrl.replace('https://www.chub.ai/characters/', '');
    const fileName = 'main_' + characterPath.split('/')[1] + '_spec_v2.png';
    try {
        const apiResponse = <Blob>await $fetch("https://api.chub.ai/api/characters/download", {
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
            return status_failure_chubai_get;
        }

        const buffer = Buffer.from(await apiResponse.arrayBuffer());
        const response = status_success_chubai_get;
        response.content = { name: fileName, lastModified: Date.now(), content: 'data:' + apiResponse.type + ';base64,' + buffer.toString('base64') };
        return response;
    } catch (e) {
        const response = status_failure_chubai_get;
        response.content = e;
        return response;
    }
});
