// after data is before UI is generated
common.debug('after Data');

/*
  initialize form will 
  1. load users data for full name
  2. load data from API if needed
  */
$scope.initializeForm(state, rState, applicationId, formId, resume);

// register for DataChange callbacks
common.registerDataChangeListener('typeOfCase', 'form', $scope.typeOfCaseDataChangeListener);

// register for ReadyBlock callbacks
common.registerFormEventHandler("uibActionButtonsReadyBlock", "form", $scope.uibActionButtonsReadyBlockEventHandler);

// set displayNones,
$scope.setDisplayNone();


// propagate form event
if (common.propagateFormEvent('afterData', data, state, rState)) {
    // insert event code here

    resume();
} else {
    resume(false);
}
