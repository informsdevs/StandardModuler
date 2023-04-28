

    import {genericTable} from "./table.js"
    import data from "../json/demo-data.json" assert { type: 'json' }

    data.map(employee => employee.total = employee.challange + employee.academy)


   genericTable(data)
   .addBootstrapClass("table-dark")
   .addBootstrapClass("table-striped")
   .prettifyColumns()
   .renameColumn("challange", "Challenge")
   .addNumberedRows()
   .sortInDescendingOrder("total")
   .addClickSortingEvent()
   .mount(document.body);

