
window.addEventListener("DOMContentLoaded", async () => {

    const response = await fetch("../json/store.json");

    const data = await response.json();

    console.log(data);

    const table = defaultStylizedTable(data)
        .addColumnsTogether(["academy", "challange"], "Total")
        .renameColumn("challange", "Challenge")
        .sortInDescendingOrder("Total")
        .addSelectRow()
        .selectColumns("client", "country", "retailer")
        .addSingleRecordActions()
        .mount(document.getElementById("table"))

        const table2 = defaultTable(data)
        .addColumnsTogether(["academy", "challange"], "Total")
        .renameColumn("challange", "Challenge")
        .sortInDescendingOrder("Total")
        .addSelectRow()
        .addSingleRecordActions()
        .mount(document.getElementById("table2"))

});

