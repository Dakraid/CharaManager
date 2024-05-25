import { resolve } from 'path';
import { createLogger, format, transports } from 'winston';
import { mkdirIfNotExists } from '~/utils/winston';

export default defineEventHandler((event) => {
    const { combine, timestamp, json, errors } = format;
    const LOG_PATH = './logs';
    const FILE_NAME = `server.log`;

    mkdirIfNotExists(resolve(process.cwd(), LOG_PATH));

    event.context.logger = createLogger({
        exitOnError: false,
        format: combine(timestamp(), errors({ stack: true }), json()),
        transports: [
            new transports.File({
                filename: resolve(LOG_PATH, FILE_NAME),
            }),
        ],
    });
});
