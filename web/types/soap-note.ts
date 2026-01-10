export interface SoapNote {
    id: string;
    appointment_id: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    is_finalized: boolean;
    edited_by_therapist: boolean;
    created_at: string;
    updated_at: string;
}

export interface SoapSection {
    id: keyof SoapNote;
    title: string;
    icon: React.ReactNode;
    color: string;
    content: string;
}
