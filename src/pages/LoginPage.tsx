import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { AuthLayout } from "../components/AuthLayout";
import { FormInput } from "../components/FormInput";
import { supabase } from "../lib/supabase";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const ensureProfileExists = async (userId: string, username: string) => {
    try {
      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      // If profile doesn't exist, create it
      if (!existingProfile) {
        const { error: profileError } = await supabase.auth.updateUser({
          data: { username },
        });

        if (profileError) throw profileError;

        const { error: insertError } = await supabase
          .from("profiles")
          .insert([
            {
              id: userId,
              username: username,
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error("Error ensuring profile exists:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = loginSchema.parse(formData);
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Get or generate username
        const username =
          data.user.user_metadata.username ||
          `user_${data.user.id.slice(0, 8)}`;

        // Ensure profile exists
        await ensureProfileExists(data.user.id, username);
      }

      // Redirect to main menu after successful login
      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      } else if (error instanceof Error) {
        setErrors({ submit: "Invalid email or password" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Login">
      {location.state?.message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-md text-green-700 text-sm">
          {location.state.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          disabled={isLoading}
          required
        />

        <FormInput
          id="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          error={errors.password}
          disabled={isLoading}
          required
        />

        {errors.submit && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-500 text-sm">
            {errors.submit}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-yellow-600 hover:text-yellow-700">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
