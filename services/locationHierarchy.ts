import { googlePlaces, type AddressDetails, type AddressSuggestion } from '@/services/googlePlaces';

export interface LocationOption {
  id: string;
  name: string;
  description?: string;
  pincode?: string;
  types?: string[];
  context?: {
    state?: string;
    district?: string;
    block?: string;
  };
}

const hasAnyType = (suggestion: AddressSuggestion, accepted: string[]) =>
  suggestion.types?.some((type: string) => accepted.includes(type)) ?? false;

const suggestionToOption = (suggestion: AddressSuggestion, context?: LocationOption['context']): LocationOption => ({
  id: suggestion.placeId,
  name: suggestion.mainText ?? suggestion.description,
  description: suggestion.secondaryText ?? suggestion.description,
  pincode: suggestion.terms?.find((term: { value: string }) => /^\d{6}$/.test(term.value))?.value,
  types: suggestion.types,
  context,
});

const uniqueById = <T extends { id: string }>(items: T[]) => {
  const map = new Map<string, T>();
  items.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
};

const buildQuery = (...parts: Array<string | undefined>) =>
  parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')
    .trim();

const fallbackInput = (value: string | undefined, fallback: string) => (value?.trim().length ? value : fallback);

const fetchRegionOptions = async (
  query: string,
  filterTypes: string[],
  context?: LocationOption['context']
): Promise<LocationOption[]> => {
  const suggestions = await googlePlaces.autocomplete(query, {
    types: '(regions)',
    components: 'country:IN',
  });
  const filtered = suggestions.filter((suggestion: AddressSuggestion) => hasAnyType(suggestion, filterTypes));
  return uniqueById(filtered.map((suggestion: AddressSuggestion) => suggestionToOption(suggestion, context))).slice(0, 25);
};

const resolveAddressComponent = (details: AddressDetails | null | undefined, type: string) =>
  details?.components?.find((component) => component.types.includes(type))?.longName;

const resolveOptionByName = async (name?: string, filterTypes: string[] = ['administrative_area_level_1']) => {
  if (!name) {
    return undefined;
  }
  const suggestions = await googlePlaces.autocomplete(name, {
    types: '(regions)',
    components: 'country:IN',
  });
  const match = suggestions.find((suggestion: AddressSuggestion) => hasAnyType(suggestion, filterTypes));
  return match ? suggestionToOption(match) : undefined;
};

export const locationService = {
  async getStates(query?: string): Promise<LocationOption[]> {
    const input = fallbackInput(query, 'State of India');
    return fetchRegionOptions(input, ['administrative_area_level_1']);
  },
  async getDistricts(state?: LocationOption | null, query?: string): Promise<LocationOption[]> {
    if (!state) {
      return [];
    }
    const input = buildQuery(query, state.name, 'district');
    const fallback = input || `${state.name} district`;
    return fetchRegionOptions(fallback, ['administrative_area_level_2'], { state: state.name });
  },
  async getBlocks(
    state?: LocationOption | null,
    district?: LocationOption | null,
    query?: string
  ): Promise<LocationOption[]> {
    if (!state || !district) {
      return [];
    }
    const input = buildQuery(query, district.name, state.name, 'block');
    const fallback = input || `${district.name} ${state.name}`;
    return fetchRegionOptions(fallback, ['administrative_area_level_3', 'locality'], {
      state: state.name,
      district: district.name,
    });
  },
  async getVillages(
    state?: LocationOption | null,
    district?: LocationOption | null,
    block?: LocationOption | null,
    query?: string
  ): Promise<LocationOption[]> {
    if (!state || !district || !block) {
      return [];
    }
    const input = buildQuery(query, block.name, district.name, state.name, 'village');
    const fallback = input || `${block.name} ${district.name}`;
    return fetchRegionOptions(fallback, ['sublocality_level_1', 'sublocality_level_2', 'locality'], {
      state: state.name,
      district: district.name,
      block: block.name,
    });
  },
  async lookupPincode(pin: string): Promise<{ state?: LocationOption; district?: LocationOption } | null> {
    const details = await googlePlaces.geocodePincode(pin);
    if (!details) {
      return null;
    }
    const stateName = resolveAddressComponent(details, 'administrative_area_level_1');
    const districtName = resolveAddressComponent(details, 'administrative_area_level_2');
    const [stateOption, districtOption] = await Promise.all([
      resolveOptionByName(stateName, ['administrative_area_level_1']),
      resolveOptionByName(districtName, ['administrative_area_level_2']),
    ]);
    return {
      state: stateOption,
      district: districtOption,
    };
  },
};
