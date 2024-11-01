import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

interface VideoPlayerProps {
  url: string;
  title: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Plyr
    playerRef.current = new Plyr(videoRef.current, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'captions',
        'settings',
        'pip',
        'airplay',
        'fullscreen',
      ],
      settings: ['quality', 'speed'],
      quality: { default: 720, options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240] },
    });

    // Setup HLS if the URL is an m3u8 stream
    if (Hls.isSupported() && url.includes('.m3u8')) {
      hlsRef.current = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        progressive: true,
        liveSyncDurationCount: 3,
        manifestLoadingTimeOut: 10000,
      });
      
      hlsRef.current.loadSource(url);
      hlsRef.current.attachMedia(videoRef.current);
      
      hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(() => {
          console.log('Autoplay prevented');
        });
      });

      hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hlsRef.current?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hlsRef.current?.recoverMediaError();
              break;
            default:
              hlsRef.current?.destroy();
              break;
          }
        }
      });
    } 
    // Fallback for native HLS support (Safari, iOS)
    else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = url;
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current?.play().catch(() => {
          console.log('Autoplay prevented');
        });
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [url]);

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        crossOrigin="anonymous"
        title={title}
      >
        <source src={url} type="application/x-mpegURL" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};