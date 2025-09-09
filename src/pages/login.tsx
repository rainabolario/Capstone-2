import type React from "react"
import { useState } from "react"

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Login attempt:", { email, password })
  }

  return (
    <div
      style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "18rem", 
    backgroundImage: 'url("/kc\'s bg.png")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    margin: 0,
    padding: "0 6rem",
    boxSizing: "border-box",
    zIndex: 1000,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(241, 143, 38, 0.4)",
          zIndex: 1,
        }}
      />

      {/* Left Side */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "700px",
          height: "400px",
          backgroundImage: 'url("/Kc\'s logo.png")',
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          flexShrink: 0, 
          //padding: "6rem", 
        }}
      />

      {/* Right Side - Login Form */}
      <div
        style={{
          maxWidth: "400px",
          width: "100%",
          zIndex: 2,
          position: "relative",
          padding: "2rem", 
          flexShrink: 0, 
          backgroundColor: "white",
          borderRadius: "24px",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "2rem",
            color: "#000000ff",
          }}
        >
          LOGIN
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
            <label
              style={{
                display: "block",
                fontSize: "1rem",
                fontWeight: "500",
                color: "#000000ff",
                marginBottom: "0.5rem",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@gmail.com"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                boxSizing: "border-box",
                backgroundColor: "white",
                color: "#000000",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem", textAlign: "left" }}>
            <label
              style={{
                display: "block",
                fontSize: "1rem",
                fontWeight: "500",
                color: "#000000ff",
                marginBottom: "0.5rem",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                transition: "all 0.2s",
                boxSizing: "border-box",
                backgroundColor: "white",
                color: "#000000",
              }}
              required
            />
          </div>

          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <a
              href="#"
              style={{
                color: "#ef4444",
                fontSize: "1rem",
              }}
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "#000000",
              color: "white",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              fontWeight: "500",
              cursor: "pointer",
              fontSize: "1rem",
              transition: "background-color 0.2s",
            }}
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
