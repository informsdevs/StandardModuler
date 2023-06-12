import { Component } from "./component.js"

export class CustomTable extends Component {

    _selectedRecordIndices = []


    _features = {
        select: false
    }

    _eventListeners = [
        { type: 'select', callback: this._selectRecord }
    ]

    _initializers = [
        { attribute: 'features', type: 'json', callback: this.addFeatures.bind(this) }
    ]

    _selectRecord(e){
        e.target.selected ? this._selectedRecordIndices.push([e.target.index]) : this._selectedRecordIndices.splice(this._selectedRecordIndices.indexOf(e.target.index), 1)
        this._updateWatchers(this._selectedRecordIndices.map(index => this._records[index]), this._columns)
    }

    update(records, columns) {
        super.update(records, columns)
        super.render();
    }

    addFeatures(featureList) {
        featureList.forEach(feature => this.addFeature(feature));
    }

    addFeature(feature) {
        if (this._features.hasOwnProperty(feature)) {
            this._features[feature] = true;
        }
    }


    get html() {
        return `
          <table id="${this._dataViewName}" class="table">
            <thead>
              <tr>
                ${this._features.select ? `<th scope='col'>Select</th>` : ''}
                ${this._columns.map(column => `<th class="column" scope="col">${column.name}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${this._records
                .map((record, index) => {
                  return `
                    <tr>
                      ${this._features.select ? `<td><custom-check-box index=${index}></td>` : ''}
                      ${record.map(attribute => `<td>${attribute.data}</td>`).join('')}
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        `;
      }
      
}


customElements.define('custom-table', CustomTable);