<template lang="pug">
  transition(appear, name="fade")
    template(v-if="showDatePicker")
      .date-picker
        .d-flex.justify-content-center.pb-2(v-if="showCalendar")
          div.d-flex.align-items-center.justify-content-between.w-50
            button.date-picker__button-arrow(type="button", @click="substractMonth")
              icon.date-picker__button-arrow-svg(:name="'ic_keyboard_arrow_left'")
            div.date-picker__title {{ formatUnix(currentMonthUnix, 'MMMM YYYY') }}
            button.date-picker__button-arrow(type="button", @click="addMonth")
              icon.date-picker__button-arrow-svg(:name="'ic_keyboard_arrow_right'")
        template(v-if="calendarMatrix.length > 0 && showCalendar")
          table.date-picker__table
            tr
              template(v-for="n in 7")
                th.date-picker__heading {{ getWeekday(n) }}
            template(v-for="week in calendarMatrix")
              tr.date-picker__row
                template(v-for="unix in week")
                  td.date-picker__column
                    button.date-picker__item(
                    :unix="unix",
                    :class="[{ 'data-picker__item--interval' : isDateSelected(unix) }, { 'data-picker__item--unavailable' : !isDateAvailable(unix) }]",
                    @click="setValueDate(unix)"
                    ) {{ formatUnix(unix, 'D') }}
          .row.no-gutters(v-if="showTimePicker").pt-2
            .col-6
              .date-picker__heading(v-html="this.$t('from').toUpperCase()")
              .d-flex.align-items-center.justify-content-center
                div.date-picker__full-date.mr-1 {{ formatUnix(valueStart, 'DD.MM.YY') }}

                div.d-flex.align-items-center
                  .d-flex.flex-column.align-items-center
                    button.date-picker__button-arrow(
                    :disabled="buttonDisabled.start.hour.add",
                    type="button",
                    @click="addHour('valueStart')"
                    )
                      icon.fill-denim(:name="'ic_keyboard_arrow_up'")
                    input.date-picker__time(
                    v-model="inputs.start.hour",
                    maxlength="2",
                    name="startHour",
                    type="text",
                    @change="updateHourValue($event.target.value, 'valueStart')",
                    )
                    button.date-picker__button-arrow(
                    :disabled="buttonDisabled.start.hour.substract",
                    type="button",
                    @click="substractHour('valueStart')"
                    )
                      icon.fill-denim(:name="'ic_keyboard_arrow_down'")
                  span.mx-1 :
                  .d-flex.flex-column.align-items-center
                    button.date-picker__button-arrow(
                    :disabled="buttonDisabled.start.minute.add",
                    type="button",
                    @click="addMinute('valueStart')"
                    )
                      icon.fill-denim(:name="'ic_keyboard_arrow_up'")
                    input.date-picker__time(
                    v-model="inputs.start.minute",
                    maxlength="2",
                    name="startMinute",
                    type="text",
                    @change="updateMinuteValue($event.target.value, 'valueStart')",
                    )
                    button.date-picker__button-arrow(
                    :disabled="buttonDisabled.start.minute.substract",
                    type="button",
                    @click="substractMinute('valueStart')"
                    )
                      icon.fill-denim(:name="'ic_keyboard_arrow_down'")
            .col-6
              .date-picker__heading(v-html="this.$t('to').toUpperCase()")

              .d-flex.align-items-center.justify-content-center
                div.date-picker__full-date.mr-1 {{ formatUnix(valueEnd, 'DD.MM.YY') }}

                div.d-flex.align-items-center
                  .d-flex.flex-column.align-items-center
                    button.date-picker__button-arrow(
                    :disabled="buttonDisabled.end.hour.add",
                    type="button",
                    @click="addHour('valueEnd')"
                    )
                      icon.fill-denim(:name="'ic_keyboard_arrow_up'")
                    input.date-picker__time(
                    v-model="inputs.end.hour",
                    maxlength="2",
                    name="endHour",
                    type="text",
                    @change="updateHourValue($event.target.value, 'valueEnd')",
                    )
                    button.date-picker__button-arrow(
                    :disabled="buttonDisabled.end.hour.substract",
                    type="button",
                    @click="substractHour('valueEnd')"
                    )
                      icon.fill-denim(:name="'ic_keyboard_arrow_down'")
                  span.mx-1 :
                  .d-flex.flex-column.align-items-center
                    button.date-picker__button-arrow(
                    :disabled="buttonDisabled.end.minute.add",
                    type="button",
                    @click="addMinute('valueEnd')"
                    )
                      icon.fill-denim(:name="'ic_keyboard_arrow_up'")
                    input.date-picker__time(
                    v-model="inputs.end.minute",
                    maxlength="2",
                    name="endMinute",
                    type="text",
                    @change="updateMinuteValue($event.target.value, 'valueEnd')",
                    )
                    button.date-picker__button-arrow(
                    :disabled="buttonDisabled.end.minute.substract",
                    type="button",
                    @click="substractMinute('valueEnd')"
                    )
                      icon.fill-denim(:name="'ic_keyboard_arrow_down'")
        .row.no-gutters.align-items-center.my-2
          .col-auto.mr-1
            p.date-picker__title.m-0(v-html="$t('datepicker.goToLast').toUpperCase()")
          template(v-for="segment in segments")
            .col-auto.mr-1(v-if="isSegmentAllowed(segment)")
              button.date-picker__button-segment.d-inline-block(
                v-html="segment.count + $t(`chart.intervals.short.${segment.full}`)"
                :class="[{ 'date-picker__button-segment--active' : activeSegment === segment.name }]",
                @click="emitSegment(segment.name)"
                )
        transition(appear, name="fade")
          .d-flex.justify-content-center.pt-2
            button.date-picker__button-select(
            v-html="$t('select').toUpperCase()",
            type="button",
            @click="emitResult"
            )
