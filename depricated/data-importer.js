class ImportButton extends Component {

    _dataHandler;
    _sharedProperties = [];
    _csvColumnsNamedAs = "name";
    _columns;
    _rows;
  

    constructor(dataHandler) {
        super();
        this._dataHandler = dataHandler;
    }


    postRender() {
        this._el.addEventListener('change', this.onChange.bind(this))
    }

    _createSharedProperties(csvColumns) {
        this._sharedProperties = this._dataHandler.dialogViewProperties.filter(prop => {
            return csvColumns.includes(prop[this._csvColumnsNamedAs])
        })
    }

    _splitCsvIntoLines(csvContent) {
        return csvContent.split(/\r?\n/).filter((line) => {
            return line.trim() !== '';
        });;
    }

    _getCsvColumns(lines) {
        return lines[0].split(';');
    }


    _getCsvRecord(columns, line) {
        const record = {};
        line.split(';').forEach((value, index) => {
            record[columns[index]] = value;
        })
        return record;
    }

    _getCsvRecords(columns, lines) {
        return lines.splice(1).map(line => this._getCsvRecord(columns, line));
    }

    onChange(e) {

        var file = e.target.files[0];

        let csvContent;

        if (file) {
            var reader = new FileReader();

            reader.onload = (e) => {
                csvContent = e.target.result;
                const lines = this._splitCsvIntoLines(csvContent);
                const columns = this._getCsvColumns(lines);
                const records = this._getCsvRecords(columns, lines);
            };

            reader.readAsText(file);

      
        }
    }

    html() {
        return `<input type="file" id="${this._id}" />`
    }

}

class ImportDialogTable {

    _columns;
    _rows;



    get html(){
            return `
              <table id="${this._dataViewName}" class="table">
                <thead>
                <tr>
                ${this.columns.map(column => `<th scope="col">${column}</th>`).join('')}
              </tr>              
                </thead>
                <tbody>
                ${this._rows.map(row => `<tr>${row.map(attr => `<td>${attr}</td>`).join('')} </tr>`).join('')}        
                </tbody>
              </table>
            `;
          }
    }



class ImportDialog extends Compenent {

    _body = uuid.v4();
    _title = uuid.v4();
    _accept = uuid.v4();
    _reject = uuid.v4();
     
    constructor(){
        super();



    }



    get html(){
        
    }

    get html(){   
        return `
        <div class='modal fade' id="${this._id}" tabindex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Import records</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body" id="${this._body}">
              </div>
              <div class="modal-footer">
                <div id="${this._reject}"></id>
                <div id="${this._accept}"></id>

              
              </div>
            </div>
          </div>
        </div>
      `;
    }

}