"use client";

import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Star,
  Volume2,
  Plus,
  ExternalLink,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { keyboards } from "../../data/mock";
import styles from "./KeyboardDetails.module.css";

type SoundTest = {
  id: number;
  user: string;
  avatar: string;
  title: string;
  plate: string;
  switches: string;
  keycaps: string;
  microphone: string;
  description: string;
  videoUrl: string;
  audioUrl?: string;
};

const defaultSoundTests: SoundTest[] = [
  {
    id: 1,
    user: "@alextan",
    avatar: "AT",
    title: "Deep Thocky Neo65",
    plate: "FR4",
    switches: "Gateron Oil Kings",
    keycaps: "GMK keycaps",
    microphone: "FIFINE K669B",
    description: "Deep and smooth thocky sound test.",
    videoUrl: "https://www.youtube.com/",
  },
  {
    id: 2,
    user: "@jamesmk",
    avatar: "JM",
    title: "PC Plate Sound Test",
    plate: "PC",
    switches: "Gateron switches",
    keycaps: "Cherry profile",
    microphone: "Blue Yeti",
    description: "Softer sound with a PC plate.",
    videoUrl: "",
  },
  {
    id: 3,
    user: "@rkeyboards",
    avatar: "RK",
    title: "Aluminium Plate Build",
    plate: "Aluminium",
    switches: "Linear switches",
    keycaps: "PBT keycaps",
    microphone: "Rode NT-USB",
    description: "Crisp and slightly brighter sound.",
    videoUrl: "https://www.youtube.com/",
  },
];

export default function KeyboardDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const keyboardName = decodeURIComponent(String(params.name));

  const keyboard = keyboards.find(
    (item) => item.name === keyboardName
  );

  const [soundTests, setSoundTests] =
    useState<SoundTest[]>(defaultSoundTests);

  useEffect(() => {
    const saved = localStorage.getItem(
      `mechabook-sound-tests-${keyboardName}`
    );

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setSoundTests(parsed);
        }
      } catch {
        // Ignore invalid localStorage data
      }
    }
  }, [keyboardName]);

  if (!keyboard) {
    return (
      <div className={styles.notFound}>
        <h1>Keyboard not found</h1>

        <button
          className={styles.primaryButton}
          onClick={() => router.push("/keyboards")}
        >
          <ArrowLeft size={16} />
          Back to Keyboards
        </button>
      </div>
    );
  }

  const handleAddSoundTest = () => {
    router.push(
      `/keyboards/${encodeURIComponent(
        keyboard.name
      )}/sound-test`
    );
  };

  return (
    <div className={styles.page}>
      {/* Back */}
      <button
        type="button"
        className={styles.backButton}
        onClick={() => router.push("/keyboards")}
      >
        <ArrowLeft size={17} />
        Back to Keyboards
      </button>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroImage}>
          <div className={styles.keyboardIcon}>⌨</div>
        </div>

        <div className={styles.heroContent}>
          <p className={styles.brand}>{keyboard.brand}</p>

          <h1>{keyboard.name}</h1>

          <div className={styles.rating}>
            <Star size={17} fill="currentColor" />
            <strong>{keyboard.rating}</strong>
            <span>Community rating</span>
          </div>

          <p className={styles.description}>
            Explore specifications, community builds, sound tests
            and contributions from other mechanical keyboard
            enthusiasts.
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
            >
              <Heart size={16} />
              Save
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
            >
              <MessageCircle size={16} />
              Discuss
            </button>
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Specifications</h2>
            <p>Keyboard information</p>
          </div>
        </div>

        <div className={styles.specGrid}>
          <div className={styles.spec}>
            <span>Layout</span>
            <strong>{keyboard.layout}</strong>
          </div>

          <div className={styles.spec}>
            <span>Mount</span>
            <strong>{keyboard.mount}</strong>
          </div>

          <div className={styles.spec}>
            <span>Material</span>
            <strong>{keyboard.material}</strong>
          </div>

          <div className={styles.spec}>
            <span>Community Builds</span>
            <strong>{keyboard.builds}</strong>
          </div>
        </div>
      </section>

      {/* Sound Tests */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Sound Tests</h2>
            <p>
              Community submitted sound tests
            </p>
          </div>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleAddSoundTest}
          >
            <Plus size={15} />
            Add Sound Test
          </button>
        </div>

        <div className={styles.soundList}>
          {soundTests.map((test) => (
            <div
              key={test.id}
              className={styles.soundItem}
            >
              <div className={styles.avatar}>
                {test.avatar}
              </div>

              <div className={styles.soundInfo}>
                <strong>{test.user}</strong>

                <span>{test.title}</span>

                <small>
                  {test.plate} · {test.switches}
                </small>

                <small>
                  🎙 {test.microphone}
                </small>
              </div>

              <div className={styles.soundActions}>
                {test.audioUrl && (
                  <audio
                    controls
                    src={test.audioUrl}
                    className={styles.audioPlayer}
                  />
                )}

                {!test.audioUrl && (
                  <button
                    type="button"
                    className={styles.playButton}
                    disabled
                  >
                    <Volume2 size={15} />
                    Play
                  </button>
                )}

                {test.videoUrl && (
                  <a
                    href={test.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.videoButton}
                  >
                    <ExternalLink size={14} />
                    Review Video
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Builds */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Community Builds</h2>
            <p>
              Builds shared by the community
            </p>
          </div>

          <button
            type="button"
            className={styles.secondaryButton}
          >
            View all
          </button>
        </div>

        <div className={styles.buildGrid}>
          <div className={styles.buildCard}>
            <div className={styles.buildImage}>⌨</div>
            <strong>Deep Thock Build</strong>
            <span>@alex</span>
          </div>

          <div className={styles.buildCard}>
            <div className={styles.buildImage}>⌨</div>
            <strong>Silent Office Build</strong>
            <span>@james</span>
          </div>

          <div className={styles.buildCard}>
            <div className={styles.buildImage}>⌨</div>
            <strong>Creamy Linear Build</strong>
            <span>@rkeyboards</span>
          </div>
        </div>
      </section>

      {/* Contribution */}
      <section className={styles.contribution}>
        <div>
          <h2>Help improve this page</h2>
          <p>
            Have better specifications, a build, review or sound
            test?
          </p>
        </div>

        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleAddSoundTest}
        >
          <Plus size={16} />
          Contribute
        </button>
      </section>
    </div>
  );
}