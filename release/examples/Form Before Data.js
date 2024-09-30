// before data is loaded before form is created
common.debug('before Data');

//Store information from BeforeData interface so that they can be accesible where the information is not available.
$B.storage.applicationId = applicationId;
$B.storage.formId = formId;
$B.storage.currentUser = rState.user;
$B.storage.currentUserGroup = rState.userGroup;
$B.storage.currentActivity = rState.wihContext?.process?.name;

// propagate form event to block, for details check the common js file
if (common.propagateFormEvent('beforeData', data, state, rState)) {
    resume();
} else {
    resume(false);
}
