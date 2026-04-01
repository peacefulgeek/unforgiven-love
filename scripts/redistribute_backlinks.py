#!/usr/bin/env python3
"""
Redistribute backlinks across all 300 articles per the new targets:
- 14% → kalesh (link to kalesh.love) 
- 33% → product (Amazon affiliate link with spankyspinola-20 tag)
- 23% → org (nofollow link to professional org/research institution)
- 30% → internal-only (no outbound links)

Rules:
- Product links are priority — add relevant Amazon product link where it makes sense
- Prefer books by researchers/experts named in the article
- Make product recommendation feel helpful
- Every article keeps its existing 3-5 internal cross-links
- Don't change titles, core structure, images, or main body text
"""

import json
import re
import random

AFFILIATE_TAG = 'spankyspinola-20'

# Real Amazon products mapped to article topics
PRODUCT_LINKS = {
    'the-lie': [
        {'name': 'Forgive for Good', 'author': 'Dr. Fred Luskin', 'asin': '0062517201'},
        {'name': 'Radical Forgiveness', 'author': 'Colin Tipping', 'asin': '1591797640'},
        {'name': 'The Book of Forgiving', 'author': 'Desmond Tutu', 'asin': '0062203576'},
        {'name': 'Forgiving What You Can\'t Forget', 'author': 'Lysa TerKeurst', 'asin': '0718039874'},
        {'name': 'Forgive and Forget', 'author': 'Lewis B. Smedes', 'asin': '0061285826'},
    ],
    'the-forensic-method': [
        {'name': 'Forgive for Good', 'author': 'Dr. Fred Luskin', 'asin': '0062517201'},
        {'name': 'The Forgiveness Workbook', 'author': 'Eileen Barker', 'asin': '1641524391'},
        {'name': 'Radical Forgiveness', 'author': 'Colin Tipping', 'asin': '1591797640'},
        {'name': 'The Self-Compassion Workbook', 'author': 'Kristin Neff', 'asin': '1462526780'},
        {'name': 'Moleskine Classic Notebook', 'author': '', 'asin': '8883701127'},
    ],
    'the-body': [
        {'name': 'The Body Keeps the Score', 'author': 'Bessel van der Kolk', 'asin': '0143127748'},
        {'name': 'Waking the Tiger', 'author': 'Peter Levine', 'asin': '155643233X'},
        {'name': 'The Myth of Normal', 'author': 'Gabor Maté', 'asin': '0593083881'},
        {'name': 'Acupressure Mat and Pillow Set', 'author': 'ProsourceFit', 'asin': 'B00BMS4GEG'},
        {'name': 'Tibetan Singing Bowl Set', 'author': 'Silent Mind', 'asin': 'B06XHN7VRG'},
        {'name': 'Weighted Blanket', 'author': 'YnM', 'asin': 'B073429DV2'},
        {'name': 'Foam Roller', 'author': 'LuxFit', 'asin': 'B00KAEJ51A'},
        {'name': 'TheraCane Massager', 'author': '', 'asin': 'B000PRMCJU'},
    ],
    'the-specific': [
        {'name': 'It Didn\'t Start with You', 'author': 'Mark Wolynn', 'asin': '1101980389'},
        {'name': 'The Self-Compassion Workbook', 'author': 'Kristin Neff', 'asin': '1462526780'},
        {'name': 'When Things Fall Apart', 'author': 'Pema Chödrön', 'asin': '1570629692'},
        {'name': 'Forgiving What You Can\'t Forget', 'author': 'Lysa TerKeurst', 'asin': '0718039874'},
        {'name': 'The Book of Forgiving', 'author': 'Desmond Tutu', 'asin': '0062203576'},
    ],
    'the-liberation': [
        {'name': 'When Things Fall Apart', 'author': 'Pema Chödrön', 'asin': '1570629692'},
        {'name': 'The Myth of Normal', 'author': 'Gabor Maté', 'asin': '0593083881'},
        {'name': 'Radical Forgiveness', 'author': 'Colin Tipping', 'asin': '1591797640'},
        {'name': 'Zafu Meditation Cushion', 'author': 'Retrospec', 'asin': 'B07GXCF76X'},
        {'name': 'Essential Oil Diffuser', 'author': 'ASAKUKI', 'asin': 'B07C1NVNKQ'},
    ],
}

