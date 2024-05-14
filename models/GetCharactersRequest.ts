export default class GetCharactersRequest {
    public readonly Page: number;
    public readonly Count: number;
    public readonly Order: string;
    public readonly Filter: string;

    public constructor(page: number, count: number, order: string, filter: string) {
        this.Page = page;
        this.Count = count;
        this.Order = order;
        this.Filter = filter;
    }
}
