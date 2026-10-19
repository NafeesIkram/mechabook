"use client";

import {
  ArrowLeft,
  ExternalLink,
  Heart,
  MessageCircle,
  Plus,
  Star,
  Volume2,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  getSoundTests,
  getSwitchByName,
  getSwitchReviews,
  getUsers,
} from "../../lib/api";

import type {
  SoundTest as ApiSoundTest,
  Switch as ApiSwitch,
  SwitchReview,
  User,
} from "../../lib/api";

import {
  switches,
} from "../../data/mock";

import styles from "./SwitchDetails.module.css";


/* ============================================================
   TYPES
============================================================ */

type DisplaySoundTest = {
  id: number;

  userId?: number;

  user: string;

  avatar: string;

  title: string;

  keyboard: string;

  plate: string;

  lubed: string;

  keycaps: string;

  microphone: string;

  description: string;

  videoUrl: string;

  audioUrl?: string;
};


type Review = {
  id: number;

  user: string;

  avatar: string;

  rating: number;

  comment: string;
};


type SwitchItem =
  | (typeof switches)[number]
  | ApiSwitch;


/* ============================================================
   DEFAULT SOUND TESTS
============================================================ */

const defaultSoundTests: DisplaySoundTest[] = [
  {
    id: 1,

    user: "@alextan",

    avatar: "AT",

    title: "Deep Thock Test",

    keyboard: "Neo65",

    plate: "FR4",

    lubed: "Yes",

    keycaps: "GMK Keycaps",

    microphone: "FIFINE K669B",

    description:
      "Deep and smooth switch sound on a Neo65.",

    videoUrl:
      "https://www.youtube.com/",
  },

  {
    id: 2,

    user: "@jamesmk",

    avatar: "JM",

    title: "PC Plate Sound Test",

    keyboard: "Keychron Q1",

    plate: "PC",

    lubed: "Factory lube",

    keycaps: "Cherry Profile",

    microphone: "Blue Yeti",

    description:
      "Softer and slightly muted sound.",

    videoUrl: "",
  },

  {
    id: 3,

    user: "@rkeyboards",

    avatar: "RK",

    title: "Aluminium Plate Test",

    keyboard: "Zoom75",

    plate: "Aluminium",

    lubed: "No",

    keycaps: "PBT Keycaps",

    microphone: "Rode NT-USB",

    description:
      "Crisp sound with a harder plate.",

    videoUrl:
      "https://www.youtube.com/",
  },
];


/* ============================================================
   DEFAULT REVIEWS
============================================================ */

const defaultReviews: Review[] = [
  {
    id: 1,

    user: "@alextan",

    avatar: "AT",

    rating: 5,

    comment:
      "Very smooth switch with a deep sound. Great for a thocky build.",
  },

  {
    id: 2,

    user: "@jamesmk",

    avatar: "JM",

    rating: 4.5,

    comment:
      "Feels excellent after tuning and works really well with a softer plate.",
  },
];


/* ============================================================
   MAP API SOUND TEST
============================================================ */

function mapApiSoundTest(
  item: ApiSoundTest,
  users: User[]
): DisplaySoundTest {
  const user = users.find(
    (entry) =>
      entry.id === item.user_id
  );


  return {
    id: item.id,

    userId: item.user_id,

    user: user?.handle
      ? `@${user.handle.replace(/^@/, "")}`
      : "@community",

    avatar: user?.name
      ? user.name
          .slice(0, 2)
          .toUpperCase()
      : "MB",

    title:
      item.title ||
      "Community Sound Test",

    keyboard:
      item.keyboard ||
      "Unknown Board",

    plate:
      item.plate ||
      "Not specified",

    lubed:
      item.lubed ||
      "Not specified",

    keycaps:
      item.keycaps ||
      "Not specified",

    microphone:
      item.microphone ||
      "Not specified",

    description:
      item.description ||
      "",

    videoUrl:
      item.video_url ||
      "",

    audioUrl:
      item.audio_url ||
      undefined,
  };
}


/* ============================================================
   PAGE
============================================================ */

