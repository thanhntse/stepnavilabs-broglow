"use client";
import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import React, { useRef, useState } from "react";
import { AuthService } from "../../../services/auth-service";
import { useLanguage } from "@/context/language-context";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  // State to manage validation errors
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const router = useRouter();
  const toastRef = useRef<Toast>(null);

  // General validate function
  const validateField = (name: string, value: string): boolean => {
    switch (name) {
      case "firstName":
      case "lastName":
        return value.trim().length >= 2;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      case "password":
        const passwordRegex =
          /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
        return value.length >= 8 && passwordRegex.test(value);
      case "confirmPassword":
        return value === password;
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {
      firstName: !validateField("firstName", firstName),
      lastName: !validateField("lastName", lastName),
      email: !validateField("email", email),
      password: !validateField("password", password),
      confirmPassword: !validateField("confirmPassword", confirmPassword),
    };

    setErrors(newErrors);

    // Check if there is an error
    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    setLoading(true);

    try {
      await AuthService.register(
        firstName,
        lastName,
        email,
        password,
      );

      toastRef.current?.show({
        severity: "success",
        summary: "Thành công",
        detail: "Chúng tôi đã gửi email xác thực cho bạn. Vui lòng kiểm tra hộp thư và nhấp vào liên kết để kích hoạt tài khoản!",
        life: 5000,
      });

      setTimeout(() => {
        router.push("/");
      }, 5000);
    } catch (error: unknown) {
      console.error("Registration failed:", error);
      toastRef.current?.show({
        severity: "error",
        summary: t("common.registrationFailed"),
        detail:
          error instanceof Error ? error.message : t("errors.registrationError"),
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleLoginGoogle = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   AuthService.loginGoogle();
  // };

  return (
    <>
      <Toast ref={toastRef} position="top-right" />
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-primary-pastel to-white">
        <div className="w-full p-2 lg:p-4 flex flex-col justify-center overflow-y-auto">
          <div className="mx-auto w-full max-w-md bg-white p-4 md:p-6 rounded-2xl shadow-lg">
            <div className="mb-4 flex justify-center">
              <Image
                src="/broglow-logo.png"
                width={200}
                height={90}
                alt="BroGlow Logo"
                className="cursor-pointer"
                onClick={() => router.push("/")}
              />
            </div>

            <h1 className="text-xl font-bold text-gray-800 mb-1">
              {t("common.createAccount")}
            </h1>
            <p className="text-gray-500 text-sm mb-4">{t("common.registerToUse")}</p>

            {/* <Button
              label={t("common.registerWithGoogle")}
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
              <span className="mx-3 text-gray-400 text-xs">{t("common.or")}</span>
              <hr className="flex-grow border-t border-gray-200" />
            </div> */}

            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-3"
            >
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <label
                    htmlFor="firstName"
                    className="block text-xs font-medium text-gray-700"
                  >
                    {t("form.firstName")}
                  </label>
                  <InputText
                    id="firstName"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setErrors((prev) => ({ ...prev, firstName: false }));
                    }}
                    className={classNames(
                      "w-full h-10 pl-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange",
                      { "p-invalid": errors.firstName }
                    )}
                    placeholder={t("form.enterFirstName")}
                  />
                  {errors.firstName && (
                    <small className="p-error text-xs">
                      {t("errors.minLength")}
                    </small>
                  )}
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label
                    htmlFor="lastName"
                    className="block text-xs font-medium text-gray-700"
                  >
                    {t("form.lastName")}
                  </label>
                  <InputText
                    id="lastName"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setErrors((prev) => ({ ...prev, lastName: false }));
                    }}
                    className={classNames(
                      "w-full h-10 pl-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange",
                      { "p-invalid": errors.lastName }
                    )}
                    placeholder={t("form.enterLastName")}
                  />
                  {errors.lastName && (
                    <small className="p-error text-xs">
                      {t("errors.minLength")}
                    </small>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-gray-700"
                >
                  {t("form.email")}
                </label>
                <InputText
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: false }));
                  }}
                  className={classNames(
                    "w-full h-10 pl-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange",
                    { "p-invalid": errors.email }
                  )}
                  placeholder={t("form.enterEmail")}
                />
                {errors.email && (
                  <small className="p-error text-xs">{t("errors.invalidEmail")}</small>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-gray-700"
                >
                  {t("form.password")}
                </label>
                <div className="relative">
                  <InputText
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: false }));
                    }}
                    className={classNames(
                      "w-full h-10 pl-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange",
                      { "p-invalid": errors.password }
                    )}
                    placeholder={t("form.enterPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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
                  <small className="p-error text-xs">
                    {t("errors.passwordRequirements")}
                  </small>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-medium text-gray-700"
                >
                  {t("form.confirmPassword")}
                </label>
                <div className="relative">
                  <InputText
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        confirmPassword: false,
                      }));
                    }}
                    className={classNames(
                      "w-full h-10 pl-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-orange/30 focus:border-primary-orange",
                      { "p-invalid": errors.confirmPassword }
                    )}
                    placeholder={t("form.enterConfirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeSlash size={18} weight="bold" />
                    ) : (
                      <Eye size={18} weight="bold" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <small className="p-error text-xs">
                    {t("errors.passwordMismatch")}
                  </small>
                )}
              </div>

              <Button
                label={loading ? "Đang đăng ký..." : t("common.register")}
                className="w-full bg-primary-orange hover:bg-primary-dark text-white font-semibold h-10 px-4 rounded-lg mt-2 transition-colors"
                type="submit"
                disabled={loading}
                icon={loading ? "pi pi-spin pi-spinner" : undefined}
              />
            </form>

            <div className="mt-3 text-center text-xs text-gray-600">
              {t("common.alreadyHaveAccount")}{" "}
              <Link
                href="/login"
                className="text-primary-orange font-medium hover:underline"
              >
                {t("common.loginNow")}
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

export default RegisterPage;
