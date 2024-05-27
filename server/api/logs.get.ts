import fs from 'fs';
import { resolve } from 'path';
import ApiResponse from '~/models/ApiResponse';
import StatusCode from '~/models/enums/StatusCode';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);

    const apiKey = event.headers.get('x-api-key');
    if (!apiKey || apiKey !== config.apiKey) {
        return new ApiResponse(StatusCode.FORBIDDEN, 'Missing or invalid API key given.');
    }

    const appLogPath = './logs/application.log';
    let appLog = '';
    try {
        appLog = fs.readFileSync(appLogPath, { encoding: 'utf-8' });
    } catch (error) {
        event.context.logger.error(error);
    }

    const serverLogPath = './logs/server.log';
    let serverLog = '';
    try {
        serverLog = fs.readFileSync(serverLogPath, { encoding: 'utf-8' });
    } catch (error) {
        event.context.logger.error(error);
    }

    const serverErrorLogPath = './logs/server.error.log';
    let serverErrorLog = '';
    try {
        serverErrorLog = fs.readFileSync(serverErrorLogPath, { encoding: 'utf-8' });
    } catch (error) {
        event.context.logger.error(error);
    }

    return new ApiResponse(StatusCode.OK, 'Retrieved logs.', { appLog: appLog, serverLog: serverLog, serverErrorLog: serverErrorLog });
});
