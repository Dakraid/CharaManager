import type { Config } from 'drizzle-kit';

export default {
    schema: './utils/schema.ts',
    out: './utils/drizzle',
    driver: 'better-sqlite',
    dbCredentials: {
        url: '.data/CharaManager.sqlite3',
    },
} satisfies Config;
