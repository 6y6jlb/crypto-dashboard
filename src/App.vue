<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      v-if="this.loading"
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <div class="container">
      <add-ticker-form
        :coins="this.coins"
        :tickers="this.tickers"
        @add-ticker="addTicker"
      />

      <Filter-vue
        @increment-page="page++"
        @decrement-page="page--"
        @input-filter="(value) => (this.filter = value)"
        :tickersLength="this.tickers.length"
        :filteredTickersLength="this.filteredTickers.length"
        :page="this.page"
        :maxPage="this.maxPage"
        :filterValue="this.filter"
      />

      <template v-if="this.filteredTickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <ticker-item
            v-for="t in this.filteredTickers"
            @toggle="toggle"
            @remove-ticker="removeTicker"
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
</template>

<script>
import { EXCHANGE_CURRENCIES } from "./api/const.js";
import api from "./api/index";
import AddTickerForm from "./components/AddTickerForm";
import TickerItem from "./components/TickerItem.vue";
import MainChart from "./components/Chart.vue";
import FilterVue from "./components/Filter.vue";

import CoinDTO from "./dto/Coin";

export default {
  name: "App",
  components: { AddTickerForm, TickerItem, MainChart, FilterVue },
  data() {
    return {
      filter: null,
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
      return Math.ceil(this.filteredTickers.length / this.per_page);
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
    removeTicker(value) {
      api.unsubscribeFromTicker(
        this.tickers.find((t) => value === t.Id)?.Symbol
      );
      this.tickers = this.tickers.filter((t) => value !== t.Id) || [];
      this.unselectTicker();
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
