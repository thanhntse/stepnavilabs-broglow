"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { useLanguage } from "@/context/language-context";

const RegisterSuccessPage = () => {
  const router = useRouter();
  useLanguage();

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-primary-pastel to-white">
      <div className="w-full p-2 lg:p-4 flex flex-col justify-center items-center">
        <div className="mx-auto w-full max-w-md bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="mb-6 flex justify-center">
            <Image
              src="/broglow-logo.png"
              width={200}
              height={90}
              alt="BroGlow Logo"
              className="cursor-pointer"
              onClick={() => router.push("/")}
            />
          </div>

          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <i className="pi pi-check text-4xl text-green-500"></i>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Đăng ký thành công!
          </h1>

          <p className="text-gray-600 mb-8">
            Chúng tôi sẽ thông báo cho bạn khi có thông tin mới nhất
          </p>

          <Button
            label="Trở về trang chủ"
            icon="pi pi-home"
            className="w-full p-button-primary"
            onClick={() => router.push("/")}
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccessPage;
