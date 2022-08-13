export default class CoinDTO {
  constructor(FullName, Id, ImageUrl, Symbol) {
    this._FullName = FullName;
    this._Id = Id;
    this._ImageUrl = ImageUrl;
    this._Symbol = Symbol;
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
}