# Nofollow org links by category
ORG_LINKS = {
    'the-lie': [
        {'name': 'Greater Good Science Center', 'url': 'https://greatergood.berkeley.edu'},
        {'name': 'Stanford Forgiveness Project', 'url': 'https://learningtoforgive.com'},
        {'name': 'American Psychological Association', 'url': 'https://www.apa.org'},
        {'name': 'International Forgiveness Institute', 'url': 'https://internationalforgiveness.com'},
    ],
    'the-forensic-method': [
        {'name': 'Stanford Forgiveness Project', 'url': 'https://learningtoforgive.com'},
        {'name': 'Greater Good Science Center', 'url': 'https://greatergood.berkeley.edu'},
        {'name': 'American Psychological Association', 'url': 'https://www.apa.org'},
        {'name': 'National Institute of Mental Health', 'url': 'https://www.nimh.nih.gov'},
    ],
    'the-body': [
        {'name': 'National Center for Complementary and Integrative Health', 'url': 'https://www.nccih.nih.gov'},
        {'name': 'Somatic Experiencing International', 'url': 'https://traumahealing.org'},
        {'name': 'American Institute of Stress', 'url': 'https://www.stress.org'},
        {'name': 'HeartMath Institute', 'url': 'https://www.heartmath.org'},
    ],
    'the-specific': [
        {'name': 'National Alliance on Mental Illness', 'url': 'https://www.nami.org'},
        {'name': 'American Association for Marriage and Family Therapy', 'url': 'https://www.aamft.org'},
        {'name': 'National Domestic Violence Hotline', 'url': 'https://www.thehotline.org'},
        {'name': 'SAMHSA', 'url': 'https://www.samhsa.gov'},
    ],
    'the-liberation': [
        {'name': 'Greater Good Science Center', 'url': 'https://greatergood.berkeley.edu'},
        {'name': 'Mind & Life Institute', 'url': 'https://www.mindandlife.org'},
        {'name': 'Center for Contemplative Mind in Society', 'url': 'https://www.contemplativemind.org'},
        {'name': 'International Forgiveness Institute', 'url': 'https://internationalforgiveness.com'},
    ],
}

def make_amazon_link(product):
    return f'https://www.amazon.com/dp/{product["asin"]}?tag={AFFILIATE_TAG}'

def add_product_link(article, product):
    """Add a product recommendation near the end of the article body, before the last paragraph."""
    body = article['body']
    link = make_amazon_link(product)
    author_text = f' by {product["author"]}' if product.get('author') else ''
    
    recommendation = f'<p style="background:#FFF8E7;border:1px solid #E8DFD4;padding:1rem;border-radius:6px;font-size:0.95rem"><strong>Recommended resource:</strong> <a href="{link}" target="_blank">{product["name"]}</a>{author_text} is a valuable companion for this work. (paid link)</p>'
    
    # Insert before the last </p> or before internal links section
    # Look for the "Related articles" or similar section
    internal_links_pattern = r'(<h\d[^>]*>(?:Related|Further|Continue|More|Explore)[^<]*</h\d>)'
    match = re.search(internal_links_pattern, body, re.IGNORECASE)
    if match:
        insert_pos = match.start()
        body = body[:insert_pos] + recommendation + '\n' + body[insert_pos:]
    else:
        # Insert before the last paragraph
        last_p = body.rfind('</p>')
        if last_p > 0:
            body = body[:last_p + 4] + '\n' + recommendation + body[last_p + 4:]
        else:
            body += '\n' + recommendation
    
    article['body'] = body
    article['hasAffiliateLinks'] = True
    return article

def add_org_link(article, org):
    """Add a nofollow org link in the article body."""
    body = article['body']
    link_html = f'<p>For further research, the <a href="{org["url"]}" target="_blank" rel="nofollow">{org["name"]}</a> provides additional evidence-based resources on this topic.</p>'
    
    # Insert before internal links section or near the end
    internal_links_pattern = r'(<h\d[^>]*>(?:Related|Further|Continue|More|Explore)[^<]*</h\d>)'
    match = re.search(internal_links_pattern, body, re.IGNORECASE)
    if match:
        insert_pos = match.start()
        body = body[:insert_pos] + link_html + '\n' + body[insert_pos:]
    else:
        last_p = body.rfind('</p>')
        if last_p > 0:
            body = body[:last_p + 4] + '\n' + link_html + body[last_p + 4:]
        else:
            body += '\n' + link_html
    
    article['body'] = body
    return article

def update_kalesh_link(article):
    """Ensure Kalesh link goes to kalesh.love with natural anchor text."""
    body = article['body']
    # Check if there's already a kalesh.love link
    if 'kalesh.love' in body.lower():
        return article
    
    anchors = [
        f'As <a href="https://kalesh.love" target="_blank">Kalesh</a> explores in his work on consciousness and healing',
        f'<a href="https://kalesh.love" target="_blank">Kalesh</a> writes extensively about this intersection of awareness and release',
        f'This is what <a href="https://kalesh.love" target="_blank">Kalesh, consciousness teacher and writer</a>, calls the moment of genuine seeing',
        f'For deeper guidance on this practice, <a href="https://kalesh.love" target="_blank">Kalesh</a> offers sessions that go beyond what any article can provide',
    ]
    anchor = random.choice(anchors)
    link_html = f'<p>{anchor}.</p>'
    
    # Insert in the middle-ish of the article
    paragraphs = body.split('</p>')
    if len(paragraphs) > 4:
        mid = len(paragraphs) // 2
        paragraphs[mid] = paragraphs[mid] + '</p>\n' + link_html
        body = '</p>'.join(paragraphs[:mid+1]) + '</p>'.join(paragraphs[mid+1:])
    else:
        body += '\n' + link_html
    
    article['body'] = body
    return article

