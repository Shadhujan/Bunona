/**
 * AuthLayout component provides a layout for authentication pages.
 * It includes a background gradient, a centered container for content, and decorative elements.
 *
 * @param {Object} props - The properties object.
 * @param {React.ReactNode} props.children - The child components to be rendered inside the layout.
 * @param {string} props.title - The title to be displayed at the top of the layout.
 *
 * @returns {JSX.Element} The rendered AuthLayout component.
 *
 * @example
 * <AuthLayout title="Sign In">
 *   <SignInForm />
 * </AuthLayout>
 *
 * @component
 * @example
 * // Example usage:
 * <AuthLayout title="Welcome">
 *   <LoginForm />
 * </AuthLayout>
 *
 * @remarks
 * This component uses Tailwind CSS for styling and includes a background gradient,
 * a centered container with a border, and decorative banana icons.
 * The title is displayed at the top of the container, and children components are rendered below the title.
 */

import React from "react";
import { Banana } from "lucide-react";
import Footer from "./Footer";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center p-4">
      <div className="flex items-center absolute top-0 left-10 m-4">
        <img
          src="https://img.icons8.com/?size=100&id=R1nP024hkUWg&format=png&color=000000"
          alt="Icon"
          className="w-12 h-12 mr-2"
        />
        <h1 className="text-6xl font-bold text-yellow-600 ">Bunona</h1>
      </div>
      <div className="bg-white/90 rounded-lg border-2 border-yellow-500 p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-yellow-500 rounded-full p-4 mb-4">
            <Banana className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#4A2C00]">{title}</h1>
        </div>
        {children}
      </div>

      {/* Decorative Bananas */}
      <div className="fixed bottom-0 left-0 w-24 h-24 transform -rotate-12">
        <Banana className="w-full h-full text-yellow-600 opacity-20" />
      </div>
      <div className="fixed top-0 right-0 w-24 h-24 transform rotate-45">
        <Banana className="w-full h-full text-yellow-600 opacity-20" />
      </div>
    </div>
    <Footer />
    </>
  );
}
