<template lang="pug">
  .chart-wrapper.pb-3
    .row
      .col-12.col-md-4.col-lg-3.mb-2
        .d-flex.flex-column.align-items-center(v-if="latestValues[0]")
          span.chart__value.text-center {{ valuesTime }}
          chart-item.mt-2(
          v-show="latestValues[0]",
          :content="latestValues[0]",
          :key="0"
          )
          chart-item.mt-2(
          v-show="latestValues[1]",
          :content="latestValues[1]",
          :key="1"
          )
          chart-item.mt-2(
          v-show="latestValues[2]",
          :content="latestValues[2]",
          :key="2"
          )
      .col-12.col-md-8.col-lg-9
        .chart-nav.d-flex.flex-wrap.justify-content-between.align-items.center.w-100
          .chart-nav__intervals.d-flex.mr-2
            .d-flex.align-items-center.mr-2
              button.chart-nav__zoom-in(@click="zoom('in')") +
              .chart-nav__zoom-delimiter
              button.chart-nav__zoom-out(@click="zoom('out')") -
            .d-flex.chart-nav__interval-list
              v-select.d-md-none(
              v-if="instance",
              :selected="interval",
              :options="chartIntervals",
              :open="chartTypeSelectOpen",
              @selected="setInterval({ value: $event })",
              @open="chartTypeSelectOpen = $event"
              )
              .interval__list.d-none.d-md-flex
                template(v-for="item in chartIntervals")
                  button.chart-nav__interval(
                  v-if="!item.disabled"
                  :class="[{ 'chart-nav__interval--active' : item.value === interval }]",
                  type="button",
                  @click="setInterval({ value: item.value })"
                  ) {{ item.text }}
          v-select.mr-2(
          v-if="instance",
          :selected="type",
          :options="seriesTypes",
          :open="seriesTypeSelectOpen",
          @selected="setChartType($event)",
          @open="seriesTypeSelectOpen = $event"
          )
          v-select.mr-2(
          v-if="instance && chartCoins.length > 0",
          :selected="subChart",
          :options="subSerialTypes",
          :open="subSerialTypeOpen",
          @selected="setChartSubType($event)",
          @open="subSerialTypeOpen = $event"
          )
          v-select.mr-2(
          v-if="instance && !userIndexIsOnChart",
          :selected="seriesUpdateInterval",
          :options="seriesUpdateIntervals",
          :open="seriesUpdateIntervalsOpen",
          @selected="setSeriesUpdateInterval($event)",
          @open="seriesUpdateIntervalsOpen = $event"
          )
          div.d-flex.ml-auto.mt-2.mt-md-0
            .d-flex.align-items-center.relative
              .chart__picker-wrap(
              :class="[{ 'chart__picker-wrap--active' : showDatePicker }]"
              )
                div.pointer(@click="showDatePicker = !showDatePicker")
                  span.label.mr-1(v-html="$t('from')")
                  span.date.mr-1 {{ formatUnix(start, 'DD.MM.YY') }}
                  span.label.mr-1(v-html="$t('to')")
                  span.date {{ formatUnix(end, 'DD.MM.YY') }}
                keep-alive
                  template(v-if="showDatePicker")
                    date-picker(
                    v-click-outside="hideDatePicker",
                    :activeSegment="segment",
                    :start="start",
                    :end="end",
                    :interval="interval",
                    :showCalendar="showCalendar",
                    :showTimePicker="showTimePicker",
                    :showDatePicker="showDatePicker",
                    :maxRange="ranges[interval].maxRange",
                    :minDate="1506805200",
                    class="chart__date-picker",
                    @set="onDateTimeSet($event)",
                    @segment="fetchSegmentedHistory($event)",
                    )
        span(
        v-html="$t(`chart.socketConnectionStatus.${socketStatus}`)",
        :class="['chart__socket-status', `chart__socket-status--${socketStatus}`]",
        )
        .chart.w-100(
        :id="id",
        )
</template>

