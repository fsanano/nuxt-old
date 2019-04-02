/* eslint-disable no-shadow */
import Vue from 'vue';
import Raven from 'raven-js';

const state = () => ({
  /**
   * Содержит в себе объекты, которые находятся на графике.
   * Объект вида { name = 'имя монеты или индекса', entity = 'coin' || 'index' }
   */
  items: [],
  /**
   * Старт и конец диапазона графика.
   * Значения: timestamp в секундах.
   * Меняется с помощью навигатора графика, дэйтпикера, переключения интервалов.
   */
  ticks: {
    minute: 60,
    five_minutes: 300,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2678400,
  },
});

const ADD_ITEM = 'ADD_ITEM';
const REMOVE_ITEM = 'REMOVE_ITEM';
const CLEAR_ITEMS = 'CLEAR_ITEMS';

const getters = {
  /**
   * Названия монет, отображенных на графике.
   * Используется для удобного получения данных истории.
   * @param state
   */
  chartCoins: state => state.items.filter(el => el.entity === 'coin').map(el => el.name),
  /**
   * Названия индексов, отображенных на графике.
   * Используется для удобного получения данных истории.
   * @param state
   */
  chartIndices: state => state.items.filter(el => el.entity === 'index').map(el => el.name),
};

const actions = {
  addItem({ commit }, { name, entity }) {
    Raven.captureBreadcrumb({
      message: `Added ${entity} ${name} on chart`,
      category: 'chart',
      level: 'info', // error, warning, info, or debug.
      data: { name, entity },
    });
    commit(ADD_ITEM, { name, entity });
  },
  removeItem({ commit, state }, { name, entity }) {
    const index = state.items.findIndex(el => el.name === name);

    if (index > -1) {
      Raven.captureBreadcrumb({
        message: `Removed ${entity} ${name} from chart`,
        category: 'chart',
        level: 'info', // error, warning, info, or debug.
        data: { name, entity },
      });
      commit(REMOVE_ITEM, index);
    }
  },
  clearItems({ commit }) {
    Raven.captureBreadcrumb({
      message: 'Chart has been cleared',
      category: 'chart',
      level: 'info', // error, warning, info, or debug.
    });
    commit(CLEAR_ITEMS);
  },
};

const mutations = {
  [ADD_ITEM](state, item) {
    state.items = [...state.items, item];
  },

  [REMOVE_ITEM](state, index) {
    state.items = state.items.filter((el, i) => i !== index);
  },

  [CLEAR_ITEMS](state) {
    Vue.set(state, 'items', []);
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
