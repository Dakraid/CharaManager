import Grammarify from 'grammarify-ts';
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
    const correction = new Grammarify();

    return new ApiResponse(StatusCode.OK, correction.clean(body.text));
});
