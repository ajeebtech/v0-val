'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Match {
  team1: string;
  team2: string;
  flag1: string;
  flag2: string;
  time_until_match: string;
  match_series: string;
  match_event: string;
  unix_timestamp: string;
  match_page: string;
}

export default function ValorantMatches() {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch both upcoming and live matches in parallel
        const [upcomingRes, liveRes] = await Promise.all([
          fetch('/api/valorant?q=upcoming', { cache: 'no-store' }),
          fetch('/api/valorant?q=live_score', { cache: 'no-store' })
        ]);
        
        // Handle upcoming matches
        if (!upcomingRes.ok) {
          throw new Error(`Failed to fetch upcoming matches: ${upcomingRes.status}`);
        }
        
        const upcomingData = await upcomingRes.json();
        if (upcomingData?.data?.segments) {
          setUpcomingMatches(upcomingData.data.segments.slice(0, 2));
        } else if (upcomingData.error) {
          throw new Error(upcomingData.error);
        } else {
          setUpcomingMatches([]);
        }
        
        // Handle live matches
        if (!liveRes.ok) {
          console.warn('Failed to fetch live matches, showing empty state');
          setLiveMatches([]);
        } else {
          const liveData = await liveRes.json();
          if (liveData?.data?.segments) {
            setLiveMatches(liveData.data.segments);
          } else {
            setLiveMatches([]);
          }
        }
        
      } catch (error) {
        const err = error as Error;
        console.error('Error in fetchMatches:', {
          error: err,
          message: err.message,
          stack: err.stack,
          timestamp: new Date().toISOString()
        });
        setError(err.message || 'Failed to load matches. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMatches, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getFlagEmoji = (flagCode: string) => {
    const flagMap: Record<string, string> = {
      'flag_cn': '🇨🇳',
      'flag_id': '🇮🇩',
      'flag_us': '🇺🇸',
      'flag_kr': '🇰🇷',
      'flag_eu': '🇪🇺',
      'flag_br': '🇧🇷',
      'flag_jp': '🇯🇵',
      'flag_sg': '🇸🇬',
      'flag_ph': '🇵🇭',
      'flag_th': '🇹🇭',
      'flag_vn': '🇻🇳',
      'flag_my': '🇲🇾',
      'flag_tw': '🇹🇼',
      'flag_hk': '🇭🇰',
      'flag_mo': '🇲🇴',
    };
    
    return flagMap[flagCode] || '🏳️';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Error loading matches</span>
          </div>
          <p className="mt-1 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
        </div>
        
        {/* Fallback static content */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This feature requires an internet connection to fetch live match data.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="w-2 h-5 bg-red-500 rounded-full mr-2"></span>
            Live Now
          </h3>
          <div className="space-y-4">
            {liveMatches.map((match, index) => (
              <MatchCard key={`live-${index}`} match={match} isLive={true} getFlagEmoji={getFlagEmoji} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Matches */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Upcoming Matches</h3>
        {upcomingMatches.length > 0 ? (
          <div className="space-y-4">
            {upcomingMatches.map((match, index) => (
              <MatchCard key={`upcoming-${index}`} match={match} isLive={false} getFlagEmoji={getFlagEmoji} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No upcoming matches scheduled</p>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match, isLive, getFlagEmoji }: { match: Match; isLive: boolean; getFlagEmoji: (code: string) => string }) {
  return (
    <a 
      href={match.match_page} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block bg-card border rounded-lg p-4 hover:bg-accent transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">{match.match_event}</div>
        {isLive && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            LIVE
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between py-2">
        <div className="flex-1 text-right pr-4">
          <div className="font-medium">{match.team1}</div>
          <div className="text-sm text-muted-foreground">{getFlagEmoji(match.flag1)}</div>
        </div>
        
        <div className="text-xl font-bold px-4">VS</div>
        
        <div className="flex-1 text-left pl-4">
          <div className="font-medium">{match.team2}</div>
          <div className="text-sm text-muted-foreground">{getFlagEmoji(match.flag2)}</div>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t text-sm text-muted-foreground">
        <div>{match.match_series}</div>
        <div className="font-medium text-foreground">
          {isLive ? 'Live Now' : match.time_until_match}
        </div>
      </div>
    </a>
  );
}
