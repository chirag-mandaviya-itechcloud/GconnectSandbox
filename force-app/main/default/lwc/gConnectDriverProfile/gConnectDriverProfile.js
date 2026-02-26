import {
    LightningElement,
    api,
    track,
    wire
} from 'lwc';
import {
    CurrentPageReference
} from 'lightning/navigation';
import HEADER_ICONS from '@salesforce/resourceUrl/Header_Icons';
import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';
import ORG_URL from '@salesforce/label/c.MC_Site_URL';
import getMultiplePicklistValues from '@salesforce/apex/ConnectAppController.getMultiplePicklistValues';
import getAutoSettingFlags from '@salesforce/apex/ConnectAppController.getAutoSettingFlags';
import getContractorDetails from '@salesforce/apex/AccountMainContractorController.getContractorDetails';
import getRTWandDLfiles from '@salesforce/apex/AccountMainContractorController.getRTWandDLfiles';
import updateAccountClient from '@salesforce/apex/AccountMainContractorController.updateAccountClient';
import getIncidentLogList from '@salesforce/apex/IncidentController.getIncidentLogList';
import updateIncidents from '@salesforce/apex/IncidentController.updateIncidents';
import getMCDepotDetails from '@salesforce/apex/MainContractorController.getMCDepotDetails';
import getEndUserMCDepotDetails from '@salesforce/apex/MainContractorController.getEndUserMCDepotDetails';
import getUserContact from '@salesforce/apex/AccountMainContractorController.getUserContact';
import createNewDepotAssociation from '@salesforce/apex/AccountMainContractorController.createNewDepotAssociation';
import createRTWandDLDocument from '@salesforce/apex/AccountMainContractorController.createRTWandDLDocument';
import fetchDeductionRemainAmt from '@salesforce/apex/DeductionController.fetchDeductionRemainAmt';
import getDriverRate from '@salesforce/apex/DriverAvailabilityController.getDriverRate';// UnComment on 21-10-2025// Commented On 16-10-2025 for Deduction and Incident to PROD
import updateDriverRate from '@salesforce/apex/DriverAvailabilityController.updateDriverRate';// UnComment on 21-10-2025// Commented On 16-10-2025 for Deduction and Incident to PROD
import USER_ID from "@salesforce/user/Id";
import saveUplodededFiles from '@salesforce/apex/ImageUploaderController.saveUplodededFiles';
import sendVerificationLinkEmail from '@salesforce/apex/ConnectAppController.sendVerificationLinkEmail';


export default class GConnectDriverProfile extends LightningElement {

    @api recordId;
    @track recordData;

    @track ascDscIcon = `${HEADER_ICONS}/HeaderIcons/AscDsc.png`;
    @track fileDownloadIcon = `${HEADER_ICONS}/HeaderIcons/Download.png`;
    @track recordMenuIcon = `${HEADER_ICONS}/HeaderIcons/RecordMenu.png`;
    @track crossIcon = `${HEADER_ICONS}/HeaderIcons/CrossIcon.png`;
    @track viewIcon = `${HEADER_ICONS}/HeaderIcons/viewIcon.png`;
    @track editIcon = `${HEADER_ICONS}/HeaderIcons/editIcon.png`;
    @track deleteIcon = `${HEADER_ICONS}/HeaderIcons/deleteIcon.png`;
    @track orgUrl = ORG_URL;

    @track tabMenu = [];
    @track tabDocMenu = [];
    @track openNewIncident = false;
    @track dataLoad = false;
    @track isSpinner = false;

    @track hasFrontDLImage = false;
    @track dlFrontImage;

    @track hasBackDLImage = false;
    @track dlBackImage;

    @track hasFrontRTWImage = false;
    @track rtwFrontImage;

    @track hasBackRTWImage = false;
    @track rtwBackImage;

    @track isContractorSelect = true;
    @track isFinacialSelect = false;
    //@track isVehicleSelect = false;
    @track isIncidentsSelect = false;
    @track isInvoicesSelect = false;
    @track isAvailabilitySelect = false;// UnComment on 21-10-2025// Commented On 16-10-2025 for Deduction and Incident to PROD

    @track isDocumentSelect = true;
    @track isContractSelect = false;

    @track isDisenegaeLoader = false;
    @track hasActiveDeduction = false;
    @track remainDeductionList = [];
    @track totalRemainDeductionBalance = 0;

    @track defaultMenuId;
    @track defaultDocMenuId;

    @track updateJsonData = {};

    @track incidentLogList;
    @track incidentLogsAvailiable = true;

    @track showViewIncidentModal = false;
    @track showEditIncidentModal = false;
    @track selectedIncidentId;
    @track incidentViewIndex;
    @track incidentViewRecord = {};
    @track editIncidentRecord;
    @track type_option = [];
    @track status_option = [];
    @track SearchName;
    @track orginalIncidentData = [];
    @track openNewDepotModal = false;
    @track collectDetails = {};
    @track parsedResultForDepot = [];
    @track depotList = [];
    @track selectedDepot;
    @track SelectedEndUser;
    @track relatedDepotOptions = [];
    @track showNoteError = false;

    @track showError = false;
    errorMessage = '';

    @track searchResultNotFound = false;
    @track showSuccessMessage = false;
    @track showErrorMessage = false;
    @track showDepotData = false;
    @track depotMessage = '';
    @track contactId;

    @track currentPageInc = 1;
    @track recordsPerPageInc = 5;

    // Custom Setting Flags
    @track isIncidentDisabled = false;
    @track isDeductionDisabled = false;
    @track isDriverRateDisabled = false;
    @track isAvaliabilityDisabled = false;
    @track activeMainTabsCount = 0;
    @track liWidthStyle = '';

    @track openDisengageConfirm = false;
    @track showRateModule = false;// UnComment on 21-10-2025// Commented On 16-10-2025 for Deduction and Incident to PROD

    @track roleWiseRate = 0;// UnComment on 21-10-2025// Commented On 16-10-2025 for Deduction and Incident to PROD
    @track overrideRate;// UnComment on 21-10-2025// Commented On 16-10-2025 for Deduction and Incident to PROD
    @track rateStatus = null;// UnComment on 21-10-2025// Commented On 16-10-2025 for Deduction and Incident to PROD
    @track newDriverRate;// UnComment on 21-10-2025// Commented On 16-10-2025 for Deduction and Incident to PROD

    @track editIcon = `${HEADER_ICONS}/HeaderIcons/Edit.png`;
    @track drivingLicenseEditOpen = false;

    // Edit fields
    @track editDrivingLicenceNumber;
    @track editDrivingLicenceExpiry;
    @track editDrivingLicenceType;
    @track editPointsOnLicence;
    @track editVehiclesCanDrive;
    @track editIssueDate;

    @track licenseTypes_option = [];
    @track licenseCategory_option = [];
    @track recordBasedLicenseCategory = [];

    @track isFileUploadOpned = false;
    @track showFileUploadModal = false;
    @track allowedExtension;
    @track showImageCaptureModal = false;
    @track showProfileUploadModal = false;
    @track showFrontBackRadioBtn = false;
    @track isFileModuleError = false;
    @track fileModuleError = '';

    @track selectedContractorId;
    @track selectedOption;

    @track imageLoading = true;
    @track imagesNotAvailable = false;
    @track imagesAvailable = false;


    @track frontDocFiles = [];
    @track backDocFiles = [];
    @track uploadFiles = [];

    @track rtwEditOpen = false;
    @track showRTWExpiryDate = false;
    @track showRTWAccessCode = false;
    @track showFileUploadButton = false;
    @track showRTWFileUploadButton = false;
    @track isRTWFileUploadOpen = false;
    @track showDLFileUploadButton = false;
    @track isDLFileUploadOpen = false;
    @track hasCompletedImageforShareCode = false;


    // RTW edit fields
    @track citi_Immi_status;
    @track rtwDoc;
    @track expiryDate;
    @track dateOfEntry;
    @track settledStatus;
    @track biometricEvidence;
    @track accessCode;


    @track cIStatus_option = [];
    @track accessCode;
    @track citiStatusOptions = [];
    @track settledStatusOptions = [];
    @track biometricOptions = [];
    @track rtwDocOptions = [];
    @track typeOfVisa_option = [];
    @track documentNames = [];
    @track anyWorkRestrictions_option;

    @track editCitizenshipStatus;
    @track editSettledStatus;
    @track editBiometric;
    @track editRTWDocument;


    @track hasFrontRTWImage = false;
    @track hasBackRTWImage = false;
    @track hasRTWCheckImage = false;

    @track rtwFrontImage;
    @track rtwBackImage;
    @track rtwCheckImage;
    @api resetFiles() {
        this.uploadFrontFiles = [];
        this.uploadBackFiles = [];
        this.capturedFrontFiles = [];
        this.capturedBackFiles = [];
    }
    @track isRTWFileUploadOpen = false;
    @track isDLFileUploadOpen = false;
    @track tempFrontFiles = [];
    @track tempBackFiles = [];

    @track originalDLFront = '';
    @track originalDLBack = '';
    @track restrictedStatuses = ['British passport/UK National', 'EU/EEA/Swiss Citizen', 'Rest Of The World'];
    @track isContinuousSelected;
    @track isTimeLimitedSelected;
    @track isNoRestrictionsSelected;
    @track isHasRestrictionsSelected;
    @track copyButtonLabel = 'Copy';

    @track nationalInsuranceProof = 'Check this is a full certificate showing at least one parent\'s name. Short-form certificates are not accepted.';
    @track birthCertificateProof = 'P45, P60, HMRC letter, PAYE payslip, or DWP letter NI number.are not accepted.';


    @track allowedRTWOptions = {
        'British Citizen': [
            {
                label: 'British passport',
                value: 'British passport',
                documentType: ['British passport']
            },
            {
                label: 'Birth/Adoption Certificate + National Insurance document',
                value: 'Birth/Adoption Certificate + National Insurance document',
                documentType: ['Birth/Adoption Certificate', 'National Insurance document']
            },
            {
                label: 'Certificate of registration/naturalisation + National Insurance document',
                value: 'Certificate of registration/naturalisation + National Insurance document',
                documentType: ['Birth/Adoption Certificate', 'National Insurance document']
            }
        ],

        'Irish Citizen': [
            {
                label: 'Irish passport or passport card',
                value: 'Irish passport or passport card',
                documentType: ['Irish passport or passport card']
            },
            {
                label: 'Irish Birth/Adoption Certificate + National Insurance document',
                value: 'Irish Birth/Adoption Certificate + National Insurance document',
                documentType: ['Birth/Adoption Certificate', 'National Insurance document']
            }
        ]
    };
    @track isRTWVerfiedCheck = false;
    @track selectedRTWDocumentTypes = [];
    handleRTWVerifiedCheck(event) {
        this.isRTWVerfiedCheck = !this.isRTWVerfiedCheck;
    }
    handleRTWVerifiedName(event) {
        const value = event.target.value;
        this.verifiedRTWName = value && value.trim() !== '' ? value : null;
    }
    defaultActiveTabId;
    @wire(CurrentPageReference)
    getPageReference(pageRef) {
        if (pageRef) {
            this.recordId = pageRef.state.recordId;
            this.getDriverProfileData();
        }
    }

