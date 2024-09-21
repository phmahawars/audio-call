import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const AudioChat = () => {
  const socketRef = useRef();
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io("https://server-six-plum.vercel.app", {
      transports: ["websocket"], // Force WebSocket transport
    });

    socketRef.current.on("offer", handleOffer);
    socketRef.current.on("answer", handleAnswer);
    socketRef.current.on("candidate", handleCandidate);

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const startAudioChat = async () => {
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    peerConnectionRef.current = new RTCPeerConnection();

    // Add local tracks to the peer connection
    localStreamRef.current.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, localStreamRef.current);
    });

    // Listen for remote tracks
    peerConnectionRef.current.ontrack = (event) => {
      const remoteAudio = document.createElement("audio");
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.autoplay = true;
      document.body.appendChild(remoteAudio);
    };

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("candidate", event.candidate);
      }
    };

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);
    socketRef.current.emit("offer", offer);

    setIsConnected(true);
  };

  const stopAudioChat = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setIsConnected(false);
  };

  const handleOffer = async (offer) => {
    peerConnectionRef.current = new RTCPeerConnection();

    // Add local tracks to the peer connection
    localStreamRef.current.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, localStreamRef.current);
    });

    // Listen for remote tracks
    peerConnectionRef.current.ontrack = (event) => {
      const remoteAudio = document.createElement("audio");
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.autoplay = true;
      document.body.appendChild(remoteAudio);
    };

    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(offer)
    );
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    socketRef.current.emit("answer", answer);
  };

  const handleAnswer = async (answer) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    }
  };

  const handleCandidate = async (candidate) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Audio Chat</h2>
      <button onClick={startAudioChat} disabled={isConnected}>
        Start Chat
      </button>
      <button onClick={stopAudioChat} disabled={!isConnected}>
        Stop Chat
      </button>
      <div>{isConnected ? <p>Connected</p> : <p>Disconnected</p>}</div>
    </div>
  );
};

export default AudioChat;
