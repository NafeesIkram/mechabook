"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Keyboard,
  MapPin,
  Search,
  Star,
  User,
  X,
  SlidersHorizontal,
  ShoppingBag,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHead } from "../components/PageHead";
import {
  posts,
  keyboards,
  switches,
  listings,
} from "../data/mock";
import styles from "./Explore.module.css";

type Filter =
  | "all"
  | "posts"
  | "people"
  | "keyboards"
  | "switches"
  | "marketplace";

type Person = {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followers: number;
  verified?: boolean;
};

const people: Person[] = [
  {
    id: 1,
    name: "Alex Tan",
    handle: "@alextan",
    avatar: "AT",
    bio: "Mechanical keyboard enthusiast. Building, testing and sharing keyboards.",
    followers: 842,
    verified: true,
  },
  {
    id: 2,
    name: "Maya Chen",
    handle: "@mayakeys",
    avatar: "MC",
    bio: "Switches, keycaps and sound tests.",
    followers: 1260,
  },
  {
    id: 3,
    name: "Daniel Rahman",
    handle: "@danielmk",
    avatar: "DR",
    bio: "Custom keyboard builder from Dhaka.",
    followers: 534,
  },
  {
    id: 4,
    name: "Sara Ahmed",
    handle: "@sarakeys",
    avatar: "SA",
    bio: "Keycap collector and keyboard hobbyist.",
    followers: 719,
  },
  {
    id: 5,
    name: "KeyLab Bangladesh",
    handle: "@keylabbd",
    avatar: "KB",
    bio: "Mechanical keyboard parts and accessories.",
    followers: 2140,
    verified: true,
  },
];

