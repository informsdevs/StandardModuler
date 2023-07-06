import { RecordListComponent } from "../base-components/component.js";

export class CustomStats extends RecordListComponent {

    update(records, columns){
        super.update(records, columns);
        super.render();
    }

    get html() {
        return `
          <div>
            <div>
              <h5>${this._name}</h5>
              <h1>${this._records.length}/100
                <span style="font-size: 12px;"></span>
              </h1>
            </div>
            <div class="progress">
              <div class="progress-bar" style="width: ${this._records.length}%" role="progressbar" aria-valuenow="${this._records.length}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
        `;
      }
      
}

customElements.define('custom-stats', CustomStats);