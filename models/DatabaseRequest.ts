import type { DatabaseAction } from '~/models/enums/DatabaseAction';

export default class DatabaseRequest {
    public readonly Action: DatabaseAction;

    public constructor(action: DatabaseAction) {
        this.Action = action;
    }
}
