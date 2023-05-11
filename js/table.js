let globalId = 0;

function simpleTable(apiClient) {

  const id = ++globalId;
  const name = "table" + id;
  let el;
  const postRenderingActions = [];
  const columns = {};
  const selectedColumns = {};
  const singleRecordActionLabels = ["View", "Delete", "Edit", "Send"]
  let sortHierarchy = [];
  let sortedBy = "";
  let sortedInDescendingOrder = true;
  let includeRows = false;
  let includeClickSortingEvent = false;
  let includeSelect = false;
  let includeTableActions = false;
  let includeSingleRecordActions = false;
  let currSelectedRecord;

  let dataArray = apiClient.getAllRecords();
  extractColumnsFromDataArray();

  function addNumberedRows() {
    includeRows = true;
    return this;
  }

  function addCssClass(querySelector, className) {
    postRenderingActions.push(() => {
      console.log(`.${name + querySelector}`)
      document.querySelectorAll(`.${name + querySelector}`).forEach(element => element.classList.add(...className.split(" ")))
    })
    return this;
  }

  function mount(element) {
    el = element;
    update();
    return this;
  }

  function getDataSnapshot() {
    return dataArray;
  }

  function renameColumn(column, name) {
    columns[column] = name;
    selectedColumns[column] = name;
    return this;
  }

  function selectColumns(...columns) {
    Object.keys(selectedColumns).forEach(column => {
      if (!columns.includes(column)) delete selectedColumns[column]
    })
    return this;
  }

  function addColumnsTogether(columnNames, columnName) {
    dataArray.map(data => {
      data[columnName] = columnNames
        .map(name => data[name]).reduce((a, b) => a + b, 0)
    })
    columns[columnName] = columnName;
    selectedColumns[columnName] = columnName;
    return this;
  }

  function addSelectRow() {
    includeSelect = true;
    return this;
  }

  function compare(a, b, sortedBy, hierarchyIndex) {
    let currentHierarchyIndex = hierarchyIndex + 1;
    if (a[sortedBy] === b[sortedBy])
      return currentHierarchyIndex < sortHierarchy.length ?
        compare(a, b, sortHierarchy[currentHierarchyIndex], currentHierarchyIndex) : 0;
    if (sortedInDescendingOrder && a[sortedBy] > b[sortedBy] || !sortedInDescendingOrder && a[sortedBy] < b[sortedBy])
      return -1;
    return 1;
  }

  function sort(sortedBy) {
    dataArray.sort((a, b) => compare(a, b, sortedBy, -1))
  }

  function sortInDescendingOrder(sortedBy) {
    sortedInDescendingOrder = true;
    sort(sortedBy);
    return this;
  }

  function sortInAscendingOrder(sortedBy) {
    sortedInDescendingOrder = false;
    sort(sortedBy);
    return this;
  }

  function deleteColumn(column) {
    delete selectedColumns[column];
    return this;
  }

  function deleteColumns(...columnNames) {
    columnNames.forEach(column => delete selectedColumns[column]);
    return this;
  }

  function extractColumnsFromDataArray() {
    Object.keys(dataArray[0]).forEach(column => {
      columns[column] = column
      selectedColumns[column] = column
    }
    )
  }

  function addClickSortingEvent() {
    window[`onClickTable${id}Column`] = onClickColumn.bind(this);
    includeClickSortingEvent = true;
    return this;
  }

  function prettifyColumns() {
    Object.keys(columns).forEach(column => {
      columns[column] = column.split(/[_\s-]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      selectedColumns[column] = column.split(/[_\s-]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    })
    return this;
  }

  function update() {
    el.innerHTML = getBootstrapTableHtml();
    postRenderingActions.forEach(action => action())
  }

  function reload(){
    dataArray = apiClient.getAllRecords();
    sort(sortedBy);
    update();
  }

  function onClickColumn(column) {
    sortedInDescendingOrder = !sortedInDescendingOrder;
    sortedBy = column;
    sort(sortedBy);
    update();
  }

  function viewRecord() {
    document.querySelector(`.${name}.popupTable`).innerHTML = `
      ${Object.entries(columns).map(([key, value]) => `
        <tr>
          <td>${value}</td>
          <td>${dataArray[currSelectedRecord][key]}</td>
        </tr>
      `).join('')}
    `;
  }

  function onClickRecordAction(index, action){
      currSelectedRecord = index;
      if(action === "view") viewRecord();
      document.body.style.overflowY = "hidden";
      document.getElementById(`${name}-${action}-modal`).showModal();
  }

  function deleteRecord(){
      if(apiClient.deleteRecord(dataArray[currSelectedRecord])){
        reload();
      }    
  }

  function onCloseRecordAction(action, confirmed){
    document.body.style.overflowY = "visible";
    document.getElementById(`${name}-${action}-modal`).close();
  }
  

  function addSingleRecordActions() {
    window[`onClick${name}RecordAction`] = onClickRecordAction.bind(this);
    window[`onClose${name}RecordAction`] = onCloseRecordAction.bind(this);
    window[`onDelete${name}RecordAction`] = deleteRecord.bind(this);
    includeSingleRecordActions = true;
    return this;
  }

  function getViewDialogHtml() {
    return `
    <dialog id="${name}-view-modal">
        <h3>Detailed record</h3>
        <table class="table popup">
          <tbody class="${name} popupTable"> 
          </tbody>
          </table>
        <button class="${name} button popup m-2 float-right" onclick="window.onClose${name}RecordAction('view')">OK</button> 
    </dialog>
        `;
  }

  function getDeleteDialogHtml(){
    return `
    <dialog id="${name}-delete-modal">
    <p>Are you sure that you want to delete this record?</p>
    <div class="d-flex flex-row justify-content-center">
    <button class="m-3" onclick="onDelete${name}RecordAction(); window.onClose${name}RecordAction('delete');">Yes</button>
    <button class="m-3" onclick="window.onClose${name}RecordAction('delete')">No</button>
    </div>    
   </dialog>
    `
  }


  function getBootstrapTableHtml() {
    return `
    ${includeSingleRecordActions ? getViewDialogHtml() + getDeleteDialogHtml(): ""}
      <table class="${name} table">
        <thead class="${name} tableHead">
          <tr>
            ${includeRows ? "<th scope='col'>#</th>" : ""}
            ${includeSelect ? "<th scope='col'>Select</th>" : ""}
            ${Object.entries(selectedColumns).map(([key, value]) =>
      `<th scope="col" ${includeClickSortingEvent ? `style='cursor:pointer;' onclick='window.onClickTable${id}Column("${key}");return false;'` : ""}>${value}</th>`
    ).join('')}
            ${includeSingleRecordActions ? `<th scope='col' colspan="${singleRecordActionLabels.length}" class="text-center">Actions</th>` : ""}
          </tr>
        </thead>
        <tbody>
          ${dataArray.map((data, index) => `
            <tr>
              ${includeRows ? `<th scope='row'>${index + 1}</th>` : ""}
              ${includeSelect ? "<th> <input type='checkbox' style='cursor:pointer'/> </th>" : ""}
              ${Object.keys(selectedColumns).map(column => `<td>${data[column] ?? ""}</td>`).join('')}
              ${includeSingleRecordActions ?
        singleRecordActionLabels.map(label =>
          `<td><button type="button" class="${name} button action ${label.toLowerCase()}" onclick='window.onClick${name}RecordAction(${index}, "${label.toLowerCase()}");return false;'>${label}</button></td>`
        ).join('') : ""}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }


  return {
    prettifyColumns,
    addNumberedRows,
    mount,
    addCssClass,
    sortInAscendingOrder,
    sortInDescendingOrder,
    addClickSortingEvent,
    renameColumn,
    deleteColumn,
    deleteColumns,
    getDataSnapshot,
    addColumnsTogether,
    addSelectRow,
    addSingleRecordActions,
    selectColumns
  };
}

function defaultTable(data) {
  return simpleTable(data)
    .prettifyColumns()
    .addClickSortingEvent()
    .addNumberedRows();
}

function defaultStylizedTable(data) {
  return defaultTable(data)
    .addCssClass(".tableHead", "table-dark")
    .addCssClass(".popup.button", "btn btn-secondary btn-sm")
    .addCssClass(".action.button", "btn btn-primary btn-sm")
}







