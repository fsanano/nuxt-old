<template lang="pug">
  .aside__wrap(
  v-click-outside="hideOnMobile",
  :class="{'__active': menu === 'max', 'aside__wrap--mobile': isMobile}",
  )
    .aside__container(:class="{'__active': menu === 'max', 'aside__container--down': scrollDisabled}")
      ul.aside__menu
        li(:class="{'active': indices.indexOf(chosen) !== -1 && isIndexPage}")
          span(@click="toggleSubMenu('index')")
            .aside__item(
            v-tooltip.left="{content: $t('aside.index'), container: '.aside__wrap'}"
            )

              icon(:name="'indexes'").aside__icon
            .aside__txt(v-show="menu === 'max'", v-html="$t('aside.index')")
            icon(v-show="menu === 'max'", :name="'arrow_right'").aside__arrow

          .submenu__container(
          v-show="openedSubmenu === 'index' && menu === 'max'"
          )

            .submenu__title(@click="toggleSubMenu('')")
              icon.aside__arrow(
              :name="'arrow_left'"
              )
              | {{ $t('aside.index') }}
            nuxt-link.submenu__selectall.text-center(
            :to="`/${locale}/indices?interval=${interval}&currency=${currency}`"
            )
              span.selectall__btn(
              v-html="$t('aside.selectAll')"
              )

            .submenu__bar(v-bar)
              ul.submenu

                li.aside-coin(
                v-for="index in indices",
                :class="{'active': selectedIndices.indexOf(index) !== -1}"
                )
                  nuxt-link(
                    :to="`/${locale}/indices/${index}?interval=${interval}&currency=${currency}`",
                    @click.prevent.shift="toggleSelectedIndex(index)",
                    @click.prevent.exact="pushToIndexPage(index)"
                  )
                    span.aside-coin__icon
                      icon.aside__icon(
                      v-if="index === 'ICEI10'",
                      :name="'icei10'",
                      )
                      img(
                      v-else,
                      src="/favicons/48x48.png"
                      )
                    span.aside-index__name(v-html="index")

        li(:class="{'active': isCoinPage}")
          span(@click="toggleSubMenu('coinsIndex')")
            .aside__item(
            v-tooltip.left="{ content: $t('aside.coinsIndex'), container: '.aside__wrap'}"
            )

              icon(:name="'chart'").aside__icon
            .aside__txt(v-show="menu === 'max'", v-html="$t('aside.coinsIndex')")
            icon(v-show="menu === 'max'", :name="'arrow_right'").aside__arrow

          .submenu__container(v-show="openedSubmenu === 'coinsIndex' && menu === 'max'")
            .submenu__title(@click="toggleSubMenu('')")
              icon(:name="'arrow_left'").aside__arrow
              | {{ $t('aside.coinsIndex') }}

            //- div.submenu__selectall(v-html="$t('aside.selectAll')", @click="")
            nuxt-link.submenu__selectall.text-center(
            :to="`/${locale}/coins?interval=${interval}&currency=${currency}`"
            )
              span.selectall__btn(v-html="$t('aside.selectAll')")

            div(v-bar).submenu__list
              ul.submenu
                li(
                  v-for="coin in coins",
                  :class="{'active': gridCoins.indexOf(coin) !== -1}"
                ).aside-coin
                  a(
                    :href="`/${locale}/coins/${coin}?interval=${interval}&currency=${currency}`"
                    @click.prevent.shift="selectMultipleCoins(coin)",
                    @click.prevent.exact="pushToCoinPage(coin)"
                  )
                    span.aside-coin__icon
                      img(:src="'/img/coins/'+coin+'.svg'")
                    span.aside-coin__name(v-html="coin")

        li(:class="{'active': userIndices.indexOf(chosen) !== -1 && isIndexPage}" v-if="auth")
          span(@click="toggleSubMenu('userIndex')")
            .aside__item(
              v-tooltip.left="{content: $t('aside.myIndex'), container: '.aside__wrap'}"
            )

              icon(:name="'case'").aside__icon
            .aside__txt(v-show="menu === 'max'", v-html="$t('aside.myIndex')")
            icon(v-show="menu === 'max'", :name="'arrow_right'").aside__arrow

          .submenu__container(v-show="openedSubmenu === 'userIndex' && menu === 'max'")

            .submenu__title(@click="toggleSubMenu('')")
              icon(:name="'arrow_left'").aside__arrow
              | {{ $t('aside.myIndex') }}

            nuxt-link(
              v-if="userIndices.length > 0"
              :to="{ name: 'lang-indices-indexName', params: { lang: locale, currency } }"
            ).submenu__selectall.text-center
              span.selectall__btn(v-html="$t('aside.selectAll')")

            .submenu__selectall.text-center(@click="addIndex" v-else)
              span.selectall__btn(v-html="$t('aside.addIndex')")

            .submenu__bar(v-bar)
              ul.submenu

                li(v-for="index in userIndices" :class="{'active': selectedIndices.indexOf(index) !== -1}").aside-coin
                  a(
                    :href="`/${locale}/indices/${index}?interval=${interval}&currency=${currency}`"
                    @click.prevent.shift="toggleSelectedIndex(index)"
                    @click.prevent.exact="pushToIndexPage(index)"
                  )
                    span.aside-coin__icon
                      img(src="/favicons/48x48.png")
                    span.aside-index__name(v-html="index")

          //- nuxt-link(:to="{name: 'lang-currency-indices-userId'}")
          //-   .aside__item(
          //-   v-tooltip.left="{ content: $t('aside.myIndex'), container: '.aside__wrap'}"
          //-   )
          //-     icon(:name="'case'").aside__icon
          //-   .aside__txt(v-show="menu === 'max'", v-html="$t('aside.myIndex')")

        li(:class="{'active': isNewsPage}")
          span(@click="toggleSubMenu('news')")
            .aside__item(
            v-tooltip.left="{ content: $t('aside.news'), container: '.aside__wrap'}"
            )
              icon(:name="'news-global'").aside__icon
            .aside__txt(v-show="menu === 'max'", v-html="$t('aside.news')")
            icon(v-show="menu === 'max'", :name="'arrow_right'").aside__arrow

          .submenu__container(v-show="openedSubmenu === 'news' && menu === 'max'")

            .submenu__title(@click="toggleSubMenu('')")
              icon(:name="'arrow_left'").aside__arrow
              | {{ $t('aside.news') }}

            nuxt-link(:to="{ name: 'lang-feed-category', params: { lang: locale } }").submenu__selectall.text-center
              span.selectall__btn(v-html="$t('aside.selectAll')")

            ul.submenu
              li.aside-coin(v-for="category in categories", :class="{ 'active' : category === routeCategory }")
                span
                  div.aside-index__name.w-100.d-flex
                    span.aside-coin__icon(style="border-radius: 0;")
                      icon(:name="category.slug").aside__icon
                      //- img(:src="category.icon")
                    nuxt-link.d-block(:to="{ name: 'lang-feed-category', params: { lang: locale, category: category.slug } }") {{ category.name }}

        //- li
        //-   nuxt-link(to="/doc")
        //-     .aside__item(
        //-       v-tooltip.left="{ content: $t('aside.doc'), container: '.aside__wrap'}"
        //-     )
        //-       icon(:name="'dov'").aside__icon
        //-     .aside__txt(v-show="menu === 'max'", v-html="$t('aside.doc')")

        li
          a(:href="`https://icex.ch/${locale}`", target="_blank")
            .aside__item(
              v-tooltip.left="{ content: $t('aside.about'), container: '.aside__wrap'}"
            )
              icon(:name="'ex'").aside__icon
            .aside__txt(v-show="menu === 'max'", v-html="$t('aside.about')")

        li
          a(:href="`https://wallet.icex.ch/${locale}`", target="_blank")
            .aside__item(
            v-tooltip.left="{ content: $t('aside.wallet'), container: '.aside__wrap'}"
            )
              icon(:name="'icex-wallet-icon'").aside__icon
            .aside__txt(v-show="menu === 'max'", v-html="$t('aside.wallet')")

        li
          a(:href="`https://data.icex.ch/${locale}`", target="_blank")
            .aside__item(
            v-tooltip.left="{ content: $t('aside.dataAPI'), container: '.aside__wrap'}"
            )
              icon(:name="'icex-data-api-icon'").aside__icon
            .aside__txt(v-show="menu === 'max'", v-html="$t('aside.dataAPI')")

      footer.aside__footer
        //- nuxt-link(to="faq" v-html="$t('aside.faq')").aside__link
        //- br
        nuxt-link(:to="{name: 'lang-privacy', params: { lang: locale } }" v-html="$t('aside.privacy')").aside__link
        br
        nuxt-link(:to="{name: 'lang-terms', params: { lang: locale } }" v-html="$t('aside.terms')").aside__link

