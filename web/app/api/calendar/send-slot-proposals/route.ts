import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { NotificationService } from '@/lib/services/notification-service';

type Slot = { start: string; end: string; confidence?: number };

/**
 * Create a Google Meet room via Edge Function, or fallback to placeholder video_rooms row.
 * Updates appointment with video_room_id and meeting_link.
 */
async function ensureMeetForAppointment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  appointmentId: string,
  therapistId: string,
  therapistEmail: string,
  therapistName: string,
  googleAccessToken: string | null
): Promise<void> {
  let videoRoomId: string;
  let meetingLink: string;

  if (googleAccessToken) {
    const { data, error } = await supabase.functions.invoke('create-google-meet-room', {
      body: {
        appointmentId,
        userId: therapistId,
        userEmail: therapistEmail,
        userName: therapistName,
        userRole: 'therapist',
        googleAccessToken,
      },
    });

    if (!error && data?.videoRoom && data?.meetingUrl) {
      videoRoomId = data.videoRoom.id;
      meetingLink = data.meetingUrl;
    } else {
      const fallback = await createPlaceholderVideoRoom(supabase, appointmentId);
      videoRoomId = fallback.id;
      meetingLink = fallback.room_url;
    }
  } else {
    const fallback = await createPlaceholderVideoRoom(supabase, appointmentId);
    videoRoomId = fallback.id;
    meetingLink = fallback.room_url;
  }

  await (supabase.from('appointments') as any)
    .update({ video_room_id: videoRoomId, meeting_link: meetingLink })
    .eq('id', appointmentId);
}

async function createPlaceholderVideoRoom(
  supabase: Awaited<ReturnType<typeof createClient>>,
  appointmentId: string
): Promise<{ id: string; room_url: string }> {
  const meetCode = `${Math.random().toString(36).slice(2, 5)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 5)}`;
  const roomUrl = `https://meet.google.com/${meetCode}`;
  const { data, error } = await (supabase.from('video_rooms') as any)
    .insert({
      appointment_id: appointmentId,
      room_name: `Session-${appointmentId.slice(0, 8)}`,
      room_url: roomUrl,
      provider: 'google_meet',
      google_meet_code: meetCode,
      status: 'created',
      recording_enabled: false,
    })
    .select('id, room_url')
    .single();
  if (error) throw error;
  return { id: data.id, room_url: data.room_url };
}

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

    const { data: proposal, error: proposalError } = await supabase
      .from('slot_proposals')
      .select('id, patient_id, therapist_id, status, proposed_slots')
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json(
        { success: false, error: 'Slot proposal not found' },
        { status: 404 }
      );
    }

    if (proposal.therapist_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const slots = (proposal.proposed_slots as Slot[]) || [];
    if (slots.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No slots selected. Please select at least one slot to send.' },
        { status: 400 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('practice_id, full_name, email')
      .eq('user_id', proposal.therapist_id)
      .single();

    const practiceId = profile?.practice_id ?? null;
    const therapistName = profile?.full_name || 'Therapist';
    const therapistEmail = profile?.email || '';

    let googleAccessToken: string | null = null;
    const { data: googleIntegration } = await (supabase as any)
      .from('calendar_integrations')
      .select('access_token')
      .eq('therapist_id', proposal.therapist_id)
      .eq('provider', 'google')
      .eq('is_connected', true)
      .maybeSingle();
    if (googleIntegration?.access_token) {
      googleAccessToken = googleIntegration.access_token as string;
    }

    // Verify patient profile exists before proceeding
    const { data: patientProfile, error: patientProfileError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .eq('user_id', proposal.patient_id)
      .single();

    if (patientProfileError || !patientProfile) {
      console.error('send-slot-proposals: patient profile not found', {
        patientId: proposal.patient_id,
        error: patientProfileError,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Patient profile not found for patient ID: ${proposal.patient_id}. Please ensure the patient exists in the system.`,
        },
        { status: 404 }
      );
    }

    const createdAppointmentIds: string[] = [];

    for (const slot of slots) {
      const { data: apt, error: insertErr } = await (supabase.from('appointments') as any)
        .insert({
          therapist_id: proposal.therapist_id,
          patient_id: proposal.patient_id,
          practice_id: practiceId,
          start_time: slot.start,
          end_time: slot.end,
          status: 'pending',
          title: 'Proposed session',
          notes: `Proposed via slot proposal ${proposalId}`,
          payment_required: false,
        })
        .select('id')
        .single();

      if (insertErr) {
        console.error('send-slot-proposals: create appointment error', insertErr);
        throw new Error(`Failed to create appointment for slot: ${insertErr.message}`);
      }

      createdAppointmentIds.push(apt.id);

      await ensureMeetForAppointment(
        supabase,
        apt.id,
        proposal.therapist_id,
        therapistEmail,
        therapistName,
        googleAccessToken
      );
    }

    // Only send notification if patient profile exists (we already verified above)
    try {
      await NotificationService.sendSlotProposalNotification(
        supabase as any,
        proposal.id,
        proposal.patient_id,
        proposal.therapist_id
      );
    } catch (notificationError: any) {
      // Log the error but don't fail the entire operation - appointments are already created
      console.error('send-slot-proposals: notification error', notificationError);
      // Continue - appointments are created successfully even if notification fails
    }

    revalidatePath('/therapist/sessions');
    revalidatePath('/therapist/home');

    return NextResponse.json({
      success: true,
      appointmentsCreated: createdAppointmentIds.length,
      appointmentIds: createdAppointmentIds,
    });
  } catch (error: any) {
    console.error('send-slot-proposals error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

