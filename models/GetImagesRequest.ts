export default class GetImagesRequest {
    public readonly Reduced: boolean;
    public readonly Ids: number[];

    public constructor(reduced: boolean, ids: number[]) {
        this.Reduced = reduced;
        this.Ids = ids;
    }
}
