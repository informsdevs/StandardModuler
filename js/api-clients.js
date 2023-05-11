function mockApiClient(){

   let data = [
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


    function getAllRecords(){
        return data;
    }

    function deleteRecord(record){
        console.log(record);

        data = data.filter(employee => employee.Employee_ID != record.Employee_ID);
        return true;
    }


    return {
        getAllRecords,
        deleteRecord
    }

    

}