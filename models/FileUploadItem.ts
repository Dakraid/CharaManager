export default class FileUploadItem {
    public readonly Name: string;
    public readonly LastModified: number;
    public readonly Content: string;

    public constructor(name: string, lastModified: number, content: string) {
        this.Name = name;
        this.LastModified = lastModified;
        this.Content = content;
    }
}
