
import re
import sys

def parse_user_stories(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Split by segments starting with #### US-
    segments = re.split(r'#### (US-[A-Z]{2}-\d{3}):', content)
    
    stories = []
    for i in range(1, len(segments), 2):
        id = segments[i]
        rest = segments[i+1]
        
        # Split by next story or end of file
        # We need to extract title, description, and priority
        title_line = rest.split('\n')[0].strip()
        full_title = f"[{id}] {title_line}"
        
        # Extract description (everything up to Priority or Phase)
        # Actually, let's just take the whole block until the next #### or ---
        description_match = re.search(r'^\*\*(.*?)(?=\*\*Phase:|\*\*Priority:|---|$)', rest, re.DOTALL)
        if description_match:
            description = "**" + description_match.group(1).strip()
        else:
            description = rest.strip()
            
        # Extract priority
        priority_match = re.search(r'\*\*Priority:\*\* (Low|Medium|High)', rest)
        if not priority_match:
            priority_match = re.search(r'\*\*Priority:\*\* (.*?)\n', rest)
        if not priority_match:
            priority_match = re.search(r'Priority: (.*?)\n', rest)
            
        priority_str = priority_match.group(1).strip() if priority_match else "Medium"
        
        priority_map = {
            "Urgent": 1,
            "High": 2,
            "Medium": 3,
            "Low": 4
        }
        priority = priority_map.get(priority_str, 3)

        stories.append({
            "id": id,
            "title": full_title,
            "description": description,
            "priority": priority
        })
    
    return stories

if __name__ == "__main__":
    stories = parse_user_stories("/Users/swami/Documents/React_native _Arthi/TherapyFlow_AI_BioSync_User_Stories.md")
    import json
    print(json.dumps(stories))