export default function ExplorePage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<Filter>("all");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredPosts = useMemo(() => {
    if (!normalizedQuery) return posts;

    return posts.filter((post) => {
      return (
        post.user.toLowerCase().includes(normalizedQuery) ||
        post.handle.toLowerCase().includes(normalizedQuery) ||
        post.caption.toLowerCase().includes(normalizedQuery) ||
        post.keyboard.toLowerCase().includes(normalizedQuery) ||
        post.tags.some((tag) =>
          tag.toLowerCase().includes(normalizedQuery)
        )
      );
    });
  }, [normalizedQuery]);

  const filteredPeople = useMemo(() => {
    if (!normalizedQuery) return people;

    return people.filter((person) => {
      return (
        person.name.toLowerCase().includes(normalizedQuery) ||
        person.handle.toLowerCase().includes(normalizedQuery) ||
        person.bio.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery]);

  const filteredKeyboards = useMemo(() => {
    if (!normalizedQuery) return keyboards;

    return keyboards.filter((keyboard) => {
      return (
        keyboard.name.toLowerCase().includes(normalizedQuery) ||
        keyboard.brand.toLowerCase().includes(normalizedQuery) ||
        keyboard.layout.toLowerCase().includes(normalizedQuery) ||
        keyboard.mount.toLowerCase().includes(normalizedQuery) ||
        keyboard.material.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery]);

  const filteredSwitches = useMemo(() => {
    if (!normalizedQuery) return switches;

    return switches.filter((item) => {
      return (
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.brand.toLowerCase().includes(normalizedQuery) ||
        item.type.toLowerCase().includes(normalizedQuery) ||
        item.sound.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery]);

  const filteredListings = useMemo(() => {
    if (!normalizedQuery) return listings;

    return listings.filter((listing) => {
      return (
        listing.title.toLowerCase().includes(normalizedQuery) ||
        listing.seller.toLowerCase().includes(normalizedQuery) ||
        listing.location.toLowerCase().includes(normalizedQuery) ||
        listing.condition.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery]);

  const hasResults =
    filteredPosts.length > 0 ||
    filteredPeople.length > 0 ||
    filteredKeyboards.length > 0 ||
    filteredSwitches.length > 0 ||
    filteredListings.length > 0;

  const clearSearch = () => {
    setQuery("");
    setActiveFilter("all");
  };

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
  };

  const showSection = (
    section: Filter
  ) => {
    return (
      activeFilter === "all" ||
      activeFilter === section
    );
  };

  return (
    <div className={styles.page}>
      <PageHead
        title="Explore"
        description="Discover people, builds, keyboards, switches and marketplace listings."
      />

      {/* SEARCH */}

      <form
        className={styles.searchArea}
        onSubmit={handleSearchSubmit}
      >
        <div className={styles.searchBox}>
          <Search size={18} />

          <input
            type="text"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search anything on MechaBook..."
            aria-label="Search MechaBook"
          />

          {query && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="submit"
          className={styles.searchButton}
        >
          <Search size={15} />
          Search
        </button>
      </form>

      {/* FILTERS */}

      <div className={styles.filterBar}>
        <div className={styles.filterLabel}>
          <SlidersHorizontal size={14} />
          <span>Filter</span>
        </div>

        <div className={styles.filters}>
          <FilterButton
            label="All"
            active={activeFilter === "all"}
            onClick={() =>
              setActiveFilter("all")
            }
          />

          <FilterButton
            label="Posts"
            active={activeFilter === "posts"}
            onClick={() =>
              setActiveFilter("posts")
            }
          />

          <FilterButton
            label="People"
            active={activeFilter === "people"}
            onClick={() =>
              setActiveFilter("people")
            }
          />

          <FilterButton
            label="Keyboards"
            active={activeFilter === "keyboards"}
            onClick={() =>
              setActiveFilter("keyboards")
            }
          />

          <FilterButton
            label="Switches"
            active={activeFilter === "switches"}
            onClick={() =>
              setActiveFilter("switches")
            }
          />

          <FilterButton
            label="Marketplace"
            active={activeFilter === "marketplace"}
            onClick={() =>
              setActiveFilter("marketplace")
            }
          />
        </div>
      </div>

      {/* SEARCH SUMMARY */}

      {query && (
        <div className={styles.searchSummary}>
          <span>
            Search results for{" "}
            <strong>"{query}"</strong>
          </span>

          <button
            type="button"
            onClick={clearSearch}
          >
            Clear search
          </button>
        </div>
      )}

      {!hasResults ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Search size={24} />
          </div>

          <h2>No results found</h2>

          <p>
            We couldn't find anything matching{" "}
            <strong>"{query}"</strong>.
          </p>

          <button
            type="button"
            onClick={clearSearch}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className={styles.results}>
          {/* PEOPLE */}

          {showSection("people") &&
            filteredPeople.length > 0 && (
              <section className={styles.section}>
                <SectionHeader
                  title="People"
                  count={filteredPeople.length}
                  icon={<User size={16} />}
                />

                <div className={styles.peopleGrid}>
                  {filteredPeople.map((person) => (
                    <article
                      className={styles.personCard}
                      key={person.id}
                    >
                      <div className={styles.personTop}>
                        <div className={styles.avatar}>
                          {person.avatar}
                        </div>

                        <button
                          type="button"
                          className={styles.messageButton}
                          onClick={() =>
                            router.push("/messages")
                          }
                        >
                          <MessageCircle size={14} />
                        </button>
                      </div>

                      <div className={styles.personInfo}>
                        <div className={styles.nameRow}>
                          <h3>{person.name}</h3>

                          {person.verified && (
                            <span
                              className={styles.starBadge}
                              title="Star member"
                            >
                              <Star
                                size={10}
                                fill="currentColor"
                              />
                            </span>
                          )}
                        </div>

                        <span className={styles.handle}>
                          {person.handle}
                        </span>

                        <p>{person.bio}</p>

                        <span className={styles.followers}>
                          {person.followers.toLocaleString()} followers
                        </span>
                      </div>

                      <button
                        type="button"
                        className={styles.viewButton}
                        onClick={() =>
                          router.push(
                            `/profile?user=${encodeURIComponent(
                              person.handle
                            )}`
                          )
                        }
                      >
                        View Profile
                        <ArrowRight size={14} />
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}

          {/* POSTS */}

          {showSection("posts") &&
            filteredPosts.length > 0 && (
              <section className={styles.section}>
                <SectionHeader
                  title="Posts"
                  count={filteredPosts.length}
                  icon={<MessageCircle size={16} />}
                />

                <div className={styles.postGrid}>
                  {filteredPosts.map((post) => (
                    <article
                      className={styles.postCard}
                      key={post.id}
                    >
                      <div className={styles.postImage}>
                        <img
                          src={post.image}
                          alt={post.keyboard}
                        />

                        {post.sponsored && (
                          <span
                            className={
                              styles.sponsoredBadge
                            }
                          >
                            Sponsored
                          </span>
                        )}
                      </div>

                      <div className={styles.postBody}>
                        <div className={styles.postUser}>
                          <div className={styles.smallAvatar}>
                            {post.avatar}
                          </div>

                          <div>
                            <strong>
                              {post.user}
                            </strong>
                            <span>
                              {post.handle} · {post.time}
                            </span>
                          </div>
                        </div>

                        <p>{post.caption}</p>

                        <div className={styles.postMeta}>
                          <span>
                            {post.likes} likes
                          </span>

                          <span>
                            {post.comments} comments
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

          {/* KEYBOARDS */}

          {showSection("keyboards") &&
            filteredKeyboards.length > 0 && (
              <section className={styles.section}>
                <SectionHeader
                  title="Keyboards"
                  count={filteredKeyboards.length}
                  icon={<Keyboard size={16} />}
                />

                <div className={styles.productGrid}>
                  {filteredKeyboards.map(
                    (keyboard) => (
                      <article
                        className={styles.productCard}
                        key={keyboard.name}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          router.push(
                            `/keyboards/${encodeURIComponent(
                              keyboard.name
                            )}`
                          )
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            router.push(
                              `/keyboards/${encodeURIComponent(
                                keyboard.name
                              )}`
                            );
                          }
                        }}
                      >
                        <div
                          className={
                            styles.productVisual
                          }
                        >
                          <Keyboard size={30} />
                        </div>

                        <div
                          className={
                            styles.productBody
                          }
                        >
                          <span
                            className={
                              styles.productBrand
                            }
                          >
                            {keyboard.brand}
                          </span>

                          <h3>
                            {keyboard.name}
                          </h3>

                          <div
                            className={
                              styles.rating
                            }
                          >
                            <Star
                              size={13}
                              fill="currentColor"
                            />
                            {keyboard.rating}
                          </div>

                          <div
                            className={
                              styles.specs
                            }
                          >
                            <span>
                              {keyboard.layout}
                            </span>
                            <span>
                              {keyboard.mount}
                            </span>
                            <span>
                              {keyboard.material}
                            </span>
                          </div>

                          <div
                            className={
                              styles.productFooter
                            }
                          >
                            <span>
                              {keyboard.builds} builds
                            </span>

                            <ArrowRight
                              size={14}
                            />
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              </section>
            )}

          {/* SWITCHES */}

          {showSection("switches") &&
            filteredSwitches.length > 0 && (
              <section className={styles.section}>
                <SectionHeader
                  title="Switches"
                  count={filteredSwitches.length}
                  icon={<Keyboard size={16} />}
                />

                <div className={styles.productGrid}>
                  {filteredSwitches.map((item) => (
                    <article
                      className={styles.productCard}
                      key={item.name}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        router.push(
                          `/switches/${encodeURIComponent(
                            item.name
                          )}`
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          router.push(
                            `/switches/${encodeURIComponent(
                              item.name
                            )}`
                          );
                        }
                      }}
                    >
                      <div
                        className={
                          styles.switchVisual
                        }
                      >
                        <div
                          className={
                            styles.switchStem
                          }
                        />
                      </div>

                      <div
                        className={
                          styles.productBody
                        }
                      >
                        <span
                          className={
                            styles.productBrand
                          }
                        >
                          {item.brand}
                        </span>

                        <h3>{item.name}</h3>

                        <div
                          className={
                            styles.switchType
                          }
                        >
                          {item.type}
                        </div>

                        <div
                          className={
                            styles.rating
                          }
                        >
                          <Star
                            size={13}
                            fill="currentColor"
                          />
                          {item.rating}
                        </div>

                        <div
                          className={
                            styles.specs
                          }
                        >
                          <span>
                            {item.actuation}
                          </span>
                          <span>
                            {item.travel}
                          </span>
                          <span>
                            {item.sound}
                          </span>
                        </div>

                        <div
                          className={
                            styles.productFooter
                          }
                        >
                          <span>
                            {item.tests} sound tests
                          </span>

                          <ArrowRight
                            size={14}
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

          {/* MARKETPLACE */}

          {showSection("marketplace") &&
            filteredListings.length > 0 && (
              <section className={styles.section}>
                <SectionHeader
                  title="Marketplace"
                  count={filteredListings.length}
                  icon={<ShoppingBag size={16} />}
                />

                <div className={styles.marketGrid}>
                  {filteredListings.map(
                    (listing) => (
                      <article
                        className={styles.marketCard}
                        key={listing.id}
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          router.push(
                            `/marketplace`
                          )
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            router.push(
                              `/marketplace`
                            );
                          }
                        }}
                      >
                        <div
                          className={
                            styles.marketImage
                          }
                        >
                          <img
                            src={listing.image}
                            alt={listing.title}
                          />
                        </div>

                        <div
                          className={
                            styles.marketBody
                          }
                        >
                          <h3>{listing.title}</h3>

                          <strong>
                            {listing.price}
                          </strong>

                          <div
                            className={
                              styles.marketMeta
                            }
                          >
                            <span>
                              {listing.condition}
                            </span>

                            <span>
                              <MapPin size={11} />
                              {listing.location}
                            </span>
                          </div>

                          <div
                            className={
                              styles.seller
                            }
                          >
                            Seller:{" "}
                            <strong>
                              {listing.seller}
                            </strong>
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              </section>
            )}
        </div>
      )}
    </div>
  );
}

/* =========================
   COMPONENTS
========================= */

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.filterButton} ${
        active ? styles.filterActive : ""
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function SectionHeader({
  title,
  count,
  icon,
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        <span className={styles.sectionIcon}>
          {icon}
        </span>

        <h2>{title}</h2>

        <span className={styles.resultCount}>
          {count}
        </span>
      </div>

      <span className={styles.sectionLine} />
    </div>
  );
}