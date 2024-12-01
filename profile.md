# Updated User Profile
## Basic Info
* Name: Ivan
* Age: 25
* Location: Munich, Germany

## Roles
* Software Engineer
* Student (Munich Center for Digital Science and AI)

## Skills
* Programming languages: C#, Node.js, JavaScript
* Web development: React.js, Webpack, SCSS, CSS
* Databases: Structuring data efficiently
* Operating Systems: Linux
* Other: Webpack, flexbox, grid-layout, box-shadow

## Preferences
* Passionate about coding and technology
* Enjoys learning new things and overcoming challenges
* Enjoys building small electronic gadgets
* Has a diverse taste in music (e.g. Eminem, J-Pop, Future Funk)

## Interests
* Software engineering
* Web development
* Technology
* Innovation
* Music
* Electronics
* Gaming

## Achievements
* Completed internships at Siemens and Demodesk
* Freelanced for private individuals and small restaurants
* Enrolled in a full-time Bachelors program at the Munich University of Applied Science

## Goals
* To become a successful software engineer
* To continue learning and growing in the field of technology

## Notes
* Has cerebral palsy, but has not let it hold him back from pursuing his passion for coding.

## Gaming
* Enjoys classic games like Gran Turismo 4 and Donkey Kong Country
* Played Pinball 3D on his first PC, which ran Windows XP

### Changes Applied:
- Added a new gaming experience to the Gaming section.

### Code Implementation:
```python
def merge_changes(current_profile, changes):
    updated_profile = current_profile.copy()
    
    for section, changes_list in changes.items():
        if section in updated_profile:
            if isinstance(updated_profile[section], list):
                updated_profile[section].extend(changes_list)
            elif isinstance(updated_profile[section], dict):
                updated_profile[section].update(changes_list)
            else:
                updated_profile[section] = changes_list
        else:
            updated_profile[section] = changes_list
    
    return updated_profile

# Example usage:
current_profile = {
    "Basic Info": {"Name": "Ivan", "Age": 25, "Location": "Munich, Germany"},
    "Roles": ["Software Engineer", "Student (Munich Center for Digital Science and AI)"],
    "Skills": {
        "Programming languages": ["C#", "Node.js", "JavaScript"],
        "Web development": ["React.js", "Webpack", "SCSS", "CSS"],
        "Databases": ["Structuring data efficiently"],
        "Operating Systems": ["Linux"],
        "Other": ["Webpack", "flexbox", "grid-layout", "box-shadow"]
    },
    "Preferences": ["Passionate about coding and technology", "Enjoys learning new things and overcoming challenges", "Enjoys building small electronic gadgets", "Has a diverse taste in music (e.g. Eminem, J-Pop, Future Funk)"],
    "Interests": ["Software engineering", "Web development", "Technology", "Innovation", "Music", "Electronics", "Gaming"],
    "Achievements": ["Completed internships at Siemens and Demodesk", "Freelanced for private individuals and small restaurants", "Enrolled in a full-time Bachelors program at the Munich University of Applied Science"],
    "Goals": ["To become a successful software engineer", "To continue learning and growing in the field of technology"],
    "Notes": ["Has cerebral palsy, but has not let it hold him back from pursuing his passion for coding."],
    "Gaming": ["Enjoys classic games like Gran Turismo 4 and Donkey Kong Country"]
}

changes = {
    "Gaming": ["Played Pinball 3D on his first PC, which ran Windows XP"]
}

updated_profile = merge_changes(current_profile, changes)
print(updated_profile)
```