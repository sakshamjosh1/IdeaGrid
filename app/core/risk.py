from datetime import date


def calculate_sprint_risk(tasks: list, sprint_end_date=None) -> str:
    if not tasks:
        return "Low"

    total = len(tasks)
    incomplete = [t for t in tasks if t.status != "Done"]
    high_priority_incomplete = [t for t in incomplete if t.priority == "High"]

    incomplete_ratio = len(incomplete) / total
    days_left = None
    if sprint_end_date:
        days_left = (sprint_end_date - date.today()).days

    score = 0

    if incomplete_ratio > 0.7:
        score += 3
    elif incomplete_ratio > 0.4:
        score += 2
    elif incomplete_ratio > 0.2:
        score += 1

    if len(high_priority_incomplete) >= 3:
        score += 3
    elif len(high_priority_incomplete) >= 1:
        score += 2

    if days_left is not None:
        if days_left < 0:
            score += 3
        elif days_left <= 2:
            score += 2
        elif days_left <= 5:
            score += 1

    if score >= 5:
        return "High"
    elif score >= 2:
        return "Medium"
    else:
        return "Low"