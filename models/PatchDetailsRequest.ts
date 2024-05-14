import type CharacterDetails from '~/models/CharacterDetails';

export default class PatchDetailsRequest {
    public readonly Details: CharacterDetails;

    public constructor(details: CharacterDetails) {
        this.Details = details;
    }
}
