import { useLanguage } from "@/context/language-context";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useState } from "react";

export default function Footer() {
  const [status, setStatus] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmitEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus(false);

    const formData = new FormData();
    formData.append("EMAIL", email);
    formData.append("b_eb8265ebf23254c179c40d42f_13b82ef869", "");

    try {
      await fetch(
        "https://site.us8.list-manage.com/subscribe/post?u=eb8265ebf23254c179c40d42f&id=13b82ef869&f_id=0075bee0f0",
        {
          method: "POST",
          body: formData,
          mode: "no-cors",
        }
      );

      setStatus(true);
      setEmail("");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="bg-primary-green px-5 lg:px-0">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-8 py-20">
          <div className="lg:h-32 mx-auto text-white">
            <div className="bg-teal-950 border border-gray-600 p-2 rounded-2xl flex flex-col gap-2">
              <div className="px-4 py-3">{t("home.subscribeTitle")}</div>
              <form className="flex h-12" onSubmit={handleSubmitEmail}>
                <input
                  className="w-full px-4 py-2 bg-teal-950 focus:outline-0"
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("home.emailPlaceholder")}
                  required
                />
                <button
                  className="bg-primary-orange px-4 py-2 font-semibold text-white rounded-full flex gap-2 items-center"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="w-4 h-4 text-white animate-spin"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="#E5E7EB"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    <>
                      {t("common.send")}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
            {status && (
              <div className="text-center mt-2">
                <div className="text-emerald-400 font-semibold text-xs">
                  {t("home.thankYou")}
                  <br />
                  {t("home.notifyLaunch")}
                </div>
              </div>
            )}
          </div>

          <Image
            src="/logo-overlay.svg"
            width={174}
            height={32}
            className="w-full"
            alt="Logo"
          />
        </div>
      </section>

      <section className="bg-teal-950 text-sm text-center text-white py-8">
        {t("common.copyright")}
      </section>
    </>
  );
}
