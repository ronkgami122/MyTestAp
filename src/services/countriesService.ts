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
}

const BASE_URL = 'https://countries.dev';

export const CountriesService = {
  /**
   * Fetch countries from countries.dev API using Axios / ApiClient
   * Default params fetch country name, capital, flag emoji, dial code, and alpha2Code
   */
  async getCountries(params: GetCountriesParams = {}): Promise<ApiCountry[]> {
    const defaultParams: GetCountriesParams = {
      fields: 'name,capital,flag,alpha2Code,callingCodes,population,region',
      full: true,
      sort: 'name',
      limit: 60,
      offset: 0,
      ...params,
    };

    try {
      const response = await ApiClient.get<ApiCountry[]>(`${BASE_URL}/countries`, defaultParams);

      if (Array.isArray(response) && response.length > 0) {
        // Normalize countries to ensure valid display values
        return response
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
      }

      return CountriesService.getFallbackCountries();
    } catch (error) {
      console.warn('Countries API error, using structured fallback:', error);
      return CountriesService.getFallbackCountries();
    }
  },

  /**
   * Reliable fallback list in case countries.dev is offline or rate limited
   */
  getFallbackCountries(): ApiCountry[] {
    return [
      { name: 'United States', flag: '🇺🇸', capital: 'Washington, D.C.', alpha2Code: 'US', callingCodes: ['1'], region: 'Americas' },
      { name: 'United Kingdom', flag: '🇬🇧', capital: 'London', alpha2Code: 'GB', callingCodes: ['44'], region: 'Europe' },
      { name: 'India', flag: '🇮🇳', capital: 'New Delhi', alpha2Code: 'IN', callingCodes: ['91'], region: 'Asia' },
      { name: 'Canada', flag: '🇨🇦', capital: 'Ottawa', alpha2Code: 'CA', callingCodes: ['1'], region: 'Americas' },
      { name: 'Australia', flag: '🇦🇺', capital: 'Canberra', alpha2Code: 'AU', callingCodes: ['61'], region: 'Oceania' },
      { name: 'Germany', flag: '🇩🇪', capital: 'Berlin', alpha2Code: 'DE', callingCodes: ['49'], region: 'Europe' },
      { name: 'France', flag: '🇫🇷', capital: 'Paris', alpha2Code: 'FR', callingCodes: ['33'], region: 'Europe' },
      { name: 'Japan', flag: '🇯🇵', capital: 'Tokyo', alpha2Code: 'JP', callingCodes: ['81'], region: 'Asia' },
      { name: 'Singapore', flag: '🇸🇬', capital: 'Singapore', alpha2Code: 'SG', callingCodes: ['65'], region: 'Asia' },
      { name: 'United Arab Emirates', flag: '🇦🇪', capital: 'Abu Dhabi', alpha2Code: 'AE', callingCodes: ['971'], region: 'Asia' },
      { name: 'Brazil', flag: '🇧🇷', capital: 'Brasília', alpha2Code: 'BR', callingCodes: ['55'], region: 'Americas' },
      { name: 'Netherlands', flag: '🇳🇱', capital: 'Amsterdam', alpha2Code: 'NL', callingCodes: ['31'], region: 'Europe' },
      { name: 'Switzerland', flag: '🇨🇭', capital: 'Bern', alpha2Code: 'CH', callingCodes: ['41'], region: 'Europe' },
      { name: 'Spain', flag: '🇪🇸', capital: 'Madrid', alpha2Code: 'ES', callingCodes: ['34'], region: 'Europe' },
      { name: 'Italy', flag: '🇮🇹', capital: 'Rome', alpha2Code: 'IT', callingCodes: ['39'], region: 'Europe' },
      { name: 'South Korea', flag: '🇰🇷', capital: 'Seoul', alpha2Code: 'KR', callingCodes: ['82'], region: 'Asia' },
      { name: 'Mexico', flag: '🇲🇽', capital: 'Mexico City', alpha2Code: 'MX', callingCodes: ['52'], region: 'Americas' },
      { name: 'New Zealand', flag: '🇳🇿', capital: 'Wellington', alpha2Code: 'NZ', callingCodes: ['64'], region: 'Oceania' },
      { name: 'Sweden', flag: '🇸🇪', capital: 'Stockholm', alpha2Code: 'SE', callingCodes: ['46'], region: 'Europe' },
      { name: 'South Africa', flag: '🇿🇦', capital: 'Pretoria', alpha2Code: 'ZA', callingCodes: ['27'], region: 'Africa' },
    ];
  },
};

export default CountriesService;
