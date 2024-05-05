export interface CharacterGetRequest {
    page: number;
    count: number;
    order?: string;
    filter?: string;
}
