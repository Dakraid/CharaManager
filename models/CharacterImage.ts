export class CharacterImage {
    // ID is filled by the database, so when creating a new card to be inserted we can't assign one yet
    id: number;
    content: string | undefined;
    content_small: string | undefined;

    public constructor(id: number, content?: string, content_small?: string) {
        this.id = id;
        this.content = content;
        this.content_small = content_small;
    }
}

export default CharacterImage;
