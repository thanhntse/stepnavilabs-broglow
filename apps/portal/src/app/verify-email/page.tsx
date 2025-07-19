"use client";
import { AuthService } from "@/services/auth-service";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "primereact/button";
import { Check, X } from "@phosphor-icons/react";

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setIsLoading(false);
        setIsSuccess(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await AuthService.verifyEmail(token);
        setIsSuccess(result.success);
      } catch {
        setIsSuccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-primary-pastel to-white">
      <div className="w-full p-2 lg:p-4 flex flex-col justify-center items-center">
        <div className="mx-auto w-full max-w-md bg-white p-8 rounded-2xl shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/broglow-logo.png"
            alt="Logo"
            width={200}
            height={90}
            priority
            className="cursor-pointer"
            onClick={() => router.push("/")}
          />
        </div>

        {isLoading && (
          <h1 className="text-2xl font-bold text-center mb-6">
            Đang xác thực email...
          </h1>
        )}

        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue"></div>
          </div>
        )}

        {!isLoading && (
          <div className="text-center">
            {isSuccess ? (
              <>
                {/* Success Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <Check size={40} className="text-green-500" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Xác thực thành công!
                </h1>

                <p className="text-gray-600 mb-8">
                  Vui lòng đăng nhập để tiếp tục sử dụng dịch vụ
                </p>

                <Button
                  label="Đăng nhập ngay"
                  className="w-full p-button-primary"
                  onClick={() => router.push("/login")}
                />
              </>
            ) : (
              <>
                {/* Error Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <X size={40} className="text-red-500" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                  Xác thực thất bại!
                </h1>

                <p className="text-gray-600 mb-8">
                  Vui lòng kiểm tra lại email của bạn và thử lại
                </p>

                <Button
                  label="Quay lại trang đăng nhập"
                  className="w-full p-button-primary"
                  onClick={() => router.push("/login")}
                />
              </>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
