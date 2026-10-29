import React, { useState, useContext } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import IconButton from "@mui/material/IconButton";
import RestoreIcon from "@mui/icons-material/Restore";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { addToUserHistory } = useContext(AuthContext);

  const handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) {
      alert("Please enter a meeting code");
      return;
    }
    try {
      await addToUserHistory(meetingCode.trim());
    } catch (e) {
      console.error("Error saving meeting to history:", e);
    }
    navigate(`/${meetingCode.trim()}`);
  };

  return (
    <>
      <div className="navBar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2>Zoomora Video Call</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={() => navigate("/history")}>
            <RestoreIcon />
          </IconButton>
          <p style={{ cursor: "pointer", marginRight: "10px" }} onClick={() => navigate("/history")}>
            History
          </p>

          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
          >
            LogOut
          </Button>
        </div>
      </div>

      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h2>Connect Instantly with Seamless High-Quality Video Calls</h2>
            <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                value={meetingCode}
                id="outlined-basic"
                label="Enter Meeting Code"
                variant="outlined"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleJoinVideoCall();
                }}
              />
              <Button onClick={handleJoinVideoCall} variant="contained">
                Join
              </Button>
            </div>
          </div>
        </div>

        <div className="rightPanel">
          <img src="logo3.svg" alt="logo" />
        </div>
      </div>
    </>
  );
}

export default withAuth(HomeComponent);
