import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { useState, useRef, useEffect } from "react";
import NotificationDropdown from "./NotificationDropdown";
import "./Navbar.css";

export default function Navbar() {
  const { isAuthenticated, orgName, orgEmail, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // User avatar dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleProfileClick = () => {
    navigate("/settings");
  };

  const handleLogoutClick = () => {
    logout();
  };

  if (loading) {
    return (
      <nav className="navbar">
        <div className="navbar-logo">
          <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 64 128 C 64 163.346 92.654 192 128 192 L 128 256 C 57.308 256 0 198.692 0 128 Z M 192 128 C 192 163.346 220.654 192 256 192 L 256 256 C 185.308 256 128 198.692 128 128 Z M 64 0 C 64 35.346 92.654 64 128 64 L 128 128 C 57.308 128 0 70.692 0 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z"
              fill="currentColor"
            />
          </svg>
          <span className="opacity-50">AnonVote</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="navbar-network font-mono">STELLAR TESTNET</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <Link
        to={isAuthenticated ? "/dashboard" : "/login"}
        className="navbar-logo"
      >
        <svg
          width="150"
          height="176"
          viewBox="0 0 150 176"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M69.855 4.03008C38.4042 30.4279 13.841 76.588 4.63 126.602C2.0686 140.507 0 160.876 0 172.185V175.869L2.0414 175.864C7.1695 175.852 19.9452 174.673 26.0657 173.648C54.0254 168.962 70.2143 156.126 73.7523 135.838C74.6663 130.595 75.1252 129.451 75.1252 132.412C75.1252 135.656 77.189 142.715 79.5304 147.479C82.0825 152.672 87.569 158.877 92.672 162.344C104.335 170.268 119.918 174.457 142.035 175.617L149.334 176L148.991 165.182C147.956 132.635 140.417 99.6057 127.324 70.2584C114.89 42.3881 96.228 17.0856 76.6974 1.61683L74.656 0L69.855 4.03008ZM74.4148 44.6718C74.2411 45.4203 73.8084 47.3801 73.4534 49.0269C70.7086 61.7655 59.0364 75.312 46.135 80.733C44.0707 81.6002 40.6291 82.6754 38.4875 83.1217C36.3453 83.5681 34.5151 84.0118 34.4198 84.1071C34.3246 84.2024 35.544 84.4457 37.1292 84.6482C44.5068 85.59 54.34 90.8695 61.0142 97.4723C68.2512 104.633 71.7244 111.223 74.3582 122.791C74.6908 124.251 74.8046 124.049 75.4295 120.886C78.0867 107.445 88.001 94.8533 101.093 88.2923C104.214 86.7283 110.555 84.7266 113.777 84.2884C114.633 84.1719 113.523 83.738 110.783 83.1185C93.4 79.1897 78.9 64.3121 75.4328 46.8493C74.889 44.111 74.6587 43.6184 74.4148 44.6718Z"
            fill="currentColor"
          />
        </svg>
        <span>AnonVote</span>
      </Link>

      <div className="flex items-center gap-4">
        <span className="navbar-network">STELLAR TESTNET</span>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <NotificationDropdown />

            {/* User Avatar / Profile Button */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="navbar-avatar"
                aria-label="Profile"
              >
                {orgName ? orgName.charAt(0).toUpperCase() : "U"}
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="navbar-dropdown card">
                  <div className="profile-header">
                    <span className="avatar-text">
                      {orgName ? orgName.charAt(0).toUpperCase() : "U"}
                    </span>
                    <div className="profile-info">
                      <span className="profile-name">{orgName || "User"}</span>
                      <span className="profile-email">
                        {orgEmail || "org@example.com"}
                      </span>
                    </div>
                  </div>
                  <div className="navbar-dropdown-divider" />
                  <button
                    onClick={handleProfileClick}
                    className="navbar-dropdown-item"
                  >
                    <svg
                      className="profile-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="profile-option-text">
                      Profile & Settings
                    </span>
                  </button>
                  <div className="navbar-dropdown-divider" />
                  <button
                    onClick={toggleTheme}
                    className="navbar-dropdown-item"
                  >
                    <svg
                      className="profile-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {theme === "light" ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      )}
                    </svg>
                    <span className="profile-option-text">
                      {theme === "light" ? "Switch to Dark" : "Switch to Light"}
                    </span>
                  </button>
                  <div className="navbar-dropdown-divider" />
                  <button
                    onClick={handleLogoutClick}
                    className="navbar-dropdown-item danger"
                  >
                    <svg
                      className="profile-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="profile-option-text">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="font-dm-sans text-sm font-medium">
              Login
            </Link>
            <Link
              to="/register"
              className="btn-primary"
              style={{ minHeight: "36px", padding: "8px 16px" }}
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
