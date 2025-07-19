"use client";
import { useLanguage } from "@/context/language-context";
import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { classNames } from "primereact/utils";
import React, { useRef, useState } from "react";
import { AuthService } from "../../../services/auth-service";
import { useRouter } from "next/navigation";
import OtpInput from "@/components/otp-input";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const toastRef = useRef<Toast>(null);
  const { t } = useLanguage();
  const [errors, setErrors] = useState({
    email: false,
    invalidCredentials: false,
    otp: false,
    newPassword: false,
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({
      email: false,
      invalidCredentials: false,
      otp: false,
      newPassword: false,
    });

    // Validate form
    let hasErrors = false;
    const newErrors = {
      email: false,
      invalidCredentials: false,
      otp: false,
      newPassword: false,
    };

    if (!email.trim()) {
      newErrors.email = true;
      hasErrors = true;
    }

    if (!otp.trim() || otp.length !== 6) {
      newErrors.otp = true;
      hasErrors = true;
    }

    if (!newPassword.trim() || newPassword.length < 6) {
      newErrors.newPassword = true;
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPassword(email, otp, newPassword);
      toastRef.current?.show({
        severity: "success",
        summary: t("common.success"),
        detail: t("common.passwordResetSuccess"),
        life: 3000,
      });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Error resetting password:", error);
      toastRef.current?.show({
        severity: "error",
        summary: t("common.error"),
        detail: t("common.passwordResetFailed"),
        life: 3000,
      });
      setErrors((prev) => ({
        ...prev,
        invalidCredentials: true,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await AuthService.sendOtp(email);
      toastRef.current?.show({
        severity: "success",
        summary: t("common.success"),
        detail: t("common.sendOtpSuccess"),
        life: 3000,
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      toastRef.current?.show({
        severity: "error",
        summary: t("common.error"),
        detail: t("common.sendOtpFailed"),
        life: 3000,
      });
    }
    setLoading(false);
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
                onClick={() => router.push("/login")}
              />
            </div>

            <h1 className="text-xl font-bold text-gray-800 mb-1">
              {t("common.forgotPassword")}
            </h1>
            <p className="text-gray-500 text-sm mb-4">{t("common.forgotPasswordDescription")}</p>

            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-3"
            >
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-gray-700"
                  >
                    {t("form.email")}
                  </label>
                  <p className="text-primary-blue font-medium hover:underline text-xs cursor-pointer" onClick={handleSendOtp}>
                    {t("common.sendOtp")}
                  </p>
                </div>
                <div className="relative">
                  <InputText
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        email: false,
                      }));
                    }}
                    className={classNames(
                      "w-full h-10 pl-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue",
                      { "p-invalid": errors.email }
                    )}
                    placeholder={t("common.enterEmail")}
                  />
                </div>
                {errors.email && (
                  <small className="p-error text-xs">{t("errors.requiredField")}</small>
                )}
              </div>

              <hr className="my-4 border-gray-300" />

              <div className="flex flex-col gap-1 mb-4">
                <OtpInput
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    setErrors((prev) => ({
                      ...prev,
                      otp: false,
                    }));
                  }}
                  numInputs={6}
                  inputType="number"
                  containerStyle="gap-2"
                  hasErrored={errors.otp}
                />
                {errors.otp && (
                  <small className="p-error text-xs">{t("errors.requiredField")}</small>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-medium text-gray-700"
                  >
                    {t("common.newPassword")}
                  </label>
                </div>
                <div className="relative">
                  <InputText
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        newPassword: false,
                      }));
                    }}
                    className={classNames(
                      "w-full h-10 pl-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue",
                      { "p-invalid": errors.newPassword }
                    )}
                    placeholder={t("common.enterNewPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeSlash size={18} weight="bold" />
                    ) : (
                      <Eye size={18} weight="bold" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <small className="p-error text-xs">{t("common.passwordTooShort")}</small>
                )}
              </div>

              {errors.invalidCredentials && (
                <div className="text-red-500 text-xs text-center mt-2">
                  {t("errors.invalidOtpOrEmail")}
                </div>
              )}

              <Button
                label={t("common.confirm")}
                className="w-full bg-primary-blue hover:bg-primary-darkblue text-white font-semibold h-10 px-4 rounded-lg mt-2 transition-colors"
                type="submit"
                loading={loading}
                disabled={loading}
              />
            </form>

            <div className="mt-3 text-center text-xs text-gray-600">
              {t("common.alreadyHaveAccount")}{" "}
              <Link
                href="/login"
                className="text-primary-blue font-medium hover:underline"
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

export default ForgotPasswordPage;
