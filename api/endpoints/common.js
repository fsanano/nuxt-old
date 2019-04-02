import { _get } from '../Utils/requests';

const baseURL = process.env.API_BASE_URL;

// eslint-disable-next-line
export function currencies() {
  return {
    /**
     * Get all available coins
     * @param [params]
     * @param [cb]
     * @returns {Json}
     */
    fetchAll(params) {
      return _get(baseURL, '/fiat', params);
    },
  };
}
