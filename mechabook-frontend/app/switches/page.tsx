"use client";

import {
  Plus,
  Search,
  Star,
  Volume2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  getSwitches,
} from "../lib/api";

import type {
  Switch as ApiSwitch,
} from "../lib/api";

import {
  switches,
} from "../data/mock";

import {
  PageHead,
} from "../components/PageHead";

import styles from "./Switches.module.css";


type CustomSwitch = ApiSwitch & {
  isCustom: true;
};


type SwitchItem =
  | (typeof switches)[number]
  | CustomSwitch;


const ITEMS_PER_PAGE = 20;


export default function SwitchesPage() {
  const router = useRouter();


  const [
    customSwitches,
    setCustomSwitches,
  ] = useState<CustomSwitch[]>([]);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    activeFilter,
    setActiveFilter,
  ] = useState("All");


  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);


  const [
    loading,
    setLoading,
  ] = useState(true);


  // ==========================================================
  // LOAD BACKEND SWITCHES
  // ==========================================================

  useEffect(() => {
    let mounted = true;


    async function loadSwitches() {
      try {
        setLoading(true);

        const result =
          await getSwitches();

        if (!mounted) {
          return;
        }

        setCustomSwitches(
          Array.isArray(result)
            ? result.map(
                (item) => ({
                  ...item,
                  isCustom: true as const,
                })
              )
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load switches:",
          error
        );

        if (mounted) {
          setCustomSwitches([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }


    loadSwitches();


    return () => {
      mounted = false;
    };
  }, []);


  // ==========================================================
  // COMBINE
  // ==========================================================

  const allSwitches: SwitchItem[] =
    useMemo(
      () => [
        ...switches,
        ...customSwitches,
      ],
      [customSwitches]
    );


  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredSwitches =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();


      return allSwitches.filter(
        (switchItem) => {
          const matchesSearch =
            !query ||
            switchItem.name
              .toLowerCase()
              .includes(query) ||
            switchItem.brand
              .toLowerCase()
              .includes(query) ||
            switchItem.type
              .toLowerCase()
              .includes(query) ||
            switchItem.sound
              .toLowerCase()
              .includes(query);


          const matchesFilter =
            activeFilter === "All" ||
            switchItem.type ===
              activeFilter;


          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      allSwitches,
      search,
      activeFilter,
    ]);


  // ==========================================================
  // RESET PAGE WHEN SEARCH/FILTER CHANGES
  // ==========================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    activeFilter,
  ]);


  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredSwitches.length /
          ITEMS_PER_PAGE
      )
    );


  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );


  const paginatedSwitches =
    useMemo(() => {
      const start =
        (safeCurrentPage - 1) *
        ITEMS_PER_PAGE;

      return filteredSwitches.slice(
        start,
        start + ITEMS_PER_PAGE
      );
    }, [
      filteredSwitches,
      safeCurrentPage,
    ]);


  // ==========================================================
  // OPEN SWITCH
  // ==========================================================

  const openSwitch = (
    name: string
  ) => {
    router.push(
      `/switches/${encodeURIComponent(
        name
      )}`
    );
  };


  // ==========================================================
  // IMAGE
  // ==========================================================

  const renderImage = (
    item: SwitchItem
  ) => {
    if (
      "image" in item &&
      item.image
    ) {
      return (
        <img
          src={item.image}
          alt={item.name}
          className={styles.customImage}
        />
      );
    }


    return (
      <div
        className={
          styles.switchVisual
        }
      >
        <div
          className={
            styles.switchTop
          }
        >
          <div
            className={
              styles.cross
            }
          >
            +
          </div>
        </div>

        <div
          className={
            styles.switchBottom
          }
        >
          <span />
          <span />
          <span />
        </div>
      </div>
    );
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className={styles.page}>

      <PageHead
        title="Switches"
        description="Explore mechanical switches, specifications and community sound tests."
      />


      {/* ADD SWITCH */}

      <div
        className={
          styles.addSwitchRow
        }
      >
        <button
          type="button"
          className={
            styles.addSwitchButton
          }
          onClick={() =>
            router.push(
              "/switches/add"
            )
          }
        >
          <Plus size={17} />
          Add Switch
        </button>
      </div>


      {/* SEARCH */}

      <div className={styles.search}>
        <Search size={17} />

        <input
          type="text"
          placeholder="Search switch..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />
      </div>


      {/* FILTERS */}

      <div className={styles.filters}>
        {[
          "All",
          "Linear",
          "Tactile",
          "Clicky",
          "Silent",
          "Low Profile",
        ].map((item) => (
          <button
            key={item}
            type="button"
            className={`${styles.filter} ${
              activeFilter === item
                ? styles.active
                : ""
            }`}
            onClick={() =>
              setActiveFilter(
                item
              )
            }
          >
            {item}
          </button>
        ))}
      </div>


      {/* RESULT */}

      <div className={styles.resultBar}>
        <span>
          {filteredSwitches.length}{" "}
          switch
          {filteredSwitches.length !== 1
            ? "es"
            : ""}{" "}
          found
        </span>

        {loading && (
          <span>
            Loading...
          </span>
        )}
      </div>


      {/* GRID */}

      {paginatedSwitches.length > 0 ? (
        <div className={styles.grid}>

          {paginatedSwitches.map(
            (switchItem) => (
              <article
                key={`${switchItem.name}-${"id" in switchItem ? switchItem.id : "built-in"}`}
                className={styles.card}
                role="button"
                tabIndex={0}
                onClick={() =>
                  openSwitch(
                    switchItem.name
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                      "Enter" ||
                    event.key ===
                      " "
                  ) {
                    event.preventDefault();

                    openSwitch(
                      switchItem.name
                    );
                  }
                }}
              >

                {/* IMAGE */}

                <div
                  className={
                    styles.switchImage
                  }
                >
                  {renderImage(
                    switchItem
                  )}
                </div>


                {/* TITLE */}

                <div
                  className={
                    styles.titleRow
                  }
                >
                  <div
                    className={
                      styles.titleInfo
                    }
                  >
                    <h3>
                      {
                        switchItem.name
                      }
                    </h3>

                    <p>
                      {
                        switchItem.brand
                      }
                    </p>
                  </div>


                  <div
                    className={
                      styles.rating
                    }
                  >
                    <Star
                      size={14}
                      fill="currentColor"
                    />

                    {
                      switchItem.rating
                    }
                  </div>
                </div>


                {/* BADGES */}

                <div
                  className={
                    styles.typeRow
                  }
                >
                  <span
                    className={
                      styles.typeBadge
                    }
                  >
                    {
                      switchItem.type
                    }
                  </span>

                  <span
                    className={
                      styles.soundBadge
                    }
                  >
                    {
                      switchItem.sound
                    }
                  </span>
                </div>


                {/* SPECS */}

                <div
                  className={
                    styles.specGrid
                  }
                >
                  <div
                    className={
                      styles.spec
                    }
                  >
                    <span>
                      Actuation
                    </span>

                    <strong>
                      {
                        switchItem.actuation
                      }
                    </strong>
                  </div>


                  <div
                    className={
                      styles.spec
                    }
                  >
                    <span>
                      Travel
                    </span>

                    <strong>
                      {
                        switchItem.travel
                      }
                    </strong>
                  </div>


                  <div
                    className={
                      styles.spec
                    }
                  >
                    <span>
                      Force
                    </span>

                    <strong>
                      {
                        switchItem.force
                      }
                    </strong>
                  </div>


                  <div
                    className={
                      styles.spec
                    }
                  >
                    <span>
                      Tests
                    </span>

                    <strong>
                      {
                        switchItem.tests
                      }
                    </strong>
                  </div>
                </div>


                {/* SOUND */}

                <button
                  type="button"
                  className={
                    styles.soundButton
                  }
                  onClick={(event) => {
                    event.stopPropagation();

                    openSwitch(
                      switchItem.name
                    );
                  }}
                >
                  <Volume2
                    size={15}
                  />

                  Sound tests
                </button>


                <div
                  className={
                    styles.view
                  }
                >
                  View switch →
                </div>

              </article>
            )
          )}

        </div>
      ) : (
        <div
          className={
            styles.empty
          }
        >
          <h3>
            No switches found
          </h3>

          <p>
            Try another search or
            filter.
          </p>
        </div>
      )}


      {/* PAGINATION */}

      {totalPages > 1 && (
        <div
          className={
            styles.pagination
          }
        >

          <button
            type="button"
            disabled={
              safeCurrentPage === 1
            }
            onClick={() =>
              setCurrentPage(
                (page) =>
                  Math.max(
                    1,
                    page - 1
                  )
              )
            }
          >
            <ChevronLeft
              size={16}
            />
          </button>


          {Array.from(
            {
              length: totalPages,
            },
            (_, index) =>
              index + 1
          ).map((page) => (
            <button
              key={page}
              type="button"
              className={
                page ===
                safeCurrentPage
                  ? styles.pageActive
                  : ""
              }
              onClick={() =>
                setCurrentPage(
                  page
                )
              }
            >
              {page}
            </button>
          ))}


          <button
            type="button"
            disabled={
              safeCurrentPage ===
              totalPages
            }
            onClick={() =>
              setCurrentPage(
                (page) =>
                  Math.min(
                    totalPages,
                    page + 1
                  )
              )
            }
          >
            <ChevronRight
              size={16}
            />
          </button>

        </div>
      )}

    </div>
  );
}