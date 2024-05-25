import { defineNuxtPlugin } from '#app';
import { resolve } from 'path';
import { createLogger, format, transports } from 'winston';

import { mkdirIfNotExists } from '../utils/winston';

export default defineNuxtPlugin({
    name: 'WinstonLogger',
    enforce: 'pre', // or 'post'
    async setup(nuxtApp) {
        const { combine, timestamp, json, errors } = format;
        const LOG_PATH = './logs';
        const FILE_NAME = 'application.log';

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

        return {
            provide: {
                logger: () => {
                    return loggerWinston;
                },
            },
        };
    },
    hooks: {
        'page:finish'(pageComponent) {
            const nuxtApp = useNuxtApp();
            nuxtApp.$logger().info('Accessed ' + pageComponent);
        },
        'app:error'(error) {
            const nuxtApp = useNuxtApp();
            nuxtApp.$logger().error(error);
        },
        'vue:error'(error, target, info) {
            const nuxtApp = useNuxtApp();
            nuxtApp.$logger().error(error + ' ' + target + ' ' + info);
        },
    },
    env: {
        islands: true,
    },
});
