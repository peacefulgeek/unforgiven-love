#!/usr/bin/env python3
"""Generate 3 starter product spotlight articles for SkimLinks approval."""

import json
import os
from openai import OpenAI

client = OpenAI()
AFFILIATE_TAG = 'spankyspinola-20'

PRODUCTS = [
    {
        'slug': 'why-the-body-keeps-the-score-changed-how-we-understand-forgiveness',
        'title': 'Why "The Body Keeps the Score" Changed How We Understand Forgiveness',
        'category': 'the-body',
        'product': {'name': 'The Body Keeps the Score', 'author': 'Bessel van der Kolk', 'asin': '0143127748'},
        'prompt': 'Write a 1400-word honest editorial review of "The Body Keeps the Score" by Bessel van der Kolk, specifically through the lens of forgiveness work. Explain why this book matters for anyone trying to forgive, how van der Kolk\'s research on trauma and the body connects to the forgiveness process, what the book gets right, what it misses, and who should read it. Write in the voice of a consciousness teacher — direct, embodied, no spiritual bypass. Include the Amazon link naturally. End with a recommendation.',
    },
    {
        'slug': 'the-forgiveness-journal-practice-that-actually-works',
        'title': 'The Forgiveness Journal Practice That Actually Works',
        'category': 'the-forensic-method',
        'product': {'name': 'Moleskine Classic Notebook', 'author': '', 'asin': '8883701127'},
        'prompt': 'Write a 1400-word article about using journaling as a forgiveness practice. Not generic journaling advice — a specific, forensic approach to writing through resentment. Explain the practice step by step, why it works neurologically (writing engages different brain pathways than thinking), common mistakes people make, and how to know when the practice is working. Recommend the Moleskine Classic Notebook as the tool for this practice. Write in the voice of a consciousness teacher — direct, embodied, practical. Include the Amazon link naturally.',
    },
    {
        'slug': 'how-a-singing-bowl-became-my-most-important-forgiveness-tool',
        'title': 'How a Singing Bowl Became My Most Important Forgiveness Tool',
        'category': 'the-body',
        'product': {'name': 'Silent Mind Tibetan Singing Bowl Set', 'author': 'Silent Mind', 'asin': 'B06XHN7VRG'},
        'prompt': 'Write a 1400-word article about using a Tibetan singing bowl in forgiveness practice. Explain how sound vibration affects the nervous system, why it\'s particularly effective for releasing stored resentment in the body, how to use a singing bowl in a forgiveness meditation (step by step), and what to expect. This should feel like a genuine recommendation from someone who uses this tool regularly, not a product review. Write in the voice of a consciousness teacher — direct, embodied, experiential. Include the Amazon link naturally.',
    },
]

def generate_article(product_info):
    slug = product_info['slug']
    title = product_info['title']
    category = product_info['category']
    product = product_info['product']
    prompt = product_info['prompt']
    
    amazon_link = f'https://www.amazon.com/dp/{product["asin"]}?tag={AFFILIATE_TAG}'
    
    system_prompt = """You are writing for The Unforgiven — a publication on forensic forgiveness. 
The author is Kalesh, a consciousness teacher and writer. Write in his voice: direct, embodied, 
no spiritual bypass, grounded in both ancient wisdom and modern research. 

Output ONLY the HTML body content (no <html>, <head>, <body> tags). Use <h2> for sections, 
<p> for paragraphs. Include the Amazon product link naturally in the text with (paid link) after it.
Do NOT use markdown. Output clean HTML only."""

    full_prompt = f"""{prompt}

Amazon link to use: {amazon_link}
Product: {product['name']}
Author: {product.get('author', '')}

Remember: Include (paid link) after the Amazon link. Write 1200-1800 words. HTML only."""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": full_prompt}
        ],
        temperature=0.8,
        max_tokens=4000,
    )
    
    body = response.choices[0].message.content.strip()
    # Clean up any markdown fences
    if body.startswith('```'):
        body = body.split('\n', 1)[1] if '\n' in body else body[3:]
    if body.endswith('```'):
        body = body[:-3]
    body = body.strip()
    
    # Generate meta description
    meta_resp = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": "Write a 150-character meta description for this article. Output only the description text."},
            {"role": "user", "content": f"Title: {title}\nCategory: {category}\nProduct: {product['name']}"}
        ],
        max_tokens=100,
    )
    meta_desc = meta_resp.choices[0].message.content.strip()[:160]
    
    # Build article object
    article = {
        'slug': slug,
        'title': title,
        'metaTitle': f'{title} | The Unforgiven',
        'metaDescription': meta_desc,
        'category': category,
        'dateISO': '2026-03-28T12:00:00Z',
        'readingTime': max(6, len(body.split()) // 250),
        'heroAlt': f'A warm, luminous scene representing {product["name"]} and the forgiveness journey',
        'body': body,
        'faqs': [],
        'toc': [],
        'backlinkType': 'product',
        'hasAffiliateLinks': True,
        'excerpt': meta_desc,
        'heroImage': f'https://unforgiven-love.b-cdn.net/images/{slug}.webp',
        'ogImage': f'https://unforgiven-love.b-cdn.net/og/{slug}.webp',
    }
    
    return article

def main():
    # Load existing articles
    with open('/home/ubuntu/unforgiven-love/content/articles.json', 'r') as f:
        articles = json.load(f)
    
    print(f"Existing articles: {len(articles)}")
    
    for product_info in PRODUCTS:
        print(f"Generating: {product_info['title']}...")
        article = generate_article(product_info)
        
        # Check if slug already exists
        existing = [a for a in articles if a['slug'] == article['slug']]
        if existing:
            print(f"  Replacing existing article")
            articles = [a for a in articles if a['slug'] != article['slug']]
        
        articles.append(article)
        print(f"  Done: {len(article['body'].split())} words")
    
    # Save
    with open('/home/ubuntu/unforgiven-love/content/articles.json', 'w') as f:
        json.dump(articles, f)
    
    print(f"\nTotal articles: {len(articles)}")
    print("Saved articles.json")

if __name__ == '__main__':
    main()
