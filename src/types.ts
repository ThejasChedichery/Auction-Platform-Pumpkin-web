export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuctionItem {
  id: number;
  name: string;
  description: string;
  image_url: string;
  current_bid: number;
  last_bidder_id: number | null;
  last_bidder: string | null;
  last_bid_time: string | null;
  is_locked: boolean;
  lock_expires_at: string | null;
  version: number;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}