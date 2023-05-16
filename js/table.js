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
    includeRows: false,
    includeClickSortingEvent: false,
    includeBatchActions: false,
    includeSingleRecordActions: false
  }

  const labels = {
    record: [{ key: "view", name: "View" }, { key: "delete", name: "Delete" }, { key: "edit", name: "Edit" }, { key: "send", name: "Send" }],
    table: [{ key: "add", name: "Add record" }, { key: "batchDelete", name: "Delete" }, { key: "batchEdit", name: "Batch edit" }, { key: "batchSend", name: "Send" }, { key: "upload", name: "Upload" }, { key: "export", name: "Export" }]
  }

  const uuids = { columns: {}, rows: [], btns: {} }
  const columns = [];

  let dialogHandler;

  let dataArray = apiClient.getAllRecords();

  extractColumnsFromDataArray();

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

  function $el(id) {
    return document.getElementById(id);
  }

  function $col(columnName) {
    return columns.find(column => column.key === columnName);
  }

  function $id() {
    return `generictableid-${uuid.v4()}`
  }

  function $renderedCols() {
    return columns.filter(column => column.displayed);
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

  function generateColumnIds() {
    uuids.columns = $renderedCols().reduce((result, column) => {
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

  function generateBtnIds() {
    labels.table.forEach(label => uuids.btns[label.key] = $id())
  }

  function getSelectedRecords() {
    return dataArray.filter((row, index) => {
      return $el(uuids.rows[index].record.check).checked;
    })
  }

  function mount(element) {
    pipeline.mount.forEach(action => action())
    el = element;
    update();
    return this;
  }

  function update() {
    pipeline.preRender.forEach(action => action());
    el.innerHTML = getBootstrapTableHtml();
    pipeline.postRender.forEach(action => action())
  }

  function reload() {
    dataArray = apiClient.getAllRecords();
    update();
  }

  function getDataSnapshot() {
    return dataArray;
  }

  function renameColumn(column, name) {
    $col(column).name = name;
    return this;
  }

  function specifyColumnType(column, type) {
    $col(column).type = type;
    return this;
  }

  function selectIdentifier(column) {
    $col(column).identifier = true;
    return this;
  }

  function selectColumns(...selectedColumns) {
    columns.forEach(column => {
      if (!selectedColumns.includes(column.key)) column.displayed = false;
    })
    return this;
  }

  function addColumnsTogether(columnNames, columnName) {
    pipeline.preRender.push(() => dataArray.map(data => {
      data[columnName] = columnNames
        .map(name => data[name]).reduce((a, b) => a + b, 0)
    }))
    columns.push({ key: columnName, name: columnName, displayed: true, identifier: true, type: "number" });
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
    config.sortedBy = column;
    config.sortedInDescendingOrder = true;
    pipeline.preRender.push(sort);
    return this;
  }

  function sortInAscendingOrder(column) {
    config.sortedBy = column;
    config.sortedInDescendingOrder = false;
    pipeline.preRender.push(sort);
    return this;
  }

  function deleteColumn(column) {
    $col(column).displayed = false;
    return this;
  }

  function deleteColumns(...columnNames) {
    columnNames.forEach(column => deleteColumn(column));
    return this;
  }

  function extractColumnsFromDataArray() {
    Object.entries(dataArray[0]).forEach(([key, value]) => {
      columns.push({
        "key": key, name: key, displayed: true, identifier: false,
        type: typeof value === "number" ? "number" : "text"
      })
    })
  }

  function addClickSortingEvent() {
    config.includeClickSortingEvent = true;
    pipeline.preRender.push(sort);
    pipeline.postRender.push(() => $renderedCols().forEach((column) => {
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

  function addBatchActions() {
    config.includeBatchActions = true;
    pipeline.mount.push(generateBtnIds);
    pipeline.preRender.push(generateRowCheckIds);
    pipeline.postRender.push(() => {
      labels.table.forEach(({ key }) => $el(uuids.btns[key]).addEventListener('click', () => dialogHandler.updateDialogTable(key, getSelectedRecords())));
    })
    return this;
  }

  function getModalId(){
    return dialogHandler.getDataTarget();
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
    let bootstrapModal;

    const uuids = {
      root: $id(), accept: $id(), title: $id(), body: $id(),
      table: columns.reduce((result, column) => {
        result[column.key] = $id(); return result;
      }, {})
    }

    function addAcceptBtnListener() {
      $el(uuids.accept).addEventListener('click', onAccept.bind(this));
      bootstrapModal = new bootstrap.Modal($el(uuids.root), {});
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
        body: () => "<p>Are you sure you want to delete this record?</p>",
        callback: deleteRecord
      },
      "edit": {
        title: "Edit record",
        accept: "Save",
        body: () => getDialogTableHtml("singleOverride"),
        callback: editRecord
      },
      "batchDelete": {
        title: "Delete records",
        accept: "Confirm",
        body: () => "<p>Are you sure you want to delete these records?</p>",
        callback: deleteRecords
      },
      "batchEdit": {
        title: "Batch edit records",
        accept: "Save",
        body: () => getDialogTableHtml("multiOverride"),
        callback: editRecords
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

    function deleteRecord() {
      if (apiClient.deleteRecord(currentRecords)) {
        reload();
      }
    }

    function deleteRecords(){
      if (apiClient.deleteRecords(currentRecords)) {
        reload();
      }
    }

    function editRecords() {
      currentRecords.forEach(record => {
        columns.forEach(column => {
          const value = $el(uuids.table[column.key]).value;
          if (value) record[column.key] = column.type === "number" ? parseInt(value) : value;
        })
      })
      if (apiClient.editRecords(currentRecords)) reload();
    }


    function editRecord() {
      const record = columns.reduce((result, column) => {
        result[column.key] = column.type === "number" ?
          parseInt($el(uuids.table[column.key]).value)
          : $el(uuids.table[column.key]).value;
        return result;
      }, {});
      if (apiClient.editRecord(record)) reload();
    }

    function updateDialogTable(dialogType, records) {
      currentRecords = records, currentType = dialogType;
      const dialog = dialogs[dialogType];
      $el(uuids.body).innerHTML = dialog.body();
      $el(uuids.title).innerText = dialog.title;
      $el(uuids.accept).innerText = dialog.accept;
      bootstrapModal.show();
      dialogPostRenderActions.forEach(action => action())
    }

    function getDialogTableHtml(option, records) {
      return `      
          <table class="table popup">
            <tbody class="${name} ${currentType} dialogTable"> 
            ${columns.map(column => `
            <tr>
              <td>${column.name}</td>
              ${option === "readonly" ? `<td>${currentRecords[column.key]}</td>` : ""}
              ${option === "singleOverride" ? `<td><input type="${column.type}" id="${uuids.table[column.key]}" ${column.identifier ? "disabled" : ""} value="${currentRecords[column.key]}"/></td>` : ""}
              ${option === "multiOverride" ? `<td><input type="${column.type}" id="${uuids.table[column.key]}" ${column.identifier ? "disabled" : ""} placeholder="${currentRecords.map(record => record[column.key]).join(', ')}"/></td>` : ""}
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
            ${$renderedCols().map(column =>
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
              ${$renderedCols().map(column => `<td>${data[column.key] ?? ""}</td>`).join('')}
              ${config.includeSingleRecordActions ?
        labels.record.map(label =>
          `<td><button id="${uuids.rows[index].record[label.key]}" type="button" class="${name} button action ${label.key}">${label.name}</button></td>`
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
    addSingleRecordActions,
    selectColumns,
    selectIdentifier,
    specifyColumnType,
    addBatchActions,
    getModalId
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







