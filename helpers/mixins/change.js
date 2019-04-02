import get from 'lodash.get';

export default {
  methods: {
    change(val, period) {
      const diff = get(val, period, '0');
      return diff.indexOf('-') !== -1
        ? 'down'
        : 'up';
    },
  },
};
