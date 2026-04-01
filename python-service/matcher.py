import sys
import json
from datetime import datetime

def get_overlap(start1, end1, start2, end2):
    """Calculates the overlapping time window between two ranges."""
    # Common formats: "09:00 AM" or "09:00"
    fmt = "%I:%M %p" if "M" in start1.upper() else "%H:%M"
    
    try:
        s1, e1 = datetime.strptime(start1, fmt), datetime.strptime(end1, fmt)
        s2, e2 = datetime.strptime(start2, fmt), datetime.strptime(end2, fmt)

        # Intersection: Latest start to Earliest end
        latest_start = max(s1, s2)
        earliest_end = min(e1, e2)

        if latest_start < earliest_end:
            return {
                "start": latest_start.strftime(fmt),
                "end": earliest_end.strftime(fmt)
            }
    except Exception:
        return None
    return None

def calculate_match_score(current_user, other_user):
    score = 0
    direct_matches = []
    reverse_matches = []
    mutual_slots = []

    # 1️⃣ Skill Matching Logic
    user_a_wants = set(current_user.get('skillsToLearn') or [])
    user_b_knows = set(other_user.get('skillsKnown') or [])
    direct_matches = list(user_a_wants.intersection(user_b_knows))
    score += (len(direct_matches) * 10)

    user_b_wants = set(other_user.get('skillsToLearn') or [])
    user_a_knows = set(current_user.get('skillsKnown') or [])
    reverse_matches = list(user_b_wants.intersection(user_a_knows))
    score += (len(reverse_matches) * 10)

    if direct_matches and reverse_matches:
        score += 20

    # 2️⃣ Smart Availability Check (Range Overlap)
    my_avail = current_user.get('availability') or []
    their_avail = other_user.get('availability') or []
    
    for my_day in my_avail:
        for their_day in their_avail:
            if not my_avail or not their_avail:
             return {
        "score": score, # Still keep skill score
        "matchedSkills": list(set(direct_matches + reverse_matches)),
        "bestTime": "No common availability",
        "hasOverlap": False 
    }
            if my_day.get('date') == their_day.get('date'):
                overlap = get_overlap(
                    my_day.get('start'), my_day.get('end'),
                    their_day.get('start'), their_day.get('end')
                )
                if overlap:
                    mutual_slots.append(f"{my_day.get('date')} ({overlap['start']} - {overlap['end']})")
                    score += 15 # Higher bonus for actual time overlap

    best_time = mutual_slots[0] if mutual_slots else "No overlapping free time, chat and discuss"

    return {
        "score": score,
        "matchedSkills": list(set(direct_matches + reverse_matches)),
        "bestTime": best_time,
        "hasOverlap": len(mutual_slots) > 0 
    }

def main():
    try:
        input_data = json.loads(sys.stdin.read())
        current_user = input_data['currentUser']
        all_users = input_data['allUsers']
        
        matches = []
        for user in all_users:
            if str(user.get('_id')) != str(current_user.get('_id')):
                result = calculate_match_score(current_user, user)
                if result['score'] > 0:
                    matches.append({
                        "userId": str(user['_id']),
                        "name": user.get('name', 'Unknown'),
                        "skillsKnown": user.get('skillsKnown', []),
                        "skillsToLearn": user.get('skillsToLearn', []),
                        **result
                    })
        
        matches = sorted(matches, key=lambda x: x['score'], reverse=True)
        print(json.dumps(matches))
    except Exception:
        print(json.dumps([]))

if __name__ == "__main__":
    main()