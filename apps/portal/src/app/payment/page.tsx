"use client";

import { useUserContext } from "@/context/profile-context";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { PaymentService } from "@/services/payment-service";
import { SubscriptionService } from "@/services/subscription-service";

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

const subscriptionType = {
  weekly: "Hàng tuần",
  monthly: "Hàng tháng",
  yearly: "Hàng năm",
};

function formatVND(amount: number) {
  return amount.toLocaleString("vi-VN") + "đ";
}

export default function SubscriptionPlans() {
  const [selectedProPlan, setSelectedProPlan] = useState("monthly");
  const { user } = useUserContext();
  const isPro = user?.proExpiresAt && new Date(user?.proExpiresAt?.toString() || "").getTime() > new Date().getTime();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const subscriptions = await SubscriptionService.getSubscription();
      setSubscriptions(subscriptions as any);
    };
    fetchSubscriptions();
  }, []);

  const handleUpgrade = async () => {
    if (!user?._id) return;
    const plan = subscriptions.find((p: any ) => p._id === selectedProPlan);
    if (!plan) return;
    const { referenceCode } = await PaymentService.createPaymentSession(
      Number((plan.price * (1 - plan.discount / 100)).toFixed(0)),
      user._id
    );
    router.push(`/payment/qr-code?ref=${referenceCode}`);
  };

  return (
    <div className="min-h-[calc(100vh-100px)] bg-[var(--color-primary-pastel)] py-8 px-2 flex flex-col items-center">
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl justify-center">
        {/* Free Plan */}
        <div className="flex-1 bg-white border-2 border-[var(--color-primary-blue)] rounded-2xl p-6 flex flex-col items-center shadow-sm">
          <div className="text-[var(--color-primary-blue)] text-2xl font-bold mb-1">
            Miễn Phí
          </div>
          {!isPro && (
            <div className="text-gray-500 text-sm mb-4">(Gói hiện tại)</div>
          )}
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
              {
                isPro ? "Gia hạn gói PRO" : "PRO"
              }
            </div>
            {
              isPro && (
                <div className="text-gray-500 text-sm mb-4">(Gói hiện tại)</div>
              )
            }
            {/* Plan options */}
            {subscriptions.length > 0 ? (
            <div className="w-full flex flex-col gap-2 mb-4">
              {subscriptions.map((plan) => (
                <label
                  key={plan._id}
                  className={`flex items-center justify-between border rounded-lg px-4 py-2 cursor-pointer transition-all relative ${
                    selectedProPlan === plan._id
                      ? "border-[var(--color-primary-blue)] bg-[var(--color-primary-pastel)]"
                      : "border-gray-300 hover:border-[var(--color-primary-blue)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="proPlan"
                      value={plan._id}
                      checked={selectedProPlan === plan._id}
                      onChange={() => setSelectedProPlan(plan._id)}
                      className="accent-[var(--color-primary-blue)] mr-3"
                    />
                    <span className="font-medium mr-2">{subscriptionType[plan.type as keyof typeof subscriptionType]}</span>
                  </div>
                  <div className="flex flex-col items-end min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through text-sm">
                        {formatVND(plan.price)}
                      </span>
                      <span className="text-[var(--color-primary-blue)] font-bold text-lg">
                        {formatVND(plan.price * (1 - plan.discount / 100))}
                      </span>
                    </div>
                    <span className="text-xs text-green-600 font-semibold mt-0.5">
                      {plan.discount ? `Giảm ${plan.discount}%` : ""}
                    </span>
                  </div>
                </label>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm mb-4">
                Đang tải gói nâng cấp...
              </div>
            )}
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
