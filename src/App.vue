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
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Тикер</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model="ticker"
                @keydown.enter="addTiker"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE"
              />
            </div>
            <div
              v-if="this.preselectedCoins.length"
              class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
            >
              <span
                v-for="coin in this.preselectedCoins"
                :key="coin.Id"
                @click="this.addTiker(coin.FullName)"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                {{ coin.Name }}
              </span>
            </div>
            <div v-if="this.errors.ticker" class="text-sm text-red-600">
              {{ this.errors.ticker }}
            </div>
          </div>
        </div>
        <button
          @click="this.addTiker(this.ticker)"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Добавить
        </button>
      </section>

      <div
        v-if="this.tickers.length"
        class="grid grid-flow-col auto-cols-max gap-2"
      >
        <hr class="w-full border-t border-gray-600 my-4" />
        <input
          v-model="filter"
          type="text"
          name="filter"
          id="filter"
          class="my-4 block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
          placeholder="Фильтрация"
        />
        <template v-if="this.filteredTikets.length">
          <button
            v-if="this.page > 1"
            @click="this.page--"
            type="button"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Назад
          </button>
          <button
            v-if="this.page < this.maxPage"
            @click="this.page++"
            type="button"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Вперед
          </button>
        </template>
      </div>
      <div v-if="this.errors.filter" class="px-4 text-sm text-red-600">
        {{ this.errors.filter }}
      </div>
      <div class="text-slate-400 my-6 px-4">
        Всего: &nbsp;
        {{ this.filteredTikets.length }}
        /
        {{ this.tickers.length }}
      </div>

      <template v-if="this.filteredTikets.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in this.filteredTikets"
            :key="t.Id"
            @click.stop="t.Price[this.currency] && this.toggle(t.Id)"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid"
            :class="{
              'bg-red-100': !t.Price[this.currency],
              'cursor-pointer': t.Price[this.currency],
              'border-4': this.showBorder(t.Id) && t.Price[this.currency],
            }"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.Name }} - {{ this.currency }}
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ t.Price[this.currency] || 0 }}
              </dd>
              <div class="flex justify-between items-end" style="height: 30px">
                <span
                  v-for="(price, idx) in Object.entries(t.Price)"
                  :key="idx"
                >
                  <span
                    @click.prevent.stop="this.currency = price[0]"
                    class="px-2 text-sm font-medium text-gray-500 truncate pointer hover:bg-violet-200 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
                    >{{ price[0] }}:</span
                  >
                  <span>{{ price[1] }}</span>
                </span>
              </div>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.prevent="this.removeTiker(t.Id)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
        <section v-if="this.selectedTiker" class="relative">
          <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
            {{ this.selectedTiker.Name }} - {{ this.currency }}
          </h3>
          <div
            class="flex items-end border-gray-600 border-b border-l h-64"
            ref="graph"
          >
            <div
              v-for="(item, idx) in this.graphValues"
              :key="idx"
              :style="{ height: item.percent + '%' }"
              :title="item.value"
              class="bg-purple-800 border w-10"
            />
          </div>
          <button type="button" class="absolute top-0 right-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              xmlns:svgjs="http://svgjs.com/svgjs"
              version="1.1"
              width="30"
              @click="this.toggle(this.selectedTiker.Id)"
              height="30"
              x="0"
              y="0"
              viewBox="0 0 511.76 511.76"
              style="enable-background: new 0 0 512 512"
              xml:space="preserve"
            >
              <g>
                <path
                  d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                  fill="#718096"
                  data-original="#000000"
                ></path>
              </g>
            </svg>
          </button>
        </section>
      </template>
    </div>
  </div>
</template>

<script>
import { EXCHANGE_CURRENCIES } from "./api/const.js";
import api from "./api/index";

import CoinDTO from "./dto/Coin";

