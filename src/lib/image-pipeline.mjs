/**
 * Image Pipeline — Bunny CDN Library System
 * No more AI image generation. Uses a pre-generated library of 40 WebP images.
 * Randomly selects one, downloads it, and re-uploads to /images/{slug}.webp
 * giving Google a unique, indexable image URL per article.
 */

// HARDCODED per spec — do NOT put in env vars
const BUNNY_STORAGE_ZONE = 'unforgiven-love';
const BUNNY_API_KEY = '24cbeac6-ad6e-4ff9-b892fb9f975f-fb5a-4c5f';
const BUNNY_PULL_ZONE = 'https://unforgiven-love.b-cdn.net';
const BUNNY_HOSTNAME = 'ny.storage.bunnycdn.com';

/**
 * Assign a hero image to an article by copying a random library image
 * to /images/{slug}.webp on Bunny CDN.
 * @param {string} slug - The article slug
 * @returns {string} The CDN URL of the assigned hero image
 */
export async function assignHeroImage(slug) {
  const sourceFile = `lib-${String(Math.floor(Math.random() * 40) + 1).padStart(2, '0')}.webp`;
  const destFile = `${slug}.webp`;

  try {
    const sourceUrl = `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
    const downloadRes = await fetch(sourceUrl);
    if (!downloadRes.ok) throw new Error('Download failed');
    const imageBuffer = await downloadRes.arrayBuffer();

    const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/images/${destFile}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'AccessKey': BUNNY_API_KEY, 'Content-Type': 'image/webp' },
      body: imageBuffer,
    });

    if (!uploadRes.ok) throw new Error('Upload failed');
    return `${BUNNY_PULL_ZONE}/images/${destFile}`;
  } catch (err) {
    console.error(`[image-pipeline] assignHeroImage failed for ${slug}: ${err.message}`);
    // Fallback: link directly to the library image
    return `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
  }
}

/**
 * Assign an OG image (same as hero for new articles)
 * @param {string} slug - The article slug
 * @returns {string} The CDN URL
 */
export async function assignOgImage(slug) {
  return `${BUNNY_PULL_ZONE}/images/${slug}.webp`;
}
