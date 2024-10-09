import { RowDataPacket } from "mysql2";

export interface CategoryType extends RowDataPacket {
    id: number;
    name: string;
    description: string;
    weightage: string;
    created_at: Date;
    updated_at: Date;
}

export interface MediaType extends RowDataPacket {
    media_id: number;
    model_type: string;
    uuid: string;
    collection_name: string;
    media_name: string;
    file_name: string;
    mime_type: string;
    disk: string;
    conversions_disk: string;
    size: number;
    media_created_at: Date;
    media_updated_at: Date;
    original_url: string;
}