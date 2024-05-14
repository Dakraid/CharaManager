export default class PutDefinitionRequest {
    public readonly Id: number;
    public readonly Json: string;
    public readonly DefinitionOnly: boolean;

    public constructor(id: number, json: string, definitionOnly: boolean = false) {
        this.Id = id;
        this.Json = json;
        this.DefinitionOnly = definitionOnly;
    }
}
