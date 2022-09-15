<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="this.ticker"
            @keydown.enter="this.addTicker(this.ticker)"
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
            @click.prevent="this.addTicker(coin.FullName)"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ coin.Name }}
          </span>
        </div>
        <div v-if="this.errors?.ticker" class="text-sm text-red-600">
          {{ this.errors.ticker }}
        </div>
      </div>
    </div>
    <button
      @click.prevent="this.addTicker(this.ticker)"
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
</template>

<script>
export default {
  name: "AddTickerForm",
  emits: ["add-ticker"],
  props: {
    coins: {
      type: Array,
      default: () => [],
    },
    tickers: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      preselectedTicker: "DOGE",
      ticker: "",
      errors: {},
    };
  },
  computed: {
    preselectedCoins() {
      const result = [];
      const value = (this.ticker || this.preselectedTicker || "").toLowerCase();
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
  },
  methods: {
    addTicker(value) {
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
      this.$emit("add-ticker", newTicker);
      this.ticker = null;
    },
  },
};
</script>
