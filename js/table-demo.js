

window.addEventListener("DOMContentLoaded", async () => {

    const auth = {
        url: "https://in.informs.dk/api/api.php/records/platformcc6831243_tokens_793524",
        user: "",
        password: ""
    }

    const response = await fetch("../json/store.json");

    const data = await response.json();

    const table = defaultStylizedTable(data)
        .addColumnsTogether(["academy", "challange"], "Total")
        .renameColumn("challange", "Challenge")
        .sortInDescendingOrder("Total")
        .addSelectRow()
        .addSingleRecordActions()
        .mount(document.getElementById("table"))

        const table2 = defaultStylizedTable(data)
        .addColumnsTogether(["academy", "challange"], "Total")
        .renameColumn("challange", "Challenge")
        .sortInDescendingOrder("Total")
        .addSelectRow()
        .addSingleRecordActions()
        .mount(document.getElementById("table2"))

});

