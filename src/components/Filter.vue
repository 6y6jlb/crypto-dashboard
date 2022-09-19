<template>
  <div v-if="this.tickersLength" class="grid grid-flow-col auto-cols-max gap-2">
    <hr class="w-full border-t border-gray-600 my-4" />
    <input
      v-model="filter"
      type="text"
      name="filter"
      id="filter"
      class="my-4 block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
      placeholder="Фильтрация"
    />
    <template v-if="this.filteredTickersLength">
      <button
        v-if="this.page > 1"
        @click="this.$emit('decrement-page')"
        type="button"
        class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Назад
      </button>
      <button
        v-if="this.page < this.maxPage"
        @click="this.$emit('increment-page')"
        type="button"
        class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Вперед
      </button>
    </template>
  </div>
  <div v-if="this.errors?.filter" class="px-4 text-sm text-red-600">
    {{ this.errors.filter }}
  </div>
  <div class="text-slate-400 my-6 px-4">
    Всего: &nbsp;
    {{ this.filteredTickersLength }}
    /
    {{ this.tickersLength }}
  </div>
</template>

<script>
export default {
  name: "filter-vue",
  props: {
    tickersLength: {
      type: Number,
      default: 0,
    },

    filteredTickersLength: {
      type: Number,
      default: 0,
    },
    filterValue: {
      type: String,
      default: "",
    },
    page: {
      type: Number,
      default: 1,
    },
    maxPage: {
      type: Number,
      default: 0,
    },
  },
  created() {
    this.filter = this.filterValue;
  },
  data() {
    return {
      errors: {},
      filter: "",
    };
  },
  watch: {
    filter() {
      this.$emit("input-filter", this.filter);
    },
  },
};
</script>

<style></style>
