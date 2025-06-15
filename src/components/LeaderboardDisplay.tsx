
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from './ui/button';
import { useSound } from '@/contexts/SoundContext';

type LeaderboardEntry = {
  id: string;
  player_name: string;
  total_score: number;
  created_at: string;
};

const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const { data, error } = await supabase
    .from('match_leaderboard')
    .select('id, player_name, total_score, created_at')
    .order('total_score', { ascending: false })
    .limit(20);

  if (error) {
    toast.error('Failed to fetch leaderboard data.');
    console.error('Leaderboard fetch error:', error);
    throw new Error('Failed to fetch leaderboard');
  }
  return data;
};

export const LeaderboardDisplay = ({ onPlayAgain }: { onPlayAgain: () => void }) => {
  const { data: leaderboard, isLoading, isError } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
  });
  const { playSound } = useSound();

  return (
    <Card className="w-full max-w-lg mx-auto bg-stone-900/80 border-amber-500/50 text-white font-pilcrow backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-3xl font-boxing text-amber-400 text-center tracking-wider" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>The GUESS-OFF LEGENDS</CardTitle>
        <CardDescription className="text-center text-white/70">
          These are the sharpshooters who tamed Tex. For now.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6 p-4 md:p-6">
        {isLoading && (
          <div className="w-full space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full bg-white/10" />)}
          </div>
        )}
        {isError && <p className="text-red-400">Could not load the leaderboard.</p>}
        {leaderboard && (
          <Table>
            <TableHeader>
              <TableRow className="border-b-amber-500/30">
                <TableHead className="w-[50px] text-amber-400/80">Rank</TableHead>
                <TableHead className="text-amber-400/80">Legend</TableHead>
                <TableHead className="text-right text-amber-400/80">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry, index) => (
                <TableRow key={entry.id} className="border-b-amber-500/20">
                  <TableCell className="font-medium text-amber-400">{index + 1}</TableCell>
                  <TableCell className="font-bold">{entry.player_name}</TableCell>
                  <TableCell className="text-right text-lg font-bold">{entry.total_score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Button onClick={() => { playSound('buttonClick'); onPlayAgain(); }} size="lg" className="mt-4 font-boxing text-2xl uppercase bg-amber-500 hover:bg-amber-600 text-stone-900 animate-button-pulse">Go Again</Button>
      </CardContent>
    </Card>
  );
};
