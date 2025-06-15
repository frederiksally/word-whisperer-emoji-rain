import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import {
  AlertDialog,
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
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<LeaderboardFormValues>({
    resolver: zodResolver(leaderboardSchema),
    defaultValues: {
      playerName: '',
      email: '',
    },
  });
  const queryClient = useQueryClient();

  const processSubmission = async (values: LeaderboardFormValues) => {
    const submissionData = {
      player_name: values.playerName,
      email: values.email || null,
      total_score: totalScore,
    };
    
    console.log('Attempting to submit to leaderboard with data:', submissionData);

    try {
      const { data, error } = await supabase
        .from('match_leaderboard')
        .insert(submissionData)
        .select();

      if (error) {
        console.error('Supabase leaderboard insert error:', error);
        throw error;
      }
      
      console.log('Successfully submitted score. Response:', data);

      toast.success('Your score has been added to the leaderboard!');
      await queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      reset();
      onClose();

    } catch (error) {
      toast.error('Failed to submit score. Please try again.');
      console.error('Caught error during leaderboard submission:', error);
    }
  };

  const handleClose = () => {
    onClose();
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={!isSubmitting ? onClose : undefined}>
      <AlertDialogContent className="font-pilcrow border-4 border-amber-800 bg-[#fefae0] text-stone-800 shadow-2xl shadow-black/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-boxing text-4xl text-amber-900">Well, I'll be...</AlertDialogTitle>
          <AlertDialogDescription className="text-stone-700 text-base">
            You actually did it, partner! Your score of <strong>{totalScore}</strong> has earned you a spot among the legends. Go on, carve your name into the history books.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(processSubmission)} className="space-y-4">
          <div>
            <Label htmlFor="playerName" className="text-amber-900/80">Your Legend Name</Label>
            <Input id="playerName" {...register('playerName')} className="border-amber-700/50 bg-white/50 focus:border-amber-700 focus:ring-amber-700" />
            {errors.playerName && <p className="text-red-600 text-sm mt-1">{errors.playerName.message}</p>}
          </div>
          <div>
            <Label htmlFor="email" className="text-amber-900/80">Email (Optional)</Label>
            <Input id="email" type="email" {...register('email')} placeholder="For rewards and event news, maybe." className="border-amber-700/50 bg-white/50 focus:border-amber-700 focus:ring-amber-700" />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <AlertDialogFooter>
             <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="border-amber-800/50 hover:bg-amber-800/10">
                Maybe Later
            </Button>
            <Button type="submit" disabled={isSubmitting} className="font-boxing bg-amber-600 hover:bg-amber-700 text-stone-900 text-lg">
              {isSubmitting ? 'Carving...' : 'Claim My Spot!'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
