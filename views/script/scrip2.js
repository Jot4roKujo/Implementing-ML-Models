const API_TOKEN = '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';
let MODEL_URL = ''; // Initialize with an empty string
let MODEL_NAME = '';

// Fetch the models data from the JSON file or database
fetch('/models.json') // Assuming the models file is in the root directory
  .then(response => response.json())
  .then(models => {
    // Populate the dropdown menu with models
    const modelDropdown = document.getElementById('modelDropdown');
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

async function query(data) {
  const response = await fetch(
    MODEL_URL,
    {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();
  return result;
}

function displayJsonContent(content) {
  const userDiv = document.getElementById('jsonUser');
  const jsonContentDiv = document.getElementById('jsonContent');

  const userValue = content.user || 'User value not found';
  const textValue = content.text || 'Text not found';

  userDiv.innerHTML = `<strong>User:</strong> ${userValue}`;
  jsonContentDiv.innerHTML = `<strong>Text:</strong> ${textValue}`;
}

function displayQueryResponse(response) {
  const modelDiv = document.getElementById('modelName');
  const queryResponseDiv = document.getElementById('modelResponse');

  const modelValue = MODEL_NAME || 'Model name not found';
  const responseValue = response || 'Response not found';

  modelDiv.innerHTML = `<strong>Model Name:</strong> ${modelValue}`;
  queryResponseDiv.innerHTML = `<strong>Model Response:</strong> ${JSON.stringify(response, null, 2)}`;
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
      const data = JSON.parse(JSON.stringify(JsonText));
      const response = await query(data);
      displayQueryResponse(response);

    } catch (error) {
      console.error('Error parsing JSON file:', error.message);
    }
  }
});