    @wire(getMultiplePicklistValues, {
        objectName: 'Account',
        fieldNames: ['Type_of_licence__c', 'Additional_licence_categories__c']
    })
    wiredAccountPicklists({ error, data }) {
        if (data) {
            this.licenseTypes_option = data.Type_of_licence__c
                ? data.Type_of_licence__c.map(v => ({ label: v, value: v }))
                : [];

            this.licenseCategory_option = data.Additional_licence_categories__c
                ? data.Additional_licence_categories__c.map(v => ({ label: v, value: v }))
                : [];

            console.log('License categories:', this.licenseCategory_option);
        } else if (error) {
            console.error('Account picklist error', error);
        }
    }

    @wire(getMultiplePicklistValues, {
        objectName: 'Account',
        fieldNames: [
            'Citizenship_Immigration_status__c',
            'Settled_Status__c',
            'Biometric_Evidence__c',
            'Right_to_work_document__c',
            'Type_of_e_visa__c',
            'Any_work_restrictions__c'
        ]
    })
    wiredRTWPicklists({ error, data }) {
        if (data) {
            this.citiStatusOptions = data.Citizenship_Immigration_status__c
                ?.map(v => ({ label: v, value: v })) || [];

            this.settledStatusOptions = data.Settled_Status__c
                ?.map(v => ({ label: v, value: v })) || [];

            this.biometricOptions = data.Biometric_Evidence__c
                ?.map(v => ({ label: v, value: v })) || [];

            this.rtwDocOptions = data.Right_to_work_document__c
                ?.map(v => ({ label: v, value: v })) || [];

            this.typeOfVisa_option = data.Type_of_e_visa__c
                ?.map(v => ({ label: v, value: v })) || [];

            this.anyWorkRestrictions_option = data.Any_work_restrictions__c
                ?.map(v => ({ label: v, value: v })) || [];

        } else if (error) {
            console.error('RTW picklist error', error);
        }
    }

    constructor() {
        super();
        this.tabMenu = [{
            id: '1',
            label: 'Contractor Information',
            selected: true,
            enabled: true,
        },
        {
            id: '2',
            label: 'Contractor Availability',
            selected: false,
            enabled: true,
        },// UnComment on 21-10-2025//// Commented On 16-10-2025 for Deduction and Incident to PROD
        {
            id: '3',
            label: 'Financial Information',
            selected: false,
            enabled: true,
        },
        {
            id: '4',
            label: 'Incident / Deduction Log',
            selected: false,
            enabled: true,
        }
        ];

        this.tabDocMenu = [{
            id: '1',
            label: 'Documents',
            selected: true,
        },
        {
            id: '2',
            label: 'Contracts',
            selected: false,
        }
        ];
    }


    @wire(getAutoSettingFlags)
    wiredFlags({
        error,
        data
    }) {
        if (data) {
            this.isDeductionDisabled = data.isDeductionDisabled;
            this.isIncidentDisabled = data.isIncidentDisabled;
            this.isAvaliabilityDisabled = data.isAvaliabilityDisabled;
            this.isDriverRateDisabled = data.isDriverRateDisabled;

            this.tabMenu = this.tabMenu.map(tab => {
                if (tab.id === '2') {
                    return {
                        ...tab,
                        enabled: !this.isAvaliabilityDisabled
                    };
                }
                if (tab.id === '4') {
                    return {
                        ...tab,
                        enabled: !this.isIncidentDisabled
                    };
                }
                return tab;
            });
            this.activeMainTabsCount = this.tabMenu.filter(tab => tab.enabled).length;
            const width = 100 / this.activeMainTabsCount;
            this.liWidthStyle = `width:${width}%`;
        } else if (error) {
            console.error(error);
        }
    }

    @wire(getMultiplePicklistValues, {
        objectName: 'Incident__c',
        fieldNames: ['Type__c', 'Status__c']
    })
    wiredPicklistOptions({
        error,
        data
    }) {
        if (data) {
            if (data.Type__c) {
                this.type_option = data.Type__c.map(value => {
                    return {
                        label: value,
                        value: value
                    };
                });
            }

            if (data.Status__c) {
                this.status_option = data.Status__c.map(value => {
                    return {
                        label: value,
                        value: value
                    };
                });
            }

        } else if (error) {
            console.error('Error in getting Picklist Values:', error);
        }
    }

    // Class getters for label styling
    get getContinuousRTWClass() {
        return `rtw-radio-option ${this.isContinuousSelected ? 'rtw-selected' : ''}`.trim();
    }

    get getTimeLimitedRTWClass() {
        return `rtw-radio-option ${this.isTimeLimitedSelected ? 'rtw-selected' : ''}`.trim();
    }

    get getNoRestrictionsClass() {
        return `rtw-restriction-option ${this.isNoRestrictionsSelected ? 'rtw-selected' : ''}`.trim();
    }

    get getHasRestrictionsClass() {
        return `rtw-restriction-option ${this.isHasRestrictionsSelected ? 'rtw-selected' : ''}`.trim();
    }

    handleSelectContinuousRTW() {

        // Update both selectedContractor and data array
        this.recordData.Type_of_e_visa__c = 'Continuous right to work';

        // Hide sections
        this.showTimeLimitedSection = false;

        this.showRestrictionsSection = false;

        // Clear time-limited fields in both selectedContractor and data array
        this.recordData.Permission_Expiry_Date__c = null;

        this.recordData.Any_work_restrictions__c = null;

        this.recordData.Limited_To_X_Hours_Per_Week__c = null;

        this.recordData.Limited_To_Specific_Job_Types__c = null;

        this.recordData.Other_Restrictions__c = null;
        // set selection state for UI
        this.isContinuousSelected = true;
        this.isTimeLimitedSelected = false;
        this.isNoRestrictionsSelected = false;
        this.isHasRestrictionsSelected = false;
    }

    handleSelectTimeLimitedRTW() {
        // Update both selectedContractor and data array
        this.recordData.Type_of_e_visa__c = 'Time-limited right to work';

        // Show time-limited section
        this.showTimeLimitedSection = true;
        // set selection state for UI
        this.isTimeLimitedSelected = true;
        this.isContinuousSelected = false;
    }

    handleSelectNoRestrictions() {

        // Update both selectedContractor and data array
        this.recordData.Any_work_restrictions__c = 'No';

        // Hide restrictions section
        this.showRestrictionsSection = false;

        // Clear restriction fields in both selectedContractor and data array
        this.recordData.Limited_To_X_Hours_Per_Week__c = null;

        this.recordData.Limited_To_Specific_Job_Types__c = null;

        this.recordData.Other_Restrictions__c = null;
        // set selection state for UI
        this.isNoRestrictionsSelected = true;
        this.isHasRestrictionsSelected = false;
    }

    handleSelectHasRestrictions() {

        // Update both selectedContractor and data array
        this.recordData.Any_work_restrictions__c = 'Yes';

        // Show restrictions section
        this.showRestrictionsSection = true;
        // set selection state for UI
        this.isHasRestrictionsSelected = true;
        this.isNoRestrictionsSelected = false;
    }

