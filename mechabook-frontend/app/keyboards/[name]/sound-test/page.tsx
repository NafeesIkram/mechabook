"use client";

import {
  ArrowLeft,
  Check,
  Upload,
  Volume2,
  Video,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { keyboards } from "../../../data/mock";
import styles from "./SoundTest.module.css";

export default function SoundTestPage() {
  const router = useRouter();
  const params = useParams();

  const keyboardName = decodeURIComponent(
    String(params.name)
  );

  const keyboard = keyboards.find(
    (item) => item.name === keyboardName
  );

  const [title, setTitle] = useState("");
  const [plate, setPlate] = useState("");
  const [switches, setSwitches] = useState("");
  const [keycaps, setKeycaps] = useState("");
  const [microphone, setMicrophone] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [fileName, setFileName] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  const [submitted, setSubmitted] = useState(false);

  if (!keyboard) {
    return (
      <div className={styles.notFound}>
        <h1>Keyboard not found</h1>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => router.push("/keyboards")}
        >
          <ArrowLeft size={16} />
          Back to Keyboards
        </button>
      </div>
    );
  }

  const handleAudioChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFileName(file.name);

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const existingRaw = localStorage.getItem(
      `mechabook-sound-tests-${keyboard.name}`
    );

    let existing = [];

    if (existingRaw) {
      try {
        const parsed = JSON.parse(existingRaw);

        if (Array.isArray(parsed)) {
          existing = parsed;
        }
      } catch {
        existing = [];
      }
    }

    const newTest = {
      id: Date.now(),
      user: "@you",
      avatar: "YO",
      title,
      plate,
      switches,
      keycaps,
      microphone,
      description,
      videoUrl,
      audioUrl,
    };

    const updatedTests = [
      ...existing,
      newTest,
    ];

    localStorage.setItem(
      `mechabook-sound-tests-${keyboard.name}`,
      JSON.stringify(updatedTests)
    );

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <Check size={28} />
          </div>

          <h1>Sound test submitted</h1>

          <p>
            Thanks for contributing a sound test for{" "}
            <strong>{keyboard.name}</strong>.
          </p>

          <p className={styles.successSubtext}>
            Your sound test has been added to the community
            page.
          </p>

          <div className={styles.successActions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() =>
                router.push(
                  `/keyboards/${encodeURIComponent(
                    keyboard.name
                  )}`
                )
              }
            >
              <ArrowLeft size={16} />
              Back to Keyboard
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setSubmitted(false)}
            >
              Add Another Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Back */}
      <button
        type="button"
        className={styles.backButton}
        onClick={() =>
          router.push(
            `/keyboards/${encodeURIComponent(
              keyboard.name
            )}`
          )
        }
      >
        <ArrowLeft size={17} />
        Back to {keyboard.name}
      </button>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.icon}>
          <Volume2 size={24} />
        </div>

        <div>
          <p className={styles.eyebrow}>
            Community contribution
          </p>

          <h1>Add Sound Test</h1>

          <p>
            Share how your{" "}
            <strong>{keyboard.name}</strong> sounds with the
            community.
          </p>
        </div>
      </div>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        {/* Information */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Sound Test Information</h2>

              <p>
                Tell the community about your recording.
              </p>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="title">
              Test title <span>*</span>
            </label>

            <input
              id="title"
              type="text"
              placeholder="e.g. Deep thocky Neo65"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              required
            />
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="plate">
                Plate
              </label>

              <input
                id="plate"
                type="text"
                placeholder="e.g. FR4"
                value={plate}
                onChange={(event) =>
                  setPlate(event.target.value)
                }
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="switches">
                Switches
              </label>

              <input
                id="switches"
                type="text"
                placeholder="e.g. Gateron Oil King"
                value={switches}
                onChange={(event) =>
                  setSwitches(event.target.value)
                }
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="keycaps">
                Keycaps
              </label>

              <input
                id="keycaps"
                type="text"
                placeholder="e.g. GMK Olivia"
                value={keycaps}
                onChange={(event) =>
                  setKeycaps(event.target.value)
                }
              />
            </div>
          </div>

          {/* Microphone */}
          <div className={styles.field}>
            <label htmlFor="microphone">
              Microphone / Recording Device
            </label>

            <input
              id="microphone"
              type="text"
              placeholder="e.g. FIFINE K669B, Blue Yeti, iPhone 16 Pro"
              value={microphone}
              onChange={(event) =>
                setMicrophone(event.target.value)
              }
            />

            <small>
              Tell viewers what microphone or device you used
              to record the sound.
            </small>
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              rows={5}
              placeholder="Describe the sound, build and recording setup..."
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
            />
          </div>
        </section>

        {/* Audio */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Audio Recording</h2>

              <p>
                Upload your keyboard sound test.
              </p>
            </div>
          </div>

          <label className={styles.uploadBox}>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
            />

            <div className={styles.uploadIcon}>
              <Upload size={22} />
            </div>

            <strong>
              {fileName ||
                "Upload your sound recording"}
            </strong>

            <span>
              {fileName
                ? "Audio file selected"
                : "MP3, WAV or other audio formats"}
            </span>
          </label>

          {audioUrl && (
            <div className={styles.audioPreview}>
              <span>Preview recording</span>

              <audio
                controls
                src={audioUrl}
              />
            </div>
          )}
        </section>

        {/* Video */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Review Video</h2>

              <p>
                Optional YouTube or video review link.
              </p>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="videoUrl">
              Video URL
            </label>

            <div className={styles.inputWithIcon}>
              <Video size={17} />

              <input
                id="videoUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(event) =>
                  setVideoUrl(event.target.value)
                }
              />
            </div>

            <small>
              If provided, a "Review Video" button will appear
              beside your sound test.
            </small>
          </div>
        </section>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() =>
              router.push(
                `/keyboards/${encodeURIComponent(
                  keyboard.name
                )}`
              )
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className={styles.primaryButton}
          >
            <Volume2 size={16} />
            Submit Sound Test
          </button>
        </div>
      </form>
    </div>
  );
}