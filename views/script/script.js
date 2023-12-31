// Initialize with an empty string
let API_TOKEN = '';
let MODEL_URL = ''; 
let MODEL_NAME = '';
let API_RESPONSE = undefined;

// Fetch the models data from the JSON file or database
fetch('/models.json') // The models file must be in the root directory
  .then(response => response.json())
  .then(models => {
    // Assuming you only want the first model for demonstration purposes
    const selectedModel = models[0];

    // Set API_TOKEN, MODEL_URL, and MODEL_NAME based on the selected model
    API_TOKEN = selectedModel.apiToken;
    MODEL_URL = selectedModel.url;
    MODEL_NAME = extractModelName(MODEL_URL);

    // Populate the dropdown menu with models, including an empty placeholder
    const modelDropdown = document.getElementById('modelDropdown');

    // Add an empty placeholder option
    const emptyOption = document.createElement('option');
    emptyOption.value = ''; // Set an empty value
    emptyOption.textContent = 'Select a model'; // Set the display text
    modelDropdown.appendChild(emptyOption);

    // Add options for each model
    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.url;
      option.textContent = model.name;
      modelDropdown.appendChild(option);
    });
  });

// Update MODEL_URL and MODEL_NAME based on the selected model from the dropdown
document.getElementById('modelDropdown').addEventListener('change', function () {
  MODEL_URL = this.value;
  MODEL_NAME = extractModelName(MODEL_URL);
});

function extractModelName(url) {
  const startIndex = url.indexOf('models') + 'models'.length + 1;
  if (startIndex !== -1) {
    return url.slice(startIndex);
  } else {
    return null;
  }
}

//Send data to Hugging Face API
async function query(data) {
  const response = await fetch(
    MODEL_URL,
    {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  API_RESPONSE = await response.json();

  return API_RESPONSE;
}

//Display loaded JSON content
function displayJsonContent(content) {
  const userDiv = document.getElementById('jsonUser');
  const jsonContentDiv = document.getElementById('jsonContent');
  const firstSelectionDiv = document.getElementById('firstSelection');

  const userValue = content.user || 'User not found';
  const textValue = content.text || 'Text not found';

  userDiv.innerHTML = `<strong>User:</strong> ${userValue}`;
  jsonContentDiv.innerHTML = `<strong>Text to Evaluate:</strong> ${textValue}`;

  // Hide the firstSelection div after the file is loaded
  firstSelectionDiv.style.display = 'none';
  
  // Show the buttons after the file is loaded
  document.getElementById('buttons').style.display = 'block';
}

//Display HF Model Response
function displayQueryResponse(response) {
  const modelDiv = document.getElementById('modelName');
  const queryResponseDiv = document.getElementById('modelResponse');

  const modelValue = MODEL_NAME || 'Model name not found';
  const responseValue = formatObject(response) || 'Response not found';

  modelDiv.innerHTML = `<strong>Model Name:</strong> ${modelValue}`;
  queryResponseDiv.innerHTML = `<strong>Model Response: </strong>` + responseValue;
}

function formatObject(obj, level = 0) {
  const indentation = '  '.repeat(level);
  let formattedString = '';

  if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      formattedString += `<br>${indentation}${key}: ${formatObject(obj[key], level + 1)}`;
    });
  } else {
    formattedString += JSON.stringify(obj, null, 2);
  }

  return formattedString;
}

document.getElementById('fileInput').addEventListener('change', async (event) => {
  const fileInput = event.target;
  const file = fileInput.files[0];

  if (file) {
    try {
      const fileContent = await file.text();
      const parsedJson = JSON.parse(fileContent);
      const JsonText = JSON.stringify(parsedJson.text, null, 2);

      // Display the content of the loaded JSON file
      displayJsonContent(parsedJson);

      // Display the query response
      query(JsonText).then((API_RESPONSE) => {
        displayQueryResponse(API_RESPONSE);
      });
    } catch (error) {
      console.error('Error parsing JSON file:', error.message);
    }
  }
});

function saveResults() {
  // Get values from the displayed content
  const userValue = document.getElementById('jsonUser').textContent.replace('User:', '').trim();
  const textValue = document.getElementById('jsonContent').textContent.replace('Text to Evaluate:', '').trim();
  const modelNameValue = document.getElementById('modelName').textContent.replace('Model Name:', '').trim();
  
  // Create a JavaScript object with the values
  const resultsData = {
    user: userValue,
    text: textValue,
    model_Name: modelNameValue,
    model_Response: API_RESPONSE,
  };

  // Convert the JavaScript object to JSON
  const jsonData = JSON.stringify(resultsData, null, 2);

  // Create a Blob containing the JSON data
  const blob = new Blob([jsonData], { type: 'application/json' });

  // Create a download link
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Results - '+userValue+' - '+MODEL_NAME+'.json';

  // Append the link to the body and trigger the click event
  document.body.appendChild(a);
  a.click();

  // Remove the link from the body
  document.body.removeChild(a);
}

// Function to reload the page
function loadAnotherFile() {
  location.reload();
}

// Hide the buttons when loading another file
document.getElementById('buttons').style.display = 'none';