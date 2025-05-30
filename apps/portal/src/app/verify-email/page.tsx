"use client";
import { AuthService } from "@/services/auth-service";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "primereact/button";

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setIsLoading(false);
        setIsSuccess(false);
        setMessage("Token xác thực không hợp lệ. Vui lòng thử lại!");
        return;
      }

      try {
        setIsLoading(true);
        const result = await AuthService.verifyEmail(token);
        setIsSuccess(result.success);
        setMessage(result.message);
      } catch (error) {
        setIsSuccess(false);
        setMessage(
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi xác thực email. Vui lòng thử lại!"
        );
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={150}
            height={50}
            priority
            className="h-auto w-auto"
          />
        </div>

        <h1 className="text-2xl font-bold text-center mb-6">
          {isLoading ? "Đang xác thực email..." : "Xác thực email"}
        </h1>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-orange"></div>
          </div>
        ) : (
          <div className="text-center">
            {isSuccess ? (
              <div className="flex flex-col items-center gap-6">
                <div className="bg-green-100 text-green-700 p-4 rounded-lg">
                  <p className="text-lg font-semibold">Xác thực thành công!</p>
                  <p>{message}</p>
                </div>
                <Button
                  label="Đăng nhập ngay"
                  className="bg-primary-orange border-primary-orange hover:bg-primary-orange/90 hover:border-primary-orange/90"
                  onClick={() => router.push("/login")}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                  <p className="text-lg font-semibold">Xác thực thất bại</p>
                  <p>{message}</p>
                </div>
                <Link
                  href="/login"
                  className="text-primary-orange hover:underline"
                >
                  Quay lại trang đăng nhập
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