    handleCopyCode() {
        // Copy to clipboard
        navigator.clipboard.writeText(this.recordData.Share_Code__c)
            .then(() => {
                this.copyButtonLabel = 'Copied!';
                setTimeout(() => {
                    this.copyButtonLabel = 'Copy';
                }, 1500);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    }

    getDriverProfileData() {

        getContractorDetails({
            recordId: this.recordId
        })
            .then(result => {
                if (result != null) {

                    this.recordData = JSON.parse(JSON.stringify(result[0]));

                    this.isSpinner = false;
                    this.recordData.isStatusEngaged = this.recordData.hasOwnProperty('App_SC_Status__c') && this.recordData.App_SC_Status__c == 'Engaged' ? true : false;
                    this.recordData.isStatusDisengaged = this.recordData.hasOwnProperty('App_SC_Status__c') && this.recordData.App_SC_Status__c == 'Disengaged' ? false : true;

                    this.recordData.hasProfilePic = this.recordData.hasOwnProperty('ProfilePic_Base64') && this.recordData.ProfilePic_Base64 !== null ? true : false;
                    this.recordData.hasdepotIcon = this.recordData.hasOwnProperty('Depot_logo__c') && this.recordData.Depot_logo__c !== null ? true : false;

                    const citizenshipImmigrationStatus = this.recordData.hasOwnProperty('Citizenship_Immigration_status__c') && this.recordData.Citizenship_Immigration_status__c !== null ? this.recordData.Citizenship_Immigration_status__c : null;
                    this.recordData.hasRestrictedStatus = this.restrictedStatuses.includes(citizenshipImmigrationStatus);

                    this.recordData.Limited_To_X_Hours_Per_Week__c = this.recordData.hasOwnProperty('Limited_To_X_Hours_Per_Week__c') && this.recordData.Limited_To_X_Hours_Per_Week__c !== null ? this.recordData.Limited_To_X_Hours_Per_Week__c : '';
                    this.recordData.Limited_To_Specific_Job_Types__c = this.recordData.hasOwnProperty('Limited_To_Specific_Job_Types__c') && this.recordData.Limited_To_Specific_Job_Types__c !== null ? this.recordData.Limited_To_Specific_Job_Types__c : '';
                    this.recordData.Other_Restrictions__c = this.recordData.hasOwnProperty('Other_Restrictions__c') && this.recordData.Other_Restrictions__c !== null ? this.recordData.Other_Restrictions__c : '';

                    this.recordData.Any_work_restrictions__c = this.recordData.hasOwnProperty('Any_work_restrictions__c') && this.recordData.Any_work_restrictions__c !== null ? this.recordData.Any_work_restrictions__c : '';
                    this.isHasRestrictionsSelected = this.recordData.Any_work_restrictions__c === 'Yes' ? true : false;
                    this.isNoRestrictionsSelected = this.recordData.Any_work_restrictions__c === 'No' ? true : false;
                    this.recordData.Permission_Expiry_Date__c = this.recordData.hasOwnProperty('Permission_Expiry_Date__c') && this.recordData.Permission_Expiry_Date__c !== null ? this.recordData.Permission_Expiry_Date__c : '';
                    this.recordData.Type_of_e_visa__c = this.recordData.hasOwnProperty('Type_of_e_visa__c') && this.recordData.Type_of_e_visa__c !== null ? this.recordData.Type_of_e_visa__c : '';
                    this.isContinuousSelected = this.recordData.Type_of_e_visa__c === 'Continuous right to work' ? true : false;
                    this.isTimeLimitedSelected = this.recordData.Type_of_e_visa__c === 'Time-limited right to work' ? true : false;
                    this.recordData.hasShareCode = this.recordData.hasOwnProperty('Share_Code__c') && this.recordData.Share_Code__c !== null ? true : false;
                    this.recordData.hasAccessCode = this.recordData.hasOwnProperty('Access_Code__c') && this.recordData.Access_Code__c !== null ? true : false;
                    this.recordData.hasSettledStatus = this.recordData.hasOwnProperty('Settled_Status__c') && this.recordData.Settled_Status__c !== null ? true : false;
                    this.recordData.hasBiometric = this.recordData.hasOwnProperty('Biometric_Evidence__c') && this.recordData.Biometric_Evidence__c !== null ? true : false;
                    this.recordData.hasEntryDate = this.recordData.hasOwnProperty('Date_of_Entry__c') && this.recordData.Date_of_Entry__c !== null ? true : false;
                    this.recordData.hasRTWDoc = this.recordData.hasOwnProperty('Right_to_work_document__c') && this.recordData.Right_to_work_document__c !== null ? true : false;
                    this.recordData.hasExpiryDate = this.recordData.hasOwnProperty('RTW_Expiry_Date__c') && this.recordData.RTW_Expiry_Date__c !== null ? true : false;
                    this.recordData.clientName = this.recordData.hasOwnProperty('Client_Name__c') && this.recordData.Client_Name__c !== null ? this.recordData.Client_Name__c : '';
                    this.showRTWExpiryDate = this.recordData.hasOwnProperty('RTW_Expiry_Date__c') && this.recordData.RTW_Expiry_Date__c !== null ? true : false;

                    if (this.recordData.hasOwnProperty('Engaged_Date__c') && this.recordData.Engaged_Date__c !== null) {
                        this.recordData.Engaged_Date = this.formatDateToDDMMYYYY(this.recordData.Engaged_Date__c);
                    } else {
                        this.recordData.Engaged_Date = '-';
                    }
                    if (this.recordData.hasOwnProperty('Disengaged_Date__c') && this.recordData.Disengaged_Date__c !== null) {
                        this.recordData.Disengaged_Date = this.formatDateToDDMMYYYY(this.recordData.Disengaged_Date__c);
                    } else {
                        this.recordData.Disengaged_Date = '-';
                    }
                    if (this.recordData.hasOwnProperty('Date_of_Birth__c') && this.recordData.Date_of_Birth__c !== null) {
                        this.recordData.Date_of_Birth = this.formatDateToDDMMYYYY(this.recordData.Date_of_Birth__c);
                    } else {
                        this.recordData.Date_of_Birth = '-';
                    }

                    if (this.recordData.hasOwnProperty('Previous_Address_Line_1__c') && this.recordData.Previous_Address_Line_1__c !== null) {
                        this.recordData.showPreviousAddress = true;
                    } else {
                        this.recordData.showPreviousAddress = false;
                    }

                    if (this.recordData.Emergency_Contact_Name__c ||
                        this.recordData.Emergency_Contract_Telephone_Number__c ||
                        this.recordData.Emergency_Contact_Relationship__c) {
                        this.recordData.showEmergencyContact = true;
                    } else {
                        this.recordData.showEmergencyContact = false;
                    }

                    this.recordData.National_Insurance_Number__c = this.recordData.hasOwnProperty('National_Insurance_Number__c') && this.recordData.National_Insurance_Number__c !== null ? this.recordData.National_Insurance_Number__c : 'N/A';
                    this.recordData.URT_Number_Entry__c = this.recordData.hasOwnProperty('URT_Number_Entry__c') && this.recordData.URT_Number_Entry__c !== null ? this.recordData.URT_Number_Entry__c : 'N/A';
                    this.recordData.VAT_Number_Entry__c = this.recordData.hasOwnProperty('VAT_Registration_Number__c') && this.recordData.VAT_Registration_Number__c !== null ? this.recordData.VAT_Registration_Number__c : 'N/A';
                    this.recordData.VAT_Number_Entry__c = this.recordData.hasOwnProperty('aed0n7__VAT_Registration_Number__c') && this.recordData.aed0n7__VAT_Registration_Number__c !== null && this.recordData.aed0n7__VAT_Registration_Number__c !== '' ? this.recordData.aed0n7__VAT_Registration_Number__c : this.recordData.VAT_Number_Entry__c;

                    let documentNames = [];
                    const status = this.recordData.Citizenship_Immigration_status__c;
                    const documentValue = this.recordData.Right_to_work_document__c;

                    // this.data[x].allowRTWEdit = !this.restrictedStatuses.includes(status);
                    console.log('aLL >>  OUTPUT : ', JSON.parse(JSON.stringify(result[0])));
                    let documentLength = 0;
                    // this.data[x].allowRTWEdit &&
                    if (status && documentValue && this.allowedRTWOptions[status]) {
                        const selectedOption = this.allowedRTWOptions[status].find(option => option.value === documentValue);
                        console.log('aLL >>  OUTPUT : ', selectedOption);

                        if (selectedOption && selectedOption.documentType) {
                            documentNames = [...selectedOption.documentType];
                            documentLength = selectedOption.documentType.length;
                            console.log('aLL >>  OUTPUT : ', selectedOption.documentType.length);
                        }
                    }

                    this.recordData.doubleRTWImage = documentLength > 1;

                    this.recordData.rtwFrontDocumentName = documentNames[0] || 'Document';
                    this.recordData.rtwBackDocumentName = documentNames[1] || '';

                    if (this.isTimeLimitedSelected) {
                        this.showTimeLimitedSection = true;
                    }
                    if (this.isHasRestrictionsSelected) {
                        this.showRestrictionsSection = true;
                    }

                } else {
                    console.error('No Driver Details Found!');
                }

            }).catch(error => {
                console.error('Error in Fetching Driver Details', error);
                // Try to extract a meaningful error message
                if (error && error.body && error.body.message) {
                    errorMessage = error.body.message;
                } else if (error && error.message) {
                    errorMessage = error.message;
                }

                // Show toast
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: errorMessage,
                        variant: 'error',
                        mode: 'sticky'
                    })
                );
            });

        getRTWandDLfiles({
            accountId: this.recordId,
            fileType: 'DL'
        })
            .then(result => {
                if (result != null) {
                    if (result.Front != null) {
                        this.hasFrontDLImage = true;
                        this.dlFrontImage = result.Front;
                        this.originalDLFront = result.Front;
                    }
                    if (result.Back != null) {
                        this.hasBackDLImage = true;
                        this.dlBackImage = result.Back;
                        this.originalDLBack = result.Back;
                    }
                }
            })
            .catch(error => {
                console.error('Error in fetching DL images', error.body.message);
            });

        this.imageLoading = true;
        this.imagesAvailable = false;
        this.imagesNotAvailable = false;


