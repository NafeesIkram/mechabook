"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  MapPin,
  Settings,
  Keyboard,
  Volume2,
  FileText,
} from "lucide-react";

import styles from "./Profile.module.css";
import {
  getCurrentUser,
  getPosts,
  getSoundTests,
  type Post,
  type SoundTest,
  type User,
} from "../lib/api";

type ProfileTab = "posts" | "sound-tests" | "keyboards";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [soundTests, setSoundTests] = useState<SoundTest[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const [currentUser, allPosts, allSoundTests] = await Promise.all([
          getCurrentUser(),
          getPosts(),
          getSoundTests(),
        ]);

        setUser(currentUser);

        setPosts(
          allPosts.filter((post) => post.user_id === currentUser.id)
        );

        setSoundTests(
          allSoundTests.filter(
            (test) => test.user_id === currentUser.id
          )
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const postCount = posts.length;
  const soundTestCount = soundTests.length;

  const displayName = user?.name || "User";
  const handle = user?.handle ? `@${user.handle}` : "@user";

  const initials = useMemo(() => {
    if (!displayName) return "U";

    return displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  }, [displayName]);

  if (loading) {
    return (
      <div className={styles.state}>
        <div className={styles.spinner} />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles.state}>
        <div className={styles.errorIcon}>!</div>

        <h3>Could not load profile</h3>

        <p>{error || "User information was not found."}</p>

        <button
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      {/* Cover */}
      <section className={styles.profileCard}>
        <div className={styles.cover}>
          {user.cover ? (
            <img
              src={user.cover}
              alt={`${displayName} cover`}
              className={styles.coverImage}
            />
          ) : (
            <div className={styles.coverPlaceholder}>
              <div className={styles.coverPattern} />
            </div>
          )}
        </div>

        <div className={styles.profileMain}>
          <div className={styles.avatarWrapper}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarFallback}>
                {initials}
              </div>
            )}

            <button
              className={styles.avatarCamera}
              aria-label="Change profile picture"
              type="button"
            >
              <Camera size={15} />
            </button>
          </div>

          <div className={styles.profileActions}>
            <a href="/profile/edit" className={styles.editButton}>
              <Settings size={16} />
              Edit Profile
            </a>
          </div>

          <div className={styles.profileInfo}>
            <div className={styles.nameLine}>
              <h1>{displayName}</h1>

              {user.star_badge && (
                <span
                  className={styles.starBadge}
                  title="Star Badge"
                >
                  ★
                </span>
              )}
            </div>

            <p className={styles.handle}>{handle}</p>

            {user.bio && (
              <p className={styles.bio}>{user.bio}</p>
            )}

            {user.location && (
              <div className={styles.location}>
                <MapPin size={15} />
                <span>{user.location}</span>
              </div>
            )}
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <strong>{postCount}</strong>
              <span>Posts</span>
            </div>

            <div className={styles.stat}>
              <strong>{soundTestCount}</strong>
              <span>Sound Tests</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className={styles.contentCard}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={
              activeTab === "posts"
                ? styles.activeTab
                : styles.tab
            }
            onClick={() => setActiveTab("posts")}
          >
            <FileText size={16} />
            Posts
            <span>{postCount}</span>
          </button>

          <button
            type="button"
            className={
              activeTab === "sound-tests"
                ? styles.activeTab
                : styles.tab
            }
            onClick={() => setActiveTab("sound-tests")}
          >
            <Volume2 size={16} />
            Sound Tests
            <span>{soundTestCount}</span>
          </button>

          <button
            type="button"
            className={
              activeTab === "keyboards"
                ? styles.activeTab
                : styles.tab
            }
            onClick={() => setActiveTab("keyboards")}
          >
            <Keyboard size={16} />
            Keyboards
          </button>
        </div>

        <div className={styles.tabContent}>
          {/* POSTS */}
          {activeTab === "posts" && (
            <>
              {posts.length === 0 ? (
                <EmptyState
                  icon={<FileText size={25} />}
                  title="No posts yet"
                  description="Your posts will appear here once you create one."
                />
              ) : (
                <div className={styles.postGrid}>
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className={styles.postCard}
                    >
                      {post.image && (
                        <img
                          src={post.image}
                          alt=""
                          className={styles.postImage}
                        />
                      )}

                      <div className={styles.postBody}>
                        {post.keyboard && (
                          <span className={styles.keyboardTag}>
                            {post.keyboard}
                          </span>
                        )}

                        {post.caption && (
                          <p>{post.caption}</p>
                        )}

                        {post.tags && (
                          <div className={styles.tags}>
                            {post.tags
                              .split(",")
                              .map((tag) => tag.trim())
                              .filter(Boolean)
                              .map((tag) => (
                                <span key={tag}>
                                  #{tag.replace(/^#/, "")}
                                </span>
                              ))}
                          </div>
                        )}

                        <div className={styles.postMeta}>
                          <span>{post.likes} likes</span>
                          <span>{post.comments} comments</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {/* SOUND TESTS */}
          {activeTab === "sound-tests" && (
            <>
              {soundTests.length === 0 ? (
                <EmptyState
                  icon={<Volume2 size={25} />}
                  title="No sound tests yet"
                  description="Your keyboard sound tests will appear here."
                />
              ) : (
                <div className={styles.soundGrid}>
                  {soundTests.map((test) => (
                    <article
                      key={test.id}
                      className={styles.soundCard}
                    >
                      <div className={styles.soundIcon}>
                        <Volume2 size={20} />
                      </div>

                      <div className={styles.soundInfo}>
                        <h3>
                          {test.title || "Untitled Sound Test"}
                        </h3>

                        {test.keyboard && (
                          <p>
                            <strong>Keyboard:</strong>{" "}
                            {test.keyboard}
                          </p>
                        )}

                        {test.switch_name && (
                          <p>
                            <strong>Switch:</strong>{" "}
                            {test.switch_name}
                          </p>
                        )}

                        {test.plate && (
                          <p>
                            <strong>Plate:</strong>{" "}
                            {test.plate}
                          </p>
                        )}

                        {test.microphone && (
                          <p>
                            <strong>Microphone:</strong>{" "}
                            {test.microphone}
                          </p>
                        )}

                        {test.description && (
                          <p className={styles.description}>
                            {test.description}
                          </p>
                        )}
                      </div>

                      {test.audio_url && (
                        <audio
                          className={styles.audio}
                          controls
                          src={test.audio_url}
                        />
                      )}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {/* KEYBOARDS */}
          {activeTab === "keyboards" && (
            <EmptyState
              icon={<Keyboard size={25} />}
              title="Keyboard collection isn't connected yet"
              description="The keyboard database/API has not been added to the backend yet. No demo keyboards are being shown."
            />
          )}
        </div>
      </section>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>

      <h3>{title}</h3>

      <p>{description}</p>
    </div>
  );
}