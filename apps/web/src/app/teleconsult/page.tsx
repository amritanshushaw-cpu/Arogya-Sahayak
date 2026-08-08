"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Wifi, WifiOff, ArrowLeft } from 'lucide-react';

export default function TeleconsultPage() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [networkDrop, setNetworkDrop] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    async function setupMedia() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    }
    setupMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const simulateNetworkDrop = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = networkDrop; // If networkDrop was true, we are recovering, so enable it (unless they manually toggled, but let's keep it simple)
      });
    }
    setNetworkDrop(!networkDrop);
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    window.location.href = '/dashboard';
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-slate-800 shadow-md z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Teleconsultation</h1>
            <p className="text-xs text-slate-400">Dr. Sharma • Apollo Hospital</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${networkDrop ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
          {networkDrop ? <WifiOff size={16} /> : <Wifi size={16} />}
          {networkDrop ? 'Poor Network - Audio Only' : 'Good Network - HD Video'}
        </div>
      </header>

      {/* Video Area */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {/* Remote Video (Doctor) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
          <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center text-4xl mb-4 border-4 border-slate-600">
            👨‍⚕️
          </div>
          <p className="text-lg text-slate-300 animate-pulse">Waiting for Doctor to join...</p>
        </div>

        {/* Local Video (ASHA/Patient) */}
        <div className={`absolute bottom-6 right-6 w-32 h-48 md:w-48 md:h-64 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-2 ${networkDrop ? 'border-red-500/50' : 'border-slate-700'} transition-all duration-300 z-10`}>
          {(isVideoOff || networkDrop) ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mb-2">
                👤
              </div>
              <span className="text-xs">You</span>
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 p-6 flex flex-col items-center justify-center gap-4 pb-8">
        <div className="flex gap-4">
          <button 
            onClick={toggleAudio}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            {isAudioMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <button 
            onClick={toggleVideo}
            disabled={networkDrop}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoOff || networkDrop ? 'bg-red-500 hover:bg-red-600 opacity-80' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            {isVideoOff || networkDrop ? <VideoOff size={24} /> : <Video size={24} />}
          </button>

          <button 
            onClick={endCall}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)]"
          >
            <PhoneOff size={24} />
          </button>
        </div>
        
        <button 
          onClick={simulateNetworkDrop}
          className="text-xs text-slate-400 underline hover:text-slate-200 mt-2"
        >
          {networkDrop ? "Restore Network" : "Simulate Network Drop"}
        </button>
      </div>
    </div>
  );
}
