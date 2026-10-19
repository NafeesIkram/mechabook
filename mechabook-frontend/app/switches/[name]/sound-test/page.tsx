"use client";

import {
  ArrowLeft,
  Check,
  Upload,
  Video,
  Volume2,
} from "lucide-react";

import { useParams, useRouter } from "next/navigation";

import {
  useState,
} from "react";

import { switches } from "../../../data/mock";

import {
  createSoundTest,
  type CreateSoundTestData,
} from "../../../lib/api";

import styles from "./SwitchSoundTest.module.css";


export default function SwitchSoundTestPage() {
  const router = useRouter();

  const params = useParams();

  const switchName =
    decodeURIComponent(
      String(params.name)
    );

  const switchItem =
    switches.find(
      (item) =>
        item.name === switchName
    );


  const [title, setTitle] =
    useState("");

  const [keyboard, setKeyboard] =
    useState("");

  const [plate, setPlate] =
    useState("");

  const [lubed, setLubed] =
    useState("");

  const [keycaps, setKeycaps] =
    useState("");

  const [microphone, setMicrophone] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [videoUrl, setVideoUrl] =
    useState("");


  const [audioFile, setAudioFile] =
    useState<File | null>(null);

  const [fileName, setFileName] =
    useState("");

  const [
    audioPreviewUrl,
    setAudioPreviewUrl,
  ] = useState("");


  const [submitted, setSubmitted] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");


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
          <ArrowLeft size={16} />

          Back to Switches
        </button>
      </div>
    );
  }


  const handleAudioChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }


    const allowedTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/ogg",
      "audio/webm",
      "audio/mp4",
      "audio/aac",
      "audio/flac",
    ];


    if (
      file.type &&
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Please select a valid audio file."
      );

      return;
    }


    if (
      file.size >
      25 * 1024 * 1024
    ) {
      setError(
        "Audio file cannot exceed 25 MB."
      );

      return;
    }


    setError("");

    setAudioFile(file);

    setFileName(
      file.name
    );


    const url =
      URL.createObjectURL(
        file
      );

    setAudioPreviewUrl(url);
  };


  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");


    if (!title.trim()) {
      setError(
        "Please enter a test title."
      );

      return;
    }


    if (!keyboard.trim()) {
      setError(
        "Please enter the keyboard / board."
      );

      return;
    }


    setSubmitting(true);


    try {
      const data: CreateSoundTestData =
        {
          title:
            title.trim(),

          keyboard:
            keyboard.trim(),

          switch_name:
            switchItem.name,

          plate:
            plate.trim() ||
            undefined,

          lubed:
            lubed ||
            undefined,

          keycaps:
            keycaps.trim() ||
            undefined,

          microphone:
            microphone.trim() ||
            undefined,

          description:
            description.trim() ||
            undefined,

          video_url:
            videoUrl.trim() ||
            undefined,

          audio_file:
            audioFile ||
            undefined,
        };


      await createSoundTest(
        data
      );


      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit sound test."
      );
    } finally {
      setSubmitting(false);
    }
  };


  if (submitted) {
    return (
      <div
        className={
          styles.page
        }
      >
        <div
          className={
            styles.successCard
          }
        >
          <div
            className={
              styles.successIcon
            }
          >
            <Check size={28} />
          </div>


          <h1>
            Sound test submitted
          </h1>


          <p>
            Thanks for contributing
            a sound test for{" "}
            <strong>
              {switchItem.name}
            </strong>
            .
          </p>


          <p
            className={
              styles.successSubtext
            }
          >
            Your sound test has been
            added to the community
            page.
          </p>


          <div
            className={
              styles.successActions
            }
          >
            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={() =>
                router.push(
                  `/switches/${encodeURIComponent(
                    switchItem.name
                  )}`
                )
              }
            >
              <ArrowLeft
                size={16}
              />

              Back to Switch
            </button>


            <button
              type="button"
              className={
                styles.secondaryButton
              }
              onClick={() => {
                setSubmitted(false);

                setTitle("");

                setKeyboard("");

                setPlate("");

                setLubed("");

                setKeycaps("");

                setMicrophone("");

                setDescription("");

                setVideoUrl("");

                setAudioFile(null);

                setFileName("");

                setAudioPreviewUrl("");

                setError("");
              }}
            >
              Add Another Test
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div
      className={
        styles.page
      }
    >

      <button
        type="button"
        className={
          styles.backButton
        }
        onClick={() =>
          router.push(
            `/switches/${encodeURIComponent(
              switchItem.name
            )}`
          )
        }
      >
        <ArrowLeft size={17} />

        Back to{" "}
        {switchItem.name}
      </button>


      <div
        className={
          styles.header
        }
      >
        <div
          className={
            styles.icon
          }
        >
          <Volume2 size={24} />
        </div>


        <div>
          <p
            className={
              styles.eyebrow
            }
          >
            Community contribution
          </p>

          <h1>
            Add Sound Test
          </h1>

          <p>
            Share how{" "}
            <strong>
              {switchItem.name}
            </strong>{" "}
            sounds in your build.
          </p>
        </div>
      </div>


      <form
        className={
          styles.form
        }
        onSubmit={
          handleSubmit
        }
      >

        {/* INFORMATION */}

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
                Sound Test Information
              </h2>

              <p>
                Tell the community
                about your switch
                recording.
              </p>
            </div>
          </div>


          <div
            className={
              styles.field
            }
          >
            <label htmlFor="title">
              Test title{" "}
              <span>*</span>
            </label>

            <input
              id="title"
              type="text"
              placeholder="e.g. Oil King deep thock"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              required
            />
          </div>


          <div
            className={
              styles.field
            }
          >
            <label htmlFor="keyboard">
              Keyboard / Board{" "}
              <span>*</span>
            </label>

            <input
              id="keyboard"
              type="text"
              placeholder="e.g. Neo65, Keychron Q1, Zoom75"
              value={keyboard}
              onChange={(event) =>
                setKeyboard(
                  event.target.value
                )
              }
              required
            />

            <small>
              Which keyboard or board
              was used for this sound
              test?
            </small>
          </div>


          <div
            className={
              styles.grid
            }
          >
            <div
              className={
                styles.field
              }
            >
              <label htmlFor="plate">
                Plate
              </label>

              <input
                id="plate"
                type="text"
                placeholder="e.g. FR4"
                value={plate}
                onChange={(event) =>
                  setPlate(
                    event.target.value
                  )
                }
              />
            </div>


            <div
              className={
                styles.field
              }
            >
              <label htmlFor="lubed">
                Lubed?
              </label>

              <select
                id="lubed"
                value={lubed}
                onChange={(event) =>
                  setLubed(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select
                </option>

                <option value="Yes">
                  Yes
                </option>

                <option value="No">
                  No
                </option>

                <option value="Factory">
                  Factory lube
                </option>
              </select>
            </div>


            <div
              className={
                styles.field
              }
            >
              <label htmlFor="keycaps">
                Keycaps
              </label>

              <input
                id="keycaps"
                type="text"
                placeholder="e.g. GMK Olivia"
                value={keycaps}
                onChange={(event) =>
                  setKeycaps(
                    event.target.value
                  )
                }
              />
            </div>
          </div>


          <div
            className={
              styles.field
            }
          >
            <label htmlFor="microphone">
              Microphone /
              Recording Device
            </label>

            <input
              id="microphone"
              type="text"
              placeholder="e.g. FIFINE K669B, Blue Yeti, iPhone 16 Pro"
              value={microphone}
              onChange={(event) =>
                setMicrophone(
                  event.target.value
                )
              }
            />

            <small>
              Tell viewers what
              microphone or device
              you used to record the
              sound.
            </small>
          </div>


          <div
            className={
              styles.field
            }
          >
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              rows={5}
              placeholder="Describe the sound, build and recording setup..."
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
            />
          </div>
        </section>


        {/* AUDIO */}

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
                Audio Recording
              </h2>

              <p>
                Upload your switch
                sound test.
              </p>
            </div>
          </div>


          <label
            className={
              styles.uploadBox
            }
          >
            <input
              type="file"
              accept="audio/*"
              onChange={
                handleAudioChange
              }
            />


            <div
              className={
                styles.uploadIcon
              }
            >
              <Upload size={22} />
            </div>


            <strong>
              {fileName ||
                "Upload your sound recording"}
            </strong>


            <span>
              {fileName
                ? "Audio file selected"
                : "MP3, WAV or other audio formats"}
            </span>
          </label>


          {audioPreviewUrl && (
            <div
              className={
                styles.audioPreview
              }
            >
              <span>
                Preview recording
              </span>

              <audio
                controls
                src={
                  audioPreviewUrl
                }
              />
            </div>
          )}
        </section>


        {/* VIDEO */}

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
                Review Video
              </h2>

              <p>
                Optional YouTube or
                video review link.
              </p>
            </div>
          </div>


          <div
            className={
              styles.field
            }
          >
            <label htmlFor="videoUrl">
              Video URL
            </label>


            <div
              className={
                styles.inputWithIcon
              }
            >
              <Video size={17} />

              <input
                id="videoUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(event) =>
                  setVideoUrl(
                    event.target.value
                  )
                }
              />
            </div>


            <small>
              If provided, a Review
              Video button will appear
              with your sound test.
            </small>
          </div>
        </section>


        {error && (
          <div
            style={{
              padding:
                "12px 14px",

              borderRadius: 10,

              border:
                "1px solid rgba(248,113,113,.25)",

              background:
                "rgba(248,113,113,.08)",

              color:
                "#fca5a5",

              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}


        <div
          className={
            styles.footer
          }
        >
          <button
            type="button"
            className={
              styles.secondaryButton
            }
            onClick={() =>
              router.push(
                `/switches/${encodeURIComponent(
                  switchItem.name
                )}`
              )
            }
            disabled={
              submitting
            }
          >
            Cancel
          </button>


          <button
            type="submit"
            className={
              styles.primaryButton
            }
            disabled={
              submitting
            }
          >
            <Volume2 size={16} />

            {submitting
              ? "Submitting..."
              : "Submit Sound Test"}
          </button>
        </div>
      </form>
    </div>
  );
}