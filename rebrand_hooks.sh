#!/bin/bash

# --- Mobile Renaming ---
MOBILE_HOOKS_DIR="mobile/src/features/therapist/hooks"
mv "$MOBILE_HOOKS_DIR/useMenteeDetail.ts" "$MOBILE_HOOKS_DIR/usePatientDetail.ts"
mv "$MOBILE_HOOKS_DIR/useMenteeGoals.ts" "$MOBILE_HOOKS_DIR/usePatientGoals.ts"
mv "$MOBILE_HOOKS_DIR/useMenteeList.ts" "$MOBILE_HOOKS_DIR/usePatientList.ts"
mv "$MOBILE_HOOKS_DIR/useMentorEarnings.ts" "$MOBILE_HOOKS_DIR/useTherapistEarnings.ts"
mv "$MOBILE_HOOKS_DIR/useMentorNotes.ts" "$MOBILE_HOOKS_DIR/useTherapistNotes.ts"
mv "$MOBILE_HOOKS_DIR/useMentorStats.ts" "$MOBILE_HOOKS_DIR/useTherapistStats.ts"

# --- Web Renaming ---
WEB_HOOKS_DIR="web/hooks"
mv "$WEB_HOOKS_DIR/use-mentor-detail.ts" "$WEB_HOOKS_DIR/use-therapist-detail.ts"
mv "$WEB_HOOKS_DIR/use-mentors.ts" "$WEB_HOOKS_DIR/use-therapists.ts"
mv "$WEB_HOOKS_DIR/use-my-mentors.ts" "$WEB_HOOKS_DIR/use-my-therapists.ts"
mv "$WEB_HOOKS_DIR/use-pending-mentor-requests.ts" "$WEB_HOOKS_DIR/use-pending-therapist-requests.ts"

# --- Content Update ---
# Update all hooks in these directories
sed_i() {
  sed -i '' "$1" "$2"
}

FILES=$(find "$MOBILE_HOOKS_DIR" "$WEB_HOOKS_DIR" -name "*.ts" -o -name "*.tsx")

for FILE in $FILES; do
    echo "Updating $FILE..."
    # Capitalized
    sed_i 's/Mentor/Therapist/g' "$FILE"
    sed_i 's/Mentee/Patient/g' "$FILE"
    
    # Lowercase
    sed_i 's/mentor/therapist/g' "$FILE"
    sed_i 's/mentee/patient/g' "$FILE"
done

echo "Hooks rebranding complete."
