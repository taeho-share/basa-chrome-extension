/*
    Complex Repeat Container Hook Setting
    Name: cmpCaseNegotiatedGrievanceSteps
    Entity Alias: cmpCaseNegotiatedGrievanceSteps
    Fields: Step, Step Official Name, Step Filing Date, Step Resolution, Step Resolution Date, Step Descripition

*/

//After Add (Direct)
if (blkCaseNegotiatedGrievanceController.cmpCaseNegotiatedGrievanceStepsHook(applicationId, formId, fullComplexData, requestIndex, requestIndices, complexData, state, rState, 'AfterAdd', complexLinkId, complexInfo, resume, storage)) {
    resume();
  } else {
    resume(false);
  }


//After Delete (Direct)
if (blkCaseNegotiatedGrievanceController.cmpCaseNegotiatedGrievanceStepsHook(applicationId, formId, fullComplexData, requestIndex, requestIndices, complexData, state, rState, 'AfterAdd', complexLinkId, complexInfo, resume, storage)) {
    resume();
  } else {
    resume(false);
  }



//Before Custom
blkCaseNegotiatedGrievanceController.cmplxStepCustomAction.init(applicationId, formId, fullComplexData, requestIndices, complexData, state, rState, customAction, complexLinkId, complexInfo, storage);
blkCaseNegotiatedGrievanceController.cmplxStepCustomAction.printInfo();

if (customAction == 'clearStepOfficialInfo') {
	blkCaseNegotiatedGrievanceController.cmplxStepCustomAction.clearSelectedOfficialInfo (requestIndices[0]);
} else if (customAction == 'searchStepOfficialInfo') {
  blkCaseNegotiatedGrievanceController.cmplxStepCustomAction.searchSelectedOfficialInfo (requestIndices[0]);
}

resume();


/*
    Example of Data Change Listener
*/
//When to select a Step Official
let str = complexInfo.complexParent;
const match = str.match(/\[(\d+)\]/); //to capture the number between brackets
let idx = match ? parseInt(match[1], 10) : null; // If a match is found, return the number as an integer, else return null
let compDataItem = null;

if (idx != null) {
    compDataItem = $B.Complex.getDataByPath(complexInfo.complexParent);
         
    let nedid = compDataItem?.stepOfficialNameLU?._object?.data?.nedId;

    common.api.getEmployeeDetail(nedid, (res)=>{
                    compDataItem.stepOfficialNameInfo = res;
                    compDataItem.stepOfficialName = res?.fullNameFnLn;
                    $B.Complex.updateDataByPath('cmpCaseNegotiatedGrievanceSteps', compDataItem, idx);
                    //to refresh DisplayNone conditions
                    $B.state.generate('refresh', new Date());
                }, (res)=>{
                    common.debugLog(res);
    });

}

resume(true);

//when to select a Step Resolution
let str = complexInfo.complexParent;
const match = str.match(/\[(\d+)\]/); //to capture the number between brackets
let idx = match ? parseInt(match[1], 10) : null; // If a match is found, return the number as an integer, else return null
let compDataItem = null;

if (idx != null) {
    compDataItem = $B.Complex.getDataByPath(complexInfo.complexParent);
    compDataItem.stepResolution = compDataItem?.stepResolutionLU?.label;
      compDataItem.stepResolutionInfo = compDataItem?.stepResolutionLU?._object?.data;
    $B.Complex.updateDataByPath('cmpCaseNegotiatedGrievanceSteps', compDataItem, idx);
}

resume(true);


/*
    Example of part of Block Controller Code having the complex repeated container controller
*/

var blkCaseNegotiatedGrievanceController = {

    ...

    //Multiple Grid Handler
    cmpCaseNegotiatedGrievanceStepsHook: function (applicationId, formId, fullComplexData, requestIndex, requestIndices, complexData, state, rState, actionType, complexLinkId, complexInfo, resume, storage) {
        switch (actionType) {
            case "AfterAdd":
                blkCaseNegotiatedGrievanceController.processRepeatedContainer(actionType, fullComplexData, complexData, state, rState, 0);
                return true;
                break;
            case "AfterDelete":
                blkCaseNegotiatedGrievanceController.processRepeatedContainer(actionType, fullComplexData, complexData, state, rState, 0);
                return true;
                break;
        }
    },

    processRepeatedContainer: function (actionType, fullComplexData, complexData, state, rState, currentRow) {

        if (blkCaseNegotiatedGrievanceController.conf.debugMode) debugger;

        //example $B.Complex.getDataByPath('cmpCaseInfoReqResponses[0].responseType')
        let cmplxRec = $B.Complex.getData({complexPath: 'cmpCaseNegotiatedGrievanceSteps'});

        if (cmplxRec?.length >= this.conf.maxStepCount) {
            this.displayNone.cmpCaseNegotiatedGrievanceSteps = true;
        } else {
            this.displayNone.cmpCaseNegotiatedGrievanceSteps = false;
        }
        
        $B.state.generate('refresh', new Date());
    },

    //Complex Repeated Container Utility APIs - begin
    getIndexWithGivenComplexInfo: function (complextInfo) {
        let str = complexInfo.complexParent;
        const match = str.match(/\[(\d+)\]/); //to capture the number between brackets
        let idx = match ? parseInt(match[1], 10) : null; // If a match is found, return the number as an integer, else return null        
        return idx;
    },

}


