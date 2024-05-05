export class CharacterCard {
    id: number | undefined;
    hash: string | undefined;
    full_name: string | undefined;
    file_name: string | undefined;
    timestamp: number | undefined;
    formatted_timestamp: string | undefined;
    image_content: string | undefined;

    public constructor(id?: number, hash?: string, full_name?: string, file_name?: string, timestamp?: number, formatted_timestamp?: string, image_content?: string) {
        this.id = id;
        this.hash = hash;
        this.full_name = full_name;
        this.file_name = file_name;
        this.timestamp = timestamp;
        this.formatted_timestamp = formatted_timestamp;
        this.image_content = image_content;
    }
}
