import React from 'react';
import { Play, Globe, Flag } from 'lucide-react';
import type { Channel } from '../types';
import { LANGUAGES } from '../constants';

interface ChannelListProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  selectedChannel,
  onChannelSelect,
}) => {
  return (
    <div className="space-y-2">
      {channels.map((channel, index) => (
        <button
          key={index}
          onClick={() => onChannelSelect(channel)}
          className={`w-full p-3 rounded-lg text-left transition-all transform hover:scale-102 ${
            selectedChannel?.url === channel.url
              ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-l-4 border-purple-500'
              : 'hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            {channel.logo || channel.tvg?.logo ? (
              <img
                src={channel.logo || channel.tvg?.logo}
                alt={channel.name}
                className="w-10 h-10 rounded object-contain bg-black/30"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="%23A855F7" stroke="%23A855F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded bg-purple-500/20 flex items-center justify-center">
                <Play size={20} className="text-purple-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {channel.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {channel.country && (
                  <span className="flex items-center gap-1">
                    <Flag size={12} />
                    {channel.country}
                  </span>
                )}
                {channel.language && (
                  <span className="flex items-center gap-1">
                    <Globe size={12} />
                    {LANGUAGES[channel.language as keyof typeof LANGUAGES] || channel.language}
                  </span>
                )}
                {channel.quality && (
                  <span className="bg-purple-500 text-white px-1 rounded">
                    {channel.quality}
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};