</template>

<script>
  import { mapState } from 'vuex';
  import moment from 'moment';
  import icon from '~/components/ui/icon.vue';

  export default {
    name: 'datePicker',
    props: {
      start: {
        type: Number,
        required: true,
        default: 0,
      },
      end: {
        type: Number,
        required: true,
        default: 0,
      },
      interval: {
        type: String,
        required: true,
      },
      activeSegment: {
        type: String,
        default: '',
      },
      showDatePicker: {
        type: Boolean,
        required: true,
        default: false,
      },
      showTimePicker: {
        type: Boolean,
        required: true,
        default: false,
      },
      showCalendar: {
        type: Boolean,
        required: true,
        default: true,
      },
      minDate: {
        type: Number,
        default: null,
      },
      maxRange: {
        type: Number,
        default: null,
      },
    },
    data() {
      return {
        calendarMatrix: [],
        maxDate: 0,
        valueStart: this.start,
        valueEnd: this.end,
        currentMonthUnix: this.end,
        step: 'start',
        inputs: {
          start: {
            hour: this.formatUnix(this.start, 'HH'),
            minute: this.formatUnix(this.start, 'mm'),
          },
          end: {
            hour: this.formatUnix(this.end, 'HH'),
            minute: this.formatUnix(this.end, 'mm'),
          },
        },
        segments: [
          {
            name: '1i',
            full: 'minute',
            count: 1,
            allowedIntervals: ['5s'],
          },
          {
            name: '5i',
            full: 'minute',
            count: 5,
            allowedIntervals: ['5s', '15s'],
          },
          {
            name: '30i',
            full: 'minute',
            count: 30,
            allowedIntervals: ['15s'],
          },
          {
            name: '1h',
            full: 'hour',
            count: 1,
            allowedIntervals: ['30s', '1i', '5i'],
          },
          {
            name: '3h',
            full: 'hour',
            count: 3,
            allowedIntervals: ['1i', '5i'],
          },
          {
            name: '6h',
            full: 'hour',
            count: 6,
            allowedIntervals: ['5i'],
          },
          {
            name: '12h',
            full: 'hour',
            count: 12,
            allowedIntervals: ['5i'],
          },
          {
            name: '1d',
            full: 'day',
            count: 1,
            allowedIntervals: ['1h'],
          },
          {
            name: '2d',
            full: 'day',
            count: 2,
            allowedIntervals: ['1h'],
          },
          {
            name: '3d',
            full: 'day',
            count: 3,
            allowedIntervals: ['1h'],
          },
          {
            name: '1w',
            full: 'week',
            count: 1,
            allowedIntervals: ['1h', '1d'],
          },
          {
            name: '2w',
            full: 'week',
            count: 2,
            allowedIntervals: ['1d'],
          },
          {
            name: '3w',
            full: 'week',
            count: 3,
            allowedIntervals: ['1d'],
          },
          {
            name: '1m',
            full: 'month',
            count: 1,
            allowedIntervals: ['1d', '1w'],
          },
          {
            name: '2m',
            full: 'month',
            count: 2,
            allowedIntervals: ['1d', '1w'],
          },
          {
            name: '3m',
            full: 'month',
            count: 3,
            allowedIntervals: ['1w'],
          },
          {
            name: '1y',
            full: 'year',
            count: 1,
            allowedIntervals: ['1w', '1m'],
          },
          {
            name: '2y',
            full: 'year',
            count: 2,
            allowedIntervals: ['1w', '1m'],
          },
        ],
      };
    },
    components: {
      icon,
    },
    watch: {
      start(value) {
        this.valueStart = value;
      },
      end(value) {
        this.valueEnd = value;
      },
      valueStart(value) {
        this.inputs.start.hour = this.formatUnix(value, 'HH');
        this.inputs.start.minute = this.formatUnix(value, 'mm');
      },
      valueEnd(value) {
        this.inputs.end.hour = this.formatUnix(value, 'HH');
        this.inputs.end.minute = this.formatUnix(value, 'mm');
      },
    },
    methods: {
      getCalendarMatrix(unix, exact = true, twoDimensional = true) {
        const matrix = [];
        const month = moment.unix(unix).month();
        const year = moment.unix(unix).year();
        const end = moment.unix(unix).endOf('month').isoWeek();
        let start = moment.unix(unix).startOf('month').isoWeek();

        let i = 0;
        // eslint-disable-next-line
        while (true) {
          const arr = twoDimensional ? matrix[i] = [] : matrix;
          for (let j = 1; j <= 7; j += 1) {
            const item = moment().year(year).week(start).isoWeekday(j)
              .startOf('day');

            if (exact && item.month() !== month) {
              arr.push(null);
            } else {
              arr.push(item.unix());
            }
          }
          i += 1;

          if (start === end) {
            break;
          }

          start = moment().year(year).isoWeek(start).add(1, 'week')
            .isoWeek();
        }

        return matrix;
      },
      substractMonth() {
        this.currentMonthUnix = moment.unix(this.currentMonthUnix).subtract(1, 'month').unix();
        this.calendarMatrix = this.getCalendarMatrix(this.currentMonthUnix);
      },
      addMonth() {
        this.currentMonthUnix = moment.unix(this.currentMonthUnix).add(1, 'month').unix();
        this.calendarMatrix = this.getCalendarMatrix(this.currentMonthUnix);
      },
      addHour(param) {
        this[param] = moment.unix(this[param]).add(1, 'hour').unix();
      },
      substractHour(param) {
        this[param] = moment.unix(this[param]).subtract(1, 'hour').unix();
      },
      addMinute(param) {
        this[param] = moment.unix(this[param]).add(1, 'minute').unix();
      },
      substractMinute(param) {
        this[param] = moment.unix(this[param]).subtract(1, 'minute').unix();
      },
      getWeekday(day) {
        return moment().startOf('isoWeek').isoWeekday(day).format('ddd');
      },
      isDateAvailable(unix) {
        if (this.step === 'end') {
          return unix >= moment.unix(this.valueStart).startOf('day').unix()
            && unix <= this.valueStart + (this.maxRange || this.maxDate)
            && unix <= this.maxDate;
        }

        return unix >= this.minDate && unix <= this.maxDate;
      },
      isDateSelected(unix) {
        return unix >= moment.unix(this.valueStart).startOf('day').unix()
          && unix <= moment.unix(this.valueEnd).startOf('day').unix();
      },
      setValueDate(unix) {
        const result = moment.unix(unix);
        const momentStart = moment.unix(this.valueStart);
        const momentEnd = moment.unix(this.valueEnd);
        const resultUnixEnd = result.hour(momentEnd.hour()).minute(momentEnd.minute()).unix();
        const resultUnixStart = result.hour(momentStart.hour()).minute(momentStart.minute()).unix();

        if (this.step === 'start') {
          this.valueStart = resultUnixStart;
          this.valueEnd = this.valueStart;
          this.step = 'end';

          return this.valueStart;
        }

        if (resultUnixEnd > this.valueStart + (this.maxRange || this.maxDate)) {
          this.valueEnd = this.valueStart + (this.maxRange || this.maxDate);
        } else {
          this.valueEnd = resultUnixEnd;
        }

        this.step = 'start';

        return this.valueEnd;
      },
      formatUnix(unix, formatter) {
        if (!unix) {
          return '';
        }
        return moment.unix(unix).format(formatter);
      },
      updateMinuteValue(value, key) {
        const result = moment.unix(this[key]).minute(value).unix();

        const pairKeyValid = key === 'valueStart'
          ? result < this.valueEnd
          : result > this.valueStart;

        const maxRangeValid = key === 'valueStart'
          ? result >= this.valueEnd - this.maxRange
          : result <= this.valueStart + this.maxRange;

        const minMaxValid = key === 'valueStart'
          ? result >= this.minDate
          : result <= this.maxDate;

        if (
          !Number.isNaN(value)
          && value <= 59
          && value >= 0
          && pairKeyValid
          && maxRangeValid
          && minMaxValid
        ) {
          this[key] = result;
        } else {
          // add one second to trigger watcher on this[key] value
          this[key] = moment.unix(this[key]).minute(moment.unix(this[key]).minute()).unix() + 1;
        }
      },
      updateHourValue(value, key) {
        const result = moment.unix(this[key]).hour(value).unix();

        const pairKeyValid = key === 'valueStart'
          ? result < this.valueEnd
          : result > this.valueStart;

        const maxRangeValid = key === 'valueStart'
          ? result >= this.valueEnd - this.maxRange
          : result <= this.valueStart + this.maxRange;

        const minMaxValid = key === 'valueStart'
          ? result >= this.minDate
          : result <= this.maxDate;

        if (
          !Number.isNaN(value)
          && value <= 23
          && value >= 0
          && pairKeyValid
          && maxRangeValid
          && minMaxValid
        ) {
          this[key] = result;
        } else {
          // add one second to trigger watcher on this[key] value
          this[key] = moment.unix(this[key]).hour(moment.unix(this[key]).hour()).unix() + 1;
        }
      },
      isSegmentAllowed(segment) {
        return segment.allowedIntervals.findIndex(el => el === this.interval) > -1;
      },
      emitSegment(segment) {
        return this.$emit('segment', segment);
      },
      emitResult() {
        return this.$emit('set', { min: this.valueStart * 1000, max: this.valueEnd * 1000 });
      },
      init() {
        this.calendarMatrix = this.getCalendarMatrix(this.valueEnd);
      },
    },
    computed: {
      ...mapState({
        locale: state => state.common.locale,
      }),
      buttonDisabled() {
        return {
          start: {
            hour: {
              add: this.valueStart + 3600 > this.valueEnd,
              substract: this.valueStart - 3600 < this.minDate
              || this.valueStart - 3600 < this.valueEnd - this.maxRange,
            },
            minute: {
              add: this.valueStart + 60 > this.valueEnd,
              substract: this.valueStart - 60 < this.minDate
              || this.valueStart - 60 < this.valueEnd - this.maxRange,
            },
          },
          end: {
            hour: {
              add: this.valueEnd + 3600 > this.maxDate
              || this.valueEnd + 3600 > this.valueStart + this.maxRange,
              substract: this.valueEnd - 3600 < this.valueStart,
            },
            minute: {
              add: this.valueEnd + 60 > this.maxDate
              || this.valueEnd + 60 > this.valueStart + this.maxRange,
              substract: this.valueEnd - 60 < this.valueStart,
            },
          },
        };
      },
    },
    mounted() {
      this.init();
      this.maxDate = moment().unix();
    },
    updated() {
      this.maxDate = moment().unix();
    },
  };
</script>

<style lang="scss">
  @import "./datePicker";
</style>
