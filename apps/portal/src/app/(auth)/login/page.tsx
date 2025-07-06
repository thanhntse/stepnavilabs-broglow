"use client";
import { useLanguage } from "@/context/language-context";
import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import React, { useEffect, useRef, useState } from "react";
import { AuthService } from "../../../services/auth-service";

const LoginPage = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const toastRef = useRef<Toast>(null);
  const { t } = useLanguage();

  // State to manage validation errors
  const [errors, setErrors] = useState({
    emailOrPhone: false,
    password: false,
    invalidCredentials: false, // For server-side validation
  });

  useEffect(() => {
    if (!code) return;

    const exchangeCodeForToken = async () => {
      try {
        await AuthService.redirectGoogleLogin(code);
        router.push("/thread");
      } catch (error) {
        console.error("Lỗi xác thực:", error);
      }
    };

    exchangeCodeForToken();
  }, [code, router]);

  // Validation function
  const validateField = (name: string, value: string): boolean => {
    switch (name) {
      case "emailOrPhone":
        return value.trim().length > 0;
      case "password":
        return value.trim().length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {
      emailOrPhone: !validateField("emailOrPhone", emailOrPhone),
      password: !validateField("password", password),
      invalidCredentials: false, // Reset server-side error
    };

    setErrors(newErrors);

    // Check if there are any validation errors
    if (newErrors.emailOrPhone || newErrors.password) {
      return;
    }

    setLoading(true);

    try {
      await AuthService.login(emailOrPhone, password, "");

      // Check if user is admin
      const isAdmin = await AuthService.isAdmin();
      if (!isAdmin) {
        // Clear tokens and show error
        AuthService.logout();
        toastRef.current?.show({
          severity: "error",
          summary: "Không có quyền truy cập",
          detail: "Chỉ tài khoản admin mới được phép đăng nhập vào hệ thống.",
          life: 3000,
        });
        return;
      }

      router.push(AuthService.getDefaultAuthRoute());

      toastRef.current?.show({
        severity: "success",
        summary: t("common.success"),
        detail: t("common.loginSuccess"),
        life: 3000,
      });
    } catch (error: unknown) {
      console.log("Login failed: ", error);
      // Set server-side validation error
      setErrors((prev) => ({ ...prev, invalidCredentials: true }));
    } finally {
      setLoading(false);
    }
  };

  // const handleLoginGoogle = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   AuthService.loginGoogle();
  // };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Toast ref={toastRef} position="top-right" />
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-primary-blue/20 to-white">
        <div className="w-full p-2 lg:p-4 flex flex-col justify-center overflow-y-auto">
          <div className="mx-auto w-full max-w-md bg-white p-4 md:p-6 rounded-2xl shadow-lg">
            <div className="mb-4 flex justify-center">
              <Image
                src="/broglow-logo.png"
                width={200}
                height={90}
                alt="BroGlow Logo"
                className="cursor-pointer"
                onClick={() => router.push("/thread")}
              />
            </div>

            <h1 className="text-xl font-bold text-gray-800 mb-1">
              {t("common.welcomeBack")}
            </h1>
            <p className="text-gray-500 text-sm mb-4">{t("common.loginToContinue")}</p>

            {/* <Button
              label={t("common.loginWithGoogle")}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="18"
                  height="18"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  ></path>
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  ></path>
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                </svg>
              }
              className="w-full p-button-outlined p-button-secondary mb-3 flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors h-10 rounded-lg shadow-sm"
              onClick={handleLoginGoogle}
            />

            <div className="w-full flex items-center my-3">
              <hr className="flex-grow border-t border-gray-200" />
              <span className="mx-3 text-gray-400 text-xs">
                {t("common.or")}
              </span>
              <hr className="flex-grow border-t border-gray-200" />
            </div> */}

            {/* Display server-side error */}
            {errors.invalidCredentials && (
              <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-lg text-xs">
                {t("errors.invalidCredentials")}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="emailOrPhone"
                  className="block text-xs font-medium text-gray-700"
                >
                  {t("form.emailOrPhone")}
                </label>
                <div className="relative">
                  <InputText
                    id="emailOrPhone"
                    value={emailOrPhone}
                    onChange={(e) => {
                      setEmailOrPhone(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        emailOrPhone: false,
                        invalidCredentials: false,
                      }));
                    }}
                    className={classNames(
                      "w-full h-10 pl-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue",
                      { "p-invalid": errors.emailOrPhone }
                    )}
                    placeholder={t("form.enterEmail")}
                  />
                </div>
                {errors.emailOrPhone && (
                  <small className="p-error text-xs">{t("errors.requiredField")}</small>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-gray-700"
                  >
                    {t("form.password")}
                  </label>
                </div>
                <div className="relative">
                  <InputText
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        password: false,
                        invalidCredentials: false,
                      }));
                    }}
                    className={classNames(
                      "w-full h-10 pl-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue",
                      { "p-invalid": errors.password }
                    )}
                    placeholder={t("form.enterPassword")}
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlash size={18} weight="bold" />
                    ) : (
                      <Eye size={18} weight="bold" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <small className="p-error text-xs">{t("errors.requiredField")}</small>
                )}
              </div>

              <Button
                label={loading ? t("form.loading") : t("common.login")}
                className="w-full bg-primary-blue hover:bg-primary-darkblue text-white font-semibold h-10 px-4 rounded-lg mt-2 transition-colors"
                type="submit"
                disabled={loading}
                icon={loading ? "pi pi-spin pi-spinner" : undefined}
              />
            </form>

            <div className="mt-3 text-center text-xs text-gray-600">
              {t("common.dontHaveAccount")}{" "}
              <Link
                href="/register"
                className="text-primary-blue font-medium hover:underline"
              >
                {t("common.registerNow")}
              </Link>
            </div>
          </div>

          <div className="text-center mt-2 text-xs text-gray-500">
            {t("common.copyright")}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
