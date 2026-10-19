"use client";

import { useEffect, useMemo, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { useRouter } from "next/navigation";

import {
  BarChart3,
  BadgeCheck,
  Check,
  ChevronRight,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Users,
  Volume2,
  X,
} from "lucide-react";

import styles from "./Admin.module.css";

import {
  deleteCommunity,
  deleteListing,
  deletePost,
  deleteSoundTest,
  deleteUser,
  getCommunities,
  getListings,
  getPosts,
  getSoundTests,
  getUsers,
  type User,
  type Post,
  type MarketplaceListing,
  type Community,
  type SoundTest,
} from "../lib/api";

/* =========================================================
   TYPES
========================================================= */

type Section =
  | "dashboard"
  | "users"
  | "posts"
  | "marketplace"
  | "communities"
  | "sound-tests";

type DeleteTarget =
  | {
      type: "user";
      id: number;
      name: string;
    }
  | {
      type: "post";
      id: number;
      name: string;
    }
  | {
      type: "listing";
      id: number;
      name: string;
    }
  | {
      type: "community";
      id: number;
      name: string;
    }
  | {
      type: "sound-test";
      id: number;
      name: string;
    }
  | null;


/* =========================================================
   ADMIN PAGE
========================================================= */

export default function AdminPage() {
  const router = useRouter();

  const [section, setSection] =
    useState<Section>("dashboard");

  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [listings, setListings] =
    useState<MarketplaceListing[]>([]);
  const [communities, setCommunities] =
    useState<Community[]>([]);
  const [soundTests, setSoundTests] =
    useState<SoundTest[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [actionMessage, setActionMessage] =
    useState("");

  const [deleteTarget, setDeleteTarget] =
    useState<DeleteTarget>(null);

  const [deleting, setDeleting] =
    useState(false);


  /* =======================================================
     AUTH CHECK
  ======================================================= */

  useEffect(() => {
    const token =
      localStorage.getItem("mechabook-token");

    const userRaw =
      localStorage.getItem("mechabook-user");

    if (!token || !userRaw) {
      router.replace("/admin/login");
      return;
    }

    try {
      const user = JSON.parse(userRaw);

      if (!user.is_admin) {
        router.replace("/login");
        return;
      }

      loadAdminData();
    } catch {
      router.replace("/admin/login");
    }
  }, [router]);


  /* =======================================================
     LOAD ADMIN DATA
  ======================================================= */

  async function loadAdminData() {
    setLoading(true);
    setError("");

    try {
      const [
        usersData,
        postsData,
        listingsData,
        communitiesData,
        soundTestsData,
      ] = await Promise.all([
        getUsers(),
        getPosts(),
        getListings(),
        getCommunities(),
        getSoundTests(),
      ]);

      setUsers(usersData);
      setPosts(postsData);
      setListings(listingsData);
      setCommunities(communitiesData);
      setSoundTests(soundTestsData);
    } catch (err) {
      console.error(err);

      setError(
        "Could not load admin data. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }


  /* =======================================================
     MESSAGE
  ======================================================= */

  function showMessage(message: string) {
    setActionMessage(message);

    window.setTimeout(() => {
      setActionMessage("");
    }, 3000);
  }


  /* =======================================================
     LOGOUT
  ======================================================= */

  function handleLogout() {
    localStorage.removeItem("mechabook-token");
    localStorage.removeItem("mechabook-user");

    router.replace("/admin/login");
  }


  /* =======================================================
     USER NAME
  ======================================================= */

  function getUserName(userId: number) {
    const user = users.find(
      (item) => item.id === userId
    );

    return user?.name || `User #${userId}`;
  }


  /* =======================================================
     SEARCH - USERS
  ======================================================= */

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [
        user.name,
        user.handle,
        user.email,
        user.location,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        )
    );
  }, [users, search]);


  /* =======================================================
     SEARCH - POSTS
  ======================================================= */

  const filteredPosts = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return posts;
    }

    return posts.filter((post) =>
      [
        post.caption,
        post.keyboard,
        post.tags,
        getUserName(post.user_id),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        )
    );
  }, [posts, search, users]);


  /* =======================================================
     SEARCH - MARKETPLACE
  ======================================================= */

  const filteredListings = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return listings;
    }

    return listings.filter((listing) =>
      [
        listing.title,
        listing.description,
        listing.location,
        listing.category,
        listing.condition,
        getUserName(listing.user_id),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        )
    );
  }, [listings, search, users]);


  /* =======================================================
     SEARCH - COMMUNITIES
  ======================================================= */

  const filteredCommunities = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return communities;
    }

    return communities.filter((community) =>
      [
        community.name,
        community.description,
        community.category,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        )
    );
  }, [communities, search]);


  /* =======================================================
     SEARCH - SOUND TESTS
  ======================================================= */

  const filteredSoundTests = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return soundTests;
    }

    return soundTests.filter((test) =>
      [
        test.title,
        test.keyboard,
        test.switch_name,
        test.plate,
        test.switches,
        test.keycaps,
        test.microphone,
        getUserName(test.user_id),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        )
    );
  }, [soundTests, search, users]);


  /* =======================================================
     DELETE CONFIRM
  ======================================================= */

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);

    try {
      /* ---------------- USER ---------------- */

      if (deleteTarget.type === "user") {
        await deleteUser(deleteTarget.id);

        setUsers((current) =>
          current.filter(
            (user) =>
              user.id !== deleteTarget.id
          )
        );

        showMessage(
          "User deleted successfully."
        );
      }


      /* ---------------- POST ---------------- */

      if (deleteTarget.type === "post") {
        await deletePost(deleteTarget.id);

        setPosts((current) =>
          current.filter(
            (post) =>
              post.id !== deleteTarget.id
          )
        );

        showMessage(
          "Post deleted successfully."
        );
      }


      /* ---------------- LISTING ---------------- */

      if (deleteTarget.type === "listing") {
        await deleteListing(deleteTarget.id);

        setListings((current) =>
          current.filter(
            (listing) =>
              listing.id !== deleteTarget.id
          )
        );

        showMessage(
          "Marketplace listing deleted successfully."
        );
      }


      /* ---------------- COMMUNITY ---------------- */

      if (deleteTarget.type === "community") {
        await deleteCommunity(deleteTarget.id);

        setCommunities((current) =>
          current.filter(
            (community) =>
              community.id !== deleteTarget.id
          )
        );

        showMessage(
          "Community deleted successfully."
        );
      }


      /* ---------------- SOUND TEST ---------------- */

      if (deleteTarget.type === "sound-test") {
        await deleteSoundTest(deleteTarget.id);

        setSoundTests((current) =>
          current.filter(
            (soundTest) =>
              soundTest.id !== deleteTarget.id
          )
        );

        showMessage(
          "Sound test deleted successfully."
        );
      }

      setDeleteTarget(null);
    } catch (err) {
      console.error(err);

      setError(
        "The action failed. Please check the backend and try again."
      );
    } finally {
      setDeleting(false);
    }
  }


  /* =======================================================
     STAR BADGE
  ======================================================= */

  function toggleStarBadge(user: User) {
    const updatedUser: User = {
      ...user,
      star_badge: !user.star_badge,
    };

    setUsers((current) =>
      current.map((item) =>
        item.id === user.id
          ? updatedUser
          : item
      )
    );

    showMessage(
      updatedUser.star_badge
        ? `${user.name} received the Star Badge.`
        : `${user.name}'s Star Badge was removed.`
    );
  }


  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(
    () => [
      {
        label: "Total Users",
        value: users.length,
        icon: Users,
        section: "users" as Section,
      },
      {
        label: "Total Posts",
        value: posts.length,
        icon: FileText,
        section: "posts" as Section,
      },
      {
        label: "Marketplace Listings",
        value: listings.length,
        icon: ShoppingBag,
        section: "marketplace" as Section,
      },
      {
        label: "Communities",
        value: communities.length,
        icon: MessageSquare,
        section: "communities" as Section,
      },
      {
        label: "Sound Tests",
        value: soundTests.length,
        icon: Volume2,
        section: "sound-tests" as Section,
      },
    ],
    [
      users,
      posts,
      listings,
      communities,
      soundTests,
    ]
  );


  /* =======================================================
     DASHBOARD
  ======================================================= */

  function renderDashboard() {
    return (
      <div className={styles.dashboard}>

        <div className={styles.welcome}>
          <div>
            <span className={styles.eyebrow}>
              MechaBook Admin
            </span>

            <h1>Dashboard</h1>

            <p>
              Manage users, posts, marketplace
              listings, communities and sound tests.
            </p>
          </div>

          <div className={styles.adminBadge}>
            <ShieldCheck size={18} />
            Administrator
          </div>
        </div>


        <div className={styles.statsGrid}>
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <button
                key={stat.label}
                className={styles.statCard}
                onClick={() => {
                  setSection(stat.section);
                  setSearch("");
                }}
              >
                <div className={styles.statIcon}>
                  <Icon size={21} />
                </div>

                <div className={styles.statContent}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>

                <ChevronRight
                  size={18}
                  className={styles.statArrow}
                />
              </button>
            );
          })}
        </div>


        <div className={styles.quickSection}>
          <div className={styles.sectionTitle}>
            <div>
              <h2>Quick Management</h2>

              <p>
                Select an area to manage.
              </p>
            </div>
          </div>


          <div className={styles.quickGrid}>

            <button
              className={styles.quickCard}
              onClick={() => {
                setSection("users");
                setSearch("");
              }}
            >
              <Users size={20} />

              <div>
                <strong>Users</strong>

                <span>
                  View, delete and manage badges
                </span>
              </div>

              <ChevronRight size={18} />
            </button>


            <button
              className={styles.quickCard}
              onClick={() => {
                setSection("posts");
                setSearch("");
              }}
            >
              <FileText size={20} />

              <div>
                <strong>Posts</strong>

                <span>
                  View and delete posts
                </span>
              </div>

              <ChevronRight size={18} />
            </button>


            <button
              className={styles.quickCard}
              onClick={() => {
                setSection("marketplace");
                setSearch("");
              }}
            >
              <ShoppingBag size={20} />

              <div>
                <strong>Marketplace</strong>

                <span>
                  Manage marketplace listings
                </span>
              </div>

              <ChevronRight size={18} />
            </button>


            <button
              className={styles.quickCard}
              onClick={() => {
                setSection("communities");
                setSearch("");
              }}
            >
              <MessageSquare size={20} />

              <div>
                <strong>Communities</strong>

                <span>
                  Manage community rooms
                </span>
              </div>

              <ChevronRight size={18} />
            </button>


            <button
              className={styles.quickCard}
              onClick={() => {
                setSection("sound-tests");
                setSearch("");
              }}
            >
              <Volume2 size={20} />

              <div>
                <strong>Sound Tests</strong>

                <span>
                  View and delete sound tests
                </span>
              </div>

              <ChevronRight size={18} />
            </button>

          </div>
        </div>
      </div>
    );
  }


  /* =======================================================
     USERS
  ======================================================= */

  function renderUsers() {
    return (
      <AdminSection
        title="Users"
        description="View users, delete accounts and manage Star Badges."
        count={users.length}
      >
        {filteredUsers.length === 0 ? (
          <EmptyState text="No users found." />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>

              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Role</th>
                  <th>Badge</th>
                  <th>Action</th>
                </tr>
              </thead>


              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>

                    <td>
                      <div className={styles.userCell}>

                        <Avatar
                          name={user.name}
                          src={user.avatar}
                        />

                        <div>
                          <strong>
                            {user.name}
                          </strong>

                          <span>
                            {user.handle}
                          </span>
                        </div>

                      </div>
                    </td>


                    <td>
                      {user.email || "—"}
                    </td>


                    <td>
                      {user.location || "—"}
                    </td>


                    <td>
                      {user.is_admin ? (
                        <span
                          className={
                            styles.roleAdmin
                          }
                        >
                          Admin
                        </span>
                      ) : (
                        <span
                          className={
                            styles.roleUser
                          }
                        >
                          User
                        </span>
                      )}
                    </td>


                    <td>
                      <button
                        className={
                          user.star_badge
                            ? styles.badgeButtonActive
                            : styles.badgeButton
                        }
                        onClick={() =>
                          toggleStarBadge(user)
                        }
                      >
                        <BadgeCheck size={16} />

                        {user.star_badge
                          ? "Starred"
                          : "Give Star"}
                      </button>
                    </td>


                    <td>
                      <button
                        className={
                          styles.deleteButton
                        }
                        onClick={() =>
                          setDeleteTarget({
                            type: "user",
                            id: user.id,
                            name: user.name,
                          })
                        }
                        disabled={Boolean(
                          user.is_admin
                        )}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </AdminSection>
    );
  }


  /* =======================================================
     POSTS
  ======================================================= */

  function renderPosts() {
    return (
      <AdminSection
        title="Posts"
        description="View and delete posts from MechaBook."
        count={posts.length}
      >
        {filteredPosts.length === 0 ? (
          <EmptyState text="No posts found." />
        ) : (
          <div className={styles.itemList}>

            {filteredPosts.map((post) => (
              <div
                className={styles.itemCard}
                key={post.id}
              >

                <div className={styles.itemMain}>

                  <div className={styles.itemIcon}>
                    <FileText size={20} />
                  </div>


                  <div className={styles.itemContent}>

                    <div
                      className={
                        styles.itemTop
                      }
                    >
                      <strong>
                        {getUserName(
                          post.user_id
                        )}
                      </strong>

                      {post.keyboard && (
                        <span
                          className={
                            styles.smallTag
                          }
                        >
                          {post.keyboard}
                        </span>
                      )}
                    </div>


                    <p>
                      {post.caption ||
                        "No caption"}
                    </p>


                    <div
                      className={styles.meta}
                    >
                      <span>
                        {post.likes || 0} likes
                      </span>

                      <span>
                        {post.comments || 0} comments
                      </span>

                      {post.sponsored && (
                        <span>
                          Sponsored
                        </span>
                      )}
                    </div>

                  </div>

                </div>


                <button
                  className={
                    styles.deleteButton
                  }
                  onClick={() =>
                    setDeleteTarget({
                      type: "post",
                      id: post.id,
                      name:
                        post.caption?.slice(
                          0,
                          45
                        ) ||
                        `Post #${post.id}`,
                    })
                  }
                >
                  <Trash2 size={16} />
                  Delete
                </button>

              </div>
            ))}

          </div>
        )}
      </AdminSection>
    );
  }


  /* =======================================================
     MARKETPLACE
  ======================================================= */

  function renderMarketplace() {
    return (
      <AdminSection
        title="Marketplace"
        description="View and delete marketplace listings."
        count={listings.length}
      >
        {filteredListings.length === 0 ? (
          <EmptyState
            text="No marketplace listings found."
          />
        ) : (
          <div className={styles.itemList}>

            {filteredListings.map(
              (listing) => (
                <div
                  className={styles.itemCard}
                  key={listing.id}
                >

                  <div
                    className={
                      styles.itemMain
                    }
                  >

                    <div
                      className={
                        styles.imageThumb
                      }
                    >
                      {listing.image ? (
                        <img
                          src={listing.image}
                          alt={
                            listing.title
                          }
                        />
                      ) : (
                        <ShoppingBag
                          size={20}
                        />
                      )}
                    </div>


                    <div
                      className={
                        styles.itemContent
                      }
                    >

                      <div
                        className={
                          styles.itemTop
                        }
                      >
                        <strong>
                          {listing.title}
                        </strong>

                        <span
                          className={
                            styles.price
                          }
                        >
                          ৳ {listing.price}
                        </span>
                      </div>


                      <p>
                        {listing.description ||
                          "No description"}
                      </p>


                      <div
                        className={
                          styles.meta
                        }
                      >
                        <span>
                          Seller:{" "}
                          {getUserName(
                            listing.user_id
                          )}
                        </span>

                        <span>
                          {listing.location}
                        </span>

                        <span>
                          {listing.condition}
                        </span>

                        {listing.category && (
                          <span>
                            {
                              listing.category
                            }
                          </span>
                        )}
                      </div>

                    </div>

                  </div>


                  <button
                    className={
                      styles.deleteButton
                    }
                    onClick={() =>
                      setDeleteTarget({
                        type: "listing",
                        id: listing.id,
                        name: listing.title,
                      })
                    }
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>

                </div>
              )
            )}

          </div>
        )}
      </AdminSection>
    );
  }


  /* =======================================================
     COMMUNITIES
  ======================================================= */

  function renderCommunities() {
    return (
      <AdminSection
        title="Communities"
        description="View and delete community rooms."
        count={communities.length}
      >
        {filteredCommunities.length === 0 ? (
          <EmptyState
            text="No communities found."
          />
        ) : (
          <div className={styles.itemList}>

            {filteredCommunities.map(
              (community) => (
                <div
                  className={styles.itemCard}
                  key={community.id}
                >

                  <div
                    className={
                      styles.itemMain
                    }
                  >

                    <div
                      className={
                        styles.itemIcon
                      }
                    >
                      <MessageSquare
                        size={20}
                      />
                    </div>


                    <div
                      className={
                        styles.itemContent
                      }
                    >

                      <div
                        className={
                          styles.itemTop
                        }
                      >
                        <strong>
                          {community.name}
                        </strong>

                        <span
                          className={
                            styles.smallTag
                          }
                        >
                          {community.private
                            ? "Private"
                            : "Public"}
                        </span>
                      </div>


                      <p>
                        {community.description ||
                          "No description"}
                      </p>


                      <div
                        className={
                          styles.meta
                        }
                      >
                        {community.category && (
                          <span>
                            {
                              community.category
                            }
                          </span>
                        )}

                        <span>
                          {community.members ||
                            0}{" "}
                          members
                        </span>

                        {community.max_members && (
                          <span>
                            Max{" "}
                            {
                              community.max_members
                            }
                          </span>
                        )}
                      </div>

                    </div>

                  </div>


                  <button
                    className={
                      styles.deleteButton
                    }
                    onClick={() =>
                      setDeleteTarget({
                        type: "community",
                        id: community.id,
                        name: community.name,
                      })
                    }
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>

                </div>
              )
            )}

          </div>
        )}
      </AdminSection>
    );
  }


  /* =======================================================
     SOUND TESTS
  ======================================================= */

  function renderSoundTests() {
    return (
      <AdminSection
        title="Sound Tests"
        description="View and delete keyboard and switch sound tests."
        count={soundTests.length}
      >
        {filteredSoundTests.length === 0 ? (
          <EmptyState
            text="No sound tests found."
          />
        ) : (
          <div className={styles.itemList}>

            {filteredSoundTests.map(
              (test) => (
                <div
                  className={styles.itemCard}
                  key={test.id}
                >

                  <div
                    className={
                      styles.itemMain
                    }
                  >

                    <div
                      className={
                        styles.itemIcon
                      }
                    >
                      <Volume2 size={20} />
                    </div>


                    <div
                      className={
                        styles.itemContent
                      }
                    >

                      <div
                        className={
                          styles.itemTop
                        }
                      >
                        <strong>
                          {test.title ||
                            test.keyboard ||
                            test.switch_name ||
                            `Sound Test #${test.id}`}
                        </strong>

                        {test.keyboard && (
                          <span
                            className={
                              styles.smallTag
                            }
                          >
                            {test.keyboard}
                          </span>
                        )}

                        {test.switch_name && (
                          <span
                            className={
                              styles.smallTag
                            }
                          >
                            {test.switch_name}
                          </span>
                        )}
                      </div>


                      <p>
                        {test.description ||
                          "No description"}
                      </p>


                      <div
                        className={
                          styles.meta
                        }
                      >
                        <span>
                          By{" "}
                          {getUserName(
                            test.user_id
                          )}
                        </span>

                        {test.plate && (
                          <span>
                            Plate:{" "}
                            {test.plate}
                          </span>
                        )}

                        {test.switches && (
                          <span>
                            Switches:{" "}
                            {test.switches}
                          </span>
                        )}

                        {test.microphone && (
                          <span>
                            Mic:{" "}
                            {test.microphone}
                          </span>
                        )}
                      </div>

                    </div>

                  </div>


                  <button
                    className={
                      styles.deleteButton
                    }
                    onClick={() =>
                      setDeleteTarget({
                        type: "sound-test",
                        id: test.id,
                        name:
                          test.title ||
                          test.keyboard ||
                          test.switch_name ||
                          `Sound Test #${test.id}`,
                      })
                    }
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>

                </div>
              )
            )}

          </div>
        )}
      </AdminSection>
    );
  }


  /* =======================================================
     CONTENT
  ======================================================= */

  function renderContent() {
    if (loading) {
      return (
        <div className={styles.loading}>
          <div className={styles.spinner} />

          <p>
            Loading admin dashboard...
          </p>
        </div>
      );
    }


    if (section === "dashboard") {
      return renderDashboard();
    }


    if (section === "users") {
      return renderUsers();
    }


    if (section === "posts") {
      return renderPosts();
    }


    if (section === "marketplace") {
      return renderMarketplace();
    }


    if (section === "communities") {
      return renderCommunities();
    }


    return renderSoundTests();
  }


  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className={styles.page}>

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className={styles.sidebar}>

        <div className={styles.logoArea}>

          <div className={styles.logoMark}>
            M
          </div>

          <div>
            <strong>
              Mechabook
            </strong>

            <span>
              Admin
            </span>
          </div>

        </div>


        <nav className={styles.nav}>

          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={
              section === "dashboard"
            }
            onClick={() => {
              setSection("dashboard");
              setSearch("");
            }}
          />


          <NavItem
            icon={Users}
            label="Users"
            active={
              section === "users"
            }
            onClick={() => {
              setSection("users");
              setSearch("");
            }}
          />


          <NavItem
            icon={FileText}
            label="Posts"
            active={
              section === "posts"
            }
            onClick={() => {
              setSection("posts");
              setSearch("");
            }}
          />


          <NavItem
            icon={ShoppingBag}
            label="Marketplace"
            active={
              section === "marketplace"
            }
            onClick={() => {
              setSection("marketplace");
              setSearch("");
            }}
          />


          <NavItem
            icon={MessageSquare}
            label="Communities"
            active={
              section === "communities"
            }
            onClick={() => {
              setSection("communities");
              setSearch("");
            }}
          />


          <NavItem
            icon={Volume2}
            label="Sound Tests"
            active={
              section === "sound-tests"
            }
            onClick={() => {
              setSection("sound-tests");
              setSearch("");
            }}
          />

        </nav>


        <div className={styles.sidebarBottom}>

          <button
            className={
              styles.backButton
            }
            onClick={() =>
              router.push("/")
            }
          >
            <ChevronRight size={17} />

            Back to Mechabook
          </button>


          <button
            className={
              styles.logoutButton
            }
            onClick={handleLogout}
          >
            <X size={17} />

            Logout
          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className={styles.main}>

        <header className={styles.topbar}>

          <div>

            <span
              className={
                styles.topEyebrow
              }
            >
              Administration
            </span>

            <h1>
              {section === "dashboard"
                ? "Dashboard"
                : section === "sound-tests"
                ? "Sound Tests"
                : section
                    .charAt(0)
                    .toUpperCase() +
                  section.slice(1)}
            </h1>

          </div>


          {section !== "dashboard" && (
            <div
              className={
                styles.searchBox
              }
            >
              <Search size={17} />

              <input
                type="text"
                placeholder={`Search ${section}...`}
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

              {search && (
                <button
                  onClick={() =>
                    setSearch("")
                  }
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}

            </div>
          )}

        </header>


        {/* ERROR */}

        {error && (
          <div
            className={
              styles.errorBanner
            }
          >
            <span>
              {error}
            </span>

            <button
              onClick={() =>
                setError("")
              }
            >
              <X size={16} />
            </button>
          </div>
        )}


        {/* SUCCESS */}

        {actionMessage && (
          <div
            className={
              styles.successBanner
            }
          >
            <Check size={17} />

            <span>
              {actionMessage}
            </span>
          </div>
        )}


        {renderContent()}

      </main>


      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {deleteTarget && (
        <div
          className={
            styles.modalOverlay
          }
        >

          <div
            className={
              styles.modal
            }
          >

            <div
              className={
                styles.modalIcon
              }
            >
              <Trash2 size={22} />
            </div>


            <h2>
              Delete this item?
            </h2>


            <p>
              You are about to permanently
              delete{" "}
              <strong>
                {deleteTarget.name}
              </strong>
              .
              <br />
              This action cannot be undone.
            </p>


            <div
              className={
                styles.modalActions
              }
            >

              <button
                className={
                  styles.cancelButton
                }
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={deleting}
              >
                Cancel
              </button>


              <button
                className={
                  styles.confirmDeleteButton
                }
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div
                      className={
                        styles.buttonSpinner
                      }
                    />

                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />

                    Delete
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}


/* =========================================================
   ADMIN SECTION
========================================================= */

function AdminSection({
  title,
  description,
  count,
  children,
}: {
  title: string;
  description: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section
      className={
        styles.contentSection
      }
    >

      <div
        className={
          styles.sectionHeader
        }
      >

        <div>

          <div
            className={
              styles.titleRow
            }
          >
            <h2>
              {title}
            </h2>

            <span
              className={
                styles.countBadge
              }
            >
              {count}
            </span>
          </div>

          <p>
            {description}
          </p>

        </div>

      </div>


      {children}

    </section>
  );
}


/* =========================================================
   NAV ITEM
========================================================= */

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`${styles.navItem} ${
        active
          ? styles.navItemActive
          : ""
      }`}
      onClick={onClick}
    >

      <Icon size={18} />

      <span>
        {label}
      </span>

      {active && (
        <span
          className={
            styles.activeIndicator
          }
        />
      )}

    </button>
  );
}


/* =========================================================
   AVATAR
========================================================= */

function Avatar({
  name,
  src,
}: {
  name: string;
  src?: string | null;
}) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();


  if (src) {
    return (
      <div
        className={
          styles.avatar
        }
      >
        <img
          src={src}
          alt={name}
        />
      </div>
    );
  }


  return (
    <div
      className={
        styles.avatar
      }
    >
      {initials}
    </div>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div
      className={
        styles.emptyState
      }
    >
      <BarChart3 size={25} />

      <strong>
        {text}
      </strong>

      <span>
        Data will appear here when it is available.
      </span>
    </div>
  );
}