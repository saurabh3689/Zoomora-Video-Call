import React, { useState, useContext } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import RestoreIcon from "@mui/icons-material/Restore";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import LogoutIcon from "@mui/icons-material/Logout";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { addToUserHistory } = useContext(AuthContext);

  // Host creates an instant meeting room with an auto-generated code
  const handleStartNewMeeting = async () => {
    const part1 = Math.random().toString(36).substring(2, 6);
    const part2 = Math.random().toString(36).substring(2, 6);
    const newRoomCode = `zm-${part1}-${part2}`;

    try {
      await addToUserHistory(newRoomCode);
    } catch (e) {
      console.error("Error saving meeting to history:", e);
    }
    navigate(`/${newRoomCode}`);
  };

  // Participant joins an existing meeting room using code
  const handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) {
      alert("Please enter a meeting code");
      return;
    }
    const cleanCode = meetingCode.trim();
    try {
      await addToUserHistory(cleanCode);
    } catch (e) {
      console.error("Error saving meeting to history:", e);
    }
    navigate(`/${cleanCode}`);
  };

  return (
    <div className="homePageWrapper">
      <div className="homeNavBar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: "1.6rem", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#FF9839" }}>Zoomora</span>{" "}
            <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "1.1rem" }}>Video Call</span>
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Button
            startIcon={<RestoreIcon />}
            onClick={() => navigate("/history")}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#e2e8f0",
              bgcolor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "8px",
              px: 2,
              py: 0.8,
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.14)",
                borderColor: "#FF9839"
              }
            }}
          >
            History
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<LogoutIcon />}
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#f87171",
              borderColor: "rgba(248, 113, 113, 0.35)",
              borderRadius: "8px",
              px: 2,
              py: 0.8,
              "&:hover": {
                borderColor: "#ef4444",
                bgcolor: "rgba(239, 68, 68, 0.1)"
              }
            }}
          >
            LogOut
          </Button>
        </div>
      </div>

      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h1 style={{
              fontSize: "2.7rem",
              fontWeight: 800,
              lineHeight: 1.25,
              margin: 0,
              letterSpacing: "-0.5px"
            }}>
              Connect Instantly with{" "}
              <span style={{
                background: "linear-gradient(90deg, #FF9839 0%, #FF6B00 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                High-Quality
              </span>{" "}
              Video Calls
            </h1>

            <Typography variant="body1" sx={{ mt: 2, mb: 4, color: "#94a3b8", fontSize: "1.1rem", lineHeight: 1.6 }}>
              Experience real-time video conferencing, screen sharing, and AI-powered meeting summaries in one unified platform.
            </Typography>

            {/* Action Box Card */}
            <Box sx={{
              p: 3.5,
              borderRadius: "18px",
              bgcolor: "rgba(30, 41, 59, 0.55)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 10px 35px rgba(0, 0, 0, 0.4)"
            }}>
              {/* Option 1: Start New Meeting (Host) */}
              <Box>
                <Button
                  onClick={handleStartNewMeeting}
                  variant="contained"
                  size="large"
                  startIcon={<VideoCallIcon fontSize="large" />}
                  sx={{
                    textTransform: "none",
                    px: 3.5,
                    py: 1.4,
                    fontSize: "1.05rem",
                    fontWeight: "bold",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #FF9839 0%, #EA580C 100%)",
                    boxShadow: "0 4px 18px rgba(234, 88, 12, 0.45)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #ffa756 0%, #f97316 100%)",
                      boxShadow: "0 6px 22px rgba(234, 88, 12, 0.6)"
                    }
                  }}
                >
                  New Meeting (Host)
                </Button>
              </Box>

              <Divider sx={{ my: 2.5, borderColor: "rgba(255, 255, 255, 0.12)" }}>
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                  OR JOIN AN EXISTING CALL
                </Typography>
              </Divider>

              {/* Option 2: Join Meeting with Code (Member) */}
              <Box sx={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <TextField
                  onChange={(e) => setMeetingCode(e.target.value)}
                  value={meetingCode}
                  id="meeting-code-input"
                  placeholder="Enter meeting code"
                  variant="outlined"
                  size="medium"
                  sx={{
                    flex: 1,
                    minWidth: "220px",
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      backgroundColor: "rgba(15, 23, 42, 0.65)",
                      borderRadius: "10px",
                      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                      "&:hover fieldset": { borderColor: "#FF9839" },
                      "&.Mui-focused fieldset": { borderColor: "#FF9839" }
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: "#64748b",
                      opacity: 1
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleJoinVideoCall();
                  }}
                />
                <Button
                  onClick={handleJoinVideoCall}
                  variant="outlined"
                  size="large"
                  disabled={!meetingCode.trim()}
                  startIcon={<MeetingRoomIcon />}
                  sx={{
                    textTransform: "none",
                    py: 1.4,
                    px: 3,
                    fontWeight: "bold",
                    borderRadius: "10px",
                    color: "#ffffff",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      borderColor: "#38bdf8",
                      boxShadow: "0 0 14px rgba(56, 189, 248, 0.3)"
                    },
                    "&.Mui-disabled": {
                      color: "rgba(255, 255, 255, 0.3)",
                      borderColor: "rgba(255, 255, 255, 0.08)",
                      backgroundColor: "rgba(255, 255, 255, 0.02)"
                    }
                  }}
                >
                  Join Meeting
                </Button>
              </Box>
            </Box>
          </div>
        </div>

        <div className="rightPanel">
          <img src="logo3.svg" alt="Zoomora Meet Logo" />
        </div>
      </div>
    </div>
  );
}

export default withAuth(HomeComponent);
