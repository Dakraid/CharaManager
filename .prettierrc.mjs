const config = {
    plugins: ['@trivago/prettier-plugin-sort-imports'],
    printWidth: 200,
    tabWidth: 4,
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    bracketSameLine: true,
    endOfLine: 'lf',
    importOrder: ['^@core/(.*)$', '^@server/(.*)$', '^@ui/(.*)$', '^[./]'],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
};

export default config;