export default function SwitchDetailsPage() {
  const router = useRouter();

  const params = useParams();


  /* ==========================================================
     SWITCH NAME
  ========================================================== */

  const switchName =
    decodeURIComponent(
      String(params.name)
    );


  /* ==========================================================
     API SWITCH
  ========================================================== */

  const [
    apiSwitch,
    setApiSwitch,
  ] = useState<ApiSwitch | null>(
    null
  );


  /* ==========================================================
     MOCK SWITCH
  ========================================================== */

  const mockSwitch = useMemo(
    () =>
      switches.find(
        (item) =>
          item.name ===
          switchName
      ),
    [switchName]
  );


  /* ==========================================================
     CURRENT SWITCH
  ========================================================== */

  const switchItem:
    SwitchItem | undefined =
    apiSwitch || mockSwitch;


  const isCustom =
    Boolean(apiSwitch);


  /* ==========================================================
     LOAD CUSTOM SWITCH
  ========================================================== */

  useEffect(() => {
    let mounted = true;


    async function loadSwitch() {
      try {
        const result =
          await getSwitchByName(
            switchName
          );


        if (
          mounted &&
          result
        ) {
          setApiSwitch(
            result
          );
        }
      } catch {
        /*
         * If the switch is not
         * in the backend, it can
         * still be a built-in
         * mock switch.
         */
      }
    }


    loadSwitch();


    return () => {
      mounted = false;
    };
  }, [
    switchName,
  ]);


  /* ==========================================================
     SOUND PROFILE
  ========================================================== */

  const soundProfile =
    useMemo(() => {
      /*
       * CUSTOM SWITCH
       *
       * Only show the Sound Profile
       * if at least one value exists.
       */

      if (
        isCustom &&
        apiSwitch
      ) {
        const values = {
          deep: apiSwitch.deep,

          thocky:
            apiSwitch.thocky,

          clacky:
            apiSwitch.clacky,

          sharp:
            apiSwitch.sharp,
        };


        const hasAny =
          Object.values(
            values
          ).some(
            (value) =>
              value !== null &&
              value !== undefined
          );


        if (!hasAny) {
          return null;
        }


        return values;
      }


      /*
       * BUILT-IN SWITCH
       *
       * Keep existing default
       * Sound Profile.
       */

      if (!isCustom) {
        return {
          deep: 78,

          thocky: 82,

          clacky: 32,

          sharp: 25,
        };
      }


      return null;
    }, [
      isCustom,
      apiSwitch,
    ]);


  /* ==========================================================
     SOUND TESTS
  ========================================================== */

  const [
    soundTests,
    setSoundTests,
  ] = useState<
    DisplaySoundTest[]
  >([]);


  const [
    loadingSoundTests,
    setLoadingSoundTests,
  ] = useState(true);


  const [
    soundTestError,
    setSoundTestError,
  ] = useState("");


  useEffect(() => {
    let mounted = true;


    async function loadTests() {
      setLoadingSoundTests(
        true
      );

      setSoundTestError("");


      let users: User[] = [];


      /*
       * Load users separately.
       */

      try {
        const result =
          await getUsers();


        if (
          Array.isArray(result)
        ) {
          users = result;
        }
      } catch (error) {
        console.error(
          "Could not load users:",
          error
        );
      }


      /*
       * Load sound tests separately.
       *
       * This prevents a users API
       * error from breaking the
       * entire Sound Tests section.
       */

      try {
        const result =
          await getSoundTests(
            switchName
          );


        if (!mounted) {
          return;
        }


        const mapped =
          Array.isArray(result)
            ? result.map(
                (item) =>
                  mapApiSoundTest(
                    item,
                    users
                  )
              )
            : [];


        if (
          mapped.length > 0
        ) {
          setSoundTests(
            mapped
          );
        } else {
          setSoundTests(
            defaultSoundTests
          );
        }

      } catch (error) {
        console.error(
          "Could not load sound tests:",
          error
        );


        if (!mounted) {
          return;
        }


        setSoundTestError(
          "Could not load community sound tests."
        );


        /*
         * Keep demo sound tests
         * instead of showing a
         * broken page.
         */

        setSoundTests(
          defaultSoundTests
        );
      } finally {
        if (mounted) {
          setLoadingSoundTests(
            false
          );
        }
      }
    }


    loadTests();


    return () => {
      mounted = false;
    };
  }, [
    switchName,
  ]);


  /* ==========================================================
     REVIEWS
  ========================================================== */

  const [
    reviews,
    setReviews,
  ] = useState<Review[]>(
    defaultReviews
  );


  const [
    selectedRating,
    setSelectedRating,
  ] = useState(0);


  const [
    reviewText,
    setReviewText,
  ] = useState("");


  const [
    reviewHover,
    setReviewHover,
  ] = useState(0);


  const [
    reviewError,
    setReviewError,
  ] = useState("");


  const [
    reviewSubmitted,
    setReviewSubmitted,
  ] = useState(false);


  /* ==========================================================
     LOAD REVIEWS
  ========================================================== */

  useEffect(() => {
    let mounted = true;


    async function loadReviews() {
      try {
        const result =
          await getSwitchReviews(
            switchName
          );


        if (
          !mounted ||
          !Array.isArray(result)
        ) {
          return;
        }


        const mapped =
          result.map(
            (
              item: SwitchReview
            ) => ({
              id: item.id,

              user:
                item.user_handle
                  ? `@${item.user_handle.replace(/^@/, "")}`
                  : item.user_name,

              avatar:
                item.user_avatar ||
                item.user_name
                  .slice(0, 2)
                  .toUpperCase(),

              rating:
                item.rating,

              comment:
                item.comment,
            })
          );


        if (
          mapped.length > 0
        ) {
          setReviews(
            mapped
          );
        }

      } catch {
        /*
         * Keep default reviews
         * if API is unavailable.
         */
      }
    }


    loadReviews();


    return () => {
      mounted = false;
    };
  }, [
    switchName,
  ]);


  /* ==========================================================
     REVIEW AVERAGE
  ========================================================== */

  const reviewAverage =
    useMemo(() => {
      if (
        reviews.length === 0
      ) {
        return (
          switchItem?.rating ||
          0
        );
      }


      const total =
        reviews.reduce(
          (
            sum,
            review
          ) =>
            sum +
            review.rating,
          0
        );


      return Math.round(
        (total /
          reviews.length) *
          10
      ) / 10;
    }, [
      reviews,
      switchItem,
    ]);


  /* ==========================================================
     ADD SOUND TEST
  ========================================================== */

  const addSoundTest = () => {
    if (!switchItem) {
      return;
    }


    router.push(
      `/switches/${encodeURIComponent(
        switchItem.name
      )}/sound-test`
    );
  };


  /* ==========================================================
     SUBMIT REVIEW
  ========================================================== */

  const submitReview = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();


    setReviewError("");

    setReviewSubmitted(
      false
    );


    if (
      selectedRating < 1
    ) {
      setReviewError(
        "Please select a star rating."
      );

      return;
    }


    if (
      !reviewText.trim()
    ) {
      setReviewError(
        "Please write a comment."
      );

      return;
    }


    const newReview: Review = {
      id: Date.now(),

      user: "@you",

      avatar: "YO",

      rating:
        selectedRating,

      comment:
        reviewText.trim(),
    };


    setReviews(
      (current) => [
        newReview,
        ...current,
      ]
    );


    setSelectedRating(0);

    setReviewText("");

    setReviewHover(0);

    setReviewSubmitted(
      true
    );
  };


  /* ==========================================================
     NOT FOUND
  ========================================================== */

  if (!switchItem) {
    return (
      <div
        className={
          styles.notFound
        }
      >
        <h1>
          Switch not found
        </h1>


        <button
          type="button"
          className={
            styles.primaryButton
          }
          onClick={() =>
            router.push(
              "/switches"
            )
          }
        >
          <ArrowLeft
            size={16}
          />

          Back to Switches
        </button>
      </div>
    );
  }


  /* ==========================================================
     SAFE DESCRIPTION
     
     This fixes the TypeScript
     error caused by mock switch
     and API switch having
     different fields.
  ========================================================== */

  const switchDescription =
    "description" in switchItem
      ? (
          switchItem as {
            description?:
              | string
              | null;
          }
        ).description
      : undefined;


  /* ==========================================================
     SAFE IMAGE
  ========================================================== */

  const switchImage =
    "image" in switchItem
      ? (
          switchItem as {
            image?:
              | string
              | null;
          }
        ).image
      : undefined;


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      className={
        styles.page
      }
    >

      {/* ======================================================
          BACK
      ====================================================== */}

      <button
        type="button"
        className={
          styles.backButton
        }
        onClick={() =>
          router.push(
            "/switches"
          )
        }
      >
        <ArrowLeft
          size={17}
        />

        Back to Switches
      </button>


      {/* ======================================================
          HERO
      ====================================================== */}

      <section
        className={
          styles.hero
        }
      >

        {/* IMAGE */}

        <div
          className={
            styles.heroImage
          }
        >

          {switchImage ? (
            <img
              src={
                switchImage
              }
              alt={
                switchItem.name
              }
              className={
                styles.heroCustomImage
              }
            />
          ) : (
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
                />
              </div>


              <div
                className={
                  styles.switchBottom
                }
              />
            </div>
          )}

        </div>


        {/* CONTENT */}

        <div
          className={
            styles.heroContent
          }
        >

          <p
            className={
              styles.brand
            }
          >
            {
              switchItem.brand
            }
          </p>


          <h1>
            {
              switchItem.name
            }
          </h1>


          <div
            className={
              styles.badges
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


          {/* RATING */}

          <div
            className={
              styles.rating
            }
          >
            <Star
              size={17}
              fill="currentColor"
            />

            <strong>
              {
                reviewAverage
              }
            </strong>

            <span>
              Community rating
            </span>
          </div>


          {/* DESCRIPTION */}

          <p
            className={
              styles.description
            }
          >
            {switchDescription ||
              "Explore specifications, sound profile, community sound tests and reviews for this mechanical switch."}
          </p>


          {/* ACTIONS */}

          <div
            className={
              styles.actions
            }
          >

            <button
              type="button"
              className={
                styles.primaryButton
              }
            >
              <Heart
                size={16}
              />

              Save
            </button>


            <button
              type="button"
              className={
                styles.secondaryButton
              }
            >
              <MessageCircle
                size={16}
              />

              Discuss
            </button>

          </div>

        </div>

      </section>


      {/* ======================================================
          SPECIFICATIONS
      ====================================================== */}

      <section
        className={
          styles.section
        }
      >

        <div
          className={
            styles.sectionHeader
          }
        >
          <div>

            <h2>
              Specifications
            </h2>

            <p>
              Switch information
            </p>

          </div>
        </div>


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
              Brand
            </span>

            <strong>
              {
                switchItem.brand
              }
            </strong>
          </div>


          <div
            className={
              styles.spec
            }
          >
            <span>
              Type
            </span>

            <strong>
              {
                switchItem.type
              }
            </strong>
          </div>


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
              Bottom-out Force
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
              Sound
            </span>

            <strong>
              {
                switchItem.sound
              }
            </strong>
          </div>

        </div>

      </section>


      {/* ======================================================
          SOUND PROFILE
          
          IMPORTANT:
          This section appears ONLY
          when soundProfile is not null.
      ====================================================== */}

      {soundProfile && (
        <section
          className={
            styles.section
          }
        >

          <div
            className={
              styles.sectionHeader
            }
          >
            <div>

              <h2>
                Sound Profile
              </h2>

              <p>
                Community description
                of the switch sound
              </p>

            </div>
          </div>


          <div
            className={
              styles.soundProfile
            }
          >

            {/* DEEP */}

            {soundProfile.deep !==
              null &&
              soundProfile.deep !==
                undefined && (
                <div
                  className={
                    styles.profileRow
                  }
                >

                  <span>
                    Deep
                  </span>


                  <div
                    className={
                      styles.profileBar
                    }
                  >
                    <div
                      className={
                        styles.profileFill
                      }
                      style={{
                        width: `${soundProfile.deep}%`,
                      }}
                    />
                  </div>


                  <strong>
                    {
                      soundProfile.deep
                    }
                    %
                  </strong>

                </div>
              )}


            {/* THOCKY */}

            {soundProfile.thocky !==
              null &&
              soundProfile.thocky !==
                undefined && (
                <div
                  className={
                    styles.profileRow
                  }
                >

                  <span>
                    Thocky
                  </span>


                  <div
                    className={
                      styles.profileBar
                    }
                  >
                    <div
                      className={
                        styles.profileFill
                      }
                      style={{
                        width: `${soundProfile.thocky}%`,
                      }}
                    />
                  </div>


                  <strong>
                    {
                      soundProfile.thocky
                    }
                    %
                  </strong>

                </div>
              )}


            {/* CLACKY */}

            {soundProfile.clacky !==
              null &&
              soundProfile.clacky !==
                undefined && (
                <div
                  className={
                    styles.profileRow
                  }
                >

                  <span>
                    Clacky
                  </span>


                  <div
                    className={
                      styles.profileBar
                    }
                  >
                    <div
                      className={
                        styles.profileFill
                      }
                      style={{
                        width: `${soundProfile.clacky}%`,
                      }}
                    />
                  </div>


                  <strong>
                    {
                      soundProfile.clacky
                    }
                    %
                  </strong>

                </div>
              )}


            {/* SHARP */}

            {soundProfile.sharp !==
              null &&
              soundProfile.sharp !==
                undefined && (
                <div
                  className={
                    styles.profileRow
                  }
                >

                  <span>
                    Sharp
                  </span>


                  <div
                    className={
                      styles.profileBar
                    }
                  >
                    <div
                      className={
                        styles.profileFill
                      }
                      style={{
                        width: `${soundProfile.sharp}%`,
                      }}
                    />
                  </div>


                  <strong>
                    {
                      soundProfile.sharp
                    }
                    %
                  </strong>

                </div>
              )}

          </div>

        </section>
      )}


      {/* ======================================================
          SOUND TESTS
      ====================================================== */}

      <section
        className={
          styles.section
        }
      >

        <div
          className={
            styles.sectionHeader
          }
        >

          <div>

            <h2>
              Sound Tests
            </h2>

            <p>
              {loadingSoundTests
                ? "Loading community sound tests..."
                : `${soundTests.length} community sound tests`}
            </p>


            {soundTestError && (
              <small
                className={
                  styles.errorText
                }
              >
                {
                  soundTestError
                }
              </small>
            )}

          </div>


          <button
            type="button"
            className={
              styles.secondaryButton
            }
            onClick={
              addSoundTest
            }
          >
            <Plus
              size={15}
            />

            Add Sound Test
          </button>

        </div>


        <div
          className={
            styles.soundList
          }
        >

          {soundTests.map(
            (test) => (
              <div
                key={
                  test.id
                }
                className={
                  styles.soundItem
                }
              >

                {/* AVATAR */}

                <div
                  className={
                    styles.avatar
                  }
                >
                  {
                    test.avatar
                  }
                </div>


                {/* INFO */}

                <div
                  className={
                    styles.soundInfo
                  }
                >

                  <strong>
                    {
                      test.user
                    }
                  </strong>


                  <span>
                    {
                      test.title
                    }
                  </span>


                  <small>
                    Board:{" "}
                    {
                      test.keyboard
                    }
                  </small>


                  <small>
                    {
                      test.plate
                    }{" "}
                    ·{" "}
                    {
                      test.lubed
                    }{" "}
                    ·{" "}
                    {
                      test.keycaps
                    }
                  </small>


                  <small>
                    🎙{" "}
                    {
                      test.microphone
                    }
                  </small>

                </div>


                {/* ACTIONS */}

                <div
                  className={
                    styles.soundActions
                  }
                >

                  {test.audioUrl ? (
                    <audio
                      controls
                      src={
                        test.audioUrl
                      }
                      className={
                        styles.audioPlayer
                      }
                    />
                  ) : (
                    <button
                      type="button"
                      className={
                        styles.playButton
                      }
                      disabled
                    >
                      <Volume2
                        size={15}
                      />

                      Play
                    </button>
                  )}


                  {test.videoUrl && (
                    <a
                      href={
                        test.videoUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        styles.videoButton
                      }
                    >
                      <ExternalLink
                        size={14}
                      />

                      Review Video
                    </a>
                  )}

                </div>

              </div>
            )
          )}

        </div>

      </section>


      {/* ======================================================
          COMMUNITY REVIEWS
      ====================================================== */}

      <section
        className={
          styles.section
        }
      >

        <div
          className={
            styles.sectionHeader
          }
        >

          <div>

            <h2>
              Community Reviews
            </h2>

            <p>
              What the community says
            </p>

          </div>

        </div>


        <div
          className={
            styles.reviews
          }
        >

          {reviews.map(
            (review) => (
              <div
                key={
                  review.id
                }
                className={
                  styles.review
                }
              >

                <div
                  className={
                    styles.reviewAvatar
                  }
                >
                  {
                    review.avatar
                  }
                </div>


                <div>

                  <strong>
                    {
                      review.user
                    }
                  </strong>


                  <div
                    className={
                      styles.reviewRating
                    }
                  >

                    <Star
                      size={13}
                      fill="currentColor"
                    />

                    {
                      review.rating
                    }

                  </div>


                  <p>
                    {
                      review.comment
                    }
                  </p>

                </div>

              </div>
            )
          )}

        </div>

      </section>


      {/* ======================================================
          WRITE REVIEW
      ====================================================== */}

      <section
        className={
          styles.section
        }
      >

        <div
          className={
            styles.sectionHeader
          }
        >

          <div>

            <h2>
              Write a Review
            </h2>

            <p>
              Share your experience
              with this switch.
            </p>

          </div>

        </div>


        <form
          className={
            styles.reviewForm
          }
          onSubmit={
            submitReview
          }
        >

          {/* STARS */}

          <div
            className={
              styles.starPicker
            }
          >

            {[1, 2, 3, 4, 5].map(
              (star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() =>
                    setReviewHover(
                      star
                    )
                  }
                  onMouseLeave={() =>
                    setReviewHover(
                      0
                    )
                  }
                  onClick={() =>
                    setSelectedRating(
                      star
                    )
                  }
                  className={
                    styles.starButton
                  }
                >

                  <Star
                    size={20}
                    fill={
                      star <=
                      (
                        reviewHover ||
                        selectedRating
                      )
                        ? "currentColor"
                        : "none"
                    }
                  />

                </button>
              )
            )}

          </div>


          {/* COMMENT */}

          <textarea
            value={
              reviewText
            }
            onChange={(event) =>
              setReviewText(
                event.target.value
              )
            }
            placeholder="Write your review..."
            rows={4}
          />


          {/* ERROR */}

          {reviewError && (
            <div
              className={
                styles.errorText
              }
            >
              {
                reviewError
              }
            </div>
          )}


          {/* SUCCESS */}

          {reviewSubmitted && (
            <div
              className={
                styles.successText
              }
            >
              Review added.
            </div>
          )}


          <button
            type="submit"
            className={
              styles.primaryButton
            }
          >
            Submit Review
          </button>

        </form>

      </section>


      {/* ======================================================
          CONTRIBUTION
      ====================================================== */}

      <section
        className={
          styles.contribution
        }
      >

        <div>

          <h2>
            Help improve this page
          </h2>

          <p>
            Have a sound test,
            review or better
            information?
          </p>

        </div>


        <button
          type="button"
          className={
            styles.primaryButton
          }
          onClick={
            addSoundTest
          }
        >
          <Plus
            size={16}
          />

          Add Sound Test
        </button>

      </section>

    </div>
  );
}