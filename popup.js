function fillForm(json) {
  let notFoundFields = [];
  let filledFields = [];
  
  for (let key in json) {
    let value = json[key];
    
    // First, try to find inputs by name, then by id
    let inputs = document.querySelectorAll(`[name="${key}"]`);
    if (inputs.length === 0) {
      let inputById = document.querySelector(`[id="${key}"]`);
      if (inputById) {
        inputs = [inputById];
      }
    }
    
    if (inputs.length === 0) {
      notFoundFields.push(key);
      continue;
    }
    
    // Handle different input types
    inputs.forEach((input) => {
      if (input.type === "checkbox") {
        // Handle checkbox inputs
        if (Array.isArray(value)) {
          // For arrays, check if the checkbox value is in the array
          if (value.includes(input.value) || 
              (input.value === "" && value.includes(true)) ||
              (input.value === "on" && value.includes(true))) {
            input.checked = true;
            filledFields.push(`${key} (${input.value})`);
          } else {
            input.checked = false;
          }
        } else {
          // For single values, handle boolean, string, and number
          if (typeof value === "boolean") {
            input.checked = value;
          } else if (typeof value === "string") {
            input.checked = value.toLowerCase() === "true" || 
                           value === "1" || 
                           value === "on" ||
                           value === input.value;
          } else if (typeof value === "number") {
            input.checked = value === 1 || value === parseInt(input.value);
          } else {
            input.checked = Boolean(value);
          }
          filledFields.push(`${key} (${input.value})`);
        }
      } else if (input.type === "radio") {
        // Handle radio button inputs
        if (Array.isArray(value)) {
          // For arrays, check if the radio value is in the array
          if (value.includes(input.value)) {
            input.checked = true;
            filledFields.push(`${key} (${input.value})`);
          }
        } else {
          // For single values, check if they match
          if (input.value === value.toString()) {
            input.checked = true;
            filledFields.push(`${key} (${input.value})`);
          }
        }
      } else if (input.nodeName === "SELECT" && input.multiple) {
        // Handle multiple select
        if (Array.isArray(value)) {
          Array.from(input.options).forEach((option) => {
            option.selected = value.includes(option.value);
          });
          filledFields.push(key);
        }
      } else if (Array.isArray(value)) {
        // Handle array values for non-checkbox/radio inputs
        if (value.length > 0) {
          input.value = value[0]; // Use first value for single inputs
          filledFields.push(key);
        }
      } else {
        // Handle regular input fields
        input.value = value;
        filledFields.push(key);
      }
    });
  }
  
  // Log results to console for debugging
  if (notFoundFields.length > 0) {
    console.log("Form AutoFiller: Campos não encontrados:", notFoundFields);
    console.log("Form AutoFiller: Verifique se os nomes dos campos estão corretos no JSON");
  }
  
  if (filledFields.length > 0) {
    console.log("Form AutoFiller: Campos preenchidos:", filledFields);
  }
  
  if (notFoundFields.length === 0) {
    console.log("Form AutoFiller: Todos os campos foram preenchidos com sucesso!");
  }
}

function clearForm(json) {
  let clearedFields = [];
  for (let key in json) {
    let input = document.querySelector(`[name="${key}"], [id="${key}"]`);

    if (Array.isArray(json[key])) {
      if (input) {
        if (input.nodeName === "SELECT" && input.multiple) {
          Array.from(input.options).forEach((option) => {
            option.selected = false;
          });
          clearedFields.push(key);
        } else if (input.type === "checkbox" || input.type === "radio") {
          // Clear all checkboxes/radio buttons with the same name
          let options = document.querySelectorAll(`[name="${key}"]`);
          options.forEach((option) => {
            option.checked = false;
          });
          clearedFields.push(key);
        } else {
          let dynamicInputs = document.querySelectorAll(`[name="${key}[]"]`);
          dynamicInputs.forEach((dynamicInput) => {
            dynamicInput.value = "";
          });
          clearedFields.push(key);
        }
      }
    } else {
      if (input) {
        if (input.type === "checkbox" || input.type === "radio") {
          // Clear all checkboxes/radio buttons with the same name
          let options = document.querySelectorAll(`[name="${key}"]`);
          options.forEach((option) => {
            option.checked = false;
          });
          clearedFields.push(key);
        } else {
          input.value = "";
          clearedFields.push(key);
        }
      }
    }
  }
  
  // Log results to console for debugging
  if (clearedFields.length > 0) {
    console.log("Form AutoFiller: Campos limpos:", clearedFields);
  } else {
    console.log("Form AutoFiller: Nenhum campo foi encontrado para limpar");
  }
}

