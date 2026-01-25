import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NotificationService } from '@/lib/services/notification-service';

export async function POST(req: NextRequest) {
  try {
    const { proposalId } = await req.json();

    if (!proposalId) {
      return NextResponse.json(
        { success: false, error: 'proposalId is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Ensure the caller is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Load the proposal to validate ownership and get patient/therapist IDs
    const { data: proposal, error: proposalError } = await supabase
      .from('slot_proposals')
      .select('id, patient_id, therapist_id, status')
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json(
        { success: false, error: 'Slot proposal not found' },
        { status: 404 }
      );
    }

    // Only the owning therapist can send proposals
    if (proposal.therapist_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Send notifications (email + WhatsApp + in-app) using shared NotificationService
    await NotificationService.sendSlotProposalNotification(
      supabase as any,
      proposal.id,
      proposal.patient_id,
      proposal.therapist_id
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('send-slot-proposals error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