export default {
  name: "App",
  data() {
    return {
      ticker: null,
      filter: null,
      page: 1,
      per_page: 6,
      tickers: [],
      coins: [],
      selectedTiker: null,
      chartValues: {},
      exchangeRate: {},
      currency: "USD",
      preselectedTiker: "DOGE",
      loading: false,
      errors: {},
      maxGraphLength: null,
      graphColumnWidth: 30,
    };
  },
  mounted() {
    window.addEventListener("resize", this.calculateMaxGraphLength);
  },
  async created() {
    const params = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );
    const VALID_KEYS = ["page", "per_page", "filter"];
    VALID_KEYS.forEach((key) => {
      if (params[key]) {
        this[key] = params[key];
      }
    });

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
        (currency) => this.updateTiker(ticker.Symbol, currency),
        "fail"
      );
    });
    this.getExchangeRates();
    this.getAllcoins();
  },
  watch: {
    ticker() {
      this.errors = {};
    },
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
    filteredTikets() {
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
    preselectedCoins() {
      const result = [];
      const value = (this.ticker || this.preselectedTiker || "").toLowerCase();
      if (this.coins.length) {
        for (
          let coin = 0;
          result.length < 4 && coin <= this.coins.length;
          coin += 1
        ) {
          const currentCoin = this.coins[coin];
          const hasMatch =
            currentCoin?.FullName.toLowerCase() === value ||
            currentCoin?.Name.toLowerCase() === value ||
            currentCoin?.Symbol.toLowerCase() === value;

          const alreadyAdded = this.tickers.find(
            (ticker) => ticker.Id === currentCoin?.Id
          );

          if (!alreadyAdded && hasMatch) {
            result.push(currentCoin);
          } else {
            continue;
          }
        }
        for (
          let coin = 0;
          result.length < 4 && coin <= this.coins.length;
          coin += 1
        ) {
          const currentCoin = this.coins[coin];
          const hasMatch =
            currentCoin?.FullName.toLowerCase().includes(value) ||
            currentCoin?.Name.toLowerCase().includes(value) ||
            currentCoin?.Symbol.toLowerCase().includes(value);

          const alreadyAdded = this.tickers.find(
            (ticker) => ticker.Id === currentCoin?.Id
          );

          if (!alreadyAdded && hasMatch) {
            result.push(currentCoin);
          } else {
            continue;
          }
        }
      }
      return result;
    },
    maxPage() {
      return Math.ceil(this.tickers.length / this.per_page);
    },
    graphValues() {
      const values = this.chartValues[this.selectedTiker.Name].reduce(
        (previous, current) => {
          if (current[this.currency]) {
            return [...previous, +current[this.currency]];
          } else {
            return previous;
          }
        },
        []
      );
      const max = Math.max(...values);
      const min = Math.min(...values);

      const calculatedGraph = values.map((value) => {
        const percent =
          max === min
            ? 50
            : min === value
            ? 5
            : (max - value) / ((max - min) / 100);
        return { percent, value };
      });
      if (!this.maxGraphLength) this.calculateMaxGraphLength();
      if (calculatedGraph.length > this.maxGraphLength) {
        calculatedGraph.splice(0, calculatedGraph.length - this.maxGraphLength);
      }
      return calculatedGraph;
    },
  },
  methods: {
    calculateMaxGraphLength() {
      if (this.$refs.graph) {
        this.maxGraphLength = Math.ceil(
          this.$refs.graph.clientWidth / this.graphColumnWidth
        );
      }
    },
    showBorder(id) {
      return this.selectedTiker && id === this.selectedTiker.Id;
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
      if (this.selectedTiker?.Id === value) {
        this.unselectTiker();
      } else {
        this.selectTiker(value);
      }
    },
    selectTiker(value) {
      this.selectedTiker = this.tickers.find((ticker) => ticker.Id === value);
    },
    unselectTiker() {
      this.selectedTiker = null;
    },
    addTiker(value) {
      const newTicker = this.coins.find(
        (coin) => coin.Symbol === value || coin.FullName === value
      );
      if (
        newTicker &&
        this.tickers.find((ticker) => ticker.Id === newTicker.Id)
      ) {
        this.errors = { ticker: "Такой тикер уже добавлен" };
        return;
      } else if (!newTicker) {
        this.errors = {
          ticker:
            "Поле не может быть пустым или содержать не существующую монету",
        };
        return;
      }
      this.tickers = [...this.tickers, newTicker];
      this.chartValues[newTicker.Symbol] = [];
      api.subscribeToTicker(
        newTicker.Symbol,
        (price, currency) =>
          this.updatePrice(newTicker.Symbol, price, currency),
        "success"
      );
      this.ticker = null;
    },
    removeTiker(value) {
      api.unsubscribeFromTicker(
        this.tickers.find((t) => value === t.Id)?.Symbol
      );
      this.tickers = this.tickers.filter((t) => value !== t.Id) || [];
      this.unselectTiker();
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
    updateTiker(ticker, price, currency) {
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
