"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslation } from "react-i18next";


interface UserProfile {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { t } = useTranslation('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    image: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.email) {
      fetchProfile();
    }
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setProfileForm({
          name: data.name || "",
          email: data.email || "",
          image: data.image || "",
        });
      } else {
        setError(t("fetchError"));
      }
    } catch {
      setError(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        const errorData = await response.json();
        setError(t("uploadError") + ': ' + errorData.error);
        return null;
      }
    } catch {
      setError(t("uploadError"));
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileForm({ ...profileForm, image: e.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      let imageUrl = profileForm.image;
      // Upload image if a file is selected
      if (selectedFile) {
        const uploadedImageUrl = await uploadImage(selectedFile);
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        } else {
          return; // Upload failed, don't proceed
        }
      }

      const updateData = {
        name: profileForm.name,
        image: imageUrl,
      };

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setProfileForm({
          ...profileForm,
          image: updatedProfile.image || "",
        });
        setSelectedFile(null);
        setSuccess(t("updateSuccess"));

        // Update session to reflect changes
        await update({
          ...session,
          user: {
            ...session?.user,
            name: updatedProfile.name,
            image: updatedProfile.image,
          },
        });
      } else {
        const data = await response.json();
        setError(data.error || t("updateError"));
      }
    } catch {
      setError(t("updateError"));
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg">{t("loading")}</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("myProfile")}</h1>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image Section */}
            <div className="text-center">
              <div className="mb-4">
                {profileForm.image ? (
                  <Image
                    src={profileForm.image}
                    alt={t("profileImageAlt")}
                    width={150}
                    height={150}
                    className="mx-auto rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="mx-auto w-36 h-36 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("profileImageLabel")}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600">
                    {t("selectedFile")}: {selectedFile.name}
                  </p>
                )}
                {uploadingImage && (
                  <p className="text-sm text-blue-600">
                    {t("uploading")}
                  </p>
                )}
              </div>
            </div>
            {/* Profile Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("name")}
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("email")}
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("emailCannotChange")}
                </p>
              </div>
              {profile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("role")}
                    </label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      profile.role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {profile.role}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("memberSince")}
                    </label>
                    <p className="text-sm text-gray-600">
                      {new Date(profile.createdAt).toLocaleDateString('sr-RS')}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={uploadingImage}
                className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${
                  uploadingImage
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {uploadingImage ? t("updating") : t("updateProfile")}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {t("back")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
