class Grid extends DataView {

    _rowCount

    constructor(apiClient) {
        super(apiClient, { "DataUnit": Cell })
        this.dataUnitParams = [];
    }


    setRowCount(rowCount) {
        this._rowCount = rowCount;
        return this;
    }

    fullHtml() {
        return super.html().concat(this.html())
    }

 
    html() {
        return `<div id="${this._dataViewName}">
          ${this._dataUnits.map((dataUnit, i) => {
            if (i % this._rowCount === 0) {
              return `<div class="row">${dataUnit.html()}`;
            }
            if ((i + 1) % this._rowCount === 0) {
              return `${dataUnit.html()}</div>`;
            }
            return dataUnit.html();
          }).join('')}
        </div>`;
      }
      





}

class Cell extends DataUnit {


    html() {
        return `<div class="col-4" id="${this._id}">
        ${this._contentList.map(content => `<div class="${content.key} text-center">${content.data ?? ""}</div>`).join('')}
        ${this.buttons.map(button => `<div>${button.blockHtml()}</div>`).join('')}
        </div>`
    }
}