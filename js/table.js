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
      el.querySelectorAll(`${querySelector}`).forEach(element => element.classList.add(...className.split(" ")))
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
    includeClickSortingEvent = true;
    postRenderingActions.push(() => Object.keys(selectedColumns).forEach((key, index) => {
      el.getElementsByClassName('column')[index].addEventListener('click', onClickColumn.bind(this, key))
    }
    ))
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

  function reload() {
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

  function updateViewModal(index) {
    el.querySelector(`.popupTable.view`).innerHTML = `
      ${Object.entries(columns).map(([key, value]) => `
        <tr>
          <td>${value}</td>
          <td>${dataArray[index][key]}</td>
        </tr>
      `).join('')}
    `;
  }

  function updateEditModal(index) {
    el.querySelector(`.popupTable.edit`).innerHTML = `
    ${Object.entries(columns).map(([key, value]) => `
      <tr>
        <td>${value}</td>
        <td><input type="text" value="${dataArray[index][key]}"/></td>
      </tr>
    `).join('')}
  `;

  }




  function dialogManager(cntx) {

    const context = cntx;
    let currentRecordIndex;

    const dialogs = [
      {
        type: "delete",
        html: () => getDeleteDialogHtml(),
        update: (index) => {currentRecordIndex = index},
        show: () => showDialog("delete"),
        buttons: {
          accept: () => document.querySelector(`#${name}-delete-modal .accept`),
          reject: () => document.querySelector(`#${name}-delete-modal .reject`)
        },
        addCloseEvent: (buttons) => addCloseDialogEvents("delete", buttons.accept(), buttons.reject()),
        addAcceptEvent: (buttons) => addAcceptEvent(buttons.accept(), deleteRecord) 
      },
      {
        type: "view",
        html: () => getRecordDialogHtml("view", "Detailed Record", "Ok"),
        update: (index) => updateDialogTable("view", index),
        show: () => showDialog("view"),      
        buttons: {
          accept: () => document.querySelector(`#${name}-view-modal .Ok`)
        },
        addCloseEvent: (buttons) => addCloseDialogEvents("view", buttons.accept()),
        addAcceptEvent: () => {}
      },
      {
        type: "edit",
        html: () => getRecordDialogHtml("edit", "Edit record", "Save", "Discard"),
        update: (index) => updateDialogTable("edit", index),
        show: () => showDialog("edit"),
        buttons: {
          accept: () => document.querySelector(`#${name}-edit-modal .Save`),
          reject: () => document.querySelector(`#${name}-edit-modal .Discard`)
        },
        addCloseEvent: (buttons) => addCloseDialogEvents("edit", buttons.accept(), buttons.reject()),
        addAcceptEvent: () => {},
      
      }
    ]

    function getButtonHtml(btnLabel) {
      return `${btnLabel ? `<button class="${name} ${btnLabel} button popup m-2 float-right">${btnLabel}</button>` : ""}`
    }

    function addCloseDialogEvents(type, ...buttons) {
      buttons.forEach(btn => btn.addEventListener('click', closeDialog.bind(cntx, type)))
    }

    function addAcceptEvent(button, callback){
       button.addEventListener('click', callback.bind(cntx))
    }

    function showDialog(action) {
      document.body.style.overflowY = "hidden";
      document.getElementById(`${name}-${action}-modal`).showModal();
    }

    function closeDialog(action) {
      document.body.style.overflowY = "visible";
      document.getElementById(`${name}-${action}-modal`).close();
    }

    function getAllDialogsHtml() {
      return dialogs.map(dialog => dialog.html()).join(' ');
    }

    function deleteRecord() {
      if (apiClient.deleteRecord(dataArray[currentRecordIndex])) {
        reload();
      }
    }

    function getRecordDialogHtml(type, title, accept, reject) {
      return `
        <dialog id="${name}-${type}-modal">
          <h3>${title}</h3>
          <table class="table popup">
            <tbody class="${name} ${type} dialogTable"> 
            </tbody>
          </table>
          ${getButtonHtml(accept)}
          ${getButtonHtml(reject)}
        </dialog>
      `;
    }

    function getDeleteDialogHtml() {
      return `
        <dialog id="${name}-delete-modal">
          <p>Are you sure that you want to delete this record?</p>
          <div class="d-flex flex-row justify-content-center">
            <button class="accept m-3">Yes</button>
            <button class="reject m-3">No</button>
          </div>    
        </dialog>
      `;
    }

    function updateDialogTable(action, index) {
      currentRecordIndex = index;
      el.querySelector(`.dialogTable.${action}`).innerHTML = `
      ${Object.entries(columns).map(([key, value]) => `
        <tr>
          <td>${value}</td>
          <td>${action === "edit" ? `<input type="text" value="${dataArray[index][key]}"/>` : dataArray[index][key]} </td>
        </tr>
      `).join('')}
    `;

    }

    return {
      dialogs,
      getAllDialogsHtml
    }
  }

  function updateDeleteModal(index) {
    deleteModal = document.querySelector(`#${name}-delete-modal`);
    deleteModal.parentNode.replaceChild(deleteModal.cloneNode(true), deleteModal);
    document.querySelector(`#${name}-delete-modal .reject`).addEventListener('click', closeSingleRecordActionModal.bind(this, "delete"), { once: true })
    document.querySelector(`#${name}-delete-modal .accept`).addEventListener('click', deleteRecord.bind(this, index))
    document.querySelector(`#${name}-delete-modal .accept`).addEventListener('click', closeSingleRecordActionModal.bind(this, "delete"), { once: true })
  }



  function closeSingleRecordActionModal(action) {
    document.body.style.overflowY = "visible";
    document.getElementById(`${name}-${action}-modal`).close();
  }


  function addSingleRecordActions() {
    /*   postRenderingActions.push(() => {
      
        el.querySelector(`#${name}-view-modal > button`).addEventListener('click', closeSingleRecordActionModal.bind(this, "view"))
     
 */
    postRenderingActions.push(() => {
      dialogManager(this).dialogs.forEach(dialog => {
        dialog.addCloseEvent(dialog.buttons);
        dialog.addAcceptEvent(dialog.buttons);
        el.querySelectorAll(`.${dialog.type}.action.button`).forEach((btn, index) => {
          btn.addEventListener('click', dialog.update.bind(this, index))
          btn.addEventListener('click', dialog.show.bind(this))
        })
      })
    })

    includeSingleRecordActions = true;
    return this;
  }




  function getBootstrapTableHtml() {
    return `
    ${includeSingleRecordActions ? dialogManager().getAllDialogsHtml() : ""}
      <table class="${name} table">
        <thead class="${name} tableHead">
          <tr>
            ${includeRows ? "<th scope='col'>#</th>" : ""}
            ${includeSelect ? "<th scope='col'>Select</th>" : ""}
            ${Object.values(selectedColumns).map((value) =>
      `<th class="column" scope="col" ${includeClickSortingEvent ? "style='cursor:pointer;'" : ""}>${value}</th>`
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
          `<td><button type="button" class="${name} button action ${label.toLowerCase()}">${label}</button></td>`
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







