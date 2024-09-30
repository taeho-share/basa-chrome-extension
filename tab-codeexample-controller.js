var TabCodeExampleController = {
	
  conf: {
		debugMode: false,
    printConsole: true,    
	}, 

  initialize: async function() {
    if (this.conf.printConsole) console.log('TabCodeExampleController.initialize');
    if (this.conf.debugMode) debugger;

    const fileDropdown = document.getElementById("fileDropdown");
  
    // Clear existing options
    fileDropdown.innerHTML = '<option value="">Select an example</option>';
  
    // Fetch the dynamic file list from GitHub
    const fileList = await fetchExampleFileListFromGitHub();
  
    // Populate the dropdown with the dynamic file list
    fileList.forEach(file => {
      const option = document.createElement("option");
      option.value = file.downloadUrl;
      option.textContent = file.name;
      fileDropdown.appendChild(option);
    });
  
    // Handle file selection change event
    fileDropdown.addEventListener("change", async (event) => {
      const selectedFileUrl = event.target.value;
      if (selectedFileUrl) {
        await loadFileContent(selectedFileUrl);
      } else {
        document.getElementById("fileContent").value = "";
      }
    });


    //-----
  },

}

// Function to fetch the list of files from the GitHub repository
async function fetchExampleFileListFromGitHub() {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_PATH_EXAMPLES}`);
    
    if (response.ok) {
      const files = await response.json();
      // Filter to include only .txt files
      const textFiles = files.filter(file => file.name.endsWith('.js'));
      return textFiles.map(file => ({ name: file.name, downloadUrl: file.download_url }));
    } else {
      console.error("Error fetching file list from GitHub:", response.statusText);
      return [];
    }
  } catch (error) {
    console.error("Error fetching file list from GitHub:", error);
    return [];
  }
}

// Function to load file content from GitHub
async function loadFileContent(fileUrl) {
  try {
    const response = await fetch(fileUrl);
    if (response.ok) {
      const content = await response.text();
      document.getElementById("fileContent").value = content;
    } else {
      console.error("Error loading file content:", response.statusText);
      document.getElementById("fileContent").value = "Error loading file content.";
    }
  } catch (error) {
    console.error("Error loading file content:", error);
    document.getElementById("fileContent").value = "Error loading file content.";
  }
}