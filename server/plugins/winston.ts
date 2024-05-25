import { resolve } from 'path';
import { createLogger, format, transports } from 'winston';
import { mkdirIfNotExists } from '~/utils/winston';

export default defineNitroPlugin((nitro) => {
    const { combine, timestamp, json, errors } = format;
    const LOG_PATH = './logs';
    const FILE_NAME = `server.error.log`;

    mkdirIfNotExists(resolve(process.cwd(), LOG_PATH));

    const loggerWinston = createLogger({
        exitOnError: false,
        format: combine(timestamp(), errors({ stack: true }), json()),
        transports: [
            new transports.File({
                filename: resolve(LOG_PATH, FILE_NAME),
            }),
        ],
    });

    nitro.hooks.hook('error', async (error, { event }) => {
        loggerWinston.error(`${event?.path} Server Error:`, error);
    });
});
