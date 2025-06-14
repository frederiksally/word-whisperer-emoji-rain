
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
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Top Players</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          See who is topping the charts in our Word Guessing Game!
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-6 p-6">
        {isLoading && (
          <div className="w-full space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        )}
        {isError && <p className="text-red-500">Could not load the leaderboard.</p>}
        {leaderboard && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry, index) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{entry.player_name}</TableCell>
                  <TableCell className="text-right">{entry.total_score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <Button onClick={() => { playSound('buttonClick'); onPlayAgain(); }} className="mt-4">Play Again</Button>
      </CardContent>
    </Card>
  );
};
