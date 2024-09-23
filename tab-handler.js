
var TabHandler = {
	
  conf: {
		debugMode: false,
    printConsole: true,
	}, 

  currentTabId: "tabCodeGeneration",
  tabs: [],
  panels: [],

  initialize: function() {
    if (this.conf.printConsole) console.log('TabHandler.initialize');
    if (this.conf.debugMode) debugger;

    this.tabs = document.querySelectorAll('.tabs ul li'); // Get all tab elements
    this.panels = document.querySelectorAll('.panel'); // Get all panel elements

    // Add click event listeners to each tab
    this.tabs.forEach(tab => {

      tab.addEventListener('click', () => {
        
        this.tabs.forEach(t => t.classList.remove('is-active')); // Remove active class from all tabs        
        this.panels.forEach(p => p.classList.add('is-hidden')); // Hide all panels

        tab.classList.add('is-active'); // Add active class to the clicked tab
        
        // Show the corresponding panel
        const panelId = tab.getAttribute('data-tab');
        this.currentTabId = panelId;

        document.getElementById(panelId).classList.remove('is-hidden');

      });
    });    
  
  }

}
