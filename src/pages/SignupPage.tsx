import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { AuthLayout } from "../components/AuthLayout";
import { FormInput } from "../components/FormInput";
import { supabase } from "../lib/supabase";

const signupSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = signupSchema.parse(formData);
      setIsLoading(true);

      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", validatedData.username)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingUser) {
        setErrors({ username: "Username is already taken" });
        return;
      }

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: validatedData.email,
          password: validatedData.password,
          options: {
            data: {
              username: validatedData.username,
            },
          },
        }
      );

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      // Create profile - this will trigger the database function to create user_stats
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          username: validatedData.username,
        },
      ]);

      if (profileError) throw profileError;

      // Redirect to login page after successful signup
      navigate("/login", {
        state: { message: "Account created successfully! Please log in." },
      });
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
        setErrors({ submit: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign Up">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="username"
          label="Username"
          type="text"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          error={errors.username}
          disabled={isLoading}
          required
        />

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

        <FormInput
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          error={errors.confirmPassword}
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
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-yellow-600 hover:text-yellow-700">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
