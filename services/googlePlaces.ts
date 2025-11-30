import { Platform } from 'react-native';

const API_BASE = 'https://maps.googleapis.com/maps/api';

const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

type AutocompletePrediction = {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
  terms?: { value: string }[];
  types?: string[];
};

type AutocompleteResponse = {
  status: string;
  predictions: AutocompletePrediction[];
  error_message?: string;
};

type PlaceDetailsResponse = {
  status: string;
  result?: {
    place_id: string;
    formatted_address?: string;
    geometry?: {
      location?: {
        lat: number;
        lng: number;
      };
    };
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  };
  error_message?: string;
};

type GeocodeResponse = {
  status: string;
  results: Array<{
    place_id: string;
    formatted_address?: string;
    geometry?: {
      location?: {
        lat: number;
        lng: number;
      };
    };
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
  error_message?: string;
};

const ensureApiKey = () => {
  if (!GOOGLE_MAPS_KEY) {
    throw new Error('Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.');
  }
  return GOOGLE_MAPS_KEY;
};

const toSearchParams = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    search.append(key, String(value));
  });
  return search;
};

const request = async <T>(endpoint: string, params: Record<string, string | number | undefined>): Promise<T> => {
  const apiKey = ensureApiKey();
  const url = `${API_BASE}/${endpoint}?${toSearchParams({ ...params, key: apiKey }).toString()}`;
  const response = await fetch(url, {
    headers: {
      'Accept-Language': Platform.select({ ios: undefined, android: undefined, default: 'en-IN' }) || 'en-IN',
    },
  });
  if (!response.ok) {
    throw new Error(`Google Maps request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
};

const handleStatus = (status: string, errorMessage?: string) => {
  if (status === 'OK' || status === 'ZERO_RESULTS') {
    return;
  }
  throw new Error(errorMessage || `Google Maps error: ${status}`);
};

export interface AddressSuggestion {
  placeId: string;
  description: string;
  mainText?: string;
  secondaryText?: string;
  types?: string[];
  terms?: { value: string }[];
}

export interface AddressDetails {
  placeId: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  components?: Array<{
    longName: string;
    shortName: string;
    types: string[];
  }>;
}

export const googlePlaces = {
  async autocomplete(input: string, params?: { types?: string; components?: string; sessiontoken?: string }): Promise<AddressSuggestion[]> {
    const query = input.trim();
    if (!query) {
      return [];
    }
    const json = await request<AutocompleteResponse>('place/autocomplete/json', {
      input: query,
      types: params?.types,
      components: params?.components,
      sessiontoken: params?.sessiontoken,
    });
    handleStatus(json.status, json.error_message);
    if (json.status === 'ZERO_RESULTS') {
      return [];
    }
    return json.predictions.map((prediction) => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting?.main_text,
      secondaryText: prediction.structured_formatting?.secondary_text,
      terms: prediction.terms,
      types: prediction.types,
    }));
  },
  async details(placeId: string): Promise<AddressDetails | null> {
    if (!placeId) {
      return null;
    }
    const json = await request<PlaceDetailsResponse>('place/details/json', {
      place_id: placeId,
      fields: 'place_id,formatted_address,geometry,address_component',
    });
    handleStatus(json.status, json.error_message);
    if (!json.result) {
      return null;
    }
    return {
      placeId: json.result.place_id,
      formattedAddress: json.result.formatted_address,
      latitude: json.result.geometry?.location?.lat,
      longitude: json.result.geometry?.location?.lng,
      components: json.result.address_components?.map((component) => ({
        longName: component.long_name,
        shortName: component.short_name,
        types: component.types,
      })),
    };
  },
  async geocode(address: string): Promise<AddressDetails[]> {
    const query = address.trim();
    if (!query) {
      return [];
    }
    const json = await request<GeocodeResponse>('geocode/json', { address: query });
    handleStatus(json.status, json.error_message);
    if (json.status === 'ZERO_RESULTS') {
      return [];
    }
    return json.results.map((result) => ({
      placeId: result.place_id,
      formattedAddress: result.formatted_address,
      latitude: result.geometry?.location?.lat,
      longitude: result.geometry?.location?.lng,
      components: result.address_components?.map((component) => ({
        longName: component.long_name,
        shortName: component.short_name,
        types: component.types,
      })),
    }));
  },
  async geocodePincode(pin: string): Promise<AddressDetails | null> {
    const clean = pin.replace(/\D/g, '');
    if (clean.length !== 6) {
      return null;
    }
    const results = await this.geocode(`${clean}, India`);
    return results[0] ?? null;
  },
};
