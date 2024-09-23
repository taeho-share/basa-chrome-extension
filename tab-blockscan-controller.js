
var TabBlockScanController = {
	
  conf: {
		debugMode: false,
    printConsole: true,
	}, 

  initialize: function() {
    if (this.conf.printConsole) console.log('TabBlockScanController.initialize');
    if (this.conf.debugMode) debugger;
  },

  getSelectedOptions: function() {
    if (this.conf.printConsole) console.log('TabBlockScanController.getSelectedOptions');
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

  generateCode: function() {

    if (this.conf.printConsole) console.log('TabBlockScanController.generateCode');
    if (this.conf.debugMode) debugger;

    let selectedOptions = TabBlockScanController.getSelectedOptions();

    console.log("selectedOptions", selectedOptions);

    function findIframe(pattern = '?design_mode=y') {
      console.log("findIframe");
      // Get all iframes on the page
      const iframes = document.getElementsByTagName('iframe');
      
      // Loop through each iframe to find one with a matching 'src' pattern
      for (let iframe of iframes) {
        const src = iframe.getAttribute('src');
        if (src && src.includes(pattern)) {
          try {
            // Check if the iframe is from the same origin
            if (iframe.contentDocument) {
              // Return the document object of the iframe
              return iframe.contentDocument;
            } else {
              console.warn('Unable to access iframe content due to cross-origin policy.');
              return null;
            }
          } catch (e) {
            console.error('Error accessing iframe content:', e);
            return null;
          }
        }
      }
    
      // Return null if no iframe with the pattern is found
      console.log('No iframe found with the pattern:', pattern);
      return null;
      
    }

    function findBlockName() {
      console.log("findBlockName");
      // Find the element with the class 'p-tabview-title'
      let spanElement = document.querySelector('span.p-tabview-title');
      let blockName = "";
  
      // Extract the text content and return the specific string
      if (spanElement) {
          // Use regex to match and extract the desired portion
          let match = spanElement.textContent.match(/\[B\] (.+)/);
          if (match) {
              console.log(match[1]); // This will return 'blkCaseNegotiability'
              blockName = match[1];
          }
      }
      return blockName;
    }
    
    //---------------------------------------------------
    function generateBlockCode(myDoc) {

      console.log("generateBlockCode");
      // Find all elements with the attribute 'bf-component-container'
      const components = myDoc.querySelectorAll('[bf-component-container]');
      let accessKeys = {};
      let gettersSetters = '';
      
      // Loop through each component
      components.forEach(component => {
          // Find the input field within the component to extract the access key
          const inputField = component.querySelector('input[type="text"]');
          const bTag = component.querySelector('b');
          
          if (inputField && bTag) {
              // Extract the 'Data Link' from the <b> element's text content
              const dataLink = bTag.textContent.match(/Data Link\s*:\s*(\w+)/);
              const accessKey = inputField.value;
              
              if (dataLink && accessKey) {
                  const keyName = dataLink[1];
    
                  // Add access key to the object
                  accessKeys[keyName] = accessKey;
    
                  // Create getter and setter functions dynamically
                  gettersSetters += `
      // Getter and setter for ${keyName}
      get ${keyName}() {
          return common.getValue(this.accessKeys.${keyName});
      },
      set ${keyName}(value) {
          return common.setValue(this.accessKeys.${keyName}, value);
      },
      `;
              }
          }
      });
    
      // Return the final string which includes the generated accessKeys and functions
      return `var blk_YOUR_BLOCK_NAME_Controller = {
      conf: {
          debugMode: false
      },
    
      accessKeys: ${JSON.stringify(accessKeys, null, 4)},
    ${gettersSetters}
      clearData: function() {
          ${Object.keys(accessKeys).map(key => `this.${key} = undefined;`).join('\n        ')}
      },
    
      tooltip: function (field, e) {
          switch (field) {
              case 'PLACE HOLDER':
                  $B.tooltip(e.target
                              ,"<p style='text-align:center;max-width:300px'>"
                + " YOUR HELP HERE."
                + "</p>"
                            , 'hover', 'right');
                  break;
          }
      },
    
      initController: function() {
          if (this.conf.debugMode) debugger;
      }
    };
      `;
    }    

    let ret = null;
    let blockDoc = findIframe();
  
    if (blockDoc != undefined) {
      ret = generateBlockCode(blockDoc);
    } else {
      ret = "AppDev Block Not found.";
    }
    
    return ret;    

  },  

}

var BlockScanner = {
	conf: {
		debugMode: false,
	}, 

  showAbout: function() {
    console.log("showAbout");
    const msg = "Empower AppDev development with BASA Chrome extension, "
          + "streamlining JavaScript controller creation through templates "
          + "and best practice guidelines.";
    let ret = {"aboutMessage": msg};
    return ret;
  },

  generateCode: function() {

		console.log("BlockScanner.generateCode");

    function findIframe(pattern = '?design_mode=y') {
      console.log("findIframe");
      // Get all iframes on the page
      const iframes = document.getElementsByTagName('iframe');
      
      // Loop through each iframe to find one with a matching 'src' pattern
      for (let iframe of iframes) {
        const src = iframe.getAttribute('src');
        if (src && src.includes(pattern)) {
          try {
            // Check if the iframe is from the same origin
            if (iframe.contentDocument) {
              // Return the document object of the iframe
              return iframe.contentDocument;
            } else {
              console.warn('Unable to access iframe content due to cross-origin policy.');
              return null;
            }
          } catch (e) {
            console.error('Error accessing iframe content:', e);
            return null;
          }
        }
      }
    
      // Return null if no iframe with the pattern is found
      console.log('No iframe found with the pattern:', pattern);
      return null;
      
    }

    function findBlockName() {
      console.log("findBlockName");
      // Find the element with the class 'p-tabview-title'
      let spanElement = document.querySelector('span.p-tabview-title');
      let blockName = "";
  
      // Extract the text content and return the specific string
      if (spanElement) {
          // Use regex to match and extract the desired portion
          let match = spanElement.textContent.match(/\[B\] (.+)/);
          if (match) {
              console.log(match[1]); // This will return 'blkCaseNegotiability'
              blockName = match[1];
          }
      }
      return blockName;
    }
    
    //---------------------------------------------------
    function generateBlockCode(myDoc) {

      console.log("generateBlockCode");
      // Find all elements with the attribute 'bf-component-container'
      const components = myDoc.querySelectorAll('[bf-component-container]');
      let accessKeys = {};
      let gettersSetters = '';
      
      // Loop through each component
      components.forEach(component => {
          // Find the input field within the component to extract the access key
          const inputField = component.querySelector('input[type="text"]');
          const bTag = component.querySelector('b');
          
          if (inputField && bTag) {
              // Extract the 'Data Link' from the <b> element's text content
              const dataLink = bTag.textContent.match(/Data Link\s*:\s*(\w+)/);
              const accessKey = inputField.value;
              
              if (dataLink && accessKey) {
                  const keyName = dataLink[1];
    
                  // Add access key to the object
                  accessKeys[keyName] = accessKey;
    
                  // Create getter and setter functions dynamically
                  gettersSetters += `
      // Getter and setter for ${keyName}
      get ${keyName}() {
          return common.getValue(this.accessKeys.${keyName});
      },
      set ${keyName}(value) {
          return common.setValue(this.accessKeys.${keyName}, value);
      },
      `;
              }
          }
      });
    
      // Return the final string which includes the generated accessKeys and functions
      return `var blk_YOUR_BLOCK_NAME_Controller = {
      conf: {
          debugMode: false
      },
    
      accessKeys: ${JSON.stringify(accessKeys, null, 4)},
    ${gettersSetters}
      clearData: function() {
          ${Object.keys(accessKeys).map(key => `this.${key} = undefined;`).join('\n        ')}
      },
    
      tooltip: function (field, e) {
          switch (field) {
              case 'PLACE HOLDER':
                  $B.tooltip(e.target
                              ,"<p style='text-align:center;max-width:300px'>"
                + " YOUR HELP HERE."
                + "</p>"
                            , 'hover', 'right');
                  break;
          }
      },
    
      initController: function() {
          if (this.conf.debugMode) debugger;
      }
    };
      `;
    }    

    let ret = null;
    let blockDoc = findIframe();
  
    if (blockDoc != undefined) {
      ret = generateBlockCode(blockDoc);
    } else {
      ret = "AppDev Block Not found.";
    }
    
    return ret;    

  },
}