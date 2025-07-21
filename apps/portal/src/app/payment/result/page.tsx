"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { CheckCircle } from "@phosphor-icons/react";
import { WarningCircle } from "@phosphor-icons/react";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  const status = searchParams.get("status");
  const reference = searchParams.get("reference");
  const isSuccess = status === "success";

  useEffect(() => {
    // Tự động chuyển hướng về trang chủ sau 5 giây
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleBackHome = () => {
    router.push("/dashboard");
  };

  const header = (
    <div className="text-center p-4">
      <h2 className="text-xl font-bold mb-2">
        {isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"}
      </h2>
      <p className="text-sm text-gray-600">
        {isSuccess
          ? "Giao dịch của bạn đã được xử lý thành công"
          : "Đã xảy ra lỗi trong quá trình thanh toán"}
      </p>
    </div>
  );

  const footer = (
    <div className="flex justify-center p-3">
      <Button label="Về trang chủ" onClick={handleBackHome} />
    </div>
  );

  return (
    <div className="container py-8 max-w-md mx-auto">
      <Card header={header} footer={footer} className="w-full">
        <div className="flex flex-col items-center py-6">
          {isSuccess ? (
            <CheckCircle
              size={96}
              weight="fill"
              className="text-green-500 mb-4"
            />
          ) : (
            <WarningCircle
              size={96}
              weight="fill"
              className="text-red-500 mb-4"
            />
          )}

          {reference && (
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500">Mã tham chiếu:</p>
              <p className="font-medium">{reference}</p>
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            Tự động chuyển hướng về trang chủ sau {countdown} giây
          </div>
        </div>
      </Card>
    </div>
  );
}
