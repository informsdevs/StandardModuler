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
        let template = `<div id="${this._dataViewName}">`
        for (let i = 0; i < this._dataUnits.length; i++){
            if(i % this._rowCount === 0){
                template += `<div class="row">`;
            }
            template += this._dataUnits[i].html()
            if((i + 1) % this._rowCount === 0){
                template += `</div>`
            }
        }
        template += "</div>"

        return template;
       
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