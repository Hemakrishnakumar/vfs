import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import {
  FaFolderPlus,
  FaUpload,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

function DirectoryHeader({
  directoryName,
  onCreateFolderClick,
  onUploadFilesClick,
  fileInputRef,
  handleFileSelect,
  disabled = false,
}) {
  // Use a constant for the API base URL
  const BASE_URL = "http://localhost:4000";

  const [showUserMenu, setShowUserMenu] = useState(false);
  const {user, setUser} = useAuth();
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("guest@example.com");

  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // -------------------------------------------
  // 1. Fetch user info from /user on mount
  // -------------------------------------------
 useEffect(()=>{
  if(user?.name) {
    setUserName(user?.name);
    setUserEmail(user?.email);
    setLoggedIn(true);
  }
  else {
    setUserName("Guest User");
    setUserEmail("guest@example.com");
    setLoggedIn(false);
  }
 })

  // -------------------------------------------
  // 2. Toggle user menu
  // -------------------------------------------
  const handleUserIconClick = () => {
    setShowUserMenu((prev) => !prev);
  };

  // -------------------------------------------
  // 3. Logout handler
  // -------------------------------------------
  const handleLogout = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        console.log("Logged out successfully");
        // Optionally reset local state
        setLoggedIn(false);
        setUserName("Guest User");
        setUserEmail("guest@example.com");
        navigate("/login");
        setUser({});
      } else {
        console.error("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setShowUserMenu(false);
    }
  };

  // -------------------------------------------
  // 4. Close menu on outside click
  // -------------------------------------------
  useEffect(() => {
    function handleDocumentClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  return (
    <header className="directory-header">
      <h1>{directoryName}</h1>
      <div className="header-links">
        {/* Create Folder (icon button) */}
        <button
          className="icon-button"
          title="Create Folder"
          onClick={onCreateFolderClick}
          disabled={disabled}
        >
          <FaFolderPlus />
        </button>

        {/* Upload Files (icon button) */}
        <button
          className="icon-button"
          title="Upload Files"
          onClick={onUploadFilesClick}
          disabled={disabled}
        >
          <FaUpload />
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          style={{ display: "none" }}
          multiple
          onChange={handleFileSelect}
        />

        {/* User Icon & Dropdown Menu */}
        <div className="user-menu-container" ref={userMenuRef}>
          <button
            className="icon-button"
            title="User Menu"
            onClick={handleUserIconClick}
            disabled={disabled}
          >
            <FaUser />
          </button>

          {showUserMenu && (
            <div className="user-menu">
              {loggedIn ? (
                <>
                  {/* Display name & email if logged in */}
                  <div className="user-menu-item user-info">
                    <span className="user-name">{userName}</span>
                    <span className="user-email">{userEmail}</span>
                  </div>
                  <div className="user-menu-divider" />
                  <div
                    className="user-menu-item login-btn"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="menu-item-icon" />
                    <span>Logout</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Show Login if not logged in */}
                  <div
                    className="user-menu-item login-btn"
                    onClick={() => {
                      navigate("/login");
                      setShowUserMenu(false);
                    }}
                  >
                    <FaSignInAlt className="menu-item-icon" />
                    <span>Login</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

DirectoryHeader.propTypes = {
  directoryName: PropTypes.string.isRequired,
  onCreateFolderClick: PropTypes.func.isRequired,
  onUploadFilesClick: PropTypes.func.isRequired,
  fileInputRef: PropTypes.object.isRequired,
  handleFileSelect: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};export default DirectoryHeader;
