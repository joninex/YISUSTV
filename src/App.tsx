import React, { useState, useCallback, useEffect } from 'react';
import { Search, Menu, Upload, Info, Settings } from 'lucide-react';
import { debounce } from 'lodash';
import { VideoPlayer } from './components/VideoPlayer';
import { ChannelList } from './components/ChannelList';
import { Logo } from './components/Logo';
import { PLAYLIST_SOURCES } from './constants';
import type { Channel, Filter } from './types';

function App() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [filter, setFilter] = useState<Filter>({});
  const [recentChannels, setRecentChannels] = useState<Channel[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentChannels');
    if (stored) {
      setRecentChannels(JSON.parse(stored));
    }
  }, []);

  const updateRecentChannels = useCallback((channel: Channel) => {
    setRecentChannels(prev => {
      const filtered = prev.filter(ch => ch.url !== channel.url);
      const updated = [channel, ...filtered].slice(0, 5);
      localStorage.setItem('recentChannels', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const parseM3U = useCallback((content: string): Channel[] => {
    const lines = content.split('\n');
    const channels: Channel[] = [];
    let currentChannel: Partial<Channel> = {};

    lines.forEach((line) => {
      line = line.trim();
      
      if (line.startsWith('#EXTINF:')) {
        const matches = line.match(/tvg-id="([^"]*)".*tvg-name="([^"]*)".*tvg-logo="([^"]*)".*group-title="([^"]*)",(.+)/);
        if (matches) {
          const [, id, name, logo, group, title] = matches;
          currentChannel = {
            name: title.trim(),
            tvg: {
              id,
              name,
              logo,
            },
            category: group,
            country: group.match(/[A-Z]{2}/)?.[0],
            language: group.match(/[a-z]{3}/)?.[0],
            quality: group.match(/\d+p/)?.[0],
          };
        } else {
          const simpleName = line.split(',')[1];
          currentChannel = {
            name: simpleName ? simpleName.trim() : 'Canal sin nombre'
          };
        }
      } else if (line.startsWith('http')) {
        currentChannel.url = line;
        if (currentChannel.name && currentChannel.url) {
          channels.push(currentChannel as Channel);
        }
        currentChannel = {};
      }
    });

    return channels;
  }, []);

  const loadPlaylist = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar la lista');
      const content = await response.text();
      const parsedChannels = parseM3U(content);
      setChannels(parsedChannels);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error loading playlist:', err);
    } finally {
      setLoading(false);
    }
  }, [parseM3U]);

  const debouncedSearch = debounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    updateRecentChannels(channel);
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const filteredChannels = channels.filter((channel) => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filter.category || channel.category === filter.category;
    const matchesCountry = !filter.country || channel.country === filter.country;
    const matchesLanguage = !filter.language || channel.language === filter.language;
    return matchesSearch && matchesCategory && matchesCountry && matchesLanguage;
  });

  const uniqueValues = useCallback((key: keyof Filter) => 
    Array.from(new Set(channels.map(channel => channel[key]).filter(Boolean))).sort()
  , [channels]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <nav className="bg-black/70 backdrop-blur-md border-b border-purple-500/20 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="text-white" />
            </button>
            <Logo />
          </div>

          <div className="relative flex-1 max-w-xl mx-4 hidden md:block">
            <input
              type="text"
              placeholder="Buscar canales..."
              className="w-full bg-white/5 border border-purple-500/20 rounded-lg py-2 px-4 text-white"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500" />
          </div>

          <button
            className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings className="text-white" />
          </button>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        <aside
          className={`${
            showSidebar ? 'translate-x-0' : '-translate-x-full'
          } transform transition-transform duration-200 ease-in-out fixed lg:relative w-80 bg-black/40 backdrop-blur-md border-r border-purple-500/20 h-full z-40 overflow-y-auto`}
        >
          <div className="p-4 space-y-6">
            <div className="md:hidden">
              <input
                type="text"
                placeholder="Buscar canales..."
                className="w-full bg-white/5 border border-purple-500/20 rounded-lg py-2 px-4 text-white mb-4"
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Listas de Canales</h3>
              <div className="space-y-2">
                <button
                  onClick={() => loadPlaylist(PLAYLIST_SOURCES.argentina)}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg transition-transform hover:scale-102 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Cargando...' : 'Canales Argentinos'}
                </button>
                <button
                  onClick={() => loadPlaylist(PLAYLIST_SOURCES.spanish)}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Cargando...' : 'Canales en Español'}
                </button>
                <button
                  onClick={() => loadPlaylist(PLAYLIST_SOURCES.all)}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Cargando...' : 'Todos los Canales'}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {channels.length > 0 && (
              <>
                <div>
                  <h3 className="text-white font-semibold mb-2">Filtros</h3>
                  <div className="space-y-2">
                    <select
                      onChange={(e) => setFilter(prev => ({ ...prev, country: e.target.value || undefined }))}
                      className="w-full bg-white/5 border border-purple-500/20 rounded-lg p-2 text-white"
                      value={filter.country || ''}
                    >
                      <option value="">Todos los países</option>
                      {uniqueValues('country').map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    <select
                      onChange={(e) => setFilter(prev => ({ ...prev, language: e.target.value || undefined }))}
                      className="w-full bg-white/5 border border-purple-500/20 rounded-lg p-2 text-white"
                      value={filter.language || ''}
                    >
                      <option value="">Todos los idiomas</option>
                      {uniqueValues('language').map(language => (
                        <option key={language} value={language}>{language}</option>
                      ))}
                    </select>
                    <select
                      onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value || undefined }))}
                      className="w-full bg-white/5 border border-purple-500/20 rounded-lg p-2 text-white"
                      value={filter.category || ''}
                    >
                      <option value="">Todas las categorías</option>
                      {uniqueValues('category').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-4">
                    Canales ({filteredChannels.length})
                  </h3>
                  <ChannelList
                    channels={filteredChannels}
                    selectedChannel={selectedChannel}
                    onChannelSelect={handleChannelSelect}
                  />
                </div>
              </>
            )}
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {selectedChannel ? (
            <div className="max-w-6xl mx-auto">
              <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg mb-6">
                <VideoPlayer url={selectedChannel.url} title={selectedChannel.name} />
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-lg p-6">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {selectedChannel.name}
                </h2>
                {selectedChannel.category && (
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-500 text-sm">
                    {selectedChannel.category}
                  </span>
                )}
                {selectedChannel.tvg?.url && (
                  <a
                    href={selectedChannel.tvg.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-pink-500 hover:text-pink-400 transition-colors"
                  >
                    <Info size={16} />
                    Ver guía de programación
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white text-center">
              <Upload size={64} className="text-purple-500 mb-6" />
              <h2 className="text-2xl font-bold mb-4">¡Bienvenido a Jesús TV Argentina!</h2>
              <p className="text-lg text-gray-400 max-w-md">
                Selecciona una lista de canales para comenzar a disfrutar de la mejor programación argentina y más
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;