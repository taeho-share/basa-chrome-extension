// before save is when wihAction or formAction is SAVE, VALIDATE, or COMPLETE and may be called before validation.
common.debug('before save');

common.refreshControls();


// Run validation if needed
let failedValidation = false;
if (state.wihAction != "COMPLETE" && state.wihActionEx_Validation) {
    failedValidation = $B.Validation.doValidation(formId, null, null, false, true);
}

// check if form passed validation
if (failedValidation) {
    resume(false);
} else {
    // You will enter this block regardless of validation for regular SAVE, ROUTE and COMPLETE
    // set response
    data.a = state.response;
  // set action status
  if (typeof data.b == "undefined") {
    data.b = "Active";
  }
  switch (state.response) {
    case "Archive Case":
      data.b = "Completed";
      break;
    case "Close Case":
      data.b = "Closed";
      break;
    case "Return To Active":
      data.b = "Active";
      break;
    case "Cancel Action":
      data.b = "Canceled";
      break;
  }

    // propagate form event
    if (common.propagateFormEvent('beforeSave', data, state, rState)) {
        // insert event code here
        resume();
    } else {
        resume(false);
    }

}