// GitHub repository details
const GITHUB_USER = "taeho-share";
const GITHUB_REPO = "basa-chrome-extension";
const GITHUB_PATH_RESOURCES = "release/resources"; 
const GITHUB_PATH_EXAMPLES = "release/examples"; 

var MainHandler = {
	
    conf: {
        debugMode: false,
        printConsole: true,
    }, 

    initialize: function() {
        if (this.conf.printConsole) console.log('MainHandler.initialize');
        TabHandler.initialize();
        ActionButtonHandler.initialize();        
        //OptionHandler.initialize();
        //TabBlockController.initialize();
        TabCodeExampleController.initialize();
        TabResourcesController.initialize();
    }

}

MainHandler.initialize();