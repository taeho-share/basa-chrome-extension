common.debug('State Change Listener data, state, rState', data, state, rState);
data['currentTime'] = new Date();

$scope.preSaveRoutine?.(data, state);
$scope.setRequiredFields?.(data, state, rState, applicationId, formId);
$scope.setValidationMessages?.(data, state, rState, applicationId, formId);
$scope.setDisplayNone?.(data, state);

resume();
