import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

const state = {
  isLoggedIn: false,
  user: null,
  followed: [],
  followedLive: [],
  searchResults: [],
  games: {},
  appData: null
};

const getters = {
  popularGames: state => {
    return state.games.popular;
  },
  isLoggedIn: state => {
    return state.isLoggedIn;
  },
  user: state => {
    return state.user || false;
  },
  userID: state => {
    if (state.user && state.user._id) {
      return state.user._id;
    }
    return false;
  },
  twitchID: state => {
    if (state.user && state.user.id) {
      return state.user.id;
    }
    return false;
  },
  followed: state => {
    return state.followed;
  },
  followedLive: state => {
    return state.followedLive;
  },
  favorites: state => {
    if (state.user && state.user.favorites) {
      return state.user.favorites;
    }
    return false;
  },
  searchResults: state => {
    return state.searchResults;
  },
  appData: state => {
    return state.appData;
  }
};

const mutations = {
  setUserHost(state, { channelId, hostedChannelData }) {
    const newFavorites = state.user.favorites.map(favorite => {
      if (favorite.channelId === channelId) {
        favorite.hosted = hostedChannelData;
      }
      return favorite;
    });
    Vue.set(state.user, 'favorites', newFavorites);
  },
  setPopularGames(state, { games }) {
    Vue.set(state.games, 'popular', games);
  },
  setFollowedLive(state, { streams }) {
    const sortedStreams = streams.sort((a, b) => {
      return a.channel.name >= b.channel.name ? 1 : -1;
    });
    Vue.set(state, 'followedLive', sortedStreams);
  },
  favorite(state, channelData) {
    const newFavorites = state.user.favorites;
    newFavorites.push(channelData);
    Vue.set(state.user, 'favorites', newFavorites);
  },
  unfavorite(state, channelData) {
    const newFavorites = state.user.favorites.filter(favorite => favorite.channelId !== channelData.channelId);
    Vue.set(state.user, 'favorites', newFavorites);
  },
  setLoggedIn(state, { isLoggedIn }) {
    Vue.set(state, 'isLoggedIn', isLoggedIn);
  },
  setUser(state, user) {
    Vue.set(state, 'user', user);
  },
  setFollowed(state, streams) {
    Vue.set(state, 'followed', streams);
  },
  setSearchResults(state, { streams }) {
    if (streams && streams.length) {
      Vue.set(state, 'searchResults', [...streams]);
    } else {
      Vue.set(state, 'searchResults', []);
    }
  },
  toggleStream(state, { name }) {
    const streams = [...state.favorites];
    if (!streams.includes(name)) {
      streams.push(name);
    } else {
      streams.splice(streams.indexOf(name), 1);
    }
    Vue.set(state, 'favorites', streams);
  },
  setAppData(state, { data }) {
    Vue.set(state, 'appData', data);
  }
};

const actions = {
  getPopularGames({ commit }) {
    return axios
      .get('/data/getPopularGames')
      .then(result => {
        commit('setPopularGames', {
          games: result.data.top
        });
      });
  },
  getFollowedStatus({ commit }, { channel }) {
    commit('setFollowedLive', { streams: [] });
    return axios
      .get(`/data/getChannelLiveStatus?channel=${channel}`)
      .then(result => {
        commit('setFollowedLive', {
          streams: result.data.streams
        });
      });
  },
  toggleFavorite({ commit }, { channelData, toggle }) {
    const action = toggle ? 'favorite' : 'unfavorite';
    return axios
      .post(`/api/${action}`, {
        channelData: channelData,
      })
      .then(() => {
        commit(action, channelData);
      });
  },
  favorite({ commit }, { channelData }) {
    return axios
      .post('/api/favorite', {
        channelData: channelData
      })
      .then(() => {
        commit('favorite', channelData)
      });
  },
  unfavorite({ commit }, { channelData }) {
    return axios
      .post('/api/unfavorite', {
        channelData: channelData
      })
      .then(() => {
        commit('unfavorite',  channelData);
      });
  },
  getMe({ commit }) {
    return axios.get(`/api/me`)
      .then(result => {
        if (!result || (result.data.code && result.data.code === 401)) {
          commit('setUser', null);
          commit('setLoggedIn', {
            isLoggedIn: false
          });
        } else {
          commit('setUser', result.data.user);
          commit('setLoggedIn', {
            isLoggedIn: true
          });
        }
      });
  },
  getApp({ commit }) {
    return axios.get('/api/app')
      .then(result => {
        const appData = result.data;
        commit('setAppData', {
          data: appData
        });
      });
  },
  getUserChannels({ commit }, { userID }) {
    return axios
      .get(`/data/getUserChannels?userID=${userID}`, {
        userID: userID
      })
      .then(results => {
        const streams = results.data.follows;
        commit('setFollowed', streams);
      });
  },
  search({ commit }, { query }) {
    return axios
      .get(`/data/searchStreams?query=${query}&limit=10`)
      .then(results => {
        const streams = results.data.streams;
        commit('setSearchResults', {
          streams
        });
      });
  },
  getUserIdByUserName({ commit }, { userName }) {
    return axios
      .get(`/data/getUserIdByUserName?userName=${userName}`, {
        userName: userName
      })
      .then(response => {
        const id = response.data;
        commit('setUser', {
          name: userName,
          id: id
        });
      });
  }
};

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions
});
