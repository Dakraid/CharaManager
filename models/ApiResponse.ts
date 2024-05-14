import type StatusCode from '~/models/enums/StatusCode';

export class ApiResponse {
    public readonly Status: StatusCode;
    public readonly Message: string;
    public Content: any;

    public constructor(status: StatusCode, message: string, content?: any) {
        this.Status = status;
        this.Message = message;
        this.Content = content;
    }
}

export default ApiResponse;
