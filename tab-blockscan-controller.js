var TabBlockScanController = {
  conf: {
    debugMode: false,
    printConsole: true,    
  }, 

  initialize: async function() {
    console.log('TabBlockScanController.initialize');
    if (this.conf.debugMode) debugger;
  },

  /*
    This script will be running not in Chrome Extension context but the web page itself.
    In order to debug the script, you will need to open developer tool from the web page.
  */  
  generateCode: function (printConsole, debugMode, jsonOptions) {
    if (printConsole) console.log('TabBlockScanController.generateCode');
    if (debugMode) debugger;

    if (printConsole) console.log('jsonOptions=', jsonOptions);

    // Extract the options array from the JSON object
    const options = jsonOptions.options;

    // Function to find the AppDev studio design area in the current tab
    function findIframe(pattern = '?design_mode=y') {
      const iframes = document.getElementsByTagName('iframe');
      for (let iframe of iframes) {
        const src = iframe.getAttribute('src');
        if (src && src.includes(pattern)) {
          try {
            if (iframe.contentDocument) {
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
      console.log('No iframe found with the pattern:', pattern);
      return null;
    }
    
    // Find block name
    function findBlockName() {
      let spanElement = document.querySelector('span.p-tabview-title');
      let blockName = "";
      if (spanElement) {
        let match = spanElement.textContent.match(/\[B\] (.+)/);
        if (match) {
          blockName = match[1];
        }
      }
      return blockName;
    }
    
    // Generate code based on selected options
    function generateBlockCode(myDoc, options) {
      const components = myDoc.querySelectorAll('[bf-component-container]');
      let accessKeys = {};
      let gettersSetters = '';
      let clearBlockData = '';
      let tooltipFunction = '';
      let initializerFunction = '';
      
      components.forEach(component => {
        const inputField = component.querySelector('input[type="text"]');
        const bTag = component.querySelector('b');
        
        if (inputField && bTag) {
          const dataLink = bTag.textContent.match(/Data Link\s*:\s*(\w+)/);
          const accessKey = inputField.value;
          
          if (dataLink && accessKey) {
            const keyName = dataLink[1];
            accessKeys[keyName] = accessKey;
            
            // Create getter and setter functions dynamically if "GetterSetter" option is selected
            if (options.includes("GetterSetter")) {
              gettersSetters += `
    // Getter and setter for ${keyName}
    get ${keyName}() {
        return common.getValue(this.accessKeys.${keyName});
    },
    set ${keyName}(value) {
        return common.setValue(this.accessKeys.${keyName}, value);
    },`;
            }
          }
        }
      });
      
      // Create clearData function if "ClearBlockData" is selected
      if (options.includes("ClearBlockData")) {
        clearBlockData = `
    clearData: function() {
        ${Object.keys(accessKeys).map(key => `this.${key} = undefined;`).join('\n        ')}
    },`;
      }

      // Create tooltip function if "LabelTooltip" is selected
      if (options.includes("LabelTooltip")) {
        tooltipFunction = `
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
    },`;
      }

      // Create initController function if "Intializer" is selected
      if (options.includes("Intializer")) {
        initializerFunction = `
    initController: function() {
        if (this.conf.debugMode) debugger;
    },`;
      }

      // Generate the final block code string
      return `
var blk_${findBlockName()}_Controller = {
    conf: {
        debugMode: false
    },
    
    accessKeys: ${JSON.stringify(accessKeys, null, 4)},${gettersSetters}    
    ${clearBlockData}    
    ${tooltipFunction}    
    ${initializerFunction}
};`;
    }
    
    let blockDoc = findIframe();
    let ret;
    if (blockDoc != undefined) {
      ret = generateBlockCode(blockDoc, options);
    } else {
      ret = "AppDev Block Not found.";
    }
    
    return ret;   
  }
}
