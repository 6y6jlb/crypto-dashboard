<template>
  <div
    @click.stop="
      this.ticker.Price[this.currency] && this.$emit('toggle', this.ticker.Id)
    "
    class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid"
    :class="{
      'bg-red-100': !this.ticker.Price[this.currency],
      'cursor-pointer': this.ticker.Price[this.currency],
      'border-4':
        this.showBorder(this.ticker.Id) && this.ticker.Price[this.currency],
    }"
  >
    <div class="px-4 py-5 sm:p-6 text-center">
      <dt class="text-sm font-medium text-gray-500 truncate">
        {{ this.ticker.Name }} - {{ this.currency }}
      </dt>
      <dd class="mt-1 text-3xl font-semibold text-gray-900">
        {{ this.ticker.Price[this.currency] || 0 }}
      </dd>
      <div
        class="flex justify-center items-end flex-wrap"
        style="min-height: 30px"
      >
        <div
          v-for="(price, idx) in Object.entries(this.ticker.Price)"
          :key="idx"
        >
          <span
            @click.prevent.stop="this.$emit('change-currency', price[0])"
            class="px-2 text-sm font-medium text-gray-500 truncate pointer hover:bg-violet-200 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
            >{{ price[0] }}:</span
          >
          <span>{{ price[1] }}</span>
        </div>
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
</template>

<script>
import CoinDTO from "@/dto/Coin";
export default {
  name: "TikerItem",
  props: {
    ticker: {
      type: CoinDTO,
      default: {},
    },
    showBorder: {
      type: Boolean,
      default: false,
    },
    currency: {
      type: String,
      default: "USD",
    },
  },
};
</script>

<style></style>
