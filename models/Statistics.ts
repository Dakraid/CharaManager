export interface Statistics {
    charCount?: number;
    charAuthors?: Author[];
    charDates?: CharDate[];
}

export class Author {
    name: string;
    count: number;

    public constructor(name: string, count: number) {
        this.name = name;
        this.count = count;
    }
}

export class CharDate {
    date: string;
    count: number;

    public constructor(date: string, count: number) {
        this.date = date;
        this.count = count;
    }
}
