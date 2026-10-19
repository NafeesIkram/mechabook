"use client";

import { useRouter } from "next/navigation";
import { Plus, Search, Star, Volume2 } from "lucide-react";

import { keyboards } from "../data/mock";
import { PageHead } from "../components/PageHead";
import styles from "./Keyboards.module.css";

export default function Keyboards() {
  const router = useRouter();

  const openKeyboard = (name: string) => {
    router.push(`/keyboards/${encodeURIComponent(name)}`);
  };

  return (
    <div className={styles.page}>
      <PageHead
        title="Keyboards"
        description="Community-powered keyboard information and sound tests."
        action={
          <button className="btn primary">
            <Plus size={16} />
            Contribute
          </button>
        }
      />

      {/* Search */}
      <div className={styles.search}>
        <Search size={17} />
        <input placeholder="Search keyboard model..." />
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {["All", "40%", "60%", "65%", "75%", "TKL", "Full-size"].map(
          (item, index) => (
            <button
              key={item}
              className={`${styles.filter} ${
                index === 0 ? styles.active : ""
              }`}
            >
              {item}
            </button>
          )
        )}
      </div>

      {/* Keyboard Grid */}
      <div className={styles.grid}>
        {keyboards.map((keyboard) => (
          <article
            key={keyboard.name}
            className={styles.card}
            onClick={() => openKeyboard(keyboard.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                openKeyboard(keyboard.name);
              }
            }}
          >
            <div className={styles.image}>
              <span>⌨</span>
            </div>

            <div className={styles.titleRow}>
              <div>
                <h3>{keyboard.name}</h3>
                <p>{keyboard.brand}</p>
              </div>

              <div className={styles.rating}>
                <Star size={14} fill="currentColor" />
                {keyboard.rating}
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
                <span>Builds</span>
                <strong>{keyboard.builds}</strong>
              </div>
            </div>

            <button
              className={styles.soundButton}
              onClick={(event) => {
                event.stopPropagation();
                openKeyboard(keyboard.name);
              }}
            >
              <Volume2 size={15} />
              Sound tests
            </button>

            <div className={styles.view}>
              View keyboard →
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}