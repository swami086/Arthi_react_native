#!/bin/bash

SERVICES=(
  "mobile/src/api/therapistService.ts"
  "mobile/src/api/relationshipService.ts"
  "mobile/src/api/adminService.ts"
  "mobile/src/api/appointmentService.ts"
  "mobile/src/api/paymentService.ts"
  "mobile/src/api/videoService.ts"
  "mobile/src/api/recordingService.ts"
  "mobile/src/api/whatsappService.ts"
  "web/lib/services/therapist-service.ts"
  "web/lib/utils/therapist-filters.ts"
)

sed_i() {
  sed -i '' "$1" "$2"
}

for FILE in "${SERVICES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "Updating $FILE..."
    # Capitalized first (CamelCase/Types)
    sed_i 's/Mentor/Therapist/g' "$FILE"
    sed_i 's/Mentee/Patient/g' "$FILE"
    
    # Lowercase next (variables/db columns)
    sed_i 's/mentor/therapist/g' "$FILE"
    sed_i 's/mentee/patient/g' "$FILE"

    # Fix any specific overrides or mistakes if known
    # e.g. if 'employment' became 'eploipatient'? No, 'mentee' is unique.
    
    # Fix import paths that referred to old filenames (which we renamed)
    # e.g. './mentorService' -> './therapistService' is handled by 's/mentor/therapist/g'
    # './mentee-card' -> './patient-card' handled by 's/mentee/patient/g'
  else
    echo "Warning: $FILE not found"
  fi
done

echo "Services rebranding complete."
