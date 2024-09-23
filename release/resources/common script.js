var common = {
    conf: {},
    const: {
        applicationId: $B.state.getApplicationId(),
        formId: $B.state.getFormId()
    },

    //Tab control APIs, see MainTab object code
    tabControl: MainTab,

    get info() {
        if (this.conf.debug) {
            return console.info;
        } else {
            return () => {
            };
        }
    },

    get log() {
        if (this.conf.debug) {
            return console.log;
        } else {
            return () => {
            };
        }
    },
    get debug() {
        if (this.conf.debug) {
            return console.debug;
        } else {
            return () => {
            };
        }
    },
    get debugLog() {
        common.info('common.debugLog is deprecated.  Please use common.debug or common.log');
        if (this.conf.debug) {
            return console.log;
        } else {
            return () => {
            };
        }
    },
    // APIs
    api: {
        getEmployeeDetail: function (nedID, sucCallback, failCallback) {
            $B.Ajax.post('/bizflowappdev/services/ais/run/fbs.rawData-GetRawDataSource/gab67274de4784091ba1c30de533690c4.json', {'nedId': nedID}, null).then(
                (res) => {
                    if (res && res[0]) {
                        sucCallback(res[0]);
                    } else {
                        sucCallback(res);
                    }
                },
                (res) => {
                    failCallback(res);
                });
        },
        checkBeginningOfPayPeriod: function (searchDate, callback) {
            $B.Ajax.post('/bizflowappdev/services/ais/run/fbs.rawData-GetRawDataSource/w4ac3acd75b794cd9b5cae4d79c20995a.json', {'searchDate': searchDate}, null).then(
                (res) => {
                    if (res == 'Y') {
                        callback(true);
                    } else if (res == 'N') {
                        callback(false);
                    }
                });
        }
    },


    // AppDev Form Data related
    getValue: function (key){
        return $B.Data.getValue(this.const.applicationId, this.const.formId, key);
    },
    setValue: async function (key, value){
        return $B.Data.setValue(this.const.applicationId, this.const.formId, key, value);
    },
    getFormValue: (fieldName) => {
        if ($scope && typeof $scope[fieldName] != 'undefined') {
            return $scope[fieldName];
        } else {
            return null;
        }
    },
    setFormValue: (fieldName, value) => {
        if ($scope && (typeof $scope[fieldName] != 'undefined')) {
            $scope[fieldName] = value;
        }
    },

    /* Data Change/State Change listener callbacks */
    dataChangeListener: new Map(),
    stateChangeListener: new Map(),

    /* Form's event handler */
    formEventHandler: new Map(),

    /* callbacks */
    callbacks: {
        advancedEmployeeSearch: undefined
    },


    worker : new Worker(
		"data:application/x-javascript;base64,c2VsZi5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXZlbnQpIHsKICBjb25zdCB7IGZ1bmN0aW9uVG9FeGVjdXRlLCBwYXlsb2FkIH0gPSBldmVudC5kYXRhOwogIGNvbnN0IHJlc3VsdCA9IG5ldyBGdW5jdGlvbigicmV0dXJuICIgKyBmdW5jdGlvblRvRXhlY3V0ZSkoKShwYXlsb2FkKTsKICBzZWxmLnBvc3RNZXNzYWdlKHJlc3VsdCk7Cn07="
    ),
    
    /* temp table related */
    _clientTable: {
        create: {},
        update: {},
        delete: {}
    },

    // Allow UI Bank Blocks to register to Form's Data Change Listeners
    registerDataChangeListener: function (fieldName, controllerName, callback) {
        // check if data change listener Set exists
        let dclSet = this.dataChangeListener.get(fieldName);
        if (!dclSet) {
            // value does not exist. Add
            this.dataChangeListener.set(fieldName, new Set());
            dclSet = this.dataChangeListener.get(fieldName);
        }
        dclSet.add({
            'controller': controllerName,
            'callback': callback
        });
        common.debug('Data change listener registered', fieldName, controllerName);
        return true;
    },

    // Allow UI Bank to propagate Data Change Listener to the Form
    propagateDataChange: function (fieldName, data, state, rState) {
        // check if data change listener Set exists
        const dclSet = this.dataChangeListener.get(fieldName);

        // only propagate if DCL exists
        if (typeof dclSet != 'undefined') {
            const dclIterator = dclSet.values();
            let currentDcl = dclIterator.next();
            while (!currentDcl.done) {
                if (!currentDcl.value.callback(data, state, rState)) {
                    return fasle;
                }
                currentDcl = dclIterator.next();
            }
        }
        return true;
    },

    // Allow UI Bank Blocks to register to Form's State Change Listeners
    registerStateChangeListener: function (stateName, controllerName, callback) {
        // check if data change listener Set exists
        let sclSet = this.stateChangeListener.get(stateName);
        if (!sclSet) {
            // value does not exist. Add
            this.stateChangeListener.set(stateName, new Set());
            sclSet = this.stateChangeListener.get(stateName);
        }
        sclSet.add({
            'controller': controllerName,
            'callback': callback
        });
        common.debug('State change listener registered', stateName, controllerName);
        return true;
    },

    // Allow UI Bank to propagate State Change Listener to the Form
    propagateStateChange: function (stateName, data, state, rState) {
        // check if data change listener Set exists
        const sclSet = this.stateChangeListener.get(stateName);

        // only propagate if DCL exists
        if (typeof sclSet != 'undefined') {
            const sclIterator = sclSet.values();
            let currentScl = sclIterator.next();
            while (!currentScl.done) {
                if (!currentScl.value.callback(data, state, rState)) {
                    return false;
                }
                currentScl = sclIterator.next();
            }
        }
        return true;
    },

    // Allow UI Bank blocks to register to Form's lifecycle events
    registerFormEventHandler: function (eventName, controllerName, callback) {
        // check if valid event
        switch (eventName) {
            // explicitedly allow the following list
            case "beforeData":
            case "afterData":
            case "beforeSave":
            case "afterSave":
            case "beforeExit":
            case "afterExit":
                break;
            default:
                // also allow any "readyBlock" events
                if (eventName.indexOf('ReadyBlock') < 0) {
                    common.debug('Cannot register event handler for this event.  Please check event name.  Event name provided:', eventName, 'from controller', controllerName);
                    return false;
                }
        }
        // check if form event handler Set exists
        let fehSet = this.formEventHandler.get(eventName);
        if (!fehSet) {
            // value does not exist. Add
            this.formEventHandler.set(eventName, new Set());
            fehSet = this.formEventHandler.get(eventName);
        }
        fehSet.add({
            'controller': controllerName,
            'callback': callback
        });
        common.debug('Form event handler registered', eventName, controllerName);
        return true;
    },

    // Propagate form event to blocks
    propagateFormEvent: function (eventName, data, state, rState) {
        // check if form event handler Set exists
        const fehSet = this.formEventHandler.get(eventName);

        // only propagate if DCL exists
        if (typeof fehSet != 'undefined') {
            const fehIterator = fehSet.values();
            let currentFeh = fehIterator.next();
            while (!currentFeh.done) {
                if (!currentFeh.value.callback(data, state, rState)) {
                    return false;
                }
                currentFeh = fehIterator.next();
            }
        }
        return true;
    },

    _clientSideOp: false,
    // clientTable
    clientTableOp: function (opType, listId, alias, data) {
        this._clientSideOp = false;
        switch (opType) {
            case 'create':
                // Create PK, Creator
                if (!data.PrimaryKey) {
                    var tempPK = $B.Grid.initPk();
                    data.PrimaryKey = tempPK;
                    data._pk = tempPK;
                    data.Creator = $B.Grid.getLoginUser();
                }
                if (typeof this._clientTable.create[alias] == 'undefined') {
                    this._clientTable.create[alias] = [];
                }
                this._clientTable.create[alias].push(data);
                break;
            case 'update':
                if (!data._pk) {
                    data._pk = data.PrimaryKey;
                }
                this._clientTable.create[alias] = this._clientTable.create[alias]?.map(this._updateMapFunction, {rowData: data});
                this._clientTable.update[alias] = this._clientTable.update[alias]?.map(this._updateMapFunction, {rowData: data});
                if (!this._clientSideOp) {
                    if (typeof this._clientTable.update[alias] == 'undefined') {
                        this._clientTable.update[alias] = [];
                    }
                    this._clientTable.update[alias].push(data);
                }

                break;
            case 'delete':
                if (!data._pk) {
                    data._pk = data.PrimaryKey;
                }
                this._clientTable.create[alias] = this._clientTable.create[alias]?.filter(this._deleteFilterFunction, {rowData: data});
                this._clientTable.update[alias] = this._clientTable.update[alias]?.filter(this._deleteFilterFunction, {rowData: data});
                if (!this._clientSideOp) {
                    if (typeof this._clientTable.delete[alias] == 'undefined') {
                        this._clientTable.delete[alias] = [];
                    }
                    this._clientTable.delete[alias].push(data);
                }

                break;
            case 'retrieve':
                var tempRows = [].concat(this._clientTable.create[alias] ?? []).concat(this._clientTable.update[alias] ?? []);
                var deletedRows = this._clientTable.delete[alias] ?? [];
                return {tempRows: tempRows, deletedRows: deletedRows};
                break;
            default:
                this.debug('[clientTableAdd] Unsupported opType provided', opType, alias, data);
                return false;
        }
        $B.Grid.reload(listId);
    },
    _clientTableCommitQueue: undefined,
    clientTableCommit: function () {
        // precondition: no duplicate values on add, update, delete
        var appId = this.const.applicationId;
        var formId = this.const.formId;

        this._clientTableCommitQueue = []
        // run queue up all commit actions
        var opTypes = Object.keys(this._clientTable);
        Promise.all(
            opTypes.map((opType) => {
                var aliases = Object.keys(this._clientTable[opType]);
                Promise.all(
                    aliases.map(async (alias) => {
                        if (!!this._clientTable[opType][alias]) {
                            this._clientTableCommitQueue.push({
                                opType: opType,
                                appId: appId,
                                formId: formId,
                                alias: alias,
                                data: this._clientTable[opType][alias],
                            });
                        }
                    })
                );
            })
        );

        // start working on commit queue
        this._commitTable();
    },
    _updateMapFunction: function (item) {
        if (item.PrimaryKey == this.rowData.PrimaryKey) {
            common._clientSideOp = true;
            return this.rowData;
        } else {
            return item;
        }
    },
    _deleteFilterFunction: function (item) {
        if (item.PrimaryKey == this.rowData.PrimaryKey) {
            // found match.
            common._clientSideOp = true;
            return false;
        } else {
            return true;
        }
    },

    _commitTable: (failedItem, retryCount = 0) => {
        if (retryCount && (retryCount > 10)) {
            return false;
        }
        var currentItem = failedItem ? failedItem : common._clientTableCommitQueue.pop();
        if (typeof currentItem != 'undefined') {
            var gridFunction;
            switch (currentItem.opType) {
                case 'create':
                    gridFunction = $B.Grid.createData;
                    break;
                case 'update':
                    gridFunction = $B.Grid.updateData;
                    break;
                case 'delete':
                    gridFunction = $B.Grid.deleteData;
                    break;
            }
            gridFunction(currentItem.appId, currentItem.formId, currentItem.alias, currentItem.data,
                (result) => {
                    delete common._clientTable[currentItem.opType][currentItem.alias];
                    common._commitTable();
                },
                (result) => {
                    common._commitTable(currentItem.data, retryCount++);
                }
            );
        }
    },


    /**
     * Checks if the application is in Data Correction Mode.
     * @author Taeho Lee
     * @param {any} data - The data parameter from Data Change Listener
     * @param {any} state - The state parameter from Data Change Listener
     * @param {any} rState - The rState parameter  from Data Change Listener
     * @returns {boolean} Returns true if the application is in Data Correction Mode, otherwise false.
     */
    isDataCorrectionMode: function (data, state, rState) {
        let bDataCorrectionMode = false;
        const dcmode = rState?.queryString?.dcmode?.toUpperCase();
        if (dcmode === 'Y') {
            bDataCorrectionMode = true;
        }
        return bDataCorrectionMode;
    },

    /**
     * Checks if the block is editable, considering both instance and data correction modes.
     * @author Taeho Lee
     * @param {any} data - The data parameter from Data Change Listener
     * @param {any} state - The state parameter from Data Change Listener
     * @param {any} rState - The rState parameter  from Data Change Listener
     * @returns {boolean} Returns true if the block is editable, otherwise false.
     */
    isBlockEditable: function (data, state, rState, debugMode) {
        let bEditable = false;

        if (debugMode) console.log("checking isBlockEditable...");

        // Check if the process is active or if it's in Data Correction Mode
        if (rState?.wihContext?.process?.completionDate === undefined || this.isDataCorrectionMode(data, state, rState)) {
            bEditable = true;
        } else if (rState?.wihContext?.readOnly !== undefined) {
            // Check if it's in readonly mode
            bEditable = !rState.wihContext.readOnly;
        }

        if (debugMode) console.log("isBlockEditable=" + bEditable);

        return bEditable;
    },

    refreshControls: function () {
        $B.state.generate('refresh', new Date());
    },

    createFilter: function (field, matchMode, type, value) {
        var filterObject = {
            field: field, matchMode: matchMode, type: type, value: value
        };
        return filterObject;
    },


    openAES: function (controller, callback, options) {
        if (typeof uibAdvancedEmployeeSearchController == 'undefined') {
            this.debug('Advanced Employee Search not implemented!');
        } else {
            //uibAdvancedEmployeeSearchController.conf.
            this.callbacks.advancedEmployeeSearch = callback;
            uibAdvancedEmployeeSearchController.options = options;


            $B.state.generate('openAdvancedEmployeeSearchModal', true);
        }
    },
    returnAESResult: function (result, state, rState) {
        $B.state.generate('openAdvancedEmployeeSearchModal', false);

        return this.callbacks.advancedEmployeeSearch(result, state, rState);
    },
    openEmployeeDetails: function (controller, employee, supUpdateCallback, aoUpdateCallback, options) {
        if (typeof uibEmployeeDetailsController == 'undefined') {
            this.debug('Employee Details not implemented!');
        } else {
            uibEmployeeDetailsController.conf.callingController = controller;
            uibEmployeeDetailsController.employee = employee;
            this.callbacks.supUpdateCallback = supUpdateCallback;
            this.callbacks.aoUpdateCallback = aoUpdateCallback;
            $B.state.generate('openEmployeeDetailsModal', true);
        }

    },
    closeEmployeeDetails: function () {
        if (!$B.Validation.doValidation(this.const.formId, null)) {
            $B.state.generate('openEmployeeDetailsModal', false);
        }
    },
    updateSUPFromED: function (data) {
        return this.callbacks.supUpdateCallback(data);
    },
    updateAOFromED: function (data) {
        return this.callbacks.aoUpdateCallback(data);
    },
    openCancelModal: function (controller, options) {
        if (typeof uibCancelModalController == 'undefined') {
            this.debug('Cancel modal is not implemented!');
        } else {
            uibCancelModalController.prepopulateFields($B.storage.currentUser.name);
            $B.state.generate('openCancelModal', true);
        }
    },
    closeCancelModal: function () {
        uibCancelModalController.clearFields();
        $B.state.generate('openCancelModal', false);
    },


    // Functions from UIB Template controller

    beforeSaveEventHandler: function (data, state, rState) {
        common.clientTableCommit();

        return true;
    },
    clearControllersData: async function (controllerNames) {
        var clearDataFunction = async function (controllerNameString) {
            var currentController = window[controllerNameString];
            if (!currentController?.clearData?.()) {
                // controller did not have clearData function.  Manually clear
                common.debug('clearControllerData:' + controllerNameString + ' did not have clearData defined.  Performing manual clear.');
                Object.keys(currentController.accessKeys)?.map(async (accessKey) => {
                    common.setValue(currentController.accessKeys[accessKey], undefined);
                });
            }
        };
        if (Array.isArray(controllerNames)) {
            controllerNames.map(clearDataFunction);
        } else if (typeof controllerNames == 'string') {
            clearDataFunction(controllerNames);
        }
    },
    clearControllersDataEx: async function (controllerNames) {
        var clearDataFunction = async function (controllerNameString) {
            var currentController = window[controllerNameString];
            if (!currentController?.clearData?.()) {
                // controller did not have clearData function.  Manually clear
                common.debug('clearControllerData:' + controllerNameString + ' did not have clearData defined.  Performing manual clear.');
                const accessKeys = Object.keys(currentController.accessKeys);
                const clearData = (accessKeys) => {
          			return accessKeys.map((accessKey) => {$B.Data.setValue(___applicationId, ___formId, accessKey, undefined);});
        		};
                common.worker.postMessage({
          			payload: accessKeys,
          			functionToExecute: clearData.toString(),
        		});
                
                /*Object.keys(currentController.accessKeys)?.map(async (accessKey) => {
                    common.setValue(currentController.accessKeys[accessKey], undefined);
                });*/
            }
        };
        if (Array.isArray(controllerNames)) {
            controllerNames.map(clearDataFunction);
        } else if (typeof controllerNames == 'string') {
            clearDataFunction(controllerNames);
        }
    },


    // presaveRoutine function to set Cond Req, Validation, Display None
    preSaveRoutine: function (stateObj) {
        // underlaying functions take [data, state, rState, applicationId, formId]
        var dataObj = {};
        stateObj.refresh = new Date();
        $scope.preSaveRoutine?.(dataObj, stateObj);
        $scope.setRequiredFields?.(dataObj, stateObj);
        $scope.setValidationMessages?.(dataObj, stateObj);
        $scope.setDisplayNone?.(dataObj, stateObj);
        //common.refreshControls();
        $B.state.mergeState(this.const.applicationId, this.const.formId, stateObj);
    },

};


// set debug conf
switch (window.location.host) {
    case "dev.yourserver.com":
    case "test.yourserver.com":
        common.conf.debug = true;
}

common.debug('common loaded');