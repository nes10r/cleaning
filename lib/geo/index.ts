import 'server-only';

/**
 * Address autocomplete abstraction. The /api/address route calls
 * `getGeoProvider().autocomplete()`; pick the provider with GEO_PROVIDER.
 */
export interface AddressSuggestion {
  id: string;
  label: string;
  secondary?: string;
}

/** The city the search is limited to (from the admin-managed city list). */
export interface GeoCity {
  key: string;
  name: string;
  geo: { lat: number; lng: number };
}

export interface GeoProvider {
  autocomplete(query: string, city: GeoCity, language: string): Promise<AddressSuggestion[]>;
}

/** Offline provider: matches common street names so the UX works without API keys. */
const STREETS: Record<string, string[]> = {
  vilnius: ['Gedimino pr.', 'Konstitucijos pr.', 'Žirmūnų g.', 'Antakalnio g.', 'Kalvarijų g.', 'Ukmergės g.', 'Pilaitės pr.', 'Didlaukio g.', 'Savanorių pr.', 'Vilniaus g.', 'Pylimo g.', 'Šeškinės g.', 'Justiniškių g.', 'Mindaugo g.', 'Užupio g.'],
  kaunas: ['Laisvės al.', 'Savanorių pr.', 'Kęstučio g.', 'Vytauto pr.', 'Pramonės pr.', 'Taikos pr.', 'Baltų pr.', 'Jonavos g.', 'Karaliaus Mindaugo pr.', 'Aleksoto g.'],
  klaipeda: ['H. Manto g.', 'Taikos pr.', 'Liepų g.', 'Baltijos pr.', 'Tilžės g.', 'Minijos g.', 'Šilutės pl.', 'Turgaus g.', 'Naujojo Sodo g.'],
};

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const mockProvider: GeoProvider = {
  async autocomplete(query, city) {
    const list = STREETS[city.key] ?? [];
    const number = query.match(/\d+[a-zA-Z]?(?:[-–]\d+)?/)?.[0] ?? '';
    const words = fold(query.replace(number, '')).trim();
    if (words.length < 2) return [];
    return list
      .filter((s) => fold(s).includes(words.split(' ')[0]))
      .slice(0, 5)
      .map((s) => {
        const label = number ? `${s} ${number}` : s;
        return { id: `mock:${city.key}:${label}`, label, secondary: city.name };
      });
  },
};

function googleProvider(key: string): GeoProvider {
  return {
    async autocomplete(query, city, language) {
      const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key },
        body: JSON.stringify({
          input: `${query}, ${city.name}`,
          includedRegionCodes: ['lt'],
          languageCode: language,
          includedPrimaryTypes: ['street_address', 'premise', 'route'],
          locationBias: { circle: { center: { latitude: city.geo.lat, longitude: city.geo.lng }, radius: 20000 } },
        }),
      });
      if (!res.ok) return [];
      const data = (await res.json()) as { suggestions?: { placePrediction?: { placeId: string; structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } } } }[] };
      return (data.suggestions ?? []).flatMap((s) =>
        s.placePrediction
          ? [{ id: s.placePrediction.placeId, label: s.placePrediction.structuredFormat?.mainText?.text ?? '', secondary: s.placePrediction.structuredFormat?.secondaryText?.text }]
          : [],
      );
    },
  };
}

function mapboxProvider(token: string): GeoProvider {
  return {
    async autocomplete(query, city, language) {
      const params = new URLSearchParams({ q: query, country: 'lt', autocomplete: 'true', limit: '5', types: 'address', language, access_token: token });
      params.set('proximity', `${city.geo.lng},${city.geo.lat}`);
      const res = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`);
      if (!res.ok) return [];
      const data = (await res.json()) as { features?: { id: string; properties: { name: string; place_formatted?: string } }[] };
      return (data.features ?? []).map((f) => ({ id: f.id, label: f.properties.name, secondary: f.properties.place_formatted }));
    },
  };
}

export function getGeoProvider(): GeoProvider {
  const p = process.env.GEO_PROVIDER;
  if (p === 'google' && process.env.GOOGLE_MAPS_API_KEY) return googleProvider(process.env.GOOGLE_MAPS_API_KEY);
  if (p === 'mapbox' && process.env.MAPBOX_ACCESS_TOKEN) return mapboxProvider(process.env.MAPBOX_ACCESS_TOKEN);
  return mockProvider;
}
