export class Character {
    // ID is filled by the database, so when creating a new card to be inserted we can't assign one yet
    id: number | undefined;
    hash: string;
    full_name: string;
    file_name: string;
    timestamp: number;
    formatted_timestamp: string;
    image_content: string;
    rating: number;

    public constructor(hash: string, full_name: string, file_name: string, timestamp: number, formatted_timestamp: string, image_content: string, rating: number, id?: number) {
        this.hash = hash;
        this.full_name = full_name;
        this.file_name = file_name;
        this.timestamp = timestamp;
        this.formatted_timestamp = formatted_timestamp;
        this.image_content = image_content;
        this.rating = rating;
        this.id = id;
    }
}
