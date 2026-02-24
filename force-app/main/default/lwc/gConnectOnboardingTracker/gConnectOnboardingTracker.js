import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getUserContact from '@salesforce/apex/AccountMainContractorController.getUserContact';
import getMCandSCDetails from '@salesforce/apex/AccountMainContractorController.getMCandSCDetails';
import updateAccountClient from '@salesforce/apex/AccountMainContractorController.updateAccountClient';
import getMCDepotDetails from '@salesforce/apex/AccountMainContractorController.getMCDepotDetails';
import getEndUserMCDepotDetails from '@salesforce/apex/AccountMainContractorController.getEndUserMCDepotDetails';
import getRolePicklistValues from '@salesforce/apex/AccountMainContractorController.getRolePicklistValues';
import getRTWandDLfiles from '@salesforce/apex/AccountMainContractorController.getRTWandDLfiles';
import saveUplodededFiles from '@salesforce/apex/ImageUploaderController.saveUplodededFiles';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getMultiplePicklistValues from '@salesforce/apex/ConnectAppController.getMultiplePicklistValues';


import MC_Site_URL from '@salesforce/label/c.MC_Site_URL';

import { CurrentPageReference } from 'lightning/navigation';

import USER_ID from "@salesforce/user/Id";
import HEADER_ICONS from '@salesforce/resourceUrl/Header_Icons';
import ON_BOARDING_ICONS from '@salesforce/resourceUrl/onBoardingIcons';

export default class GConnectOnboardingTracker extends NavigationMixin(LightningElement) {

    @api recordId;
    @track data = [];
    @track originalData = [];

    MC_Site_URL = MC_Site_URL;

    @track pdfIcon = `${HEADER_ICONS}/HeaderIcons/PDF.png`;

    @track fileUploadIcon = `${HEADER_ICONS}/HeaderIcons/FileUpload.png`;
    @track ascDscIcon = `${HEADER_ICONS}/HeaderIcons/AscDsc.png`;
    @track recordMenuIcon = `${HEADER_ICONS}/HeaderIcons/RecordMenu.png`;
    @track editIcon = `${HEADER_ICONS}/HeaderIcons/Edit.png`;

    // Onboarding Task Icons
    @track toxicDarkGrey = `${ON_BOARDING_ICONS}/onBoardingIcons/Dark_Grey_Toxicology.png`;
    @track toxicYellow = `${ON_BOARDING_ICONS}/onBoardingIcons/Yellow_Toxicology.png`;
    @track toxicGreen = `${ON_BOARDING_ICONS}/onBoardingIcons/Green_Toxicology.png`;
    @track toxicRed = `${ON_BOARDING_ICONS}/onBoardingIcons/Dark_Red_Toxicology.png`;

    @track backCheckDarkGrey = `${ON_BOARDING_ICONS}/onBoardingIcons/Dark_Grey_Background_check.png`;
    @track backCheckYellow = `${ON_BOARDING_ICONS}/onBoardingIcons/Yellow_Background_check.png`;
    @track backCheckGreen = `${ON_BOARDING_ICONS}/onBoardingIcons/Green_Background_check.png`;
    @track backCheckRed = `${ON_BOARDING_ICONS}/onBoardingIcons/Dark_Red_Background_check.png`;

    @track licenceLightGrey = `${ON_BOARDING_ICONS}/onBoardingIcons/Light_Driving_Licence.png`;
    @track licencekYellow = `${ON_BOARDING_ICONS}/onBoardingIcons/Yellow_Driving_Licence.png`;
    @track licenceGreen = `${ON_BOARDING_ICONS}/onBoardingIcons/Green_Driving_Licence.png`;
    @track licenceLightRed = `${ON_BOARDING_ICONS}/onBoardingIcons/Light_Red_Driving_Licence.png`;
    @track licenceRed = `${ON_BOARDING_ICONS}/onBoardingIcons/Dark_Red_Driving_Licence.png`;

    @track rtwLightGrey = `${ON_BOARDING_ICONS}/onBoardingIcons/Light_Grey_Right_to_work.png`;
    @track rtwYellow = `${ON_BOARDING_ICONS}/onBoardingIcons/Yellow_Right_to_work.png`;
    @track rtwGreen = `${ON_BOARDING_ICONS}/onBoardingIcons/Green_Right_to_work.png`;
    @track rtwLightRed = `${ON_BOARDING_ICONS}/onBoardingIcons/Light_Red_Right_to_work.png`;
    @track rtwRed = `${ON_BOARDING_ICONS}/onBoardingIcons/Dark_Red_Right_to_work.png`;

    @track signedLightGrey = `${ON_BOARDING_ICONS}/onBoardingIcons/Light_Grey_Contracts_Signed.png`;
    @track signedYellow = `${ON_BOARDING_ICONS}/onBoardingIcons/Yellow_Contracts_Signed.png`;
    @track signedGreen = `${ON_BOARDING_ICONS}/onBoardingIcons/Green_Contracts_Signed.png`;

    @track completeLightGrey = `${ON_BOARDING_ICONS}/onBoardingIcons/Light_Grey_Onboarding_Complate.png`;
    @track completeYellow = `${ON_BOARDING_ICONS}/onBoardingIcons/Yellow_Onboarding_Complate.png`;
    @track completeGreen = `${ON_BOARDING_ICONS}/onBoardingIcons/Green_Onboarding_Complate.png`;


    @track collectDetails = {};
    @track depotList = [];
    @track depotOptions = [];
    @track relatedDepotOptions = [];
    @track selectedDepotName;
    @track roleOptions = [];
    @track error;
    @track contactId;
    selectedTabLabel;
    isOnboardingActive = true;
    @track visibleNewContractorModal = false;
    @track isBackgroundCheckModelOpen = false;
    @track isToxicologyModelOpen = false;
    @track isContractsModelOpen = false;
    @track isEvidenceCompleteModelOpen = false;
    @track siteNameOption = [];
    @track isToxicCheck = false;
    @track isContractsCheck = false;
    @track isEvidenceComplete = false;
    @track selectedContractor = {};
    @track selectedContractorId;
    @track visibleUploadSection = false;
    @track backGroundCheckVar = null;
    @track toxicologyCheckVar = null;

    @track parsedResultForDepot = [];
    SelectEndUser;
    selectDepot;
    selectedRole;
    @track currentIndex;
    @track isIncidentModalOpen = false;
    @track isConfirmModalOpen = false;
    @track confirmAction = null;
    @track scStatusList = ['Onboarding', 'Onboarding Initiated', 'Contracts Pending', 'Contracts Sent', 'Documents Completed'];

    @track selectedDriverId;
    @track openDisengageConfirm = false;
    @track uploadSectionName;
    @track sectionTitle;
    @track isToxicologyColumn = false;
    @track isBackgroundCheckColumn = false

    @track SearchName;
    @track selectedValueEndUser;
    @track selectedValueDepot;
    @track selectedValueRole;

    @track globalSearchValue = null;

    // RTW and DL Button ------
    @track isRightToWorkModalOpen = false;
    @track rtwNoDataSectionModal = false;
    @track isDrivingLicenseModelOpen = false;
    @track dlNoDataSectionModal = false;
    @track isFileModuleError = false;
    @track fileModuleError = '';
    @track rightToWorkEditOpen = false;
    @track rightToWorkNotShowVerified = true;
    @track drivingLicenseEditOpen = false;
    @track drivingLicenseNotShowVerified = true;

    @track selectedContractorName;

    @track hideValidateContent = false;
    @track hideValidateButton = false;
    @track showExpiredError = false

    @track hideDLValidateContent = false;
    @track hideDLValidateButton = false;
    @track showDLExpiredError = false;

    @track imageLoading = true;
    @track imagesNotAvailable = false;
    @track imagesAvailable = false;

    @track showFileUploadButton = false;
    @track selectedOption;
    @track fileErrorMessage = false;

    @track isFileUploadOpned = false;
    @track showImageCaptureModal = false;
    @track showFileUploadModal = false;
    @track showProfileUploadModal = false;

    @track frontDocFiles = [];
    @track backDocFiles = [];
    @track uploadFiles = [];

    @track isDLVerfiedCheck = false;
    @track verifiedDLName = null;
    @track allowedExtension;

    @track isRTWVerfiedCheck = false;
    @track verifiedRTWName = null;

    @track showValidateError = false;
    @track showDLValidateError = false;

    @track currentPage = 1;
    @track recordsPerPage = 25;

    @track licenseTypes_option = [];
    @track licenseCategory_option = [];
    @track applyLicenseNumberValidation = false;
    @track recordBasedLicenseCategory = [];

    @track showFrontBackRadioBtn = true;

    // @track isRTWCheckFileUploded = false;
    @track isRTWCheckFileUploded = true;
    @track showRTWCheckError = false;
    @track uplodedRTWCVId = null;
    @track uploadedRTWCheckFiles = null;
    @track isImage = false;
    @track isPreviewEnabled = false;
    @track filePreviewUrl;

    @track noRecordFound = false;
    @track complianceFilter;

    // New UI RTW
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

    @track documentNames = [];
    @track restrictedStatuses = ['British passport/UK National', 'EU/EEA/Swiss Citizen', 'Rest Of The World'];

    @wire(CurrentPageReference)
    getPageParameters(currentPageReference) {
        if (currentPageReference) {
            if (this.originalData != null) {
                this.data = [...this.originalData];
            }
            this.globalSearchValue = currentPageReference.state.name;

            if (this.globalSearchValue != null && this.data != null) {
                this.data = this.data.filter(contractor => {
                    const nameMatch = !this.globalSearchValue.toLowerCase() || contractor.Client_Name__c.toLowerCase().includes(this.globalSearchValue.toLowerCase());
                    return nameMatch;
                });
            }
            if (currentPageReference.state.complianceFilter != null) {
                this.complianceFilter = currentPageReference.state.complianceFilter;
                this.complianceFilterSearch();
            }
        }
    }
    // new options
    @track rtwDocument_option;
    @track citizenStatus_option;
    @track typeOfVisa_option;
    @track anyWorkRestrictions_option;

    @wire(getMultiplePicklistValues, { objectName: 'Account', fieldNames: ['Type_of_licence__c', 'Additional_licence_categories__c', 'Right_to_work_document__c', 'Citizenship_Immigration_status__c', 'Type_of_e_visa__c', 'Any_work_restrictions__c'] })
    wiredPicklistOptions({ error, data }) {
        if (data) {
            if (data.Type_of_licence__c) {
                this.licenseTypes_option = data.Type_of_licence__c.map(value => {
                    return { label: value, value: value };
                });
            }
            if (data.Additional_licence_categories__c) {
                this.licenseCategory_option = data.Additional_licence_categories__c.map(value => {
                    return { label: value, value: value };
                });
            }
            if (data.Right_to_work_document__c) {
                this.rtwDocument_option = data.Right_to_work_document__c.map(value => {
                    return { label: value, value: value };
                });
            }
            if (data.Citizenship_Immigration_status__c) {
                this.citizenStatus_option = data.Citizenship_Immigration_status__c.map(value => {
                    return { label: value, value: value };
                });
            }
            if (data.Type_of_e_visa__c) {
                this.typeOfVisa_option = data.Type_of_e_visa__c.map(value => {
                    return { label: value, value: value };
                });
            }
            if (data.Any_work_restrictions__c) {
                this.anyWorkRestrictions_option = data.Any_work_restrictions__c.map(value => {
                    return { label: value, value: value };
                });
            }
        } else if (error) {
            console.error('Error in getting Picklist Values:', error);
        }
    }



    tabs = [
        { id: 1, label: "Onboarding Details", isActive: true }
    ]

    get totalPages() {
        return Math.ceil(this.data.length / this.recordsPerPage);
    }

    get paginatedData() {
        const startIndex = (this.currentPage - 1) * this.recordsPerPage;
        const endIndex = startIndex + this.recordsPerPage;
        return this.data.slice(startIndex, endIndex);
    }

    get disableNextButton() {
        return this.currentPage === this.totalPages;
    }