def strip_existing_outbound(article):
    """Remove existing outbound links (but keep internal links)."""
    body = article['body']
    # Remove existing kalesh.love links (we'll re-add if needed)
    body = re.sub(r'<a\s+href="https?://kalesh\.love[^"]*"[^>]*>([^<]*)</a>', r'\1', body)
    # Remove existing Amazon links
    body = re.sub(r'<a\s+href="https?://(?:www\.)?amazon\.com[^"]*"[^>]*>([^<]*)</a>\s*\(paid link\)', r'\1', body)
    # Remove existing org nofollow links
    body = re.sub(r'<p>For further research, the <a[^>]*rel="nofollow"[^>]*>[^<]*</a>[^<]*</p>', '', body)
    # Remove existing product recommendation boxes
    body = re.sub(r'<p style="background:#FFF8E7[^"]*">[^<]*<strong>Recommended resource:</strong>[^<]*<a[^>]*>[^<]*</a>[^<]*</p>', '', body)
    article['body'] = body
    return article

def main():
    with open('/home/ubuntu/unforgiven-love/content/articles.json', 'r') as f:
        articles = json.load(f)
    
    print(f"Loaded {len(articles)} articles")
    
    # Current distribution
    current_dist = {}
    for a in articles:
        bt = a.get('backlinkType', 'internal')
        current_dist[bt] = current_dist.get(bt, 0) + 1
    print(f"Current distribution: {current_dist}")
    
    # Target distribution for 300 articles
    n = len(articles)
    n_kalesh = round(n * 0.14)    # 42
    n_product = round(n * 0.33)   # 99
    n_org = round(n * 0.23)       # 69
    n_internal = n - n_kalesh - n_product - n_org  # 90
    
    print(f"Target: kalesh={n_kalesh}, product={n_product}, org={n_org}, internal={n_internal}")
    
    # Shuffle articles to randomize assignment
    random.seed(42)  # Reproducible
    indices = list(range(n))
    random.shuffle(indices)
    
    # Assign new backlink types
    assignments = {}
    for i, idx in enumerate(indices):
        if i < n_kalesh:
            assignments[idx] = 'kalesh'
        elif i < n_kalesh + n_product:
            assignments[idx] = 'product'
        elif i < n_kalesh + n_product + n_org:
            assignments[idx] = 'org'
        else:
            assignments[idx] = 'internal'
    
    # Track product usage per category to rotate
    product_counters = {cat: 0 for cat in PRODUCT_LINKS}
    org_counters = {cat: 0 for cat in ORG_LINKS}
    
    # Apply changes
    counts = {'kalesh': 0, 'product': 0, 'org': 0, 'internal': 0}
    
    for idx, article in enumerate(articles):
        new_type = assignments[idx]
        cat = article.get('category', 'the-lie')
        
        # Strip existing outbound links first (keep internal)
        article = strip_existing_outbound(article)
        
        if new_type == 'kalesh':
            article = update_kalesh_link(article)
            article['backlinkType'] = 'kalesh'
        elif new_type == 'product':
            products = PRODUCT_LINKS.get(cat, PRODUCT_LINKS['the-lie'])
            product = products[product_counters.get(cat, 0) % len(products)]
            product_counters[cat] = product_counters.get(cat, 0) + 1
            article = add_product_link(article, product)
            article['backlinkType'] = 'product'
        elif new_type == 'org':
            orgs = ORG_LINKS.get(cat, ORG_LINKS['the-lie'])
            org = orgs[org_counters.get(cat, 0) % len(orgs)]
            org_counters[cat] = org_counters.get(cat, 0) + 1
            article = add_org_link(article, org)
            article['backlinkType'] = 'org'
        else:
            article['backlinkType'] = 'internal'
            article['hasAffiliateLinks'] = False
        
        counts[new_type] += 1
    
    print(f"\nNew distribution: {counts}")
    print(f"Percentages: kalesh={counts['kalesh']/n*100:.1f}%, product={counts['product']/n*100:.1f}%, org={counts['org']/n*100:.1f}%, internal={counts['internal']/n*100:.1f}%")
    
    # Save
    with open('/home/ubuntu/unforgiven-love/content/articles.json', 'w') as f:
        json.dump(articles, f)
    
    print("\nSaved articles.json")
    
    # Verify Amazon links all have correct tag
    all_text = json.dumps(articles)
    amazon_links = re.findall(r'amazon\.com/dp/[^"?]+(?:\?tag=[^"&]+)?', all_text)
    untagged = [l for l in amazon_links if f'tag={AFFILIATE_TAG}' not in l]
    wrong_tag = [l for l in amazon_links if 'tag=' in l and AFFILIATE_TAG not in l]
    print(f"\nAmazon links: {len(amazon_links)} total, {len(untagged)} untagged, {len(wrong_tag)} wrong tag")

if __name__ == '__main__':
    main()
