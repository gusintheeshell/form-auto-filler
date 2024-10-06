function fillForm(json) {
  let notFoundFields = [];
  for (let key in json) {
    let value = json[key];
    let input = document.querySelector(`[name="${key}"], [id="${key}"]`);

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object") {
          for (let subKey in item) {
            let subInput = document.querySelector(
              `[name="${key}[${index}][${subKey}]"], [id="${key}_${index}_${subKey}"]`
            );
            if (subInput) {
              subInput.value = item[subKey];
            } else {
              notFoundFields.push(`${key}[${index}][${subKey}]`);
            }
          }
        } else {
          if (input) {
            if (input.type === "checkbox" || input.type === "radio") {
              let option = document.querySelector(
                `[name="${key}"][value="${item}"]`
              );
              if (option) option.checked = true;
              else notFoundFields.push(`${key}: ${item}`);
            } else if (input.nodeName === "SELECT" && input.multiple) {
              let options = Array.from(input.options);
              options.forEach((option) => {
                if (value.includes(option.value)) {
                  option.selected = true;
                }
              });
            } else {
              let dynamicInput = document.querySelector(
                `[name="${key}[]"]:nth-child(${index + 1})`
              );
              if (dynamicInput) dynamicInput.value = item;
              else notFoundFields.push(`${key}[]: ${item}`);
            }
          } else {
            notFoundFields.push(key);
          }
        }
      });
    } else {
      if (input) {
        input.value = value;
      } else {
        notFoundFields.push(key);
      }
    }
  }
  displayErrorMessage(notFoundFields);
}

function clearForm(json) {
  for (let key in json) {
    let input = document.querySelector(`[name="${key}"], [id="${key}"]`);

    if (Array.isArray(json[key])) {
      if (input) {
        if (input.nodeName === "SELECT" && input.multiple) {
          Array.from(input.options).forEach((option) => {
            option.selected = false;
          });
        } else if (input.type === "checkbox" || input.type === "radio") {
          input.checked = false;
        } else {
          let dynamicInputs = document.querySelectorAll(`[name="${key}[]"]`);
          dynamicInputs.forEach((dynamicInput) => {
            dynamicInput.value = "";
          });
        }
      }
    } else {
      if (input) {
        if (input.type === "checkbox" || input.type === "radio") {
          input.checked = false;
        } else {
          input.value = "";
        }
      }
    }
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