<script>
  // import Highcharts from 'highcharts/highstock';
  import Vue from 'vue';
  import { mapGetters, mapState } from 'vuex';
  import Raven from 'raven-js';
  // Alternatively, this is how to load Highstock. Highmaps is similar.
  import Highcharts from 'highcharts/highstock';
  // Load the exporting module.
  import Exporting from 'highcharts/modules/exporting';
  import moment from 'moment';
  import 'moment/locale/ru';
  import datePicker from '~/components/blocks/datePicker';
  import vSelect from '~/components/ui/select';
  import chartItem from '~/components/blocks/chartItem';
  import merge from 'lodash.merge';
  import diff from 'lodash.difference';
  import get from 'lodash.get';

  // Chart settings
  import locales from './locales.json';
  import themeLight from './themeLight.json';
  import themeDark from './themeDark.json';

  let vm = null;
  const mobileBreakpoint = 500;

  export default {
    name: 'chart',
    props: {
      id: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        instance: null,
        chartWidth: 0,
        colors: ['#FF9F1C', '#E71D36', '#2EC4B6'],
        segment: '',
        interval: '1d',
        type: 'spline',
        subChart: 'capitalization',
        seriesUpdateInterval: 3000,
        tooltipX: null,
        start: 0,
        end: 0,
        disableZoomInButton: false,
        disableZoomOutButton: false,
        fetchingData: false,
        plotIsHovered: false,
        showDatePicker: false,
        chartTypeSelectOpen: false,
        seriesTypeSelectOpen: false,
        subSerialTypeOpen: false,
        seriesUpdateIntervalsOpen: false,
        prevTooltipPoint: null,
        latestValues: [],
        socketSubscriptionTimeout: null,

        // contains name -> timestamp (in ms) pairs to filter point updates like 1 update in 5 seconds
        socketLastEventTime: {},
        socketEntities: {
          coin: 'coins',
          index: 'index',
        },
        fetchParams: {
          count: {
            month: 24,
            week: 24,
            day: 30,
            hour: 24,
            five_minutes: 24,
            minute: 60,
          },
          start: {
            '1m': function s() {
              return moment().subtract(24, 'month').unix();
            },
            '1w': function s() {
              return moment().subtract(6, 'month').unix();
            },
            '1d': function s() {
              return moment().subtract(1, 'month').unix();
            },
            '1h': function s() {
              return moment().subtract(1, 'day').unix();
            },
            '5i': function s() {
              return moment().subtract(1, 'hour').unix();
            },
            '1i': function s() {
              return moment().subtract(60, 'minute').unix();
            },
            '30s': function s() {
              return moment().subtract(20, 'minute').unix();
            },
            '15s': function s() {
              return moment().subtract(10, 'minute').unix();
            },
            '5s': function s() {
              return moment().subtract(5, 'minute').unix();
            },
          },
        },
        ranges: {
          '1m': {
            range: 2678400 * 24,
            maxRange: undefined,
            minRange: 2678400,
          },
          '1w': {
            range: 604800 * 12,
            maxRange: undefined,
            minRange: 604800 * 2,
          },
          '1d': {
            range: 86400 * 14,
            maxRange: 86400 * 365,
            minRange: 86400 * 5,
          },
          '1h': {
            range: 3600 * 24,
            maxRange: 3600 * 24 * 14,
            minRange: 3600 * 5,
          },
          '5i': {
            range: 300 * 24,
            maxRange: 300 * 48 * 2,
            minRange: 300 * 5,
          },
          '1i': {
            range: 60 * 60,
            maxRange: 60 * 360,
            minRange: 60 * 10,
          },
          '30s': {
            range: 30 * 45,
            maxRange: 30 * 2 * 90,
            minRange: 30 * 10,
          },
          '15s': {
            range: 15 * 60,
            maxRange: 15 * 4 * 30,
            minRange: 15 * 10,
          },
          '5s': {
            range: 5 * 60,
            maxRange: 5 * 12 * 10,
            minRange: 5 * 10,
          },
        },
        options: {
          chart: {
            animation: true,
            height: 600,
            resetZoomButton: {
              theme: {
                display: 'none',
              },
            },
            spacingBottom: 0,
            spacingTop: 0,
            spacingLeft: 0,
            spacingRight: 0,
            style: {
              fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Oxygen-Sans, Ubuntu, Cantarell, \'Helvetica Neue\', sans-serif',
            },
            zoomType: 'x',
          },
          credits: false,
          exporting: {
            enabled: true,
            fallbackToExportServer: false,
            scale: 2,
            sourceHeight: 500,
            sourceWidth: 1235,
          },
          legend: {
            enabled: false,
          },
          navigator: {
            adaptToUpdatedData: false,
            enabled: true,
            series: {
              type: 'spline',
            },
          },
          plotOptions: {
            areaspline: {
              marker: {
                enabled: false,
              },
            },
            area: {
              lineColor: '#0b50cd',
              marker: {
                enabled: false,
              },
            },
            series: {
              events: {
                mouseOver: this.setPlotHovered,
                mouseOut: this.setPlotHovered,
              },
              marker: {
                states: {
                  select: {
                    enabled: false,
                  },
                },
              },
              turboThreshold: 0,
            },
            spline: {
              marker: {
                enabled: false,
              },
            },
          },
          rangeSelector: {
            allButtonsEnabled: false,
            buttons: [],
            enabled: false,
          },
          scrollbar: {
            enabled: true,
            liveRedraw: false,
          },
          time: {
            useUTC: false,
          },
          title: {
            text: null,
          },
          tooltip: {
            crosshairs: {
              color: '#FF9F1C',
              dashStyle: 'solid',
            },
            formatter() {
              if (vm.tooltipX !== this.points[0].key) {
                vm.latestValues = this.points
                  .filter(p => !p.series.name.includes('sub'))
                  .map((p) => {
                    const isFirstPointInArray = p.point.index === 0;
                    const prevPoint = !isFirstPointInArray
                      ? p.series.data[p.point.index - 1]
                      : null;
                    return {
                      name: p.point.series.name,
                      color: p.point.color,
                      change: get(p, 'point.change', 0),
                      price: {
                        value: p.point.close,
                        grow: String(p.point.change).charAt(0) !== '-',
                      },
                      capitalization: {
                        value: p.point.capitalization,
                        grow: prevPoint ? p.point.capitalization > prevPoint.capitalization : true,
                      },
                      volume: {
                        value: p.point.volume,
                        grow: prevPoint ? p.point.volume > prevPoint.volume : true,
                      },
                      high: {
                        value: p.point.high,
                        grow: prevPoint ? p.point.high > prevPoint.high : true,
                      },
                      low: {
                        value: p.point.low,
                        grow: prevPoint ? p.point.low > prevPoint.low : true,
                      },
                      open: {
                        value: p.point.open,
                        grow: prevPoint ? p.point.open > prevPoint.open : true,
                      },
                      close: {
                        value: p.point.close,
                        grow: prevPoint ? p.point.close > prevPoint.close : true,
                      },
                      x: p.point.x,
                    };
                  });
                vm.tooltipX = this.points[0].key;
              }
              return false;
            },
            shared: true,
          },
          xAxis: [
            {
              events: {
                afterSetExtremes: this.afterSetExtremes,
              },
              id: 'x-axis',
              labels: {
                y: 25,
              },
              minPadding: 0,
              maxPadding: 0,
              startOnTick: false,
              type: 'datetime',
            },
          ],
          yAxis: [
            {
              id: 'y-axis-0',
              floor: 0,
              height: '80%',
              labels: {
                align: 'left',
                enabled: true,
                x: 2,
                y: -4,
              },
              maxPadding: 0,
              minPadding: 0,
              opposite: true,
              showLastLabel: false,
              title: {
                text: '   ',
              },
            },
            {
              id: 'y-axis-1',
              floor: 0,
              height: '80%',
              labels: {
                align: 'left',
                enabled: true,
                x: 2,
                y: -4,
              },
              maxPadding: 0,
              minPadding: 0,
              opposite: true,
              showLastLabel: false,
              title: {
                text: '   ',
              },
            },
            {
              id: 'y-axis-2',
              floor: 0,
              height: '80%',
              labels: {
                align: 'left',
                enabled: true,
                x: 2,
                y: -4,
              },
              maxPadding: 0,
              minPadding: 0,
              opposite: true,
              showLastLabel: false,
              title: {
                text: '   ',
              },
            },
            {
              id: 'y-axis-3',
              height: '20%',
              labels: {
                align: 'left',
                enabled: true,
                x: 2,
                y: -4,
              },
              lineWidth: 1,
              offset: 0,
              opposite: true,
              showLastLabel: false,
              top: '80%',
              tickAmount: 4,
            },
          ],
          responsive: {
            rules: [
              {
                condition: {
                  maxWidth: mobileBreakpoint,
                },
                chartOptions: {
                  chart: {
                    height: 300,
                  },
                  exporting: {
                    enabled: false,
                  },
                  navigator: {
                    enabled: false,
                  },
                  scrollbar: {
                    enabled: false,
                  },
                  yAxis: [
                    { labels: { enabled: false }, title: { text: null } },
                    { labels: { enabled: false }, title: { text: null } },
                    { labels: { enabled: false }, title: { text: null } },
                    { labels: { enabled: false }, title: { text: null } },
                  ],
                },
              },
            ],
          },
        }
        ,
      };
    },
    components: {
      datePicker,
      vSelect,
      chartItem,
    },
    watch: {
      chartItems: {
        // triggers after add/remove item from coin or index data block
        async handler(newValue, oldValue) {
          this.handleChartItemsChange(newValue, oldValue);
        },
        deep: true,
      },
      echoChannelsList: {
        /**
         * When we add or remove items on chart
         * channels list has been changed
         * we need to unsubscribe from removed items
         * and subscribe on added
         */
        handler(newValue, oldValue) {
          const channelsToLeave = diff(oldValue, newValue) || [];
          const channelsToJoin = diff(newValue, oldValue) || [];

          channelsToLeave.forEach(el => this.leaveSocketChannel(el));
          channelsToJoin.forEach(el => this.joinSocketChannel(el));
        },
        deep: true,
        immediate: true,
      },
      locale: {
        /**
         * When change locale from header or route - update language
         * in graph labels and datetime picker
         */
        handler(value) {
          moment.locale(value);
          return this.instance && this.instance.update(this.localeJSON);
        },
        immediate: true,
      },
      theme() {
        return this.instance && this.instance.update(this.themeJSON);
      },
      /**
       * When we open aside menu graph container changes its width
       * but doesn't trigger window resize, so we need to
       * reflow graph manually.
       */
      menu() {
        // timeout while all animations will be done
        setTimeout(() => {
          this.instance.reflow();
          this.updateChartWidth();
        }, 200);
      },
      userIndexIsOnChart(value) {
        if (value) {
          return this.setSeriesUpdateInterval(false);
        }
        return this.setSeriesUpdateInterval(3000);
      },
    },
    methods: {
      async handleChartItemsChange(newValue, oldValue) {
        if (!this.instance) {
          return false;
        }
        // By now there will be stored only one value in array
        const seriesToRemove = diff(oldValue, newValue) || [];
        const seriesToAdd = diff(newValue, oldValue) || [];

        const existingSeriesLength = newValue.length - 1;

        if (seriesToAdd.length > 0) {
          this.fetchingData = true;
          this.instance.showLoading();


          const [itemToAdd] = seriesToAdd;
          const promises = [];
          const isCoin = itemToAdd.entity === 'coin';

          promises.push(this.fetchHistory({
            name: itemToAdd.name,
            entity: itemToAdd.entity,
            params: {
              convert: this.currency,
              interval: this.interval,
              candles: true,
              volume: isCoin ? '24h' : null,
              cap: isCoin,
              start: this.start,
              end: this.end,
            },
          }));
          promises.push(this.fetchHistory({
            name: itemToAdd.name,
            entity: itemToAdd.entity,
            params: {
              convert: this.currency,
              interval: '1d',
            },
          }));

          const response = await Promise.all(promises);

          if (response.some(r => r.data.result === false)) {
            this.fetchingData = false;
            this.instance.hideLoading();
            return this.$store.dispatch('notifications/addNotification', {
              type: 'warn',
              text: `Failed to fetch ${itemToAdd.name} history.`,
            });
          }

          const [chartResponse, navigatorResponse] = response;
          const chartRawData = chartResponse.data.data
            .reduce((acc, el) => {
              acc.push([el.name, el.values]);
              return acc;
            }, []);

          const navigatorRawData = navigatorResponse.data.data
            .reduce((acc, el) => {
              acc.push([el.name, el.values]);
              return acc;
            }, []);

          const series = chartRawData.map((el, i) => {
            const data = this.createSeriesData(el[1]);
            let [comparePoint, lastPoint] = data.slice(-2); // eslint-disable-line prefer-const

            if (typeof lastPoint === 'undefined') {
              lastPoint = comparePoint;
            }

            const sameName = this.latestValues.length > 0 && this.latestValues[i].name === el[0];

            Vue.set(
              this.latestValues,
              sameName ? i : this.latestValues.length,
              {
                name: el[0],
                color: this.colors[existingSeriesLength + i],
                change: get(lastPoint, 'change', 0),
                price: {
                  value: lastPoint.close,
                  grow: lastPoint.close > comparePoint.close,
                },
                high: {
                  value: lastPoint.high,
                  grow: lastPoint.high > comparePoint.high,
                },
                low: {
                  value: lastPoint.low,
                  grow: lastPoint.low > comparePoint.low,
                },
                open: {
                  value: lastPoint.open,
                  grow: lastPoint.open > comparePoint.open,
                },
                close: {
                  value: lastPoint.close,
                  grow: lastPoint.close > comparePoint.close,
                },
                capitalization: {
                  value: lastPoint.capitalization,
                  grow: lastPoint.capitalization > comparePoint.capitalization,
                },
                volume: {
                  value: lastPoint.volume,
                  grow: lastPoint.volume > comparePoint.volume,
                },
                x: lastPoint.x,
              },
            );

            return {
              name: el[0],
              id: el[0],
              data,
              type: this.type,
              color: this.colors[existingSeriesLength + i],
              lineColor: this.colors[existingSeriesLength + i],
              upColor: 'transparent',
              yAxis: `y-axis-${existingSeriesLength + i}`,
              xAxis: 0,
              showInNavigator: true,
              navigatorOptions: {
                name: `${el[0]}-navigator`,
                type: 'spline',
                color: this.colors[existingSeriesLength + i],
                data: this.createSeriesData(navigatorRawData[i][1]),
              },
            };
          });

          if (itemToAdd.entity === 'coin') {
            chartRawData.forEach((el, i) => {
              series.push({
                name: `${el[0]}-sub`,
                id: `${el[0]}-sub`,
                linkedTo: el[0],
                data: el[1].map(e => [e.timestamp, get(e, 'capitalization.value', 0)]),
                type: this.subChartType,
                yAxis: 'y-axis-3',
                xAxis: 0,
                color: this.colors[existingSeriesLength + i],
                lineColor: this.colors[existingSeriesLength + i],
                upColor: 'transparent',
                showInNavigator: false,
              });
            });
          }

          series.forEach(el => this.addSeries({ series: el, redraw: false }));
          this.instance.hideLoading();
          this.$emit('init');
        }

        if (seriesToRemove.length > 0) {
          seriesToRemove.forEach((el) => {
            // Remove main graph
            this.removeSeries({ id: el.name, redraw: false });
            // Remove sub graph (volume/capitalization)
            this.removeSeries({ id: `${el.name}-sub`, redraw: false });
            // Remove last point value from chart aside
            const index = this.latestValues.findIndex(v => v.name === el.name);
            this.latestValues = [
              ...this.latestValues.slice(0, index),
              ...this.latestValues.slice(index + 1),
            ];
            this.latestValues.forEach((v, i) => Vue.set(this.latestValues[i], 'color', this.colors[i]));
          });

          newValue.forEach((el, i) => {
            const series = this.instance.get(el.name);

            if (series) {
              // On mobiles there is no navigator
              if (series.navigatorSeries) {
                series.navigatorSeries.update({
                  color: this.colors[i],
                }, false);
              }
              // Update colors in sub graph (volume/capitalization)
              // If it is index - linkedSeries = []
              series.linkedSeries.forEach(l => l.update({
                color: this.colors[i],
                lineColor: this.colors[i],
              }, false));
              // Update main graph colors and y axis
              series.update({
                color: this.colors[i],
                lineColor: this.colors[i],
                yAxis: `y-axis-${i}`,
              }, false);
            }
          });
        }

        const isChartContainsCoin = this.chartCoins.length > 0;

        this.chartItems.forEach(({ name }) => {
          const s = this.instance.get(name);
          s.yAxis.update({ height: isChartContainsCoin ? '80%' : '100%' }, true);
        });

        const yAxisSub = this.instance.get('y-axis-3');
        yAxisSub.update({
          height: isChartContainsCoin ? '20%' : '0%',
          visible: isChartContainsCoin,
        }, false);

        const axis = this.instance.get('x-axis');
        axis.setExtremes(this.start * 1000, this.end * 1000, false);

        this.instance.redraw();
        this.instance.reflow();
        this.fetchingData = false;

        return false;
      },
      /**
       * this method fires when user change graph range
       * via navigator, zoom buttons or datetime picker
       */
      async afterSetExtremes(event) {
        if (event.trigger || event.zoom || event.picker) {
          this.disableZoomInButton = true;
          this.disableZoomOutButton = true;

          const start = moment(event.min).unix();
          const navigator = this.instance.get('navigator-x-axis') || null;
          const isLatestPointReached = navigator
            ? navigator.max === event.max
            : false;
          const end = isLatestPointReached
            ? moment().unix() - 1
            : moment(event.max).unix();
          const oldStart = this.start;
          const oldEnd = this.end;
          const axis = this.instance.get('x-axis');

          this.end = end;
          this.start = start;

          Raven.captureBreadcrumb({
            message: 'Changed chart extremes',
            category: 'chart',
            level: 'info', // error, warning, info, or debug.
            data: { event },
          });

          // If we only narrowing graph range, we don't want to fetch any data just update extremes
          if (start >= oldStart && end <= oldEnd) {
            return axis.setExtremes(start * 1000, end * 1000, true);
          }

          this.fetchingData = true;
          this.instance.showLoading();

          const promises = [];

          if (this.chartCoins.length > 0) {
            const [mainCoin, ...coinWith] = this.chartCoins;
            promises.push(this.fetchHistory({
              name: mainCoin,
              entity: 'coin',
              params: {
                convert: this.currency,
                interval: this.interval,
                candles: true,
                volume: '24h',
                cap: true,
                start: this.start,
                end: this.end,
                with: coinWith.join(','),
                entity: 'coin',
              },
            }));
          }

          if (this.chartIndices.length > 0) {
            const [mainIndex, ...indexWith] = this.chartIndices;
            promises.push(this.fetchHistory({
              name: mainIndex,
              entity: 'index',
              params: {
                convert: this.currency,
                interval: this.interval,
                candles: true,
                start: this.start,
                end: this.end,
                with: indexWith.join(','),
                entity: 'index',
              },
            }));
          }

          const response = await Promise.all(promises);

          if (response.some(r => r.data.result === false)) {
            this.fetchingData = false;
            this.instance.hideLoading();
            this.$store.dispatch('notifications/addNotification', {
              type: 'error',
              text: 'Failed to fetch history after set extremes.',
            });
            return axis.setExtremes(oldStart * 1000, oldEnd * 1000, true);
          }

          const data = response.reduce((acc, res) => {
            res.data.data.forEach(el => acc.push([el.name, res.data.entity, el.values]));
            return acc;
          }, []);

          data.forEach((el) => {
            const series = this.instance.get(el[0]);
            const points = this.createSeriesData(el[2]);

            const [comparePoint, lastPoint] = points.slice(-2);

            const index = this.latestValues.findIndex(l => l.name === el[0]);

            Vue.set(
              this.latestValues,
              index,
              {
                name: el[0],
                color: this.latestValues[index].color,
                change: get(lastPoint, 'change', 0),
                price: {
                  value: lastPoint.close,
                  grow: lastPoint.close > comparePoint.close,
                },
                high: {
                  value: lastPoint.high,
                  grow: lastPoint.high > comparePoint.high,
                },
                low: {
                  value: lastPoint.low,
                  grow: lastPoint.low > comparePoint.low,
                },
                open: {
                  value: lastPoint.open,
                  grow: lastPoint.open > comparePoint.open,
                },
                close: {
                  value: lastPoint.close,
                  grow: lastPoint.close > comparePoint.close,
                },
                capitalization: {
                  value: lastPoint.capitalization,
                  grow: lastPoint.capitalization > comparePoint.capitalization,
                },
                volume: {
                  value: lastPoint.volume,
                  grow: lastPoint.volume > comparePoint.volume,
                },
                x: lastPoint.x,
              },
            );

            series.setData(points, false);
            // If entity equals coin - update sub graph
            if (el[1] === 'coin') {
              series.linkedSeries.forEach(l => l.setData(
                points.map(p => [p.x, p[this.subChart]]),
                false,
              ));
            }
          });

          axis.setExtremes(this.start * 1000, this.end * 1000, false);

          this.instance.redraw();
          this.fetchingData = false;
          this.disableZoomInButton = false;
          this.disableZoomOutButton = false;
          this.instance.hideLoading();
        }
        return false;
      },

      async setInterval({ value }) {
        if (this.interval !== value) {
          this.fetchingData = true;
          this.instance.showLoading();

          Raven.captureBreadcrumb({
            message: `Changed chart interval to ${value}`,
            category: 'chart',
            level: 'info', // error, warning, info, or debug.
          });

          const newEnd = moment().unix();
          const newStart = newEnd - this.ranges[value].range;

          const promises = [];

          if (this.chartCoins.length > 0) {
            const [mainCoin, ...coinWith] = this.chartCoins;
            promises.push(this.fetchHistory({
              name: mainCoin,
              entity: 'coin',
              params: {
                convert: this.currency,
                interval: value,
                candles: true,
                volume: '24h',
                cap: true,
                start: newStart,
                end: newEnd,
                with: coinWith.join(','),
                entity: 'coin',
                notifyOnError: true,
              },
            }));
          }

          if (this.chartIndices.length > 0) {
            const [mainIndex, ...indexWith] = this.chartIndices;
            promises.push(this.fetchHistory({
              name: mainIndex,
              entity: 'index',
              params: {
                convert: this.currency,
                interval: value,
                candles: true,
                start: newStart,
                end: newEnd,
                with: indexWith.join(','),
                entity: 'index',
                notifyOnError: true,
              },
            }));
          }

          const response = await Promise.all(promises);

          if (response.some(r => r.data.result === false)) {
            this.fetchingData = false;
            this.instance.hideLoading();
            return this.$store.dispatch('notifications/addNotification', {
              type: 'warn',
              text: 'Failed to fetch history after interval change.',
            });
          }

          const data = response.reduce((acc, res) => {
            res.data.data.forEach(el => acc.push([el.name, res.data.entity, el.values]));
            return acc;
          }, []);

          data.forEach((el) => {
            const series = this.instance.get(el[0]);
            const points = this.createSeriesData(el[2]);

            const [comparePoint, lastPoint] = points.slice(-2);

            if (comparePoint && lastPoint) {
              const index = this.latestValues.findIndex(l => l.name === el[0]);

              Vue.set(
                this.latestValues,
                index,
                {
                  name: el[0],
                  color: this.latestValues[index].color,
                  change: get(lastPoint, 'change', 0),
                  price: {
                    value: lastPoint.close,
                    grow: lastPoint.close > comparePoint.close,
                  },
                  high: {
                    value: lastPoint.high,
                    grow: lastPoint.high > comparePoint.high,
                  },
                  low: {
                    value: lastPoint.low,
                    grow: lastPoint.low > comparePoint.low,
                  },
                  open: {
                    value: lastPoint.open,
                    grow: lastPoint.open > comparePoint.open,
                  },
                  close: {
                    value: lastPoint.close,
                    grow: lastPoint.close > comparePoint.close,
                  },
                  capitalization: {
                    value: lastPoint.capitalization,
                    grow: lastPoint.capitalization > comparePoint.capitalization,
                  },
                  volume: {
                    value: lastPoint.volume,
                    grow: lastPoint.volume > comparePoint.volume,
                  },
                  x: lastPoint.x,
                },
              );
            }

            series.setData(points, false);
            if (el[1] === 'coin') {
              series.linkedSeries.forEach(l => l.setData(
                points.map(p => [p.x, p[this.subChart]]),
                false,
              ));
            }
          });

          const axis = this.instance.get('x-axis');
          const navigator = this.instance.get('navigator-x-axis');

          axis.update({
            minRange: this.ranges[value].minRange * 1000,
            maxRange: this.ranges[value].maxRange * 1000,
          }, false);
          // On mobiles there is no navigator
          if (navigator) {
            navigator.update({
              minRange: this.ranges[value].minRange * 1000,
              maxRange: this.ranges[value].maxRange * 1000,
            }, false);
          }

          axis.setExtremes(newStart * 1000, newEnd * 1000, false);

          // TODO: quick dirty fix. Rewrtie and remove it later
          if (value === '30s' || value === '15s' || value === '5s') {
            this.instance.navigator.update({ enabled: false }, false);
            this.instance.update({ scrollbar: { enabled: false } }, false);
          } else {
            this.instance.navigator.update({ enabled: true }, false);
            this.instance.update({ scrollbar: { enabled: true } }, false);
          }

          this.end = newEnd;
          this.start = newStart;
          this.interval = value;
          this.segment = '';
          this.instance.redraw();
          this.fetchingData = false;
          this.instance.hideLoading();
          this.$emit('interval', this.chartIntervals.find(el => el.value === value).full);
        }
        return false;
      },

      handleNewPointFromSocket({
        event,
        name,
        entity,
        channel,
      }) {
        /**
         * We can handle new point request only if:
         * User watching latest series data
         * User is not fetching data (like on set interval/segment or after extremes set)
         * Instance exists in case socket connected before its creation
         * Plot is not hovered by user
         */
        clearTimeout(this.socketSubscriptionTimeout);
        if (
          !this.instance ||
          this.isChartRangeInPast ||
          // this.plotIsHovered ||
          this.fetchingData
        ) {
          return false;
        }
        /**
         * Take JSON and convert all values into Numbers
         */
        const d = JSON.parse(event);
        const pricePoint = {
          x: 1 * d.period_start,
          timestamp: 1 * d.updated_at,
          open: 1 * d.open * this.rate,
          y: 1 * d.close * this.rate,
          close: 1 * d.close * this.rate,
          high: 1 * d.max * this.rate,
          low: 1 * d.min * this.rate,
          volume: 1 * d.vol * this.rate || 0,
          capitalization: 1 * d.cap * this.rate || 0,
          change: 1 * d.change,
        };

        /**
         * If it's less than N seconds since last socket event -
         * do nothing
         */
        if (pricePoint.timestamp - this.socketLastEventTime[name] <= this.seriesUpdateInterval) {
          // console.log('filtered point', moment(pricePoint.timestamp).format('HH:mm:ss'));
          return false;
        }

        // Update last socket event time
        Vue.set(this.socketLastEventTime, name, pricePoint.timestamp);

        /**
         * Catch socket error when seconds or milliseconds isn't equal zero
         */
        if (pricePoint.x.toString().slice(10) !== '000') {
          Raven.captureMessage(
            'Wrong milliseconds value at period_start in socket event [notify-backend]',
            {
              extra: {
                socketChannel: channel,
                socketEventData: d,
              },
            },
          );
          // console.log('falsy point', moment(pricePoint.timestamp).format('HH:mm:ss'));
          return false;
        }

        const serial = this.instance.get(name) || null;
        /**
         * If somehow serial doesn't exist (what is unlikely), do nothing
         * OR
         * If serial is hidden - do nothing
         */
        if (!serial || !serial.visible) {
          return false;
        }

        const getFirstValidPointFromFirstSerie = () => {
          const serie = this.instance.get(this.chartItems[0].name);
          const points = serie.getValidPoints(undefined, true);
          return points[0] || {};
        };

        const lastExistingPointIndex = serial.data.length - 1;
        const lastExistingPoint = serial.data[lastExistingPointIndex];
        const comparePoint = serial.data[lastExistingPointIndex - 1];
        const sameDate = lastExistingPoint.x - pricePoint.x === 0;
        const sameValue = Math.abs(lastExistingPoint.y - pricePoint.y) < 0.00000001;
        /**
         * If it has same date and value as last point on chart - we don't need to update it
         */
        if (sameDate && sameValue) {
          // console.log('same date&value point', moment(pricePoint.timestamp).format('HH:mm:ss'));
          return false;
        }

        // If it's coins - we need to update its sub graph (vol/cap)
        const subSerial = entity === 'coins'
          ? serial.linkedSeries[0]
          : null;

        const subPoint = subSerial
          ? {
            x: pricePoint.x,
            y: this.subChart === 'volume' ? pricePoint.volume : pricePoint.capitalization,
          }
          : null;

        // If point has not same date as previous one - we append new point as well
        if (!sameDate) {
          if (subPoint) {
            subSerial.addPoint(subPoint, false, true);
          }
          serial.addPoint(pricePoint, false, true);
          // console.log('ADD point', moment(pricePoint.timestamp).format('HH:mm:ss'));
          // Update extremes to push graph range forward to new point
          const axis = this.instance.get('x-axis');
          axis.setExtremes(getFirstValidPointFromFirstSerie().x, pricePoint.x, false);
        }

        // It point has new value but same date as previous - we update existing point
        if (!sameValue && sameDate) {
          if (subPoint) {
            const lastSubSerialPoint = subSerial.data[subSerial.data.length - 1];
            lastSubSerialPoint.update(subPoint, false);
          }
          lastExistingPoint.update(pricePoint, false);
          // console.log('UPDATE point', moment(pricePoint.timestamp).format('HH:mm:ss'));
        }

        // Finally redraw all changes
        this.instance.redraw();

        const index = this.latestValues.findIndex(el => el.name === name);

        // Update values to show them in left aside block
        if (!this.plotIsHovered) {
          Vue.set(this.latestValues, index, {
            name,
            color: lastExistingPoint.color,
            change: get(pricePoint, 'change', 0),
            price: {
              value: pricePoint.close,
              grow: String(pricePoint.change).charAt(0) !== '-',
            },
            capitalization: {
              value: pricePoint.capitalization,
              grow: pricePoint.capitalization > comparePoint.capitalization,
            },
            volume: {
              value: pricePoint.volume,
              grow: pricePoint.volume > comparePoint.volume,
            },
            high: {
              value: pricePoint.high,
              grow: pricePoint.high > comparePoint.high,
            },
            low: {
              value: pricePoint.low,
              grow: pricePoint.low > comparePoint.low,
            },
            open: {
              value: pricePoint.open,
              grow: pricePoint.open > comparePoint.open,
            },
            close: {
              value: pricePoint.close,
              grow: pricePoint.close > comparePoint.close,
            },
            x: pricePoint.x,
          });
        }

        this.end = pricePoint.x / 1000;
        this.start = getFirstValidPointFromFirstSerie().x / 1000;

        return true;
      },

      async fetchSegmentedHistory(segment) {
        this.instance.showLoading();
        this.fetchingData = true;
        this.segment = segment;
        this.showDatePicker = false;

        Raven.captureBreadcrumb({
          message: `Fetching ${segment} segment history`,
          category: 'chart',
          level: 'info', // error, warning, info, or debug.
          data: { segment },
        });

        const promises = [];

        if (this.chartCoins.length > 0) {
          const [mainCoin, ...coinWith] = this.chartCoins;
          promises.push(this.fetchHistory({
            name: mainCoin,
            entity: 'coin',
            params: {
              convert: this.currency,
              interval: this.interval,
              candles: true,
              volume: '24h',
              cap: true,
              with: coinWith.join(','),
              segment,
              entity: 'coin',
            },
          }));
        }

        if (this.chartIndices.length > 0) {
          const [mainIndex, ...indexWith] = this.chartIndices;
          promises.push(this.fetchHistory({
            name: mainIndex,
            entity: 'index',
            params: {
              convert: this.currency,
              interval: this.interval,
              candles: true,
              segment,
              with: indexWith.join(','),
              entity: 'index',
            },
          }));
        }

        const response = await Promise.all(promises);

        if (response.some(r => r.data.result === false)) {
          this.fetchingData = false;
          this.instance.hideLoading();
          return this.$store.dispatch('notifications/addNotification', {
            type: 'warn',
            text: 'Failed to fetch history on segment change.',
          });
        }

        const data = response.reduce((acc, res) => {
          res.data.data.forEach(el => acc.push([el.name, res.data.entity, el.values]));
          return acc;
        }, []);

        data.forEach((el) => {
          const series = this.instance.get(el[0]);
          const points = this.createSeriesData(el[2]);

          series.setData(points, false);
          if (el[1] === 'coin') {
            series.linkedSeries.forEach(l => l.setData(
              points.map(p => [p.x, p[this.subChart]]),
              false,
            ));
          }
        });

        const [start] = data[0][2];
        const [end] = data[0][2].slice(-1);

        const axis = this.instance.get('x-axis');
        axis.setExtremes(start.timestamp, end.timestamp, false);

        this.start = start.timestamp;
        this.end = end.timestamp;

        this.instance.redraw();
        this.fetchingData = false;
        return this.instance.hideLoading();
      },

      fetchHistory({ name, entity, params }) {
        return this.$store.dispatch('history/fetch', {
          name,
          entity,
          params,
        });
      },

      joinSocketChannel(channel) {
        const [entity, name] = channel.split(':');
        const subscriptionTime = Date.now();
        // set time of subscriptions to help filtering event out
        Vue.set(this.socketLastEventTime, name, subscriptionTime);

        this.$echo.channel(channel)
          .listen('.update', event => this.handleNewPointFromSocket({
            event,
            name,
            entity,
            channel,
          }));

        Raven.captureBreadcrumb({
          message: `Joined ${channel} socket channel`,
          category: 'chart',
          level: 'info', // error, warning, info, or debug.
          data: { channel },
        });

        this.socketSubscriptionTimeout = setTimeout(() => {
          if (this.socketLastEventTime[name] === subscriptionTime) {
            Raven.captureBreadcrumb({
              message: 'Socket timeout exceeded',
              category: 'chart',
              level: 'warning', // error, warning, info, or debug.
              data: {
                channel,
                subscriptionTime,
                socketLastEventTime: this.socketLastEventTime[name],
              },
            });
            Raven.captureMessage(
              'Has not received any socket event after 10 seconds of subscription [notify-backend]',
              {
                extra: {
                  socketChannel: channel,
                  subscriptionTime,
                },
              },
            );
          }
        }, 10000);
      },

      leaveSocketChannel(channel) {
        const [, name] = channel.split(':');
        // actually leave channel
        this.$echo.leave(channel);
        Raven.captureBreadcrumb({
          message: `Left ${channel} socket channel`,
          category: 'chart',
          level: 'info', // error, warning, info, or debug.
          data: { channel },
        });
        // remove time of last socket event of the item
        Vue.delete(this.socketLastEventTime, name);
      },

      updateChartWidth() {
        if (this.instance) {
          this.chartWidth = this.instance.chartWidth;
        }
      },

      removeSeries({ id, redraw }) {
        if (this.instance) {
          const series = this.instance.get(id);

          if (series) {
            series.remove(redraw);
          }
        }
      },

      addSeries({ series, redraw }) {
        if (this.instance) {
          this.instance.addSeries(series, redraw);
        }
      },

      createSeriesData(rawData) {
        return rawData.map((el) => { // eslint-disable-line
          return {
            x: el.timestamp,
            y: el.price.value,
            change: parseFloat(get(el.price, 'change', 0)),
            open: get(el.price, 'candle.open', 0),
            high: get(el.price, 'candle.high', 0),
            low: get(el.price, 'candle.low', 0),
            close: get(el.price, 'candle.close', 0),
            volume: get(el, 'volume.24h.value', 0),
            capitalization: get(el, 'capitalization.value', 0),
          };
        });
      },

      setPlotHovered(e) {
        // e.type = 'mouseOver'/'mouseOut'
        this.plotIsHovered = e.type === 'mouseOver';
        if (!this.plotIsHovered) {
          this.latestValues = this.chartItems.map((el) => {
            const series = this.instance.get(el.name);
            const lastPoint = series.data[series.data.length - 1];
            let comparePoint = series.data[series.data.length - 2];

            if (typeof comparePoint === 'undefined') {
              comparePoint = lastPoint;
            }

            return {
              name: el.name,
              color: lastPoint.color,
              change: get(lastPoint, 'change', 0),
              price: {
                value: lastPoint.close,
                grow: lastPoint.close > comparePoint.close,
              },
              capitalization: {
                value: lastPoint.capitalization,
                grow: lastPoint.capitalization > comparePoint.capitalization,
              },
              volume: {
                value: lastPoint.volume,
                grow: lastPoint.volume > comparePoint.volume,
              },
              high: {
                value: lastPoint.high,
                grow: lastPoint.high > comparePoint.high,
              },
              low: {
                value: lastPoint.low,
                grow: lastPoint.low > comparePoint.low,
              },
              open: {
                value: lastPoint.open,
                grow: lastPoint.open > comparePoint.open,
              },
              close: {
                value: lastPoint.close,
                grow: lastPoint.close > comparePoint.close,
              },
              x: lastPoint.x,
            };
          });
          this.tooltipX = null;
        }
      },

      setChartType(e) {
        if (this.type !== e) {
          this.type = e;
          this.$localStorage.setItem('chartType', e);

          Raven.setExtraContext({ chartType: e });

          this.chartItems.forEach((el) => {
            const series = this.instance.get(el.name);

            series.update({ type: this.type }, false);
            series.linkedSeries.forEach(l => l.update({ type: this.subChartType }, false));
          });

          this.instance.redraw();
        }
      },

      setChartSubType(e) {
        if (this.subChart !== e) {
          this.subChart = e;

          Raven.setExtraContext({ subChart: e });

          this.chartCoins.forEach((el) => {
            const series = this.instance.get(el);
            const data = series.data.map(p => [p.x, p[this.subChart]]);
            series.linkedSeries.forEach(l => l.setData(data, false));
          });

          if (!this.matchChartMediaMobile) {
            const yAxis = this.instance.get('y-axis-3');
            yAxis.update({
              title: {
                text: this.$t(this.subChart),
              },
            }, false);
          }

          this.instance.redraw();
        }
      },

      setSeriesUpdateInterval(e) {
        if (this.seriesUpdateInterval !== e) {
          // Save value on localStorage
          this.$localStorage.setItem('seriesUpdateInterval', e);

          Raven.setExtraContext({ seriesUpdateInterval: e });

          // If we turn off real time updates - unsubscribe from all channels
          if (!e) {
            this.echoChannelsList.forEach(el => this.leaveSocketChannel(el));
          }

          // If we turn on real time updates again - subscribe to all channels
          if (!this.seriesUpdateInterval && e) {
            this.echoChannelsList.forEach(el => this.joinSocketChannel(el));
          }

          this.seriesUpdateInterval = e;
        }
      },

      hideDatePicker() {
        this.showDatePicker = false;
      },

      getIntervalName(value) {
        return this.$t(`chart.intervals.${value}`);
      },

      onDateTimeSet(value) {
        const axis = this.instance.get('x-axis');
        axis.setExtremes(value.min, value.max, true, false, { picker: true });

        this.showDatePicker = false;
      },

      zoom(direction) {
        const axis = this.instance.get('x-axis');
        const { min, max } = axis.getExtremes();
        const step = Math.round((max - min) / 5);
        const newMin = direction === 'in'
          ? min + step
          : min - step;

        axis.setExtremes(newMin, max, true, true, { zoom: true });
      },

      formatUnix(unix, formatter) {
        if (!unix) {
          return '';
        }
        return moment.unix(unix).format(formatter);
      },

      initChart() {
        if (this.instance) {
          this.destroyChart();
        }
        this.instance = Highcharts.chart(
          this.id,
          merge(
            {},
            this.themeJSON,
            this.options,
          ),
        );

        this.updateChartWidth();

        const xAxis = this.instance.get('x-axis');
        const navigatorAxis = this.instance.get('navigator-x-axis');

        if (!this.matchChartMediaMobile) {
          const yAxisSub = this.instance.get('y-axis-3');
          yAxisSub.update({
            title: {
              text: this.$t(this.subChart),
            },
          }, false);
        }
        // On mobiles there is no navigator
        if (navigatorAxis) {
          navigatorAxis.update({
            maxRange: this.ranges[this.interval].maxRange * 1000,
            minRange: this.ranges[this.interval].minRange * 1000,
          }, false);
        }
        xAxis.update({
          maxRange: this.ranges[this.interval].maxRange * 1000,
          minRange: this.ranges[this.interval].minRange * 1000,
        }, false);

        // TODO: quick dirty fix. Rewrtie and remove it later
        if (this.interval === '30s' || this.interval === '15s' || this.interval === '5s') {
          this.instance.navigator.update({ enabled: false }, false);
          this.instance.update({ scrollbar: { enabled: false } }, false);
        } else {
          this.instance.navigator.update({ enabled: true }, false);
          this.instance.update({ scrollbar: { enabled: true } }, false);
        }

        this.$nextTick(() => {
          this.instance.redraw();
        });

        Raven.captureBreadcrumb({
          message: 'Chart has been instantiated',
          category: 'chart',
          level: 'debug', // error, warning, info, or debug.
        });
      },
      destroyChart() {
        if (this.instance) {
          this.instance.destroy();
          this.instance = null;
          Raven.captureBreadcrumb({
            message: 'Chart has been destroyed',
            category: 'chart',
            level: 'debug', // error, warning, info, or debug.
          });
        }
      },
    },
    computed: {
      ...mapState({
        socketStatus: state => state.common.socketStatus,
        // Call chart reflow on change
        menu: state => state.common.menu,
        // Update chart colors on change
        theme: state => state.common.theme,
        // Update chart locales on change
        locale: state => state.common.locale,
        /**
         * A number, or a string containing a number.
         * @typedef {Object} chartItem
         * @property {string} name Coin or Index name
         * @property {string} entity Define is item coin or index
         */
        /**
         * @return {chartItem} Visible graphs
         */
        chartItems: state => state.chart.items,
        // Use as parameter on history fetch call
        currency: state => state.common.currency,
        rate: state => get(state.common.currencies, `${state.common.currency.toUpperCase()}.value`, 1),
      }),
      ...mapGetters({
        chartCoins: 'chart/chartCoins',
        chartIndices: 'chart/chartIndices',
      }),

      /**
       * Define whenever turn real time updates on or off
       * @return {boolean}
       */
      isChartRangeInPast() {
        const getStartOfInterval = () => ({
          '1m': moment().utc().startOf('month').unix(),
          '1w': moment().utc().startOf('isoWeek').unix(),
          '1d': moment().utc().startOf('day').unix(),
          '1h': moment().utc().startOf('hour').unix(),
          '5i': moment().utc().startOf('hour')
            .minute(moment().minute() - (moment().minute() % 5))
            .unix(),
          '1i': moment().utc().startOf('minute').unix(),
          /* eslint-disable newline-per-chained-call */
          '30s': moment().utc().startOf('minute').subtract(30, 'seconds').unix(),
          '15s': moment().utc().startOf('minute').subtract(15, 'seconds').unix(),
          '5s': moment().utc().startOf('minute').subtract(5, 'seconds').unix(),
          /* eslint-enable newline-per-chained-call */
        });

        return this.end - getStartOfInterval()[this.interval] < 0;
      },

      /**
       * Create subscription list of channels according to chart items
       * @return {*}
       */
      echoChannelsList() {
        return this.chartItems
          .filter(el => !(el.entity === 'index' && el.name !== 'ICEI10'))
          .map(el => `${this.socketEntities[el.entity]}:${el.name}:data:${this.interval}`);
      },

      /**
       * Show time picker in date picker only on small intervals
       * @return {boolean}
       */
      showTimePicker() {
        return this.interval === '5i' ||
          this.interval === '1i' ||
          this.interval === '1h';
      },


      showCalendar() {
        return this.interval !== '30s' &&
          this.interval !== '15s' &&
          this.interval !== '5s';
      },

      /**
       * Define series type of capitalization/volume graph
       * @return {string}
       */
      subChartType() {
        return this.type === 'candlestick'
          ? 'column'
          : 'areaspline';
      },

      userIndexIsOnChart() {
        return this.chartIndices.some(el => el !== 'ICEI10');
      },

      valuesTime() {
        return !this.isChartRangeInPast &&
        !this.plotIsHovered &&
        this.seriesUpdateInterval &&
        this.socketStatus === 2
          ? this.$t('chart.realTimeUpdates')
          : this.formatUnix(this.latestValues[0].x / 1000, 'D MMMM YY HH:mm:ss');
      },

      matchChartMediaMobile() {
        return this.chartWidth <= mobileBreakpoint;
      },

      themeJSON() {
        return this.theme === 'light' ? themeLight : themeDark;
      },

      localeJSON() {
        return this.locale === 'en' ? locales.en.lang : locales.ru.lang;
      },

      seriesTypes() {
        return [
          {
            text: this.$t('candlestick'),
            value: 'candlestick',
            disabled: false,
          },
          {
            text: this.$t('spline'),
            value: 'spline',
            disabled: false,
          },
        ];
      },

      chartIntervals() {
        return [
          {
            value: '1m',
            full: 'month',
            text: this.$t('chart.intervals.month'),
            disabled: false,
          },
          {
            value: '1w',
            full: 'week',
            text: this.$t('chart.intervals.week'),
            disabled: false,
          },
          {
            value: '1d',
            full: 'day',
            text: this.$t('chart.intervals.day'),
            disabled: false,
          },
          {
            value: '1h',
            full: 'hour',
            text: this.$t('chart.intervals.hour'),
            disabled: false,
          },
          {
            value: '5i',
            full: '5-minutes',
            text: this.$t('chart.intervals.five_minutes'),
            disabled: false,
          },
          {
            value: '1i',
            full: 'minute',
            text: this.$t('chart.intervals.minute'),
            disabled: false,
          },
          {
            value: '30s',
            full: '30-seconds',
            text: this.$t('chart.intervals.30-seconds'),
            disabled: this.userIndexIsOnChart,
          },
          {
            value: '15s',
            full: '15-seconds',
            text: this.$t('chart.intervals.15-seconds'),
            disabled: this.userIndexIsOnChart,
          },
          {
            value: '5s',
            full: '5-seconds',
            text: this.$t('chart.intervals.5-seconds'),
            disabled: this.userIndexIsOnChart,
          },
        ];
      },

      seriesUpdateIntervals() {
        return [
          {
            text: this.$t('chart.intervals.ten_seconds'),
            value: 10000,
            disabled: false,
          },
          {
            text: this.$t('chart.intervals.five_seconds'),
            value: 5000,
            disabled: false,
          },
          {
            text: this.$t('chart.intervals.three_seconds'),
            value: 3000,
            disabled: false,
          },
          {
            text: this.$t('chart.intervals.one_seconds'),
            value: 1000,
            disabled: false,
          },
          {
            text: this.$t('chart.intervals.off'),
            value: false,
            disabled: false,
          },
        ];
      },

      subSerialTypes() {
        return [
          {
            text: this.$t('capitalization'),
            value: 'capitalization',
            disabled: false,
          },
          {
            text: this.$t('volume'),
            value: 'volume',
            disabled: false,
          },
        ];
      },
    },
    async created() {
      // Need this to access component instance in highcharts formatter function
      vm = this;
      /**
       * We need to fetch latest candle to show some values on SSR
       */
      const [{ name, entity }] = this.chartItems;
      const isCoin = entity === 'coin';
      const { data } = await this.$store.dispatch('history/fetch', {
        name,
        entity,
        params: {
          convert: this.currency,
          interval: this.interval,
          candles: true,
          volume: isCoin ? '24h' : null,
          cap: isCoin,
          count: 2,
        },
      });

      if (!data.result) {
        return false;
      }

      /**
       * Get two latest point from xhr response
       */
      const [compare, point] = data.data[0].values.slice(-2);

      /**
       * Set values to show them in chart sidebar
       */
      Vue.set(
        this.latestValues,
        this.latestValues.length,
        {
          name,
          color: this.colors[this.latestValues.length],
          change: parseFloat(get(point, 'price.change', 0)),
          price: {
            value: point.price.candle.close,
            grow: point.price.candle.close > compare.price.candle.close,
          },
          high: {
            value: point.price.candle.max,
            grow: point.price.candle.max > compare.price.candle.max,
          },
          low: {
            value: point.price.candle.min,
            grow: point.price.candle.min > compare.price.candle.min,
          },
          open: {
            value: point.price.candle.open,
            grow: point.price.candle.open > compare.price.candle.open,
          },
          close: {
            value: point.price.candle.close,
            grow: point.price.candle.close > compare.price.candle.close,
          },
          capitalization: {
            value: isCoin ? point.capitalization.value : 0,
            grow: isCoin ? point.capitalization.value > compare.capitalization.value : true,
          },
          volume: {
            value: isCoin ? point.volume['24h'].value : 0,
            grow: isCoin ? point.volume['24h'].value > compare.volume['24h'].value : true,
          },
          x: point.x,
        },
      );

      return false;
    },
    beforeMount() {
      const map = {
        month: '1m',
        week: '1w',
        day: '1d',
        hour: '1h',
        '5-minutes': '5i',
        minute: '1i',
        '30-seconds': '30s',
        '15-seconds': '15s',
        '5-seconds': '5s',
      };
      this.interval = map[this.$route.query.interval] || '1d';
    },
    mounted() {
      this.end = moment().unix();
      this.start = this.fetchParams.start[this.interval]();
      this.seriesUpdateInterval = this.$localStorage.getItem('seriesUpdateInterval').data || 3000;
      this.type = this.$localStorage.getItem('chartType').data || 'spline';

      // Initialize exporting module.
      Exporting(Highcharts);

      Highcharts.setOptions(Object.assign({}, {
        global: {
          useUTC: false,
        },
        lang: this.localeJSON,
      }, this.themeJSON));

      window.addEventListener('resize', this.updateChartWidth);

      this.initChart();
      /**
       * Call watcher handler manually because we add first chart item on server side
       * but create chart instance on client side
       */
      this.handleChartItemsChange(this.chartItems, []);
    },
    updated() {
      /**
       * Used to fix issue with unmovable handlers of navigator on minute interval
       * Range value below represents ~1 hour
       * TODO: fix it somehow or consider a better way to work with navigator on small intervals
       */
      if (this.instance && this.instance.navigator.range === 0) {
        this.instance.navigator.range = 0.00689655172;
      }
    },
    beforeDestroy() {
      clearTimeout(this.socketSubscriptionTimeout);
      window.removeEventListener('resize', this.updateChartWidth);
      this.echoChannelsList.forEach(channel => this.$echo.leave(channel));
    },
    destroyed() {
      this.$emit('destroyed');
    },
  };
</script>

<style lang="scss">
  @import "./chart.scss";
</style>
