
import React, { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      const res = await fetch("/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) setMessage("Registered! You can now log in.");
      else setError(data.error || "Registration failed");
    } catch {
      setError("Network error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white/10 p-8 rounded-lg">
      <h2 className="text-xl text-white font-bold">Register</h2>
      <input
        className="w-full p-2 rounded"
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        required
      />
      <div className="relative">
        <input
          className="w-full p-2 rounded pr-10"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-violet-600 hover:text-violet-800"
          onClick={() => setShowPassword((v) => !v)}
          tabIndex={-1}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      <button className="w-full bg-violet-600 text-white p-2 rounded">Register</button>
      {message && <div className="text-green-400">{message}</div>}
      {error && <div className="text-red-400">{error}</div>}
    </form>
  );
}