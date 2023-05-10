
let globalId = 0;

function simpleTable(data) {

  const id = ++globalId;
  const name = "table" + id;
  let dataArray = data;
  let el;
  const columns = {};
  const selectedColumns = {};
  const bootstrapClasses = { "table": ["table"], "thead": [] }
  const singleRecordActionLabels = ["View", "Delete", "Edit", "Send"]
  let sortHierarchy = [];
  let sortedBy = "";
  let sortedInDescendingOrder = true;
  let includeRows = false;
  let includeClickSortingEvent = false;
  let includeSelect = false;
  let includeTableActions = false;
  let includeSingleRecordActions = false;


  extractColumnsFromDataArray();

  function addNumberedRows() {
    includeRows = true;
    return this;
  }

  function addBootstrapClass(element, bootstrapClass) {
    bootstrapClasses[element].push(bootstrapClass);
    return this;
  }

  function mount(element) {
    el = element;
    el.innerHTML = getBootstrapTableHtml();
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

  function selectColumns(columns){
      Object.keys(selectedColumns).forEach(column => {
        if(!columns.includes(column)) delete selectedColumns[column]
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

  function addSelectRow(){
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

  function deleteColumns(columnNames) {
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

  function onClickColumn(column) {
    sortedInDescendingOrder = !sortedInDescendingOrder;
    sortedBy = column;
    sort(sortedBy);
    el.innerHTML = getBootstrapTableHtml();
  }

  function onClickRecordAction(index, action){
     const modal = document.getElementById("modal");
     modal.innerHTML = getDialogHtml(dataArray[index]);
     document.body.style.overflowY = "hidden";
     modal.showModal();
  }

  function addSingleRecordActions(){
    if(!document.getElementById("modal")) {
      const modal = document.createElement("dialog")
      modal.setAttribute("id", "modal");
      document.body.appendChild(modal);
    }
    window[`onClick${name}RecordAction`] = onClickRecordAction.bind(this);
    includeSingleRecordActions = true;
    return this;
  }

  function getDialogHtml(record) {
    return `
      <h3>Detailed record</h3>
      <table class="table">
        <tbody>
          ${Object.entries(columns).map(([key, value]) => `
            <tr>
              <td>${value}</td>
              <td>${record[key]}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <form method="dialog" class="m-2 float-right">
        <button class="${name} button popup" onclick="document.body.style.overflowY = 'visible'">OK</button>
      </form>
    `;
  }


  function getBootstrapTableHtml() {
    return `
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
                  `<td><button type="button" class="${name} button action ${label.toLowerCase()}" onclick='window.onClick${name}RecordAction(${index}, "${label}");return false;'>${label}</button></td>`
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
    addBootstrapClass,
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
    .addBootstrapClass("thead", "table-dark")
    .addBootstrapClass("table", "table-striped")
}






