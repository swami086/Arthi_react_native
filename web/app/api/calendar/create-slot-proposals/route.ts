import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { patientId, slots } = await req.json();

    if (!patientId || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json(
        { success: false, error: 'patientId and at least one slot are required' },
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

    const therapistId = user.id;

    // Normalize slots and cap at 5, mirroring the Deno tool behaviour
    const normalizedSlots = (slots as any[])
      .slice(0, 5)
      .map((slot) => ({
        start: slot.start,
        end: slot.end,
        confidence:
          typeof slot.confidence === 'number'
            ? slot.confidence
            : 0.8,
      }));

    const { data, error } = await supabase
      .from('slot_proposals')
      .insert({
        patient_id: patientId,
        therapist_id: therapistId,
        proposed_slots: normalizedSlots,
        status: 'pending',
        expires_at: new Date(
          Date.now() + 48 * 60 * 60 * 1000
        ).toISOString(), // 48 hours
      })
      .select()
      .single();

    if (error) {
      console.error('create-slot-proposals Supabase error:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to create slot proposals' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      proposalId: data.id,
      expiresAt: data.expires_at,
      slots: normalizedSlots,
    });
  } catch (error: any) {
    console.error('create-slot-proposals error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

