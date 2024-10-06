# Form AutoFiller - Chrome Extension

## Description

The **Form AutoFiller** is a Google Chrome extension that simplifies form filling with pasted JSON data. Its main goal is to speed up form testing by automatically filling fields based on JSON keys and corresponding values.

### Features

- **Auto-fill**: When enabled, the extension can automatically fill form fields when a JSON is pasted into the text area.
- **JSON History**: The last used JSONs are stored so you can easily revisit and reuse them.
- **Persistent Configuration**: The auto-fill option is maintained between sessions.

## Usage Instructions

1. **Installation**:

   - Clone this repository to your local machine:
     ```bash
     git clone https://github.com/your_username/form-filler-extension.git
     ```
   - Navigate to the project directory:
     ```bash
     cd form-filler-extension
     ```
   - Open Chrome and go to `chrome://extensions/`.
   - Enable "Developer mode" in the top right corner.
   - Click "Load unpacked" and select the project directory.

2. **How to use**:

   - Install the extension in your browser.
   - Open the page with the form you want to fill.
   - Click the extension icon.
   - Paste the JSON into the text area and click **Fill Form** or, if the auto-fill option is enabled, just paste the JSON.
   - Watch the form fields being filled automatically!

3. **Testing**:

   - Use different JSON formats to verify the filling functionality.
   - Check if fields that do not exist in the form are correctly notified.

### JSON Examples

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
  "phoneNumber": "+55 31 1111-1111"
}
```

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "addresses": [
    {
      "addressType": "residential",
      "zipCode": "12345-678",
      "streetName": "Main Street",
      "streetNumber": "123",
      "complement": "Apt 4B",
      "district": "Downtown",
      "city": "São Paulo",
      "state": "SP"
    }
  ]
}
```

## Contributions

Feel free to contribute with improvements or fixes. To do so, open an issue or submit a pull request.
