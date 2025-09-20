import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import type { Match } from "@/types/valorant";

interface MatchStatsProps {
  matchData: Match & {
    score1?: string;
    score2?: string;
    current_map?: string;
  };
}

export function MatchStats({ matchData }: MatchStatsProps) {
  // Default values for optional fields
  const score1 = matchData.score1 || '0';
  const score2 = matchData.score2 || '0';
  const currentMap = matchData.current_map || 'TBD';
  
  // Default team logos if not provided
  const getTeamLogo = (team: string, logo: unknown): string => {
    if (typeof logo === 'string' && logo.startsWith('http')) {
      return logo;
    }
    return `https://via.placeholder.com/64?text=${team.charAt(0).toUpperCase()}`;
  };
  
  const team1Logo = getTeamLogo(matchData.team1, (matchData as any).team1_logo);
  const team2Logo = getTeamLogo(matchData.team2, (matchData as any).team2_logo);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {matchData.match_event}
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          LIVE • {matchData.time_until_match} • {currentMap}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="relative w-12 h-12 mb-2">
              <Image
                src={team1Logo}
                alt={matchData.team1}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="text-sm font-medium text-center">
              {matchData.team1}
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold flex items-center gap-2">
              <span className={score1 > score2 ? 'text-foreground' : 'text-muted-foreground'}>
                {score1}
              </span>
              <span>:</span>
              <span className={score2 > score1 ? 'text-foreground' : 'text-muted-foreground'}>
                {score2}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {matchData.match_series}
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="relative w-12 h-12 mb-2">
              <Image
                src={team2Logo}
                alt={matchData.team2}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="text-sm font-medium text-center">
              {matchData.team2}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
