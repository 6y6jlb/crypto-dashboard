const AGGREGATE_INDEX = "5";
const REQUEST_CURRENCIES = ["USD", "BTC", "USDT"];
const SWAT_CURRENCIES = ["USD", "EUR", "RUB"];

const tickersHandlers = new Map();

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${process.env.VUE_APP_CRYPTOCOMPARE}`
);

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: ticker,
    PRICE: newPrice,
    TOSYMBOL: currency,
  } = JSON.parse(e.data);
  const acessCondition = type === AGGREGATE_INDEX && newPrice && currency;
  if (acessCondition) {
    const handlers = tickersHandlers.get(ticker) ?? [];
    handlers.forEach((fn) => fn(newPrice, currency));
  }
  return;
});

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker) {
  for (let currency of REQUEST_CURRENCIES) {
    sendToWebSocket({
      action: "SubAdd",
      subs: [`5~CCCAGG~${ticker}~${currency}`],
    });
  }
}

function unsubscribeFromTickerOnWs(ticker) {
  for (let currency of REQUEST_CURRENCIES) {
    sendToWebSocket({
      action: "SubRemove",
      subs: [`5~CCCAGG~${ticker}~${currency}`],
    });
  }
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};

// http
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
