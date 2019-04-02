export default {
  filters: {
    spacer(num) {
      const whole = num.toString().split('.');
      whole[0] = whole[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return whole.join('.');
    },
  },
};
