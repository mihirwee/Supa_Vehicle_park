export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: "user" | "admin";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role?: "user" | "admin";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: "user" | "admin";
          created_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          make: string;
          model: string;
          year: number;
          type: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          make: string;
          model: string;
          year: number;
          type: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          make?: string;
          model?: string;
          year?: number;
          type?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
}
