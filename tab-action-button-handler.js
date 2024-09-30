
var TabActionButtonHandler = {
	
  conf: {
		debugMode: false,
    printConsole: true,
	}, 

  test: function() {
    console.log("ActionButtonHandler.test");
  },

  initialize: function() {
    if (this.conf.printConsole) console.log('TabActionButtonHandler.initialize');
    if (this.conf.debugMode) debugger;

    const btnGenerateCode = document.getElementById('btnGenerateCode');
    const btnCopyToClipboard = document.getElementById('btnCopyToClipboard');
    const btnShowInNewTab = document.getElementById('btnShowInNewTab');
    const btnClose = document.getElementById('btnClose');
    const moBlockControllerCheckAll = document.getElementById('moBlockControllerCheckAll');

    // When the Check All checkbox is changed.
    moBlockControllerCheckAll.addEventListener('change', () => {
      if (this.conf.printConsole) console.log("moBlockControllerCheckAll");
      if (this.conf.debugMode) debugger;

      const checkboxes = document.querySelectorAll('.moBlockController');
      const isChecked = document.getElementById("moBlockControllerCheckAll").checked;

      checkboxes.forEach(function(checkbox) {
        checkbox.checked = isChecked;  // Set each checkbox to the same checked state as "Check All"
      });

    });    

    // Scan the current block and generate code template    
    btnGenerateCode.addEventListener('click', () => {
      if (this.conf.printConsole) console.log('TabActionButtonHandler.btnGenerateCode');
      if (this.conf.debugMode) debugger;

      // Communicate with the content script to scan the page
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

        let options = TabActionButtonHandler.getSelectedOptions();
        console.log("options", options);

        // ----------
        // Important: Understanding execution context
        //  Please note that the script below will be running in the context of the active tab (i.e., the webpage itself), not in the extension or background script.
        //  in order to debug the javascript codes to be called from chrome.scripting.executeScript API
        //  , you must open web browser development tool in not only chrome extension but also the web page itself. in this case, AppDev Studio page.
        chrome.scripting.executeScript(
          {        
            target: { tabId: tabs[0].id },
            function: TabBlockScanController.generateCode
            ,args: [TabActionButtonHandler.conf.printConsole, TabActionButtonHandler.conf.debugMode, options]
          },
          (results) => {
            // Display the generated JavaScript class code in the popup
            const code = results[0].result;
            console.log("code", code);
            document.getElementById('generatedCode').value = code;
          }
        );
      });
    });

    // Copy content to the clipboard
    btnCopyToClipboard.addEventListener('click', () => {
      if (this.conf.printConsole) console.log('TabActionButtonHandler.btnCopyToClipboard');
      if (this.conf.debugMode) debugger;

      if (this.conf.printConsole) console.log("tab=", TabHandler.currentTabId);

      let textContent = "";
      switch(TabHandler.currentTabId) {
        case "tabCodeGeneration":
          textContent = document.getElementById("generatedCode").value;
          break;
        case "tabCodeExamples":
          textContent = document.getElementById("fileContent").value;
          break;
      }
      
      if (this.conf.printConsole) console.log("textContent", textContent);

      if (textContent != "" && textContent != null) {
        navigator.clipboard.writeText(textContent)
          .then(() => {
            alert('Content copied to clipboard!');
          })
          .catch(err => {
            console.error('Failed to copy text: ', err);
          });
      }

    });

    // Show the content in a new browser tab
    btnShowInNewTab.addEventListener('click', () => {
      if (this.conf.printConsole) console.log('TabActionButtonHandler.btnShowInNewTab');
      if (this.conf.debugMode) debugger;

      if (this.conf.printConsole) console.log("tab=", TabHandler.currentTabId);
      let textContent = "";
      switch(TabHandler.currentTabId) {
        case "tabCodeGeneration":
          textContent = document.getElementById("generatedCode").value;
          break;
        case "tabCodeExamples":
          textContent = document.getElementById("fileContent").value;
          break;
      }
      
      if (this.conf.printConsole) console.log("textContent", textContent);

      // Get the URL of template.html from the Chrome extension folder
      const templateUrl = chrome.runtime.getURL('contents-modal.html');
    
      // Open template.html in a new tab
      const newTab = window.open(templateUrl, '_blank');
    
      newTab.onload = () => {
        const contentsElement = newTab.document.getElementById('newTabContent');
        contentsElement.textContent = textContent;
      }

    });
    
    // Close BASA Chrome Extension
    btnClose.addEventListener('click', () => {    
      console.log("ActionButtonHandler.btnClose");
      if (this.conf.debugMode) debugger;
      window.close();
    });

  },

  getSelectedOptions: function() {
    if (this.conf.printConsole) console.log('TabActionButtonHandler.btnShowInNewTab');
    if (this.conf.debugMode) debugger;      

    let jsonObject = {};

    // Access all checkboxes with class 'moBlockController'
    let checkboxes = document.querySelectorAll('.moBlockController');
    let selectedOptions = [];
  
    // Loop through checkboxes and check if they are selected
    checkboxes.forEach(function(checkbox) {
      if (checkbox.checked && checkbox.value != "CheckAll") {
        selectedOptions.push(checkbox.value);
      }
    });
  
    // Create the JSON object
    jsonObject = {
      options: selectedOptions
    };
    
    return jsonObject;
    
  },    

}