        getRTWandDLfiles({ accountId: this.recordId, fileType: 'RTW' })
            .then(result => {
                this.imageLoading = false;

                if (!result) {
                    this.imagesAvailable = false;
                    this.imagesNotAvailable = true;
                    return;
                }
                this.imagesAvailable = true;
                this.imagesNotAvailable = false;
                this.rtwFrontImage = result.Front;
                this.rtwBackImage = result.Back;
                this.rtwCheckImage = result.Check;
                this.hasFrontRTWImage = !!result.Front;
                this.hasBackRTWImage = !!result.Back;
                console.log('getRTWandDLfiles >>  : ', result);
                this.hasRTWCheckImage = !!result.Check;
                this.hasCompletedImageforShareCode = !!result.Check;

            })
            .catch(() => {
                this.imageLoading = false;
                this.imagesAvailable = false;
                this.imagesNotAvailable = true;
            });

    }

    get hasEvidenceBritishPassport() {
        return this.recordData.Right_to_work_document__c === 'British passport' && this.recordData.Citizenship_Immigration_status__c === 'British Citizen';
    }

    get hasEvidenceBirthOrNI() {
        return this.recordData.Right_to_work_document__c === 'Birth/Adoption Certificate + National Insurance document' || this.recordData.Right_to_work_document__c === 'Certificate of registration/naturalisation + National Insurance document';
    }

    get hasEvidenceIrishPassport() {
        return this.recordData.Right_to_work_document__c === 'Irish passport or passport card';
    }

    onchangeincidentDetails(event) {
        const value = event.target.value.toLowerCase();

        // Update the relevant property based on the name of the input field
        if (event.target.name === 'SearchName') {
            this.searchName = value;
        }
        this.incidentLogList = this.orginalIncidentData.filter(contractor => {
            const nameMatch = !this.searchName || contractor.Name.toLowerCase().includes(this.searchName);
            return nameMatch;
        });
        this.currentPageInc = 1;
        this.searchResultNotFound = (this.searchName && this.incidentLogList.length === 0);

    }

    connectedCallback() {
        this.isSpinner = true;
        const selectedMenuTab = this.tabMenu.find(tab => tab.selected === true);
        this.defaultMenuId = selectedMenuTab ? selectedMenuTab.id : null;

        const selectedDocTab = this.tabDocMenu.find(tab => tab.selected === true);
        this.defaultDocMenuId = selectedDocTab ? selectedDocTab.id : null;
        this.defaultActiveTabId = this.template.querySelector('.Information')?.dataset.menuid;

        this.activeMainTabsCount = this.tabMenu.filter(tab => tab.enabled).length;
        setTimeout(() => {
            const targetDiv = this.template.querySelector('.target-div');
            targetDiv.style.height = '100vh';
            targetDiv.style.height = 'unset';
        }, 100);

        document.addEventListener('click', this.handleOutsideClick.bind(this));

        getUserContact({
            userId: USER_ID
        })
            .then(result => {
                this.contactId = result;
                getEndUserMCDepotDetails({
                    contactId: result
                })
                    .then((result) => {

                        this.parsedResultForDepot = JSON.parse(result);

                        const uniqueDepotNames = new Set();
                        var uniqueEndUser = {};
                        this.parsedResultForDepot.forEach(item => {
                            if (item.End_User_Account__c) {
                                if (uniqueEndUser[item.End_User_Account__c] == undefined) {
                                    uniqueDepotNames.add(item);
                                    uniqueEndUser[item.End_User_Account__c] = item;
                                }
                            }
                        });
                        this.depotOptions = Array.from(uniqueDepotNames).map(item => ({
                            label: item.End_User_Account__r.Name,
                            value: item.End_User_Account__c
                        }));


                    })
                    .catch((error) => {
                        console.log('Error:', error);
                        this.spinner = false;
                    });

                getMCDepotDetails({
                    contactId: result
                })
                    .then((response) => {

                        if (response != null) {
                            var depotResult = JSON.parse(response);
                            for (var i = 0; i < depotResult.length; i++) {
                                this.collectdepots = {
                                    'label': depotResult[i].label,
                                    'value': depotResult[i].value
                                };
                                this.depotList = [...this.depotList, this.collectdepots];
                                this.spinner = false;
                            }
                        }


                    })
                    .catch((error) => {
                        console.log('Error:', error);
                        this.spinner = false;
                    });
                this.getIncidentLogs();
            });

        const style = document.createElement('style');
        style.innerText = `

            .inputbold lightning-input label {
            font-weight: bold !important;
            color: var(--color-primary) !important;
            }
            .search_btn input {
            padding: 12px 45px !important;
            line-height: 20px !important;
            border-radius: 10px !important;
            }
            .admin_note label{
            display:none;
            }
            .confirmModal .slds-modal__container{
                    box-shadow: unset !important;
                }
                .dialogueHeader {
                    border-bottom-style: none !important;
                    border-top-left-radius: 15px !important;
                    border-top-right-radius: 15px !important;
                }

                .dialogueFooter {
                    border-top-style: none !important;
                    border-bottom-left-radius: 15px !important;
                    border-bottom-right-radius: 15px !important;
                }
                .fileBtn button{
                    border: 1px solid var(--color-Active-button-bg) !important;
                    background-color: var(--color-Active-button-bg) !important;
                    color:var(--color-Active-button-font) !important;
                    width: max-content;
                }
                .file-upload-modal .slds-modal__container{
                    max-width: 28rem !important;
                    box-shadow: unset !important;
                }
            `;
        setTimeout(() => {
            this.template.querySelector('.overrideStyle').appendChild(style);
        }, 100);
        document.addEventListener('click', this.handleOutsideClick.bind(this));

    }
    handleOutsideClick(event) {

        this.data = this.data.map(contractor => {
            const dropdownMenu = this.template.querySelector('.dropdownMenu');

            if (contractor.visibleRecordMenu && (!dropdownMenu || !dropdownMenu.contains(event.target))) {
                return { ...contractor, visibleRecordMenu: false };
            }
            return contractor;
        });
    }


    handleTabItemClick(event) {
        let currentTab = event.currentTarget.dataset.menuid;
        this.tabMenu.forEach(item => {
            if (item.id === currentTab) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        });

        let selectedTab = event.currentTarget.dataset.tabName;
        this.deactivateAllMenuTab();
        if (selectedTab == 'Contractor Information') {
            this.isContractorSelect = true;
        } else if (selectedTab == 'Financial Information') {
            this.isFinacialSelect = true;
        } else if (selectedTab == 'Incident / Deduction Log') {
            this.isIncidentsSelect = true;
        } else if (selectedTab == 'Invoices') {
            this.isInvoicesSelect = true;
        } // UnComment on 21-10-2025// Commented On 16-10-2025 for Deduction and Incident to PROD
        else if (selectedTab == 'Contractor Availability') {
            this.isAvailabilitySelect = true;
        } // UnComment on 21-10-2025// Commented On 16-10-2025 for Deduction and Incident to PROD
    }

    deactivateAllMenuTab() {
        this.isContractorSelect = false;
        this.isFinacialSelect = false;
        //this.isVehicleSelect = false;
        this.isIncidentsSelect = false;
        this.isInvoicesSelect = false
        this.isAvailabilitySelect = false;// UnComment on 21-10-2025// Commented On 16-10-2025 for Deduction and Incident to PROD
    }

    handleDocTabItemClick(event) {

        let currentTab = event.currentTarget.dataset.docmenuid;
        this.tabDocMenu.forEach(item => {
            if (item.id === currentTab) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        });
        let selectedTab = event.currentTarget.dataset.tabName;
        this.deactivateAllDocMenuTab();
        if (selectedTab == 'Documents') {
            this.isDocumentSelect = true;
        } else if (selectedTab == 'Contracts') {
            this.isContractSelect = true;
        }
    }

    deactivateAllDocMenuTab() {
        this.isDocumentSelect = false;
        this.isContractSelect = false;
    }

    handleNewIncident(event) {
        this.openNewIncident = true;
    }

    closehandleNewIncident(event) {
        this.openNewIncident = false;
    }

    handleCloseSuccessModal(event) {
        this.openNewIncident = false;
    }

    handleSaveContractor(event) {
        let allFieldsValid = true;
        let inputFields = this.template.querySelectorAll('.admin_note');

        inputFields.forEach(inputField => {
            inputField.reportValidity();
            if (!inputField.checkValidity()) {
                allFieldsValid = false;
                inputField.focus();
            }
        });

        if (allFieldsValid) {
            this.updateContractorDetails();
        }

    }

    handleContractorChange(event) {
        this.updateJsonData.Id = this.recordId;
        if (event.target.name == "adminNotes") {
            if (event.target.value == null) {
                return;
            }
            let adminNotes = event.target.value;
            this.updateJsonData.Admin_Notes__c = adminNotes;
        }

    }

    updateContractorDetails() {
        if (Object.keys(this.updateJsonData).length === 0) {
            return;
        }


        updateAccountClient({
            selectedContractorToUpdate: this.updateJsonData
        })
            .then(() => {
                const toastEvt = new ShowToastEvent({
                    title: 'Success',
                    message: 'Data successfully updated!',
                    variant: 'success'
                });
                this.dispatchEvent(toastEvt);
                this.recordData = {
                    ...this.recordData,
                    Admin_Notes__c: this.updateJsonData.Admin_Notes__c
                };
            })
            .catch(error => {
                console.error('Error updating contractor details: ', error);
            });
    }

    handleDownloadDoc(event) {

        let docType = event.target.dataset.docType;
        let docId = null;
        if (docType == 'BgCheck') {
            docId = this.recordData.BackgroundCheck_Doc;
        } else if (docType == 'TxCheck') {
            docId = this.recordData.Toxicology_Doc;
        }
        let url = '/sfc/servlet.shepherd/document/download/' + docId + '?operationContext=S1'
        window.open(this.orgUrl + url);
    }

    handleDisengage(event) {
        this.isDisenegaeLoader = true;
        this.selectedDriverId = event.target.dataset.selectedId;
        fetchDeductionRemainAmt({
            applicationId: this.recordId,
            mainContractorId: this.recordData.Main_Contractor__c
        })
            .then(result => {
                this.hasActiveDeduction = result.hasActiveDeduction;
                //this.deductionList = result.deductions || [];
                this.deductionList = result.deductions.map(d => ({
                    ...d,
                    balanceAmountFormatted: parseFloat(d.balanceAmount).toFixed(2)
                }));
                //this.totalRemainDeductionBalance = this.deductionList.reduce((sum, d) => sum + d.balanceAmount, 0);
                const total = this.deductionList.reduce((sum, d) => sum + parseFloat(d.balanceAmount), 0);

                this.totalRemainDeductionBalance = new Intl.NumberFormat('en-GB', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(total);
                this.isDisenegaeLoader = false;
            })
            .catch(error => {
                console.error('Error fetching deductions:', error);
                this.hasActiveDeduction = false;
                this.deductionList = [];
                this.totalRemainDeductionBalance = 0;
                this.isDisenegaeLoader = false;
            });
        this.openDisengageConfirm = true;

    }
    closeConfirmModal() {
        this.openDisengageConfirm = false;
    }

    handleDisengageClick(event) {
        this.updateJsonData.Id = this.recordId;
        this.updateJsonData.SC_Status__c = 'Disengaged';
        this.updateContractorDetails();
        this.openDisengageConfirm = false;
        window.location.reload();
    }
    handleNewDepot(event) {
        this.openNewDepotModal = true;
        this.showDepotData = true;
        this.showSuccessMessage = false;
    }
    closeDepotModal() {
        this.openNewDepotModal = false;
    }


    onchangeDepotDetails(event) {

        if (event.target.name === 'SelectedEndUser') {
            const selectedEndUser = event.detail.value;


            if (selectedEndUser) {

                const filteredDepots = this.parsedResultForDepot.filter(item =>
                    item.End_User_Account__c && item.End_User_Account__c === selectedEndUser
                );

                this.relatedDepotOptions = filteredDepots.map(item => ({
                    label: item.Name,
                    value: item.Id
                }));


            } else {
                this.relatedDepotOptions = [];
            }
        }
        this.collectDetails[event.target.name] = event.target.value;

    }

    submitAssignedDepot() {
        let allFieldsValid = true;
        const inputFields = this.template.querySelectorAll('.SelectEndUserValid,.depotValid');

        inputFields.forEach(inputField => {
            let value = inputField.value;

            if (!inputField.classList.contains('depotValid') && !inputField.classList.contains('SelectEndUserValid')) {
                value = value.trim();
            }
            inputField.value = value;
            inputField.reportValidity();
            if (!inputField.checkValidity()) {
                allFieldsValid = false;
                inputField.focus();
            }
        });

        if (allFieldsValid) {
            this.spinner = true;

            this.collectDetails['mainContractorID'] = this.recordData.Main_Contractor__c;
            this.collectDetails['applicationID'] = this.recordId;
            this.collectDetails['accountID'] = this.recordData.Account__c;


            createNewDepotAssociation({
                SCDetails: JSON.stringify(this.collectDetails)
            })
                .then((response) => {


                    if (response.includes('already')) {
                        this.showSuccessMessage = false;

                        this.showToast('Error', response, 'error');

                    } else if (response === 'Success') {
                        this.getDriverProfileData();
                        this.showSuccessMessage = true;
                        this.showErrorMessage = false;
                        this.showDepotData = false;
                        this.depotMessage = 'Depot Assigned Successfully!!!';
                    }
                    this.spinner = false;
                })
                .catch((error) => {
                    this.depotMessage = error.body ? error.body.message : 'Failed to associate account';
                    this.spinner = false;
                    this.showToast('Error', this.depotMessage, 'error');
                });
        }
    }



    getIncidentLogs() {
        getIncidentLogList({
            contractorId: this.recordId,
            contactId: this.contactId
        })
            .then(result => {
                if (result != null && result != undefined && result != '') {
                    this.orginalIncidentData = result;
                    this.incidentLogList = [...this.orginalIncidentData];

                    this.incidentLogsAvailiable = true;
                    this.incidentLogList.forEach((item) => {
                        item.visibleRecordMenu = false;
                        if (item.Status__c == 'Requested') {
                            item.acceptDeclineBtnEnable = true;
                        } else {
                            item.acceptDeclineBtnEnable = false;
                        }
                        if (item.Date_of_Incident__c != null || item.Date_of_Incident__c != undefined) {
                            item.DateofIncident = new Date(item.Date_of_Incident__c).toLocaleString('en-GB', {
                                timeZone: 'Europe/London',
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour12: false
                            });
                        } else {
                            item.DateofIncident = '-';
                        }

                        if (item.Requested_Date__c != null || item.Requested_Date__c != undefined) {
                            item.RequestedDate = new Date(item.Requested_Date__c).toLocaleString('en-GB', {
                                timeZone: 'Europe/London',
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour12: false
                            });
                        } else {
                            item.RequestedDate = '-';
                        }
                        if (item.Accepted_Declined_Date__c != null || item.Accepted_Declined_Date__c != undefined) {
                            item.AcceptDeclineDate = new Date(item.Accepted_Declined_Date__c).toLocaleString('en-GB', {
                                timeZone: 'Europe/London',
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour12: false
                            });
                        } else {
                            item.AcceptDeclineDate = '-';
                        }

                    });
                } else {
                    this.incidentLogsAvailiable = false;
                    this.incidentLogList = [];
                }

            }).catch(error => {
                console.error('Error in Fetching Driver Details', error);
            });
    }

    handleIncidentViewEditClick(event) {
        const actionType = event.currentTarget.dataset.actionType;
        const recordId = event.currentTarget.dataset.selectedId;
        this.selectedIncidentId = recordId;
        if (actionType === 'view') {
            this.showViewIncidentModal = true;
            this.showEditIncidentModal = false;
        }

        if (actionType === 'edit') {
            this.showViewIncidentModal = false;
            this.showEditIncidentModal = true;
        }

    }

    handleIncidentDeleteClick(event) {
        const recordId = event.currentTarget.dataset.selectedId;

        if (this.incidentViewIndex >= 0 && this.incidentViewIndex < this.incidentLogList.length) {
            // Use splice to remove the object at incidentViewIndex
            this.incidentLogList[this.incidentViewIndex].Void__c = true;
            updateIncidents({
                incidentIds: [recordId],
                incidentUpdateData: this.incidentLogList[this.incidentViewIndex]
            })
                .then(result => {
                    if (result === 'SUCCESS') {

                        this.incidentLogList.splice(this.incidentViewIndex, 1);

                        for (let x in this.orginalIncidentData) {
                            if (recordId === this.orginalIncidentData[x].Id) {
                                this.orginalIncidentData.splice(x, 1);
                            }
                        }
                        this.showToast('Success', 'Incident deleted successfully', 'success');
                    }
                })
                .catch(error => {
                    console.log('Error updating incident: ', error);
                });
        }

    }

    handleNewIncidentRecord(event) {
        this.getIncidentLogs();

    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }


    closeIncidentModal() {
        this.showViewIncidentModal = false;
        this.showEditIncidentModal = false;
        this.getIncidentLogs();
    }

    handleCallDeductionLog(event) {
        this.refs.deductionLog.callFromSiblinggetDedDataList();
    }


    handleIncidentMenuClick(event) {
        let seletedIncidentId = event.currentTarget.dataset.selectedId;
        const startIndex = (this.currentPageInc - 1) * this.recordsPerPageInc;
        this.incidentViewIndex = parseInt(startIndex) + parseInt(event.target.dataset.index);
        this.incidentViewRecord = this.incidentLogList[this.incidentViewIndex];
        event.stopPropagation();
        this.incidentLogList = this.incidentLogList.map(record => {
            if (record.Id === seletedIncidentId) {
                return {
                    ...record,
                    visibleRecordMenu: !record.visibleRecordMenu
                };
            } else {
                return {
                    ...record,
                    visibleRecordMenu: false
                };
            }
        });
    }

    handleOutsideClick(event) {
        this.incidentLogList = this.incidentLogList.map(record => {
            const dropdownMenuIncident = this.template.querySelector('.dropdownMenuIncident');
            if (record.visibleRecordMenu && (!dropdownMenuIncident || !dropdownMenuIncident.contains(event.target))) {
                return {
                    ...record,
                    visibleRecordMenu: false
                };
            }
            return record;
        });
    }


    formatDateToDDMMYYYY(dateValue) {
        const date = new Date(dateValue);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear(); // Get full year
        return `${day}/${month}/${year}`; //  DD/MM/YYYY
    }


    disconnectedCallback() {
        document.removeEventListener('click', this.handleOutsideClick.bind(this));
    }
    handleRTWDownload(event) {
        let link = event.currentTarget.dataset.link;

        // Extract versionId from URL
        const url = new URL(link, window.location.origin);
        const versionId = url.searchParams.get('versionId');

        if (versionId) {
            link = `/mcsite/sfc/servlet.shepherd/version/download/${versionId}`;
        }

        const a = document.createElement('a');
        a.href = link;
        a.target = '_blank';
        a.download = '';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    handleDownload(event) {
        const docType = event.target.dataset.doctype;
        const accountId = this.recordId;
        let validData = false;
        if (docType == 'GConnect DL') {

            if (this.hasFrontDLImage && this.hasBackDLImage && this.recordData.Driving_Licence_Number__c) {
                validData = true;
            } else {
                this.errorMessage = 'No Driving Licence Document available for this SubContractor';
                this.showError = true;
            }
        } else if (docType == 'GConnect RTW') {

            if (this.recordData.Citizenship_Immigration_status__c && this.hasFrontRTWImage) {
                validData = true;

            } else if (this.recordData.Access_Code__c && this.recordData.Biometric_Evidence__c === 'No') {
                validData = true;

            } else {
                this.errorMessage = 'No Right to Work Document available for this SubContractor';
                this.showError = true;
            }

        }


        if (validData) {
            createRTWandDLDocument({
                accountId: accountId,
                documentType: docType
            })
                .then(result => {
                    let vfPageName;
                    let fileType;
                    if (docType === 'GConnect RTW') {
                        vfPageName = 'RightToWorkEvidence';
                        fileType = '_RTW_Evidence';
                    } else if (docType === 'GConnect DL') {
                        vfPageName = 'DrivingLicenceEvidence';
                        fileType = '_DL_Evidence';
                    }
                    const firstName = this.recordData.First_Name__c;
                    const lastName = this.recordData.Last_Name__c;
                    const filename = `${firstName}_${lastName}_${fileType}.pdf`;

                    const vfUrl = window.location.origin + result;

                    //window.open( this.orgUrl + '/apex/'+ vfPageName + '?id='+ this.recordId);

                    const link = document.createElement('a');
                    link.href = this.orgUrl + '/apex/' + vfPageName + '?id=' + this.recordId;
                    link.download = filename; // Set the desired filename
                    document.body.appendChild(link); // Required for Firefox
                    link.click();
                    document.body.removeChild(link);
                })
                .catch(error => {
                    console.error("Error generating document: ", error);
                });

        }
    }
    closeErrorModal() {
        this.showError = false;
    }

    async handeleAcceptDecline(event) {
        const btnType = event.currentTarget.dataset.btntype;
        const incidentId = event.currentTarget.dataset.selectedId;
        const startIndex = (this.currentPageInc - 1) * this.recordsPerPageInc;
        const currentIndex = parseInt(startIndex) + parseInt(event.currentTarget.dataset.index);
        this.incidentLogList[currentIndex].status = btnType;

        const result = await updateIncidents({
            incidentIds: incidentId,
            incidentUpdateData: JSON.stringify(this.incidentLogList[currentIndex]),
            applicationId: this.recordId
        });
        if (result === 'SUCCESS') {
            this.getIncidentLogs();
            this.showToast('Success', 'Incident is ' + btnType, 'success');
        } else {
            this.showToast('Error', 'Error while updating the status of Incident: ' + result, 'error');
            return; // stop execution if update failed
        }

    }

    // UnComment on 21-10-2025// Commented On 16-10-2025 for Deduction and Incident to PROD
    handleViewRate(event) {
        this.fetchDriverRate();
        this.showRateModule = true;
    }

    fetchDriverRate() {
        getDriverRate({
            applicationId: this.recordId,
            mainContractorId: this.recordData.Main_Contractor__c,
            roleName: this.recordData.Role__c
        })
            .then(result => {
                if (result && result.error) {
                    this.showToast('Error', 'Error while fetching driver rate: ' + result.error, 'error');
                } else {
                    // this.roleWiseRate = result?.defaultRate ?? 0;
                    this.roleWiseRate = result?.defaultRate != null
                        ? Number(result.defaultRate).toFixed(2)
                        : 0;
                    // this.overrideRate = result?.driverRate ?? '';
                    this.overrideRate = result?.driverRate != null
                        ? Number(result.driverRate).toFixed(2)
                        : '';
                    this.rateStatus = result?.rateStatus ?? 'Default';
                }
            })
            .catch(error => {
                console.error('Error fetching driver rate', error);
                this.showToast('Error', 'Error while fetching driver rate: ' + error, 'error');
            });
    }

    handleDriverRateChange(event) {
        // this.newDriverRate = event.target.value;
        this.newDriverRate = event.target.value === '' ? null : parseFloat(event.target.value);
    }

    handleCloseRateModule(event) {
        this.showRateModule = false;
    }

    handleSaveDriverRate(event) {
        if (this.newDriverRate != null && this.newDriverRate !== '') {
            const regex = /^\d+(\.\d{1,2})?$/;
            if (!regex.test(this.newDriverRate)) {
                this.showToast(
                    'Error',
                    "Driver Rate must be a valid number with up to 2 decimal places.",
                    'error'
                );
                return;
            }
        }
        updateDriverRate({
            applicationId: this.recordId,
            mainContractorId: this.recordData.Main_Contractor__c,
            driverRate: this.newDriverRate
        })
            .then(result => {

                if (result && result.error) {
                    this.showToast('Error', result.error, 'error');
                } else {
                    this.showToast('Success', result.message || 'Driver Rate updated.', 'success');
                    this.showRateModule = false;
                }
            })
            .catch(error => {
                console.error('Error updating driver rate', error);
                this.showToast('Error', "The value provided for the 'Driver Rate' is invalid.", 'error');
            });
    }

    // Pagonation Methods Start --//
    handleNextPage() {
        if (this.currentPageInc < this.totalPages) {
            this.currentPageInc = this.currentPageInc + 1;
        }
    }

    handlePreviousPage() {
        if (this.currentPageInc > 1) {
            this.currentPageInc = this.currentPageInc - 1;
        }
    }

    handleOnchangeInput(event) {
        const inputPage = Number(event.target.value);
        // Check if the "Enter" key was pressed
        if (event.key === 'Enter') {
            if (inputPage >= 1 && inputPage <= this.totalPages) {
                this.currentPageInc = inputPage; // Navigate to the entered page
            } else {
                // Optionally, reset the input or show an error if the page number is invalid
                event.target.value = this.currentPageInc;
            }
        }
    }

    get totalPages() {
        return Math.ceil(this.incidentLogList.length / this.recordsPerPageInc);
    }

    get paginatedData() {

        const startIndex = (this.currentPageInc - 1) * this.recordsPerPageInc;
        const endIndex = startIndex + this.recordsPerPageInc;
        return this.incidentLogList.slice(startIndex, endIndex);
    }

    get disableNextButton() {
        return this.currentPageInc === this.totalPages;
    }

    get disablePreviousButton() {
        return this.currentPageInc === 1;
    }
    // Pagonation Methods End --//
    handleIncidentSort(event) {
        const fieldName = event.currentTarget.dataset.field;
        let sortedData = [...this.incidentLogList];

        // toggle asc/desc
        if (this.sortedIncidentField === fieldName) {
            this.isIncidentAscending = !this.isIncidentAscending;
        } else {
            this.isIncidentAscending = true;
            this.sortedIncidentField = fieldName;
        }

        sortedData.sort((a, b) => {
            let fieldA = a[fieldName];
            let fieldB = b[fieldName];

            // Handle relationship lookups (example: End User)
            if (fieldName === 'End_User__c' && a.End_User__r && b.End_User__r) {
                fieldA = a.End_User__r.Name;
                fieldB = b.End_User__r.Name;
            }

            if (typeof fieldA === 'string') {
                fieldA = fieldA ? fieldA.toUpperCase() : '';
                fieldB = fieldB ? fieldB.toUpperCase() : '';
            }

            if (fieldA < fieldB) {
                return this.isIncidentAscending ? -1 : 1;
            } else if (fieldA > fieldB) {
                return this.isIncidentAscending ? 1 : -1;
            } else {
                return 0;
            }
        });

        this.incidentLogList = sortedData;
    }

    handleDrivingLicenceEditOpen() {
        this.drivingLicenseEditOpen = true;
        this.showDLFileUploadButton = true;
        this.selectedOption = 'DL';
        this.selectedContractorId = this.recordId;

        this.showFrontBackRadioBtn = true;

        this.editDrivingLicenceNumber = this.recordData.Driving_Licence_Number__c;
        this.editDrivingLicenceExpiry = this.recordData.Driving_Licence_Expiry_Date__c;
        this.editDrivingLicenceType = this.recordData.Type_of_licence__c;
        this.editPointsOnLicence = this.recordData.Points_on_Licence__c;
        this.editIssueDate = this.recordData.Driving_Licence_Issue_Date__c;
        this.editVehiclesCanDrive = this.recordData.Additional_licence_categories__c;

        const selectedValues = this.recordData.Additional_licence_categories__c
            ? this.recordData.Additional_licence_categories__c.split(';')
            : [];

        this.recordBasedLicenseCategory = this.licenseCategory_option.map(option => ({
            ...option,
            checked: selectedValues.includes(option.value)
        }));
        this.recordBasedLicenseCategory = this.licenseCategory_option.map(option => ({
            ...option,
            checked: selectedValues.includes(option.value)
        }));
        this.selectedOption = 'DL';
        this.selectedContractorId = this.recordId;
        console.log('recordBasedLicenseCategory', this.recordBasedLicenseCategory);

    }

    handleDLFieldChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;

        if (field === 'Driving_Licence_Issue_Date__c') {
            const selectedDate = new Date(value);
            selectedDate.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate > today) {
                event.target.setCustomValidity(
                    'Issue Date cannot be in the future'
                );
            } else {
                event.target.setCustomValidity('');
                this.editIssueDate = value;
            }

            event.target.reportValidity();
            return;
        }

        switch (field) {
            case 'Driving_Licence_Number__c':
                this.editDrivingLicenceNumber = value;
                break;

            case 'Driving_Licence_Expiry_Date__c':
                this.editDrivingLicenceExpiry = value;
                break;

            case 'Type_of_licence__c':
                this.editDrivingLicenceType = value;
                break;

            case 'Points_on_Licence__c':
                this.editPointsOnLicence = value;
                break;

            case 'Driving_Licence_Issue_Date__c':
                this.editIssueDate = value;
                break;

        }
    }
    onChangeLicenseDetails(event) {
        if (event.target.name === 'typeOfLicense') {
            this.editDrivingLicenceType = event.detail.value;
            return;
        }

        const selectedValues = [];
        this.template.querySelectorAll('.licenseCategory').forEach(cb => {
            if (cb.checked) selectedValues.push(cb.value);
        });

        // store as semicolon separated (Salesforce multi-picklist format)
        this.editVehiclesCanDrive = selectedValues.join(';');
    }

    handleDrivingLicenceEditCancel() {
        this.drivingLicenseEditOpen = false;
        this.showFileUploadButton = false;
        this.showDLFileUploadButton = false;
        this.showDLFileUploadButton = false;
        this.tempFrontFiles = [];
        if (this.originalDLFront && this.originalDLBack) {
            this.dlFrontImage = this.originalDLFront;
            this.dlBackImage = this.originalDLBack;
            this.hasFrontDLImage = true;
            this.hasBackDLImage = true;
        } else {
            this.dlFrontImage = '';
            this.dlBackImage = '';
            this.hasFrontDLImage = false;
            this.hasBackDLImage = false;
        }

        this.tempBackFiles = [];
        this.refreshRTWAndDLImages('DL');
    }

    async handleSaveDrivingLicence() {
        const inputs = this.template.querySelectorAll('lightning-input');

        let isValid = true;
        inputs.forEach(input => {
            input.reportValidity();
            if (!input.checkValidity()) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showToast('Error', 'Please fix validation errors before saving', 'error');
            return;
        }
        const updateData = {
            Id: this.recordId,
            Driving_Licence_Number__c: this.editDrivingLicenceNumber,
            Driving_Licence_Expiry_Date__c: this.editDrivingLicenceExpiry,
            Type_of_licence__c: this.editDrivingLicenceType,
            Points_on_Licence__c: this.editPointsOnLicence,
            Driving_Licence_Issue_Date__c: this.editIssueDate,
            Additional_licence_categories__c: this.editVehiclesCanDrive
        };
        try {
            this.imageLoading = true;
            await updateAccountClient({ selectedContractorToUpdate: updateData });

            await this.commitUploadedFiles();

            await this.refreshRTWAndDLImages('DL');
            this.recordData = {
                ...this.recordData,
                ...updateData
            };

            this.showToast('Success', 'Driving Licence updated successfully', 'success');
            this.handleDrivingLicenceEditCancel();
        } catch (error) {
            console.error(error);
            this.showToast('Error', 'Failed to update Driving Licence', 'error');
        } finally {
            this.imageLoading = false;
        }
    }


    clickFrontBackUpload(event) {
        event.stopPropagation();

        this.resetFileUploadState();

        this.selectedOption = this.selectedOption;

        if (this.selectedOption === 'DL') {
            this.showFrontBackRadioBtn = true;
            this.isDLFileUploadOpen = true;
        }

        if (this.selectedOption === 'RTW') {
            this.showFrontBackRadioBtn = false;
            this.isRTWFileUploadOpen = true;
        }

        this.showImageCaptureModal = true;
        this.showFileUploadModal = true;

        setTimeout(() => {
            const child = this.template.querySelector('c-image-capture');
            child?.resetFiles?.();
        }, 0);
    }
    clickDLUpload(event) {
        event.stopPropagation();

        this.resetFileUploadState();

        this.selectedOption = 'DL';
        this.selectedContractorId = this.recordId;

        this.showFrontBackRadioBtn = true;

        this.isDLFileUploadOpen = true;
        this.showFileUploadModal = true;
        this.showImageCaptureModal = true;

        setTimeout(() => {
            const child = this.template.querySelector('c-image-capture');
            child?.resetFiles?.();
        }, 0);
    }
    clickRTWUpload(event) {
        event.stopPropagation();

        const citizenType = this.recordData.Citizenship_Immigration_status__c;
        const selectedDocValue = this.recordData.Right_to_work_document__c;
        let documentCount = 0;

        if (citizenType && selectedDocValue && this.allowedRTWOptions[citizenType]) {

            const selectedOption = this.allowedRTWOptions[citizenType].find(option => option.value === selectedDocValue);

            if (selectedOption && selectedOption.documentType) {
                this.documentNames = selectedOption.documentType;
                documentCount = selectedOption.documentType.length;
            }
        }

        if (documentCount > 1) {
            this.showFrontBackRadioBtn = true;
        } else {
            this.showFrontBackRadioBtn = false;
        }

        this.resetFileUploadState();

        this.selectedOption = 'RTW';
        this.selectedContractorId = this.recordId;
        this.isRTWFileUploadOpen = true;
        this.showFileUploadModal = true;
        this.showImageCaptureModal = true;
        this.allowedExtension = '.png, .jpg, .jpeg, .pdf';
        setTimeout(() => {
            const child = this.template.querySelector('c-image-capture');
            child?.resetFiles?.();
        }, 0);
    }

    handleFileCancel() {
        this.isRTWFileUploadOpen = false;
        this.allowedExtension = undefined;
        this.isDLFileUploadOpen = false;
        this.tempFrontFiles = [];
        this.tempBackFiles = [];
        this.resetFileUploadState();
    }

    handleSaveFiles() {
        const childComp = this.template.querySelector('c-image-capture');

        if (!childComp) return;

        const data = childComp.getUploadDocs();
        if (!data) return;
        console.log('file data', data);

        this.tempFrontFiles = [];
        this.tempBackFiles = [];


        if (data.uploadFrontFiles.length || data.capturedFrontFiles.length) {
            this.tempFrontFiles = data.uploadFrontFiles.length
                ? data.uploadFrontFiles
                : data.capturedFrontFiles;
        } else {
            this.fileModuleError = 'Please upload Front file';
            this.isFileModuleError = true;
            return;
        }
        console.log('tempFrontFiles', this.tempFrontFiles);
        if (this.selectedOption === 'DL') {
            if (data.uploadBackFiles.length || data.capturedBackFiles.length) {
                this.tempBackFiles = data.uploadBackFiles.length
                    ? data.uploadBackFiles
                    : data.capturedBackFiles;
            } else {
                this.fileModuleError = 'Please upload Back file';
                this.isFileModuleError = true;
                return;
            }
        }

        if (this.selectedOption === 'RTW') {
            // this.imagesNotAvailable = false;
            if (this.recordData.hasAccessCode || this.recordData.hasShareCode) {
                this.rtwCheckImage = this.tempFrontFiles[0].preview;
                this.hasRTWCheckImage = true;
                this.hasCompletedImageforShareCode = false;
            } else {
                this.rtwFrontImage = this.tempFrontFiles[0].preview;
                this.hasFrontRTWImage = true;
                this.hasCompletedImageforShareCode = true;
            }
            this.imagesAvailable = true;
            this.imagesNotAvailable = false;

            this.isRTWFileUploadOpen = false;
            this.isDLFileUploadOpen = false;
        }

        if (this.selectedOption === 'DL') {
            this.dlFrontImage = this.tempFrontFiles[0].preview;
            this.dlBackImage = this.tempBackFiles[0].preview;
            this.hasFrontDLImage = true;
            this.hasBackDLImage = true;
        }

        this.isDLFileUploadOpen = false;
        this.isRTWFileUploadOpen = false;
    }


    uploadAllFiles() {
        this.uploadFiles = [...this.frontDocFiles, ...this.backDocFiles];
        this.frontDocFiles = [];
        this.backDocFiles = [];

        this.handleUpload();
    }

    async handleUpload() {
        try {
            if (!this.uploadFiles || !this.uploadFiles.length) {
                return;
            }
            this.imageLoading = true;
            const uploadPromises = [];
            for (const file of this.uploadFiles) {
                let fileDocName;
                let docType;
                if (this.selectedOption === 'RTW' && this.recordData.hasAccessCode) {
                    fileDocName = `${this.recordData.Client_Name__c}_RTW Check`;
                } else {
                    fileDocName = `${this.recordData.Client_Name__c}_${this.selectedOption}_${file.docType}`;
                }
                if (this.selectedOption === 'DL') {
                    docType =
                        file.docType === 'Front'
                            ? 'Driving License Front'
                            : 'Driving License Back';
                }

                if (this.selectedOption === 'RTW') {
                    if (this.recordData.hasAccessCode || this.recordData.hasShareCode) {
                        docType = 'Right To Work Check';
                    } else {
                        docType =
                            file.docType === 'Front'
                                ? 'Right To Work Front'
                                : 'Right To Work Back';
                    }
                }

                uploadPromises.push(
                    saveUplodededFiles({
                        parentId: this.selectedContractorId,
                        fileName: fileDocName,
                        base64Data: file.base64Data,
                        contentType: file.fileType,
                        docType: docType
                    })
                );
            }
            await Promise.all(uploadPromises);

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Files uploaded successfully',
                    variant: 'success'
                })
            );
            await this.refreshRTWAndDLImages(this.selectedOption);

        } catch (error) {
            console.error('Error in handleUpload:', error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'File upload failed',
                    variant: 'error'
                })
            );
        } finally {
            this.imageLoading = false;
            this.resetFileUploadState();
        }
    }


    resetFileUploadState() {
        this.frontDocFiles = [];
        this.backDocFiles = [];
        this.uploadFiles = [];

        this.showImageCaptureModal = false;
        this.showFileUploadModal = false;
        this.allowedExtension = undefined;

        this.isFileModuleError = false;
        this.fileModuleError = '';

        const child = this.template.querySelector('c-image-capture');
        child?.resetFiles?.();
    }

    // handleRTWFieldChange(event) {
    //     const fieldMap = {
    //         'Citizenship_Immigration_status__c': 'citi_Immi_status',
    //         'Settled_Status__c': 'settledStatus',
    //         'Biometric_Evidence__c': 'biometricEvidence',
    //         'Date_of_Entry__c': 'dateOfEntry'
    //     };
    //     const field = event.target.dataset.field;
    //     this[fieldMap[field]] = event.target.value;
    // }
    handleRTWFieldChange(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;

        /* =========================
        RTW EXPIRY DATE VALIDATION
        ========================= */
        if (field === 'RTW_Expiry_Date__c') {

            const selectedDate = new Date(value);
            selectedDate.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const isBritish =
                this.recordData.Citizenship_Immigration_status__c ===
                'British passport/UK National';

            let errorMessage = '';

            // ❌ Non-British → past date NOT allowed
            if (!isBritish && selectedDate < today) {
                errorMessage = 'Past expiry date is not allowed';
            }

            event.target.setCustomValidity(errorMessage);

            if (!errorMessage) {
                this.expiryDate = value;
            }

            event.target.reportValidity();
            return;
        }

        /* =========================
        OTHER RTW FIELDS
        ========================= */
        switch (field) {

            case 'Access_Code__c':
                this.accessCode = value?.toUpperCase();
                break;

            case 'Right_to_work_document__c':
                this.rtwDoc = value;
                break;

            case 'Settled_Status__c':
                this.settledStatus = value;
                break;

            case 'Biometric_Evidence__c':
                this.biometricEvidence = value;
                break;

            case 'Date_of_Entry__c':
                this.dateOfEntry = value;
                break;

            default:
                break;
        }
    }

    handleRTWPicklistChange(event) {
        const field = event.target.dataset.field;
        const value = event.detail.value;

        switch (field) {
            case 'Citizenship_Immigration_status__c':
                this.editCitizenshipStatus = value;
                break;
            case 'Settled_Status__c':
                this.editSettledStatus = value;
                break;
            case 'Biometric_Evidence__c':
                this.editBiometric = value;
                break;
            case 'Right_to_work_document__c':
                this.editRTWDocument = value;
                break;
        }
    }

    // new
    showTimeLimitedSection = false;
    showRestrictionsSection = false;

    onChangeRTWDetails(event) {

        const fieldName = event.target.name;
        const fieldValue = event.target.value.trim();
        // this.hideValidateContent = false;
        // this.rightToWorkNotShowVerified = true;
        if (fieldName === 'typeOfEVisa') {
            this.recordData.Type_of_e_visa__c = fieldValue;
            if (fieldValue === 'Continuous right to work') {
                this.showTimeLimitedSection = false;
                this.showRestrictionsSection = false;
                this.recordData.Permission_Expiry_Date__c = null;
                this.recordData.Any_work_restrictions__c = null;
                this.recordData.Limited_To_X_Hours_Per_Week__c = null;
                this.recordData.Limited_To_Specific_Job_Types__c = null;
                this.recordData.Other_Restrictions__c = null;
            }
            if (fieldValue === 'Time-limited right to work') {
                this.showTimeLimitedSection = true;
            }
        }

        /* -------- ANY WORK RESTRICTIONS -------- */

        if (fieldName === 'anyWorkRestrictions') {
            this.recordData.Any_work_restrictions__c = fieldValue;
            if (fieldValue === 'Yes') {
                this.showRestrictionsSection = true;
            } else {
                this.showRestrictionsSection = false;
                this.recordData.Limited_To_X_Hours_Per_Week__c = null;
                this.recordData.Limited_To_Specific_Job_Types__c = null;
                this.recordData.Other_Restrictions__c = null;
            }
        }
        if (fieldName === 'limitedHours') {
            this.recordData.Limited_To_X_Hours_Per_Week__c = fieldValue;
        }

        if (fieldName === 'specificJobs') {
            this.recordData.Limited_To_Specific_Job_Types__c = fieldValue;
        }

        if (fieldName === 'otherRestrictions') {
            this.recordData.Other_Restrictions__c = fieldValue;
        }
        if (fieldName === 'PermissionexpiryDate') {
            this.recordData.Permission_Expiry_Date__c = fieldValue;
        }
        // if (fieldName == 'expiryDate') {

        //     if (event.target.dataset.passvalidation === 'true') {
        //         event.target.setCustomValidity("");
        //         this.data[contractorIndex].expiryDate = fieldValue;
        //         event.target.reportValidity();
        //         return;
        //     }
        //     const selectedDate = new Date(fieldValue);
        //     const minDate = new Date();
        //     minDate.setHours(0, 0, 0, 0);
        //     if (selectedDate < minDate) {
        //         event.target.setCustomValidity("Past date is not allowed.");
        //     } else {
        //         event.target.setCustomValidity("");
        //         this.data[contractorIndex].expiryDate = fieldValue;
        //     }
        //     event.target.reportValidity();
        // }
    }

    handleRTWEditOpen() {
        this.rtwEditOpen = true;
        this.showRTWFileUploadButton = true;
        this.selectedOption = 'RTW';

        // this.citi_Immi_status = this.recordData.Citizenship_Immigration_status__c;
        // this.settledStatus = this.recordData.Settled_Status__c;
        // this.biometricEvidence = this.recordData.Biometric_Evidence__c;
        this.dateOfEntry = this.recordData.Date_of_Entry__c;
        // this.rtwDoc = this.recordData.Right_to_work_document__c;

        this.editCitizenshipStatus = this.recordData.Citizenship_Immigration_status__c;
        this.editSettledStatus = this.recordData.Settled_Status__c;
        this.editBiometric = this.recordData.Biometric_Evidence__c;
        this.editRTWDocument = this.recordData.Right_to_work_document__c;

        this.showRTWExpiryDate = this.recordData.hasOwnProperty('RTW_Expiry_Date__c') && this.recordData.RTW_Expiry_Date__c !== null ? true : false;
        this.selectedContractorId = this.recordId;
        this.showFrontBackRadioBtn = false;
        if (this.recordData.hasAccessCode) {
            this.showRTWAccessCode = true;
            // this.showRTWExpiryDate = false;
            this.accessCode = this.recordData.Access_Code__c;
        } else {
            this.showRTWAccessCode = false;
            // this.showRTWExpiryDate = true;
            this.expiryDate = this.recordData.RTW_Expiry_Date__c;
        }
    }

    async handleSaveRTW() {
        const isBritish =
            this.recordData.Citizenship_Immigration_status__c ===
            'British passport/UK National';
        if (this.showRTWExpiryDate && this.expiryDate) {
            const selectedDate = new Date(this.expiryDate);
            selectedDate.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (!isBritish && selectedDate < today) {
                this.showToast(
                    'Error',
                    'Past expiry date is not allowed.',
                    'error'
                );
                return;
            }
        }

        // Build list of document types for the selected RTW document
        let documentTypeList = [];
        const citizenType = this.recordData?.Citizenship_Immigration_status__c;
        const selectedDocValue = this.recordData?.Right_to_work_document__c;
        if (citizenType && selectedDocValue && this.allowedRTWOptions[citizenType]) {
            const docs = this.allowedRTWOptions[citizenType];
            const match = docs.find(d => d.value === selectedDocValue);
            if (match && Array.isArray(match.documentType)) {
                documentTypeList = match.documentType;
            }
        }
        // expose to component state if needed elsewhere
        // this.selectedRTWDocumentTypes = documentTypeList;

        let updateData = {
            Id: this.recordId,
            Date_of_Entry__c: this.dateOfEntry,
            Citizenship_Immigration_status__c: this.editCitizenshipStatus,
            Settled_Status__c: this.editSettledStatus,
            Biometric_Evidence__c: this.editBiometric,
            Right_to_work_document__c: this.editRTWDocument,
            RTW_Expiry_Date__c: this.expiryDate,
            Type_of_e_visa__c: this.recordData.Type_of_e_visa__c,
            Permission_Expiry_Date__c: this.recordData.Permission_Expiry_Date__c ? this.recordData.Permission_Expiry_Date__c : null,
            Any_work_restrictions__c: this.recordData.Any_work_restrictions__c ? this.recordData.Any_work_restrictions__c : null,
            Limited_To_X_Hours_Per_Week__c: this.recordData.Limited_To_X_Hours_Per_Week__c ? this.recordData.Limited_To_X_Hours_Per_Week__c : null,
            Limited_To_Specific_Job_Types__c: this.recordData.Limited_To_Specific_Job_Types__c ? this.recordData.Limited_To_Specific_Job_Types__c : null,
            Other_Restrictions__c: this.recordData.Other_Restrictions__c ? this.recordData.Other_Restrictions__c : null,
            is_Right_to_Work_Verify__c: true,
            RTW_Verified_by__c: this.verifiedRTWName
        };

        if (this.showRTWAccessCode) {
            if (!this.accessCode) {
                this.showToast('Error', 'Access Code is required', 'error');
                return;
            }
            updateData.Access_Code__c = this.accessCode;
            updateData.RTW_Expiry_Date__c = null;
        }

        console.log('hasShareCode:', this.recordData.hasShareCode);

        if (this.recordData.hasShareCode && this.recordData.Type_of_e_visa__c === 'Time-limited right to work') {
            console.log('permissoin--->>> ', this.recordData.Permission_Expiry_Date__c)
            if (!this.recordData.Permission_Expiry_Date__c) {
                this.showToast('Error', 'Permission Expiry Date is required.', 'error');
                return;
            }

            if (!this.recordData?.Any_work_restrictions__c) {
                this.showToast('Error', 'Any Work Restrictions is required.', 'error');
                return;
            }

            if (this.recordData.Any_work_restrictions__c === 'Yes') {
                const hours = this.recordData.Limited_To_X_Hours_Per_Week__c;

                if (hours === null || hours === undefined || hours === '') {
                    this.showToast('Error', 'Limited To X Hours Per Week is required.', 'error');
                    return;
                }

                const hoursNumber = Number(hours);
                if (isNaN(hoursNumber)) {
                    this.showToast('Error', 'Please enter a valid number.', 'error');
                    return;
                }

                if (hoursNumber < 0 || hoursNumber > 168) {
                    this.showToast('Error', 'Hours must be between 0 and 168.', 'error');
                    return;
                }

                if (!this.recordData?.Limited_To_Specific_Job_Types__c) {
                    this.showToast('Error', 'Limited To Specific Job Types are required.', 'error');
                    return;
                }

                if (!this.recordData?.Other_Restrictions__c) {
                    this.showToast('Error', 'Other Restrictions is required.', 'error');
                    return;
                }
            }
        }

        if (documentTypeList.length == 2 && !this.hasFrontRTWImage && !this.hasBackRTWImage && !this.tempFrontFiles.length && !this.tempBackFiles.length) {
            this.showToast('Error', 'Please upload the required Right to Work documents before saving.', 'error');
            return;
        }

        if (documentTypeList.length == 1 && !this.hasFrontRTWImage && !this.hasRTWCheckImage && !this.tempFrontFiles.length) {
            this.showToast('Error', 'Please upload the required Right to Work document before saving.', 'error');
            return;
        }

        if (!this.isRTWVerfiedCheck) {
            this.showToast('Error', 'Please verify the Right to Work before saving.', 'error');
            return;
        }

        if (this.isRTWVerfiedCheck && !this.verifiedRTWName) {
            this.showToast('Error', 'Please provide the name of the person who verified the Right to Work.', 'error');
            return;
        }


        // if (!isBritish || (isBritish && this.recordData?.Right_to_work_document__c === 'British passport')) {

        //     if (this.showRTWExpiryDate) {
        //         if (!this.expiryDate) {
        //             this.showToast('Error', 'Expiry Date is required', 'error');
        //             return;
        //         }
        //         updateData.RTW_Expiry_Date__c = this.expiryDate;
        //         updateData.Access_Code__c = null;
        //     }
        // }

        try {
            this.imageLoading = true;

            await updateAccountClient({
                selectedContractorToUpdate: updateData
            });

            if (this.tempFrontFiles?.length) {
                await this.commitUploadedFiles();
            }

            await this.refreshRTWAndDLImages('RTW');

            this.recordData = {
                ...this.recordData,
                ...updateData,
                hasAccessCode: !!updateData.Access_Code__c,
                hasExpiryDate: updateData.RTW_Expiry_Date__c ? true : false
            };

            this.showToast('Success', 'Right to Work updated successfully', 'success');
            this.handleRTWCancel();

        } catch (error) {
            console.error(error);
            this.showToast('Error', 'Failed to update Right to Work', 'error');
        } finally {
            this.imageLoading = false;
        }
    }
    // handleRequestNewEvidence(event) {

    //     const recordId = event.target.dataset.selectedId;

    //     sendVerificationLinkEmail({ applicationId: recordId })
    //         .then(() => {
    //             this.dispatchEvent(
    //                 new ShowToastEvent({
    //                     title: 'Success',
    //                     message: 'Verification email sent successfully.',
    //                     variant: 'success'
    //                 })
    //             );

    //         })
    //         .catch(error => {
    //             let errorMessage = 'Error sending verification email';
    //             if (error?.body?.message) {
    //                 errorMessage = error.body.message;
    //             }
    //             this.dispatchEvent(
    //                 new ShowToastEvent({
    //                     title: 'Error',
    //                     message: errorMessage,
    //                     variant: 'error'
    //                 })
    //             );

    //             console.error(error);
    //         });
    // }

    handleRTWCancel() {
        this.rtwEditOpen = false;
        this.showRTWExpiryDate = false;
        this.showRTWAccessCode = false;
        this.showRTWFileUploadButton = false;
        this.tempFrontFiles = [];
        this.tempBackFiles = [];
        this.refreshRTWAndDLImages('RTW');
    }

    onChangeRTWField(event) {
        if (event.target.name !== 'expiryDate') return;

        this.expiryDate = event.target.value;

        const selectedDate = new Date(this.expiryDate);
        selectedDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isBritish =
            this.recordData.Citizenship_Immigration_status__c ===
            'British passport/UK National';

        let errorMessage = '';
        if (!isBritish && selectedDate < today) {
            errorMessage =
                'Past dates is not allowed';
        }

        event.target.setCustomValidity(errorMessage);
        event.target.reportValidity();
    }


    async refreshRTWAndDLImages(fileType) {
        this.imageLoading = true;

        try {
            const result = await getRTWandDLfiles({
                accountId: this.recordId,
                fileType: fileType
            });
            console.log('result--->', result);
            if (result) {
                this.imagesAvailable = true;
                this.imagesNotAvailable = false;

                if (fileType === 'RTW') {
                    this.hasFrontRTWImage = !!result.Front;
                    this.hasBackRTWImage = !!result.Back;
                    this.hasRTWCheckImage = !!result.Check;

                    this.rtwFrontImage = result.Front;
                    this.rtwBackImage = result.Back;
                    this.rtwCheckImage = result.Check;
                }

                if (fileType === 'DL') {
                    this.hasFrontDLImage = !!result.Front;
                    this.hasBackDLImage = !!result.Back;

                    this.dlFrontImage = result.Front;
                    this.dlBackImage = result.Back;
                }
            } else {
                this.imagesAvailable = false;
                this.imagesNotAvailable = true;
            }
        } catch (e) {
            this.imagesAvailable = false;
            this.imagesNotAvailable = true;
        } finally {
            this.imageLoading = false;
        }
    }
    get haveAnyCode() {
        return (this.recordData?.hasShareCode || this.recordData?.hasAccessCode);
    }
    async commitUploadedFiles() {
        const filesToUpload = [
            ...this.tempFrontFiles,
            ...this.tempBackFiles
        ];

        if (!filesToUpload.length) return;

        for (const file of filesToUpload) {

            let docType;
            let fileTitle;
            if (this.selectedOption === 'RTW') {

                if (this.recordData.hasAccessCode || this.recordData.hasShareCode) {
                    docType = 'Right To Work Check';
                    fileTitle = `${this.recordData.Client_Name__c}_RTW_Check`;
                } else {
                    docType =
                        file.docType === 'Front'
                            ? 'Right To Work Front'
                            : 'Right To Work Back';

                    fileTitle = `${this.recordData.Client_Name__c}_RTW_${file.docType}`;
                }
            }
            if (this.selectedOption === 'DL') {

                docType =
                    file.docType === 'Front'
                        ? 'Driving License Front'
                        : 'Driving License Back';

                fileTitle = `${this.recordData.Client_Name__c}_DL_${file.docType}`;
            }

            await saveUplodededFiles({
                parentId: this.recordId,
                fileName: fileTitle,
                base64Data: file.base64Data,
                contentType: file.fileType,
                docType: docType
            });
        }
        this.tempFrontFiles = [];
        this.tempBackFiles = [];
    }



}