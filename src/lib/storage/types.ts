// 1. The Data Structure (What comes back)
export interface Entity {
    id: string;
    [key: string]: any;
}

// 2. The Filter/Query Structure (How we ask for data)
export interface QueryParams {
    collection: string;
    limit?: number;
    filter?: Record<string, any>;
}

// 3. The Gold Standard Contract (Every adapter MUST implement this)
export interface StorageAdapter {
    list(params: QueryParams): Promise<Entity[]>;
    get(collection: string, id: string): Promise<Entity>;
    create(collection: string, data: any): Promise<Entity>;
    update(collection: string, id: string, data: any): Promise<Entity>;
    delete(collection: string, id: string): Promise<void>;
}
