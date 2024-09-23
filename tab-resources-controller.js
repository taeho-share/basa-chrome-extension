var TabResourcesController = {
  conf: {
    debugMode: false,
    printConsole: true,    
  }, 

  initialize: async function() {
    if (this.conf.printConsole) console.log('TabResourcesController.initialize');
    if (this.conf.debugMode) debugger;

    const resourceFileList = document.getElementById("resourceFileList");
  
    // Clear existing content
    resourceFileList.innerHTML = '';
  
    // Fetch the dynamic file list from GitHub
    const fileList = await fetchFileListFromGitHub();
  
    const ulTag = document.createElement("ul");
    resourceFileList.appendChild(ulTag);

    // Populate the container with links to download each file
    fileList.forEach(file => {
      const liTag = document.createElement("li"); 
      liTag.style.display = "flex";        // Flexbox to align the icon and link
      liTag.style.alignItems = "center";   // Vertically center the icon and link

      // Create the icon element
      const iTag = document.createElement("i");
      iTag.classList.add("fa", "fa-file-arrow-down", "fa-fw"); // Add Font Awesome classes
      iTag.style.marginRight = "5px"; // Add some space between the icon and the link text
      liTag.appendChild(iTag);

      // Create the link element
      const linkTag = document.createElement("a");
      linkTag.href = file.downloadUrl;
      linkTag.textContent = file.name;
      linkTag.target = "_blank"; // Open the link in a new tab
      
      liTag.appendChild(linkTag);
      ulTag.appendChild(liTag);
    });
  },
}

// Function to fetch the list of files from the GitHub repository
async function fetchFileListFromGitHub() {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_PATH_RESOURCES}`);
    
    if (response.ok) {
      const files = await response.json();
      // Filter to include only .js files
      const jsFiles = files.filter(file => file.name.endsWith('.js'));
      return jsFiles.map(file => ({ name: file.name, downloadUrl: file.download_url }));
    } else {
      console.error("Error fetching file list from GitHub:", response.statusText);
      return [];
    }
  } catch (error) {
    console.error("Error fetching file list from GitHub:", error);
    return [];
  }
}
