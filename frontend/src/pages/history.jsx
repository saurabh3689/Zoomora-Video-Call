import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VideoCallIcon from '@mui/icons-material/VideoCall';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history || []);
            } catch (err) {
                console.error("Failed to fetch meeting history:", err);
            }
        };

        fetchHistory();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const handleOpenSummary = (meeting) => {
        setSelectedMeeting(meeting);
        setOpenModal(true);
    };

    const handleCloseSummary = () => {
        setOpenModal(false);
        setSelectedMeeting(null);
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "radial-gradient(circle at 15% 15%, #1e293b 0%, #0f172a 55%, #080d1a 100%)",
            color: "#ffffff",
            padding: "30px 20px"
        }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "30px",
                    paddingBottom: "16px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <Button
                            startIcon={<HomeIcon />}
                            onClick={() => routeTo("/home")}
                            sx={{
                                color: "#e2e8f0",
                                bgcolor: "rgba(255, 255, 255, 0.08)",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                borderRadius: "8px",
                                textTransform: "none",
                                px: 2,
                                py: 0.8,
                                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.16)", borderColor: "#FF9839" }
                            }}
                        >
                            Back to Home
                        </Button>
                        <Typography variant="h5" component="h1" fontWeight="bold">
                            Meeting History & <span style={{ color: "#FF9839" }}>AI Summaries</span>
                        </Typography>
                    </div>

                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                        Total: {meetings.length} meetings
                    </Typography>
                </div>

                {/* Empty State */}
                {meetings.length === 0 ? (
                    <Box textAlign="center" py={8} sx={{
                        bgcolor: "rgba(30, 41, 59, 0.4)",
                        borderRadius: "16px",
                        border: "1px dashed rgba(255, 255, 255, 0.15)",
                        p: 4
                    }}>
                        <Typography variant="h6" sx={{ color: "#94a3b8" }} gutterBottom>
                            No past meetings found in your history.
                        </Typography>
                        <Button 
                            variant="contained" 
                            sx={{
                                mt: 2,
                                textTransform: "none",
                                fontWeight: "bold",
                                background: "linear-gradient(135deg, #FF9839 0%, #EA580C 100%)",
                                px: 3,
                                py: 1
                            }} 
                            onClick={() => routeTo("/home")}
                        >
                            Start a New Meeting
                        </Button>
                    </Box>
                ) : (
                    /* Meeting Cards Grid */
                    <div style={{ display: "grid", gap: "18px" }}>
                        {meetings.map((e, i) => (
                            <Card 
                                key={e._id || i} 
                                sx={{ 
                                    bgcolor: "rgba(30, 41, 59, 0.55)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    backdropFilter: "blur(12px)",
                                    borderRadius: "16px",
                                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
                                    color: "#ffffff",
                                    transition: "transform 0.2s, border-color 0.2s",
                                    "&:hover": {
                                        borderColor: "rgba(255, 152, 57, 0.4)",
                                        transform: "translateY(-2px)"
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                                        <div>
                                            <Typography variant="h6" fontWeight="bold" sx={{ color: "#38bdf8", letterSpacing: "0.5px" }}>
                                                Room: {e.meetingCode}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
                                                {formatDate(e.date)}
                                            </Typography>
                                        </div>

                                        {e.summary ? (
                                            <Chip 
                                                icon={<AutoAwesomeIcon style={{ color: "#FF9839", fontSize: "1rem" }} />} 
                                                label="AI Summary Ready" 
                                                size="small" 
                                                sx={{
                                                    bgcolor: "rgba(255, 152, 57, 0.15)",
                                                    color: "#FF9839",
                                                    border: "1px solid rgba(255, 152, 57, 0.3)",
                                                    fontWeight: "bold"
                                                }}
                                            />
                                        ) : (
                                            <Chip 
                                                label="Recorded" 
                                                size="small" 
                                                sx={{ bgcolor: "rgba(255, 255, 255, 0.08)", color: "#cbd5e1" }} 
                                            />
                                        )}
                                    </div>

                                    {/* Summary Quote Preview */}
                                    {e.summary && (
                                        <Box sx={{
                                            mt: 2,
                                            p: 2,
                                            bgcolor: "rgba(15, 23, 42, 0.65)",
                                            borderRadius: "10px",
                                            borderLeft: "3px solid #FF9839"
                                        }}>
                                            <Typography variant="body2" sx={{ color: "#e2e8f0", fontStyle: "italic", lineHeight: 1.6 }}>
                                                "{e.summary.length > 160 ? e.summary.substring(0, 160) + "..." : e.summary}"
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>

                                <CardActions sx={{ px: 3, pb: 3, pt: 0, display: "flex", gap: "12px", flexWrap: "wrap" }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<VideoCallIcon />}
                                        onClick={() => routeTo(`/${e.meetingCode}`)}
                                        sx={{
                                            textTransform: "none",
                                            fontWeight: 600,
                                            color: "#e2e8f0",
                                            borderColor: "rgba(255, 255, 255, 0.2)",
                                            bgcolor: "rgba(255, 255, 255, 0.04)",
                                            borderRadius: "8px",
                                            "&:hover": { borderColor: "#38bdf8", bgcolor: "rgba(56, 189, 248, 0.1)" }
                                        }}
                                    >
                                        Rejoin Room
                                    </Button>

                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<AutoAwesomeIcon />}
                                        onClick={() => handleOpenSummary(e)}
                                        sx={{
                                            textTransform: "none",
                                            fontWeight: "bold",
                                            borderRadius: "8px",
                                            background: "linear-gradient(135deg, #FF9839 0%, #EA580C 100%)",
                                            boxShadow: "0 2px 10px rgba(234, 88, 12, 0.35)",
                                            "&:hover": { background: "linear-gradient(135deg, #ffa756 0%, #f97316 100%)" }
                                        }}
                                    >
                                        View Full AI Summary
                                    </Button>
                                </CardActions>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Dark Glass AI Summary Dialog Modal */}
                <Dialog 
                    open={openModal} 
                    onClose={handleCloseSummary} 
                    maxWidth="md" 
                    fullWidth
                    PaperProps={{
                        sx: {
                            bgcolor: "#0f172a",
                            color: "#ffffff",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            borderRadius: "18px",
                            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7)",
                            backgroundImage: "none"
                        }
                    }}
                >
                    <DialogTitle sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontWeight: "bold",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        pb: 2
                    }}>
                        <AutoAwesomeIcon sx={{ color: "#FF9839" }} />
                        <span>AI Meeting Minutes & Executive Summary</span>
                    </DialogTitle>

                    <DialogContent sx={{ p: 3 }}>
                        {selectedMeeting && (
                            <Box sx={{ mt: 1 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: "8px" }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Room Code: <span style={{ color: "#38bdf8" }}>{selectedMeeting.meetingCode}</span>
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                                        {formatDate(selectedMeeting.date)}
                                    </Typography>
                                </Box>

                                <Divider sx={{ my: 2, borderColor: "rgba(255, 255, 255, 0.1)" }} />

                                {/* Overview Summary */}
                                <Typography variant="h6" fontWeight="bold" sx={{ color: "#4ade80", mb: 1 }}>
                                    📋 Overview Summary
                                </Typography>
                                <Box sx={{ p: 2.5, bgcolor: "rgba(30, 41, 59, 0.65)", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)", mb: 3 }}>
                                    <Typography variant="body1" sx={{ color: "#f1f5f9", lineHeight: 1.6 }}>
                                        {selectedMeeting.summary || "No automated summary generated for this meeting."}
                                    </Typography>
                                </Box>

                                {/* Key Decisions */}
                                {selectedMeeting.keyDecisions && selectedMeeting.keyDecisions.length > 0 && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="h6" fontWeight="bold" sx={{ color: "#38bdf8", mb: 1 }}>
                                            💡 Key Decisions
                                        </Typography>
                                        <List dense sx={{ pl: 0 }}>
                                            {selectedMeeting.keyDecisions.map((decision, idx) => (
                                                <ListItem key={idx} sx={{ display: "list-item", listStyleType: "disc", ml: 2, pl: 0 }}>
                                                    <ListItemText primary={decision} primaryTypographyProps={{ sx: { color: "#e2e8f0" } }} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}

                                {/* Action Items */}
                                {selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0 && (
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="h6" fontWeight="bold" sx={{ color: "#fb923c", mb: 1 }}>
                                            ✅ Action Items & Next Steps
                                        </Typography>
                                        <List dense sx={{ pl: 0 }}>
                                            {selectedMeeting.actionItems.map((action, idx) => (
                                                <ListItem key={idx} sx={{ display: "list-item", listStyleType: "circle", ml: 2, pl: 0 }}>
                                                    <ListItemText primary={action} primaryTypographyProps={{ sx: { color: "#e2e8f0" } }} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}

                                {/* Raw Transcript */}
                                {selectedMeeting.transcript && (
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="subtitle2" sx={{ color: "#94a3b8", fontWeight: "bold" }}>
                                            Full Spoken Transcript:
                                        </Typography>
                                        <Box sx={{ 
                                            mt: 1, 
                                            p: 2, 
                                            bgcolor: "#030712", 
                                            color: "#e2e8f0", 
                                            borderRadius: "10px", 
                                            border: "1px solid rgba(255, 255, 255, 0.08)",
                                            maxHeight: "160px", 
                                            overflowY: "auto",
                                            fontFamily: "monospace",
                                            fontSize: "0.85rem",
                                            whiteSpace: "pre-wrap"
                                        }}>
                                            {selectedMeeting.transcript}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ p: 2.5, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
                        <Button 
                            onClick={handleCloseSummary} 
                            variant="contained" 
                            sx={{
                                textTransform: "none",
                                fontWeight: "bold",
                                bgcolor: "rgba(255, 255, 255, 0.12)",
                                color: "#ffffff",
                                px: 3,
                                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" }
                            }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}
