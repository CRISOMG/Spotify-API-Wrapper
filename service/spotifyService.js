const axios = require('axios');
const qs = require('querystring');

const debug = require('debug');

const debug_spotifyService_token = debug('server:spotifyService:token');
const debug_spotifyService_search = debug('server:spotifyService:search');
const debug_spotifyService_track = debug('server:spotifyService:track');
const debug_spotifyService_errors = debug('server:spotifyService:errors');

const config = require('../config');

const base64_client_credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString(
  'base64',
);

const getToken = async () => {
  const token_request = {
    url: 'https://accounts.spotify.com/api/token',
    body: qs.stringify({
      grant_type: 'client_credentials',
    }),
    config: {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        authorization: `Basic ${base64_client_credentials}`,
      },
    },
  };
  try {
    const { data } = await axios.post(token_request.url, token_request.body, token_request.config);
    config.access_token = data.access_token;
    debug_spotifyService_token('token setted');
  } catch (error) {
    debug_spotifyService_errors(error);
    console.log(typeof Error(error));
    throw error;
  }
};

const search = async (q, type = 'track') => {
  if (!config.access_token) {
    debug_spotifyService_token('fetching token');

    await getToken();
  }
  const search_request = {
    url: 'https://api.spotify.com/v1/search',
    headers: {
      authorization: `Bearer ${config.access_token}`,
    },
    params: {
      q,
      type,
    },
  };

  try {
    debug_spotifyService_search('searching...');

    const response = await axios(search_request);
    debug_spotifyService_search('search was responded');
    return response;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      try {
        debug_spotifyService_token('fetching token');

        await getToken();
        return await axios(search_request);
      } catch (err) {
        debug_spotifyService_errors(err.message);
        throw err;
      }
    }
    throw error;
  }
};

const getTrack = async (id) => {
  if (!config.access_token) {
    debug_spotifyService_token('fetching token');

    await getToken();
  }

  const track_request = {
    url: `https://api.spotify.com/v1/tracks/${id}`,
    headers: {
      authorization: `Bearer ${config.access_token}`,
    },
  };
  try {
    debug_spotifyService_track('fetching track');
    const response = await axios(track_request);
    debug_spotifyService_track('track was responded');
    return response;
  } catch (error) {
    debug_spotifyService_errors(error.message);
    if (error.response && error.response.status === 401) {
      try {
        debug_spotifyService_token('fetching token');

        await getToken();
        return await axios(track_request);
      } catch (error) {
        throw error;
      }
    } else {
      throw error;
    }
  }
};

module.exports = {
  getToken,
  search,
  getTrack,
};
