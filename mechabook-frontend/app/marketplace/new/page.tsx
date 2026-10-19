"use client";

import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  MapPin,
  Package,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  createListing,
  getCurrentUser,
} from "../../lib/api";

import type { User } from "../../lib/api";

import { useRouter } from "next/navigation";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import styles from "./Sell.module.css";


// ============================================================
// TYPES
// ============================================================

type SelectedImage = {
  file: File;
  preview: string;
};

type FormState = {
  title: string;
  description: string;
  price: string;
  condition: string;
  location: string;
  category: string;
};


// ============================================================
// CONSTANTS
// ============================================================

const MAX_IMAGES = 3;

const MAX_IMAGE_SIZE =
  50 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];


// ============================================================
// PAGE
// ============================================================

export default function SellPage() {
  const router = useRouter();

  // ----------------------------------------------------------
  // USER
  // ----------------------------------------------------------

  const [user, setUser] =
    useState<User | null>(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  // ----------------------------------------------------------
  // FORM
  // ----------------------------------------------------------

  const [form, setForm] =
    useState<FormState>({
      title: "",
      description: "",
      price: "",
      condition: "Like New",
      location: "",
      category: "Keyboard",
    });

  // ----------------------------------------------------------
  // IMAGES
  // ----------------------------------------------------------

  const [images, setImages] =
    useState<SelectedImage[]>([]);

  // ----------------------------------------------------------
  // STATES
  // ----------------------------------------------------------

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==========================================================
  // LOAD CURRENT USER
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const currentUser =
          await getCurrentUser();

        if (mounted) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error(
          "Failed to load current user:",
          err
        );

        if (mounted) {
          setError(
            "Your session has expired. Please log in again."
          );
        }
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);


  // ==========================================================
  // UPDATE FORM
  // ==========================================================

  function updateField(
    field: keyof FormState,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }


  // ==========================================================
  // IMAGE SELECT
  // ==========================================================

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files =
      event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    setError("");
    setSuccess("");

    const remainingSlots =
      MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      setError(
        `You can upload up to ${MAX_IMAGES} images.`
      );

      event.target.value = "";
      return;
    }

    const selectedFiles =
      Array.from(files).slice(
        0,
        remainingSlots
      );

    const newImages: SelectedImage[] =
      [];

    for (const file of selectedFiles) {
      if (
        !ALLOWED_IMAGE_TYPES.includes(
          file.type
        )
      ) {
        setError(
          `${file.name} is not a supported image.`
        );

        continue;
      }

      if (
        file.size >
        MAX_IMAGE_SIZE
      ) {
        setError(
          `${file.name} is larger than 50 MB.`
        );

        continue;
      }

      newImages.push({
        file,
        preview:
          URL.createObjectURL(file),
      });
    }

    if (newImages.length > 0) {
      setImages((previous) => [
        ...previous,
        ...newImages,
      ]);
    }

    event.target.value = "";
  }


  // ==========================================================
  // REMOVE IMAGE
  // ==========================================================

  function removeImage(
    index: number
  ) {
    setImages((previous) => {
      const image =
        previous[index];

      if (image?.preview) {
        URL.revokeObjectURL(
          image.preview
        );
      }

      return previous.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );
    });
  }


  // ==========================================================
  // MAKE COVER
  // ==========================================================

  function makeCover(
    index: number
  ) {
    if (index === 0) {
      return;
    }

    setImages((previous) => {
      const selected =
        previous[index];

      const remaining =
        previous.filter(
          (_, imageIndex) =>
            imageIndex !== index
        );

      return [
        selected,
        ...remaining,
      ];
    });
  }


  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validation = useMemo(() => {
    const title =
      form.title.trim();

    const description =
      form.description.trim();

    const price =
      form.price.trim();

    const location =
      form.location.trim();

    const numericPrice =
      Number(
        price.replace(/,/g, "")
      );

    return {
      title,
      description,
      price,
      location,
      numericPrice,

      validTitle:
        title.length >= 3,

      validDescription:
        description.length >= 5,

      validPrice:
        Number.isFinite(
          numericPrice
        ) &&
        numericPrice > 0,

      validLocation:
        location.length >= 2,
    };
  }, [form]);


  // ==========================================================
  // SUBMIT
  // ==========================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // --------------------------------------------------------
    // USER
    // --------------------------------------------------------

    if (!user) {
      setError(
        "Please log in before creating a listing."
      );

      return;
    }

    // --------------------------------------------------------
    // TITLE
    // --------------------------------------------------------

    if (!validation.validTitle) {
      setError(
        "Please enter a valid product title."
      );

      return;
    }

    // --------------------------------------------------------
    // DESCRIPTION
    // --------------------------------------------------------

    if (!validation.validDescription) {
      setError(
        "Please enter a short description."
      );

      return;
    }

    // --------------------------------------------------------
    // PRICE
    // --------------------------------------------------------

    if (!validation.validPrice) {
      setError(
        "Please enter a valid price."
      );

      return;
    }

    // --------------------------------------------------------
    // CONDITION
    // --------------------------------------------------------

    if (!form.condition) {
      setError(
        "Please select the product condition."
      );

      return;
    }

    // --------------------------------------------------------
    // LOCATION
    // --------------------------------------------------------

    if (!validation.validLocation) {
      setError(
        "Please enter your location."
      );

      return;
    }

    // --------------------------------------------------------
    // IMAGE
    // --------------------------------------------------------

    if (images.length === 0) {
      setError(
        "Please upload at least one product image."
      );

      return;
    }

    // --------------------------------------------------------
    // CREATE LISTING
    // --------------------------------------------------------

    try {
      setSaving(true);

      const createdListing =
        await createListing({
          title:
            validation.title,

          description:
            validation.description,

          price:
            validation.numericPrice.toString(),

          condition:
            form.condition,

          location:
            validation.location,

          category:
            form.category,

          // IMPORTANT:
          // First image becomes marketplace cover
          image:
            images[0]?.file,
        });

      if (!createdListing) {
        throw new Error(
          "The listing could not be created."
        );
      }

      setSuccess(
        "Your listing has been published successfully."
      );

      setTimeout(() => {
        router.push(
          "/marketplace"
        );

        router.refresh();
      }, 800);

    } catch (err) {
      console.error(
        "Create listing error:",
        err
      );

      if (err instanceof Error) {
        setError(
          err.message
        );
      } else {
        setError(
          "Failed to create listing."
        );
      }
    } finally {
      setSaving(false);
    }
  }


  // ==========================================================
  // CANCEL
  // ==========================================================

  function handleCancel() {
    if (saving) {
      return;
    }

    router.push(
      "/marketplace"
    );
  }


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loadingUser) {
    return (
      <div
        className={styles.page}
      >
        <div
          className={styles.loading}
        >
          Loading...
        </div>
      </div>
    );
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className={styles.page}
    >

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div
        className={styles.header}
      >
        <button
          type="button"
          className={styles.backButton}
          onClick={handleCancel}
          disabled={saving}
        >
          <ArrowLeft
            size={18}
          />

          <span>
            Marketplace
          </span>
        </button>

        <div
          className={styles.headerText}
        >
          <h1>
            Sell an Item
          </h1>

          <p>
            Create a marketplace listing
            for the MechaBook community.
          </p>
        </div>
      </div>


      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {error && (
        <div
          className={styles.error}
        >
          <X
            size={18}
          />

          <span>
            {error}
          </span>
        </div>
      )}


      {/* ================================================== */}
      {/* SUCCESS */}
      {/* ================================================== */}

      {success && (
        <div
          className={styles.success}
        >
          <CheckCircle2
            size={18}
          />

          <span>
            {success}
          </span>
        </div>
      )}


      {/* ================================================== */}
      {/* FORM */}
      {/* ================================================== */}

      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >

        {/* ================================================= */}
        {/* IMAGES */}
        {/* ================================================= */}

        <section
          className={styles.card}
        >
          <div
            className={styles.cardHeader}
          >
            <div>
              <h2>
                Product Images
              </h2>

              <p>
                Add up to 3 images.
                The first image will be
                your marketplace cover.
              </p>
            </div>

            <ImagePlus
              size={20}
            />
          </div>


          <div
            className={styles.imageGrid}
          >

            {images.map(
              (image, index) => (
                <div
                  className={
                    styles.imageItem
                  }
                  key={
                    `${image.file.name}-${index}`
                  }
                >
                  <img
                    src={
                      image.preview
                    }
                    alt={
                      `Product image ${index + 1}`
                    }
                    className={
                      styles.imagePreview
                    }
                  />

                  <div
                    className={
                      styles.imageOverlay
                    }
                  >
                    {index === 0 ? (
                      <span
                        className={
                          styles.coverBadge
                        }
                      >
                        Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={
                          styles.coverButton
                        }
                        onClick={() =>
                          makeCover(
                            index
                          )
                        }
                        disabled={
                          saving
                        }
                      >
                        Make cover
                      </button>
                    )}

                    <button
                      type="button"
                      className={
                        styles.removeImage
                      }
                      onClick={() =>
                        removeImage(
                          index
                        )
                      }
                      disabled={
                        saving
                      }
                    >
                      <Trash2
                        size={15}
                      />
                    </button>
                  </div>
                </div>
              )
            )}


            {/* ADD IMAGE */}

            {images.length <
              MAX_IMAGES && (
              <label
                className={
                  styles.uploadBox
                }
              >
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  multiple
                  onChange={
                    handleImageChange
                  }
                  disabled={
                    saving
                  }
                  hidden
                />

                <div
                  className={
                    styles.uploadIcon
                  }
                >
                  <Upload
                    size={21}
                  />
                </div>

                <strong>
                  Add photos
                </strong>

                <span>
                  JPG, PNG, WEBP or GIF
                </span>

                <small>
                  Maximum 50 MB each
                </small>
              </label>
            )}

          </div>


          {images.length > 0 && (
            <div
              className={
                styles.imageCount
              }
            >
              {images.length} /{" "}
              {MAX_IMAGES} images selected
            </div>
          )}
        </section>


        {/* ================================================= */}
        {/* ITEM DETAILS */}
        {/* ================================================= */}

        <section
          className={styles.card}
        >
          <div
            className={styles.cardHeader}
          >
            <div>
              <h2>
                Item Details
              </h2>

              <p>
                Tell buyers what you are
                selling.
              </p>
            </div>

            <Package
              size={20}
            />
          </div>


          {/* TITLE */}

          <div
            className={styles.field}
          >
            <label
              htmlFor="title"
            >
              Title
            </label>

            <input
              id="title"
              type="text"
              value={
                form.title
              }
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value
                )
              }
              placeholder="e.g. Neo65 Navy Mechanical Keyboard"
              maxLength={120}
              disabled={saving}
            />
          </div>


          {/* DESCRIPTION */}

          <div
            className={styles.field}
          >
            <label
              htmlFor="description"
            >
              Description
            </label>

            <textarea
              id="description"
              value={
                form.description
              }
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Describe your item..."
              rows={6}
              maxLength={2000}
              disabled={saving}
            />
          </div>


          {/* CATEGORY + CONDITION */}

          <div
            className={
              styles.twoColumn
            }
          >

            <div
              className={
                styles.field
              }
            >
              <label
                htmlFor="category"
              >
                Category
              </label>

              <select
                id="category"
                value={
                  form.category
                }
                onChange={(event) =>
                  updateField(
                    "category",
                    event.target.value
                  )
                }
                disabled={saving}
              >
                <option value="Keyboard">
                  Keyboard
                </option>

                <option value="Switches">
                  Switches
                </option>

                <option value="Keycaps">
                  Keycaps
                </option>

                <option value="Accessories">
                  Accessories
                </option>

                <option value="Parts">
                  Parts
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>


            <div
              className={
                styles.field
              }
            >
              <label
                htmlFor="condition"
              >
                Condition
              </label>

              <select
                id="condition"
                value={
                  form.condition
                }
                onChange={(event) =>
                  updateField(
                    "condition",
                    event.target.value
                  )
                }
                disabled={saving}
              >
                <option value="New">
                  New
                </option>

                <option value="Like New">
                  Like New
                </option>

                <option value="Used">
                  Used
                </option>

                <option value="Good">
                  Good
                </option>

                <option value="Fair">
                  Fair
                </option>
              </select>
            </div>

          </div>


          {/* PRICE */}

          <div
            className={styles.field}
          >
            <label
              htmlFor="price"
            >
              Price
            </label>

            <div
              className={
                styles.priceInput
              }
            >
              <span>
                ৳
              </span>

              <input
                id="price"
                type="number"
                min="0"
                step="1"
                value={
                  form.price
                }
                onChange={(event) =>
                  updateField(
                    "price",
                    event.target.value
                  )
                }
                placeholder="52000"
                disabled={saving}
              />
            </div>
          </div>


          {/* LOCATION */}

          <div
            className={styles.field}
          >
            <label
              htmlFor="location"
            >
              Location
            </label>

            <div
              className={
                styles.locationInput
              }
            >
              <MapPin
                size={18}
              />

              <input
                id="location"
                type="text"
                value={
                  form.location
                }
                onChange={(event) =>
                  updateField(
                    "location",
                    event.target.value
                  )
                }
                placeholder="Dhaka, Bangladesh"
                disabled={saving}
              />
            </div>
          </div>

        </section>


        {/* ================================================= */}
        {/* SELLER */}
        {/* ================================================= */}

        <section
          className={styles.card}
        >
          <div
            className={styles.cardHeader}
          >
            <div>
              <h2>
                Seller
              </h2>

              <p>
                This listing will be
                published under your
                MechaBook account.
              </p>
            </div>
          </div>


          <div
            className={styles.seller}
          >

            <div
              className={styles.avatar}
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
                <span>
                  {user?.name
                    ?.charAt(0)
                    .toUpperCase() ||
                    "U"}
                </span>
              )}
            </div>


            <div
              className={
                styles.sellerInfo
              }
            >
              <strong>
                {user?.name}
              </strong>

              <span>
                @{user?.handle}
              </span>
            </div>

          </div>
        </section>


        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}

        <div
          className={
            styles.actions
          }
        >

          <button
            type="button"
            className={
              styles.cancelButton
            }
            onClick={
              handleCancel
            }
            disabled={saving}
          >
            Cancel
          </button>


          <button
            type="submit"
            className={
              styles.submitButton
            }
            disabled={
              saving ||
              !user
            }
          >
            {saving ? (
              <>
                <span
                  className={
                    styles.spinner
                  }
                />

                Publishing...
              </>
            ) : (
              <>
                <Plus
                  size={18}
                />

                Publish Listing
              </>
            )}
          </button>

        </div>

      </form>
    </div>
  );
}