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
