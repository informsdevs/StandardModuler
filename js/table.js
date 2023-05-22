let globalId = 0;
function simpleTable(apiClient) {

  const name = "table" + ++globalId;
  let el;

  const pipeline = {
    mount: [],
    preRender: [],
    postRender: []
  }

  const config = {
    sortHierarchy: [],
    sortedBy: "",
    sortedInDescendingOrder: true,
    infoColumn: "",
    referenceColumnsByName: false,
    includeRows: false,
    includeClickSortingEvent: false,
    includeBatchActions: false,
    includeSingleRecordActions: false
  }

  const labels = {
    record: [{ key: "view", name: "View" }, { key: "delete", name: "Delete" }, { key: "edit", name: "Edit" }, { key: "send", name: "Send" }],
    table: [{ key: "add", name: "Add record" }, { key: "batchDelete", name: "Delete" }, { key: "batchEdit", name: "Batch edit" }, { key: "batchSend", name: "Send" }, { key: "upload", name: "Upload" }, { key: "export", name: "Export" }]
  }

  const uuids = { columns: {}, rows: [], btns: {}, labels: {} }
  let columns = [];

  let dialogHandler;

  initializeColumns();

  pipeline.mount.push(generateColumnIds);

  pipeline.mount.push(() => {
    if (config.includeBatchActions || config.includeSingleRecordActions)
      dialogHandler = dialogManager();
  })

  pipeline.preRender.push(() => uuids.rows = dataArray.map(() => ({ record: {} })))

  pipeline.postRender.push(() => {
    if (config.includeBatchActions || config.includeSingleRecordActions)
      dialogHandler.addAcceptBtnListener()
  });
  
  $ref = "key";

  function $el(id) {
    return document.getElementById(id);
  }

  function $col(columnName) {
    return columns.find(column => column[$ref] === columnName);
  }

  function $id() {
    return `generictableid-${uuid.v4()}`
  }

  function $cols() {
    return columns.filter(column => column.col);
  }

  function $props() {
    return columns.filter(column => column.prop);
  }

  function $key(name){
    return $col(name).key
  }

  function addNumberedRows() {
    config.includeRows = true;
    return this;
  }

  function addCssClass(querySelector, className) {
    pipeline.postRender.push(() => {
      el.querySelectorAll(`${querySelector}`).forEach(element => element.classList.add(...className.split(" ")))
    })
    return this;
  }

  function addCssClassToDialog(querySelector, className) {
    dialogHandler.addCss(querySelector, className);
    return this;
  }

  function referenceColumnsByName() {
    $ref = "name";
    return this;
  }

  function referenceColumnsByKey() {
    $ref = "key";
    return this;
  }

  function generateColumnIds() {
    uuids.columns = $cols().reduce((result, column) => {
      result[column.key] = $id(); return result;
    }, {})
  }

  function generateRowBtnIds() {
    uuids.rows.forEach(row => {
      labels.record.forEach(({ key }) => {
        row.record[key] = $id();
      })
    })
  }

  function generateRowCheckIds() {
    uuids.rows.forEach(row => row.record.check = $id())
  }

  function generateRowCountId(){
    uuids.labels.rowCount = $id();
  }

  function generateBtnIds() {
    labels.table.forEach(label => uuids.btns[label.key] = $id())
  }

  function getSelectedRecords() {
    return dataArray.filter((row, index) => {
      return $el(uuids.rows[index].record.check).checked;
    })
  }

  function getNumberOfSelectedRows(){
    return getSelectedRecords().length;
  }

  function mount(element) {
    pipeline.mount.forEach(action => action())
    el = element;
    update();
    return this;
  }

  async function update() {
    await fetchData();
    pipeline.preRender.forEach(action => action());
    el.innerHTML = getBootstrapTableHtml();
    pipeline.postRender.forEach(action => action())
  }

  async function fetchData() {
    dataArray = await apiClient.getAllRecords();
    columns.filter(column => column.type === "number").forEach(column => {
      dataArray.forEach(record => record[column.key] = parseInt(record[column.key]));
    })
  }

  function getDataSnapshot() {
    return dataArray;
  }

  function setInfoColumn(column){
    config.infoColumn = $key(column);
    return this;
  }

  function renameColumn(column, name) {
    $col(column).name = name;
    return this;
  }

  function renameColumns(...arr) {
    arr.forEach(column => renameColumn(column[0], column[1]));
    return this;
  }

  function specifyColumnType(column, type) {
    $col(column).type = type;
    return this;
  }

  function specifyColumnTypes(columns, type) {
    columns.forEach(column => specifyColumnType(column, type))
    return this;
  }

  function selectIdentifier(column) {
    $col(column).identifier = true;
    return this;
  }

  function selectColumns(...selectedColumns) {
    columns.forEach(column => {
       column.col = selectedColumns.includes(column[$ref])
    })
    return this;
  }

  function selectProperties(...selectedProperties) {
    columns.forEach(column => {
      column.prop = selectedProperties.includes(column[$ref]);
    })
    return this;
  }

  function createSumOfColumn(columnNames, columnName) {
    pipeline.preRender.push(() => dataArray.map(data => {
      data[columnName] = columnNames
        .map(name => data[$key(name)]).reduce((a, b) => a + b, 0)
    }))
    columns.push({ key: columnName, name: columnName, col: true, prop: true, identifier: true, type: "number" });
    return this;
  }

  function compare(a, b, sortedBy, hierarchyIndex) {
    let currentHierarchyIndex = hierarchyIndex + 1;
    if (a[sortedBy] === b[sortedBy])
      return currentHierarchyIndex < config.sortHierarchy.length ?
        compare(a, b, config.sortHierarchy[currentHierarchyIndex], currentHierarchyIndex) : 0;
    if (config.sortedInDescendingOrder && a[sortedBy] > b[sortedBy] || !config.sortedInDescendingOrder && a[sortedBy] < b[sortedBy])
      return -1;
    return 1;
  }

  function sort() {
    dataArray.sort((a, b) => compare(a, b, config.sortedBy, -1))
  }

  function sortInDescendingOrder(column) {
    config.sortedBy = $key(column);
    config.sortedInDescendingOrder = true;
    return this;
  }

  function sortInAscendingOrder(column) {
    config.sortedBy = $key(column);
    config.sortedInDescendingOrder = false;
    return this;
  }

  function deleteColumn(column) {
    $col(column).col = false;
    return this;
  }

  function deleteColumns(...columnNames) {
    columnNames.forEach(column => deleteColumn(column));
    return this;
  }

  function initializeColumns() {
    apiClient.getMetaData().forEach(column => {
      column.name = column.key
      column.col = true
      column.prop = true;
      column.identifier = false
      columns.push(column);
    })
  }

  function addClickSortingEvent() {
    config.includeClickSortingEvent = true;
    pipeline.postRender.push(() => $cols().forEach((column) => {
      $el(uuids.columns[column.key]).addEventListener('click', onClickColumn.bind(this, column.key))
    }
    ))
    return this;
  }

  function prettifyColumns() {
    columns.forEach(column => {
      column.name = column.key.split(/[_\s-]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    })
    return this;
  }

  function onClickColumn(column) {
    config.sortedInDescendingOrder = !config.sortedInDescendingOrder;
    config.sortedBy = column;
    update();
  }

  function onClickCheckBox(){
    $el(uuids.labels.rowCount).innerText = `${getNumberOfSelectedRows()} row(s) selected`;
  }

  function addBatchActions() {
    config.includeBatchActions = true;
    pipeline.mount.push(generateBtnIds);
    pipeline.preRender.push(generateRowCheckIds, generateRowCountId);
    pipeline.postRender.push(() => {
      labels.table.forEach(({ key }) => $el(uuids.btns[key]).addEventListener('click', () => dialogHandler.updateDialogTable(key, getSelectedRecords())));
      uuids.rows.forEach(row => $el(row.record.check).addEventListener('click', onClickCheckBox.bind(this)));
    })
    return this;
  }


  function addSingleRecordActions() {
    config.includeSingleRecordActions = true;
    pipeline.preRender.push(generateRowBtnIds)
    pipeline.postRender.push(() => {
      uuids.rows.forEach((row, index) => {
        labels.record.forEach(({ key }) => {
          $el(row.record[key]).addEventListener('click', () => dialogHandler.updateDialogTable(key, dataArray[index]));
        });
      });
    })
    return this;
  }



  function dialogManager() {

    let currentRecords, currentType
    const dialogPostRenderActions = []

    const uuids = {
      root: $id(), accept: $id(), title: $id(), body: $id(),
      table: $props().reduce((result, column) => {
        result[column.key] = {input: $id(), check: $id()}; 
        return result;
      }, {})
    }

    function addAcceptBtnListener() {
      $el(uuids.accept).addEventListener('click', onAccept.bind(this));
    }

    const dialogs = {
      "view": {
        title: "Detailed record",
        accept: "Ok",
        body: () => getDialogTableHtml("readonly"),
        callback: () => { }
      },
      "delete": {
        title: "Delete record",
        accept: "Confirm",
        body: () => getDeleteBody(),
        callback: deleteRecord
      },
      "edit": {
        title: "Edit record",
        accept: "Save",
        body: () => getDialogTableHtml("singleOverride"),
        callback: editRecord
      },
      "add": {
        title: "Add new record",
        accept: "Save",
        body: () => getDialogTableHtml("singleOverride"),
        callback: createRecord

      },
      "batchDelete": {
        title: "Delete records",
        accept: "Confirm",
        body: () => getBatchDeleteBody(),
        callback: deleteRecords,
      },
      "batchEdit": {
        title: "Batch edit records",
        accept: "Save",
        body: () => getDialogTableHtml("multiOverride"),
        callback: editRecords,
        postrender: addCheckEventListener
      }
    }

    function getDataTarget() {
      return uuids.root;
    }

    function addCss(querySelector, className) {
      dialogPostRenderActions.push(() => {
        document.querySelectorAll(`#${uuids.root} ${querySelector}`).forEach(element => element.classList.add(...className.split(" ")))
      })
    }

    function onAccept() {
      dialogs[currentType].callback();
    }

    async function deleteRecord() {
      await apiClient.deleteRecord(currentRecords)
      update();
    }

    async function deleteRecords() {
      await apiClient.deleteRecords(currentRecords)
      update();
    }

    function extractUserInput(){
      const record = {};
      $props().filter(prop => !prop.identifier).forEach(prop => {
        const value = $el(uuids.table[prop.key].input).value;
        if (value) record[prop.key] = prop.type === "number" ? parseInt(value) : value;
      })
      return record;
    }

    function getSelectedProps(){
      return $props().filter(prop => {
        return !$el(uuids.table[prop.key].input).disabled
      })
    }

    async function editRecords() {
      const sharedProperties = {};
       getSelectedProps().forEach(prop => {
        const value = $el(uuids.table[prop.key].input).value;
        sharedProperties[prop.key] = prop.type === "number" ? parseInt(value) : value;
      })
      const records = currentRecords.map(record => {
        return { "tid": record.tid, ...sharedProperties };
      })
      await apiClient.editRecords(records)
      update();
    }


    async function editRecord() {
      const record = {"tid" : currentRecords.tid, ...extractUserInput()};           
      await apiClient.editRecord(record) 
      update();
    }

    async function createRecord(){
      const record = {"tid" : currentRecords.tid, ...extractUserInput()};
      await apiClient.createNewRecord(record) 
      update();
    }

    function addCheckEventListener(){
      $props().filter(prop => !prop.identifier).forEach((prop) => {
        $el(uuids.table[prop.key].check).addEventListener('click', () => onClickCheck(uuids.table[prop.key]))
      })
    }

    function onClickCheck(row){
      $el(row.input).disabled = !$el(row.check).checked;
    }

    function updateDialogTable(dialogType, records) {
      currentRecords = records, currentType = dialogType;
      const dialog = dialogs[dialogType];
      $el(uuids.body).innerHTML = dialog.body();
      $el(uuids.title).innerText = dialog.title;
      $el(uuids.accept).innerText = dialog.accept;
      console.log(dialog.postrender)
      if (dialog.postrender) dialog.postrender();
      dialogPostRenderActions.forEach(action => action())
    }

    function getDeleteBody(){
      return `Are you sure you want to delete ${config.infoColumn ? currentRecords[config.infoColumn] : "this record"}?`
    }

    function getBatchDeleteBody(){
      if(config.infoColumn){
        const infoArr = currentRecords.map(record => record[config.infoColumn]);
        const lastInstance = infoArr.pop();
        return `Are you sure you want to delete ${infoArr.join(', ')} and ${lastInstance}?` 
      }
      return `Are you sure you want to delete these records?` 
    }

    function getDialogTableHtml(option, records) {
      return `      
          <table class="table popup">
            <tbody class="${name} ${currentType} dialogTable"> 
            ${$props().map(column => `
            <tr>
             ${option === "multiOverride" && !column.identifier ? `<td><input type='checkbox' id="${uuids.table[column.key].check}" style='cursor:pointer'/></td>` : "" }
             ${option === "multiOverride" && column.identifier ? "<td></td>" : ""}
              <td>${column.name}</td>
              ${option === "readonly" ? `<td>${currentRecords[column.key] ?? ""}</td>` : ""}
              ${option === "singleOverride" ? `<td><input type="${column.type}" id="${uuids.table[column.key].input ?? ""}" ${column.identifier ? "disabled" : ""} value="${currentRecords[column.key] ?? ""}"/></td>` : ""}
              ${option === "multiOverride" ? `<td><input type="${column.type}" id="${uuids.table[column.key].input ?? ""}" disabled </td>` : ""}
            </tr>
          `).join('')}
            </tbody>
          </table>
      `;
    }

    function getDialogHtml() {
      return `
        <div class='modal fade' id="${uuids.root}" tabindex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="${uuids.title}"></h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div id="${uuids.body}" class="modal-body">
              </div>
              <div class="modal-footer">
                <button id="${uuids.accept}" type="button" data-dismiss="modal" class="btn btn-primary"></button>
              </div>
            </div>
          </div>
        </div>
      `;
    }


    return {
      addAcceptBtnListener,
      updateDialogTable,
      getDialogHtml,
      addCss,
      getDataTarget
    }
  }

  function getBootstrapTableHtml() {
    return `
     ${config.includeSingleRecordActions ? dialogHandler.getDialogHtml() : ""}
     ${config.includeBatchActions ? `<div class="d-flex flex-row justify-content-end gap-3">
    ${labels.table.map(label => `<button data-toggle="modal" data-target="#${dialogHandler.getDataTarget()}" id=${uuids.btns[label.key]} type="button" class="btn btn-secondary btn-sm m-1">${label.name}</button>`).join('')} 
    </div>` : ""}
      <table class="${name} table">
        <thead class="${name} tableHead">
          <tr>
            ${config.includeRows ? "<th scope='col'>#</th>" : ""}
            ${config.includeBatchActions ? `<th scope='col'>Select</th>` : ""}
            ${$cols().map(column =>
      `<th class="column" scope="col" id="${uuids.columns[column.key]}" ${config.includeClickSortingEvent ? "style='cursor:pointer;'" : ""}>${column.name}</th>`
    ).join('')}
            ${config.includeSingleRecordActions ? `<th scope='col' colspan="${labels.record.length}" class="text-center">Actions</th>` : ""}
          </tr>
        </thead>
        <tbody>
          ${dataArray.map((data, index) => `
            <tr>
              ${config.includeRows ? `<th scope='row'>${index + 1}</th>` : ""}
              ${config.includeBatchActions ? `<th> <input type='checkbox' id="${uuids.rows[index].record.check}" style='cursor:pointer'/> </th>` : ""}
              ${$cols().map(column => `<td>${data[column.key] ?? ""}</td>`).join('')}
              ${config.includeSingleRecordActions ?
        labels.record.map(label =>
          `<td><button id="${uuids.rows[index].record[label.key]}" type="button" class="${name} button action ${label.key}" data-toggle="modal" data-target="#${dialogHandler.getDataTarget()}">${label.name}</button></td>`
        ).join('') : ""}
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${config.includeBatchActions ? `<p id="${uuids.labels.rowCount}">0 row(s) selected</p>` : ''}
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
    renameColumns,
    deleteColumn,
    deleteColumns,
    getDataSnapshot,
    createSumOfColumn,
    addSingleRecordActions,
    selectColumns,
    selectIdentifier,
    specifyColumnType,
    specifyColumnTypes,
    addBatchActions,
    selectProperties,
    referenceColumnsByName,
    referenceColumnsByKey,
    setInfoColumn
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







