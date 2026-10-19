"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Camera, Image as ImageIcon, Save, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import styles from "./EditProfile.module.css";

import {
  getCurrentUser,
  updateUser,
  type User,
} from "../../lib/api";

export default function EditProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const currentUser = await getCurrentUser();

        setUser(currentUser);

        setName(currentUser.name || "");
        setHandle(currentUser.handle || "");
        setBio(currentUser.bio || "");
        setLocation(currentUser.location || "");

        setAvatarPreview(currentUser.avatar || "");
        setCoverPreview(currentUser.cover || "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile picture must be 5MB or smaller.");
      return;
    }

    setError("");

    setAvatarFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarPreview(reader.result);
      }
    };

    reader.readAsDataURL(file);
  }

  function handleCoverChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Cover photo must be 5MB or smaller.");
      return;
    }

    setError("");

    setCoverFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCoverPreview(reader.result);
      }
    };

    reader.readAsDataURL(file);
  }

  async function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      setError("User information is not available.");
      return;
    }

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!handle.trim()) {
      setError("Username is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      /*
       * At this stage the backend supports avatar/cover
       * as string fields, so the selected image is sent
       * as a data URL.
       *
       * If we later add proper file storage (Supabase
       * Storage/S3), this can be changed to upload the
       * file first and save the resulting URL.
       */
      const updatedUser = await updateUser(user.id, {
        name: name.trim(),
        handle: handle.trim().replace(/^@/, ""),
        bio: bio.trim(),
        location: location.trim(),
        avatar: avatarPreview || undefined,
        cover: coverPreview || undefined,
      });

      setUser(updatedUser);

      setName(updatedUser.name || "");
      setHandle(updatedUser.handle || "");
      setBio(updatedUser.bio || "");
      setLocation(updatedUser.location || "");

      setAvatarPreview(updatedUser.avatar || "");
      setCoverPreview(updatedUser.cover || "");

      /*
       * Keep local authentication state synchronized.
       */
      localStorage.setItem(
        "mechabook-user",
        JSON.stringify(updatedUser)
      );

      setAvatarFile(null);
      setCoverFile(null);

      setSuccess("Profile updated successfully.");

      setTimeout(() => {
        router.push("/profile");
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.state}>
        <div className={styles.spinner} />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.state}>
        <div className={styles.errorIcon}>!</div>

        <h3>Profile unavailable</h3>

        <p>
          {error || "Unable to load your profile."}
        </p>
      </div>
    );
  }

  return (
    <form
      className={styles.page}
      onSubmit={handleSave}
    >
      {/* =========================================
          COVER PHOTO
      ========================================== */}

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Cover Photo</h2>

            <p>
              This image will appear at the top of your
              MechaBook profile.
            </p>
          </div>
        </div>

        <div className={styles.coverPreview}>
          {coverPreview ? (
            <img
              src={coverPreview}
              alt="Profile cover"
              className={styles.coverImage}
            />
          ) : (
            <div className={styles.noCover}>
              <ImageIcon size={34} />

              <span>No cover photo</span>
            </div>
          )}

          <label className={styles.coverButton}>
            <Camera size={16} />

            <span>Change Cover</span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverChange}
              disabled={saving}
              hidden
            />
          </label>
        </div>

        <div className={styles.fileHint}>
          Recommended: 1500 × 500px. Maximum file size: 5MB.
        </div>
      </section>

      {/* =========================================
          PROFILE PICTURE
      ========================================== */}

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Profile Picture</h2>

            <p>
              This image will be displayed next to your
              name and posts.
            </p>
          </div>
        </div>

        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={user.name}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarFallback}>
                <UserRound size={34} />
              </div>
            )}
          </div>

          <div className={styles.avatarControls}>
            <label className={styles.uploadButton}>
              <Camera size={16} />

              <span>Upload Photo</span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={saving}
                hidden
              />
            </label>

            <p>
              JPG, PNG or WEBP. Maximum file size: 5MB.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
          BASIC INFORMATION
      ========================================== */}

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Basic Information</h2>

            <p>
              Tell the MechaBook community about yourself.
            </p>
          </div>
        </div>

        <div className={styles.formContent}>
          {/* NAME */}

          <div className={styles.field}>
            <label htmlFor="name">
              Name
            </label>

            <div className={styles.inputWrapper}>
              <UserRound size={17} />

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Your name"
                maxLength={100}
                disabled={saving}
              />
            </div>
          </div>

          {/* USERNAME */}

          <div className={styles.field}>
            <label htmlFor="handle">
              Username
            </label>

            <div className={styles.inputWrapper}>
              <span className={styles.prefix}>
                @
              </span>

              <input
                id="handle"
                type="text"
                value={handle.replace(/^@/, "")}
                onChange={(event) =>
                  setHandle(
                    event.target.value
                      .replace(/^@/, "")
                      .replace(/\s/g, "")
                  )
                }
                placeholder="username"
                maxLength={50}
                disabled={saving}
              />
            </div>

            <small>
              This is your public MechaBook username.
            </small>
          </div>

          {/* EMAIL */}

          <div className={styles.field}>
            <label htmlFor="email">
              Email
            </label>

            <div className={styles.inputWrapper}>
              <input
                id="email"
                type="email"
                value={user.email}
                disabled
                readOnly
              />
            </div>

            <small>
              Email is managed by your account and cannot
              be changed here.
            </small>
          </div>

          {/* BIO */}

          <div className={styles.field}>
            <label htmlFor="bio">
              Bio
            </label>

            <textarea
              id="bio"
              value={bio}
              onChange={(event) =>
                setBio(event.target.value)
              }
              placeholder="Tell the MechaBook community about yourself..."
              rows={5}
              maxLength={500}
              disabled={saving}
            />

            <div className={styles.characterCount}>
              {bio.length}/500
            </div>
          </div>

          {/* LOCATION */}

          <div className={styles.field}>
            <label htmlFor="location">
              Location
            </label>

            <div className={styles.inputWrapper}>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                placeholder="Your location"
                maxLength={100}
                disabled={saving}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          MESSAGES
      ========================================== */}

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {success && (
        <div className={styles.successMessage}>
          {success}
        </div>
      )}

      {/* =========================================
          SAVE
      ========================================== */}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={() => router.push("/profile")}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="submit"
          className={styles.saveButton}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className={styles.buttonSpinner} />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}