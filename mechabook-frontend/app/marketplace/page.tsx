"use client";

import {
  ArrowUpDown,
  ChevronDown,
  MapPin,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Tag,
} from "lucide-react";

import {
  getListings,
  getCurrentUser,
} from "../lib/api";

import type {
  Listing,
  User,
} from "../lib/api";

import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";

import { useRouter } from "next/navigation";

import styles from "./Marketplace.module.css";

// ============================================================
// TYPES
// ============================================================

type SortOption =
  | "newest"
  | "price-low"
  | "price-high";

type ImageState = Record<
  number,
  boolean
>;

// ============================================================
// PAGE
// ============================================================

export default function MarketplacePage() {
  const router = useRouter();

  const [listings, setListings] =
    useState<Listing[]>([]);

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [condition, setCondition] =
    useState("All");

  const [sort, setSort] =
    useState<SortOption>("newest");

  const [showFilters, setShowFilters] =
    useState(false);

  const [brokenImages, setBrokenImages] =
    useState<ImageState>({});

  // ==========================================================
  // LOAD MARKETPLACE
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    async function loadMarketplace() {
      try {
        setLoading(true);
        setError("");

        const [
          listingData,
          currentUser,
        ] = await Promise.all([
          getListings(),
          getCurrentUser(),
        ]);

        if (!mounted) {
          return;
        }

        setListings(
          Array.isArray(listingData)
            ? listingData
            : []
        );

        setUser(currentUser);
      } catch (err) {
        console.error(
          "Marketplace loading error:",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load marketplace."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMarketplace();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================
  // CONDITIONS
  // ==========================================================

  const conditions =
    useMemo(() => {
      const values = listings
        .map(
          (listing) =>
            listing.condition
        )
        .filter(
          (
            value
          ): value is string =>
            Boolean(value)
        );

      return [
        "All",
        ...Array.from(
          new Set(values)
        ),
      ];
    }, [listings]);

  // ==========================================================
  // FILTER + SORT
  // ==========================================================

  const filteredListings =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      const filtered =
        listings.filter(
          (listing) => {
            const searchableText = [
              listing.title,
              listing.description,
              listing.location,
              listing.condition,
              listing.status,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            const matchesSearch =
              !query ||
              searchableText.includes(
                query
              );

            const matchesCondition =
              condition === "All" ||
              listing.condition ===
                condition;

            /*
             * Status does NOT hide listings.
             *
             * Active / Pending / Sold
             * all remain visible.
             */

            return (
              matchesSearch &&
              matchesCondition
            );
          }
        );

      return [...filtered].sort(
        (a, b) => {
          if (
            sort ===
            "price-low"
          ) {
            return (
              parsePrice(a.price) -
              parsePrice(b.price)
            );
          }

          if (
            sort ===
            "price-high"
          ) {
            return (
              parsePrice(b.price) -
              parsePrice(a.price)
            );
          }

          return 0;
        }
      );
    }, [
      listings,
      search,
      condition,
      sort,
    ]);

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  function resetFilters() {
    setSearch("");
    setCondition("All");
    setSort("newest");
  }

  // ==========================================================
  // REFRESH
  // ==========================================================

  async function refreshListings() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getListings();

      setListings(
        Array.isArray(data)
          ? data
          : []
      );

      setBrokenImages({});
    } catch (err) {
      console.error(
        "Refresh marketplace error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh marketplace."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // PRODUCT NAVIGATION
  // ==========================================================

  function openListing(
    listingId: number
  ) {
    router.push(
      `/marketplace/${listingId}`
    );
  }

  function handleCardKeyDown(
    event: KeyboardEvent<HTMLElement>,
    listingId: number
  ) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      openListing(listingId);
    }
  }

  // ==========================================================
  // IMAGE ERROR
  // ==========================================================

  function handleImageError(
    listingId: number
  ) {
    setBrokenImages(
      (previous) => ({
        ...previous,
        [listingId]: true,
      })
    );
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div
        className={
          styles.page
        }
      >
        <div
          className={
            styles.loadingState
          }
        >
          <div
            className={
              styles.loadingSpinner
            }
          />

          <p>
            Loading marketplace...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className={
        styles.page
      }
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div
        className={
          styles.pageHeader
        }
      >
        <div>
          <div
            className={
              styles.eyebrow
            }
          >
            <Package
              size={15}
            />

            COMMUNITY MARKETPLACE
          </div>

          <h1>
            Marketplace
          </h1>

          <p>
            Buy and sell mechanical
            keyboards, switches,
            keycaps and accessories.
          </p>
        </div>

        <button
          type="button"
          className={
            styles.sellButton
          }
          onClick={() =>
            router.push(
              "/marketplace/new"
            )
          }
        >
          <Plus
            size={18}
          />

          Sell an Item
        </button>
      </div>

      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {error && (
        <div
          className={
            styles.error
          }
        >
          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={
              refreshListings
            }
          >
            Try again
          </button>
        </div>
      )}

      {/* ================================================== */}
      {/* TOOLBAR */}
      {/* ================================================== */}

      <div
        className={
          styles.toolbar
        }
      >
        {/* SEARCH */}

        <div
          className={
            styles.searchBox
          }
        >
          <Search
            size={18}
          />

          <input
            type="text"
            placeholder="Search keyboards, switches, keycaps..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {search && (
            <button
              type="button"
              className={
                styles.clearSearch
              }
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>
          )}
        </div>

        {/* FILTER */}

        <button
          type="button"
          className={
            styles.filterButton
          }
          onClick={() =>
            setShowFilters(
              (previous) =>
                !previous
            )
          }
        >
          <SlidersHorizontal
            size={17}
          />

          Filters

          <ChevronDown
            size={16}
            className={
              showFilters
                ? styles.rotate
                : ""
            }
          />
        </button>

        {/* SORT */}

        <div
          className={
            styles.sortWrapper
          }
        >
          <ArrowUpDown
            size={16}
          />

          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target
                  .value as SortOption
              )
            }
            className={
              styles.sortSelect
            }
          >
            <option value="newest">
              Newest
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>
          </select>
        </div>
      </div>

      {/* ================================================== */}
      {/* FILTER PANEL */}
      {/* ================================================== */}

      {showFilters && (
        <div
          className={
            styles.filterPanel
          }
        >
          <div
            className={
              styles.filterGroup
            }
          >
            <label>
              Condition
            </label>

            <div
              className={
                styles.filterOptions
              }
            >
              {conditions.map(
                (item) => (
                  <button
                    type="button"
                    key={item}
                    className={
                      condition ===
                      item
                        ? styles.activeFilter
                        : styles.filterOption
                    }
                    onClick={() =>
                      setCondition(
                        item
                      )
                    }
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>

          <button
            type="button"
            className={
              styles.resetButton
            }
            onClick={
              resetFilters
            }
          >
            Reset filters
          </button>
        </div>
      )}

      {/* ================================================== */}
      {/* RESULT BAR */}
      {/* ================================================== */}

      <div
        className={
          styles.resultBar
        }
      >
        <span>
          <strong>
            {filteredListings.length}
          </strong>{" "}
          {filteredListings.length ===
          1
            ? "listing"
            : "listings"}
        </span>

        {(search ||
          condition !== "All") && (
          <button
            type="button"
            onClick={
              resetFilters
            }
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ================================================== */}
      {/* EMPTY */}
      {/* ================================================== */}

      {filteredListings.length ===
        0 && (
        <div
          className={
            styles.emptyState
          }
        >
          <div
            className={
              styles.emptyIcon
            }
          >
            <Package
              size={28}
            />
          </div>

          <h2>
            No listings found
          </h2>

          <p>
            There are no marketplace
            listings matching your
            current filters.
          </p>

          <button
            type="button"
            className={
              styles.emptyButton
            }
            onClick={
              resetFilters
            }
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ================================================== */}
      {/* LISTINGS */}
      {/* ================================================== */}

      {filteredListings.length >
        0 && (
        <div
          className={
            styles.grid
          }
        >
          {filteredListings.map(
            (listing) => {
              const price =
                parsePrice(
                  listing.price
                );

              const listingStatus =
                listing.status
                  ?.trim()
                  .toLowerCase() ||
                "active";

              const statusLabel =
                listingStatus
                  .charAt(0)
                  .toUpperCase() +
                listingStatus.slice(1);

              const imageBroken =
                brokenImages[
                  listing.id
                ];

              return (
                <article
                  key={
                    listing.id
                  }
                  className={
                    styles.card
                  }
                  onClick={() =>
                    openListing(
                      listing.id
                    )
                  }
                  onKeyDown={(
                    event
                  ) =>
                    handleCardKeyDown(
                      event,
                      listing.id
                    )
                  }
                  role="link"
                  tabIndex={0}
                >
                  {/* ================================================== */}
                  {/* IMAGE */}
                  {/* ================================================== */}

                  <div
                    className={
                      styles.imageContainer
                    }
                  >
                    {listing.image &&
                    !imageBroken ? (
                      <img
                        src={
                          listing.image
                        }
                        alt={
                          listing.title
                        }
                        className={
                          styles.productImage
                        }
                        onError={() =>
                          handleImageError(
                            listing.id
                          )
                        }
                      />
                    ) : (
                      <div
                        className={
                          styles.imageFallback
                        }
                      >
                        <Package
                          size={40}
                        />

                        <span>
                          No image
                        </span>
                      </div>
                    )}

                    {/* ================================================== */}
                    {/* CONDITION — LEFT */}
                    {/* ================================================== */}

                    {listing.condition && (
                      <span
                        className={
                          styles.conditionBadge
                        }
                      >
                        {
                          listing.condition
                        }
                      </span>
                    )}

                    {/* ================================================== */}
                    {/* STATUS — RIGHT */}
                    {/* ================================================== */}

                    <span
                      className={`${styles.statusBadge} ${
                        listingStatus ===
                        "active"
                          ? styles.statusActive
                          : listingStatus ===
                              "pending"
                            ? styles.statusPending
                            : listingStatus ===
                                "sold"
                              ? styles.statusSold
                              : ""
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* ================================================== */}
                  {/* CONTENT */}
                  {/* ================================================== */}

                  <div
                    className={
                      styles.cardBody
                    }
                  >
                    <div
                      className={
                        styles.category
                      }
                    >
                      <Tag
                        size={13}
                      />

                      Marketplace
                    </div>

                    <h2
                      className={
                        styles.title
                      }
                    >
                      {
                        listing.title
                      }
                    </h2>

                    {listing.description && (
                      <p
                        className={
                          styles.description
                        }
                      >
                        {
                          listing.description
                        }
                      </p>
                    )}

                    <div
                      className={
                        styles.price
                      }
                    >
                      ৳
                      {formatPrice(
                        price
                      )}
                    </div>

                    <div
                      className={
                        styles.location
                      }
                    >
                      <MapPin
                        size={15}
                      />

                      <span>
                        {
                          listing.location
                        }
                      </span>
                    </div>

                    {/* ================================================== */}
                    {/* SELLER */}
                    {/* ================================================== */}

                    <div
                      className={
                        styles.seller
                      }
                    >
                      <div
                        className={
                          styles.sellerAvatar
                        }
                      >
                        {listing.user_id ===
                        user?.id
                          ? user.name
                              .charAt(
                                0
                              )
                              .toUpperCase()
                          : "U"}
                      </div>

                      <div>
                        <span>
                          Seller
                        </span>

                        <strong>
                          {listing.user_id ===
                          user?.id
                            ? "You"
                            : `User #${listing.user_id}`}
                        </strong>
                      </div>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function parsePrice(
  value: string
): number {
  if (!value) {
    return 0;
  }

  const cleaned =
    String(value).replace(
      /[^\d.-]/g,
      ""
    );

  const number =
    Number(cleaned);

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}

function formatPrice(
  value: number
): string {
  return new Intl.NumberFormat(
    "en-BD",
    {
      maximumFractionDigits: 0,
    }
  ).format(value);
}