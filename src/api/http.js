import { SWAT_CURRENCIES } from "./const";

export const getExchachngeRates = async () => {
  try {
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=${SWAT_CURRENCIES.join(
        ","
      )}`,
      {
        method: "GET",
        headers: {
          authorization: process.env.VUE_APP_CRYPTOCOMPARE,
        },
      }
    );
    const result = await response.json();
    return result;
  } catch (e) {
    console.warn(e);
  }
};

export const getCoins = async () => {
  try {
    const response = await fetch(
      "https://min-api.cryptocompare.com/data/all/coinlist?summary=true",
      {
        method: "GET",
        headers: {
          authorization: process.env.VUE_APP_CRYPTOCOMPARE,
        },
      }
    );
    const result = await response.json();
    return result;
  } catch (e) {
    console.warn(e);
  }
};
