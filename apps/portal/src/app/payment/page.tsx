"use client";

import { useUserContext } from "@/context/profile-context";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { useState } from "react";

const features = [
  {
    label: "Scan da mặt",
    free: true,
    pro: true,
  },
  {
    label: "Phân tích da bằng AI",
    free: true,
    pro: true,
  },
  {
    label: "Lưu lại quá trình mỗi lần scan da",
    free: true,
    pro: true,
  },
  {
    label: "Xác định hồ sơ da",
    free: true,
    pro: true,
  },
  {
    label: "Tham gia cộng đồng chăm sóc da",
    free: true,
    pro: true,
  },
  {
    label: "Gợi ý sử dụng sản phẩm bằng AI",
    free: true,
    pro: "unlimited",
  },
  {
    label: "Gợi ý chu trình chăm sóc da",
    free: true,
    pro: "unlimited",
  },
  {
    label: "Tư vấn với chuyên gia",
    free: false,
    pro: true,
  },
];

const proPlans = [
  {
    id: "weekly",
    label: "Hàng tuần",
    price: 19000,
    original: 127000,
    popular: false,
  },
  {
    id: "monthly",
    label: "Hàng tháng",
    price: 38000,
    original: 255000,
    popular: true,
  },
  {
    id: "yearly",
    label: "Hàng năm",
    price: 192000,
    original: 1276000,
    popular: false,
  },
];

function formatVND(amount: number) {
  return amount.toLocaleString("vi-VN") + "đ";
}

export default function SubscriptionPlans() {
  const [selectedProPlan, setSelectedProPlan] = useState("monthly");
  const { user } = useUserContext();
  const router = useRouter();

  const handleUpgrade = () => {
    if (!user?._id) return;
    const plan = proPlans.find((p) => p.id === selectedProPlan);
    if (!plan) return;
    router.push(`/payment/qr-code?amount=${plan.price}&userId=${user._id}`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary-pastel)] py-8 px-2 flex flex-col items-center">
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl justify-center">
        {/* Free Plan */}
        <div className="flex-1 bg-white border-2 border-[var(--color-primary-blue)] rounded-2xl p-6 flex flex-col items-center shadow-sm">
          <div className="text-[var(--color-primary-blue)] text-2xl font-bold mb-1">
            Miễn Phí
          </div>
          <div className="text-gray-500 text-sm mb-4">(Gói hiện tại)</div>
          <ul className="w-full mb-6">
            {features.map((f, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 mb-2 text-gray-700"
              >
                {f.free ? (
                  <span className="text-[var(--color-primary-blue)] text-lg">
                    ⚡
                  </span>
                ) : (
                  <span className="text-red-400 text-lg">❌</span>
                )}
                <span className={f.free ? "" : "line-through text-gray-400"}>
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {/* Pro Plan */}
        <div className="flex-1 bg-gradient-to-b from-[var(--color-primary-blue)] to-[var(--color-primary-lightblue)] rounded-2xl p-1 shadow-lg">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center min-h-full">
            <div className="text-[var(--color-primary-blue)] text-2xl font-bold mb-1">
              PRO
            </div>
            {/* Plan options */}
            <div className="w-full flex flex-col gap-2 mb-4">
              {proPlans.map((plan) => (
                <label
                  key={plan.id}
                  className={`flex items-center justify-between border rounded-lg px-4 py-2 cursor-pointer transition-all relative ${
                    selectedProPlan === plan.id
                      ? "border-[var(--color-primary-blue)] bg-[var(--color-primary-pastel)]"
                      : "border-gray-300 hover:border-[var(--color-primary-blue)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="proPlan"
                      value={plan.id}
                      checked={selectedProPlan === plan.id}
                      onChange={() => setSelectedProPlan(plan.id)}
                      className="accent-[var(--color-primary-blue)] mr-3"
                    />
                    <span className="font-medium mr-2">{plan.label}</span>
                  </div>
                  <div className="flex flex-col items-end min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through text-sm">
                        {formatVND(plan.original)}
                      </span>
                      <span className="text-[var(--color-primary-blue)] font-bold text-lg">
                        {formatVND(plan.price)}
                      </span>
                    </div>
                    <span className="text-xs text-green-600 font-semibold mt-0.5">
                      Giảm 85%
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {/* Features */}
            <ul className="w-full mb-6 mt-2">
              {features.map((f, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 mb-2 text-gray-700"
                >
                  <span className="text-yellow-400 text-lg">⚡</span>
                  <span>
                    {f.label}
                    {f.pro === "unlimited" && (
                      <span className="text-xs text-[var(--color-primary-blue)] ml-2">
                        (Không giới hạn)
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              label="Nâng cấp"
              className="mt-auto w-full btn-primary bg-yellow-400 border-0 hover:bg-yellow-500 text-white font-semibold py-2 rounded-lg text-lg transition-all shadow magnetic-btn"
              onClick={handleUpgrade}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
