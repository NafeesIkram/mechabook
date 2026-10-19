"use client";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  Edit3,
  MapPin,
  MessageCircle,
  Package,
  Save,
  Trash2,
  X,
} from "lucide-react";

import {
  deleteListing,
  getCurrentUser,
  getListing,
  updateListing,
  updateListingStatus,
} from "../../lib/api";

import type {
  Listing,
  User,
} from "../../lib/api";

import { useParams, useRouter } from "next/navigation";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";

import styles from "./MarketplaceDetail.module.css";


export default function MarketplaceDetailPage() {

  const router = useRouter();

  const params = useParams();

  const listingId = Number(
    params.id
  );


  const [listing, setListing] =
    useState<Listing | null>(null);

  const [currentUser, setCurrentUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [newImage, setNewImage] =
    useState<File | undefined>();


  const [form, setForm] =
    useState({
      title: "",
      description: "",
      price: "",
      condition: "",
      location: "",
    });


  // ==========================================================
  // LOAD
  // ==========================================================

  useEffect(() => {

    if (!Number.isFinite(listingId)) {
      setError(
        "Invalid listing."
      );

      setLoading(false);

      return;
    }


    let mounted = true;


    async function load() {

      try {

        const [
          listingData,
          userData,
        ] = await Promise.all([
          getListing(listingId),
          getCurrentUser(),
        ]);


        if (!mounted) {
          return;
        }


        setListing(
          listingData
        );

        setCurrentUser(
          userData
        );


        setForm({
          title:
            listingData.title || "",

          description:
            listingData.description || "",

          price:
            listingData.price || "",

          condition:
            listingData.condition || "",

          location:
            listingData.location || "",
        });

      } catch (err) {

        console.error(err);

        if (mounted) {

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load listing."
          );

        }

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }
    }


    load();


    return () => {
      mounted = false;
    };

  }, [listingId]);


  // ==========================================================
  // OWNER
  // ==========================================================

  const isOwner =
    Boolean(
      listing &&
      currentUser &&
      listing.user_id === currentUser.id
    );


  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  function updateField(
    field:
      | "title"
      | "description"
      | "price"
      | "condition"
      | "location",
    value: string
  ) {

    setForm(
      previous => ({
        ...previous,
        [field]: value,
      })
    );

  }


  // ==========================================================
  // IMAGE
  // ==========================================================

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ].includes(file.type)
    ) {

      setError(
        "Please select a JPG, PNG, WEBP or GIF image."
      );

      return;
    }


    if (
      file.size >
      50 * 1024 * 1024
    ) {

      setError(
        "Image must be 50 MB or smaller."
      );

      return;
    }


    setError("");

    setNewImage(file);

  }


  // ==========================================================
  // SAVE EDIT
  // ==========================================================

  async function handleSave(
    event: FormEvent
  ) {

    event.preventDefault();

    if (!isOwner) {
      return;
    }


    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.price.trim() ||
      !form.condition.trim() ||
      !form.location.trim()
    ) {

      setError(
        "Please fill in all fields."
      );

      return;
    }


    try {

      setSaving(true);

      setError("");


      const updated =
        await updateListing(
          listingId,
          {
            title:
              form.title.trim(),

            description:
              form.description.trim(),

            price:
              form.price.trim(),

            condition:
              form.condition.trim(),

            location:
              form.location.trim(),

            image:
              newImage,
          }
        );


      setListing(updated);

      setNewImage(undefined);

      setEditing(false);

    } catch (err) {

      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update listing."
      );

    } finally {

      setSaving(false);

    }

  }


  // ==========================================================
  // STATUS
  // ==========================================================

  async function handleStatusChange(
    event: ChangeEvent<HTMLSelectElement>
  ) {

    if (!isOwner) {
      return;
    }


    const newStatus =
      event.target.value as
        | "active"
        | "pending"
        | "sold";


    try {

      setSaving(true);

      setError("");


      const updated =
        await updateListingStatus(
          listingId,
          newStatus
        );


      setListing(updated);

    } catch (err) {

      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update status."
      );

    } finally {

      setSaving(false);

    }

  }


  // ==========================================================
  // DELETE
  // ==========================================================

  async function handleDelete() {

    if (!isOwner) {
      return;
    }


    const confirmed =
      window.confirm(
        "Are you sure you want to delete this listing?"
      );


    if (!confirmed) {
      return;
    }


    try {

      setSaving(true);

      setError("");


      await deleteListing(
        listingId
      );


      router.push(
        "/marketplace"
      );

      router.refresh();

    } catch (err) {

      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete listing."
      );

      setSaving(false);

    }

  }


  // ==========================================================
  // MESSAGE SELLER
  // ==========================================================

  function handleMessageSeller() {

    if (!listing) {
      return;
    }


    router.push(
      `/messages?userId=${listing.user_id}`
    );

  }


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div
        className={styles.page}
      >
        <div
          className={styles.loading}
        >
          Loading listing...
        </div>
      </div>
    );

  }


  // ==========================================================
  // ERROR / NOT FOUND
  // ==========================================================

  if (!listing) {

    return (
      <div
        className={styles.page}
      >

        <button
          className={styles.backButton}
          onClick={() =>
            router.push(
              "/marketplace"
            )
          }
        >
          <ArrowLeft
            size={18}
          />

          Marketplace
        </button>


        <div
          className={styles.errorBox}
        >
          {error ||
            "Listing not found."}
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

      {/* HEADER */}

      <div
        className={styles.top}
      >

        <button
          className={styles.backButton}
          onClick={() =>
            router.push(
              "/marketplace"
            )
          }
        >

          <ArrowLeft
            size={18}
          />

          Marketplace

        </button>


        {isOwner && (

          <div
            className={styles.ownerLabel}
          >
            <Check
              size={16}
            />

            Your listing

          </div>

        )}

      </div>


      {/* ERROR */}

      {error && (

        <div
          className={styles.errorBox}
        >
          <X
            size={18}
          />

          {error}

        </div>

      )}


      <div
        className={styles.layout}
      >

        {/* ================================================= */}
        {/* IMAGE */}
        {/* ================================================= */}

        <section
          className={styles.imageCard}
        >

          {listing.image ? (

            <img
              src={listing.image}
              alt={listing.title}
              className={styles.mainImage}
            />

          ) : (

            <div
              className={styles.noImage}
            >
              <Package
                size={52}
              />

              <span>
                No image available
              </span>

            </div>

          )}

        </section>


        {/* ================================================= */}
        {/* DETAILS */}
        {/* ================================================= */}

        <section
          className={styles.details}
        >

          <div
            className={styles.category}
          >
            MARKETPLACE
          </div>


          {editing ? (

            <form
              onSubmit={handleSave}
              className={styles.editForm}
            >

              <input
                value={form.title}
                onChange={event =>
                  updateField(
                    "title",
                    event.target.value
                  )
                }
                className={styles.input}
                placeholder="Title"
              />


              <textarea
                value={form.description}
                onChange={event =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                className={styles.textarea}
                placeholder="Description"
              />


              <input
                value={form.price}
                onChange={event =>
                  updateField(
                    "price",
                    event.target.value
                  )
                }
                className={styles.input}
                placeholder="Price"
              />


              <select
                value={form.condition}
                onChange={event =>
                  updateField(
                    "condition",
                    event.target.value
                  )
                }
                className={styles.input}
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


              <input
                value={form.location}
                onChange={event =>
                  updateField(
                    "location",
                    event.target.value
                  )
                }
                className={styles.input}
                placeholder="Location"
              />


              <label
                className={styles.fileLabel}
              >

                Replace image

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={
                    handleImageChange
                  }
                />

              </label>


              {newImage && (

                <div
                  className={styles.selectedFile}
                >
                  New image:
                  {" "}
                  {newImage.name}
                </div>

              )}


              <div
                className={styles.editActions}
              >

                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={saving}
                >

                  <Save
                    size={17}
                  />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}

                </button>


                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setEditing(false);
                    setNewImage(undefined);

                    setForm({
                      title:
                        listing.title,

                      description:
                        listing.description || "",

                      price:
                        listing.price,

                      condition:
                        listing.condition,

                      location:
                        listing.location,
                    });
                  }}
                  disabled={saving}
                >

                  Cancel

                </button>

              </div>

            </form>

          ) : (

            <>

              <h1
                className={styles.title}
              >
                {listing.title}
              </h1>


              <div
                className={styles.price}
              >
                ৳
                {Number(
                  listing.price
                ).toLocaleString()}
              </div>


              <div
                className={styles.meta}
              >

                <span>
                  <MapPin
                    size={17}
                  />

                  {listing.location}
                </span>


                <span>
                  {listing.condition}
                </span>

              </div>


              <div
                className={styles.description}
              >

                <h2>
                  Description
                </h2>

                <p>
                  {listing.description ||
                    "No description provided."}
                </p>

              </div>

            </>

          )}


          {/* ================================================= */}
          {/* SELLER */}
          {/* ================================================= */}

          <div
            className={styles.sellerCard}
          >

            <div
              className={styles.sellerAvatar}
            >

              {isOwner
                ? currentUser?.name
                    ?.charAt(0)
                    .toUpperCase()
                : "S"}

            </div>


            <div
              className={styles.sellerInfo}
            >

              <span>
                SELLER
              </span>

              <strong>
                {isOwner
                  ? currentUser?.name
                  : `User #${listing.user_id}`}
              </strong>

            </div>

          </div>


          {/* ================================================= */}
          {/* OWNER ACTIONS */}
          {/* ================================================= */}

          {isOwner && !editing && (

            <div
              className={styles.ownerActions}
            >

              <button
                className={styles.editButton}
                onClick={() =>
                  setEditing(true)
                }
                disabled={saving}
              >

                <Edit3
                  size={17}
                />

                Edit Listing

              </button>


              <div
                className={styles.statusBox}
              >

                <label>
                  Status
                </label>


                <div
                  className={styles.statusSelect}
                >

                  <select
                    value={
                      listing.status ||
                      "active"
                    }
                    onChange={
                      handleStatusChange
                    }
                    disabled={saving}
                  >

                    <option value="active">
                      Active
                    </option>

                    <option value="pending">
                      Pending
                    </option>

                    <option value="sold">
                      Sold
                    </option>

                  </select>


                  <ChevronDown
                    size={16}
                  />

                </div>

              </div>


              <button
                className={styles.deleteButton}
                onClick={
                  handleDelete
                }
                disabled={saving}
              >

                <Trash2
                  size={17}
                />

                Delete Listing

              </button>

            </div>

          )}


          {/* ================================================= */}
          {/* OTHER USER */}
          {/* ================================================= */}

          {!isOwner && (

            <button
              className={styles.messageButton}
              onClick={
                handleMessageSeller
              }
            >

              <MessageCircle
                size={19}
              />

              Message Seller

            </button>

          )}

        </section>

      </div>

    </div>

  );
}