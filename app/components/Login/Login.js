"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./loginForm.module.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result.error) {
      console.log(result);
      if (result.error === "CredentialsSignin")
        setError(
          "Access Denied: Invalid Email or Password. Give It Another Shot."
        );
      else setError(result.error);
    } else if (result.ok) {
      router.push("/admin");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1>Login</h1>
      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      {error && <h2 style={{ color: "red" }}>{error}</h2>}
    </form>
  );
};

export default LoginForm;
