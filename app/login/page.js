import React from "react";
// import styles from "@app/components/LoginForm/login.module.css";
// import LoginForm from "@app/components/LoginForm";

const LoginPage = () => {
  return (
    // <div className={styles.container}>

    // {/* <LoginForm />{" "} */}
    <div>hello</div>
  );
};

export default LoginPage;

// "use client";
// import { signIn } from "next-auth/react";
// import { useState } from "react";

// export default function LoginForm() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const result = await signIn("credentials", {
//         username,
//         password,
//         redirect: false,
//       });
//       if (result.error) {
//         alert(result.error);
//       } else {
//         window.location.href = "/admin";
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input
//         type="text"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//         placeholder="Username"
//       />
//       <input
//         type="password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         placeholder="Password"
//       />
//       <button type="submit">Login</button>
//     </form>
//   );
// }
