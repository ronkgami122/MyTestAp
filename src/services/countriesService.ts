import ApiClient from './apiClient';

export interface ApiCountry {
  name: string;
  flag: string;
  capital?: string;
  alpha2Code?: string;
  callingCodes?: string[];
  dialCode?: string;
  population?: number;
  region?: string;
}

export interface GetCountriesParams {
  fields?: string;
  full?: boolean;
  sort?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

const BASE_URL = 'https://countries.dev';

export const CountriesService = {
  /**
   * Fetch countries from countries.dev API using Axios / ApiClient.
   * Supports pagination (limit & offset) and debounced search via API.
   */
  async getCountries(params: GetCountriesParams = {}): Promise<ApiCountry[]> {
    const { search, limit = 20, offset = 0, sort = 'name', ...rest } = params;
    const trimmedSearch = search?.trim() || '';

    try {
      let rawData: any[] = [];

      if (trimmedSearch) {
        // Query search by name API: /name/:name
        try {
          const searchResponse = await ApiClient.get<any[]>(
            `${BASE_URL}/name/${encodeURIComponent(trimmedSearch)}`,
            { limit, offset, sort, ...rest }
          );
          if (Array.isArray(searchResponse)) {
            rawData = searchResponse;
          }
        } catch (searchError: any) {
          if (searchError?.statusCode === 404) {
            // countries.dev returns 404 if no countries match the search query
            return [];
          }
          throw searchError;
        }
      } else {
        // Query paginated list of countries
        const response = await ApiClient.get<any[]>(`${BASE_URL}/countries`, {
          limit,
          offset,
          sort,
          fields: 'name,capital,flag,alpha2Code,callingCodes,population,region',
          ...rest,
        });
        if (Array.isArray(response)) {
          rawData = response;
        }
      }

      if (Array.isArray(rawData) && rawData.length > 0) {
        const normalized: ApiCountry[] = rawData
          .filter(c => c && c.name)
          .map(c => {
            const rawCalling = Array.isArray(c.callingCodes) && c.callingCodes.length > 0 ? c.callingCodes : ['1'];
            const dialCode = rawCalling[0].startsWith('+') ? rawCalling[0] : `+${rawCalling[0]}`;
            return {
              name: c.name,
              flag: c.flag || '🌐',
              capital: c.capital || 'N/A',
              alpha2Code: c.alpha2Code || '',
              callingCodes: rawCalling,
              dialCode,
              population: c.population,
              region: c.region || 'Global',
            };
          });

        // If search returned the full result set without slicing on the server, slice it by offset & limit
        if (trimmedSearch && normalized.length > limit) {
          return normalized.slice(offset, offset + limit);
        }

        return normalized;
      }

      return [];
    } catch (error) {
      console.warn('Countries API error:', error);
      throw error;
    }
  },
};

export default CountriesService;
