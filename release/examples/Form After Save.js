// after save is after validation has passed and form was successfully saved
common.debug('after Save');

// propagate form event
if (common.propagateFormEvent('afterSave', data, state, rState)) {
    // insert event code here


    // if SAVE AND EXIT button was clicked, close the form
    if (state.customAction == "SAVEANDEXIT") {
        $B.state.mergeState($B.storage.applicationId, $B.storage.formId, {'wihAction': 'EXIT'});
        top.window.close();
    }
    resume();
} else {
    resume(false);
}
