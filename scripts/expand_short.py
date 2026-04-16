#!/usr/bin/env python3
"""Expand the one short article to 1400 words using OpenAI API."""
import json, re, os
from openai import OpenAI

CONTENT_PATH = '/home/ubuntu/unforgiven-love/content/articles.json'
client = OpenAI()

articles = json.load(open(CONTENT_PATH))

for i, a in enumerate(articles):
    if a['slug'] == 'why-forgiveness-doesnt-mean-the-story-didnt-happen':
        print(f"Found article at index {i}: {a['title']}")
        body_text = re.sub(r'<[^>]+>', '', a.get('body', ''))
        wc = len(re.findall(r'\w+', body_text))
        print(f"Current word count: {wc}")
        
        # Extract existing Amazon links to preserve them
        amazon_links = re.findall(r'<p>[^<]*<a[^>]*amazon\.com[^>]*>.*?</a>.*?</p>', a['body'], re.DOTALL)
        print(f"Amazon links to preserve: {len(amazon_links)}")
        
        prompt = f"""Expand this article to exactly 1400 words. Keep the same title, tone, and all existing content.
Add more depth, personal reflection, practical examples, and conversational warmth.

RULES:
- Target exactly 1400 words (body text only, not counting HTML tags)
- Keep the Kalesh voice: warm, direct, conversational, like talking to a friend
- No em-dashes (use ... or - or ~ instead)
- No AI words: profound, transformative, holistic, nuanced, multifaceted, embark, journey (as noun), realm, landscape, beacon, resonate, tapestry, delve, leverage, foster, moreover, furthermore, in conclusion, it's important to note
- Use HTML paragraph tags <p> and heading tags <h2>
- Include at least 2 conversational interjections (Look, Here's the thing, I'll be honest, etc.)
- Vary sentence length: mix short punchy sentences with longer flowing ones
- Do NOT include the title in the body
- Keep all existing Amazon affiliate links exactly as they are

Current body:
{a['body']}"""

        resp = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
            max_tokens=4000
        )
        
        new_body = resp.choices[0].message.content.strip()
        
        # Clean markdown fences
        new_body = re.sub(r'^```html?\s*', '', new_body)
        new_body = re.sub(r'\s*```$', '', new_body)
        
        # Remove em-dashes
        new_body = new_body.replace('\u2014', ' - ').replace('\u2013', ' - ').replace('—', ' - ').replace('–', ' - ')
        
        # Verify Amazon links are still present
        new_amazon = len(re.findall(r'amazon\.com/dp/', new_body))
        if new_amazon < 3:
            # Re-inject the original Amazon links
            for link in amazon_links:
                if link not in new_body:
                    new_body += '\n' + link
        
        new_wc = len(re.findall(r'\w+', re.sub(r'<[^>]+>', '', new_body)))
        print(f"New word count: {new_wc}")
        
        a['body'] = new_body
        break

json.dump(articles, open(CONTENT_PATH, 'w'), indent=None, ensure_ascii=False)
print("Saved!")
