class Table extends DataView {

  _columns = [];
  _rows = [];
  _includeNumberedRows = false;
  _includeClickSort = false;
  _sortedInDescendingOrder = true;

  constructor(apiClient) {
    super(apiClient, { "DataUnit": Row, "Property": Column })
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

  _postRender() {
    super._postRender();
    this._columns.forEach(column => column.postRender());
    this._rows.forEach(row => row.postRender());
    this._dialog.postRender();
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


  html() {
    return super.html().concat(`
      <table class="table">
        <thead>
          <tr>
            ${this._includeNumberedRows ? "<th scope='col'>#</th>" : ""}
            ${this._columns.map(column => column.html()).join('')}
            ${this._unitButtons.length > 0 ? `<th scope='col' colspan="${this._unitButtons.length}">Actions</th>` : ""} 
          </tr>
        </thead>
        <tbody>
          ${this._rows.map(row => row.html()).join('')}
        </tbody>
      </table>
    `);
  }

}

class Column extends Component {

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

  constructor(contentList, record, id, index, label, buttons, includeNumberedRows) {
    super(contentList, record, id,  index, label, buttons)
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





