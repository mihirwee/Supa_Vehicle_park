import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, Profile } from "../lib/supabase";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role: "user" | "admin"
  ) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up initial session and user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      setIsLoading(false);
      return;
    }

    setProfile(data);
    setIsAdmin(data?.role === "admin");
    setIsLoading(false);
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    const user = data.user;
    console.log("user", user);
    if (!user) {
      console.log("No user found after login");
      return { error: { message: "Login failed" } };
    }

    // Fetch the user's profile to include their name in the log
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile for logging:", profileError);
    }

    // Dynamically set the entity based on the user's role
    const entity = profile?.role === "admin" ? "Admin" : "User";

    const { error: loggingError } = await supabase
      .from("activity_logs")
      .insert([
        {
          action: "LOGIN",
          timestamp: new Date().toISOString(),
          details: { entity, email },
          user_id: user.id,
        },
      ]);
    console.log("profile", profile);

    if (loggingError) {
      console.log("Error logging login activity:", loggingError);
    }

    return { error };
  }

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: "user" | "admin"
  ): Promise<{ error: any; data: any }> => {
    // Step 1: Create user with Supabase Auth
    console.log(email, password);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    console.log("data", data);

    if (error) return { error, data: null };

    const user = data.user;
    console.log("user", data.user);
    if (!user)
      return { error: { message: "User creation failed" }, data: null };

    // Step 2: Create profile record in DB
    const { error: profileError, data: profileData } = await supabase
      .from("profiles")
      .insert([
        {
          id: user.id,
          name,
          email,
          role,
        },
      ]);
    console.log("profile data", profileData);

    if (profileError) return { error: profileError, data: null };

    const { error: loggingError } = await supabase
      .from("activity_logs")
      .insert([
        {
          action: "SIGNUP",
          timestamp: new Date().toISOString(),
          details: { entity: role, email, name }, // Include role, email, and name
          user_id: user.id, // The ID of the newly created user
        },
      ]);

    if (loggingError) {
      console.error("Error logging sign-up activity:", loggingError);
    }

    console.log("profile error", profileError);
    return { error: null, data: profileData };
  };

  async function signOut() {
    if (!user) {
      console.error("No user is currently logged in.");
      return;
    }

    // Log the sign-out activity
    const { error: loggingError } = await supabase
      .from("activity_logs")
      .insert([
        {
          action: "SIGNOUT",
          timestamp: new Date().toISOString(),
          details: {
            entity: profile?.role || "Unknown",
            name: profile?.name || "Unknown",
          }, // Include role and name
          user_id: user.id, // The ID of the currently logged-in user
        },
      ]);

    if (loggingError) {
      console.error("Error logging sign-out activity:", loggingError);
    }

    // Perform the actual sign-out
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error during sign-out:", error);
    }

    // Clear local state
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  }

  const value = {
    session,
    user,
    profile,
    isAdmin,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
