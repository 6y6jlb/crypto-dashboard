<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <vue-loader :loading="this.loading" />
    <div class="container">
      <add-ticker-form
        :coins="this.coins"
        :tickers="this.tickers"
        @add-ticker="addTicker"
      />

      <filter-vue
        @increment-page="page++"
        @decrement-page="page--"
        @input-filter="(value) => (this.filter = value)"
        :tickersLength="this.tickers.length"
        :filteredTickersLength="this.filteredTickers.length"
        :page="this.page"
        :maxPage="this.maxPage"
        :filterValue="this.filter"
        :errors="this.errors"
      />

      <template v-if="this.filteredTickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <ticker-item
            v-for="t in this.filteredTickers"
            @toggle="toggle"
            @remove-ticker="showRemoveTickerModal"
            @change-currency="changeCurrency"
            :key="t.id"
            :ticker="t"
            :currency="this.currency"
            :showBorder="this.showBorder(t.Id)"
          />
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
        <main-chart
          :values="this.chartValues"
          :currency="this.currency"
          :selectedTicker="this.selectedTicker"
          @toggle="toggle"
        />
      </template>
    </div>
  </div>
  <vue-modal ref="delete-item-modal">
    <template #header>Delete Item</template>
    <template #body>Are you sure?</template>
    <template #actions="{ close, confirm }">
      <input
        v-model="this.confirmation"
        type="text"
        name="confirmation"
        id="confirmation"
        class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
        :placeholder="this.$options.CONFIRMATION_TEXT"
      />
      <button
        @click="() => confirm(this.removeTicker)"
        :disabled="!this.confirmPermission"
        type="button"
        class="text-white bg-violet-700 hover:bg-violet-800 focus:ring-4 focus:outline-none focus:ring-violet-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-violet-600 dark:hover:bg-violet-700 dark:focus:ring-violet-800"
        :class="{ 'disabled:opacity-25': !this.confirmPermission }"
      >
        Cofirm
      </button>
      <button
        @click="close"
        type="button"
        class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
      >
        Decline
      </button></template
    >
  </vue-modal>
</template>

<script>
import { EXCHANGE_CURRENCIES } from "./api/const.js";
import api from "./api/index";
import AddTickerForm from "./components/AddTickerForm";
import TickerItem from "./components/TickerItem.vue";
import MainChart from "./components/Chart.vue";
import FilterVue from "./components/Filter.vue";
import VueModal from "./components/VueModal.vue";

import CoinDTO from "./dto/Coin";

