import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Settings } from 'lucide-react';

interface ToggleOption {
  id: string;
  label: string;
  enabled: boolean;
}

const InteractiveDemo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [viralScore, setViralScore] = useState(98);
  const [toggles, setToggles] = useState<ToggleOption[]>([
    { id: 'frame-faces', label: 'Frame Faces', enabled: true },
    { id: 'ai-broll', label: 'AI B-Roll', enabled: true },
    { id: 'remove-silences', label: 'Remove Silences', enabled: false },
    { id: 'remove-fillers', label: 'Remove Fillers', enabled: false },
    { id: 'enhance-audio', label: 'Enhance Audio', enabled: true },
  ]);

  const handleToggle = (id: string) => {
    setToggles(prev => 
      prev.map(toggle => 
        toggle.id === id ? { ...toggle, enabled: !toggle.enabled } : toggle
      )
    );
    
    // Simulate viral score change based on enabled features
    const newToggles = toggles.map(toggle => 
      toggle.id === id ? { ...toggle, enabled: !toggle.enabled } : toggle
    );
    const enabledCount = newToggles.filter(t => t.enabled).length;
    const baseScore = 78;
    const newScore = Math.min(100, baseScore + (enabledCount * 4) + Math.floor(Math.random() * 5));
    setViralScore(newScore);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    video.currentTime = newTime;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted) {
      video.muted = false;
      video.volume = volume;
    } else {
      video.muted = true;
    }
  };

  return (
    <div id="interactive-demo" className="relative w-full bg-white py-20"><div className="max-w-6xl mx-auto px-4 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        {/* Main Title */}
        <div className="text-center mb-12">
          <h1 className="text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] font-serif text-black italic mb-8 md:mb-12 text-center px-4 relative z-10 denton-condensed">
            Interactive<br />Demo
          </h1>
        </div>

        <div className="relative flex flex-col lg:flex-row gap-6 items-center justify-center -mt-24">
          {/* Controls Panel */}
          <div className="absolute -left-36 top-1/2 transform -translate-y-1/2 bg-gray-100 rounded-2xl p-4 border border-gray-200 shadow-2xl w-[280px] h-[420px] z-10">
            <h3 className="text-gray-900 text-xl font-semibold mb-4">Toggle to try edits</h3>
            <div className="space-y-4">
              {toggles.map((toggle) => (
                <div key={toggle.id} className="flex items-center justify-between">
                  <span className="text-gray-700 text-base font-medium">{toggle.label}</span>
                  <button
                    onClick={() => handleToggle(toggle.id)}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                      toggle.enabled
                        ? 'gradient-silver'
                        : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 ${
                        toggle.enabled ? 'left-6' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Video Player Mockup */}
          <div className="relative z-20">
            <div className="bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800 w-[350px] h-[620px]">
              <div className="w-full h-full relative rounded-3xl overflow-hidden">
                {/* Video element */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="/clip1.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Video Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/70 rounded-full px-4 py-2">
                  <button onClick={togglePlay} className="text-white hover:text-purple-400 transition-colors">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <div
                    className="w-32 h-1 bg-white/30 rounded-full cursor-pointer relative"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-white rounded-full transition-all duration-100"
                      style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                    ></div>
                  </div>
                  <button onClick={toggleMute} className="text-white hover:text-purple-400 transition-colors">
                    <Volume2 size={16} />
                  </button>
                  <Settings size={16} className="text-white" />
                </div>
              </div>
            </div>

            {/* Viral Score */}
            <div className="absolute top-1/2 -right-36 transform -translate-y-1/2 bg-white rounded-2xl px-8 py-4 shadow-2xl border border-gray-200 flex flex-col justify-center denton-condensed">
              <div className="text-center">
                <div className="text-[80px] font-bold text-gray-900">{viralScore}<span className="text-[48px] text-gray-500">/100</span></div>
                <div className="text-[24px] text-gray-500 font-medium">virality score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-8">
          <p className="text-3xl font-bold text-gray-900 mb-2">Billie Eilish
          <span className="text-gray-600"> master class awards chatter</span>
          </p>
        </div>
      </div>
    </div></div>
  );
};

export default InteractiveDemo;