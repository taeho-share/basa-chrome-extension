    // Get references to elements
    const modal = document.getElementById('contentModal');
    const modalContent = document.getElementById('modalContent');
    const modalClose = document.getElementById('modalClose');
    const btnCloseModal = document.getElementById('btnCloseModal');
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

    //modalClose.addEventListener('click', closeModal);
    //btnCloseModal.addEventListener('click', closeModal);




