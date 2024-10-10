export interface Food {
  food_locality: null;
  id?: number;
  name: string;
  price: number;
  discount_price?: number | null;
  description?: string | null;
  perma_link?: string | null;
  ingredients?: string | null;
  package_items_count?: number | null;
  weight?: number | null;
  unit?: string | null;
  sku_code?: string | null;
  barcode?: string | null;
  cgst?: number | null;
  sgst?: number | null;
  subscription_type?: string | null;
  track_inventory: boolean;
  featured: boolean;
  deliverable: boolean;
  restaurant_id: number;
  category_id: number;
  subcategory_id?: number | null;
  product_type_id: number;
  hub_id?: number | null;
  locality_id?: number | null;
  product_brand_id: number;
  weightage?: number | null;
  status: boolean;
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