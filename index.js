const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
const express = require("express");
const spreadsheetId = process.env.SPREADSHEETID;
const range = "Sheet1";
require('dotenv').config();
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
console.log("Service Account JSON :- ");
console.log(credentials);
// const credentials = JSON.parse(fs.readFileSync(path.join(__dirname,'etc/secrets/service-account.json'), "utf8")); // Replace with your service account JSON file
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });
const app = express();
const PORT = 3030;
// Middleware to parse JSON data from incoming requests
app.use(express.json());
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
// app.get("/fetchBalance", (req, res) => {
//   res.json({ cash: 639, hdfc: 9678.6 }); // Example response
// });
// Endpoint to call readSheet and return data
app.get("/fetchBalance", async (req, res) => {
  const apiKey = process.env.GOOGLE_API_KEY;
  const sheets = google.sheets({
    version: "v4",
    auth: apiKey,
  });
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const data = result.data.values;
    // console.log("Full Sheet Data:", data);
    if (data && data.length > 0) {
      // console.log("Row 1 Data:", data[0]); // Display only Row 1
      const balanceJson = convertRowToJson(data[0]);
      console.log("balanceJson:", balanceJson); // Display Row 1 as JSON
      // console.log("hdfc :  ", balanceJson.hdfc);
      res.json(balanceJson);
    } else {
      console.log("The sheet is empty or has no data.");
      res.json({ error: "The sheet is empty or has no data." });
    }
  } catch (err) {
    console.error("The API returned an error:", err.message);
    res.json({ error: "The API returned an error:" });
  }
});
app.get("/getTransactions", async (req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const data = result.data.values;
    if (data && data.length > 0) {
      let [balance, summary, ...transactions] = data;
      // console.log("Balance", balance);
      // console.log("Summary", summary);
      console.log("Transcations : ", transactions);
      res.json(transactions);
    } else {
      console.log("The sheet is empty or has no data.");
    }
  } catch (err) {
    console.error("The API returned an error:", err.message);
  }
});
function convertRowToJson(array) {
  // const keys = ['cash','hdfc','bob','upi','amz','irctc','uts']; // Example column headers

  const jsonObject = {};
  for (let i = 0; i < array.length; i += 2) {
    const key = array[i];
    const value = array[i + 1];
    jsonObject[key] = isNaN(value) ? value : parseFloat(value); // Convert numeric values to numbers
  }
  return jsonObject;
}
// Handle form submission
app.post("/newEntry", (req, res) => {
  const formData = req.body; // Get the submitted form data
  console.log("Form data received: server", formData);
  const values = [
    [
      formData.date, // Date in dd/mm/yyyy
      formData.description,      // String value "Movie"
      "",          // Numeric value
      "",
      "", // Formula based on previous row values
    ],
  ];
  if (formData.type == "Income") {
    values[0][3] = formData.amount;
  }
  else {
    values[0][2] = formData.amount;
  }
  const resource = { values };
  writeData(resource);
  console.log("resournce :  ", resource);
  // Respond back to the client
  res.json({ message: "Form data successfully received", data: formData });
});
app.post("/updateBalance", async (req, res) => {
  const formData = req.body; // Get the submitted form data
  console.log("Balance Form data received: server", formData);
  const values = [[]];
  for (const [key, value] of Object.entries(formData)) {
    values[0].push(key);
    values[0].push(value);
  }
  // console.log("values", values);
  const resource = { values };
  console.log("ResourceJson op for update ", resource);
  try {
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    // Update the sheet with the new values
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A1:N1`, // Specify the range for the current row
      valueInputOption: "USER_ENTERED",
      resource,
    });
    console.log(`${response.data.updatedCells} cells updated.`);
  } catch (error) {
    console.error("Error writing to Google Sheets:", error.message);
  }
  res.json({ message: "Balance updated in sheet successfully " });
});
async function writeData(resource) {
  try {
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    const maxRowCount = metadata.data.sheets[0].properties.gridProperties.rowCount;
    console.log(`Current row count: ${maxRowCount}`);
    // Fetch the values from the sheet
    const responsemd = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = responsemd.data.values;
    // console.log("rows " , rows.length);
    const currentRowNo = rows.length + 1; // This will be the row number where you want to write
    resource.values[0][4] = `=E${currentRowNo - 1}-C${currentRowNo}+D${currentRowNo}`;
    console.log("resournce after formula :  ", resource);
    if (currentRowNo >= maxRowCount) {
      try {
        // Adding 10 more rows to the sheet by updating the rowCount
        const requests = [
          {
            updateSheetProperties: {
              properties: {
                sheetId: metadata.data.sheets[0].properties.sheetId,
                gridProperties: {
                  rowCount: currentRowNo + 10, // Add 10 rows
                },
              },
              fields: "gridProperties.rowCount",
            },
          },
        ];
        // Execute the batch update to add rows
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: ssId,
          requestBody: { requests },
        });

        console.log("10 rows added.");

      } catch (error) {
        console.error("Error adding rows:", error.message);
      }
    }
    // Update the sheet with the new values
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${currentRowNo}:E${currentRowNo}`, // Specify the range for the current row
      valueInputOption: "USER_ENTERED",
      resource,
    });

    console.log(`${response.data.updatedCells} cells updated.`);
  } catch (error) {
    console.error("Error writing to Google Sheets:", error.message);
  }
}
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});