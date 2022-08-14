export default class CoinDTO {
  constructor(Name, FullName, Id, ImageUrl, Symbol, Price = {}) {
    this._Name = Name;
    this._FullName = FullName;
    this._Id = Id;
    this._ImageUrl = ImageUrl;
    this._Symbol = Symbol;
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
    this._Price = value;
  }
}
