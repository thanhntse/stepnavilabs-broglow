"use client";

import { TokenStorage } from "@/lib/token-storage";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DEFAULT_PUBLIC_ROUTE } from "@/utils/auth-routes";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!TokenStorage.getTokens()) {
      router.push(DEFAULT_PUBLIC_ROUTE);
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary-blue/10 to-white">
      <Image
        src="/broglow-logo.png"
        width={220}
        height={70}
        alt="BroGlow Logo"
        className="mb-8"
        priority
      />
      <div className="flex space-x-2 justify-center items-center">
        <div className="w-3 h-3 rounded-full bg-primary-blue animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 rounded-full bg-primary-blue animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 rounded-full bg-primary-blue animate-bounce"></div>
      </div>
    </div>
  );
}
