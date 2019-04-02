<template lang="pug">
  .data-grid

    .data-grid__settings(:class="{'closed': !showContent}")
      .d-flex.align-items-center.data-grid__view(v-if="showContent")
        .data-grid__view-title(v-html="$t('coin.view')")

        .d-flex.data-grid__view-buttons
          .data-grid__view-button(
          v-for="view in views",
          :class="{'active': view === dataView }",
          @click="toggleView(view)"
          )
            .view__btn(:class="'__'+view")

      .data-grid__settings-fields(v-show="showContent")
        autocomplete(
          v-model="selection"
          :suggestions="coins"
          :showSuggestionsByDefault="false"
          type="search"
          @value="addCoin($event)"
        )

        sortDropdown(
          :exchangesData="exchanges",
          @sortdata="generateCriteria"
        )

      .toggle__label(v-html="'Coins'" v-show="!showContent")

      toggle-btn(
        :withText="true"
        v-show="showContent"
        position="static"
        @toggle="toggleContent($event)"
      )

    h2.page__subtitle(v-if="showTitle" v-html="$t('index.coinsListTitle', { name: indexName })")

    .data-grid__content(:class="'__' + dataView" v-show="showContent")
      slot(
        v-for="item in sortedContent"
        name="data-grid-item"
        :item="item"
      )

</template>

<script>
  import { mapState, mapGetters } from 'vuex';
  import autocomplete from '~/components/ui/input/autocomplete.vue';
  import sortDropdown from '~/components/ui/dropdown/sort.vue';
  import multisort from 'multisort';
  import icon from '~/components/ui/icon.vue';
  import toggleBtn from '~/components/blocks/toggle/toggleBtn.vue';

  import isEmpty from 'lodash.isempty';

  export default {
    name: 'data-grid-view',

    props: {
      content: {
        type: Array,
        default() {
          return [];
        },
      },
      indexName: {
        type: String,
        default: '',
        required: false,
      },
      showTitle: {
        type: Boolean,
        default: false,
        required: true,
      },
    },

    data() {
      return {
        views: ['grid', 'row', 'wild'],
        settings: {
          view: '',
        },

        showContent: true,

        exchanges: {
          min: '',
          max: '',
        },

        sortCriteria: '',

        selection: '',
      };
    },

    components: {
      autocomplete,
      sortDropdown,
      icon,
      toggleBtn,
    },

    watch: {
      content(newContent) {
        this.checkContentView();
        this.getMinMax(newContent);
      },
    },

    methods: {
      async addCoin({ coin, type }) {
        const response = await this.$store.dispatch('coins/fetchCoinData', {
          name: coin,
          params: {
            detail: true,
            convert: this.currency,
          },
        });

        if (type === 'push') {
          this.$store.dispatch('coins/clearGridCoins');
          this.$store.dispatch('coins/setGridCoin', coin);

          return this.$router.push({
            name: 'lang-coins-coin',
            params: {
              coin,
              interval: this.interval,
              currency: this.currency,
            },
            query: {
              currency: this.$route.query.currency,
              interval: this.$route.query.interval,
              with: this.$route.query.with,
            },
          });
        }

        this.$store.dispatch('chart/addItem', { name: coin, entity: 'coin' });

        this.$store.dispatch('coins/setGridCoin', coin);

        return response;
      },

      getMinMax(content) {
        if (content.indexOf(undefined) === -1 && content.length) {
          const min = content.reduce((prev, curr) => (prev.exchanges < curr.exchanges ? prev : curr));
          const max = content.reduce((prev, curr) => (prev.exchanges > curr.exchanges ? prev : curr));

          this.exchanges.min = min.exchanges;
          this.exchanges.max = max.exchanges;
        }
      },

      toggleContent(val) {
        this.showContent = val;
      },

      toggleView(view) {
        this.settings.view = view;
        this.$store.dispatch('common/setUserDataView', [view, true]);
      },

      checkContentView() {
        const store = this.$store;
        switch (this.content.length) {
          case 1:
            store.dispatch('common/setUserDataView', ['wild', false]);
            break;

          case 2:
          case 3:
            store.dispatch('common/setUserDataView', ['row', false]);
            break;

          default:
            store.dispatch('common/setUserDataView', ['grid', false]);
            break;
        }
      },

      generateCriteria(name, val) {
        const notNested = ['name', 'capitalization', 'exchanges'];
        const periods = ['day', 'week', 'month'];
        let criteria;

        if (notNested.indexOf(name) !== -1) {
          criteria = val ? name : `!${name}`;
        }

        if (name === 'price') {
          criteria = val ? `${name}.value` : `!${name}.value`;
        }

        if (periods.indexOf(name) !== -1) {
          criteria = val ? `change.${name}` : `!change.${name}`;
        }

        this.$store.dispatch('coins/setCoinsSorting', criteria);
        this.sortCriteria = criteria;
        return criteria;
      },

      async sortData(name, val) {
        await this.generateCriteria(name, val);
      },
    },

    computed: {
      ...mapState({
        dataView: state => state.common.data.view,
        coins: state => state.coins.list.all,
        interval: state => state.chart.interval,
        currency: state => state.common.currency,
      }),

      ...mapGetters({
        criteria: 'coins/sortCriteria',
      }),

      sortedContent() {
        if (isEmpty(this.content) || this.content.indexOf(undefined) !== -1) {
          return false;
        }
        return multisort(this.content.filter(el => typeof el !== 'undefined'), this.sortCriteria);
      },
    },
    fetch() {
    },
    beforeCreate() {
    },
    created() {
    },
    beforeMount() {
    },
    mounted() {
      this.checkContentView();
      this.getMinMax(this.content);
      this.sortCriteria = this.criteria;
    },
    beforeUpdate() {
    },
    updated() {
    },
    activated() {
    },
    deactivated() {
    },
    beforeDestroy() {
    },
    destroyed() {
    },
    errorCaptured() {
    },
  };
</script>

<style lang="sass">
  @import "./dataGrid.sass";
</style>
