// Optionally, update the day on page load if the date input has a value
document.addEventListener("DOMContentLoaded", updateDayOfWeek);

// Attach the event listener to the date input
document.getElementById("date").addEventListener("change", updateDayOfWeek);

// Add event listener to the select input to change its style based on selection
const typeSelect = document.getElementById('type');

// Function to update background color based on selection
typeSelect.addEventListener('change', function () {
    if (typeSelect.value === 'Income') {
        typeSelect.classList.add('income');  // Add green class for Income
        typeSelect.classList.remove('expense');  // Remove red class for Expense
    } else if (typeSelect.value === 'Expense') {
        typeSelect.classList.add('expense');  // Add red class for Expense
        typeSelect.classList.remove('income');  // Remove green class for Income
    }
});

// Trigger the change event once to set the initial state
typeSelect.dispatchEvent(new Event('change'));


// Function to update the day of the week
function updateDayOfWeek() {
    const dateInput = document.getElementById("date").value;
    const todayDateElement = document.getElementById("todayDate");

    console.log(dateInput);

    if (dateInput) {

        // Split the dd/mm/yyyy format
        const [day, month, year] = dateInput.split("/").map(Number);

        // Create a Date object (Note: month is 0-indexed in JavaScript)
        const date = new Date(year, month - 1, day);

        //   const date = new Date(dateInput); // Convert the input value to a Date object

        console.log(date);

        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = daysOfWeek[date.getDay()]; // Get the name of the day

        console.log(date.getDay());
        console.log(dayName);

        todayDateElement.textContent = `${dayName}`; // Update the element's content
    } else {
        todayDateElement.textContent = "Please select a date."; // Fallback message
    }
}

function closePopup() {
    document.getElementById("popupForm").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

// Example function to open the popup
// Show Popup Function
async function showPopup() {
    let previousData = await fetchBalance();

    // Fill the form with the previous data
    document.getElementById("cashu").value = previousData.cash;
    document.getElementById("hdfcu").value = previousData.hdfc;
    document.getElementById("bobu").value = previousData.bob;
    document.getElementById("upiu").value = previousData.upi;
    document.getElementById("amzu").value = previousData.amz;
    document.getElementById("irctcu").value = previousData.irctc;
    document.getElementById("utsu").value = previousData.uts;

    // Display the previous values beside the input fields
    document.getElementById("cashPrev").innerText = "Previous: " + previousData.cash;
    document.getElementById("hdfcPrev").innerText = "Previous: " + previousData.hdfc;
    document.getElementById("bobPrev").innerText = "Previous: " + previousData.bob;
    document.getElementById("upiPrev").innerText = "Previous: " + previousData.upi;
    document.getElementById("amzPrev").innerText = "Previous: " + previousData.amz;
    document.getElementById("irctcPrev").innerText = "Previous: " + previousData.irctc;
    document.getElementById("utsPrev").innerText = "Previous: " + previousData.uts;

    // Show the popup form
    document.getElementById("popupForm").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

// Example function for submitting data
async function updateSubmitData() {
    let formData = {
        cash: document.getElementById("cashu").value,
        hdfc: document.getElementById("hdfcu").value,
        bob: document.getElementById("bobu").value,
        upi: document.getElementById("upiu").value,
        amz: document.getElementById("amzu").value,
        irctc: document.getElementById("irctcu").value,
        uts: document.getElementById("utsu").value
    };

    // Send the data to the server
    fetch('/updateBalance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        alert("Balance Updated successfully");
        document.getElementById("popupForm").style.display = "none";
        document.getElementById("overlay").style.display = "none";
    })
    .catch(error => {
        alert("Error updating balance");
    });
    // Collect and send data to the server
    closePopup(); // Optionally close the popup after submission

    
    await loadBalance();
}
