#!/bin/bash

DIRS=(
  "mobile/src"
  "web/app"
  "web/components"
  "web/lib"
  "mobile/supabase/functions"
)

sed_i() {
  sed -i '' "$1" "$2"
}

for DIR in "${DIRS[@]}"; do
  if [ -d "$DIR" ]; then
    echo "Processing $DIR..."
    find "$DIR" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -print0 | xargs -0 sed -i '' -e 's/Mentor/Therapist/g' -e 's/Mentee/Patient/g' -e 's/mentor/therapist/g' -e 's/mentee/patient/g'
  else
    echo "Warning: Directory $DIR not found."
  fi
done

echo "Content rebranding complete."
