export interface Match {
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

export interface MatchResponse {
  data: {
    status: number;
    segments: Match[];
    upcoming_matches?: Match[];
  };
}

export interface DashboardMatchInfo {
  label: string;
  value: string;
  description: string;
  intent: 'positive' | 'negative' | 'neutral' | 'danger';
  icon: string;
  direction?: 'up' | 'down';
  matchData?: Match;
}
