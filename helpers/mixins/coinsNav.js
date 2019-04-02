import { mapState } from 'vuex';

export default {
  data() {
    return {
      rootCoin: '',
      rootIndex: '',
    };
  },

  methods: {
    setMainActiveCoin() {
      this.rootCoin = this.$route.params.coin;
      this.$store.dispatch('coins/setActiveCoin', this.rootCoin);
    },

    goToCoinPage(coin) {
      this.$store.dispatch('coins/resetActiveCoins');
      this.$store.dispatch('coins/toggleActiveCoin', coin);
      this.$router.push({
        name: 'lang-coin-currency-interval',
        params: { coin },
      });
    },

    togglegridCoins(coin) {
      this.$store.dispatch('coins/toggleActiveCoin', coin);
      this.updateCoinPage();
    },

    updateCoinPage() {
      const extraCoins = [...this.gridCoins];

      [this.rootCoin] = extraCoins;

      extraCoins.shift();

      this.$router.push({
        params: {
          coin: this.rootCoin,
        },
        query: {
          start: this.$route.query.start,
          end: this.$route.query.end,
          with: extraCoins.length > 0 ? extraCoins.toString() : undefined,
        },
      });
    },

    goToIndexPage(index) {
      this.$store.dispatch('indices/resetActiveIndices');
      this.$store.dispatch('indices/toggleActiveIndex', index);
      this.$router.push({
        name: 'lang-indices-indexName',
        params: { index },
      });
    },

    toggleSelectedIndex(index) {
      this.$store.dispatch('indices/toggleActiveIndex', index);
      this.updateIndexPage();
    },

    updateIndexPage() {
      const extraIndices = [...this.selectedIndices];

      [this.rootIndex] = extraIndices;

      extraIndices.shift();

      this.$router.push({
        params: {
          index: this.rootIndex,
        },
        query: {
          start: this.$route.query.start,
          end: this.$route.query.end,
          with: extraIndices.length > 0 ? extraIndices.toString() : undefined,
        },
      });
    },

  },

  computed: {
    ...mapState({
      // gridCoins: state => state.coins.active,
      selectedIndices: state => state.indices.active,
      gridCoins: state => state.coins.grid,
    }),
  },

  mounted() {
    this.setMainActiveCoin();
  },
};