export default {
  name: "App",
  components: { AddTickerForm, TickerItem, MainChart, FilterVue, VueModal },
  CONFIRMATION_TEXT: "Подтверждаю",
  data() {
    return {
      filter: null,
      confirmation: null,
      page: 1,
      per_page: 6,
      tickers: [],
      coins: [],
      selectedTicker: null,
      chartValues: {},
      exchangeRate: {},
      currency: "USD",
      preselectedTicker: "DOGE",
      loading: false,
      errors: {},
    };
  },

  async created() {
    const items = JSON.parse(localStorage.getItem("tickers-list")) || [];
    this.tickers = items.reduce((previous, current) => {
      if (current) {
        return [
          ...previous,
          new CoinDTO(
            current._Name,
            current._FullName,
            current._Id,
            current._ImageUrl,
            current._Symbol
          ),
        ];
      }
    }, []);
    this.tickers.forEach((ticker) => {
      this.chartValues[ticker.Symbol] = [];
      api.subscribeToTicker(
        ticker.Symbol,
        (price, currency) => this.updatePrice(ticker.Symbol, price, currency),
        "success"
      );
      api.subscribeToTicker(
        ticker.Symbol,
        (currency) => this.updateTicker(ticker.Symbol, currency),
        "fail"
      );
    });
    this.getExchangeRates();
    this.getAllcoins();
  },
  watch: {
    tickers() {
      window.localStorage.setItem("tickers-list", JSON.stringify(this.tickers));
      this.filter = "";
      this.page = 1;
    },
    filter() {
      if (!this.filter || /[a-zA-Z0-9\s]/.test(this.filter)) {
        this.errors = {};
        this.page = 1;
        window.history.replaceState(
          {},
          "",
          window.location.pathname +
            `?filter=${this.filter}&page=${this.page}&per_page=${this.per_page}`
        );
      } else {
        this.errors = { filter: "Строка содержит недопустимые символы." };
      }
    },
    page() {
      window.history.pushState(
        {},
        "",
        window.location.pathname +
          `?filter=${this.filter}&page=${this.page}&per_page=${this.per_page}`
      );
    },
  },
  computed: {
    confirmPermission() {
      return this.$options.CONFIRMATION_TEXT === this.confirmation;
    },
    startIndex() {
      return (this.page - 1) * this.per_page;
    },
    endIndex() {
      return this.page * this.per_page;
    },
    filteredTickers() {
      const tickers = this.tickers.filter((ticker) => {
        const value = (this.filter || "").toLowerCase().trim();
        const hasMatch =
          ticker.FullName.toLowerCase().includes(value) ||
          ticker.Name.toLowerCase().includes(value) ||
          ticker.Symbol.toLowerCase().includes(value);

        return hasMatch;
      });

      return tickers.slice(this.startIndex, this.endIndex);
    },
    maxPage() {
      return Math.ceil(this.tickers.length / this.per_page);
    },
  },
  methods: {
    changeCurrency(newCurrency) {
      this.currency = newCurrency;
    },
    showBorder(id) {
      return this.selectedTicker && id === this.selectedTicker.Id;
    },
    async getExchangeRates() {
      this.exchangeRate = await api.getExchachngeRates();
    },
    async getAllcoins() {
      this.loading = true;
      try {
        const result = await api.getCoins();
        for (const [key, value] of Object.entries(result.Data)) {
          const newCoin = new CoinDTO(
            key,
            value.FullName,
            value.Id,
            value.ImageUrl,
            value.Symbol
          );
          this.coins.push(newCoin);
        }
      } catch (error) {
        console.warn(error);
      } finally {
        this.loading = false;
      }
    },
    toggle(value) {
      if (this.selectedTicker?.Id === value) {
        this.unselectTicker();
      } else {
        this.selectTicker(value);
      }
    },
    selectTicker(value) {
      this.selectedTicker = this.tickers.find((ticker) => ticker.Id === value);
    },
    unselectTicker() {
      this.selectedTicker = null;
    },
    addTicker(newTicker) {
      this.tickers = [...this.tickers, newTicker];
      this.chartValues[newTicker.Symbol] = [];
      api.subscribeToTicker(
        newTicker.Symbol,
        (price, currency) =>
          this.updatePrice(newTicker.Symbol, price, currency),
        "success"
      );
    },
    showRemoveTickerModal(value) {
      this.$refs["delete-item-modal"].show(value);
    },
    removeTicker(value) {
      api.unsubscribeFromTicker(
        this.tickers.find((t) => value === t.Id)?.Symbol
      );
      this.tickers = this.tickers.filter((t) => value !== t.Id) || [];
      this.unselectTicker();
      this.confirmation = null;
      this.$refs["delete-item-modal"].hide();
    },
    updatePrice(ticker, price, currency) {
      this.chartValues[ticker].push({ [currency]: price });
      this.tickers.map((t) => {
        if (t.Symbol === ticker) {
          t.Price[currency] = price;
          EXCHANGE_CURRENCIES.forEach((cur) => {
            t.Price[cur] = (
              (this.exchangeRate[cur] / this.exchangeRate[currency]) *
              price
            ).toPrecision(8);
            this.chartValues[ticker].push({ [cur]: t.Price[cur] });
          });
        }
      });
    },
    updateTicker(ticker, price, currency) {
      this.tickers.map((t) => {
        if (t.Symbol === ticker) {
          delete t.Price[currency];
        }
      });
    },
  },
};
</script>

<style src="./app.css"></style>
