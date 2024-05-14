export default class PutDefinitionRequest {
    public readonly Id: number;
    public readonly Json: string;

    public constructor(id: number, json: string) {
        this.Id = id;
        this.Json = json;
    }
}
