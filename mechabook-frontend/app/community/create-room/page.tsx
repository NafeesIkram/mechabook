"use client";

import {
  ArrowLeft,
  Check,
  Hash,
  Lock,
  Globe,
  Users,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CreateRoom.module.css";

type Room = {
  id: number;
  name: string;
  description: string;
  category: string;
  members: number;
  maxMembers: number;
  private: boolean;
  owner: boolean;
  joined: boolean;
  color: string;
  createdAt: string;
};

const roomColors = [
  "#7667b7",
  "#596c9c",
  "#8c647d",
  "#627c76",
  "#806a52",
  "#655b86",
];

export default function CreateRoomPage() {
  const router = useRouter();

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("General");

  const [isPrivate, setIsPrivate] =
    useState(false);

  const [maxMembers, setMaxMembers] =
    useState("1000");

  const [selectedColor, setSelectedColor] =
    useState(roomColors[0]);

  const [error, setError] =
    useState("");

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    const cleanName = name.trim();
    const cleanDescription =
      description.trim();

    if (!cleanName) {
      setError(
        "Please enter a room name."
      );
      return;
    }

    if (cleanName.length < 3) {
      setError(
        "Room name must be at least 3 characters."
      );
      return;
    }

    if (!cleanDescription) {
      setError(
        "Please add a short description."
      );
      return;
    }

    const memberLimit =
      Number(maxMembers);

    if (
      !Number.isFinite(memberLimit) ||
      memberLimit < 2
    ) {
      setError(
        "Maximum members must be at least 2."
      );
      return;
    }

    const saved =
      localStorage.getItem(
        "mechabook-community-rooms"
      );

    let existingRooms: Room[] = [];

    if (saved) {
      try {
        const parsed =
          JSON.parse(saved);

        if (Array.isArray(parsed)) {
          existingRooms = parsed;
        }
      } catch {
        existingRooms = [];
      }
    }

    const duplicate =
      existingRooms.some(
        (room) =>
          room.name.toLowerCase() ===
          cleanName.toLowerCase()
      );

    if (duplicate) {
      setError(
        "A community with this name already exists."
      );
      return;
    }

    const newRoom: Room = {
      id: Date.now(),
      name: cleanName,
      description:
        cleanDescription,
      category,
      members: 1,
      maxMembers: memberLimit,
      private: isPrivate,
      owner: true,
      joined: true,
      color: selectedColor,
      createdAt: "Just now",
    };

    localStorage.setItem(
      "mechabook-community-rooms",
      JSON.stringify([
        newRoom,
        ...existingRooms,
      ])
    );

    router.push(
      "/community"
    );
  };

  return (
    <div className={styles.page}>
      {/* Back */}
      <button
        type="button"
        className={styles.backButton}
        onClick={() =>
          router.push(
            "/community"
          )
        }
      >
        <ArrowLeft size={17} />
        Back to Community
      </button>

      {/* Header */}
      <div className={styles.header}>
        <p className={styles.eyebrow}>
          COMMUNITY
        </p>

        <h1>Create a Room</h1>

        <p>
          Start a new community around a
          keyboard topic you care about.
        </p>
      </div>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        {/* Basic information */}
        <section className={styles.section}>
          <div
            className={
              styles.sectionTitle
            }
          >
            <Hash size={17} />

            <div>
              <h2>
                Room Information
              </h2>

              <p>
                Give your community a clear
                identity.
              </p>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="name">
              Room name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              maxLength={60}
            />

            <span
              className={
                styles.characterCount
              }
            >
              {name.length}/60
            </span>
          </div>

          <div className={styles.field}>
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              rows={6}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              maxLength={240}
            />

            <span
              className={
                styles.characterCount
              }
            >
              {description.length}/240
            </span>
          </div>

          <div className={styles.field}>
            <label htmlFor="category">
              Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
            >
              <option>
                General
              </option>

              <option>
                Builds
              </option>

              <option>
                Switches
              </option>

              <option>
                Keycaps
              </option>

              <option>
                Sound Tests
              </option>

              <option>
                Bangladesh
              </option>

              <option>
                Other
              </option>
            </select>
          </div>
        </section>

        {/* Privacy */}
        <section className={styles.section}>
          <div
            className={
              styles.sectionTitle
            }
          >
            <Users size={17} />

            <div>
              <h2>
                Community Settings
              </h2>

              <p>
                Control who can access your
                room.
              </p>
            </div>
          </div>

          <div className={styles.privacyGrid}>
            <button
              type="button"
              className={`${styles.privacyOption} ${
                !isPrivate
                  ? styles.selected
                  : ""
              }`}
              onClick={() =>
                setIsPrivate(false)
              }
            >
              <div
                className={
                  styles.optionIcon
                }
              >
                <Globe size={18} />
              </div>

              <div>
                <strong>
                  Public
                </strong>

                <span>
                  Anyone can find and join
                  this room.
                </span>
              </div>

              {!isPrivate && (
                <div
                  className={
                    styles.check
                  }
                >
                  <Check size={12} />
                </div>
              )}
            </button>

            <button
              type="button"
              className={`${styles.privacyOption} ${
                isPrivate
                  ? styles.selected
                  : ""
              }`}
              onClick={() =>
                setIsPrivate(true)
              }
            >
              <div
                className={
                  styles.optionIcon
                }
              >
                <Lock size={18} />
              </div>

              <div>
                <strong>
                  Private
                </strong>

                <span>
                  Only approved members can
                  access this room.
                </span>
              </div>

              {isPrivate && (
                <div
                  className={
                    styles.check
                  }
                >
                  <Check size={12} />
                </div>
              )}
            </button>
          </div>

          <div className={styles.field}>
            <label htmlFor="maxMembers">
              Maximum members
            </label>

            <input
              id="maxMembers"
              type="number"
              min="2"
              max="100000"
              value={maxMembers}
              onChange={(event) =>
                setMaxMembers(
                  event.target.value
                )
              }
            />
          </div>
        </section>

        {/* Appearance */}
        <section className={styles.section}>
          <div
            className={
              styles.sectionTitle
            }
          >
            <Hash size={17} />

            <div>
              <h2>
                Room Appearance
              </h2>

              <p>
                Choose a color for your
                community.
              </p>
            </div>
          </div>

          <div
            className={
              styles.colorOptions
            }
          >
            {roomColors.map(
              (color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Choose ${color}`}
                  className={`${styles.colorButton} ${
                    selectedColor ===
                    color
                      ? styles.colorSelected
                      : ""
                  }`}
                  style={{
                    background:
                      color,
                  }}
                  onClick={() =>
                    setSelectedColor(
                      color
                    )
                  }
                >
                  {selectedColor ===
                    color && (
                    <Check size={15} />
                  )}
                </button>
              )
            )}
          </div>

          <div
            className={styles.preview}
          >
            <div
              className={styles.previewCover}
              style={{
                background:
                  `linear-gradient(135deg, ${selectedColor}, #15131c)`,
              }}
            >
              <div
                className={
                  styles.previewIcon
                }
              >
                <Hash size={22} />
              </div>
            </div>

            <div
              className={
                styles.previewContent
              }
            >
              <span>
                {category}
              </span>

              <strong>
                {name ||
                  "Your Community"}
              </strong>

              <p>
                {description ||
                  "Your community description will appear here."}
              </p>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {/* Notice */}
        <div className={styles.notice}>
          <strong>
            Community prototype
          </strong>

          <span>
            Your room will be stored locally
            for this prototype. Backend room
            management can be connected later.
          </span>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={
              styles.cancelButton
            }
            onClick={() =>
              router.push(
                "/community"
              )
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className={
              styles.submitButton
            }
          >
            <Users size={16} />
            Create Room
          </button>
        </div>
      </form>
    </div>
  );
}