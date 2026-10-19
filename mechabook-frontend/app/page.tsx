"use client";

import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  PenLine,
  Send,
  SlidersHorizontal,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getPosts,
  getUsers,
  type Post,
  type User,
} from "./lib/api";

import { PageHead } from "./components/PageHead";

import styles from "./Home.module.css";


export default function Home() {
  const [posts, setPosts] =
    useState<Post[]>([]);

  const [users, setUsers] =
    useState<User[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("For You");


  /* =====================================================
     LOAD REAL DATA FROM BACKEND
  ===================================================== */

  useEffect(() => {
    async function loadFeed() {
      try {
        setLoading(true);
        setError("");

        const [
          postsData,
          usersData,
        ] = await Promise.all([
          getPosts(),
          getUsers(),
        ]);

        setPosts(postsData);
        setUsers(usersData);

      } catch (err) {
        console.error(
          "Failed to load feed:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Could not load the feed."
        );

      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, []);


  /* =====================================================
     FIND USER
  ===================================================== */

  function findUser(
    userId: number
  ): User | undefined {
    return users.find(
      (user) =>
        user.id === userId
    );
  }


  /* =====================================================
     INITIALS
  ===================================================== */

  function getInitials(
    user?: User
  ): string {
    if (!user?.name) {
      return "MB";
    }

    return user.name
      .split(" ")
      .map(
        (part) =>
          part.charAt(0)
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }


  /* =====================================================
     TAGS
  ===================================================== */

  function getTags(
    tags?: string | null
  ): string[] {
    if (!tags) {
      return [];
    }

    return tags
      .split(",")
      .map(
        (tag) =>
          tag.trim()
      )
      .filter(Boolean);
  }


  return (
    <div className={styles.page}>

      {/* =================================================
          HEADER
      ================================================= */}

      <PageHead
        title="Home"
        description="See what the keyboard community is building."
        action={
          <button
            className="btn primary"
            type="button"
          >
            <PenLine size={16} />

            Create Post
          </button>
        }
      />


      {/* =================================================
          FEED TOOLBAR
      ================================================= */}

      <div
        className={
          styles.feedToolbar
        }
      >

        <div
          className={
            styles.tabs
          }
        >

          {[
            "For You",
            "Following",
            "Trending",
          ].map((tab) => (
            <button
              key={tab}
              type="button"
              className={
                activeTab === tab
                  ? styles.activeTab
                  : styles.tab
              }
              onClick={() =>
                setActiveTab(tab)
              }
            >
              {tab}
            </button>
          ))}

        </div>


        <button
          type="button"
          className={
            styles.filterButton
          }
        >
          <SlidersHorizontal
            size={15}
          />

          Filter
        </button>

      </div>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div
          className={
            styles.state
          }
        >
          <div
            className={
              styles.spinner
            }
          />

          <p>
            Loading posts...
          </p>
        </div>
      )}


      {/* =================================================
          ERROR
      ================================================= */}

      {!loading && error && (
        <div
          className={
            styles.state
          }
        >
          <h3>
            Could not load feed
          </h3>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="btn"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </div>
      )}


      {/* =================================================
          EMPTY
      ================================================= */}

      {!loading &&
        !error &&
        posts.length === 0 && (
          <div
            className={
              styles.state
            }
          >
            <div
              className={
                styles.emptyIcon
              }
            >
              <PenLine size={22} />
            </div>

            <h3>
              No posts yet
            </h3>

            <p>
              There are no posts in
              the community yet.
            </p>

          </div>
        )}


      {/* =================================================
          POSTS
      ================================================= */}

      {!loading &&
        !error &&
        posts.length > 0 && (

          <div
            className={
              styles.feed
            }
          >

            {posts.map((post) => {

              const user =
                findUser(
                  post.user_id
                );

              const tags =
                getTags(
                  post.tags
                );


              return (
                <article
                  key={post.id}
                  className={
                    styles.postCard
                  }
                >

                  {/* =====================================
                      POST HEADER
                  ===================================== */}

                  <div
                    className={
                      styles.postHeader
                    }
                  >

                    <div
                      className={
                        styles.userInfo
                      }
                    >

                      <div
                        className={
                          styles.avatar
                        }
                      >
                        {user?.avatar ? (
                          <img
                            src={
                              user.avatar
                            }
                            alt={
                              user.name
                            }
                          />
                        ) : (
                          getInitials(
                            user
                          )
                        )}
                      </div>


                      <div
                        className={
                          styles.userText
                        }
                      >

                        <div
                          className={
                            styles.nameRow
                          }
                        >

                          <strong>
                            {user?.name ||
                              `User #${post.user_id}`}
                          </strong>

                          {user?.star_badge && (
                            <span
                              className={
                                styles.starBadge
                              }
                              title="Star Badge"
                            >
                              ★
                            </span>
                          )}

                        </div>


                        <span
                          className={
                            styles.handle
                          }
                        >
                          {user?.handle ||
                            `@user${post.user_id}`}
                        </span>

                      </div>

                    </div>


                    <button
                      type="button"
                      className={
                        styles.moreButton
                      }
                      aria-label="Post options"
                    >
                      <MoreHorizontal
                        size={19}
                      />
                    </button>

                  </div>


                  {/* =====================================
                      IMAGE
                  ===================================== */}

                  {post.image && (
                    <div
                      className={
                        styles.imageWrapper
                      }
                    >

                      <img
                        src={post.image}
                        alt={
                          post.keyboard ||
                          "MechaBook post"
                        }
                        className={
                          styles.postImage
                        }
                      />

                    </div>
                  )}


                  {/* =====================================
                      CONTENT
                  ===================================== */}

                  <div
                    className={
                      styles.postContent
                    }
                  >

                    <p
                      className={
                        styles.caption
                      }
                    >
                      {post.caption}
                    </p>


                    {post.keyboard && (
                      <div
                        className={
                          styles.keyboardTag
                        }
                      >
                        {post.keyboard}
                      </div>
                    )}


                    {tags.length > 0 && (
                      <div
                        className={
                          styles.tags
                        }
                      >

                        {tags.map(
                          (tag) => (
                            <span
                              key={tag}
                            >
                              {tag}
                            </span>
                          )
                        )}

                      </div>
                    )}


                    {/* =================================
                        ACTIONS
                    ================================= */}

                    <div
                      className={
                        styles.postActions
                      }
                    >

                      <button
                        type="button"
                        className={
                          styles.actionButton
                        }
                      >
                        <Heart
                          size={18}
                        />

                        <span>
                          {post.likes}
                        </span>
                      </button>


                      <button
                        type="button"
                        className={
                          styles.actionButton
                        }
                      >
                        <MessageCircle
                          size={18}
                        />

                        <span>
                          {post.comments}
                        </span>
                      </button>


                      <button
                        type="button"
                        className={
                          styles.actionButton
                        }
                      >
                        <Send
                          size={17}
                        />

                        <span>
                          Share
                        </span>
                      </button>

                    </div>

                  </div>

                </article>
              );

            })}

          </div>
        )}

    </div>
  );
}