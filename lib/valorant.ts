import type { Match, MatchResponse, DashboardMatchInfo } from '../types/valorant';

export interface UpcomingMatches {
  nextMatch: DashboardMatchInfo | null;
  followingMatch: DashboardMatchInfo | null;
}

export async function getUpcomingMatch(): Promise<UpcomingMatches> {
  try {
    const response = await fetch('/api/valorant?q=upcoming');
    if (!response.ok) {
      throw new Error('Failed to fetch match data');
    }
    const data = await response.json();
    
    // Get the next match (first in the array)
    const nextMatchData = data?.data?.segments?.[0];
    const followingMatchData = data?.data?.segments?.[1];
    
    const formatMatchInfo = (match: any, isNext: boolean) => {
      if (!match) return null;
      return {
        label: isNext ? 'NEXT MATCH' : 'FOLLOWING',
        value: `${match.team1}\nvs\n${match.team2}`,
        description: match.time_until_match,
        intent: isNext ? 'negative' : 'neutral',
        icon: 'proccesor',
        direction: 'down',
        matchData: match
      } as const;
    };
    
    return {
      nextMatch: formatMatchInfo(nextMatchData, true),
      followingMatch: formatMatchInfo(followingMatchData, false)
    };
  } catch (error) {
    console.error('Error fetching match data:', error);
    return { nextMatch: null, followingMatch: null };
  }
}

export async function getLiveMatch(): Promise<DashboardMatchInfo | null> {
  try {
    const response = await fetch('/api/valorant?q=live_score');
    if (!response.ok) {
      throw new Error('Failed to fetch live match data');
    }
    const data = await response.json();
    
    // Check if there are any live matches
    const liveMatch = data?.data?.segments?.[0];
    if (!liveMatch) return null;

    return {
      label: 'LIVE NOW',
      value: `${liveMatch.team1} vs ${liveMatch.team2}`,
      description: liveMatch.match_series,
      intent: 'danger',
      icon: 'boom',
      direction: 'up',
      matchData: liveMatch // Keep full match data in case needed
    } as const;
  } catch (error) {
    console.error('Error fetching live match data:', error);
    return null;
  }
}
