/* eslint-disable no-underscore-dangle */
import axios from 'axios';
import https from 'https';
import qs from 'qs';
import Raven from 'raven-js';

const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

function _request(method, baseURL, endpoint, parameters) {
  const opt = {
    method,
    baseURL,
    url: endpoint,
    crossDomain: true,
    timeout: 10000,
    params: parameters,
    responseType: 'json',
    paramsSerializer: params => qs.stringify(params, { arrayFormat: 'indices' }),
  };

  return instance(opt)
    .catch((error) => {
      /* eslint-disable no-console */
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(
          'Server responded with a status code that falls out of the range of 2xx',
          `Code ${error.response.status}: ${error.response.statusText}`,
          error.response.data,
        );
        Raven.setExtraContext({
          reason: 'Server responded with a status code that falls out of the range of 2xx',
          response: error.response,
        });
        Raven.captureException(error);
        return error.response;
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(
          'The request was made but no response was received',
          opt,
          error.request,
        );
        Raven.setExtraContext({
          reason: 'The request was made but no response was received',
          options: opt,
          request: error.request,
        });
        Raven.captureException(error);
        return {
          data: {
            result: false,
            message: 'The request was made but no response was received',
            errors: {
              request: ['The request was made but no response was received'],
            },
          },
          status: error.request.status,
          statusText: error.request.statusText,
        };
      }
      // Something happened in setting up the request that triggered an Error
      console.error(
        'Something happened in setting up the request that triggered an Error',
        `Error: ${error.message}`,
      );
      Raven.setExtraContext({
        reason: 'Something happened in setting up the request that triggered an Error',
        message: error.message,
      });
      Raven.captureException(error);
      return {
        data: {
          result: false,
          message: 'Something happened in setting up the request that triggered an Error',
          errors: {
            request: [error.message],
          },
        },
      };
      /* eslint-enable no-console */
    });
}

export function _get(baseURL, endpoint, parameters) {
  return _request('GET', baseURL, endpoint, parameters);
}

export function _post(baseURL, endpoint, parameters) {
  return _request('POST', baseURL, endpoint, parameters);
}

export function _put(baseURL, endpoint, parameters) {
  return _request('PUT', baseURL, endpoint, parameters);
}

export function _delete(baseURL, endpoint, parameters) {
  return _request('DELETE', baseURL, endpoint, parameters);
}
