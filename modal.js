    // Get references to elements
    const btnShowModal = document.getElementById('btnShowModal');
    const btnShowInNewTab = document.getElementById('btnShowInNewTab');
    const modal = document.getElementById('contentModal');
    const modalContent = document.getElementById('modalContent');
    const modalClose = document.getElementById('modalClose');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCopyClipboard = document.getElementById('btnCopyClipboard');
    const fileContentTextarea = document.getElementById('fileContent');

    /*
    // Show the modal with the textarea content
    btnShowModal.addEventListener('click', () => {
      const content = fileContentTextarea.value;
      modalContent.textContent = content; // Display the textarea content in the modal
      modal.classList.add('is-active'); // Show the modal
    });
*/
    // Close the modal
    function closeModal() {
      modal.classList.remove('is-active');
    }

    modalClose.addEventListener('click', closeModal);
    btnCloseModal.addEventListener('click', closeModal);

    // Copy content to clipboard
    btnCopyClipboard.addEventListener('click', () => {
      navigator.clipboard.writeText(modalContent.textContent)
        .then(() => {
          alert('Content copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    });


    // Show the content in a new browser tab
    btnShowInNewTab.addEventListener('click', () => {

      const content = fileContentTextarea.value;
      
      console.log("content", content);

      // Get the URL of template.html from the Chrome extension folder
      const templateUrl = chrome.runtime.getURL('contents-modal.html');
    
      // Open template.html in a new tab
      const newTab = window.open(templateUrl, '_blank');
    
      newTab.onload = () => {
        const contentsElement = newTab.document.getElementById('newTabContent');
        contentsElement.textContent = content;
      }

    });

