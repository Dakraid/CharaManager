export class CharacterRelations {
    public readonly Parent: number;
    public readonly Children: number[];

    public constructor(parent: number, children: number[]) {
        this.Parent = parent;
        this.Children = children;
    }
}

export default CharacterRelations;
