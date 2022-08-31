const AGGREGATE_INDEX = "5";
const INVALID_SUB = "500";
const REQUEST_CURRENCIES = ["USD"];
const SWAT_CURRENCIES = ["USD", "EUR", "RUB"];
export const EXCHANGE_CURRENCIES = ["EUR", "RUB"];

const tickersHandlers = {
  success: new Map(),
  fail: new Map(),
};

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${process.env.VUE_APP_CRYPTOCOMPARE}`
);

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: ticker,
    PRICE: newPrice,
    TOSYMBOL: currency,
    PARAMETER: parameter,
  } = JSON.parse(e.data);
  if (type === INVALID_SUB && parameter) {
    const options = parameter.split("~");
    const failHandlers = tickersHandlers.fail[options[-2]] || [];
    failHandlers.forEach((fn) => fn(options[-1]));
  } else if (type === AGGREGATE_INDEX && newPrice && currency) {
    const successHandlers = tickersHandlers.success[ticker] || [];
    successHandlers.forEach((fn) => fn(newPrice, currency));
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

export const subscribeToTicker = (ticker, cb, reason) => {
  const subscribers = tickersHandlers[reason][ticker] || [];
  tickersHandlers[reason][ticker] = [...subscribers, cb];
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  delete tickersHandlers[ticker];
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

window.handlers = tickersHandlers;
