// foodTypes.ts

export interface Media {
  id: number;
  model_type: string;
  model_id: number;
  uuid: string;
  collection_name: string;
  name: string;
  file_name: string;
  mime_type: string;
  disk: string;
  conversions_disk: string;
  size: number;
  manipulations: string;
  custom_properties: string;
  generated_conversions: string;
  responsive_images: string;
  order_column: number;
  created_at: Date;
  updated_at: Date;
  original_url: string; // Ensure this property is present
}

export interface Food {
  id: number;
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
  track_inventory?: boolean | null;
  featured?: boolean;
  deliverable?: boolean;
  restaurant_id: number;
  category_id: number;
  subcategory_id?: number | null;
  product_type_id?: number | null;
  hub_id?: number | null;
  locality_id?: number | null;
  product_brand_id?: number | null;
  weightage?: number | null;
  status?: boolean | null;
  created_at?: Date; // Add these properties if needed
  updated_at?: Date; // Add these properties if needed
  food_locality?: string | null;
  stockCount?: string | null | number;
  outOfStock?: string | null | number;
  media?: Media[]; // Ensure this property is present
}