var cmplxStepHandler = {
    conf: {},
    applicationId: {},
    formId: {},
    fullComplexData: {},
    complexData: {},
    state: {},
    rState: {},
    complexInfo: {},
    customAction: {},
    complexLinkId: {},
    complexInfo: {},
    storage: {},

    init: function(applicationId, formId, fullComplexData, requestIndices, complexData, state, rState, customAction, complexLinkId, complexInfo, storage) {
        cmplxStepHandler.applicationId = applicationId;
        cmplxStepHandler.formId = formId;
        cmplxStepHandler.fullComplexData = fullComplexData;
        cmplxStepHandler.requestIndices = requestIndices;
        cmplxStepHandler.complexData = complexData;
        cmplxStepHandler.state = state;
        cmplxStepHandler.rState = rState;
        cmplxStepHandler.customAction = customAction;
        cmplxStepHandler.complexLinkId = complexLinkId;
        cmplxStepHandler.complexInfo = complexInfo;
        cmplxStepHandler.storage = storage;
    },

    printInfo: function() {
        console.log("=== Complex Repeated Container Custom Action Context Info =====");
        console.log(
                    "customAction=", cmplxStepHandler.customAction,         
                    "requestIndices=", cmplxStepHandler.requestIndices, 
                    "complexLinkId=", cmplxStepHandler.complexLinkId, 
                    "complexInfo=", cmplxStepHandler.complexInfo, 
                    "complexData=", cmplxStepHandler.complexData, 
                    "fullComplexData=", cmplxStepHandler.fullComplexData, 
                    "applicationId=", cmplxStepHandler.applicationId, 
                    "formId=", cmplxStepHandler.formId,                     
                    "state=", cmplxStepHandler.state, 
                    "rState=", cmplxStepHandler.rState, 
                    "storage=", cmplxStepHandler.storage);
    },

    clearSelectedOfficialInfo: function(index) {
        if (index != undefined) {
            let path = 'cmpCaseNegotiatedGrievanceSteps[' + index +']';
            let cmplxRec = $B.Complex.getData({ complexPath: path});
            if (cmplxRec != undefined) {
                cmplxRec.stepOfficialName = undefined;
                cmplxRec.stepOfficialNameInfo = undefined;
                cmplxRec.stepOfficialNameLU = undefined;            
            }
            $B.Complex.updateDataByPath('cmpCaseNegotiatedGrievanceSteps', cmplxRec, index);
        }
    },

    searchSelectedOfficialInfo: function(index) { 
        common.openAES(this, this.stepOfficialCallback);
    },

    stepOfficialCallback: function(result) {

       console.log("result=", result);
       var callback = function(res) {
            console.log("res=", res);

            let index = blkCaseNegotiatedGrievanceController?.cmplxStepCustomAction?.requestIndices[0];

            if (index != undefined) {
                let path = 'cmpCaseNegotiatedGrievanceSteps[' + index +']';
                let cmplxRec = $B.Complex.getData({ complexPath: path});
                if (cmplxRec != undefined) {
                    cmplxRec.stepOfficialNameInfo = res;
                    cmplxRec.stepOfficialName = res.fullNameFnLn;                    
                }
                $B.Complex.updateDataByPath('cmpCaseNegotiatedGrievanceSteps', cmplxRec, index);
            }

        };

        if (result.nedId != undefined) {
            common.api.getEmployeeDetail(result.nedId, callback, callback);
        } else {
            console.log("[ERROR] NED ID not found");
            alert("The selected user's NEDID not found.");
        }
    },    

    
    
};

blkCaseNegotiatedGrievanceController.cmplxStepCustomAction = cmplxStepHandler;