export default function (contentWidth: number, itemWidth: number = 248) {
    const maxItemsPerRow = Math.floor(contentWidth / itemWidth);
    const newOptions = [
        { value: maxItemsPerRow, label: '1 Row (' + maxItemsPerRow + ' Items)' },
        { value: maxItemsPerRow * 2, label: '2 Rows (' + maxItemsPerRow * 2 + ' Items)' },
        { value: maxItemsPerRow * 3, label: '3 Rows (' + maxItemsPerRow * 3 + ' Items)' },
        { value: maxItemsPerRow * 4, label: '4 Rows (' + maxItemsPerRow * 4 + ' Items)' },
        { value: maxItemsPerRow * 5, label: '5 Rows (' + maxItemsPerRow * 5 + ' Items)' },
        { value: maxItemsPerRow * 10, label: '10 Rows (' + maxItemsPerRow * 10 + ' Items)' },
        { value: maxItemsPerRow * 20, label: '20 Rows (' + maxItemsPerRow * 20 + ' Items)' },
        { value: maxItemsPerRow * 50, label: '50 Rows (' + maxItemsPerRow * 50 + ' Items)' },
    ];

    return { maxItemsPerRow: maxItemsPerRow, newOptions: newOptions };
}
