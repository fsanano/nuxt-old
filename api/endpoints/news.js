import { _get } from '../Utils/requests';

const baseURL = process.env.NEWS_API_BASE_URL;

export default function news() {
  return {
    fetchAll(params) {
      return _get(baseURL, '/news', params);
    },
    fetchByID(id, params) {
      if (!id) {
        throw new Error('Post ID must be specified');
      }

      return _get(baseURL, `/news/${id}`, params);
    },
    fetchCategories(params) {
      return _get(baseURL, '/category', params);
    },
    fetchTags(params) {
      return _get(baseURL, '/tags', params);
    },
  };
}
