import { useState } from "react";

function App() {
  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "client",
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Registration successful!");
        setRegisterForm({
          full_name: "",
          email: "",
          password: "",
          role: "client",
        });
      } else {
        setMessage(data.detail || "Registration failed");
      }
    } catch (error) {
      setMessage("Backend connection failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        setMessage("Login successful! JWT token generated.");
      } else {
        setMessage(data.detail || "Login failed");
      }
    } catch (error) {
      setMessage("Backend connection failed");
    }
  };

  return (
    <div>
      <h1>TrustHire AI</h1>

      <h2>Register</h2>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={registerForm.full_name}
          onChange={handleRegisterChange}
          required
        />

        <br /><br />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={registerForm.email}
          onChange={handleRegisterChange}
          required
        />

        <br /><br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={registerForm.password}
          onChange={handleRegisterChange}
          required
        />

        <br /><br />

        <select
          name="role"
          value={registerForm.role}
          onChange={handleRegisterChange}
        >
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>

        <br /><br />

        <button type="submit">Register</button>
      </form>

      <hr />

      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={loginForm.email}
          onChange={handleLoginChange}
          required
        />

        <br /><br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={loginForm.password}
          onChange={handleLoginChange}
          required
        />

        <br /><br />

        <button type="submit">Login</button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default App;