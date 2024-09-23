
var ActionButtonHandler = {
	
  conf: {
		debugMode: false,
    printConsole: true,
	}, 

  initialize: function() {
    if (this.conf.printConsole) console.log('ActionButtonHandler.initialize');
    if (this.conf.debugMode) debugger;

    document.getElementById('btnClose').addEventListener('click', () => {    
      console.log("btnClose");
      window.close();
    });

    document.getElementById('btnGenerateCode').addEventListener('click', () => {
      
      // Communicate with the content script to scan the page
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        debugger;
        chrome.scripting.executeScript(
          {        
            target: { tabId: tabs[0].id },
            function: BlockScanner.generateCode
          },
          (results) => {
            // Display the generated JavaScript class code in the popup
            const code = results[0].result;
            console.log("code", code);
            document.getElementById('generatedCode').textContent = code;
          }
        );
      });
    });

    
    document.getElementById('btnCopyClipboard').addEventListener('click', () => {
    
      console.log("btnCopyClipboard");
 
    });    

    //document.getElementById('btnShowInNewTab').addEventListener('click', () => {
    
    //  console.log("btnShowInNewTab");

    //});

  }
}