    get disablePreviousButton() {
        return this.currentPage === 1;
    }

    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage = this.currentPage + 1;
        }
    }

    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage = this.currentPage - 1;
        }
    }

    handleOnchangeInput(event) {
        const inputPage = Number(event.target.value);


        // Check if the "Enter" key was pressed
        if (event.key === 'Enter') {
            if (inputPage >= 1 && inputPage <= this.totalPages) {
                this.currentPage = inputPage; // Navigate to the entered page
            } else {
                // Optionally, reset the input or show an error if the page number is invalid
                event.target.value = this.currentPage;
            }
        }
    }

    get showNameNi() {
        return (
            this.selectedContractor?.clientName ||
            this.selectedContractor?.nationalInsurance
        );
    }

    FetchMCandSCDetails() {
        this.isLoading = true;
        getMCandSCDetails({ contactId: this.contactId, scStatusList: this.scStatusList })
            .then(result => {

                if (result == null) {
                    this.noRecordFound = true;
                    this.isLoading = false;
                    return;
                }

                this.originalData = JSON.parse(JSON.stringify(result));
                this.data = [...this.originalData];



                for (let x in this.data) {

                    this.data[x].hasAccessCode = this.data[x].hasOwnProperty('Access_Code__c') && this.data[x].Access_Code__c !== null ? true : false;
                    this.data[x].hasShareCode = this.data[x].hasOwnProperty('Share_Code__c') && this.data[x].Share_Code__c !== null ? true : false;
                    this.data[x].hasSettledStatus = this.data[x].hasOwnProperty('Settled_Status__c') && this.data[x].Settled_Status__c !== null ? true : false;
                    this.data[x].hasBiometric = this.data[x].hasOwnProperty('Biometric_Evidence__c') && this.data[x].Biometric_Evidence__c !== null ? true : false;
                    this.data[x].hasEntryDate = this.data[x].hasOwnProperty('Date_of_Entry__c') && this.data[x].Date_of_Entry__c !== null ? true : false;
                    this.data[x].hasRTWDoc = this.data[x].hasOwnProperty('Right_to_work_document__c') && this.data[x].Right_to_work_document__c !== null ? true : false;
                    this.data[x].hasExpiryDate = this.data[x].hasOwnProperty('RTW_Expiry_Date__c') && this.data[x].RTW_Expiry_Date__c !== null ? true : false;


                    // new
                    this.data[x].hasEVisa = this.data[x].hasOwnProperty('Type_of_e_visa__c') && this.data[x].Type_of_e_visa__c !== null ? true : false;
                    this.data[x].hasPermissionExpiryDate = this.data[x].hasOwnProperty('Permission_Expiry_Date__c') && this.data[x].Permission_Expiry_Date__c !== null ? true : false;
                    this.data[x].hasAnyWorkRestrictions = this.data[x].hasOwnProperty('Any_work_restrictions__c') && this.data[x].Any_work_restrictions__c !== null ? true : false;
                    this.data[x].hasLimitedToSpecificJobTypes = this.data[x].hasOwnProperty('Limited_To_Specific_Job_Types__c') && this.data[x].Limited_To_Specific_Job_Types__c !== null ? true : false;
                    this.data[x].hasLimitedToHoursPerWeek = this.data[x].hasOwnProperty('Limited_To_X_Hours_Per_Week__c') && this.data[x].Limited_To_X_Hours_Per_Week__c !== null ? true : false;
                    this.data[x].hasOtherRestrictions = this.data[x].hasOwnProperty('Other_Restrictions__c') && this.data[x].Other_Restrictions__c !== null ? true : false;


                    this.data[x].hasProfilePic = this.data[x].hasOwnProperty('ProfilePic_Base64') && this.data[x].ProfilePic_Base64 !== null ? true : false;
                    this.data[x].visibleRecordMenu = false;
                    this.data[x].expressionPass = false;
                    this.data[x].expressionFail = false;
                    this.data[x].expressionPassTox = false;
                    this.data[x].expressionFailTox = false;


                    this.data[x].nationalInsurance = this.data[x].hasOwnProperty('National_Insurance_Number__c') && this.data[x].National_Insurance_Number__c !== null ? this.data[x].National_Insurance_Number__c : '';
                    this.data[x].clientName = this.data[x].hasOwnProperty('Client_Name__c') && this.data[x].Client_Name__c !== null ? this.data[x].Client_Name__c : '';

                    this.data[x].bypassValidation = this.data[x].hasOwnProperty('Citizenship_Immigration_status__c') && this.data[x].Citizenship_Immigration_status__c === 'British passport/UK National';


                    if (this.data[x].Is_Existing_Driver__c == true && this.data[x].SC_Status__c == 'Onboarding Initiated') {
                        this.data[x].engageButtonDisable = false;
                    } else if (this.data[x].Is_Existing_Driver__c == false && this.data[x].SC_Status__c == 'Documents Completed') {
                        this.data[x].engageButtonDisable = false;
                    } else {
                        this.data[x].engageButtonDisable = true;
                    }


                    if (this.data[x].isBackground_Check__c == true) {
                        this.isBackgroundCheckColumn = true
                        this.data[x].BackCheckNotAvailable = false;
                    }
                    if (this.data[x].isToxicology_Validate__c == true) {
                        this.isToxicologyColumn = true
                        this.data[x].ToxicNotAvailable = false;
                    }

                    if (this.data[x].isBackground_Check__c == true && this.data[x].Background_Check_Status__c == 'Passed') {
                        this.data[x].BackCheckStatus = true;
                        this.data[x].expressionPass = true;
                    }
                    if (this.data[x].isBackground_Check__c == true && this.data[x].Background_Check_Status__c == 'Fail') {
                        this.data[x].BackCheckStatus = true;
                        this.data[x].expressionFail = true;
                    }

                    if (this.data[x].isToxicology_Validate__c == true && this.data[x].Toxicology_Status__c == 'Passed') {
                        this.data[x].ToxicologyCheckStatus = true;
                        this.data[x].expressionPassTox = true;
                    }
                    if (this.data[x].isToxicology_Validate__c == true && this.data[x].Toxicology_Status__c == 'Fail') {
                        this.data[x].ToxicologyCheckStatus = true;
                        this.data[x].expressionFailTox = true;
                    }

                    //Onbording Task Progress
                    if (this.data[x].hasOwnProperty('Type_of_e_visa__c') && this.data[x].Type_of_e_visa__c == 'Time-limited right to work') {
                        this.data[x].showTimeLimitedSection = true;
                    } else {
                        this.data[x].showTimeLimitedSection = false;
                    }

                    if (this.data[x].hasOwnProperty('Any_work_restrictions__c') && this.data[x].Any_work_restrictions__c == 'Yes') {
                        this.data[x].showRestrictionsSection = true;
                    } else {
                        this.data[x].showRestrictionsSection = false;
                    }

                    // -- Toxicology -- //
                    if (this.data[x].hasOwnProperty('isToxicology_Validate__c') && this.data[x].isToxicology_Validate__c) {
                        if (this.data[x].hasOwnProperty('Toxicology_Status__c')) {
                            if (this.data[x].Toxicology_Status__c == 'Passed') {
                                this.data[x].ToxicologyProgressIcon = this.toxicGreen;
                            }
                            if (this.data[x].Toxicology_Status__c == 'Fail') {
                                this.data[x].ToxicologyProgressIcon = this.toxicRed;
                            }
                        } else {
                            this.data[x].ToxicologyProgressIcon = this.toxicYellow;
                        }
                    } else {
                        this.data[x].ToxicologyProgressIcon = this.toxicDarkGrey;
                    }

                    // -- Background Check -- //
                    if (this.data[x].hasOwnProperty('isBackground_Check__c') && this.data[x].isBackground_Check__c) {
                        if (this.data[x].hasOwnProperty('Background_Check_Status__c')) {
                            if (this.data[x].Background_Check_Status__c == 'Passed') {
                                this.data[x].BackCheckProgressIcon = this.backCheckGreen;
                            }
                            if (this.data[x].Background_Check_Status__c == 'Fail') {
                                this.data[x].BackCheckProgressIcon = this.backCheckRed;
                            }
                        } else {
                            this.data[x].BackCheckProgressIcon = this.backCheckYellow;
                        }
                    } else {
                        this.data[x].BackCheckProgressIcon = this.backCheckDarkGrey;
                    }

                    // -- Driving Licence -- //
                    if (this.data[x].SC_Status__c == 'Onboarding' || (!this.data[x].hasOwnProperty('Driving_Licence_Number__c') || this.data[x].Driving_Licence_Number__c == null)) {
                        this.data[x].LiceceProgressIcon = this.licenceLightGrey;
                    } else {
                        if (this.data[x].isDriving_License_Verify__c) {
                            this.data[x].LiceceProgressIcon = this.licenceGreen;
                        } else {
                            this.data[x].LiceceProgressIcon = this.licencekYellow;
                        }
                        if (this.data[x].hasOwnProperty('Driving_Licence_Expiry_Date__c') && this.data[x].Driving_Licence_Expiry_Date__c) {
                            if (this.checkDLandRTWExpiry(this.data[x].Driving_Licence_Expiry_Date__c) == 'expiring') {
                                this.data[x].LiceceProgressIcon = this.licenceLightRed;
                            }
                            if (this.checkDLandRTWExpiry(this.data[x].Driving_Licence_Expiry_Date__c) == 'expired') {
                                this.data[x].LiceceProgressIcon = this.licenceRed;
                            }

                        }
                    }

                    //-- Driving License -- Button --//
                    this.data[x].isDLExpiring = false;
                    this.data[x].isDLExpired = false;
                    this.data[x].drivingLicenseVerify = false;
                    this.data[x].drivingLicenseNotVerify = false;
                    this.data[x].licenseDataNotAvaliable = false;
                    this.data[x].allowDLEdit = false;
                    this.data[x].requiredDLEdit = true;
                    if (this.data[x].hasOwnProperty('Driving_Licence_Number__c') && this.data[x].Driving_Licence_Number__c !== null) {
                        if (this.data[x].Driving_Licence_Expiry_Date__c) {
                            let licenseExpiryStatus = this.checkDLandRTWExpiry(this.data[x].Driving_Licence_Expiry_Date__c);
                            this.data[x].licenseExpiredIn = this.calculateLicenseExpiry(this.data[x].Driving_Licence_Expiry_Date__c);
                            if (licenseExpiryStatus == 'expiring') {
                                this.data[x].isDLExpiring = true;
                                this.data[x].allowDLEdit = true;
                            }
                            if (licenseExpiryStatus == 'expired') {
                                this.data[x].isDLExpired = true;
                                this.data[x].allowDLEdit = true;
                                this.data[x].requiredDLEdit = true;
                            }
                        }
                        if (this.data[x].isDLExpiring == false && this.data[x].isDLExpired == false) {
                            if (this.data[x].isDriving_License_Verify__c) {
                                this.data[x].drivingLicenseVerify = true;
                                this.data[x].allowDLEdit = true;
                            }
                            else {
                                this.data[x].drivingLicenseNotVerify = true;
                                this.data[x].allowDLEdit = true;
                            }
                        }
                    } else {
                        this.data[x].licenseDataNotAvaliable = true;
                    }


                    // -- Right To Work -- //
                    if (this.data[x].SC_Status__c == 'Onboarding' || (!this.data[x].hasOwnProperty('Citizenship_Immigration_status__c') || this.data[x].Citizenship_Immigration_status__c == null)) {
                        this.data[x].RtwProgressIcon = this.rtwLightGrey;
                    } else {
                        if (this.data[x].is_Right_to_Work_Verify__c) {
                            this.data[x].RtwProgressIcon = this.rtwGreen;
                        } else {
                            this.data[x].RtwProgressIcon = this.rtwYellow;
                        }
                        if (!this.data[x].bypassValidation) {
                            if (this.data[x].hasOwnProperty('RTW_Expiry_Date__c') && this.data[x].RTW_Expiry_Date__c) {
                                if (this.checkDLandRTWExpiry(this.data[x].RTW_Expiry_Date__c) == 'expiring') {
                                    this.data[x].RtwProgressIcon = this.rtwLightRed;
                                }
                                if (this.checkDLandRTWExpiry(this.data[x].RTW_Expiry_Date__c) == 'expired') {
                                    this.data[x].RtwProgressIcon = this.rtwRed;
                                }
                            }
                        }

                    }

                    //-- Right TO Work -- Button --//
                    this.data[x].isRTWExpiring = false;
                    this.data[x].isRTWExpired = false;
                    this.data[x].rtwLicenseVerify = false;
                    this.data[x].rtwLicenseNotVerify = false;
                    this.data[x].rtwDataNotAvaliable = false;
                    this.data[x].allowRTWEdit = false;
                    this.data[x].requiredRTWEdit = true;
                    if (this.data[x].hasOwnProperty('Citizenship_Immigration_status__c') && this.data[x].Citizenship_Immigration_status__c !== null) {

                        if (!this.data[x].bypassValidation && this.data[x].RTW_Expiry_Date__c) {
                            let rtwExpiryStatus = this.checkDLandRTWExpiry(this.data[x].RTW_Expiry_Date__c);

                            if (rtwExpiryStatus == 'expiring') {
                                this.data[x].isRTWExpiring = true;
                                this.data[x].allowRTWEdit = true;
                            }

                            if (rtwExpiryStatus == 'expired') {
                                this.data[x].isRTWExpired = true;
                                this.data[x].allowRTWEdit = true;
                                this.data[x].requiredRTWEdit = true;
                            }
                        }

                        if (this.data[x].isRTWExpiring == false && this.data[x].isRTWExpired == false) {
                            if (this.data[x].is_Right_to_Work_Verify__c) {
                                this.data[x].rtwLicenseVerify = true;

                                this.data[x].allowRTWEdit = true;
                            }
                            else {
                                this.data[x].rtwLicenseNotVerify = true;
                                this.data[x].allowRTWEdit = true;
                            }
                        }
                    } else {
                        this.data[x].rtwDataNotAvaliable = true;
                    }


                    // NEW UI RTW
                    let documentNames = [];
                    const status = this.data[x].Citizenship_Immigration_status__c;
                    const documentValue = this.data[x].Right_to_work_document__c;

                    this.data[x].allowRTWEdit = !this.restrictedStatuses.includes(status);

                    let documentLength = 0;

                    if (this.data[x].allowRTWEdit && status && documentValue && this.allowedRTWOptions[status]) {
                        const selectedOption = this.allowedRTWOptions[status].find(option => option.value === documentValue);

                        if (selectedOption && selectedOption.documentType) {
                            documentNames = [...selectedOption.documentType];
                            documentLength = selectedOption.documentType.length;
                        }
                    }

                    this.data[x].doubleRTWImage = documentLength > 1;

                    this.data[x].rtwFrontDocumentName = documentNames[0] || 'Document';
                    this.data[x].rtwBackDocumentName = documentNames[1] || '';


                    // -- Contract Signed -- //
                    if (this.data[x].SC_Status__c == 'Onboarding' || this.data[x].SC_Status__c == 'Onboarding Initiated' || this.data[x].SC_Status__c == 'Contracts Pending') {
                        this.data[x].SignedProgressIcon = this.signedLightGrey;
                    } else if (this.data[x].SC_Status__c == 'Contracts Sent') {
                        this.data[x].SignedProgressIcon = this.signedYellow;
                    } else if (this.data[x].SC_Status__c == 'Documents Completed' || this.data[x].SC_Status__c == 'Engaged') {
                        this.data[x].SignedProgressIcon = this.signedGreen;
                    }

                    // -- Onboarding Coplete -- //
                    if (this.data[x].SC_Status__c == 'Onboarding' || this.data[x].SC_Status__c == 'Onboarding Initiated' || this.data[x].SC_Status__c == 'Contracts Pending') {
                        this.data[x].CompleteProgressIcon = this.completeLightGrey;
                    } else if (this.data[x].SC_Status__c == 'Contracts Sent') {
                        this.data[x].CompleteProgressIcon = this.completeYellow;
                    } else if (this.data[x].SC_Status__c == 'Documents Completed' || this.data[x].SC_Status__c == 'Engaged') {
                        this.data[x].CompleteProgressIcon = this.completeGreen;
                    }

                    if (!(this.data[x].hasOwnProperty('Role__c'))) {
                        this.data[x].Role__c = '';
                    }

                    if (!(this.data[x].hasOwnProperty('End_User_Name__c'))) {
                        this.data[x].End_User_Name__c = '';
                    }

                    if (!(this.data[x].hasOwnProperty('Depot_Name__c'))) {
                        this.data[x].Depot_Name__c = '';
                    }

                }

                if (this.globalSearchValue != null) {
                    this.data = this.data.filter(contractor => {
                        const nameMatch = !this.globalSearchValue.toLowerCase() || contractor.Client_Name__c.toLowerCase().includes(this.globalSearchValue.toLowerCase());
                        return nameMatch;
                    });
                }
                this.data = this.originalData.filter(contractor => {
                    const nameMatch = !this.searchName || contractor.Driver_Name__c.toLowerCase().includes(this.searchName);
                    const endUserMatch = !this.selectEndUser || contractor.End_User_Name__c.toLowerCase().includes(this.selectEndUser);
                    const depotMatch = !this.selectDepot || contractor.Depot_Name__c.toLowerCase().includes(this.selectDepot);
                    const roleMatch = !this.selectedRole || contractor.Role__c.toLowerCase().includes(this.selectedRole);
                    return nameMatch && endUserMatch && depotMatch && roleMatch;
                });

                if (this.complianceFilter != null) {
                    this.complianceFilterSearch();
                }
                this.isLoading = false;

            })
            .catch(error => {
                this.isLoading = false;
                console.log('Error While Fetching the Records-->', error);
            });
    }


    complianceFilterSearch() {
        if (this.data == null || this.data.length == 0) return;

        this.data = this.data.filter(contractor => {
            let isMatch = true;
            if (this.complianceFilter == 'scoreOnboard') {
                isMatch = contractor.SC_Status__c == 'Onboarding' ||
                    contractor.SC_Status__c == 'Onboarding Initiated' ||
                    contractor.SC_Status__c == 'Contracts Pending' ||
                    contractor.SC_Status__c == 'Contracts Sent' ||
                    contractor.SC_Status__c == 'Documents Completed'
                    ;
            }
            return isMatch;
        });

    }

    handleTabClick(event) {
        this.selectedTabLabel = event.target.dataset.tab;
        this.tabs.forEach(tab => {
            this.isActive = tab.label === this.selectedTabLabel;
        });

        const tabItems = this.template.querySelectorAll('.tab');
        tabItems.forEach(item => item.classList.remove('selectedTab'));
        event.currentTarget.classList.add('selectedTab');

        if (this.selectedTabLabel === 'Onboarding Details') {
            this.isOnboardingActive = true;

        }

    }

    adjustIndicator(tabElement) {
        const indicator = this.template.querySelector('.tab-indicator');
        indicator.style.width = tabElement.offsetWidth + 'px';
        indicator.style.transform = `translateX(${tabElement.offsetLeft}px)`;
    }

    openIncidentModal(event) {

        const contractorId = event.target.dataset.id;
        this.selectedContractor = this.data.find(contractor => contractor.id === contractorId);
        this.isIncidentModalOpen = true;

    }

    handleModalClose() {
        this.isIncidentModalOpen = false;
    }

    verifyClickHandle(event) {
        const startIndex = (this.currentPage - 1) * this.recordsPerPage;
        let currentIndex = parseInt(startIndex) + parseInt(event.target.dataset.index);

        this.selectedContractor = JSON.parse(JSON.stringify(this.data[currentIndex]));

        if (event.target.name == 'engage') {
            this.selectedContractor['SC_Status__c'] = 'Engaged';
            this.data[currentIndex].SC_Status__c = 'Engaged';
            if (this.data[currentIndex].SC_Status__c == 'Engaged') {
                this.data[currentIndex].Engage_Status__c = true;
            }

            let changedFields = {
                Id: this.data[currentIndex].Id,
                SC_Status__c: 'Engaged',
                Engage_Status__c: true
            };

            this.callUpdateAccountClient(changedFields);
            this.data = this.data.filter(contractor => {
                return (!contractor.SC_Status__c.toLowerCase().includes('engaged'));
            });

        }

    }

    handleAscDscClick(event) {
        const fieldName = event.currentTarget.dataset.field;
        let sortedData = [...this.data];

        // Toggle between ascending and descending
        const isAscending = this.isAscending;
        this.isAscending = !this.isAscending; // Toggle the state for future sorting

        sortedData.sort((a, b) => {
            let fieldA = a[fieldName];
            let fieldB = b[fieldName];

            if (typeof fieldA === 'string') {
                fieldA = fieldA ? fieldA.toUpperCase() : ''; // Handle case-insensitive sorting for strings
                fieldB = fieldB ? fieldB.toUpperCase() : '';
            }

            if (fieldA < fieldB) {
                return isAscending ? -1 : 1;
            } else if (fieldA > fieldB) {
                return isAscending ? 1 : -1;
            } else {
                return 0;
            }
        });

        this.data = sortedData;
    }
    handleRTWImageError() {
        this.selectedContractor.CheckDoc = undefined;
    }

    verifyCPassFailHandle(event) {
        const startIndex = (this.currentPage - 1) * this.recordsPerPage;
        this.currentIndex = parseInt(startIndex) + parseInt(event.target.dataset.index);
        this.backGroundCheckVar = null;
        this.toxicologyCheckVar = null;

        let fileTypeName = null;

        if (event.target.name === 'RTW') {
            this.isRightToWorkModalOpen = true;
            this.uploadSectionName = 'Right To Work Check';
            this.sectionTitle = 'Right To Work';
            fileTypeName = 'RTW';
        }

        if (event.target.name === 'RTWnoData') {
            this.rtwNoDataSectionModal = true;
        }

        if (event.target.name === 'Driving') {
            this.isDrivingLicenseModelOpen = true;
            fileTypeName = 'DL';
        }

        if (event.target.name === 'DrivingNoData') {
            this.dlNoDataSectionModal = true;
        }


        if (event.target.name == 'passBgCheck') {
            this.uploadSectionName = 'Background Check';
            this.sectionTitle = 'Background';
            this.visibleUploadSection = true;
            this.backGroundCheckVar = 'Passed';
        }

        if (event.target.name == 'failBgCheck') {
            this.uploadSectionName = 'Background Check';
            this.sectionTitle = 'Background';
            this.isConfirmModalOpen = true;
            this.backGroundCheckVar = 'Fail';
            this.confirmAction = 'failBackgroundCheck';
        }

        if (event.target.name == 'passToxicology') {
            this.uploadSectionName = 'Toxicology Check';
            this.sectionTitle = 'Toxicology';
            this.visibleUploadSection = true;
            this.toxicologyCheckVar = 'Passed';
        }

        if (event.target.name == 'failToxicology') {
            this.uploadSectionName = 'Toxicology Check';
            this.sectionTitle = 'Toxicology';
            this.isConfirmModalOpen = true;
            this.toxicologyCheckVar = 'Fail';
            this.confirmAction = 'failToxicology';
        }

        this.selectedContractor = JSON.parse(JSON.stringify(this.data[this.currentIndex]));
        this.selectedContractor['currentClickIndex'] = this.currentIndex;

        this.selectedContractorId = this.selectedContractor.Id;

        this.selectedContractorName = this.selectedContractor.Client_Name__c;

        if (this.selectedContractor['isRTWExpired'] == true) {
            this.hideValidateContent = true;

            if (this.selectedContractor['bypassValidation'] != true) {
                this.showExpiredError = true;
            }
        }
        if (this.selectedContractor['isDLExpired'] == true) {
            this.hideDLValidateContent = true;
            this.showDLExpiredError = true;
        }

        if (this.selectedContractor['rtwLicenseVerify'] == true || this.selectedContractor['isRTWExpiring'] == true) {
            this.hideValidateContent = true;
        }

        if (this.selectedContractor['drivingLicenseVerify'] == true || this.selectedContractor['isDLExpiring'] == true) {
            this.hideDLValidateContent = true;
        }

        if (this.selectedContractor.hasOwnProperty('Additional_licence_categories__c')) {
            this.selectedContractor['Additional_licence_categories__c'] = this.selectedContractor['Additional_licence_categories__c'].split(';');
        }

        this.imageLoading = true;

        if (fileTypeName != null && this.selectedContractorId != null) {
            getRTWandDLfiles({ accountId: this.selectedContractorId, fileType: fileTypeName })
                .then(result => {
                    if (result != null) {
                        this.imageLoading = false;
                        this.imagesAvailable = true;
                        this.imagesNotAvailable = false;

                        this.selectedContractor['FrontDoc'] = result.Front;
                        this.selectedContractor['BackDoc'] = result.Back;
                        this.selectedContractor['CheckDoc'] = result.Check;
                        this.selectedContractor['CheckDocName'] = result.CheckFileName;
                    }
                    else {
                        this.imageLoading = false;
                        this.imagesAvailable = false;
                        this.imagesNotAvailable = true;
                    }

                })
                .catch(error => {
                    console.error('Error calling Apex method', error);
                    this.resultMessage = 'Error occurred: ' + error.body.message;
                });

        } else {
            this.imageLoading = false;
            this.imagesAvailable = false;
            this.imagesNotAvailable = true;
        }

    }

    uploadHandler(event) {

        let changedFields = {
            Id: this.data[this.currentIndex].Id
        };

        if (this.uploadSectionName == 'Right To Work Check' && this.isRTWVerfiedCheck == true &&
            this.data[this.currentIndex].hasAccessCode == true && this.verifiedRTWName != null) {
            this.data[this.currentIndex].is_Right_to_Work_Verify__c = true;
            this.data[this.currentIndex].RTW_Verified_by__c = this.verifiedRTWName;
            this.data[this.currentIndex].rtwLicenseVerify = true;
            this.data[this.currentIndex].rtwLicenseNotVerify = false;

            changedFields.is_Right_to_Work_Verify__c = true;
            changedFields.RTW_Verified_by__c = this.verifiedRTWName;
            changedFields.rtwLicenseVerify = true;
            changedFields.rtwLicenseNotVerify = false;
        }

        if (this.uploadSectionName == 'Background Check' && this.backGroundCheckVar == 'Passed') {
            this.data[this.currentIndex].BackCheckStatus = true;
            this.data[this.currentIndex].expressionPass = true;
            this.data[this.currentIndex].expressionFail = false;
            this.data[this.currentIndex].backGroundCheckVar = this.backGroundCheckVar;
            this.data[this.currentIndex].BackCheckProgressIcon = this.backCheckGreen;

            changedFields.BackCheckStatus = true;
            changedFields.expressionPass = true;
            changedFields.expressionFail = false;
            changedFields.backGroundCheckVar = this.backGroundCheckVar;
            changedFields.BackCheckProgressIcon = this.backCheckGreen;

        }

        if (this.uploadSectionName == 'Toxicology Check' && this.toxicologyCheckVar == 'Passed') {
            this.data[this.currentIndex].ToxicologyCheckStatus = true;
            this.data[this.currentIndex].expressionPassTox = true;
            this.data[this.currentIndex].expressionFailTox = false;
            this.data[this.currentIndex].toxicologyCheckVar = this.toxicologyCheckVar;
            this.data[this.currentIndex].ToxicologyProgressIcon = this.toxicGreen;

            changedFields.ToxicologyCheckStatus = true;
            changedFields.expressionPassTox = true;
            changedFields.expressionFailTox = false;
            changedFields.toxicologyCheckVar = this.toxicologyCheckVar;
            changedFields.ToxicologyProgressIcon = this.toxicGreen;
        }



        this.callUpdateAccountClient(changedFields);
        this.backGroundCheckVar = null;
        this.toxicologyCheckVar = null;


    }

    handleConfirm() {

        const currentDate = new Date().toISOString();

        let changedFields = {
            Id: this.data[this.selectedContractor.currentClickIndex].Id,
            Disengaged_Date__c: currentDate
        };

        if (this.confirmAction == 'failBackgroundCheck') {
            this.data[this.selectedContractor.currentClickIndex].backGroundCheckVar = 'Fail';
            this.data[this.selectedContractor.currentClickIndex].SC_Status__c = 'Failed Onboarding';
            this.data[this.selectedContractor.currentClickIndex].BackCheckStatus = true;
            this.data[this.selectedContractor.currentClickIndex].expressionPass = false;
            this.data[this.selectedContractor.currentClickIndex].expressionFail = true;

            changedFields.backGroundCheckVar = 'Fail';
            changedFields.SC_Status__c = 'Failed Onboarding';
            changedFields.BackCheckStatus = true;
            changedFields.expressionPass = false;
            changedFields.expressionFail = true;


        }
        if (this.confirmAction == 'failToxicology') {
            this.data[this.selectedContractor.currentClickIndex].toxicologyCheckVar = 'Fail';
            this.data[this.selectedContractor.currentClickIndex].SC_Status__c = 'Failed Onboarding';
            this.data[this.selectedContractor.currentClickIndex].ToxicologyCheckStatus = true;
            this.data[this.selectedContractor.currentClickIndex].expressionPassTox = false;
            this.data[this.selectedContractor.currentClickIndex].expressionFailTox = true;

            changedFields.toxicologyCheckVar = 'Fail';
            changedFields.SC_Status__c = 'Failed Onboarding';
            changedFields.ToxicologyCheckStatus = true;
            changedFields.expressionPassTox = false;
            changedFields.expressionFailTox = true;
        }



        this.data[this.selectedContractor.currentClickIndex].Disengaged_Date__c = currentDate;

        this.callUpdateAccountClient(changedFields);
        this.closeModal();
        this.data = this.data.filter(contractor => {
            return (!contractor.SC_Status__c.toLowerCase().includes('failed onboarding'));
        });

    }

    callUpdateAccountClient(updatedJsonData) {
        updateAccountClient({ selectedContractorToUpdate: updatedJsonData })
            .then(() => {
                this.closeModal();

                this.FetchMCandSCDetails();
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record Updated Successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                console.error('Error updating contractor details: ', error);
                this.isLoading = false;
                return error;
            });
    }


    onchangeSCDetails(event) {
        const value = event.target.value.toLowerCase();

        // Update the relevant property based on the name of the input field
        if (event.target.name === 'SearchName') {
            this.searchName = value;
        } else if (event.target.name === 'SelectEndUser') {
            this.selectEndUser = value;
            this.selectedValueEndUser = event.target.value;
        } else if (event.target.name === 'selectDepot') {
            this.selectDepot = value;
            this.selectedValueDepot = event.target.value;
        } else if (event.target.name === 'role') {
            this.selectedRole = value;
            this.selectedValueRole = event.target.value;

        }

        // Filter the data based on all selected criteria
        this.data = this.originalData.filter(contractor => {
            const nameMatch = !this.searchName || contractor.Driver_Name__c.toLowerCase().includes(this.searchName);
            const endUserMatch = !this.selectEndUser || contractor.End_User_Name__c.toLowerCase().includes(this.selectEndUser);
            const depotMatch = !this.selectDepot || contractor.Depot_Name__c.toLowerCase().includes(this.selectDepot);
            const roleMatch = !this.selectedRole || contractor.Role__c.toLowerCase().includes(this.selectedRole);

            return nameMatch && endUserMatch && depotMatch && roleMatch;
        });

        this.currentPage = 1;
    }

    connectedCallback() {
        this.isLoading = true;
        this.selectedTabLabel = 'Onboarding Details';

        const style = document.createElement('style');
        style.innerText = `

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

                .citizenship-status .slds-grid.slds-wrap{
                    margin-top:1px !important;
                }

                .right-to-work-modal .slds-modal__container{
                    max-width: 45rem !important;
                    box-shadow: unset !important;
                }
                .file-upload-modal .slds-modal__container{
                    max-width: 28rem !important;
                    box-shadow: unset !important;
                }
                .confirmModal .slds-modal__container{
                    box-shadow: unset !important;
                }
                .expiryDate-edit label{
                    display: none !important;
                }
                .licenseExpiryDate-edit label{
                    display: none !important;
                }
                .fileBtn button{
                    border: 1px solid var(--color-Active-button-bg) !important;
                    background-color: var(--color-Active-button-bg) !important;
                    color:var(--color-Active-button-font) !important;
                }
        `;
        setTimeout(() => {
            this.template.querySelector('.overrideStyle').appendChild(style);
        }, 10);



        getUserContact({ userId: USER_ID })
            .then(result => {
                this.contactId = result;

                this.FetchMCandSCDetails();



                setTimeout(() => {

                    getEndUserMCDepotDetails({ contactId: this.contactId })
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
                            // Convert set to array and format options
                            this.depotOptions = [{ label: 'None', value: '' },
                            ...Array.from(uniqueDepotNames).map(item =>
                            ({
                                label: item.End_User_Account__r.Name,
                                value: item.End_User_Account__r.Name
                            }))
                            ];

                            this.relatedDepotOptions = [{ label: 'None', value: '' },
                            ...Array.from(this.parsedResultForDepot).map(item =>
                            ({
                                label: item.Name,
                                value: item.Name
                            }))
                            ];

                        })
                        .catch((error) => {
                            console.log('Error:', error);
                            this.spinner = false;
                        });


                    getMCDepotDetails({ contactId: this.contactId })
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

                }, 3000);

                getRolePicklistValues({ contactId: this.contactId })
                    .then(data => {

                        this.roleOptions = [{ label: 'None', value: '' }];
                        this.roleOptions = this.roleOptions.concat(data.map(role => {
                            return { label: role, value: role };
                        }));
                    })
                    .catch(error => {
                        console.error('Error fetching role picklist values:', error);
                    });

            });

        document.addEventListener('click', this.handleOutsideClick.bind(this));

    }

    checkDLandRTWExpiry(dlandRTWExpiryDate) {
        let expiryDate = new Date(dlandRTWExpiryDate);
        let currentDate = new Date();
        let timeDiff = expiryDate - currentDate;
        let daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));


        if (daysDiff < 0) {
            return 'expired';
        } else if (daysDiff >= 0 && daysDiff <= 90) {
            return 'expiring';
        } else {
            return 'valid';
        }
    }



    renderedCallback() {
        const element = this.template.querySelector('[data-tab="' + this.selectedTabLabel + '"]');
        if (element) {
            element.classList.add('selectedTab');
        } else {
            console.log('Element not found');
        }
    }

    handleAddContractor(event) {
        this.visibleNewContractorModal = true;
    }

    handleFinished(event) {
        this.visibleNewContractorModal = false;
    }
    cancelModule() {
        this.closeModal();
    }
    closeModal(event) {
        this.selectedContractor = {};
        this.visibleNewContractorModal = false;
        this.visibleUploadSection = false;
        this.backGroundCheckVar = '';
        this.toxicologyCheckVar = '';
        this.isConfirmModalOpen = false;
        this.confirmAction = null
        this.openDisengageConfirm = false;

        this.isRightToWorkModalOpen = false;
        this.isDrivingLicenseModelOpen = false;

        this.rightToWorkEditOpen = false;
        this.drivingLicenseEditOpen = false;
        this.hideValidateContent = false;
        this.hideValidateButton = false;
        this.hideDLValidateButton = false;
        this.hideDLValidateContent = false;
        this.showExpiredError = false;
        this.showDLExpiredError = false;
        this.isFileModuleError = false;
        this.fileModuleError = '';

        this.rtwNoDataSectionModal = false;
        this.dlNoDataSectionModal = false;

        this.showFileUploadButton = false;

        this.showValidateError = false;
        this.verifiedRTWName = null;
        this.isRTWVerfiedCheck = false;

        this.showDLValidateError = false;
        this.verifiedDLName = null;
        this.isDLVerfiedCheck = false;

        this.showRTWCheckError = false;
        this.isPreviewEnabled = false;
        this.filePreviewUrl = null;
        this.uplodedRTWCVId = null;
        this.uploadedRTWCheckFiles = null;
        this.isRTWCheckFileUploded = false;

        this.fileErrorMessage = false;
        this.rightToWorkNotShowVerified = true;
        this.drivingLicenseNotShowVerified = true;

    }

    handleRecordMenuClick(event) {
        let selectedDriverId = event.target.dataset.selectedId;
        event.stopPropagation();

        this.data = this.data.map(contractor => {
            if (contractor.Id === selectedDriverId) {
                return { ...contractor, visibleRecordMenu: !contractor.visibleRecordMenu };
            } else {
                return { ...contractor, visibleRecordMenu: false }; // Hide menu for other records
            }
        });
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

    openDisengageConfirmClick(event) {
        const selectedId = event.currentTarget.dataset.selectedId;
        this.selectedDriverId = selectedId;

        const rec = this.data.find(r => r.Id === selectedId);
        this.selectedContractor = rec ? { ...rec } : {};
        if (!this.selectedContractor.clientName) {
            this.selectedContractor.clientName =
                this.selectedContractor.Driver_Name__c ||
                this.selectedContractor.Client_Name__c ||
                '';
        }
        this.openDisengageConfirm = true;
    }

    handleDisengageClick(event) {
        let selectedDriverData = this.data.find(record => record.Id === this.selectedDriverId);
        selectedDriverData.SC_Status__c = 'Disengaged';

        let changedFields = {
            Id: selectedDriverData.Id,
            SC_Status__c: 'Disengaged'
        };

        this.callUpdateAccountClient(changedFields);
        this.data = this.data.filter(contractor => {
            return (!contractor.SC_Status__c.toLowerCase().includes('disengaged'));
        });
        this.openDisengageConfirm = false;
    }

    calculateLicenseExpiry(expiryDate) {
        if (expiryDate) {
            const expiry = new Date(expiryDate);
            const today = new Date();

            if (expiry < today) {
                return 'Expired';
            }

            let years = expiry.getFullYear() - today.getFullYear();
            let months = expiry.getMonth() - today.getMonth();
            let days = expiry.getDate() - today.getDate();

            // Adjust for negative values if the days or months are negative
            if (days < 0) {
                months -= 1;
                days += new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(); // Days in the current month
            }

            if (months < 0) {
                years -= 1;
                months += 12;
            }

            // Build the display string based on the calculated values
            let expiryString = '';
            if (years > 0) {
                expiryString += `${years} Year${years > 1 ? 's' : ''} `;
            }
            if (months > 0) {
                expiryString += `${months} Month${months > 1 ? 's' : ''} `;
            }
            if (days > 0) {
                expiryString += `${days} Day${days > 1 ? 's' : ''}`;
            }
            return expiryString.trim() || 'Expired';
        }
    }

    handleDriverProfile(event) {

        let selectedDriverId = event.target.dataset.selectedId;
        let selectedDriverData = this.data.filter(record => record.Id === selectedDriverId);

        // this[NavigationMixin.Navigate]({
        //     type: 'comm__namedPage',
        //     attributes: {
        //         name: 'Driver_Profile__c'
        //     },
        //     state: {
        //         recordId: selectedDriverId
        //     }
        // });
        let baseUrl = window.location.origin;

        let targetUrl = `${baseUrl}/mcsite/s/driver-profile?recordId=${selectedDriverId}`;

        // Open in a new browser tab
        window.open(targetUrl, '_blank');
    }

    handleRTWEditClick(event) {
        this.hideValidateButton = !this.hideValidateButton;
        this.rightToWorkEditOpen = !this.rightToWorkEditOpen;
        this.showRTWCheckError = false;
        this.selectedContractorId = event.currentTarget.dataset.selectedId;
        this.selectedOption = 'RTW';
        let previousHideValidateContent = this.hideValidateContent;
        if (this.selectedContractor.isRTWExpired == false) {
            this.hideValidateContent = false;
            this.showFileUploadButton = !this.showFileUploadButton;
        }

        if (this.selectedContractor.isRTWExpired == true) {
            this.hideValidateContent = !this.hideValidateContent;
            if (this.hideValidateContent == false) {
                this.showFileUploadButton = true;
            } else {
                this.showFileUploadButton = false;
            }
        }

        if (this.selectedContractor['rtwLicenseVerify'] == true || this.selectedContractor['isRTWExpiring'] == true) {
            this.hideValidateContent = !previousHideValidateContent;
            if (this.hideValidateContent == true) {
                this.showValidateError = false;
            }
        }
        if (this.selectedContractor['rtwLicenseVerify'] == true) {
            this.hideValidateContent = true;
            this.rightToWorkNotShowVerified = false;
        }

        this.showFrontBackRadioBtn = !this.selectedContractor.hasAccessCode;
        this.fileErrorMessage = '';
    }

    handleDLEditClick(event) {
        let previousHideDLValidateContent = this.hideDLValidateContent;
        this.hideDLValidateButton = !this.hideDLValidateButton;
        this.drivingLicenseEditOpen = !this.drivingLicenseEditOpen;
        this.showRTWCheckError = false;
        this.selectedContractorId = event.currentTarget.dataset.selectedId;

        this.selectedOption = 'DL';

        if (this.selectedContractor.isDLExpiring == true) {
            this.hideDLValidateContent = false;
            this.showFileUploadButton = !this.showFileUploadButton;

        }

        if (this.selectedContractor.isDLExpired == true) {
            this.hideDLValidateContent = !this.hideDLValidateContent;
            this.showFileUploadButton = !this.showFileUploadButton;
        }

        if (this.selectedContractor.drivingLicenseNotVerify == true) {
            this.hideDLValidateContent = false;
            this.showFileUploadButton = !this.showFileUploadButton;
        }

        if (this.selectedContractor.drivingLicenseVerify == true) {
            this.showFileUploadButton = !this.showFileUploadButton;
        }

        if (this.selectedContractor['drivingLicenseVerify'] == true || this.selectedContractor['isDLExpiring'] == true) {
            this.hideDLValidateContent = !previousHideDLValidateContent;
            if (this.hideDLValidateContent == true) {
                this.showDLValidateError = false;
            }
        }
        if (this.selectedContractor['drivingLicenseVerify'] == true) {
            this.hideDLValidateContent = true;
            this.drivingLicenseNotShowVerified = false;
        }

        const selectedValues = this.selectedContractor?.Additional_licence_categories__c || '';

        this.recordBasedLicenseCategory = this.licenseCategory_option.map(option => ({
            ...option,
            checked: selectedValues.includes(option.value)
        }));

        this.fileErrorMessage = '';
        this.showFrontBackRadioBtn = true;

    }

    deactivateFlag() {
        this.isBackgroundCheckModelOpen = false;
        this.isToxicologyModelOpen = false;
        this.selectedContractor = {};
        this.hideValidateContent = false;
        this.hideValidateButton = false;
        this.hideDLValidateButton = false;
        this.hideDLValidateContent = false;
        this.showExpiredError = false;
        this.showDLExpiredError = false;
        this.showFileUploadButton = false;
    }

    clickFrontBackUpload(event) {
        // new UI RTW
        console.log('SelectedCOntractor', this.selectedContractor);
        const citizenType = this.selectedContractor.Citizenship_Immigration_status__c;
        const selectedDocValue = this.selectedContractor.Right_to_work_document__c;

        let documentCount = 0;

        if (
            citizenType &&
            selectedDocValue &&
            this.allowedRTWOptions[citizenType]
        ) {

            const selectedOption = this.allowedRTWOptions[citizenType].find(option => option.value === selectedDocValue);

            if (selectedOption && selectedOption.documentType) {
                this.documentNames = selectedOption.documentType;
                documentCount = selectedOption.documentType.length;
            }
        }

        console.log('Document Count:', documentCount);
        console.log('Document Names:', this.documentNames);

        if (this.selectedOption == 'DL') {
            this.showFrontBackRadioBtn = true;
        } else {
            this.showFrontBackRadioBtn = false;
        }
        // New UI RTW
        if (documentCount > 1) {
            this.showFrontBackRadioBtn = true;
        }
        this.isFileUploadOpned = true;
        this.showImageCaptureModal = true;
        this.showFileUploadModal = true;
        this.showProfileUploadModal = false;
        this.isFileModuleError = false;
        this.fileModuleError = '';
        this.allowedExtension = undefined;
        if (this.selectedOption == 'RTW' && (this.selectedContractor.hasAccessCode || this.selectedContractor.hasShareCode)) {
            this.allowedExtension = '.png, .jpg, .jpeg, .pdf'
        }
    }

    handleFileCancel(event) {
        this.isFileUploadOpned = false;
        this.allowedExtension = undefined;
    }

    // new Enable edit functionality for the after the file is uploaded it will show new fields
    @track isExtraFieldEditable = false;
    handleSaveFiles(event) {
        const childComp = this.template.querySelector('c-image-capture');
        if (childComp) {
            const data = childComp.getUploadDocs();
            if (data) {
                if (data.uploadFrontFiles.length > 0 || data.capturedFrontFiles.length > 0) {
                    this.frontDocFiles = data.uploadFrontFiles.length > 0 ? data.uploadFrontFiles : data.capturedFrontFiles;

                    if (!this.showFrontBackRadioBtn) {

                        if (this.selectedOption == 'RTW' && (this.selectedContractor.hasAccessCode || this.selectedContractor.hasShareCode)) {
                            this.selectedContractor.CheckDoc = this.frontDocFiles[0].preview;
                            this.selectedContractor.CheckDocName = this.frontDocFiles[0].name;
                            this.isExtraFieldEditable = true;
                        } else {
                            this.selectedContractor.FrontDoc = this.frontDocFiles[0].preview;
                        }
                    }

                    this.imagesNotAvailable = false;
                    this.imagesAvailable = true;
                    this.hideValidateContent = false;
                    this.rightToWorkNotShowVerified = true;
                } else {
                    this.fileModuleError = 'Please Upload the related Front File';
                    this.isFileModuleError = true;
                    return;
                }

                if (this.showFrontBackRadioBtn) {
                    if (data.uploadBackFiles.length > 0 || data.capturedBackFiles.length > 0) {
                        this.backDocFiles = data.uploadBackFiles.length > 0 ? data.uploadBackFiles : data.capturedBackFiles;
                        this.selectedContractor.BackDoc = this.backDocFiles[0].preview;

                        this.selectedContractor.FrontDoc = this.frontDocFiles[0].preview;
                        this.hideDLValidateContent = false;
                        this.drivingLicenseNotShowVerified = true;
                    } else {
                        this.fileModuleError = 'Please Upload the related Back File';
                        this.isFileModuleError = true;
                        return;
                    }
                }
            } else {
                console.log('No data returned from child component');
            }
        } else {
            console.error('Child component not found');
        }
        this.isFileUploadOpned = false;
    }

    rejectHandler(event) {

        if (event.target.name === 'RTWReject') {
            this.closeModal();
            this.isRightToWorkModalOpen = false;
        }

        if (event.target.name === 'drivingReject') {
            this.closeModal();
            this.isDrivingLicenseModelOpen = false;
        }


    }

    handleDLVerifiedCheck(event) {
        this.isDLVerfiedCheck = !this.isDLVerfiedCheck;
    }


    handleDLVerifiedName(event) {
        const value = event.target.value;
        this.verifiedDLName = value && value.trim() !== '' ? value : null;
    }


    handleRTWVerifiedCheck(event) {
        this.isRTWVerfiedCheck = !this.isRTWVerfiedCheck;
    }

    handleRTWVerifiedName(event) {
        const value = event.target.value;
        this.verifiedRTWName = value && value.trim() !== '' ? value : null;
    }


    validateHandler(event) {

        let updateProceed = false;
        let updateType = event.target.dataset.updateType;
        let targetName = event.target.name;
        const childComponent = this.template.querySelector('c-gconnect-file-upload');
        if (childComponent) {
            let childData = childComponent.getUpdateType();

            let childUpdateType = childData.updateType;
            let childtargetName = childData.targetName;
            if (childUpdateType != null) {
                updateType = childUpdateType;
                targetName = childtargetName;
            }
        } else {
            updateType = event.target.dataset.updateType;
            targetName = event.target.name;
        }

        let changedFields = {};
        const bypassValidation = this.selectedContractor?.Citizenship_Immigration_status__c === 'British passport/UK National';


        if (targetName === 'RTWValidate' && (this.isRTWVerfiedCheck == false || this.verifiedRTWName == null)) {
            this.showValidateError = true;
            return;
        } else {
            this.showValidateError = false;
            if (targetName === 'RTWValidate' && this.isRTWVerfiedCheck == false && this.selectedContractor.hasAccessCode == true && updateType == 'validate') {
                this.visibleUploadSection = false;
                return;
            }
            if (targetName === 'RTWValidate' && this.isRTWVerfiedCheck == true && this.selectedContractor.hasAccessCode == true && updateType == 'validate') {

                if (this.uploadSectionName == 'Right To Work Check' && this.isRTWVerfiedCheck == true &&
                    this.data[this.currentIndex].hasAccessCode == true && this.verifiedRTWName != null) {
                    if (this.imagesAvailable) {
                        this.showRTWCheckError = false;
                    } else {
                        if (this.frontDocFiles.length == 0 || (this.showFrontBackRadioBtn && this.backDocFiles.length == 0)) {
                            this.showRTWCheckError = true;
                            return;
                        } else {
                            this.showRTWCheckError = false;
                        }
                    }
                    this.selectedContractor['is_Right_to_Work_Verify__c'] = true;
                    this.data[this.selectedContractor.currentClickIndex].is_Right_to_Work_Verify__c = true;
                    this.data[this.selectedContractor.currentClickIndex].RTW_Verified_by__c = this.verifiedRTWName;
                    this.data[this.selectedContractor.currentClickIndex].rtwLicenseVerify = true;
                    this.data[this.selectedContractor.currentClickIndex].rtwLicenseNotVerify = false;
                    this.data[this.selectedContractor.currentClickIndex].RtwProgressIcon = this.rtwGreen;
                    this.data[this.selectedContractor.currentClickIndex].isRTWExpiring = false;
                    this.data[this.selectedContractor.currentClickIndex].isRTWExpired = false;
                    updateProceed = true;

                    changedFields = {
                        Id: this.data[this.selectedContractor.currentClickIndex].Id,
                        is_Right_to_Work_Verify__c: true,
                        RTW_Verified_by__c: this.verifiedRTWName,
                        rtwLicenseVerify: true,
                        rtwLicenseNotVerify: false,
                        RtwProgressIcon: this.rtwGreen,
                        isRTWExpiring: false,
                        isRTWExpired: false
                    };


                }
            }
            if (targetName === 'RTWValidate' && this.isRTWVerfiedCheck == true && this.selectedContractor.hasAccessCode == false && updateType == 'validate' && this.verifiedRTWName != null) {
                this.selectedContractor['is_Right_to_Work_Verify__c'] = true;
                this.data[this.selectedContractor.currentClickIndex].is_Right_to_Work_Verify__c = true;
                this.data[this.selectedContractor.currentClickIndex].RTW_Verified_by__c = this.verifiedRTWName;
                this.data[this.selectedContractor.currentClickIndex].rtwLicenseVerify = true;
                this.data[this.selectedContractor.currentClickIndex].rtwLicenseNotVerify = false;
                this.data[this.selectedContractor.currentClickIndex].RtwProgressIcon = this.rtwGreen;
                this.data[this.selectedContractor.currentClickIndex].isRTWExpiring = false;
                updateProceed = true;

                changedFields = {
                    Id: this.data[this.selectedContractor.currentClickIndex].Id,
                    is_Right_to_Work_Verify__c: true,
                    RTW_Verified_by__c: this.verifiedRTWName,
                    rtwLicenseVerify: true,
                    rtwLicenseNotVerify: false,
                    RtwProgressIcon: this.rtwGreen,
                    isRTWExpiring: false
                };

                if (!bypassValidation && this.checkDLandRTWExpiry(this.data[this.selectedContractor.currentClickIndex].RTW_Expiry_Date__c) == 'expiring') {
                    this.data[this.selectedContractor.currentClickIndex].isRTWExpired = false;
                    this.data[this.selectedContractor.currentClickIndex].rtwLicenseNotVerify = false;
                    this.data[this.selectedContractor.currentClickIndex].rtwLicenseVerify = false;
                    this.data[this.selectedContractor.currentClickIndex].RtwProgressIcon = this.rtwLightRed;
                    this.data[this.selectedContractor.currentClickIndex].isRTWExpiring = true;

                    changedFields.isRTWExpired = false;
                    changedFields.isRTWExpiring = true;
                    changedFields.rtwLicenseNotVerify = false;
                    changedFields.rtwLicenseVerify = false;
                    changedFields.RtwProgressIcon = this.rtwLightRed;
                }
            }
        }

        if (targetName === 'drivingValidate' && (this.isDLVerfiedCheck == false || this.verifiedDLName == null)) {
            this.showDLValidateError = true;
            return;
        } else {
            this.showDLValidateError = false;
            if (this.imagesAvailable) {
                this.showRTWCheckError = false;
            } else {
                if (this.frontDocFiles.length == 0 || (this.showFrontBackRadioBtn && this.backDocFiles.length == 0)) {
                    this.showRTWCheckError = true;
                    return;
                } else {
                    this.showRTWCheckError = false;
                }
            }
            if (targetName === 'drivingValidate' && this.verifiedDLName != null && this.isDLVerfiedCheck == true) {
                const today = new Date();
                const nextValidationDueDate = new Date();
                nextValidationDueDate.setDate(today.getDate() + 90);
                const nextDueFormatted = nextValidationDueDate.toISOString().split('T')[0];
                const todayFormatted = today.toISOString().split('T')[0];

                this.selectedContractor['isDriving_License_Verify__c'] = true;
                this.data[this.selectedContractor.currentClickIndex].isDriving_License_Verify__c = true;
                this.data[this.selectedContractor.currentClickIndex].Driving_License_Verified_by__c = this.verifiedDLName;
                this.data[this.selectedContractor.currentClickIndex].drivingLicenseVerify = true;
                this.data[this.selectedContractor.currentClickIndex].drivingLicenseNotVerify = false;
                this.data[this.selectedContractor.currentClickIndex].LiceceProgressIcon = this.licenceGreen;
                this.data[this.selectedContractor.currentClickIndex].isDLExpiring = false;

                this.data[this.selectedContractor.currentClickIndex].Driving_License_Validated_Date__c = todayFormatted;
                this.data[this.selectedContractor.currentClickIndex].Driving_License_Validation_Due_Date__c = nextDueFormatted;
                updateProceed = true;

                changedFields = {
                    Id: this.data[this.selectedContractor.currentClickIndex].Id,
                    isDriving_License_Verify__c: true,
                    Driving_License_Verified_by__c: this.verifiedDLName,
                    Driving_License_Validated_Date__c: todayFormatted,
                    Driving_License_Validation_Due_Date__c: nextDueFormatted,
                    drivingLicenseVerify: true,
                    drivingLicenseNotVerify: false,
                    LiceceProgressIcon: this.licenceGreen,
                    isDLExpiring: false
                };
                if (this.checkDLandRTWExpiry(this.data[this.selectedContractor.currentClickIndex].Driving_Licence_Expiry_Date__c) == 'expiring') {
                    this.data[this.selectedContractor.currentClickIndex].drivingLicenseVerify = false;
                    this.data[this.selectedContractor.currentClickIndex].drivingLicenseNotVerify = false;
                    this.data[this.selectedContractor.currentClickIndex].LiceceProgressIcon = this.licenceLightRed;
                    this.data[this.selectedContractor.currentClickIndex].isDLExpiring = true;
                    this.data[this.selectedContractor.currentClickIndex].isDLExpired = false;

                    changedFields.drivingLicenseVerify = false;
                    changedFields.drivingLicenseNotVerify = false;
                    changedFields.LiceceProgressIcon = this.licenceLightRed;
                    changedFields.isDLExpiring = true;
                    changedFields.isDLExpired = false;
                }
            }

        }

        if (updateProceed == true) {
            this.callUpdateAccountClient(changedFields);
        }


    }

    onChangeLicenseDetails(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value.trim();
        const contractorIndex = this.selectedContractor.currentClickIndex;
        this.hideDLValidateContent = false;
        this.drivingLicenseNotShowVerified = true;
        if (fieldName === 'licenseExpiryDate') {
            const selectedDate = new Date(fieldValue);
            const minDate = new Date();
            minDate.setHours(0, 0, 0, 0);

            if (selectedDate < minDate) {
                event.target.setCustomValidity("Past date is not allowed.");
            } else {
                event.target.setCustomValidity("");
                this.data[contractorIndex].licenseExpiryDate = fieldValue;
            }
            event.target.reportValidity();
        } else if (fieldName === 'typeOfLicense') {
            this.applyLicenseNumberValidation = fieldValue !== 'International';
            this.data[contractorIndex].typeOfLicense = fieldValue;
        } else if (event.target.type === 'checkbox') {
            const selectedValues = [];
            this.template.querySelectorAll('.cBox').forEach(checkbox => {
                if (checkbox.checked) {
                    selectedValues.push(checkbox.value);
                }
            });
            this.data[contractorIndex].licenseCategory = selectedValues.join(';');
        } else if (fieldName === 'licenseNumber') {
            const licenseNumberPattern = /^[A-Z0-9]*$/;
            let errorMessage = '';

            if (!licenseNumberPattern.test(fieldValue) && this.applyLicenseNumberValidation) {
                errorMessage = 'Licence number must be alphanumeric.';
            } else if ((fieldValue.length < 16 || fieldValue.length > 18) && this.applyLicenseNumberValidation) {
                errorMessage = 'Licence number must be between 16 and 18 characters.';
            }

            if (!errorMessage) {
                this.data[contractorIndex].licenseNumber = fieldValue;
            }
            event.target.setCustomValidity(errorMessage);
            event.target.reportValidity();
        } else if (fieldName === 'pointOfLicense') {
            this.data[contractorIndex].pointOfLicense = fieldValue;
        } else if (fieldName === 'licenseIssueDate') {

            const selectedDate = new Date(fieldValue);
            const minDate = new Date();

            if (selectedDate > minDate) {
                event.target.setCustomValidity("Future date is not allowed.");
            } else {
                event.target.setCustomValidity("");
                this.data[contractorIndex].licenseIssueDate = fieldValue;
            }
        }

    }

    // new
    //showTimeLimitedSection = false;
    //showRestrictionsSection = false;

    onChangeRTWDetails(event) {

        const fieldName = event.target.name;
        const fieldValue = event.target.value.trim();
        const contractorIndex = this.selectedContractor.currentClickIndex;
        this.hideValidateContent = false;
        this.rightToWorkNotShowVerified = true;
        if (fieldName === 'typeOfEVisa') {
            this.data[contractorIndex].Type_of_e_visa__c = fieldValue;
            this.selectedContractor.Type_of_e_visa__c = fieldValue;
            if (fieldValue === 'Continuous right to work') {
                this.selectedContractor.showTimeLimitedSection = false;
                this.selectedContractor.showRestrictionsSection = false;
                // Clear time-limited fields
                this.data[contractorIndex].Permission_Expiry_Date__c = null;
                this.selectedContractor.Permission_Expiry_Date__c = null;
                this.data[contractorIndex].Any_work_restrictions__c = null;
                this.selectedContractor.Any_work_restrictions__c = null;
                this.data[contractorIndex].Limited_To_X_Hours_Per_Week__c = null;
                this.selectedContractor.Limited_To_X_Hours_Per_Week__c = null;
                this.data[contractorIndex].Limited_To_Specific_Job_Types__c = null;
                this.selectedContractor.Limited_To_Specific_Job_Types__c = null;
                this.data[contractorIndex].Other_Restrictions__c = null;
                this.selectedContractor.Other_Restrictions__c = null;
            }
            if (fieldValue === 'Time-limited right to work') {
                this.selectedContractor.showTimeLimitedSection = true;
            }
        }

        /* -------- ANY WORK RESTRICTIONS -------- */

        if (fieldName === 'anyWorkRestrictions') {
            this.data[contractorIndex].Any_work_restrictions__c = fieldValue;
            this.selectedContractor.Any_work_restrictions__c = fieldValue;
            if (fieldValue === 'Yes') {
                this.selectedContractor.showRestrictionsSection = true;
            } else {
                this.selectedContractor.showRestrictionsSection = false;
                this.selectedContractor.Limited_To_X_Hours_Per_Week__c = null;
                this.selectedContractor.Limited_To_Specific_Job_Types__c = null;
                this.selectedContractor.Other_Restrictions__c = null;

                this.data[contractorIndex].Limited_To_X_Hours_Per_Week__c = null;
                this.data[contractorIndex].Limited_To_Specific_Job_Types__c = null;
                this.data[contractorIndex].Other_Restrictions__c = null;
            }
        }
        if (fieldName === 'limitedHours') {
            this.data[contractorIndex].Limited_To_X_Hours_Per_Week__c = fieldValue;
            this.selectedContractor.Limited_To_X_Hours_Per_Week__c = fieldValue;
        }

        if (fieldName === 'specificJobs') {
            this.data[contractorIndex].Limited_To_Specific_Job_Types__c = fieldValue;
            this.selectedContractor.Limited_To_Specific_Job_Types__c = fieldValue;
        }

        if (fieldName === 'otherRestrictions') {
            this.data[contractorIndex].Other_Restrictions__c = fieldValue;
            this.selectedContractor.Other_Restrictions__c = fieldValue;
        }
        if (fieldName === 'PermissionexpiryDate') {
            this.data[contractorIndex].Permission_Expiry_Date__c = fieldValue;
            this.selectedContractor.Permission_Expiry_Date__c = fieldValue;
        }
        if (fieldName == 'expiryDate') {

            if (event.target.dataset.passvalidation === 'true') {
                event.target.setCustomValidity("");
                this.data[contractorIndex].expiryDate = fieldValue;
                event.target.reportValidity();
                return;
            }
            const selectedDate = new Date(fieldValue);
            const minDate = new Date();
            minDate.setHours(0, 0, 0, 0);
            if (selectedDate < minDate) {
                event.target.setCustomValidity("Past date is not allowed.");
            } else {
                event.target.setCustomValidity("");
                this.data[contractorIndex].expiryDate = fieldValue;
            }
            event.target.reportValidity();
        }
    }

    async saveRTWandDLdata() {
        let updateProceed = false;
        let allFieldsValid = true;
        const childComp = this.template.querySelector('c-image-capture');
        let inputFields;
        if (this.selectedOption == 'RTW') {
            inputFields = this.template.querySelectorAll('.expiryDate-edit');
        } else {
            inputFields = this.template.querySelectorAll('.licenseNumber,.licenseExpiryDate-edit,.typeOfLicense, .licenseIssueDate, .pointOfLicense');
        }

        inputFields.forEach(inputField => {
            inputField.reportValidity();
            if (!inputField.checkValidity()) {
                allFieldsValid = false;
                inputField.focus();
            }
        });


        if (this.imagesAvailable) {
            this.fileErrorMessage = false;
        } else {
            if (this.frontDocFiles.length == 0 || (this.showFrontBackRadioBtn && this.backDocFiles.length == 0)) {
                this.fileErrorMessage = true;

                if (this.selectedOption == 'RTW') {

                    return;
                } else if (this.selectedOption == 'DL') {
                    return;
                }
            } else {
                this.fileErrorMessage = false;
            }
        }

        if (allFieldsValid) {
            const bypassValidation = this.selectedContractor?.Citizenship_Immigration_status__c === 'British passport/UK National';

            let changedFields = { Id: this.data[this.selectedContractor.currentClickIndex].Id };
            if (this.selectedOption == 'RTW') {

                if ((this.isRTWVerfiedCheck == false || this.verifiedRTWName == null)) {
                    this.showValidateError = true;
                    return;
                } else {
                    this.showValidateError = false;

                    if (this.isRTWVerfiedCheck == false && this.selectedContractor.hasAccessCode == true) {
                        this.visibleUploadSection = false;
                        return;
                    }
                    if (this.isRTWVerfiedCheck == true && this.selectedContractor.hasAccessCode == true && this.verifiedRTWName == null) {
                        this.isRightToWorkModalOpen = false;
                    }
                    //  SHARE CODE SCENARIO (hasShareCode = true)
                    if (this.selectedContractor.hasShareCode == true && this.isRTWVerfiedCheck == true && this.verifiedRTWName != null) {

                        // Upload files if new files were added
                        if (this.fileErrorMessage == false && this.frontDocFiles.length > 0) {
                            await this.uploadAllFiles();
                            if (childComp) {
                                childComp.resetFiles();
                            }
                        } else if (this.frontDocFiles.length === 0 && !this.imagesAvailable) {
                            this.fileErrorMessage = true;
                            return;
                        }

                        // Update verification status
                        this.selectedContractor['is_Right_to_Work_Verify__c'] = true;
                        this.data[this.selectedContractor.currentClickIndex].is_Right_to_Work_Verify__c = true;
                        this.data[this.selectedContractor.currentClickIndex].RTW_Verified_by__c = this.verifiedRTWName;
                        this.data[this.selectedContractor.currentClickIndex].isRTWExpired = false;
                        this.data[this.selectedContractor.currentClickIndex].rtwLicenseVerify = true;
                        this.data[this.selectedContractor.currentClickIndex].rtwLicenseNotVerify = false;
                        this.data[this.selectedContractor.currentClickIndex].RtwProgressIcon = this.rtwGreen;
                        this.data[this.selectedContractor.currentClickIndex].isRTWExpiring = false;
                        updateProceed = true;

                        //  BUILD CHANGED FIELDS WITH ALL SHARE CODE DATA
                        changedFields = {
                            Id: this.data[this.selectedContractor.currentClickIndex].Id,
                            is_Right_to_Work_Verify__c: true,
                            RTW_Verified_by__c: this.verifiedRTWName,
                            isRTWExpiring: false,
                            isRTWExpired: false,
                            rtwLicenseNotVerify: false,
                            rtwLicenseVerify: true,
                            RtwProgressIcon: this.rtwGreen,

                            //  SHARE CODE SPECIFIC FIELDS
                            Type_of_e_visa__c: this.data[this.selectedContractor.currentClickIndex].Type_of_e_visa__c,
                            Permission_Expiry_Date__c: this.data[this.selectedContractor.currentClickIndex].Permission_Expiry_Date__c,
                            Any_work_restrictions__c: this.data[this.selectedContractor.currentClickIndex].Any_work_restrictions__c,
                            Limited_To_X_Hours_Per_Week__c: this.data[this.selectedContractor.currentClickIndex].Limited_To_X_Hours_Per_Week__c,
                            Limited_To_Specific_Job_Types__c: this.data[this.selectedContractor.currentClickIndex].Limited_To_Specific_Job_Types__c,
                            Other_Restrictions__c: this.data[this.selectedContractor.currentClickIndex].Other_Restrictions__c
                        };

                        console.log('Saving Share Code RTW Data:', changedFields);
                    }
                    if (this.isRTWVerfiedCheck == true && this.selectedContractor.hasAccessCode == true && this.verifiedRTWName != null) {

                        if (this.fileErrorMessage == false && this.frontDocFiles.length > 0) {
                            await this.uploadAllFiles();
                            if (childComp) {
                                childComp.resetFiles();
                            }
                        } else if (this.frontDocFiles.length === 0 && !this.imagesAvailable) {
                            this.fileErrorMessage = true;
                            return;
                        }

                        this.selectedContractor['is_Right_to_Work_Verify__c'] = true;
                        this.data[this.selectedContractor.currentClickIndex].is_Right_to_Work_Verify__c = true;
                        this.data[this.selectedContractor.currentClickIndex].RTW_Verified_by__c = this.verifiedRTWName;

                        this.data[this.selectedContractor.currentClickIndex].isRTWExpired = false;
                        this.data[this.selectedContractor.currentClickIndex].rtwLicenseVerify = true;
                        this.data[this.selectedContractor.currentClickIndex].rtwLicenseNotVerify = false;
                        this.data[this.selectedContractor.currentClickIndex].RtwProgressIcon = this.rtwGreen;
                        this.data[this.selectedContractor.currentClickIndex].isRTWExpiring = false;
                        updateProceed = true;

                        changedFields = {
                            Id: this.data[this.selectedContractor.currentClickIndex].Id,
                            is_Right_to_Work_Verify__c: true,
                            RTW_Verified_by__c: this.verifiedRTWName,
                            isRTWExpiring: false,
                            isRTWExpired: false,
                            rtwLicenseNotVerify: false,
                            rtwLicenseVerify: true,
                            RtwProgressIcon: this.rtwGreen,
                            expiryDate: this.data[this.selectedContractor.currentClickIndex].expiryDate,
                            // Type_of_e_visa__c: this.data[this.selectedContractor.currentClickIndex].Type_of_e_visa__c,
                            // Permission_Expiry_Date__c: this.data[this.selectedContractor.currentClickIndex].Permission_Expiry_Date__c,
                            // Any_work_restrictions__c: this.data[this.selectedContractor.currentClickIndex].Any_work_restrictions__c,
                            // Limited_To_X_Hours_Per_Week__c: this.data[this.selectedContractor.currentClickIndex].Limited_To_X_Hours_Per_Week__c,
                            // Limited_To_Specific_Job_Types__c: this.data[this.selectedContractor.currentClickIndex].Limited_To_Specific_Job_Types__c,
                            // Other_Restrictions__c: this.data[this.selectedContractor.currentClickIndex].Other_Restrictions__c
                        };
                    }
                    if (this.isRTWVerfiedCheck == true && this.selectedContractor.hasAccessCode == false && this.verifiedRTWName != null) {


                        if (this.data[this.selectedContractor.currentClickIndex].hasAccessCode == false && this.fileErrorMessage == false) {
                            await this.uploadAllFiles();
                            if (childComp) {
                                childComp.resetFiles();
                            }
                        }

                        this.selectedContractor['is_Right_to_Work_Verify__c'] = true;
                        this.data[this.selectedContractor.currentClickIndex].is_Right_to_Work_Verify__c = true;
                        this.data[this.selectedContractor.currentClickIndex].RTW_Verified_by__c = this.verifiedRTWName;

                        this.data[this.selectedContractor.currentClickIndex].isRTWExpired = false;
                        this.data[this.selectedContractor.currentClickIndex].rtwLicenseVerify = true;
                        this.data[this.selectedContractor.currentClickIndex].rtwLicenseNotVerify = false;
                        this.data[this.selectedContractor.currentClickIndex].RtwProgressIcon = this.rtwGreen;
                        this.data[this.selectedContractor.currentClickIndex].isRTWExpiring = false;

                        updateProceed = true;

                        changedFields = {
                            Id: this.data[this.selectedContractor.currentClickIndex].Id,
                            is_Right_to_Work_Verify__c: true,
                            RTW_Verified_by__c: this.verifiedRTWName,
                            isRTWExpiring: false,
                            isRTWExpired: false,
                            rtwLicenseNotVerify: false,
                            rtwLicenseVerify: true,
                            RtwProgressIcon: this.rtwGreen,
                            expiryDate: this.data[this.selectedContractor.currentClickIndex].expiryDate,
                            Type_of_e_visa__c: this.data[this.selectedContractor.currentClickIndex].Type_of_e_visa__c,
                            Permission_Expiry_Date__c: this.data[this.selectedContractor.currentClickIndex].Permission_Expiry_Date__c,
                            Any_work_restrictions__c: this.data[this.selectedContractor.currentClickIndex].Any_work_restrictions__c,
                            Limited_To_X_Hours_Per_Week__c: this.data[this.selectedContractor.currentClickIndex].Limited_To_X_Hours_Per_Week__c,
                            Limited_To_Specific_Job_Types__c: this.data[this.selectedContractor.currentClickIndex].Limited_To_Specific_Job_Types__c,
                            Other_Restrictions__c: this.data[this.selectedContractor.currentClickIndex].Other_Restrictions__c
                        };

                        if (!bypassValidation && this.checkDLandRTWExpiry(this.data[this.selectedContractor.currentClickIndex].RTW_Expiry_Date__c) == 'expiring') {
                            this.data[this.selectedContractor.currentClickIndex].isRTWExpired = false;
                            this.data[this.selectedContractor.currentClickIndex].rtwLicenseNotVerify = false;
                            this.data[this.selectedContractor.currentClickIndex].rtwLicenseVerify = false;
                            this.data[this.selectedContractor.currentClickIndex].RtwProgressIcon = this.rtwLightRed;
                            this.data[this.selectedContractor.currentClickIndex].isRTWExpiring = true;


                            changedFields.isRTWExpired = false;
                            changedFields.isRTWExpiring = true;
                            changedFields.rtwLicenseNotVerify = false;
                            changedFields.rtwLicenseVerify = false;
                            changedFields.RtwProgressIcon = this.rtwLightRed;
                        }

                        if (!bypassValidation && this.checkDLandRTWExpiry(this.data[this.selectedContractor.currentClickIndex].RTW_Expiry_Date__c) == 'expired') {
                            this.data[this.selectedContractor.currentClickIndex].isRTWExpired = true;
                            this.data[this.selectedContractor.currentClickIndex].rtwLicenseNotVerify = false;
                            this.data[this.selectedContractor.currentClickIndex].rtwLicenseVerify = false;
                            this.data[this.selectedContractor.currentClickIndex].RtwProgressIcon = this.rtwRed;
                            this.data[this.selectedContractor.currentClickIndex].isRTWExpiring = false;


                            changedFields.isRTWExpired = true;
                            changedFields.isRTWExpiring = false;
                            changedFields.rtwLicenseNotVerify = false;
                            changedFields.rtwLicenseVerify = false;
                            changedFields.RtwProgressIcon = this.rtwRed;
                        }
                    }
                }

            }
            if (this.selectedOption == 'DL') {


                if ((this.isDLVerfiedCheck == false || this.verifiedDLName == null)) {
                    this.showDLValidateError = true;
                    return;
                } else {
                    this.showDLValidateError = false;

                    if (this.fileErrorMessage == false) {
                        await this.uploadAllFiles();
                        if (childComp) {
                            childComp.resetFiles();
                        }
                    }

                    if (this.verifiedDLName != null && this.isDLVerfiedCheck == true) {
                        const today = new Date();
                        const nextValidationDueDate = new Date();
                        nextValidationDueDate.setDate(today.getDate() + 90);
                        const nextDueFormatted = nextValidationDueDate.toISOString().split('T')[0];
                        const todayFormatted = today.toISOString().split('T')[0];

                        this.selectedContractor['isDriving_License_Verify__c'] = true;
                        this.data[this.selectedContractor.currentClickIndex].isDriving_License_Verify__c = true;
                        this.data[this.selectedContractor.currentClickIndex].Driving_License_Verified_by__c = this.verifiedDLName;

                        this.data[this.selectedContractor.currentClickIndex].drivingLicenseVerify = true;
                        this.data[this.selectedContractor.currentClickIndex].drivingLicenseNotVerify = false;
                        this.data[this.selectedContractor.currentClickIndex].LiceceProgressIcon = this.licenceGreen;
                        this.data[this.selectedContractor.currentClickIndex].isDLExpiring = false;
                        this.data[this.selectedContractor.currentClickIndex].isDLExpired = false;

                        this.data[this.selectedContractor.currentClickIndex].Driving_License_Validated_Date__c = todayFormatted;
                        this.data[this.selectedContractor.currentClickIndex].Driving_License_Validation_Due_Date__c = nextDueFormatted;
                        updateProceed = true;

                        changedFields = {
                            Id: this.data[this.selectedContractor.currentClickIndex].Id,
                            isDriving_License_Verify__c: true,
                            Driving_License_Verified_by__c: this.verifiedDLName,
                            Driving_License_Validated_Date__c: todayFormatted,
                            Driving_License_Validation_Due_Date__c: nextDueFormatted,
                            drivingLicenseVerify: true,
                            drivingLicenseNotVerify: false,
                            LiceceProgressIcon: this.licenceGreen,
                            isDLExpiring: false,
                            isDLExpired: false,
                            licenseExpiryDate: this.data[this.selectedContractor.currentClickIndex].licenseExpiryDate,
                            licenseIssueDate: this.data[this.selectedContractor.currentClickIndex].licenseIssueDate,
                            typeOfLicense: this.data[this.selectedContractor.currentClickIndex].typeOfLicense,
                            licenseCategory: this.data[this.selectedContractor.currentClickIndex].licenseCategory,
                            licenseNumber: this.data[this.selectedContractor.currentClickIndex].licenseNumber,
                            pointOfLicense: this.data[this.selectedContractor.currentClickIndex].pointOfLicense
                        };
                    }
                    if (this.checkDLandRTWExpiry(this.data[this.selectedContractor.currentClickIndex].Driving_Licence_Expiry_Date__c) == 'expiring') {

                        this.data[this.selectedContractor.currentClickIndex].drivingLicenseVerify = false;
                        this.data[this.selectedContractor.currentClickIndex].drivingLicenseNotVerify = false;
                        this.data[this.selectedContractor.currentClickIndex].LiceceProgressIcon = this.licenceLightRed;
                        this.data[this.selectedContractor.currentClickIndex].isDLExpiring = true;
                        this.data[this.selectedContractor.currentClickIndex].isDLExpired = false;

                        changedFields.drivingLicenseVerify = false;
                        changedFields.drivingLicenseNotVerify = false;
                        changedFields.LiceceProgressIcon = this.licenceLightRed;
                        changedFields.isDLExpiring = true;
                        changedFields.isDLExpired = false;
                    }
                    if (this.checkDLandRTWExpiry(this.data[this.selectedContractor.currentClickIndex].Driving_Licence_Expiry_Date__c) == 'expired') {
                        this.data[this.selectedContractor.currentClickIndex].drivingLicenseVerify = false;
                        this.data[this.selectedContractor.currentClickIndex].drivingLicenseNotVerify = false;
                        this.data[this.selectedContractor.currentClickIndex].LiceceProgressIcon = this.licenceRed;
                        this.data[this.selectedContractor.currentClickIndex].isDLExpiring = false;
                        this.data[this.selectedContractor.currentClickIndex].isDLExpired = true;

                        changedFields.drivingLicenseVerify = false;
                        changedFields.drivingLicenseNotVerify = false;
                        changedFields.LiceceProgressIcon = this.licenceRed;
                        changedFields.isDLExpiring = false;
                        changedFields.isDLExpired = true;
                    }
                }

            }
            console.log('Saving Share Code RTW Data:', changedFields);
            if (updateProceed) {
                await this.callUpdateAccountClient(changedFields);
            }

        }
    }

    uploadAllFiles() {
        this.uploadFiles = [...this.frontDocFiles, ...this.backDocFiles];
        this.backDocFiles = [];
        this.frontDocFiles = [];

        this.handleUpload();
    }

    handleUpload() {

        try {
            for (const file of this.uploadFiles) {
                console.log(file);
                let fileDocName;
                if ((this.selectedContractor.hasAccessCode || this.selectedContractor.hasShareCode) && this.selectedOption == 'RTW') {
                    fileDocName = this.selectedContractor.Client_Name__c + '_' + this.selectedOption + ' ' + 'Check';
                } else {
                    fileDocName = this.selectedContractor.Client_Name__c + '_' + this.selectedOption + ' ' + file.docType;
                }
                let docType = null;
                if (this.selectedOption == 'DL') {
                    if (file.docType == 'Front') {
                        docType = 'Driving License Front';
                    } else {
                        docType = 'Driving License Back';
                    }
                }
                else {

                    if (this.selectedContractor.hasAccessCode || this.selectedContractor.hasShareCode || file.docType === 'Check') {
                        docType = 'Right To Work Check';
                    } else if (file.docType == 'Front') {
                        docType = 'Right To Work Front';
                    } else {
                        docType = 'Right To Work Back';
                    }
                }

                saveUplodededFiles({ parentId: this.selectedContractorId, fileName: fileDocName, base64Data: file.base64Data, contentType: file.fileType, docType: docType });

                this.dispatchEvent(new ShowToastEvent({ title: 'Success', message: 'Files Uploaded Successfully', variant: 'success' }));

            }
        } catch (error) {
            console.error('Error in handleUpload:', error);
        }
    }



    rtwDataAdded(event) {
        const addRTWExpiryDate = event.detail.rtwExpiryDate;
        if (addRTWExpiryDate != null || addRTWExpiryDate != undefined || addRTWExpiryDate != '') {
            if (this.checkDLandRTWExpiry(addRTWExpiryDate) == 'expiring') {
                this.data[this.currentIndex].rtwDataNotAvaliable = false;
                this.data[this.currentIndex].isRTWExpiring = true;
                this.data[this.currentIndex].rtwLicenseNotVerify = false;
            } else {
                this.data[this.currentIndex].rtwDataNotAvaliable = false;
                this.data[this.currentIndex].isRTWExpiring = false;
                this.data[this.currentIndex].rtwLicenseNotVerify = true;
                this.data[this.currentIndex].RtwProgressIcon = this.rtwYellow;
            }
        } else {
            this.data[this.currentIndex].rtwDataNotAvaliable = false;
            this.data[this.currentIndex].isRTWExpiring = false;
            this.data[this.currentIndex].rtwLicenseNotVerify = true;
            this.data[this.currentIndex].RtwProgressIcon = this.rtwYellow;
        }
        this.FetchMCandSCDetails();
        this.rtwNoDataSectionModal = false;
        this.dispatchEvent(new ShowToastEvent({ title: 'Success', message: 'Data Added Successfully', variant: 'success' }));
    }

    dlDataAdded(event) {
        const addDLExpiryDate = event.detail.dlExpiryDate;
        if (addDLExpiryDate != null || addDLExpiryDate != undefined || addDLExpiryDate != '') {
            if (this.checkDLandRTWExpiry(addDLExpiryDate) == 'expiring') {
                this.data[this.currentIndex].licenseDataNotAvaliable = false;
                this.data[this.currentIndex].isDLExpiring = true;
                this.data[this.currentIndex].drivingLicenseNotVerify = false;
            } else {
                this.data[this.currentIndex].licenseDataNotAvaliable = false;
                this.data[this.currentIndex].isDLExpiring = false;
                this.data[this.currentIndex].drivingLicenseNotVerify = true;
                this.data[this.currentIndex].LiceceProgressIcon = this.licencekYellow;

            }
        } else {
            this.data[this.currentIndex].licenseDataNotAvaliable = false;
            this.data[this.currentIndex].isDLExpiring = false;
            this.data[this.currentIndex].drivingLicenseNotVerify = true;
            this.data[this.currentIndex].LiceceProgressIcon = this.licencekYellow;
        }
        this.FetchMCandSCDetails();
        this.dlNoDataSectionModal = false;
        this.dispatchEvent(new ShowToastEvent({ title: 'Success', message: 'Data Added Successfully', variant: 'success' }));
    }


    disconnectedCallback() {
        document.removeEventListener('click', this.handleOutsideClick.bind(this));
    }

}