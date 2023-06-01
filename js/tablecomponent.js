class Table extends DataView {

  _columns = [];
  _includeNumberedRows = false;
  _includeClickSort = false;
  _sortedInDescendingOrder = true;
  _includeTableButtons = false;

  constructor(apiClient) {
    super(apiClient, { "DataUnit": Row, "Property": Column })
  }

  _preMount() {
    super._preMount();
    this._generateColumns();
    this.dataUnitParams = [this._includeNumberedRows, this._includeTableButtons]
  }

  _postMount() {
    super._postMount();
    this.el.addEventListener('sort', (e) => this._sortColumns(e.column))
  }

  _postRender() {
    super._postRender();
    this._columns.forEach(column => column.postRender());
  }

  _postRenderTable(){
    super._postRenderTable();
    this._columns.forEach(column => column.postRender());
  }

  _sortColumns(column) {
    this._sortedInDescendingOrder = !this._sortedInDescendingOrder;
    this._update(() => this._sort(column, this._sortedInDescendingOrder));
  }

  _generateColumns() {
    this._columns = this._getMainViewProperties().map(prop => new Column(prop, this._includeClickSort))
  }

  _generateRows(){
    this._rows = this._dataUnits.map(dataUnit => new Row(dataUnit, this._includeNumberedRows, this._includeTableButtons))
  }

  addNumberedRows() {
    this._includeNumberedRows = true;
    return this;
  }

  addTableButtons(){
    if(!this._dialog) this._dialog = new Dialog();
    this._includeTableButtons = true;
    return this;
  }

  addClickSort() {
    this._includeClickSort = true;
    return this;
  }


  html() {
    return `
      <table id=${this._dataViewName} class="table">
        <thead>
          <tr>
            ${this._includeNumberedRows ? "<th scope='col'>#</th>" : ""}
            ${this._columns.map(column => column.html()).join('')}
            ${this._unitButtons.length > 0 ? `<th scope='col' colspan="${this._unitButtons.length}">Actions</th>` : ""} 
          </tr>
        </thead>
        <tbody>
          ${this._dataUnits.map((row, index) =>{ 
            row.index = index;
            return row.html()}).join('')}
        </tbody>
      </table>
    `;
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
  _includeCheckBox;

  constructor(contentList, record, recordId, index, recordInfoLabel, buttons, includeNumberedRows, includeCheckBox) {
    super(contentList, record, recordId,  index, recordInfoLabel, buttons)
    this._includeNumberedRows = includeNumberedRows;
    this._includeCheckBox = includeCheckBox;
  }

  html() {
    return `<tr id="${this._id}">
    ${this._includeCheckBox ? `<th> <input type='checkbox' id="" style='cursor:pointer'/></th>` : ""}
     ${this._includeNumberedRows ? `<th scope='row'>${this.index + 1}</th>` : ""}
     ${this.contentList.map(content => `<td>${content ?? ""}</td>`).join('')}
     ${this.buttons.map(button => `<td>${button.html()}</td>`).join('')}
     </tr>`
  }

}


class CheckBox extends Component {



  get html(){ 
    return `<input type='checkbox' id="${this._id}" style='cursor:pointer'/>`
  }
   
}




