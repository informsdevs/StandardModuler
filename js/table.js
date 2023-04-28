export function genericTable(data) {

  const dataArray = data;
  const columns = {};
  let includeRows = false;
  let includeClickSortingEvent = false;
  const bootstrapClasses = { "table": ["table"], "thead": [] }
  let sortHierarchy = [];
  let el;
  let sortedInDescendingOrder = true;
  let sortedBy = "";

  extractColumnsFromDataArray();

  function addNumberedRows() {
    includeRows = true;
    return this;
  }

  function addBootstrapClass(bootstrapClass) {
    bootstrapClasses[bootstrapClass.split('-')[0]].push(bootstrapClass);
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

  function extractColumnsFromDataArray() {
    Object.keys(dataArray[0]).forEach(column =>
      columns[column] = column
    )
  }

  function addClickSortingEvent() {
    window.onClickColumn = onClickColumn.bind(this);
    includeClickSortingEvent = true;
    return this;
  }

  function prettifyColumns() {
    Object.keys(columns).forEach(column =>
      columns[column] = column.split(/[_\s-]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    )
    return this;
  }

  function onClickColumn(column) {
    sortedInDescendingOrder = !sortedInDescendingOrder;
    sortedBy = column;
    sort(sortedBy);
    el.innerHTML = getBootstrapTableHtml();
  }


  function getBootstrapTableHtml() {
    return `
      <table class="${bootstrapClasses.table.join(' ')}">
        <thead class="${bootstrapClasses.thead.join(' ')}">
          <tr>
            ${includeRows ? "<th scope='col'>#</th>" : ""}
            ${Object.entries(columns).map(([key, value]) => `<th scope="col" ${includeClickSortingEvent ? `style='cursor:pointer;' onclick='window.onClickColumn("${key}");return false;'` : ""}>${value}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${dataArray.map((data, index) => `
            <tr>
            ${includeRows ? `<th scope='row'>${index + 1}</th>` : ""}
              ${Object.keys(columns).map(column => `<td>${data[column] ?? ""}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      `

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
    getDataSnapshot
  };
}







