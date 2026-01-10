#!/bin/bash

# --- Mobile Components ---
mv mobile/src/components/MenteeCard.tsx mobile/src/components/PatientCard.tsx
mv mobile/src/components/MentorCard.tsx mobile/src/components/TherapistCard.tsx
mv mobile/src/components/PendingMentorRequestCard.tsx mobile/src/components/PendingTherapistRequestCard.tsx

# --- Web Components ---
# web/components/mentor folder -> therapist
mv web/components/mentor web/components/therapist

# --- Web Pages ---
mv "web/app/(main)/mentors" "web/app/(main)/therapists"

# --- Edge Functions ---
mv mobile/supabase/functions/create-managed-mentee mobile/supabase/functions/create-managed-patient

# --- Mobile Screens ---
DIR="mobile/src/features/therapist/screens"
if [ -d "$DIR" ]; then
    mv "$DIR/MentorHomeScreen.tsx" "$DIR/TherapistHomeScreen.tsx"
    mv "$DIR/MenteeListScreen.tsx" "$DIR/PatientListScreen.tsx"
    mv "$DIR/MenteeDetailScreen.tsx" "$DIR/PatientDetailScreen.tsx"
    mv "$DIR/MentorProfileScreen.tsx" "$DIR/TherapistProfileScreen.tsx"
fi

DIR2="mobile/src/features/therapists/screens"
if [ -d "$DIR2" ]; then
    mv "$DIR2/MentorListScreen.tsx" "$DIR2/TherapistListScreen.tsx"
    mv "$DIR2/MentorDetailScreen.tsx" "$DIR2/TherapistDetailScreen.tsx"
fi

echo "Structure rebranding complete."
