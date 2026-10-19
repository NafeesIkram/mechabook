"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import styles from "./Login.module.css";
import { loginUser } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const registered =
    searchParams.get("registered") === "true";


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser({
        email: email.trim(),
        password,
      });

      localStorage.setItem(
        "mechabook-token",
        result.access_token
      );

      localStorage.setItem(
        "mechabook-user",
        JSON.stringify(result.user)
      );

      /*
        Normal login always goes to the main app.

        Admin users should use /admin/login
        to enter the admin dashboard.
      */
      router.push("/");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className={styles.page}>

      <div className={styles.backgroundGlow} />

      <div className={styles.card}>

        {/* LOGO */}

        <div className={styles.logoSection}>

          <div className={styles.logo}>
            M
          </div>

          <div>
            <h1>Mechabook</h1>
            <p>Mechanical Keyboard Community</p>
          </div>

        </div>


        {/* TITLE */}

        <div className={styles.heading}>
          <h2>Welcome back</h2>

          <p>
            Sign in to continue to Mechabook.
          </p>
        </div>


        {/* REGISTERED MESSAGE */}

        {registered && (
          <div className={styles.successMessage}>
            Account created successfully.
            Please sign in.
          </div>
        )}


        {/* ERROR */}

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}


        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >

          {/* EMAIL */}

          <div className={styles.field}>

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
            />

          </div>


          {/* PASSWORD */}

          <div className={styles.field}>

            <label htmlFor="password">
              Password
            </label>

            <div
              className={
                styles.passwordWrapper
              }
            >

              <input
                id="password"
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
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className={
                  styles.passwordToggle
                }
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>


          {/* SUBMIT */}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className={styles.spinner}
                />

                Signing in...
              </>
            ) : (
              <>
                <LogIn size={18} />

                Sign In
              </>
            )}
          </button>

        </form>


        {/* REGISTER */}

        <div className={styles.footerText}>

          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={() =>
              router.push("/register")
            }
          >
            Create account
          </button>

        </div>


        {/* ADMIN */}

        <div className={styles.adminSection}>

          <div className={styles.divider}>
            <span />
            <p>Administrator?</p>
            <span />
          </div>

          <button
            type="button"
            className={
              styles.adminButton
            }
            onClick={() =>
              router.push("/admin/login")
            }
          >
            Admin Login
          </button>

        </div>

      </div>

    </main>
  );
}