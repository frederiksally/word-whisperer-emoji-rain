import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSound } from '@/contexts/SoundContext';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const leaderboardSchema = z.object({
  playerName: z.string().min(2, 'Name must be at least 2 characters.').max(50, 'Name is too long.'),
  email: z.string().email('Please enter a valid email.').optional().or(z.literal('')),
});

type LeaderboardFormValues = z.infer<typeof leaderboardSchema>;

interface Props {
  isOpen: boolean;
  totalScore: number;
  onClose: () => void;
}

export const LeaderboardPromptDialog = ({ isOpen, totalScore, onClose }: Props) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LeaderboardFormValues>({
    resolver: zodResolver(leaderboardSchema),
  });
  const { playSound } = useSound();

  const onSubmit = async (values: LeaderboardFormValues) => {
    const { error } = await supabase.from('match_leaderboard').insert({
      player_name: values.playerName,
      email: values.email || null,
      total_score: totalScore,
    });

    if (error) {
      toast.error('Failed to submit score. Please try again.');
      console.error('Leaderboard submission error:', error);
    } else {
      toast.success('Your score has been added to the leaderboard!');
      onClose();
    }
  };

  const handleFormSubmit = handleSubmit(async (values) => {
    playSound('buttonClick');
    await onSubmit(values);
  });

  const handleClose = () => {
    playSound('buttonClick');
    onClose();
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>You made the Leaderboard!</AlertDialogTitle>
          <AlertDialogDescription>
            Congratulations! Your score of <strong>{totalScore}</strong> is high enough for the top 20.
            Enter your name to be displayed on the leaderboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <Label htmlFor="playerName">Player Name</Label>
            <Input id="playerName" {...register('playerName')} />
            {errors.playerName && <p className="text-red-500 text-sm mt-1">{errors.playerName.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email (Optional)</Label>
            <Input id="email" type="email" {...register('email')} placeholder="For notifications on special events"/>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <AlertDialogFooter>
             <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Skip
            </Button>
            <AlertDialogAction type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit to Leaderboard'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
