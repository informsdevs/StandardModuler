export function platformccApiClient() {


  const auth = {
    url: "https://in.informs.dk/api/api.php/records/platformcc6831243_tokens_793524",
    user: "dfhapiuser",
    password: "5M7MydYzwIChC2kXfQJtIoGARJyrGeLFj6UzEK85"
  }
  // let initialRecords = await getAllRecords();

  async function getAllRecords(options) {


    let url = auth.url;

    const params = [];

    if (options?.columns) {
      params.push(`include=${options.columns.join(",")}`);
    }

    if (options?.sorted?.by) {
      params.push(`order=${options.sorted.by}${options.sorted.descending ? ",desc" : ""}`);
    }

    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    const response = await fetch(url, {
      headers: { 'Authorization': 'Basic ' + btoa(`${auth.user}:${auth.password}`) }
    });

    const data = await response.json();

    return data.records;
  }

  async function getRecord(id) {
    const url = `${auth.url}/${id}`;

    const response = await fetch(url, {
      headers: { 'Authorization': 'Basic ' + btoa(`${auth.user}:${auth.password}`) }
    });

    const data = await response.json();

    return data;
  }


  async function editRecords(records) {

    const ids = records.map(record => record.tid);

    const url = `${auth.url}/${ids.join(',')}`;

    const response = await fetch(url, {
      method: "PUT",
      body: JSON.stringify(records),
      headers: { 'Authorization': 'Basic ' + btoa(`${auth.user}:${auth.password}`) }
    });

  }

  async function editRecord(record) {

    const id = record.tid;

    const url = `${auth.url}/${id}`;

    const response = await fetch(url, {
      method: "PUT",
      body: JSON.stringify(record),
      headers: { 'Authorization': 'Basic ' + btoa(`${auth.user}:${auth.password}`) }
    });
  }

  async function deleteRecord(id) {

    const url = `${auth.url}/${id}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: { 'Authorization': 'Basic ' + btoa(`${auth.user}:${auth.password}`) }
    });
  }

  async function deleteRecords(ids) {

    const idString = ids.join(",");

    const url = `${auth.url}/${idString}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: { 'Authorization': 'Basic ' + btoa(`${auth.user}:${auth.password}`) }
    });
  }

  async function deleteAllRecords() {

    const ids = await getAllRecords({ columns: ["tid"] })

    if (!ids || ids.length === 0) return;

    const url = `${auth.url}/${ids.map(id => id.tid).join(',')}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: { 'Authorization': 'Basic ' + btoa(`${auth.user}:${auth.password}`) }
    });

  }

  async function createNewRecord(record) {
    await fetch(auth.url, {
      method: "POST",
      body: JSON.stringify(record),
      headers: { 'Authorization': 'Basic ' + btoa(`${auth.user}:${auth.password}`) }
    });

  }

  async function createNewRecords(records) {
    await Promise.all(records.map(async (record) => {
      await createNewRecord(record);
    }));

  }

  /*   function getMetaData() {
      return Object.entries(initialRecords[0]).map(([key, value]) => {
        return {
          "key": key,
          type: typeof value === "number" ? "number" : "text"
        }
      })
    } */

  function getMetaData() {
    return [
      {
        "key": "tid",
        "type": "number"
      },
      {
        "key": "participant_id",
        "type": "text"
      },
      {
        "key": "firstname",
        "type": "text"
      },
      {
        "key": "lastname",
        "type": "text"
      },
      {
        "key": "email",
        "type": "text"
      },
      {
        "key": "emailstatus",
        "type": "text"
      },
      {
        "key": "token",
        "type": "text"
      },
      {
        "key": "language",
        "type": "text"
      },
      {
        "key": "blacklisted",
        "type": "text"
      },
      {
        "key": "sent",
        "type": "text"
      },
      {
        "key": "remindersent",
        "type": "text"
      },
      {
        "key": "remindercount",
        "type": "number"
      },
      {
        "key": "completed",
        "type": "text"
      },
      {
        "key": "usesleft",
        "type": "number"
      },
      {
        "key": "validfrom",
        "type": "text"
      },
      {
        "key": "validuntil",
        "type": "text"
      },
      {
        "key": "mpid",
        "type": "text"
      },
      {
        "key": "attribute_1",
        "type": "text"
      },
      {
        "key": "attribute_2",
        "type": "text"
      },
      {
        "key": "attribute_3",
        "type": "text"
      },
      {
        "key": "attribute_4",
        "type": "text"
      },
      {
        "key": "attribute_5",
        "type": "text"
      },
      {
        "key": "attribute_6",
        "type": "text"
      },
      {
        "key": "attribute_7",
        "type": "text"
      },
      {
        "key": "attribute_8",
        "type": "text"
      },
      {
        "key": "attribute_9",
        "type": "text"
      },
      {
        "key": "attribute_10",
        "type": "text"
      },
      {
        "key": "attribute_11",
        "type": "text"
      },
      {
        "key": "attribute_12",
        "type": "text"
      },
      {
        "key": "attribute_13",
        "type": "text"
      },
      {
        "key": "attribute_14",
        "type": "text"
      },
      {
        "key": "attribute_15",
        "type": "text"
      }
    ]
  }

  function generateTestData() {
    const records = testData.map((record) => {
      const updatedRecord = {};
      Object.values(record).forEach((value, index) => {
        const updatedKey = `attribute_${index + 1}`;
        updatedRecord[updatedKey] = value;
      });
      return updatedRecord;
    });
    return records;
  }

  async function resetTestData() {
    await deleteAllRecords();
    await createNewRecords(generateTestData());
  }

  return {
    getRecord,
    getAllRecords,
    createNewRecord,
    editRecord,
    editRecords,
    deleteRecord,
    deleteRecords,
    deleteAllRecords,
    resetTestData,
    getMetaData,
    createNewRecords
  }


}



function mockApiClient() {

  let data = testData;

  function getAllRecords() {
    return data;
  }

  function deleteRecord(record) {
    data = data.filter(employee => employee.Employee_ID != record.Employee_ID);
    return true;
  }

  function deleteRecords(records) {
    records.forEach(record => deleteRecord(record));
    return true;
  }

  function editRecord(record) {
    const index = data.findIndex((el) => el.Employee_ID === record.Employee_ID);
    data[index] = record;
    return true;
  }

  function editRecords(records) {
    records.forEach(record => {
      editRecord(record)
    });

    return true;

  }


  return {
    getAllRecords,
    deleteRecord,
    deleteRecords,
    editRecord,
    editRecords
  }



}

let testData = [
  {
    "Employee_ID": 9876543,
    "name": "John Doe",
    "client": "ABC Company",
    "country": "United States",
    "retailer": "XYZ Retail",
    "store": "XYZ Store",
    "academy": 95,
    "challenge": 25,
    "manual_points": 8
  },
  {
    "Employee_ID": 1257312,
    "name": "Emma Johnson",
    "client": "Apple Inc.",
    "country": "United States",
    "retailer": "Best Buy",
    "store": "Apple Store San Francisco",
    "academy": 90,
    "challenge": 20,
    "manual_points": 5
  },
  {
    "Employee_ID": 9872365,
    "name": "Sophie Anderson",
    "client": "Microsoft Corporation",
    "country": "United Kingdom",
    "retailer": "Currys PC World",
    "store": "Microsoft Store London",
    "academy": 80,
    "challenge": 10,
    "manual_points": 2
  },
  {
    "Employee_ID": 4568219,
    "name": "Juan Rodriguez",
    "client": "Google LLC",
    "country": "Spain",
    "retailer": "MediaMarkt",
    "store": "Google Store Madrid",
    "academy": 70,
    "challenge": 5,
    "manual_points": 0
  },
  {
    "Employee_ID": 7125489,
    "name": "Li Wei",
    "client": "Amazon.com, Inc.",
    "country": "China",
    "retailer": "JD.com",
    "store": "Amazon Store Beijing",
    "academy": 85,
    "challenge": 18,
    "manual_points": 3
  }
]