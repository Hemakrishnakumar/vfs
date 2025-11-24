import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUser, logoutUser, logoutAllSessions } from "../api/userApi";
import {
  FaFolderPlus,
  FaUpload,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
} from "react-icons/fa";
import { formatSize } from "../utils/utils";

function DirectoryHeader({
  directoryName,
  onCreateFolderClick,
  onUploadFilesClick,
  fileInputRef,
  handleFileSelect,
  disabled = false,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("guest@example.com");
  const [userPicture, setUserPicture] = useState("");
  const userMenuRef = useRef(null);
  const [maxStorageSize, setMaxStorageSize] = useState(0);
  const [usedStorageSize, setUsedStorageSize] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await fetchUser();
        setUserName(data.name);
        setUserEmail(data.email);
        setLoggedIn(true);
        setMaxStorageSize(data.maxStorageSize);
        setUsedStorageSize(data.usedStorageSize)
      } catch (err) {
        setLoggedIn(false);
        setUserName("Guest User");
        setUserEmail("guest@example.com");
      }
    }
    loadUser();
  }, []);

  const handleUserIconClick = () => {
    setShowUserMenu((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setLoggedIn(false);
      setUserName("Guest User");
      setUserEmail("guest@example.com");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setShowUserMenu(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllSessions();
      setLoggedIn(false);
      setUserName("Guest User");
      setUserEmail("guest@example.com");
      navigate("/login");
    } catch (err) {
      console.error("Logout all error:", err);
    } finally {
      setShowUserMenu(false);
    }
  };

  useEffect(() => {
    function handleDocumentClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-gray-300 py-2 mb-4">
      <h1 className="text-xl font-semibold">{directoryName}</h1>
      <div className="flex gap-4 items-end">
        <button
          className="text-blue-500 hover:text-blue-700 text-xl -mb-0.5 mr-0.5 disabled:text-blue-300 disabled:cursor-not-allowed"
          title="Create Folder"
          onClick={onCreateFolderClick}
          disabled={disabled}
        >
          <FaFolderPlus />
        </button>
        <button
          className="text-blue-500 hover:text-blue-700 text-xl disabled:text-blue-300 disabled:cursor-not-allowed"
          title="Upload Files"
          onClick={onUploadFilesClick}
          disabled={disabled}
        >
          <FaUpload />
        </button>
        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          className="hidden"
          multiple
          onChange={handleFileSelect}
        />
        <div className="relative flex" ref={userMenuRef}>
          <button
            className="text-blue-500 hover:text-blue-700 text-xl"
            title="User Menu"
            onClick={handleUserIconClick}
          >
            {userPicture ? (
              <img
                className="w-8 h-8 rounded-full object-cover"
                src={userPicture}
                alt={userName}
              />
            ) : (
              <FaUser />
            )}
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-4 mt-2 w-48 bg-white rounded-md shadow-md z-10 border border-gray-300 overflow-hidden">
              {loggedIn ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-800">
                    <div className="font-semibold">{userName}</div>
                    <div className="text-xs text-gray-500">{userEmail}</div>
                  </div>
                  <div className="mx-2 my-2">
                    <div className="h-[8px] bg-gray-200 rounded mb-0.5">
                      <div className="h-[8px] bg-blue-600 rounded" style={{width: `${Math.round((usedStorageSize / maxStorageSize) * 100)}%`}}></div>                    
                    </div>
                    <span className="text-xs">{formatSize(usedStorageSize)} of {formatSize(maxStorageSize)} used</span>
                  </div>
                  <div className="border-t border-gray-200" />
                  <div
                    className="flex items-center gap-2 text-gray-700 cursor-pointer hover:bg-gray-200 px-4 py-2"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="text-blue-600" /> Logout
                  </div>
                  <div
                    className="flex items-center gap-2 text-gray-700 cursor-pointer hover:bg-gray-200 px-4 py-2"
                    onClick={handleLogoutAll}
                  >
                    <FaSignOutAlt className="text-blue-600" /> Logout All
                  </div>
                </>
              ) : (
                <div
                  className="flex items-center gap-2 text-gray-700 cursor-pointer hover:bg-gray-200 px-4 py-2"
                  onClick={() => {
                    navigate("/login");
                    setShowUserMenu(false);
                  }}
                >
                  <FaSignInAlt className="text-blue-600" /> Login
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DirectoryHeader;
