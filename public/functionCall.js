// Call the function when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", loadBalance);

document.addEventListener("DOMContentLoaded", logTransactions);

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("fetchBtn").addEventListener("click", loadBalance);
});

async function fetchBalance() {
    console.log("Function fetchBalance triggered");

    try {
        const response = await fetch('/fetchBalance');
        const data = await response.json();
        console.log("Sheet Data:", data);

        return data;

    } catch (err) {
        console.error("Error in fetchBalance:", err);
    }
}

async function loadBalance() {
    const data = await fetchBalance();
    var acc = data.hdfc + data.bob + data.upi + data.amz + data.uts + data.irctc;
    var balanceTotal = acc + data.cash;
    document.getElementById("acc").textContent = acc.toFixed(2);
    document.getElementById("balanceTotal").textContent = balanceTotal.toFixed(2);

    // Iterate over the JSON keys and set the respective <h3> values
    for (const [key, value] of Object.entries(data)) {
        const h3Element = document.getElementById(key); // Find the <h3> by ID
        if (h3Element) {
            h3Element.textContent = `${value}`; // Set the text content
        } else {
            console.warn(`No <h3> found with ID: ${key}`);
        }
    }
}


// Handle form submission using JavaScript and send data via fetch
document.getElementById("transactionForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    const formData = new FormData(this);

    console.log("form date : ", formData);

    // Convert form data to a JSON object
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    console.log("form date data : ", data);
    data.date = convertDateFormat(data.date);

    // Send the data to the server using fetch
    fetch("/newEntry", {
        method: "POST",
        headers: {
            "Content-Type": "application/json", // Set the content type to JSON
        },
        body: JSON.stringify(data), // Send the data as a JSON string
    })
        .then(response => response.json()) // Parse the response as JSON
        .then(responseData => {
            console.log("Data successfully submitted:", responseData);
            alert("Data successfully submitted");
            // document.getElementById("transactionForm").reset();
        })
        .catch(error => {
            console.error("Error submitting data:", error);
        });

    location.reload();
});


function convertDateFormat(dateStr) {
    const [month, day, year] = dateStr.split("/"); // Split by "/"
    return `${day}/${month}/${year}`; // Re-arrange to dd/mm/yyyy
}

async function getTransactions(){
    try {
        const response = await fetch('/getTransactions');
        const Tdata = await response.json();
        console.log("Transactions Data:", Tdata);

        return Tdata;

    } catch (err) {
        console.error("Error in fetching Transactions:", err);
    }
}


async function logTransactions() {
    
    const tdata = await getTransactions();
    const data = [];
    for (const [key, value] of Object.entries(tdata)) {
        data.push(value);
    }
    // console.log("Transactions Data: in log func", tdata);
    // console.log("data : " , data);

    // Populate the table
    const tableBody = document.getElementById('tableBody');
    
    const reversedArray = [...data].reverse();

    reversedArray.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });

    // Scroll to the bottom
    tableContainer.scrollTop = tableContainer.scrollHeight;

    // Keep scroll position at the bottom unless manually changed
    let userScrolled = false;
    tableContainer.addEventListener('scroll', () => {
        const atBottom =
            tableContainer.scrollHeight - tableContainer.scrollTop ===
            tableContainer.clientHeight;
        if (atBottom) userScrolled = false;
        else userScrolled = true;
    });

    const observer = new MutationObserver(() => {
        if (!userScrolled) {
            tableContainer.scrollTop = tableContainer.scrollHeight;
        }
    });

    observer.observe(tableBody, { childList: true });
}