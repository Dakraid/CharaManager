export default class PutImageRequest {
    public readonly Id: number;
    public readonly Base64Image: string;

    public constructor(id: number, base64Image: string) {
        this.Id = id;
        this.Base64Image = base64Image;
    }
}
