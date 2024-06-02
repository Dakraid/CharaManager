export default class GetCharactersRequest {
    public readonly Page: number;
    public readonly Count: number;
    public readonly Order: string;
    public readonly Filter: string;

    public constructor(page: number, filter: string, count: number, order: string) {
        this.Page = page;
        this.Filter = filter;
        this.Count = count;
        this.Order = order;
    }
}
