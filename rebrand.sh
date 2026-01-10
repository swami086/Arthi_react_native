#!/bin/bash

# Files to update
MOBILE_TYPES="mobile/src/api/types.ts"
WEB_TYPES="web/types/database.ts"
NAV_TYPES="mobile/src/navigation/types.ts"

# Helper for cross-platform sed (Mac vs Linux)
sed_i() {
  sed -i '' "$1" "$2"
}

# --- Update Database Types (Mobile & Web) ---
for FILE in "$MOBILE_TYPES" "$WEB_TYPES"; do
    echo "Updating $FILE..."
    sed_i 's/mentor_mentee_relationships/therapist_patient_relationships/g' "$FILE"
    sed_i 's/mentee_referrals/patient_referrals/g' "$FILE"
    sed_i 's/mentee_invitations/patient_invitations/g' "$FILE"
    sed_i 's/mentee_goals/patient_goals/g' "$FILE"
    sed_i 's/mentor_notes/therapist_notes/g' "$FILE"
    sed_i 's/mentor_id/therapist_id/g' "$FILE"
    sed_i 's/mentee_id/patient_id/g' "$FILE"
    sed_i 's/referring_mentor_id/referring_therapist_id/g' "$FILE"
    sed_i 's/referred_to_mentor_id/referred_to_therapist_id/g' "$FILE"
    sed_i 's/mentee_email/patient_email/g' "$FILE"
    sed_i 's/mentee_name/patient_name/g' "$FILE"
    sed_i 's/mentor_token/therapist_token/g' "$FILE"
    sed_i 's/mentee_token/patient_token/g' "$FILE"
    sed_i 's/mentor_bio_extended/therapist_bio_extended/g' "$FILE"
    sed_i 's/mentor_payout/therapist_payout/g' "$FILE"
    sed_i 's/edited_by_mentor/edited_by_therapist/g' "$FILE"
    sed_i "s/'mentor'/'therapist'/g" "$FILE"
    sed_i "s/'mentee'/'patient'/g" "$FILE"
    sed_i "s/'approve_mentor'/'approve_therapist'/g" "$FILE"
    sed_i "s/'reject_mentor'/'reject_therapist'/g" "$FILE"
    sed_i "s/'assign_mentee'/'assign_patient'/g" "$FILE"
    sed_i 's/MenteeGoal/PatientGoal/g' "$FILE"
    sed_i 's/MentorNote/TherapistNote/g' "$FILE"
    sed_i 's/MentorMenteeRelationship/TherapistPatientRelationship/g' "$FILE"
    sed_i 's/MenteeReferral/PatientReferral/g' "$FILE"
    sed_i 's/MenteeInvitation/PatientInvitation/g' "$FILE"
    sed_i 's/MentorStats/TherapistStats/g' "$FILE"
    sed_i 's/MenteeWithActivity/PatientWithActivity/g' "$FILE"
    sed_i 's/total_mentees/total_patients/g' "$FILE"
done

# --- Update Navigation Types (Mobile) ---
echo "Updating $NAV_TYPES..."
sed_i 's/mentorId/therapistId/g' "$NAV_TYPES"
sed_i 's/mentorName/therapistName/g' "$NAV_TYPES"
sed_i 's/mentorAvatar/therapistAvatar/g' "$NAV_TYPES"
sed_i 's/mentorBio/therapistBio/g' "$NAV_TYPES"
sed_i 's/mentorExpertise/therapistExpertise/g' "$NAV_TYPES"
sed_i 's/menteeId/patientId/g' "$NAV_TYPES"
sed_i 's/menteeName/patientName/g' "$NAV_TYPES"
sed_i 's/menteeAvatar/patientAvatar/g' "$NAV_TYPES"

# Careful with keys used in string literals vs types
sed_i 's/MentorTabParamList/TherapistTabParamList/g' "$NAV_TYPES"
sed_i 's/Mentors: undefined/Therapists: undefined/g' "$NAV_TYPES"
sed_i 's/Mentees: undefined/Patients: undefined/g' "$NAV_TYPES"
sed_i 's/MentorMain:/TherapistMain:/g' "$NAV_TYPES"
sed_i 's/MentorDetail:/TherapistDetail:/g' "$NAV_TYPES"
sed_i 's/MenteeDetail:/PatientDetail:/g' "$NAV_TYPES"
sed_i 's/AdminMentors:/AdminTherapists:/g' "$NAV_TYPES"
sed_i 's/AdminMentees:/AdminPatients:/g' "$NAV_TYPES"
sed_i 's/MentorReview:/TherapistReview:/g' "$NAV_TYPES"
sed_i 's/MenteeDiscovery:/PatientDiscovery:/g' "$NAV_TYPES"
sed_i 's/PendingMentorRequests:/PendingTherapistRequests:/g' "$NAV_TYPES"
sed_i 's/ReferMentee:/ReferPatient:/g' "$NAV_TYPES"
sed_i 's/MenteeOnboarding:/PatientOnboarding:/g' "$NAV_TYPES"
sed_i 's/MentorPaymentDashboard:/TherapistPaymentDashboard:/g' "$NAV_TYPES"

echo "Done."
