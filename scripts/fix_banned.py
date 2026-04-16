#!/usr/bin/env python3
"""Fix the last banned word occurrence."""
import json, re

CONTENT_PATH = '/home/ubuntu/unforgiven-love/content/articles.json'
articles = json.load(open(CONTENT_PATH))

replacements = {
    'profound': ['deep', 'genuine', 'real', 'striking', 'powerful'],
}

import random
for a in articles:
    body = a.get('body', '')
    for word, alts in replacements.items():
        if re.search(r'\b' + word + r'\b', body, re.IGNORECASE):
            def replace_match(m):
                alt = random.choice(alts)
                # Preserve capitalization
                if m.group()[0].isupper():
                    return alt.capitalize()
                return alt
            body = re.sub(r'\b' + word + r'\b', replace_match, body, flags=re.IGNORECASE)
            print(f"Fixed '{word}' in {a['slug']}")
    a['body'] = body

json.dump(articles, open(CONTENT_PATH, 'w'), indent=None, ensure_ascii=False)
print("Done!")
