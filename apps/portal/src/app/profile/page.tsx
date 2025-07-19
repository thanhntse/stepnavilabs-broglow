"use client";

import { useLanguage } from "@/context/language-context";
import { useUserContext } from "@/context/profile-context";
import { ProfileService, UpdateUserDto } from "@/services/profile-service";
import { AuthService } from "@/services/auth-service";
import { Trash, User, Pencil, X, Check } from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user, addUser } = useUserContext();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<UpdateUserDto>({
    firstName: "",
    lastName: "",
    password: "",
    avatar: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        password: "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof UpdateUserDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Only include fields that have been changed
      const updateData: UpdateUserDto = {};
      if (formData.firstName !== user.firstName) updateData.firstName = formData.firstName;
      if (formData.lastName !== user.lastName) updateData.lastName = formData.lastName;
      if (formData.avatar !== user.avatar) updateData.avatar = formData.avatar;
      if (formData.password) updateData.password = formData.password;

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        return;
      }

      const updatedUser = await ProfileService.updateProfile(user.id.toString(), updateData);
      addUser(updatedUser);
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: "" })); // Clear password field
      showSuccess({ detail: t("common.profileUpdated") });
    } catch (error) {
      console.error("Error updating profile:", error);
      showError({ detail: t("common.updateFailed") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await ProfileService.deleteProfile(user.id.toString());
      AuthService.logout();
      router.push("/");
      showSuccess({ detail: t("common.profileDeleted") });
    } catch (error) {
      console.error("Error deleting profile:", error);
      showError({ detail: t("common.deleteFailed") });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const displayName = user ? (
    `${user.firstName} ${user.lastName}`.trim()
  ) : (
    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
  );

  if (!user) {
    return (
      <>
        <div className="min-h-[calc(100vh-100px)] bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">{t("common.loading")}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-[calc(100vh-100px)] bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-blue to-primary-darkblue px-6 py-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 text-white font-semibold text-xl">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt="User Avatar"
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    ) : (
                      displayName.toString().split(" ").map((name: string, index: number) => (
                        <span key={index}>{name.charAt(0)}</span>
                      ))
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{displayName}</h1>
                    <p className="text-blue-100">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
                    >
                      <Pencil size={18} />
                      {t("common.editProfile")}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50"
                      >
                        <Check size={18} />
                        {isLoading ? t("common.loading") : t("common.saveChanges")}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            firstName: user.firstName || "",
                            lastName: user.lastName || "",
                            password: "",
                            avatar: user.avatar || "",
                          });
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
                      >
                        <X size={18} />
                        {t("common.cancel")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User size={20} className="text-primary-blue" />
                    {t("common.userInfo")}
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("form.firstName")}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          placeholder={t("form.enterFirstName")}
                        />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                          {user.firstName || t("common.loading")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("form.lastName")}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          placeholder={t("form.enterLastName")}
                        />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                          {user.lastName || t("common.loading")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("form.email")}
                      </label>
                      <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                        {user.email}
                      </p>
                    </div>

                    {isEditing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("form.password")} ({t("common.optional")})
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          placeholder={t("form.createPassword")}
                        />
                      </div>
                    )}

                    {isEditing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Avatar URL ({t("common.optional")})
                        </label>
                        <input
                          type="url"
                          value={formData.avatar}
                          onChange={(e) => handleInputChange("avatar", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          placeholder="https://example.com/avatar.jpg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Actions */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">{t("common.accountActions")}</h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h3 className="font-medium text-yellow-800 mb-2">{t("common.dangerZone")}</h3>
                      <p className="text-sm text-yellow-700 mb-4">
                        {t("common.confirmDeleteDescription")}
                      </p>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                      >
                        <Trash size={18} />
                        {t("common.deleteProfile")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("common.confirmDelete")}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("common.confirmDeleteDescription")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? t("common.loading") : t("common.delete")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
