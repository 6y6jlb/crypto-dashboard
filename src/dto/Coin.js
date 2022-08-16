export default class CoinDTO {
  constructor(Name, FullName, Id, ImageUrl, Symbol, Price = {}) {
    /**@type {string} */
    this._Name = Name;
    /**@type {string} */
    this._FullName = FullName;
    /**@type {string} */
    this._Id = Id;
    /**@type {string} */
    this._ImageUrl = ImageUrl;
    /**@type {string} */
    this._Symbol = Symbol;
    /**@type {Object} */
    this._Price = Price;
  }

  get Name() {
    return this._Name;
  }
  get FullName() {
    return this._FullName;
  }
  get Id() {
    return this._Id;
  }
  get ImageUrl() {
    return this._ImageUrl;
  }
  get Symbol() {
    return this._Symbol;
  }
  get Price() {
    return this._Price;
  }
  set Price(value) {
    /**@type {Object} */
    this._Price = value;
  }
}
