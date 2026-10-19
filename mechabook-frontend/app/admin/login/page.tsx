"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import styles from "./AdminLogin.module.css";
import { loginUser } from "../../lib/api";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError(
        "Please enter your admin email."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await loginUser({
        email: email.trim(),
        password,
      });

      if (!result.user.is_admin) {
        setError(
          "This account does not have administrator access."
        );
        return;
      }

      localStorage.setItem(
        "mechabook-token",
        result.access_token
      );

      localStorage.setItem(
        "mechabook-user",
        JSON.stringify(result.user)
      );

      router.push("/admin");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Invalid admin credentials."
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className={styles.page}>

      <div
        className={
          styles.backgroundGlow
        }
      />


      <div className={styles.card}>

        {/* LOGO */}

        <div className={styles.logoSection}>

          <div className={styles.logo}>
            <ShieldCheck size={25} />
          </div>

          <div>
            <h1>
              Mechabook
            </h1>

            <p>
              Administrator Portal
            </p>
          </div>

        </div>


        {/* TITLE */}

        <div className={styles.heading}>

          <div
            className={
              styles.adminLabel
            }
          >
            <ShieldCheck size={15} />

            ADMINISTRATOR ACCESS
          </div>

          <h2>
            Admin Login
          </h2>

          <p>
            Sign in to manage the Mechabook
            platform.
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div
            className={
              styles.errorMessage
            }
          >
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
              Admin Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="admin@example.com"
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
                    (current) =>
                      !current
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
            className={
              styles.submitButton
            }
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className={
                    styles.spinner
                  }
                />

                Signing in...
              </>
            ) : (
              <>
                <ShieldCheck
                  size={18}
                />

                Admin Login
              </>
            )}
          </button>

        </form>


        {/* BACK TO NORMAL LOGIN */}

        <button
          type="button"
          className={
            styles.backButton
          }
          onClick={() =>
            router.push("/login")
          }
        >
          ← Back to regular login
        </button>

      </div>

    </main>
  );
}