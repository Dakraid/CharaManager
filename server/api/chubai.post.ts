// noinspection ExceptionCaughtLocallyJS

import type { ChubAiGetRequest } from '~/models/ChubAiGetRequest';
import { status_failure_chubai_get, status_success_chubai_get } from '~/models/StatusResponses';
import * as fs from "node:fs";

export default defineEventHandler(async (event) => {
    const body = await readBody<ChubAiGetRequest>(event);
    if (!body) {
        return null;
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
                return status_failure_chubai_get;
            }

            if (apiResponse instanceof Blob) {
                const buffer = Buffer.from(await apiResponse.arrayBuffer());
                const response = status_success_chubai_get;
                response.content = { name: fileName, lastModified: Date.now(), content: 'data:' + apiResponse.type + ';base64,' + buffer.toString('base64') };
                return response;
            }

            throw "Unexpected response from Chub API received.";
        } catch (e) {
            const response = status_failure_chubai_get;
            response.content = e;
            return response;
        }
    } else {
        const response = status_failure_chubai_get;
        response.content = 'Unknown URL given.';
        return response;
    }
});
