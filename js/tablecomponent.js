class Table extends DataView {

  _includeNumberedRows = false;
  _includeClickSort = false;
  _sortedInDescendingOrder = true;
  childComponents = {columns : []}

  constructor(apiClient) {
    super(apiClient, { "DataUnit": Row, "Property": Column })
  }


  get label(){
    return "table";
  }

  generateChildComponents(){
    this.childComponents.columns = this._generateColumns();
  //  this._childComponents.rows = this._generateRows();
  }
  
  _preMount() {
    super._preMount();
    this._generateColumns();
  }

  _preRender(){
    super._preRender();
    this._generateRows();
  }

  _postMount() {
    super._postMount();
    this.el.addEventListener('sort', (e) => this._sortColumns(e.column))
  }


  _sortColumns(column) {
    this._sortedInDescendingOrder = !this._sortedInDescendingOrder;
    this._update(() => this._sort(column, this._sortedInDescendingOrder));
  }

  _generateColumns() {
    this._columns = this._getMainViewProperties().map(prop => new Column(prop, this._includeClickSort))
  }

  _generateRows(){
    this._rows = this._getDataUnits(this._includeNumberedRows);
  }

  addNumberedRows() {
    this._includeNumberedRows = true;
    return this;
  }

  addClickSort() {
    this._includeClickSort = true;
    return this;
  }


  get html() {
    return `
      <table class="table">
        <thead>
          <tr>
            ${this._includeNumberedRows ? "<th scope='col'>#</th>" : ""}
            ${`<div id="${this.getChildMountId("columns")}"> </div>`}
            ${this._unitButtons.length > 0 ? `<th scope='col' colspan="${this._unitButtons.length}">Actions</th>` : ""} 
          </tr>
        </thead>
        <tbody>
        ${`<div id="${this.getChildMountId("rows")}"> </div>`}
        </tbody>
      </table>
    `;
  }

}

class Column extends Component {

  label = "th";

  constructor({ key, name, type, readonly }, includeClickSort) {
    super();
    this.key = key;
    this.name = name;
    this.type = type;
    this.readonly = readonly;
    this.includeClickSort = includeClickSort;
  }

  postRender() {
    super.postRender();
    if (this.includeClickSort) {
      this._el.addEventListener('click', this.onClick.bind(this))
      this._el.style.cursor = "pointer";
    }
  }

  onClick() {
    const sortEvent = new Event('sort', { bubbles: true });
    sortEvent.column = this.name;
    this._el.dispatchEvent(sortEvent);
  }

  html() {
    return `<th class="column" scope="col" id="${this._id}" }>${this.name}</th>`
  }
}

class Row extends DataUnit {

  _includeNumberedRows;

  constructor(contentList, record, id, index, buttons, includeNumberedRows) {
    super(contentList, record, id,  index, buttons)
    this._includeNumberedRows = includeNumberedRows;
  }

  html() {
    return `<tr id="${this._id}">
     ${this._includeNumberedRows ? `<th scope='row'>${this._index + 1}</th>` : ""}
     ${this._contentList.map(content => `<td>${content ?? ""}</td>`).join('')}
     ${this._buttons.map(button => `<td>${button.html()}</td>`).join('')}
     </tr>`
  }

}





