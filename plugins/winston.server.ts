import { defineNuxtPlugin } from '#app';
import { resolve } from 'path';
import { createLogger, format, transports } from 'winston';

import { mkdirIfNotExists } from '../utils/winston';

export default defineNuxtPlugin(async (nuxtApp) => {
    const { combine, timestamp, json, errors } = format;
    const LOG_PATH = './logs';
    const FILE_NAME = `log.access.log`;

    mkdirIfNotExists(resolve(process.cwd(), LOG_PATH));

    let loggerWinston: any;

    // eslint-disable-next-line prefer-const
    loggerWinston = createLogger({
        exitOnError: false,
        format: combine(timestamp(), errors({ stack: true }), json()),
        transports: [
            new transports.File({
                filename: resolve(LOG_PATH, FILE_NAME),
            }),
        ],
    });

    nuxtApp.hook('page:finish', (pageComponent) => loggerWinston.info('Accessed ' + pageComponent));

    nuxtApp.hook('app:error', (error) => loggerWinston.error(error));

    nuxtApp.hook('vue:error', (error, target, info) => loggerWinston.error(error + ' ' + target + ' ' + info));

    return {
        provide: {
            logger: () => {
                return loggerWinston;
            },
        },
    };
});
