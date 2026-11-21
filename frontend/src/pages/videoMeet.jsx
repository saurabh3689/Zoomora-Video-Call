import React, { useEffect, useRef, useState, useContext } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from '@mui/material/Button';
import { io } from "socket.io-client";
import styles from "../styles/videoComponent.module.css";
import IconButton from '@mui/material/IconButton';
import VideocamIcon from '@mui/icons-material/Videocam'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare'
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import Badge from '@mui/material/Badge';
import ChatIcon from '@mui/icons-material/Chat'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import server from '../environment';
import { AuthContext } from '../contexts/AuthContext';


const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers" : [
        {"urls": "stun:stun.l.google.com:19302"}
    ]
}


export default function VideoMeetComponent() {

    var socketRef = useRef();

    let socketIdRef = useRef();

    let localVideoRef = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();  

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([]);

    let [message, setMessage]= useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([])

    const { url: routeMeetingCode } = useParams();
    const meetingCode = routeMeetingCode || window.location.pathname.replace("/", "") || "meeting";
    const { saveMeetingSummary } = useContext(AuthContext);

    const [isTranscribing, setIsTranscribing] = useState(true);
    const [transcriptText, setTranscriptText] = useState("");
    const [liveSubtitle, setLiveSubtitle] = useState("");
    const [showLiveNotesModal, setShowLiveNotesModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryResult, setSummaryResult] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopyMeetingLink = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link);
        setCopySuccess(true);
    };

    const recognitionRef = useRef(null);
    const isTranscribingRef = useRef(true);
    const inCallRef = useRef(false);
    const transcriptTextRef = useRef("");
    const audioRef = useRef(true);

    useEffect(() => {
        isTranscribingRef.current = isTranscribing;
    }, [isTranscribing]);

    useEffect(() => {
        transcriptTextRef.current = transcriptText;
    }, [transcriptText]);

    useEffect(() => {
        audioRef.current = audio;
    }, [audio]);

    const startTranscription = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API is not supported in this browser.");
            return;
        }

        try {
            if (!recognitionRef.current) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = "en-US";

                recognition.onresult = (event) => {
                    if (audioRef.current === false) return;

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            const finalSegment = event.results[i][0].transcript.trim();
                            if (finalSegment) {
                                const speaker = username || "Participant";
                                const line = `${speaker}: ${finalSegment}\n`;
                                setTranscriptText((prev) => prev + line);
                                setLiveSubtitle(`${speaker}: ${finalSegment}`);
                                setTimeout(() => {
                                    setLiveSubtitle((curr) => (curr === `${speaker}: ${finalSegment}` ? "" : curr));
                                }, 4500);
                            }
                        }
                    }
                };

                recognition.onerror = (event) => {
                    if (event.error !== "no-speech") {
                        console.log("Speech recognition error:", event.error);
                    }
                };

                recognition.onend = () => {
                    if (isTranscribingRef.current && inCallRef.current) {
                        try {
                            recognition.start();
                        } catch (e) {}
                    }
                };

                recognitionRef.current = recognition;
            }

            recognitionRef.current.start();
        } catch (err) {
            console.log("Could not start speech recognition:", err);
        }
    };

    //TODO

    // if(isChromw() === false){
    
    //}

    const getPermissions = async () => {
        try{
            const videoPermission = await navigator.mediaDevices.getUserMedia({video: true})

            if(videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');

            }else{
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({audio: true})

            if(audioPermission){
                setAudioAvailable(true);
                console.log('Audio permission granted');
                
            }else{
                setAudioAvailable(false);
                console.log('Audio permission denied');
                
            }

            if(navigator.mediaDevices.getDisplayMedia){
                setScreenAvailable(true);
                

            } else {
                setScreenAvailable(false);
                
            }

            if(videoAvailable  || audioAvailable){
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable});

                if(userMediaStream){
                    window.localStream = userMediaStream;
                    if(localVideoRef.current){
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }


        }catch(err){

            console.log(err)

        }
    }

    useEffect(() => {
        getPermissions();
    }, []);


    let getUserMediaSuccess = (stream) => {
        try{
            window.localStream.getTracks().forEach(track => track.stop())

        }catch(e){console.log(e)}

        window.localStream = stream;
        localVideoRef.current.srcObject = stream; 

        for(let id in connections){
            if(id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                .then(() => {
                    socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
                })
                .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended =() => {
            setVideo(false);
            setAudio(false);

            try{

                let tracks =localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())

            }catch (e){console.log(e)}


            //for blacksilence

            let blackSilence = (...args) => new MediaStream([black(...args),silence()]); 
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;
            

            for(let id in connections){
                connections[id].addStream(window.localStream)
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
                    })

                    .catch(e => console.log(e));
                })
            }
        })
}

