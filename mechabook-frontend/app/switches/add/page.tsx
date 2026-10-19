"use client";

import {
  ArrowLeft,
  Check,
  ImagePlus,
  Plus,
  Upload,
} from "lucide-react";

import {
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  createSwitch,
} from "../../lib/api";

import styles from "./AddSwitch.module.css";


export default function AddSwitchPage() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);


  // ==========================================================
  // BASIC STATE
  // ==========================================================

  const [name, setName] =
    useState("");

  const [brand, setBrand] =
    useState("");

  const [type, setType] =
    useState("Linear");

  const [sound, setSound] =
    useState("");

  const [actuation, setActuation] =
    useState("");

  const [force, setForce] =
    useState("");

  const [travel, setTravel] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [image, setImage] =
    useState("");


  // ==========================================================
  // OPTIONAL SOUND PROFILE
  // ==========================================================

  const [deep, setDeep] =
    useState("");

  const [thocky, setThocky] =
    useState("");

  const [clacky, setClacky] =
    useState("");

  const [sharp, setSharp] =
    useState("");


  // ==========================================================
  // UI STATE
  // ==========================================================

  const [error, setError] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const [saving, setSaving] =
    useState(false);


  // ==========================================================
  // IMAGE
  // ==========================================================

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowed.includes(file.type)) {
      setError(
        "Please upload JPG, PNG, WEBP or GIF image."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image cannot exceed 5 MB."
      );
      return;
    }

    setError("");

    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        setImage(reader.result);
      }
    };

    reader.readAsDataURL(file);
  };


  // ==========================================================
  // OPTIONAL PROFILE PARSER
  // ==========================================================

  const optionalProfile = (
    value: string
  ) => {
    if (!value.trim()) {
      return undefined;
    }

    const number =
      Number(value);

    if (
      !Number.isInteger(number) ||
      number < 0 ||
      number > 100
    ) {
      return null;
    }

    return number;
  };


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError(
        "Switch name is required."
      );
      return;
    }

    if (!brand.trim()) {
      setError(
        "Brand is required."
      );
      return;
    }

    if (!sound.trim()) {
      setError(
        "Sound is required."
      );
      return;
    }

    if (!actuation.trim()) {
      setError(
        "Actuation information is required."
      );
      return;
    }

    if (!force.trim()) {
      setError(
        "Bottom-out force is required."
      );
      return;
    }

    if (!travel.trim()) {
      setError(
        "Travel information is required."
      );
      return;
    }


    const profile = {
      deep: optionalProfile(deep),
      thocky: optionalProfile(thocky),
      clacky: optionalProfile(clacky),
      sharp: optionalProfile(sharp),
    };


    if (
      Object.values(profile).some(
        (value) => value === null
      )
    ) {
      setError(
        "Sound Profile values must be whole numbers from 0 to 100."
      );

      return;
    }


    setSaving(true);


    try {
      await createSwitch({
        name: name.trim(),
        brand: brand.trim(),
        type,
        sound: sound.trim(),
        actuation: actuation.trim(),
        force: force.trim(),
        travel: travel.trim(),

        description:
          description.trim() ||
          undefined,

        image:
          image ||
          undefined,

        deep:
          profile.deep ??
          undefined,

        thocky:
          profile.thocky ??
          undefined,

        clacky:
          profile.clacky ??
          undefined,

        sharp:
          profile.sharp ??
          undefined,
      });

      setSubmitted(true);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save the switch."
      );

    } finally {
      setSaving(false);
    }
  };


  // ==========================================================
  // SUCCESS
  // ==========================================================

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>

          <div className={styles.successIcon}>
            <Check size={28} />
          </div>

          <h1>
            Switch added successfully
          </h1>

          <p>
            <strong>
              {name}
            </strong>{" "}
            has been added to the
            Switches database.
          </p>

          <div className={styles.successActions}>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() =>
                router.push("/switches")
              }
            >
              View Switches
            </button>


            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() =>
                window.location.reload()
              }
            >
              <Plus size={16} />
              Add Another
            </button>

          </div>

        </div>
      </div>
    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className={styles.page}>

      <button
        type="button"
        className={styles.backButton}
        onClick={() =>
          router.push("/switches")
        }
      >
        <ArrowLeft size={17} />
        Back to Switches
      </button>


      <div className={styles.header}>

        <div className={styles.headerIcon}>
          <Plus size={24} />
        </div>

        <div>

          <p className={styles.eyebrow}>
            Community contribution
          </p>

          <h1>
            Add Switch
          </h1>

          <p>
            Add a mechanical switch
            with specifications,
            image and optional
            sound profile.
          </p>

        </div>

      </div>


      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >

        {/* ================================================= */}
        {/* IMAGE */}
        {/* ================================================= */}

        <section className={styles.section}>

          <div className={styles.sectionHeader}>
            <div>

              <h2>
                Switch Image
              </h2>

              <p>
                Add a clear product
                photo of the switch.
              </p>

            </div>
          </div>


          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            className={styles.hiddenInput}
          />


          {image ? (

            <div className={styles.imagePreview}>

              <img
                src={image}
                alt="Switch preview"
              />

              <div className={styles.imageActions}>

                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  <Upload size={15} />
                  Change Image
                </button>


                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() =>
                    setImage("")
                  }
                >
                  Remove
                </button>

              </div>

            </div>

          ) : (

            <button
              type="button"
              className={styles.uploadBox}
              onClick={() =>
                fileInputRef.current?.click()
              }
            >

              <div className={styles.uploadIcon}>
                <ImagePlus size={25} />
              </div>

              <strong>
                Upload switch image
              </strong>

              <span>
                JPG, PNG, WEBP or GIF
                · Maximum 5 MB
              </span>

            </button>

          )}

        </section>


        {/* ================================================= */}
        {/* BASIC */}
        {/* ================================================= */}

        <section className={styles.section}>

          <div className={styles.sectionHeader}>
            <div>

              <h2>
                Basic Information
              </h2>

              <p>
                Information that appears
                on the switch card.
              </p>

            </div>
          </div>


          <div className={styles.field}>

            <label htmlFor="name">
              Switch Name
              <span>*</span>
            </label>

            <input
              id="name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="e.g. Gateron Oil King"
            />

          </div>


          <div className={styles.grid}>

            <div className={styles.field}>

              <label htmlFor="brand">
                Brand
                <span>*</span>
              </label>

              <input
                id="brand"
                value={brand}
                onChange={(event) =>
                  setBrand(
                    event.target.value
                  )
                }
                placeholder="e.g. Gateron"
              />

            </div>


            <div className={styles.field}>

              <label htmlFor="type">
                Type
                <span>*</span>
              </label>

              <select
                id="type"
                value={type}
                onChange={(event) =>
                  setType(
                    event.target.value
                  )
                }
              >
                <option>
                  Linear
                </option>

                <option>
                  Tactile
                </option>

                <option>
                  Clicky
                </option>

                <option>
                  Silent
                </option>

                <option>
                  Low Profile
                </option>
              </select>

            </div>

          </div>


          <div className={styles.field}>

            <label htmlFor="sound">
              Sound
              <span>*</span>
            </label>

            <input
              id="sound"
              value={sound}
              onChange={(event) =>
                setSound(
                  event.target.value
                )
              }
              placeholder="e.g. Deep / Thocky"
            />

          </div>

        </section>


        {/* ================================================= */}
        {/* SPECIFICATIONS */}
        {/* ================================================= */}

        <section className={styles.section}>

          <div className={styles.sectionHeader}>
            <div>

              <h2>
                Specifications
              </h2>

              <p>
                Technical information
                about the switch.
              </p>

            </div>
          </div>


          <div className={styles.grid}>

            <div className={styles.field}>

              <label htmlFor="actuation">
                Actuation
                <span>*</span>
              </label>

              <input
                id="actuation"
                value={actuation}
                onChange={(event) =>
                  setActuation(
                    event.target.value
                  )
                }
                placeholder="e.g. 55g"
              />

            </div>


            <div className={styles.field}>

              <label htmlFor="force">
                Bottom-out Force
                <span>*</span>
              </label>

              <input
                id="force"
                value={force}
                onChange={(event) =>
                  setForce(
                    event.target.value
                  )
                }
                placeholder="e.g. 80g"
              />

            </div>


            <div className={styles.field}>

              <label htmlFor="travel">
                Travel
                <span>*</span>
              </label>

              <input
                id="travel"
                value={travel}
                onChange={(event) =>
                  setTravel(
                    event.target.value
                  )
                }
                placeholder="e.g. 4.0mm"
              />

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* SOUND PROFILE */}
        {/* ================================================= */}

        <section className={styles.section}>

          <div className={styles.sectionHeader}>
            <div>

              <h2>
                Sound Profile
                <span
                  style={{
                    color: "#777f8c",
                    fontSize: 12,
                    marginLeft: 6,
                  }}
                >
                  (Optional)
                </span>
              </h2>

              <p>
                Leave all fields empty
                if you do not want a
                Sound Profile displayed.
              </p>

            </div>
          </div>


          <div className={styles.grid}>

            <div className={styles.field}>

              <label htmlFor="deep">
                Deep
              </label>

              <input
                id="deep"
                type="number"
                min="0"
                max="100"
                step="1"
                value={deep}
                onChange={(event) =>
                  setDeep(
                    event.target.value
                  )
                }
                placeholder="0–100"
              />

            </div>


            <div className={styles.field}>

              <label htmlFor="thocky">
                Thocky
              </label>

              <input
                id="thocky"
                type="number"
                min="0"
                max="100"
                step="1"
                value={thocky}
                onChange={(event) =>
                  setThocky(
                    event.target.value
                  )
                }
                placeholder="0–100"
              />

            </div>


            <div className={styles.field}>

              <label htmlFor="clacky">
                Clacky
              </label>

              <input
                id="clacky"
                type="number"
                min="0"
                max="100"
                step="1"
                value={clacky}
                onChange={(event) =>
                  setClacky(
                    event.target.value
                  )
                }
                placeholder="0–100"
              />

            </div>


            <div className={styles.field}>

              <label htmlFor="sharp">
                Sharp
              </label>

              <input
                id="sharp"
                type="number"
                min="0"
                max="100"
                step="1"
                value={sharp}
                onChange={(event) =>
                  setSharp(
                    event.target.value
                  )
                }
                placeholder="0–100"
              />

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* DESCRIPTION */}
        {/* ================================================= */}

        <section className={styles.section}>

          <div className={styles.sectionHeader}>
            <div>

              <h2>
                Description
              </h2>

              <p>
                Optional information
                about this switch.
              </p>

            </div>
          </div>


          <div className={styles.field}>

            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              rows={5}
              maxLength={1000}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe the switch, its feel, sound and any other useful information..."
            />

            <small>
              {description.length}/1000
            </small>

          </div>

        </section>


        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}


        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className={styles.footer}>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() =>
              router.push("/switches")
            }
          >
            Cancel
          </button>


          <button
            type="submit"
            className={styles.primaryButton}
            disabled={saving}
          >

            <Check size={16} />

            {saving
              ? "Adding..."
              : "Add Switch"}

          </button>

        </div>

      </form>

    </div>
  );
}