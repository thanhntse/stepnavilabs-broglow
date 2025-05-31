"use client";

import LanguageSwitcher from "@/components/language-switcher";
import { useLanguage } from "@/context/language-context";
import { useUserContext } from "@/context/profile-context";
import { TokenStorage } from "@/lib/token-storage";
import { AIService } from "@/services/AI-service";
import { AuthService } from "@/services/auth-service";
import { List, Plus, X } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { useEffect, useRef, useState } from "react";

interface HeaderProps {
  variant?: "default" | "home";
  logoSrc?: string;
  showCreateNew?: boolean;
  updatePromptCount?: () => Promise<number>;
  className?: string;
}

export default function Header({
  variant = "default",
  logoSrc = "/logo.svg",
  showCreateNew = true,
  updatePromptCount,
  className,
}: HeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [promptCount, setPromptCount] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const router = useRouter();
  const menu = useRef<Menu>(null);
  const { t } = useLanguage();

  const { user, addUser, clearUser } = useUserContext();

  // Fetch prompt count
  const fetchPromptCount = async () => {
    const tokens = TokenStorage.getTokens();
    if (tokens) {
      try {
        const prompt = await AIService.getAIUsage();
        setPromptCount(prompt.data);
        return prompt.data;
      } catch (error) {
        console.error("Failed to fetch prompt count:", error);
        return 0;
      }
    }
    return 0;
  };

  useEffect(() => {
    const handleGetUser = async () => {
      const tokens = TokenStorage.getTokens();
      if (tokens) {
        setIsLoggedIn(true);
        const user = await AuthService.getUserProfile();
        addUser(user);
        await fetchPromptCount();
      }
    };
    handleGetUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update prompt count externally if updatePromptCount prop is provided
  const updatePromptCountRef = useRef(updatePromptCount);

  useEffect(() => {
    updatePromptCountRef.current = updatePromptCount;
  }, [updatePromptCount]);

  useEffect(() => {
    if (updatePromptCountRef.current) {
      updatePromptCountRef.current().then(setPromptCount);
    }
  }, []);

  const handleCreateNewThread = async () => {
    // const res = await AIService.createThread();
    // router.push(`/thread/${res._id}`);
    router.push('/')
  };

  const logout = () => {
    AuthService.logout();
    clearUser();
    setIsLoggedIn(false);
    router.push("/");
  };

  const displayName = user ? (
    `${user.firstName} ${user.lastName}`.trim()
  ) : (
    <div
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );

  const customMenuModel: MenuItem[] = [
    {
      label: t("common.userInfo"),
      template: () => (
        <div className="py-3 px-4 flex flex-col gap-0.5 rounded-xl text-primary-dark">
          <div className="text-lg font-semibold ">{displayName}</div>
          <div className="text-sm text-gray-500">{user?.email}</div>
        </div>
      ),
    },
    { separator: true },
    {
      label: t("common.recentPosts"),
      template: () => (
        <div
          onClick={() => router.push("/recent-post")}
          className="py-3 px-4 cursor-pointer hover:bg-gray-100 text-primary-dark rounded-xl !w-full"
        >
          {t("common.recentPosts")}
        </div>
      ),
    },
    { separator: true },
    {
      label: t("common.logout"),
      template: () => (
        <div
          onClick={logout}
          className="py-3 px-4 cursor-pointer hover:bg-gray-100 text-primary-dark rounded-xl"
        >
          <span>{t("common.logout")}</span>
        </div>
      ),
    },
  ];

  return (
    <>
      <header
        className={`${
          variant !== "home" ? "sticky top-0 bg-white" : ""
        } w-full flex justify-between items-center py-3 lg:py-4 px-2 md:px-6 lg:px-20 max-w-7xl xl:mx-auto xl:px-0 ${className}`}
      >
        <div className="flex items-center gap-1 lg:gap-6">
          <div
            className="lg:hidden p-3.5 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <List size={20} />
          </div>
          <Image
            src={logoSrc}
            width={131}
            height={24}
            alt="Logo"
            className="cursor-pointer"
            onClick={() => router.push("/")}
          />

          {/* Desktop Items - Visible on desktop, hidden on mobile */}
          <div className="hidden lg:flex items-center gap-6">
            {showCreateNew && isLoggedIn && (
              <div
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-sm font-semibold rounded-full cursor-pointer hover:bg-gray-200 ease-in-out duration-200"
                onClick={handleCreateNewThread}
              >
                {t("common.createNew")} <Plus size={16} />
              </div>
            )}

            {variant === "home" && isLoggedIn && (
              <div className="flex items-center gap-6 text-sm font-semibold">
                <div>{t("common.home")}</div>
                <div>BroGlow AI</div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop user info - Visible on desktop, hidden on mobile */}
        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher variant={variant} />

          {isLoggedIn ? (
            <>
              <div
                className={`text-sm py-2 px-4 w-fit ${
                  variant === "home"
                    ? "rounded-full border border-gray-300 text-white"
                    : "text-gray-500"
                }`}
              >
                <span
                  className={`font-semibold ${
                    variant !== "home" ? "text-primary-orange" : ""
                  }`}
                >
                  {50 - promptCount}/50
                </span>{" "}
                {t("common.freeDaily")}
              </div>

              <button
                className={`font-semibold px-5 py-2 rounded-full w-fit cursor-pointer hover:bg-gray-200 ease-in-out duration-200 ${
                  variant === "home" ? "bg-white text-black" : "text-black"
                }`}
                onClick={(e) => menu.current?.toggle(e)}
              >
                {t("common.hello")}, {displayName}
                <Menu
                  model={customMenuModel}
                  popup
                  ref={menu}
                  className="custom-menu"
                  popupAlignment="right"
                  pt={{
                    root: {
                      className:
                        "!py-0 !rounded-xl !border !border-gray-300 !shadow !bg-white !text-primary-dark !w-64 !mt-1",
                    },
                    separator: { className: "!m-0" },
                  }}
                />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-white text-black font-semibold px-5 py-2 rounded-full w-fit cursor-pointer hover:bg-gray-200 ease-in-out duration-200"
            >
              {t("common.login")}
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-gradient-to-b from-white via-white to-[#F5F5DC] via-[30%] text-primary-dark">
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3.5 cursor-pointer"
              >
                <X size={20} />
              </button>
              <Image
                src={logoSrc}
                width={131}
                height={24}
                alt="Logo"
                className="cursor-pointer"
                onClick={() => {
                  router.push("/");
                  setIsMobileMenuOpen(false);
                }}
              />
            </div>

            <div className="flex-1 flex flex-col gap-6 py-3">
              <div className="flex flex-col justify-between h-full">
                <div className="flex flex-col">
                  <button
                    onClick={() => {
                      router.push("/");
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left py-4 font-semibold text-xl hover:bg-gray-100 border-b border-gray-200 cursor-pointer"
                  >
                    {t("common.home")}
                  </button>
                  <button
                    onClick={() => {
                      // router.push("/recent-post");
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left py-4 font-semibold text-xl hover:bg-gray-100 border-b border-gray-200 cursor-pointer"
                  >
                    BroGlow AI
                  </button>
                </div>
                {showCreateNew && (
                  <button
                    onClick={() => {
                      handleCreateNewThread();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex gap-3 items-center w-full justify-center py-2 font-semibold px-4 bg-primary-orange text-white hover:bg-orange-600 cursor-pointer ease-in-out duration-200 rounded-full"
                  >
                    {t("common.createNew")} <Plus size={16} />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-6">
                {isLoggedIn ? (
                  <div className="flex flex-col gap-3 pb-2">
                    <div className="text-sm py-2 px-4 bg-white rounded-full w-fit">
                      <span className="font-semibold text-primary-orange">
                        {50 - promptCount}/50
                      </span>{" "}
                      {t("common.freeDaily")}
                    </div>
                    <div className="flex flex-col bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
                      <div className="px-4 py-3">
                        <div className="text-lg font-semibold">
                          {displayName}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {user?.email}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          router.push("/recent-post");
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-left px-4 py-3 cursor-pointer"
                      >
                        {t("common.recentPosts")}
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-left px-4 py-3 text-red-600 cursor-pointer"
                      >
                        {t("common.logout")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="bg-white font-semibold px-5 py-2 rounded-full text-center cursor-pointer hover:bg-gray-200 ease-in-out duration-200"
                  >
                    {t("common.login")}
                  </Link>
                )}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="text-xs text-primary-dark opacity-30">
                      {t("common.poweredBy")}
                    </div>
                    <Image
                      src="/logo-overlay.svg"
                      width={77}
                      height={14}
                      alt="Logo"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
