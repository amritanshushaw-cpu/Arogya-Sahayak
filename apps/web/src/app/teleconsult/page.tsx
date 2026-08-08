"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Wifi, WifiOff, ArrowLeft } from 'lucide-react';

export default function TeleconsultPage() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [networkDrop, setNetworkDrop] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function setupMedia() {
      if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setErrorMessage('Camera and microphone access are not available in this browser.');
        return;
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = mediaStream;
        setStream(mediaStream);
        setErrorMessage(null);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Error accessing media devices.', err);
        if (!cancelled) {
          setErrorMessage('Unable to access your camera or microphone. Please allow permissions and try again.');
        }
      }
    }

    setupMedia();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const toggleAudio = () => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = !next;
        });
      }
      return next;
    });
  };

  const toggleVideo = () => {
    setIsVideoOff((prev) => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = !next;
        });
      }
      return next;
    });
  };

  const simulateNetworkDrop = () => {
    setNetworkDrop((prev) => {
      const next = !prev;
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = !next;
        });
      }
      return next;
    });
  };

  const endCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    window.location.assign('/dashboard');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white font-sans mesh-backdrop">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" aria-label="Back to Dashboard" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500">
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Teleconsultation</h1>
            <p className="text-xs text-slate-400 font-mono-tech">Dr. Sharma • Apollo Hospital</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold font-mono-tech ${networkDrop ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
          {networkDrop ? <WifiOff size={16} aria-hidden="true" /> : <Wifi size={16} aria-hidden="true" />}
          <span>{networkDrop ? 'Poor Network - Audio Only' : 'Good Network - HD Video'}</span>
        </div>
      </header>

      {/* Video Area */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {/* Remote Video (Doctor) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-4xl mb-4 border-4 border-slate-700">
            👨‍⚕️
          </div>
          <p className="text-lg text-slate-300">Waiting for Doctor to join…</p>
        </div>

        {/* Local Video (ASHA/Patient) */}
        <div className={`absolute bottom-6 right-6 w-32 h-48 md:w-48 md:h-64 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-2 ${networkDrop ? 'border-rose-500/50' : 'border-slate-700'} transition-all duration-300 z-10`}>
          {(isVideoOff || networkDrop) ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mb-2">
                👤
              </div>
              <span className="text-xs font-mono-tech">You</span>
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
      <div className="bg-slate-950 p-6 flex flex-col items-center justify-center gap-4 pb-8 border-t border-slate-800/80">
        {errorMessage && (
          <p className="text-sm text-rose-400 text-center max-w-md">{errorMessage}</p>
        )}
        <div className="flex gap-4">
          <button 
            onClick={toggleAudio}
            aria-label={isAudioMuted ? "Unmute Microphone" : "Mute Microphone"}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 ${isAudioMuted ? 'bg-rose-600 hover:bg-rose-500' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            {isAudioMuted ? <MicOff size={24} aria-hidden="true" /> : <Mic size={24} aria-hidden="true" />}
          </button>
          
          <button 
            onClick={toggleVideo}
            disabled={networkDrop}
            aria-label={isVideoOff ? "Turn Video On" : "Turn Video Off"}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 ${isVideoOff || networkDrop ? 'bg-rose-600 hover:bg-rose-500 opacity-80' : 'bg-slate-800 hover:bg-slate-700'}`}
          >
            {isVideoOff || networkDrop ? <VideoOff size={24} aria-hidden="true" /> : <Video size={24} aria-hidden="true" />}
          </button>

          <button 
            onClick={endCall}
            aria-label="End Teleconsultation Call"
            className="w-14 h-14 rounded-full flex items-center justify-center bg-rose-600 hover:bg-rose-500 transition-colors shadow-[0_0_15px_rgba(225,29,72,0.5)] focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <PhoneOff size={24} aria-hidden="true" />
          </button>
        </div>
        
        <button 
          onClick={simulateNetworkDrop}
          aria-label="Toggle Simulated Network Drop"
          className="text-xs text-slate-400 underline hover:text-slate-200 mt-2 font-mono-tech focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1"
        >
          {networkDrop ? "Restore Network" : "Simulate Network Drop"}
        </button>
      </div>
    </div>
  );
}
