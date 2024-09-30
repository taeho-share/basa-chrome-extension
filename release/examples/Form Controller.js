var formController = {
    /**
     * Form controller
     * Do not remove any items above "example" on each section of the controller
     *
     */

    /**
     * Constants used by the form.
     */
    constants: {
        formName: 'MY_FORM_NAME' // is also used for attachments and stored procedure to update json to RDBMS tables
    }, conf: {
        formDataLoadEnabled: false // this is to enable form Data Load
    },

    /**
     * AppDev Entity Access Keys
     * retrieve the Access Keys by adding a Data Link Handler component to the form and setting the data entity
     */
    accessKeys: {
        
        actionStatus: '_QFXxhqkfmZ1wykXqzdQCTwozCsqerw_',
        // example
        // nedId: "_gXzeGOX0yWTUAil2AkabnnefW9xmigC"
    },

    /**
     * AppDev Lookup IDs
     * Lookup Ids are retreived fom Data Modeler's Lookup Manager Tab
     */
    lookUpIds: {
        // example
        // gradeListLUId: 'h135e2a306bd94cfea6454daa39d0654e'
    },

    /**
     * AppDev List IDs
     * AppDev's Grid and List IDs
     * List IDs are retrieved by adding Grid or Repeated Data container component to the form
     */
    listIds: {
        // example
        // responseListId: '_2Dllm7XfKBHxr24ZGNdfC5s7cE3ZnU_'

    },

    /**
     * URLs for external resources
     */
    urls: {
        getMember: location.origin + "/bizflowappdev/services/ais/run/fbs.rawData-GetRawDataSource/q9c913fbede2a4fce85abab3744ab46dd.json", 
        
    },

    /**
     * Getters and Setters for the form
     * retrieve entity values using AccessKey
     * Keep the name of the field exactly the same as the access keys
     */

    // example for form entity with known Access Key
      get actionStatus() {
        return common.getValue(this.accessKeys.actionStatus);
      },
      set actionStatus(value) {
         return common.setValue(this.accessKeys.actionStatus, value);
      },

    /**
     * active tab switcher.
     * This switches the active tab of the form
     * Uses index that starts with 0
     */
    get activeTab() {
        return $B.Inner.mainTab.getProperty().attribute.activeIndex.value;
    }, set activeTab(index) {
        var prop = $B.Inner.mainTab.getProperty();
        prop.attribute.activeIndex.value = index;
        return $B.Inner.mainTab.setProperty(prop);
    }, 
    
    /**
     * accepts a String: tabKey, boolean:enabled
     * enables or disables tab based on the tab key
     *
     */
    _initialTabModel: undefined, _tabState: {
        outcome: true, appeal: false, dataCorrections: false,
    }, setTabs(tabKey, enabled) {
        if (typeof tabKey != 'undefined') {
            this._tabState[tabKey] = enabled;
        }
        var tabModel = JSON.parse(JSON.stringify(this._initialTabModel));


        Object.keys(formController._tabState).forEach((key) => {
            if (!formController._tabState[key]) {
                console.log(key, ' is disabled');
                tabModel = tabModel.filter((item) => {
                    return (item.key.value != key);
                });
            }
        });
        var props = $B.Inner.mainTab.getProperty();
        props.attribute.model.value.value = tabModel;
        $B.Inner.mainTab.setProperty(props);


    },

    /**
     * Flags used to control show/hide UI component
     */
    displayNone: {
        blkInformationRequest: true,
        blkNegotiability: true,
        blkNegotiatedGrievance: true,
        blkNegotiation: true,
        blkRepresentation: true,
        blkUnfariLaborPractice: true,
        lrSpecialistToReturnToActiveLU: true,
    },


    /**
     * InitializeForm is called from AfterData Event.
     * Optionally loads data from database tables or API
     * Retrieve additional data from referencial data/lookup
     */
    initializeForm: async function (state, rState, applicationId, formId, resume) {
        common.debug('initializing form', state, rState);

        // Load data from API database tables when the action is loaded for the first time.
        //await this.loadFormData(state, rState);

        // Load extended information of the user
        // this is used for first name and last name
        await this.getExtendedContextInfo(state, rState);
    },

    /**
     * retreieve extended context info including name fields
     */
    getExtendedContextInfo: async function (state, rState) {
        //PlaceHolder to call RESTFull API(s) to get additional data that are not provided by AppDev form
        var setUserData = function (result) {
            if (result && result[0]) {
                $B.storage.currentUser.name = result[0].shortname + " " + result[0].name;
            }
        };
        await $B.Ajax.post($scope.urls.getMember, {
            "queryParams": {
                "queryName": "LOGIN_ID", "loginId": $B.Grid.getLoginUser().loginId
            }
        }).then((result) => setUserData(result));
    },


    /**
     * load form data
     * Default loading criteria
     1. If form has not been saved before AND
     2. If not initiated by wits
     */
    loadFormData: async function (state, rState) {
        // default loading criteria
        if (this.conf.formDataLoadEnabled && // check if data load is enabled in config
            typeof this.lastSavedDate == 'undefined' && // check if last save date exists
            !$scope.initiatedByWits // check if initated by WiTS is false
        ) {

            // Block UI first
            $B.BlockHandler.block();

            await $B.Ajax.post($scope.urls.loadFormData, {
                transactionID: $scope.witsNumber
            }).then((res) => {
                if (res && res[0]) {
                    var fdObj = JSON.parse(res[0]);
                    $scope.fdObj = fdObj;

                    $scope.sampleField = fdObj.sampleField;
                }
                // unblock UI
                $B.BlockHandler.unblock();
            });
        }
    },


    preSaveRoutine: function (data, state) {
        common.debug('$Scope.preSaveRoutine');
        switch (state.response) {
            case "Close Case":
                break;
        }
        
    },

    /**
     * Function to set the required flags of each block controllers
     * This function is called whenever user selects one of routing buttons (states wihAction & response is updated before entering here)
     * This function WILL OVERRIDE block controller's required flags
     * If a flag is modified on one of the responses, it must also be modified on all other responses.  If not, incorrect flag will be used for validation
     */

    setRequiredFields: (data, state, rState, applicationId, formId) => {
        // clear required for all optionally required fields

        // This is when user selects on "Complete" button
        // Required for close/archieve without case type
        blkRequestFilerController.required.caseCategory = false;
        blkRequestFilerController.required.employeeAdminCode = false;
        blkRequestFilerController.required.laborOrg = false;

        // Required for close/archieve with case type
        blkLRCaseController.required.typeOfCaseLU = false;

        // Case - Information Request
        blkCaseInformationRequestController.required.dateInitialRequestReceived = false;
        blkCaseInformationRequestController.required.response = false; // response Type, Date, Disposition CMP validation

        // Case - Negotiability
        blkCaseNegotiabilityController.required.petitionerLU = false;
        blkCaseNegotiabilityController.required.otherPetitionerLU = false;
        blkCaseNegotiabilityController.required.dateNoticeProvidedToUnionOfNonNegotiability = false;
        blkCaseNegotiabilityController.required.issueDescription = false;
        blkCaseNegotiabilityController.required.reasonForNonNegotiabilityLU = false;
        blkCaseNegotiabilityController.required.otherReasonForNonNegotiability = false;
        blkCaseNegotiabilityController.required.datePetitionFiled = false;
        blkCaseNegotiabilityController.required.hearingStartDate = false;
        blkCaseNegotiabilityController.required.hearingEndDate = false;
        blkCaseNegotiabilityController.required.datePositionStatementSubmitted = false;

        // Case - Negotiated Grievance
        blkCaseNegotiatedGrievanceController.required.negotiatedGrievanceType = false;
        blkCaseNegotiatedGrievanceController.required.citedAgreementArticlesLU = false;
        blkCaseNegotiatedGrievanceController.required.relatedToMouLU = false;
        blkCaseNegotiatedGrievanceController.required.relatedMou = false;
        blkCaseNegotiatedGrievanceController.required.step = false; // step, step official name, step filing date, step resolution, step resolution Date, step Description CMP validation

        // Case - Negotiation
        blkCaseNegotiationController.required.negotiationType = false;
        blkCaseNegotiationController.required.noticeToUnion = false;
        blkCaseNegotiationController.required.dateOfNotice = false;
        blkCaseNegotiationController.required.didUnionInvokeBargaining = false;
        blkCaseNegotiationController.required.negotiatedAgreementArticles = false;
        blkCaseNegotiationController.required.negotiatedItems = false;
        blkCaseNegotiationController.required.negotiationEndDate = false;
        blkCaseNegotiationController.required.negotiationResolution = false;
        blkCaseNegotiationController.required.contractMouAmendmentEffectiveDate = false;
        blkCaseNegotiationController.required.agencySignatoryPartyLU1 = false;
        blkCaseNegotiationController.required.unionSignatoryPartyLU1 = false;

        // Case - Representation
        blkCaseRepresentationController.required.flraRepresentationCaseNumber = false;
        blkCaseRepresentationController.required.caseSubTypeLU = false;
        blkCaseRepresentationController.required.petitionerLU = false;
        blkCaseRepresentationController.required.otherPetitioner = false;
        blkCaseRepresentationController.required.descUnitInc = false;
        blkCaseRepresentationController.required.descUnitExc = false;
        blkCaseRepresentationController.required.numEmpCurUnit = false;
        blkCaseRepresentationController.required.numEmpQuest = false;
        blkCaseRepresentationController.required.recognitionDateOfUnit = false;
        blkCaseRepresentationController.required.employeePetitionedBeforeLU = false;
        blkCaseRepresentationController.required.flraRepresentative = false;
        blkCaseRepresentationController.required.datePetitionFiled = false;
        blkCaseRepresentationController.required.hearingStartDate = false;
        blkCaseRepresentationController.required.hearingEndDate = false;
        blkCaseRepresentationController.required.briefSubmissionDate = false;

        // Case - Unfair Labor Practice
        blkCaseUnfairLaborPracticeController.required.dateUlpFiled = false;
        blkCaseUnfairLaborPracticeController.required.ulpCaseNumber = false;
        blkCaseUnfairLaborPracticeController.required.ulpDescription = false;
        blkCaseUnfairLaborPracticeController.required.answerFiledLU = false;
        blkCaseUnfairLaborPracticeController.required.chargedPartyLU = false;
        blkCaseUnfairLaborPracticeController.required.relatedAgreementArticlesLU = false;
        blkCaseUnfairLaborPracticeController.required.flraRepresentative = false;
        blkCaseUnfairLaborPracticeController.required.relatedToMouLU = false;
        blkCaseUnfairLaborPracticeController.required.relatedMou = false;

        // Outcome - Information Request
        blkOutcomeInformationRequestController.required.finalResponseDispositionLU = false;

        // Outcome - Negotiability
        blkOutcomeNegotiabilityController.required.decisionLU = false;
        blkOutcomeNegotiabilityController.required.decisionDate = false;

        // Outcome - Negotiated Grievance
        blkOutcomeNegotiatedGrievanceController.required.arbitrationInvokedLU = false;
        blkOutcomeNegotiatedGrievanceController.required.dateArbitrationInvoked = false;
        blkOutcomeNegotiatedGrievanceController.required.arbitratorName = false;
        blkOutcomeNegotiatedGrievanceController.required.arbitrationResolutionLU = false;
        blkOutcomeNegotiatedGrievanceController.required.arbitrationDecisionDate = false;

        // Outcome - Negotiation
        blkOutcomeNegotiationController.required.fmcsRequestLU = false;
        blkOutcomeNegotiationController.required.dateOfFmcsRequest = false;
        blkOutcomeNegotiationController.required.impasseCertificationLU = false;
        blkOutcomeNegotiationController.required.dateOfImpasseCertification = false;

        // Outcome - Representation
        blkOutcomeRepresentationController.required.decisionLU = false;
        blkOutcomeRepresentationController.required.decisionDate = false;

        // Outcome - Unfair Labor Practice
        blkOutcomeUnfairLaborPracticeController.required.initialCaseDispositionLU = false;
        blkOutcomeUnfairLaborPracticeController.required.answerFiledLU = false;
        blkOutcomeUnfairLaborPracticeController.required.hearingHeldLU = false;
        blkOutcomeUnfairLaborPracticeController.required.aljHearingStartDate = false;
        blkOutcomeUnfairLaborPracticeController.required.aljHearingEndDate = false;
        blkOutcomeUnfairLaborPracticeController.required.aljDecisionLU = false;
        blkOutcomeUnfairLaborPracticeController.required.aljDecisionDate = false;

        // Appeal - Negotiability
        blkAppealNegotiabilityController.required.appealToAuthorityLU = false;
        blkAppealNegotiabilityController.required.appealDecisionLU = false;
        blkAppealNegotiabilityController.required.appealDecisionDate = false;

        // Appeal - Negotiated Grievance
        blkAppealNegotiatedGrievanceController.required.exceptionToArbitrationLU = false;
        blkAppealNegotiatedGrievanceController.required.dateExcFiledToFlra = false;
        blkAppealNegotiatedGrievanceController.required.flraDecisionLU = false;
        blkAppealNegotiatedGrievanceController.required.flraDecisionDate = false;

        // Appeal - Negotiation
        blkAppealNegotiationController.required.fsipLU = false;
        blkAppealNegotiationController.required.dateSentToFsip = false;
        blkAppealNegotiationController.required.fsipOutcomeLU = false;

        // Appeal - Representation
        blkAppealRepresentationController.required.appealToAuthorityLU = false;
        blkAppealRepresentationController.required.appealDecisionLU = false;
        blkAppealRepresentationController.required.ppealDecisionDate = false;

        // Appeal - Unfair Labor Practice
        blkAppealUnfairLaborPracticeController.required.exceptionFiledWithTheAuthorityLU = false;
        blkAppealUnfairLaborPracticeController.required.appealDecisionLU = false;
        blkAppealUnfairLaborPracticeController.required.appealDecisionDate = false;

        // Case Closure
        blkCaseClosureController.required.dateCaseClosed = false;


        // conditions that require user's response
        switch (state.response) {
            case "Close Case":
                // This is when user selects on "Complete" button
                // Required for close/archieve without case type
                blkRequestFilerController.required.caseCategory = true;
                blkRequestFilerController.required.employeeAdminCode = true;
                blkRequestFilerController.required.laborOrg = true;

                // Required for close/archieve with case type
                blkLRCaseController.required.typeOfCaseLU = true;

                // Case - Information Request
                blkCaseInformationRequestController.required.dateInitialRequestReceived = true;
                blkCaseInformationRequestController.required.response = true; // response Type, Date, Disposition CMP validation

                // Case - Negotiability
                blkCaseNegotiabilityController.required.petitionerLU = true;
                blkCaseNegotiabilityController.required.otherPetitionerLU = true;
                blkCaseNegotiabilityController.required.dateNoticeProvidedToUnionOfNonNegotiability = true;
                blkCaseNegotiabilityController.required.issueDescription = true;
                blkCaseNegotiabilityController.required.reasonForNonNegotiabilityLU = true;
                blkCaseNegotiabilityController.required.otherReasonForNonNegotiability = true;
                blkCaseNegotiabilityController.required.datePetitionFiled = true;
                blkCaseNegotiabilityController.required.hearingStartDate = true;
                blkCaseNegotiabilityController.required.hearingEndDate = true;
                blkCaseNegotiabilityController.required.datePositionStatementSubmitted = true;

                // Case - Negotiated Grievance
                blkCaseNegotiatedGrievanceController.required.negotiatedGrievanceType = true;
                blkCaseNegotiatedGrievanceController.required.citedAgreementArticlesLU = true;
                blkCaseNegotiatedGrievanceController.required.relatedToMouLU = true;
                blkCaseNegotiatedGrievanceController.required.relatedMou = true;
                blkCaseNegotiatedGrievanceController.required.step = true; // step, step official name, step filing date, step resolution, step resolution Date, step Description CMP validation

                // Case - Negotiation
                blkCaseNegotiationController.required.negotiationType = true;
                blkCaseNegotiationController.required.noticeToUnion = true;
                blkCaseNegotiationController.required.dateOfNotice = true;
                blkCaseNegotiationController.required.didUnionInvokeBargaining = true;
                blkCaseNegotiationController.required.negotiatedAgreementArticles = true;
                blkCaseNegotiationController.required.negotiatedItems = true;
                blkCaseNegotiationController.required.negotiationEndDate = true;
                blkCaseNegotiationController.required.negotiationResolution = true;
                blkCaseNegotiationController.required.contractMouAmendmentEffectiveDate = true;
                blkCaseNegotiationController.required.agencySignatoryPartyLU1 = true;
                blkCaseNegotiationController.required.unionSignatoryPartyLU1 = true;

                // Case - Representation
                blkCaseRepresentationController.required.flraRepresentationCaseNumber = true;
                blkCaseRepresentationController.required.caseSubTypeLU = true;
                blkCaseRepresentationController.required.petitionerLU = true;
                blkCaseRepresentationController.required.otherPetitioner = true;
                blkCaseRepresentationController.required.descUnitInc = true;
                blkCaseRepresentationController.required.descUnitExc = true;
                blkCaseRepresentationController.required.numEmpCurUnit = true;
                blkCaseRepresentationController.required.numEmpQuest = true;
                blkCaseRepresentationController.required.recognitionDateOfUnit = true;
                blkCaseRepresentationController.required.employeePetitionedBeforeLU = true;
                blkCaseRepresentationController.required.flraRepresentative = true;
                blkCaseRepresentationController.required.datePetitionFiled = true;
                blkCaseRepresentationController.required.hearingStartDate = true;
                blkCaseRepresentationController.required.hearingEndDate = true;
                blkCaseRepresentationController.required.briefSubmissionDate = true;

                // Case - Unfair Labor Practice
                blkCaseUnfairLaborPracticeController.required.dateUlpFiled = true;
                blkCaseUnfairLaborPracticeController.required.ulpCaseNumber = true;
                blkCaseUnfairLaborPracticeController.required.ulpDescription = true;
                blkCaseUnfairLaborPracticeController.required.answerFiledLU = true;
                blkCaseUnfairLaborPracticeController.required.chargedPartyLU = true;
                blkCaseUnfairLaborPracticeController.required.relatedAgreementArticlesLU = true;
                blkCaseUnfairLaborPracticeController.required.flraRepresentative = true;
                blkCaseUnfairLaborPracticeController.required.relatedToMouLU = true;
                blkCaseUnfairLaborPracticeController.required.relatedMou = true;

                // Outcome - Information Request
                blkOutcomeInformationRequestController.required.finalResponseDispositionLU = true;

                // Outcome - Negotiability
                blkOutcomeNegotiabilityController.required.decisionLU = true;
                blkOutcomeNegotiabilityController.required.decisionDate = true;

                // Outcome - Negotiated Grievance
                blkOutcomeNegotiatedGrievanceController.required.arbitrationInvokedLU = true;
                blkOutcomeNegotiatedGrievanceController.required.dateArbitrationInvoked = true;
                blkOutcomeNegotiatedGrievanceController.required.arbitratorName = true;
                blkOutcomeNegotiatedGrievanceController.required.arbitrationResolutionLU = true;
                blkOutcomeNegotiatedGrievanceController.required.arbitrationDecisionDate = true;

                // Outcome - Negotiation
                blkOutcomeNegotiationController.required.fmcsRequestLU = true;
                blkOutcomeNegotiationController.required.dateOfFmcsRequest = true;
                blkOutcomeNegotiationController.required.impasseCertificationLU = true;
                blkOutcomeNegotiationController.required.dateOfImpasseCertification = true;

                // Outcome - Representation
                blkOutcomeRepresentationController.required.decisionLU = true;
                blkOutcomeRepresentationController.required.decisionDate = true;

                // Outcome - Unfair Labor Practice
                blkOutcomeUnfairLaborPracticeController.required.initialCaseDispositionLU = true;
                blkOutcomeUnfairLaborPracticeController.required.answerFiledLU = true;
                blkOutcomeUnfairLaborPracticeController.required.hearingHeldLU = true;
                blkOutcomeUnfairLaborPracticeController.required.aljHearingStartDate = true;
                blkOutcomeUnfairLaborPracticeController.required.aljHearingEndDate = true;
                blkOutcomeUnfairLaborPracticeController.required.aljDecisionLU = true;
                blkOutcomeUnfairLaborPracticeController.required.aljDecisionDate = true;

                // Appeal - Negotiability
                blkAppealNegotiabilityController.required.appealToAuthorityLU = true;
                blkAppealNegotiabilityController.required.appealDecisionLU = true;
                blkAppealNegotiabilityController.required.appealDecisionDate = true;

                // Appeal - Negotiated Grievance
                blkAppealNegotiatedGrievanceController.required.exceptionToArbitrationLU = true;
                blkAppealNegotiatedGrievanceController.required.dateExcFiledToFlra = true;
                blkAppealNegotiatedGrievanceController.required.flraDecisionLU = true;
                blkAppealNegotiatedGrievanceController.required.flraDecisionDate = true;

                // Appeal - Negotiation
                blkAppealNegotiationController.required.fsipLU = true;
                blkAppealNegotiationController.required.dateSentToFsip = true;
                blkAppealNegotiationController.required.fsipOutcomeLU = true;

                // Appeal - Representation
                blkAppealRepresentationController.required.appealToAuthorityLU = true;
                blkAppealRepresentationController.required.appealDecisionLU = true;
                blkAppealRepresentationController.required.ppealDecisionDate = true;

                // Appeal - Unfair Labor Practice
                blkAppealUnfairLaborPracticeController.required.exceptionFiledWithTheAuthorityLU = true;
                blkAppealUnfairLaborPracticeController.required.appealDecisionLU = true;
                blkAppealUnfairLaborPracticeController.required.appealDecisionDate = true;

                // Case Closure
                blkCaseClosureController.required.dateCaseClosed = true;

                break;
            case "Return to Active":
                break;
            case "Send to Different HRS":
            default:
                break;
        }

        $B.Validation.resetRequired();
        // conditions that does not require user's reponse
        /*
        if (blkSpecialGroupController.overrideAdminCode == true) {
            uibAdminCodeController.required.adminCode = flase;
        } else {
            uibAdminCodeController.required.adminCode = true;
        }
        */

        //common.refreshControls();
    },

    /**
     * Function to run validation and set validation messages of each block controllers
     * This function is called whenever user selects one of routing buttons (states wihAction & response is updated before entering here)
     * This function WILL OVERRIDE block controller's validation messages
     * If a message is modified on one of the responses, it must also be modified on all other responses.  If not, incorrect message will remain visible to the users
     */

    setValidationMessages: (data, state, rState, applicationId, formId) => {
        // call blocks setValidationMessage
        blkOhrPointsOfContactController.setValidationMessage(data, state, rState) ;
        // validation that requires user's response
        switch (state.reponse) {
            case "Close Case":
                /* sample code
                if ((typeof uibAdminCodeController.adminCode == 'undefined') && blkSpecialGroupController.overrideAdminCode != true) {
                    uibAdminCodeController.validationMsg.adminCode = "Admin code must be selected unless skip admin code is set to 'Yes'";
                }

                */
                break;
        }


        //common.refreshControls();
    },

    setDisplayNone: function (data, state, rState, applicationId, formId) {


        // hide, show blocks Case Type
        this.displayNone.blkInformationRequest = true;
        this.displayNone.blkNegotiability = true;
        this.displayNone.blkNegotiatedGrievance = true;
        this.displayNone.blkNegotiation = true;
        this.displayNone.blkRepresentation = true;
        this.displayNone.blkUnfairLaborPractice = true;
        
        switch (blkLRCaseController.typeOfCaseLU?.value) {
            case "INFORMATION_REQUEST":
                this.displayNone.blkInformationRequest = false;
                break;
            case "NEGOTIABILITY":
                this.displayNone.blkNegotiability = false;
                break;
            case "NEGOTIATED_GRIEVANCE":
                this.displayNone.blkNegotiatedGrievance = false;
                break;
            case "NEGOTIATION":
                this.displayNone.blkNegotiation = false;
                break;
            case "REPRESENTATION":
                this.displayNone.blkRepresentation = false;
                break;
            case "UNFAIR_LABOR_PRACTICE":
                this.displayNone.blkUnfairLaborPractice = false;
                break;
        }


        // lrSpecialistToReturnToActiveLU depending on the activity
        // TODO
        this.displayNone.lrSpecialistToReturnToActiveLU = $B.storage.currentActivity != 'LR Rep Reviews Closed Case';

        //common.refreshControls();
    },

    // set tabs to be shown
    setTabDisplays: function (typeOfCase) {
        switch (typeOfCase) {
            default:
            case undefined:
                common.tabControl.display('outcome', false);
                common.tabControl.display('appeal', false);
                return true;
                break;
            case 'INFORMATION_REQUEST':
                common.tabControl.display('outcome', true);
                common.tabControl.display('appeal', false);
                break;
            case 'NEGOTIABILITY':
                common.tabControl.display('outcome', true);
                common.tabControl.display('appeal', true);
                break;
            case 'NEGOTIATED_GRIEVANCE':
                common.tabControl.display('outcome', true);
                common.tabControl.display('appeal', true);
                break;
            case 'NEGOTIATION':
                common.tabControl.display('outcome', true);
                common.tabControl.display('appeal', true);
                break;
            case 'REPRESENTATION':
                common.tabControl.display('outcome', true);
                common.tabControl.display('appeal', true);
                break;
            case 'UNFAIR_LABOR_PRACTICE':
                common.tabControl.display('outcome', true);
                common.tabControl.display('appeal', true);
                break;
        }
    },


    /**
     * Set routing buttons by using uibActionButtonController's API
     * This function will always be called after uibActionButtonController has been fully loaded and all API is available including GUI APIs

     */
    uibActionButtonsReadyBlockEventHandler: function (data) {
        // check if data correction mode or read only first

        switch ($B.state.getFormStateData($B.state.getApplicationId(), $B.state.getFormId()).readOnlyState.wihContext?.activity.name) {
            default:
            case 'LR HRS Creates/Reviews Case':
                uibActionButtons.addRouteButton('Send to Different HRS', {
                    response: 'Send to Different HRS',
                    wihAction: 'COMPLETE',
                    wihActionEx_Validation: false,
                    customAction: null
                });
                uibActionButtons.addRouteButton('Close Case', {
                    response: 'Close Case', wihAction: 'COMPLETE', wihActionEx_Validation: false, customAction: null
                });
                break;
            case 'LR Rep Reviews Closed Case':
                uibActionButtons.addRouteButton('Archive Case', {
                    response: 'Archive Case', wihAction: 'COMPLETE', wihActionEx_Validation: false, customAction: null
                });
                uibActionButtons.addRouteButton('Return to Active (to LR Specialist)', {
                    response: 'Return to Active',
                    wihAction: 'COMPLETE',
                    wihActionEx_Validation: false,
                    customAction: null
                });
                break;

            /* Add route buttons like below
        case 'HRS/HRA Work':
            uibActionButtons.addRouteButton('Send to Final Authorizer', {response:'Send to Final Authorizer', wihAction:'COMPLETE'});
            break;
        case 'Final Authorizer Review':
            uibActionButtons.addRouteButton('Send to HR Specialist', {response:'Send to HR Specialist', wihAction:'COMPLETE'});
            break;
            */
            /*
        default:
            common.debug('uibActionButtonsReadyBlockEventHandler: could not detect activity name.', data, $B.state.getFormStateData($B.state.getApplicationId(), $B.state.getFormId()).readOnlyState.wihContext?.activity.name);
            break;
            */
        }
        return true;
    },


    // this API was made for AppDev 3.x not saving the form when save was clicked multiples times in succession.  Need to udpate state to force save
    // this needs to be ver
    /* generating unique value for state.response during save to trigger unique state chagne listener behavior */
    generateUniqueStateForSave: function () {
        var uniqueResponse = "save_" + (new Date()).getTime();
        $B.state.mergeState($B.storage.applicationId, $B.storage.formId, {'response': uniqueResponse});
    },


};

// set controller as $scope.  This allows on the fly form controller change if necessary
var $scope = formController;

/**
 * Set focus to attachment from custom attachment validation
 * DO NOT EDIT
 */
$B.CustomValidation.custom.attachments = function () {
    $B.Inner.AttachmentControl.focus();
};


/**
 * When mainTab is loaded, show/hide data correction tab depending on the form state
 *
 */
$B.Outer.mainTab = {
    readyComponent: function (value) {
        if (!!___runtimeMode || true) {
            $scope.setTabDisplays(blkLRCaseController?.typeOfCase);
        }
    }
};