let silence =() => {
    let ctx = new AudioContext()
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume()
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false})
}


let black = ({width= 640, height= 480} = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {width,height});

    canvas.getContext('2d').fillRect(0,0, width,height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], {enabled: false})
}

    let getUserMedia = () => {
        if((video && videoAvailable) || (audio && audioAvailable)){
            navigator.mediaDevices.getUserMedia({video: video, audio:audio})
            // .then((getUserMediaSuccess) =>{})  
            // .then((stream)=>{})
                 .then(stream => getUserMediaSuccess(stream))
            .catch((e)=>console.log(e))
        }else{
            try{
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            }catch(e){

            }
        }
    }

    useEffect(() => {
        if(video !== undefined && audio !== undefined){
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);
        }
    }, [audio, video])



    let gotMessageFromServer = (fromId, message) => {

        var signal = JSON.parse(message)

        if(fromId !== socketIdRef.current){
            if(signal.sdp){
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if(signal.sdp.type === "offer"){

                        connections[fromId].createAnswer().then((description) =>{
                            connections[fromId].setLocalDescription(description).then(() =>{
                                socketRef.current.emit("signal", fromId, JSON.stringify({"sdp": connections[fromId].localDescription}))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }
            if(signal.ice){
                connections[fromId].addIceCandidate (new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }

        }
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

        
    let addMessage = (data,sender,socketIdSender) =>{

        setMessages((prevMessages) => [
            ...prevMessages,
            {sender: sender, data: data}
        ]);
         if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };


    let connectToSocketServer = () =>{
        // socketRef.current = io.connect(server_url, { secure: false})
        socketRef.current = io(server_url, { transports: ['websocket'] });
        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on("connect", () =>{
            socketRef.current.emit("join-call", window.location.href)

            socketIdRef.current = socketRef.current.id

            socketRef.current.on("chat-message", addMessage)

            socketRef.current.on("user-left", (id) => {
                setVideos((videos) => videos.filter((video)=> video.socketId !== id))
            })

            socketRef.current.on("user-joined", (id,clients) => {

                clients.forEach((socketListId) =>{
                    if (socketListId === socketIdRef.current) return;

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)

                    connections[socketListId].onicecandidate = function (event) {

                        if(event.candidate != null){
                            socketRef.current.emit("signal", socketListId, JSON.stringify({'ice': event.candidate}))
                        }
                    }  
                    
                    connections[socketListId].onaddstream = (event) =>{
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);
                       
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if(videoExists){

                            console.log("FOUND EXISTING");

                            setVideos(videos => {
                                const updatedVideos = videos.map(video => 
                                    video.socketId === socketListId ? {...video, stream: event.stream }: video
                                );

                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });

                        } else {

                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoPlay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });

                        }

                    };

                    if(window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream);
                    }else{
                        //TODO BLACKSILENCE

                           let blackSilence = (...args) => new MediaStream([black(...args),silence()]); 
                           window.localStream = blackSilence();
                           connections[socketListId].addStream(window.localStream);
                    }

                })

                if (id === socketIdRef.current){
                    for(let id2 in connections){
                        if(id2 === socketIdRef.current) continue

                        try{
                            connections[id2].addStream(window.localStream)
                        }catch(e){console.log(e)}

                            connections[id2].createOffer().then((description) => {
                                connections[id2].setLocalDescription(description)
                                .then(() => {
                                     socketRef.current.emit("signal", id2, JSON.stringify({"sdp": connections[id2].localDescription}))
                                })

                                .catch(e => console.log(e))
                            })

                        
                    }
                }
            })
        })
    }

    let getMedia = () =>{
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let routeTo = useNavigate();

    let connect = () => {
        setAskForUsername(false);
        inCallRef.current = true;
        getMedia(); 
        startTranscription();
    }


    let handleVideo = () => {
        setVideo(!video);
    }

     let handleAudio = () => {
        setAudio(!audio);
    }

        let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }


        let handleEndCall = async () => {
        inCallRef.current = false;
        try {
            let tracks = localVideoRef.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }

        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) { }
        }

        setShowSummaryModal(true);
        setIsSummarizing(true);

        try {
            const finalTranscript = transcriptTextRef.current;
            const res = await saveMeetingSummary(meetingCode, finalTranscript);
            if (res && res.meeting) {
                setSummaryResult(res.meeting);
            }
        } catch (err) {
            console.error("Error generating meeting summary:", err);
        } finally {
            setIsSummarizing(false);
        }
    }



    let getDisplayMediaSuccess = ( stream ) => {
            try {
                window.localStream.getTracks().forEach(track => track.stop())
            }catch(e) {console.log(e)}

            window.localStream = stream;
            localVideoRef.current.srcObject = stream;


            for(let id in connections ){
                if(id === socketIdRef.current) continue;

                connections[id].addStream(window.localStream)
                connections[id].createOffer().then((description) => [
                    connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit("signal",id, JSON.stringify({"sdp": connections[id].localDescription}))
                    })
                    .catch(e => console.log(e))
                ])
                 
            }
            
            stream.getTracks().forEach(track => track.onended =() => {
            setScreen(false)
           

            try{

                let tracks =localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())

            }catch (e){console.log(e)}

            let blackSilence = (...args) => new MediaStream([black(...args),silence()]); 
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;
            

            getUserMedia();
        })
    }

    let getDisplayMedia = () => {
        if(screen){
            if(navigator.mediaDevices.getDisplayMedia){
                navigator.mediaDevices.getDisplayMedia({video: true , audio: true})
                .then(getDisplayMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
            }
          }
    }

    useEffect(() => {
        if(screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])

    let handleScreen = () => {
        setScreen(!screen);
    }
    
    return (
    <div>
        
        {askForUsername === true ?
        
        <div style={{
            minHeight: "100vh",
            background: "radial-gradient(circle at 15% 15%, #1e293b 0%, #0f172a 55%, #080d1a 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "30px 20px"
        }}>
            <Box sx={{
                width: "100%",
                maxWidth: "960px",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 4,
                alignItems: "center",
                justifyContent: "center"
            }}>
                {/* Left Side: Camera Preview Box */}
                <Box sx={{
                    flex: 1,
                    width: "100%",
                    maxWidth: "500px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}>
                    <Box sx={{
                        position: "relative",
                        width: "100%",
                        height: "320px",
                        borderRadius: "20px",
                        overflow: "hidden",
                        bgcolor: "#000",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        boxShadow: "0 20px 45px rgba(0, 0, 0, 0.6)"
                    }}>
                        <video 
                            ref={localVideoRef} 
                            autoPlay 
                            muted 
                            style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }}
                        />

                        {/* Floating mic and video quick toggle over preview */}
                        <Box sx={{
                            position: "absolute",
                            bottom: 16,
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "flex",
                            gap: 2,
                            bgcolor: "rgba(0, 0, 0, 0.6)",
                            backdropFilter: "blur(8px)",
                            px: 2,
                            py: 0.8,
                            borderRadius: "30px",
                            border: "1px solid rgba(255, 255, 255, 0.1)"
                        }}>
                            <IconButton onClick={handleAudio} sx={{ color: audio ? "#ffffff" : "#f87171" }}>
                                {audio ? <MicIcon /> : <MicOffIcon />}
                            </IconButton>
                            <IconButton onClick={handleVideo} sx={{ color: video ? "#ffffff" : "#f87171" }}>
                                {video ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>
                        </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: "#94a3b8", mt: 1.5 }}>
                        Check your camera and microphone before joining
                    </Typography>
                </Box>

                {/* Right Side: Join Meeting Card */}
                <Box sx={{
                    flex: 1,
                    width: "100%",
                    maxWidth: "420px",
                    p: 4,
                    borderRadius: "20px",
                    bgcolor: "rgba(30, 41, 59, 0.6)",
                    backdropFilter: "blur(14px)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.4)"
                }}>
                    <Typography variant="h5" fontWeight="800" sx={{ letterSpacing: "-0.5px" }}>
                        Ready to join?
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5, mb: 3 }}>
                        Room: <span style={{ color: "#38bdf8", fontWeight: "bold" }}>{meetingCode}</span>
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600, mb: 0.8 }}>
                            Your Display Name
                        </Typography>
                        <TextField
                            fullWidth
                            id="lobby-username-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            variant="outlined"
                            placeholder="e.g. Saurabh"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    color: "#ffffff",
                                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                                    borderRadius: "10px",
                                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                                    "&:hover fieldset": { borderColor: "#FF9839" },
                                    "&.Mui-focused fieldset": { borderColor: "#FF9839" }
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && username.trim()) connect();
                            }}
                        />
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={!username.trim()}
                        onClick={connect}
                        sx={{
                            py: 1.4,
                            fontWeight: "bold",
                            fontSize: "1.05rem",
                            borderRadius: "10px",
                            textTransform: "none",
                            background: "linear-gradient(135deg, #FF9839 0%, #EA580C 100%)",
                            boxShadow: "0 4px 18px rgba(234, 88, 12, 0.45)",
                            "&:hover": {
                                background: "linear-gradient(135deg, #ffa756 0%, #f97316 100%)"
                            },
                            "&.Mui-disabled": {
                                background: "rgba(255, 255, 255, 0.12)",
                                color: "rgba(255, 255, 255, 0.3)"
                            }
                        }}
                    >
                        Join Meeting
                    </Button>

                    <Button
                        fullWidth
                        variant="text"
                        onClick={() => routeTo("/home")}
                        sx={{
                            mt: 2,
                            color: "#94a3b8",
                            textTransform: "none",
                            "&:hover": { color: "#ffffff" }
                        }}
                    >
                        Cancel & Return Home
                    </Button>
                </Box>
            </Box>
        </div> : 


        <div className={styles.meetVideoContainer}>

            {/* Room Code & 1-Click Copy Link Header */}
            <div style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                gap: "10px"
            }}>
                <Chip 
                    icon={<ContentCopyIcon style={{ fontSize: "1rem", color: "#fff" }} />}
                    label={`Room: ${meetingCode} (Click to Copy Link)`}
                    onClick={handleCopyMeetingLink}
                    sx={{ 
                        bgcolor: "rgba(0, 0, 0, 0.65)", 
                        color: "#ffffff", 
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "0.85rem",
                        backdropFilter: "blur(6px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        "&:hover": { bgcolor: "rgba(25, 118, 210, 0.85)" }
                    }}
                />
            </div>

             
           {showModal ? <div className={styles.chatRoom}>
            

            <div className={styles.chatContaier}>
            <h1>Chat</h1>

              <div className={styles.chattingDisplay}>

            {messages.length !== 0 ? messages.map((item, index) => {

                console.log(messages)
                return (
                    <div style={{ marginBottom: "20px" }} key={index}>
                        <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                        <p>{item.data}</p>
                    </div>
                )
            }) : <p>No Messages Yet</p>}
   

        </div>

            <div className={styles.chattingArea}>
                {/* {message} */}
            <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your Chat" variant="outlined" />
            <Button variant='contained' onClick={sendMessage}>Send</Button>
            </div>

            </div>
            

           </div> : <></> }
           

            <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style = {{color: "white"}}>
                {(video === true) ? <VideocamIcon/> : <VideocamOffIcon/> }
            </IconButton>

            <IconButton onClick={handleEndCall} style = {{color: "red"}}>
                <CallEndIcon />
            </IconButton>

            <IconButton onClick={handleAudio} style = {{color: "white"}}>
                {(audio === true) ? <MicIcon/> : <MicOffIcon/> }
            </IconButton>

            {screenAvailable === true ? 
            <IconButton onClick={handleScreen} style = {{color: "white"}}>
                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon/>}
            </IconButton>  : <></>   
    }

    <Badge badgeContent = {newMessages} max={999} color='secondary'>
            <IconButton onClick={() => setModal(!showModal)} style = {{color: "white"}}>
                <ChatIcon />
            </IconButton>

    </Badge>

    <Tooltip title={isTranscribing ? "AI Meeting Notes Active (Click to view live notes)" : "AI Notes Paused"}>
        <IconButton onClick={() => setShowLiveNotesModal(true)} style={{ color: isTranscribing ? "#ff9839" : "#aaa" }}>
            <AutoAwesomeIcon />
        </IconButton>
    </Tooltip>

    <Tooltip title="Copy Meeting Link to Invite Others">
        <IconButton onClick={handleCopyMeetingLink} style={{ color: "white" }}>
            <ContentCopyIcon />
        </IconButton>
    </Tooltip>

 </div>
        
            {liveSubtitle && (
                <div style={{
                    position: "absolute",
                    bottom: "12vh",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                    color: "#ffffff",
                    padding: "8px 20px",
                    borderRadius: "24px",
                    fontSize: "0.95rem",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                }}>
                    <AutoAwesomeIcon style={{ color: "#ff9839", fontSize: "1.1rem" }} />
                    <span>{liveSubtitle}</span>
                </div>
            )}

            <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>

    <div className={styles.conferenceView}>
            {videos.map((video) => (
                <div key={video.socketId}>

            {/* <h2>{video.socketId}</h2> */}

            <video
            
            data-socket = {video.socketId}

            ref={ref => {
                if(ref && video.stream){
                    ref.srcObject =video.stream;
                }
            }}

            autoPlay
            >

            </video>
        </div>
            ))}

            </div>
        
        </div>

        }

        {/* Live Notes / Transcript Dialog */}
        <Dialog 
            open={showLiveNotesModal} 
            onClose={() => setShowLiveNotesModal(false)}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AutoAwesomeIcon color="secondary" />
                    <Typography variant="h6" fontWeight="bold">Live Meeting Notes & Transcript</Typography>
                </Box>
                <Chip 
                    label={isTranscribing ? "Transcribing Live" : "Paused"} 
                    color={isTranscribing ? "success" : "default"} 
                    size="small" 
                />
            </DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Zoomora AI automatically captures speech and turns it into real-time transcript notes.
                </Typography>
                <Box sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "#1e1e2f",
                    color: "#e0e0e0",
                    borderRadius: "8px",
                    minHeight: "180px",
                    maxHeight: "300px",
                    overflowY: "auto",
                    fontFamily: "monospace",
                    fontSize: "0.9rem",
                    whiteSpace: "pre-wrap"
                }}>
                    {transcriptText || "Listening for speech... Start speaking into your microphone."}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
                <Button 
                    onClick={() => setIsTranscribing(!isTranscribing)}
                    color={isTranscribing ? "warning" : "success"}
                    variant="outlined"
                    size="small"
                >
                    {isTranscribing ? "Pause AI Notes" : "Resume AI Notes"}
                </Button>
                <Button onClick={() => setShowLiveNotesModal(false)} variant="contained" size="small">
                    Close
                </Button>
            </DialogActions>
        </Dialog>

        {/* Post-Call AI Summary Dialog */}
        <Dialog 
            open={showSummaryModal} 
            maxWidth="md" 
            fullWidth
            disableEscapeKeyDown
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: "bold" }}>
                <AutoAwesomeIcon color="secondary" />
                AI Meeting Summary & Next Steps
            </DialogTitle>
            <DialogContent dividers>
                {isSummarizing ? (
                    <Box textAlign="center" py={5}>
                        <CircularProgress size={50} color="secondary" />
                        <Typography variant="h6" sx={{ mt: 2 }} fontWeight="bold">
                            Generating AI Meeting Summary...
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Analyzing conversation, key decisions, and action items using Gemini AI.
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Meeting Code: <span style={{ color: "#1976d2" }}>{meetingCode}</span>
                            </Typography>
                            <Chip label="Call Completed" color="default" size="small" />
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        {/* Overview */}
                        <Typography variant="h6" fontWeight="bold" sx={{ color: "#2e7d32", mb: 0.5 }}>
                            📋 Overview Summary
                        </Typography>
                        <Box sx={{ p: 2, bgcolor: "#f4fbf7", borderRadius: "8px", mb: 2 }}>
                            <Typography variant="body1">
                                {summaryResult?.summary || (transcriptText.trim() ? "Summary generated from conversation." : "No spoken conversation was recorded for this call.")}
                            </Typography>
                        </Box>

                        {/* Key Decisions */}
                        {summaryResult?.keyDecisions && summaryResult.keyDecisions.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ color: "#1565c0" }}>
                                    💡 Key Decisions
                                </Typography>
                                <List dense sx={{ pl: 1 }}>
                                    {summaryResult.keyDecisions.map((decision, idx) => (
                                        <ListItem key={idx} sx={{ display: "list-item", listStyleType: "disc", pl: 0 }}>
                                            <ListItemText primary={decision} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}

                        {/* Action Items */}
                        {summaryResult?.actionItems && summaryResult.actionItems.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ color: "#d84315" }}>
                                    ✅ Action Items
                                </Typography>
                                <List dense sx={{ pl: 1 }}>
                                    {summaryResult.actionItems.map((action, idx) => (
                                        <ListItem key={idx} sx={{ display: "list-item", listStyleType: "circle", pl: 0 }}>
                                            <ListItemText primary={action} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}

                        {/* Transcript */}
                        {transcriptText && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                                    Captured Transcript:
                                </Typography>
                                <Box sx={{
                                    mt: 1,
                                    p: 1.5,
                                    bgcolor: "#212529",
                                    color: "#f8f9fa",
                                    borderRadius: "8px",
                                    maxHeight: "130px",
                                    overflowY: "auto",
                                    fontFamily: "monospace",
                                    fontSize: "0.85rem",
                                    whiteSpace: "pre-wrap"
                                }}>
                                    {transcriptText}
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button 
                    variant="outlined" 
                    onClick={() => {
                        setShowSummaryModal(false);
                        routeTo("/home");
                    }}
                >
                    Return to Home
                </Button>
                <Button 
                    variant="contained" 
                    color="secondary"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={() => {
                        setShowSummaryModal(false);
                        routeTo("/history");
                    }}
                >
                    View in Meeting History
                </Button>
            </DialogActions>
        </Dialog>

        {/* Copy Link Feedback Snackbar */}
        <Snackbar
            open={copySuccess}
            autoHideDuration={3000}
            onClose={() => setCopySuccess(false)}
            message="Meeting link copied to clipboard!"
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
        />
    </div>

  )
}
