import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";
import { useAuth } from "./context/AuthContext.jsx";
import { useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { handleGoogleLogin } from "./apis/loginWithGoogle.js";
import toast from "react-hot-toast";

const Login = () => {
  const BASE_URL = "http://localhost:4000";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // serverError will hold the error message from the server
  const [serverError, setServerError] = useState("");
  const {user, setUser} = useAuth();  

  const navigate = useNavigate();
  
  useEffect(()=>{
    if(user?.name) {
      navigate('/');
    }
  },[user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear the server error as soon as the user starts typing in either field
    if (serverError) {
      setServerError("");
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      if (data.error) {
        // If there's an error, set the serverError message
        setServerError(data.error);
      } else {
        // On success, navigate to home or any other protected route        
        setUser(data?.user);
        navigate("/");
      }
    } catch (error) {
      console.error("Error:", error);
      setServerError("Something went wrong. Please try again.");
    }
  };

  // If there's an error, we'll add "input-error" class to both fields
  const hasError = Boolean(serverError);

  return (
    <div className="container">
      <h2 className="heading">Login</h2>
      <form className="form" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            className={`input ${hasError ? "input-error" : ""}`}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            className={`input ${hasError ? "input-error" : ""}`}
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
          {/* Absolutely-positioned error message below password field */}
          {serverError && <span className="error-msg">{serverError}</span>}
        </div>

        <button type="submit" className="submit-button">
          Login
        </button>
      </form>

      {/* Link to the register page */}
      <p className="link-text">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
      <div className="or">
        <span>Or</span>
      </div>
      <div className="google_login_btn">
        <GoogleLogin
          onSuccess={async (data)=>{
            const res = await handleGoogleLogin(data);
            if(res?.message === 'logged in') {
              setUser(res?.user);
              navigate('/');            
            }
            else {
              toast.error('Login Failed');
            }
          }}
          shape="pill"               
          theme="default"
          text="continue_with"
          size="medium"
          onError={(err)=>{
            console.log("login failed",err)
          }}        
        />
      </div>
    </div>
  );
};

export default Login;
