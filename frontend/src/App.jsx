import React, { useContext } from "react";
import { AuthContext, AuthProvider } from "./AuthContext";
import Login from "./Login";
import Register from "./Register";

function Main() {
  const { token, logout } = useContext(AuthContext);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-lg p-10 border border-white/20 max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4 text-center drop-shadow-[0_2px_15px_rgba(177,51,255,0.75)]">
          FoodWish
        </h1>
        {!token ? (
          <>
            <Login />
            <div className="my-4" />
            <Register />
          </>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-violet-100 mb-4">You are logged in!</p>
            <button onClick={logout} className="bg-violet-600 text-white py-2 px-4 rounded">Logout</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}