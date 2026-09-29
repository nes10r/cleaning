/**
 * SEO landing pages served from /[slug], generated for every active city:
 *   /vilnius, /valymo-paslaugos-vilniuje, /namu-valymas-vilniuje, /biuru-valymas-vilniuje …
 * A topic is generated only if its service exists and is active.
 */
export const landingTopics = [
  { key: 'all', slugPrefix: 'valymo-paslaugos', service: null },
  { key: 'home', slugPrefix: 'namu-valymas', service: 'regular' },
  { key: 'office', slugPrefix: 'biuru-valymas', service: 'office' },
] as const;

export type LandingTopicKey = (typeof landingTopics)[number]['key'];
