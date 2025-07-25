"use client";

import { useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Message } from "primereact/message";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth-service";
import { TokenStorage } from "@/lib/token-storage";
import {
  Shield,
  Eye,
  EyeSlash,
  Lock,
  User
} from "@phosphor-icons/react";
import Image from "next/image";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await AuthService.login(email, password);

      const token = TokenStorage.getTokens()?.token;
      if (token) {
        TokenStorage.setTokens({
          token: token,
          refreshToken: token
        });

        // Check if user has admin role
        const userProfile = await AuthService.getUserProfile();
        if (userProfile.roles.some((role) => role.name === "admin")) {
          router.push("/dashboard");
        } else {
          setError("Access denied. Admin privileges required.");
          TokenStorage.clearTokens();
        }
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/broglow-logo.png"
                alt="BroGlow Admin"
                width={200}
                height={60}
                className="h-12 w-auto"
              />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield size={24} className="text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            </div>
            <p className="text-gray-600">Sign in to access the admin dashboard</p>
          </div>

          {error && (
            <Message
              severity="error"
              text={error}
              className="mb-4"
            />
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <span className="p-input-icon-left w-full">
                <User className="p-input-icon-left" />
                <InputText
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@broglow.com"
                  className="w-full"
                  required
                />
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <span className="p-input-icon-left w-full">
                <Lock className="p-input-icon-left" />
                <Password
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full"
                  required
                  toggleMask
                  feedback={false}
                  icon={
                    showPassword ? (
                      <EyeSlash size={16} />
                    ) : (
                      <Eye size={16} />
                    )
                  }
                />
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Checkbox
                  inputId="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.checked ?? false)}
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <a
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              label="Sign In"
              loading={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="large"
            />
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact{" "}
              <a href="mailto:support@broglow.com" className="text-blue-600 hover:text-blue-800">
                support@broglow.com
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
