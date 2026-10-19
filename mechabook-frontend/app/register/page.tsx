"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { registerUser } from "../lib/api";

import styles from "./Register.module.css";


export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!handle.trim()) {
      setError("Please enter a username.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }


    try {
      setLoading(true);

      await registerUser({
        name: name.trim(),

        handle: handle
          .trim()
          .replace(/^@/, "")
          .replace(/^/, "@"),

        email: email.trim(),

        password,
      });


      router.push(
        "/login?registered=true"
      );

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Registration failed."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <main className={styles.page}>

      <div className={styles.background} />


      <section className={styles.card}>

        <div className={styles.logo}>

          <div className={styles.logoMark}>
            M
          </div>

          <span>
            MechaBook
          </span>

        </div>


        <div className={styles.heading}>

          <h1>
            Create your account
          </h1>

          <p>
            Join the mechanical keyboard
            community.
          </p>

        </div>


        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}


        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >

          <label>
            Name

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Alex Tan"
            />
          </label>


          <label>
            Username

            <input
              type="text"
              value={handle}
              onChange={(event) =>
                setHandle(event.target.value)
              }
              placeholder="@alextan"
            />
          </label>


          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="alex@example.com"
            />
          </label>


          <label>
            Password

            <div
              className={
                styles.passwordField
              }
            >

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Minimum 6 characters"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>

            </div>

          </label>


          <label>
            Confirm Password

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Repeat your password"
            />
          </label>


          <button
            type="submit"
            className={styles.submit}
            disabled={loading}
          >

            {loading ? (
              <>
                <Loader2
                  size={17}
                  className={styles.spin}
                />

                Creating account...
              </>
            ) : (
              <>
                <UserPlus size={17} />

                Create Account
              </>
            )}

          </button>

        </form>


        <div className={styles.footer}>

          <span>
            Already have an account?
          </span>

          <button
            onClick={() =>
              router.push("/login")
            }
          >
            Log in
          </button>

        </div>


        <button
          className={styles.adminLink}
          onClick={() =>
            router.push("/admin/login")
          }
        >
          Admin login
        </button>

      </section>

    </main>
  );
}