/**
 * HYMMOTO.TW Database Types
 * Comprehensive TypeScript interfaces for all Supabase tables
 */

export interface Brand {
  id: string;
  name: string;
  name_en: string;
  logo_url: string | null;
  country: string;
  established_year: number | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleSpec {
  id: string;
  brand_id: string;
  model_name: string;
  model_name_en: string;
  year: number;
  engine_cc: number;
  engine_type: string;
  transmission: string;
  fuel_type: string;
  seat_count: number;
  dry_weight: number | null;
  max_power_hp: number | null;
  max_torque_nm: number | null;
  top_speed_kmh: number | null;
  fuel_consumption_lkm: number | null;
  category: string;
  production_start: number | null;
  production_end: number | null;
  created_at: string;
  updated_at: string;
  brand?: Brand;
}

export interface SalesRaw {
  id: string;
  brand_id: string;
  model_id: string;
  year: number;
  month: number;
  sales_count: number;
  revenue_twd: number | null;
  market_share_percent: number | null;
  rank: number | null;
  data_source: string;
  created_at: string;
  updated_at: string;
  brand?: Brand;
  vehicle_spec?: VehicleSpec;
}

export interface SalesMonthlyAgg {
  id: string;
  brand_id: string;
  year: number;
  month: number;
  total_sales: number;
  total_revenue_twd: number | null;
  avg_price_twd: number | null;
  model_count: number;
  market_share_percent: number | null;
  rank: number | null;
  created_at: string;
  updated_at: string;
  brand?: Brand;
}

export interface BrandProfile {
  id: string;
  brand_id: string;
  description: string;
  description_en: string;
  market_position: string;
  target_demographic: string;
  product_range: string;
  social_media_links: Record<string, string> | null;
  headquarters_location: string;
  total_models_in_tw: number;
  dominant_segment: string;
  created_at: string;
  updated_at: string;
  brand?: Brand;
}

export interface CpoValuation {
  id: string;
  vehicle_spec_id: string;
  current_year: number;
  current_month: number;
  mileage_km: number;
  condition_rating: string; // excellent, good, fair, poor
  estimated_value_twd: number;
  price_range_min_twd: number;
  price_range_max_twd: number;
  depreciation_rate_percent: number;
  market_demand_level: string; // high, medium, low
  data_source: string;
  created_at: string;
  updated_at: string;
  vehicle_spec?: VehicleSpec;
}

export interface Article {
  id: string;
  title: string;
  title_en: string;
  slug: string;
  content: string;
  content_en: string;
  excerpt: string;
  excerpt_en: string;
  author: string;
  featured_image_url: string | null;
  category: string;
  tags: string[];
  published: boolean;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface UsedListing {
  id: string;
  vehicle_spec_id: string;
  seller_id: string;
  title: string;
  description: string;
  year: number;
  mileage_km: number;
  price_twd: number;
  condition: string; // excellent, good, fair, poor
  location: string;
  location_detail: string;
  contact_phone: string | null;
  contact_email: string | null;
  images_urls: string[];
  featured_image_url: string | null;
  status: string; // available, sold, pending
  listing_type: string; // individual, dealer
  created_at: string;
  updated_at: string;
  expires_at: string;
  vehicle_spec?: VehicleSpec;
  seller?: Member;
}

export interface Member {
  id: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  member_type: string; // individual, dealer, admin
  phone: string | null;
  location: string | null;
  business_name: string | null;
  business_id: string | null;
  verification_status: string; // unverified, verified, rejected
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface BusinessShop {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string | null;
  business_license: string | null;
  verification_status: string; // unverified, verified, rejected
  rating: number;
  total_reviews: number;
  established_year: number | null;
  operating_hours: Record<string, string> | null; // day -> hours mapping
  services: string[];
  brands_sold: string[]; // array of brand IDs
  featured_image_url: string | null;
  images_urls: string[];
  created_at: string;
  updated_at: string;
  owner?: Member;
}

export interface Database {
  public: {
    Tables: {
      brand: {
        Row: Brand;
        Insert: Omit<Brand, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Brand, 'id'>>;
      };
      vehicle_spec: {
        Row: VehicleSpec;
        Insert: Omit<VehicleSpec, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<VehicleSpec, 'id'>>;
      };
      sales_raw: {
        Row: SalesRaw;
        Insert: Omit<SalesRaw, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SalesRaw, 'id'>>;
      };
      sales_monthly_agg: {
        Row: SalesMonthlyAgg;
        Insert: Omit<SalesMonthlyAgg, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SalesMonthlyAgg, 'id'>>;
      };
      brand_profile: {
        Row: BrandProfile;
        Insert: Omit<BrandProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BrandProfile, 'id'>>;
      };
      cpo_valuation: {
        Row: CpoValuation;
        Insert: Omit<CpoValuation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CpoValuation, 'id'>>;
      };
      article: {
        Row: Article;
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Article, 'id'>>;
      };
      used_listing: {
        Row: UsedListing;
        Insert: Omit<UsedListing, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UsedListing, 'id'>>;
      };
      member: {
        Row: Member;
        Insert: Omit<Member, 'id' | 'created_at' | 'updated_at' | 'last_login_at'>;
        Update: Partial<Omit<Member, 'id'>>;
      };
      business_shop: {
        Row: BusinessShop;
        Insert: Omit<BusinessShop, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BusinessShop, 'id'>>;
      };
    };
  };
}