function sendJsonToContentScript(json) {
  try {
    const parsedJson = JSON.parse(json);
    saveJsonHistory(json);
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: fillForm,
        args: [parsedJson],
      });
    });
  } catch (e) {
    alert("Formato de JSON inválido");
  }
}

function sendJsonToClearForm(json) {
  try {
    const parsedJson = JSON.parse(json);
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: clearForm,
        args: [parsedJson],
      });
    });
  } catch (e) {
    alert("Formato de JSON inválido");
  }
}

function saveJsonHistory(json) {
  let jsonHistory = JSON.parse(localStorage.getItem("jsonHistory")) || [];
  jsonHistory.push(json);
  localStorage.setItem("jsonHistory", JSON.stringify(jsonHistory));
  updateJsonHistoryUI();
}

function updateJsonHistoryUI() {
  let jsonHistory = JSON.parse(localStorage.getItem("jsonHistory")) || [];
  const historyContainer = document.getElementById("json-history");
  historyContainer.innerHTML = "";

  jsonHistory.forEach((json, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `JSON ${index + 1}: ${json.substring(0, 50)}...`;
    historyContainer.appendChild(listItem);
  });
}

function displayErrorMessage(notFoundFields) {
  const errorMessage = document.getElementById("error-message");
  if (notFoundFields.length > 0) {
    errorMessage.textContent = "Um ou mais campos não foram encontrados.";
    errorMessage.style.display = "block";
    console.log("Campos não encontrados:", notFoundFields);
  } else {
    errorMessage.style.display = "none";
  }
}

function clearHistory() {
  localStorage.removeItem("jsonHistory");
  updateJsonHistoryUI();
}

function loadCheckboxState() {
  const autoFillChecked = localStorage.getItem("autoFillChecked") === "true";
  document.getElementById("auto-fill-checkbox").checked = autoFillChecked;
}

function saveCheckboxState() {
  const autoFillChecked = document.getElementById("auto-fill-checkbox").checked;
  localStorage.setItem("autoFillChecked", autoFillChecked);
}

document.getElementById("fill-form").addEventListener("click", () => {
  const json = document.getElementById("json-input").value;
  if (json) {
    sendJsonToContentScript(json);
  } else {
    alert("Cole um JSON válido");
  }
});

document.getElementById("clear-form").addEventListener("click", () => {
  const json = document.getElementById("json-input").value;
  if (json) {
    sendJsonToClearForm(json);
  } else {
    alert("Cole um JSON válido para limpar os campos.");
  }
});

document.getElementById("clear-history").addEventListener("click", () => {
  clearHistory();
});

document.getElementById("json-input").addEventListener("paste", (event) => {
  setTimeout(() => {
    const json = event.target.value;
    const autoFillChecked =
      document.getElementById("auto-fill-checkbox").checked;
    if (autoFillChecked && json) {
      sendJsonToContentScript(json);
    }
  }, 0);
});

document
  .getElementById("auto-fill-checkbox")
  .addEventListener("change", saveCheckboxState);

document.addEventListener("DOMContentLoaded", () => {
  loadCheckboxState();
  updateJsonHistoryUI();
});