</template>

<script>
  import { mapState, mapGetters } from 'vuex';
  import icon from '~/components/ui/icon.vue';

  export default {
    name: 'default-aside',

    data() {
      return {
        submenu: ['index', 'coinsIndex', 'userIndex'],
        openedSubmenu: '',
        canCloseAside: false,
        prevValue: true,
      };
    },

    components: {
      icon,
    },

    methods: {
      /**
       * Hide aside menu on mobile if click outside aside menu
       * @return [Hide aside menu]
       */
      hideOnMobile() {
        // console.log('prev', this.prevValue);
        // console.log('current', this.isMobile && this.menu === 'max');
        if (this.prevValue && this.isMobile && this.menu === 'max') {
          setTimeout(() => {
            this.$store.dispatch('common/setUserMenuSize', 'min');
          }, 200);
        }
        this.prevValue = this.isMobile && this.menu === 'max';
      },
      /**
       * Redirect to coin page
       * @param  {String} coin [Coin name]
       * @return {}      [Change route ]
       */
      async pushToCoinPage(coin) {
        this.$router.push({
          name: 'lang-coins-coin',
          params: {
            coin,
            lang: this.locale,
          },
          query: {
            currency: this.$route.query.currency,
            interval: this.$route.query.interval,
            with: this.$route.query.with,
          },
        });
      },
      /**
       * Select multiple coins
       * @param  {String} coin [Coin name]
       * @return {[type]}      [description]
       */
      async selectMultipleCoins(coin) {
        if (coin === this.mainCoin) {
          return false;
        }

        const index = this.gridCoins.findIndex(el => el === coin);

        if (index > -1) {
          this.$store.dispatch('coins/removeGridCoin', coin);

          return this.$store.dispatch('chart/setItemVisibility', coin);
        }

        await this.$store.dispatch('coins/fetchCoinData', {
          name: coin,
          params: {
            detail: true,
            convert: this.currency,
          },
        });

        this.$store.dispatch('coins/setGridCoin', coin);

        if (typeof this.$route.params.coin !== 'undefined') {
          this.$router.push({
            name: 'lang-coins-coin',
            params: {
              coin: this.mainCoin,
              lang: this.locale,
            },
            query: {
              currency: this.$route.query.currency,
              interval: this.$route.query.interval,
              with: this.additionalCoins.join(','),
            },
          });
        }

        return true;
      },

      /**
       * Toggle submenu item by name
       * @param  {String} name [menu item name]
       */
      toggleSubMenu(name) {
        this.openedSubmenu = name;
        if (name) {
          this.$store.dispatch('common/setUserMenuSize', 'max');
        }
      },

      /**
       * [addIndex description]
       */
      addIndex() {
        if (this.userStatus !== 'pending') {
          this.$preventScroll.enable();
          this.$modal.show('addIndex');
        } else {
          this.$store.dispatch('notifications/addNotification', {
            type: 'warn',
            text: this.$t('notification.auth.verify'),
          });
        }
      },

      pushToIndexPage(index) {
        this.$router.push({
          name: 'lang-currency-indices-index-interval',
          params: {
            index,
            currency: this.currency,
            interval: this.interval,
            lang: this.locale,
          },
        });
      },

      toggleSelectedIndex(index) {
        this.$loader.show();
        this.$store.dispatch('indices/toggleActiveIndex', index);
        this.$store.state.indices.active
          .forEach(name => this.$store.dispatch('indices/fetchIndexData', {
            name,
            params: {
              convert: this.currency,
            },
          }));
        this.updateIndexPage();
      },

      updateIndexPage() {
        const extraIndices = [...this.selectedIndices];

        [this.rootIndex] = extraIndices;

        extraIndices.shift();

        this.$router.push({
          params: {
            index: this.rootIndex,
            currency: this.currency,
            lang: this.locale,
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
        auth: state => state.auth.auth,
        user: state => state.auth.data,
        menu: state => state.common.menu,
        theme: state => state.common.theme,
        locale: state => state.common.locale,
        coins: state => state.coins.list.all,
        coinsData: state => state.coins.data,
        indices: state => state.indices.list,
        chosen: state => state.indices.chosen,
        gridCoins: state => state.coins.grid,
        userId: state => state.auth.data.user_id,
        isMobile: state => state.common.isMobile,
        currency: state => state.common.currency,
        categories: state => state.news.categories,
        userStatus: state => state.auth.data.status,
        userIndices: state => state.indices.userList,
        selectedIndices: state => state.indices.active,
        scrollDisabled: state => state.common.scrollDisabled,
      }),
      ...mapGetters({
        mainCoin: 'coins/mainCoin',
        additionalCoins: 'coins/additionalCoins',
        isUserLoggedIn: 'auth/isUserLoggedIn',
      }),

      route() {
        return this.$route.name;
      },

      interval() {
        return this.$route.query.interval || 'day';
      },

      routeCategory() {
        return this.$route.params.category || null;
      },

      isCoinPage() {
        return this.$route.name.includes('coins');
      },

      isIndexPage() {
        return this.$route.name.includes('indices');
      },

      isNewsPage() {
        return this.$route.name.includes('feed');
      },


    },
    mounted() {
      if (this.isUserLoggedIn) {
        this.$store.dispatch('indices/fetchAllUserIndices', { id: this.user.user_id });
      }
      this.$store.dispatch('coins/fetchCoinsList', { convert: this.currency });
      this.$store.dispatch('coins/fetchActiveCoins', { convert: this.currency });
      this.$store.dispatch('indices/fetchAllIndices');
      this.$store.dispatch('indices/fetchActiveIndices');
      this.$store.dispatch('news/fetchCategories', { lang: this.lang });
    },
  };

</script>

<style lang="sass">
  @import "./aside"
</style>
