export interface Food {
  id?: number;
  name: string;
  price: number;
  discount_price?: number | null;
  description?: string | null;
  product_type_id: number;
  product_brand_id: number;
  locality_id?: string | null;
  weightage: string;
  image?: string | null;
  unit_size: string;
  sku_code?: string | null;
  barcode?: string | null;
  cgst?: number | null;
  sgst?: number | null;
  category_id: number;
  subcategory_id?: number | null;
  featured: boolean;
  subscription: boolean;
  track_inventory: boolean;
  status: boolean;
  restaurant_id: number;
}

export interface Media {
  // id: bigint;
  model_type: string;
  model_id: bigint;
  uuid: string;
  collection_name: string;
  name: string;
  file_name: string;
  mime_type: string;
  disk: string;
  conversions_disk: string;
  size: bigint;
  manipulations: object;
  custom_properties: object; 
  generated_conversions: object; 
  responsive_images: object; 
  order_column: number;
  created_at: string; 
  updated_at: string; 
}