//Initialize all variables with an empty string
let API_TOKEN = '';
let MODEL_URL = ''; 
let MODEL_NAME = '';
let API_RESPONSE = undefined;
let userEnteredText = '';
let models;

// Fetch the models data from the JSON file or database
fetch('/models.json') // The models file must be in the root directory
  .then(response => response.json())
  .then(modelsData => {
    models = modelsData;

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
  const selectedIndex = this.selectedIndex;

  if (selectedIndex !== undefined) {
    if (selectedIndex > 0 && models) {
      
      const selectedModel = models[selectedIndex - 1];
      
      // Set API_TOKEN, MODEL_URL, and MODEL_NAME based on the selected model
      API_TOKEN = selectedModel.apiToken;
      MODEL_URL = selectedModel.url;
      MODEL_NAME = extractModelName(MODEL_URL);
    } else {
      // No model selected, reset values      
      API_TOKEN = '';
      MODEL_URL = '';
      MODEL_NAME = '';
    }
  }
});

//Extract Model Name
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

  const modelDiv = document.getElementById('modelName');
  const jsonContentDiv = document.getElementById('jsonContent');
  jsonContentDiv.innerHTML = `<strong>Text to Evaluate:</strong>`;
  const firstSelectionDiv = document.getElementById('firstSelection');

  const modelValue = MODEL_NAME || 'None';
  modelDiv.innerHTML = `<strong>Model Selected:</strong> ${modelValue}`;

  content.forEach(item => {
    if (item && item.text) {

      const textElement = document.createElement('p');
      const userElement = document.createElement('p');
      const responseElement = document.createElement('p');
      const stringText = JSON.stringify(item.text, null, 2);

      textElement.innerHTML = `<strong>Text:</strong> ${item.text}`;
      userElement.innerHTML = `<strong>User:</strong> ${item.user || 'Unknown User'}`;

      query(stringText).then((API_RESPONSE) => {
        responseElement.innerHTML = `<strong>Response:</strong> ` + formatObject(API_RESPONSE);
      });

      jsonContentDiv.appendChild(userElement);
      jsonContentDiv.appendChild(textElement);
      jsonContentDiv.appendChild(responseElement);
    }
  });

  // Hide the firstSelection div after the file is loaded
  firstSelectionDiv.style.display = 'none';
  
  // Show the buttons after the file is loaded
  document.getElementById('buttons').style.display = 'block';
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

//Get file from user
document.getElementById('fileInput').addEventListener('change', async (event) => {
  const fileInput = event.target;
  const file = fileInput.files[0];

  if (file) {
    try {
      const fileContent = await file.text();
      const parsedJson = JSON.parse(fileContent);

      // Display the content of the loaded JSON file
      displayJsonContent(parsedJson);

    } catch (error) {
      console.error('Error parsing JSON file:', error.message);
    }
  }
});

//Evaluate Button
function textInput() {
  //Get text
  const textInput = document.getElementById('textInput');
  userEnteredText = textInput.value.trim();

  const modelDiv = document.getElementById('modelName');
  const jsonContentDiv = document.getElementById('jsonContent');
  const firstSelectionDiv = document.getElementById('firstSelection');
  const queryResponseDiv = document.getElementById('modelResponse');

  //Populate Model Name
  const modelValue = MODEL_NAME || 'None';
  modelDiv.innerHTML = `<strong>Model Selected:</strong> ${modelValue}`;

  //Populate Text to Evaluate
  jsonContentDiv.innerHTML = `<strong>Text to Evaluate:</strong> ${userEnteredText}`;

  //Show Response
  query(userEnteredText).then((API_RESPONSE) => {
    queryResponseDiv.innerHTML = `<strong>Response:</strong> ` + formatObject(API_RESPONSE);
  });
  
  // Hide the firstSelection div after the button is pressed
  firstSelectionDiv.style.display = 'none';
  
  // Show buttons
  document.getElementById('buttons').style.display = 'block';
}

//Save button
/*function saveResults() {
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
}*/

//Reload buttone
function loadAnotherFile() {
  location.reload();
}

// Hide "save" and "reload" buttons on page loading
document.getElementById('buttons').style.display = 'none';