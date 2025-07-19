"use client";

import LanguageSwitcher from "@/components/language-switcher";
import { useLanguage } from "@/context/language-context";
import { useUserContext } from "@/context/profile-context";
import { TokenStorage } from "@/lib/token-storage";
import { AIService } from "@/services/AI-service";
import { AuthService } from "@/services/auth-service";
import { DEFAULT_PUBLIC_ROUTE, publicOnlyRoutes } from "@/utils/auth-routes";
import { List, Plus, X, SignOut, Clock, Sparkle, User } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { useEffect, useRef, useState } from "react";

interface HeaderProps {
  variant?: "default" | "home";
  logoSrc?: string;
  showCreateNew?: boolean;
  updatePromptCount?: () => Promise<number>;
  className?: string;
  onCreateNew?: () => void;
}

export default function Header({
  variant = "default",
  logoSrc = "/broglow-logo.png",
  showCreateNew = true,
  updatePromptCount,
  className,
  onCreateNew,
}: HeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [promptCount, setPromptCount] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

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
        try {
          const user = await AuthService.getUserProfile();
          addUser(user);
          await fetchPromptCount();
        } catch (error) {
          console.error("Failed to get user profile:", error);
        }
      }
      setIsLoading(false);
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
    if (onCreateNew) {
      onCreateNew();
    } else {
      router.push('/thread');
    }
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
    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
  );

  const customMenuModel: MenuItem[] = [
    {
      label: t("common.userInfo"),
      template: () => (
        <div className="py-4 px-4 flex flex-col gap-2 rounded-xl text-primary-dark bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-center gap-3">
            <div className="flex-1 pl-4">
              <div className="text-lg font-semibold text-gray-900">{displayName}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>
          </div>
        </div>
      ),
    },
    { separator: true },
    {
      label: t("common.profile"),
      template: () => (
        <div
          onClick={() => router.push("/profile")}
          className="py-3 px-4 cursor-pointer hover:bg-gray-50 text-primary-dark rounded-xl !w-full transition-colors duration-200 flex items-center gap-3 group"
        >
          <User size={18} className="text-primary-blue group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium">{t("common.profile")}</span>
        </div>
      ),
    },
    {
      label: t("common.recentPosts"),
      template: () => (
        <div
          onClick={() => router.push("/recent-post")}
          className="py-3 px-4 cursor-pointer hover:bg-gray-50 text-primary-dark rounded-xl !w-full transition-colors duration-200 flex items-center gap-3 group"
        >
          <Clock size={18} className="text-primary-blue group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium">{t("common.recentPosts")}</span>
        </div>
      ),
    },
    {
      label: t("common.skinProfile"),
      template: () => (
        <div
          onClick={() => router.push("/skin-profile")}
          className="py-3 px-4 cursor-pointer hover:bg-gray-50 text-primary-dark rounded-xl !w-full transition-colors duration-200 flex items-center gap-3 group"
        >
          <Sparkle size={18} className="text-primary-blue group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium">{t("common.skinProfile")}</span>
        </div>
      ),
    },
    {
      label: t("common.routine"),
      template: () => (
        <div
          onClick={() => router.push("/routine")}
          className="py-3 px-4 cursor-pointer hover:bg-gray-50 text-primary-dark rounded-xl !w-full transition-colors duration-200 flex items-center gap-3 group"
        >
          <Clock size={18} className="text-primary-blue group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium">{t("common.routine")}</span>
        </div>
      ),
    },
    { separator: true },
    {
      label: t("common.logout"),
      template: () => (
        <div
          onClick={logout}
          className="py-3 px-4 cursor-pointer hover:bg-red-50 text-red-600 rounded-xl transition-colors duration-200 flex items-center gap-3 group"
        >
          <SignOut size={18} className="group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium">{t("common.logout")}</span>
        </div>
      ),
    },
  ];

  if (DEFAULT_PUBLIC_ROUTE === pathname || publicOnlyRoutes.includes(pathname)) {
    return null;
  }

  return (
    <>
      <div className="w-full bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <header
          className={`${variant !== "home" ? "sticky top-0 bg-white/95 backdrop-blur-sm z-40" : ""
            } w-full flex justify-between items-center py-4 lg:py-5 px-4 md:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto ${className}`}
        >
          <div className="flex items-center gap-3 lg:gap-8">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <List size={22} className="text-gray-700" />
            </button>

            <div className="flex items-center gap-2">
              <Image
                src={logoSrc}
                width={131}
                height={24}
                alt="BroGlow Logo"
                className="cursor-pointer transition-transform duration-200 hover:scale-105"
                onClick={() => router.push("/")}
              />
            </div>

            {/* Desktop Navigation - Visible on desktop, hidden on mobile */}
            <div className="hidden lg:flex items-center gap-8">
              {showCreateNew && !pathname.includes("/thread") && isLoggedIn && (
                <button
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-blue to-primary-darkblue text-white text-sm font-semibold rounded-full cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 ease-out"
                  onClick={handleCreateNewThread}
                >
                  <Plus size={16} weight="bold" />
                  {t("common.createNew")}
                </button>
              )}

              {variant === "home" && isLoggedIn && (
                <div className="flex items-center gap-8 text-sm font-medium text-gray-700">
                  <Link href="/" className="hover:text-primary-blue transition-colors duration-200">
                    {t("common.home")}
                  </Link>
                  <span className="text-primary-blue font-semibold">BroGlow AI</span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop user info - Visible on desktop, hidden on mobile */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher variant={variant} />

            {!isLoading && (
              <>
                {isLoggedIn ? (
                  <div className="flex items-center gap-4">
                    {/* Credits Display */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-full border border-orange-200">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-orange-700">
                        {10 - promptCount}/10
                      </span>
                      <span className="text-xs text-orange-600">
                        {t("common.freeDaily")}
                      </span>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-3">
                      <button
                        className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group cursor-pointer"
                        onClick={(e) => menu.current?.toggle(e)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary-blue to-primary-darkblue text-white font-semibold text-sm">
                            {user?.avatar ? (
                              <Image
                                src={user?.avatar}
                                alt="User Avatar"
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              displayName.toString().split(" ").map((name: string, index: number) => (
                                <span key={index}>{name.charAt(0)}</span>
                              ))
                            )}
                          </div>
                          <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                            {t("common.hello")}, {displayName}
                          </span>
                        </div>
                      </button>

                      <Menu
                        model={customMenuModel}
                        popup
                        ref={menu}
                        className="custom-menu"
                        popupAlignment="right"
                        pt={{
                          root: {
                            className:
                              "!py-2 !rounded-2xl !border !border-gray-200 !shadow-xl !bg-white !text-primary-dark !w-72 !mt-2 !backdrop-blur-sm",
                          },
                          separator: { className: "!my-2 !bg-gray-100" },
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="bg-gradient-to-r from-primary-blue to-primary-darkblue text-white font-semibold px-6 py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200 ease-out"
                  >
                    {t("common.login")}
                  </Link>
                )}
              </>
            )}
          </div>
        </header>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Content */}
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Close menu"
                >
                  <X size={24} className="text-gray-700" />
                </button>
                <Image
                  src={logoSrc}
                  width={100}
                  height={20}
                  alt="BroGlow Logo"
                  className="cursor-pointer"
                  onClick={() => {
                    router.push("/");
                    setIsMobileMenuOpen(false);
                  }}
                />
              </div>

              {/* Menu Items */}
              <div className="flex-1 flex flex-col p-6 gap-6">
                {/* Navigation Links */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      router.push("/");
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left py-4 px-4 font-semibold text-lg hover:bg-gray-50 rounded-xl transition-colors duration-200 flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-primary-blue rounded-full"></div>
                    {t("common.home")}
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left py-4 px-4 font-semibold text-lg hover:bg-gray-50 rounded-xl transition-colors duration-200 flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-primary-orange rounded-full"></div>
                    BroGlow AI
                  </button>
                </div>

                {/* Create New Button */}
                {showCreateNew && !pathname.includes("/thread") && isLoggedIn && (
                  <button
                    onClick={() => {
                      handleCreateNewThread();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex gap-3 items-center justify-center py-4 px-6 font-semibold bg-gradient-to-r from-primary-blue to-primary-darkblue text-white hover:shadow-lg hover:scale-105 transition-all duration-200 ease-out rounded-xl"
                  >
                    <Plus size={20} weight="bold" />
                    {t("common.createNew")}
                  </button>
                )}

                {/* User Section */}
                {!isLoading && (
                  <div className="flex flex-col gap-4">
                    {isLoggedIn ? (
                      <>
                        {/* Credits */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                          <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-orange-700">
                              {10 - promptCount}/10 {t("common.freeDaily")}
                            </div>
                          </div>
                        </div>

                        {/* User Info */}
                        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1">
                              <div className="text-lg font-semibold text-gray-900">{displayName}</div>
                              <div className="text-sm text-gray-500">{user?.email}</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                router.push("/profile");
                                setIsMobileMenuOpen(false);
                              }}
                              className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                            >
                              <User size={18} className="text-primary-blue" />
                              <span className="font-medium">{t("common.profile")}</span>
                            </button>
                            <button
                              onClick={() => {
                                router.push("/skin-profile");
                                setIsMobileMenuOpen(false);
                              }}
                              className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                            >
                              <Sparkle size={18} className="text-primary-blue" />
                              <span className="font-medium">{t("common.skinProfile")}</span>
                            </button>
                            <button
                              onClick={() => {
                                router.push("/routine");
                                setIsMobileMenuOpen(false);
                              }}
                              className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                            >
                              <Clock size={18} className="text-primary-blue" />
                              <span className="font-medium">{t("common.routine")}</span>
                            </button>
                            <button
                              onClick={() => {
                                router.push("/recent-post");
                                setIsMobileMenuOpen(false);
                              }}
                              className="w-full text-left py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center gap-3"
                            >
                              <Clock size={18} className="text-primary-blue" />
                              <span className="font-medium">{t("common.recentPosts")}</span>
                            </button>
                            <button
                              onClick={() => {
                                logout();
                                setIsMobileMenuOpen(false);
                              }}
                              className="w-full text-left py-3 px-4 rounded-lg hover:bg-red-50 transition-colors duration-200 flex items-center gap-3 text-red-600"
                            >
                              <SignOut size={18} />
                              <span className="font-medium">{t("common.logout")}</span>
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        className="bg-gradient-to-r from-primary-blue to-primary-darkblue text-white font-semibold px-6 py-3 rounded-xl text-center hover:shadow-lg hover:scale-105 transition-all duration-200 ease-out"
                      >
                        {t("common.login")}
                      </Link>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-auto pt-6 border-t border-gray-100">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-xs text-gray-400">
                      {t("common.poweredBy")}
                    </div>
                    <h1 className="text-xs text-gray-400 font-medium">STEPNAVI Labs</h1>
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
