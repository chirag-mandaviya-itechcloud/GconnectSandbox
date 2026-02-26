import { LightningElement, track, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getUserContact from '@salesforce/apex/AccountMainContractorController.getUserContact';
import getMCandSCDetails from '@salesforce/apex/AccountMainContractorController.getMCandSCDetails';
import updateAccountClient from '@salesforce/apex/AccountMainContractorController.updateAccountClient';

import getMCDepotDetails from '@salesforce/apex/AccountMainContractorController.getMCDepotDetails';
import getEndUserMCDepotDetails from '@salesforce/apex/AccountMainContractorController.getEndUserMCDepotDetails';
import getRolePicklistValues from '@salesforce/apex/AccountMainContractorController.getRolePicklistValues';
import getRTWandDLfiles from '@salesforce/apex/AccountMainContractorController.getRTWandDLfiles';
import fetchDeductionRemainAmt from '@salesforce/apex/DeductionController.fetchDeductionRemainAmt';
import saveUplodededFiles from '@salesforce/apex/ImageUploaderController.saveUplodededFiles';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateDocumentType from '@salesforce/apex/AccountMainContractorController.updateDocumentType';
import MC_Site_URL from '@salesforce/label/c.MC_Site_URL';
import deleteByContentVersionId from '@salesforce/apex/AccountMainContractorController.deleteByContentVersionId';

import USER_ID from "@salesforce/user/Id";
import { CurrentPageReference } from 'lightning/navigation';

import HEADER_ICONS from '@salesforce/resourceUrl/Header_Icons';
import getMultiplePicklistValues from '@salesforce/apex/ConnectAppController.getMultiplePicklistValues';
import sendVerificationLinkEmail from '@salesforce/apex/ConnectAppController.sendVerificationLinkEmail';
import createRTWandDLDocument from '@salesforce/apex/AccountMainContractorController.createRTWandDLDocument';

export default class GconnectContractor extends NavigationMixin(LightningElement) {

    @api recordId;
    @track data = [];
    @track originalData = [];

    MC_Site_URL = MC_Site_URL;

    @track pdfIcon = `${HEADER_ICONS}/HeaderIcons/PDF.png`;

    @track fileUploadIcon = `${HEADER_ICONS}/HeaderIcons/FileUpload.png`;
    @track ascDscIcon = `${HEADER_ICONS}/HeaderIcons/AscDsc.png`;
    @track recordMenuIcon = `${HEADER_ICONS}/HeaderIcons/RecordMenu.png`;
    @track editIcon = `${HEADER_ICONS}/HeaderIcons/Edit.png`;

    @track collectDetails = {};
    @track depotList = [];
    @track depotOptions = [];
    @track relatedDepotOptions = [];
    @track selectedDepotName;
    @track roleOptions = [];
    @track error;
    @track contactId;
    selectedTabLabel;
    isGeneralActive = true;
    isComplianceActive = false;
    isFinanceActive = false;
    @track visibleNewContractorModal = false;

    @track isRightToWorkModalOpen = false;
    @track isDrivingLicenseModelOpen = false;
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

    @track parsedResultForDepot = [];
    SelectEndUser;
    selectDepot;
    selectedRole;

    @track uploadSectionName;
    @track sectionTitle;
    @track visibleUploadSection = false;
    @track isConfirmModalOpen = false;

    @track backGroundCheckVar = false;
    @track toxicologyCheckVar = false;
    @track scStatusVar = null;

    @track currentIndex;


    @track imageLoading = true;
    @track imagesNotAvailable = false;
    @track imagesAvailable = false;
    isAscending = true;
    @track confirmAction = null;
    @track filteredStatusList = ['Engaged', 'Dormant'];

    @track isDLVerfiedCheck = false;
    @track verifiedDLName = null;

    @track isRTWVerfiedCheck = false;
    @track verifiedRTWName = null;

    @track visibleRecordMenu = false;
    @track isBackgroundCheckColumn = false;
    @track isToxicologyColumn = false;

    @track selectedDriverId;
    @track openDisengageConfirm = false;
    @track drivingLicenseExpiryDate;
    @track selectedDriverName;

    @track isDisenegaeLoader = false;
    @track hasActiveDeduction = false;
    @track remainDeductionList = [];
    @track totalRemainDeductionBalance = 0;

    @track SearchName;
    @track selectedValueEndUser;
    @track selectedValueDepot;
    @track selectedValueRole;


    @track rightToWorkEditOpen = false;
    @track rightToWorkNotShowVerified = true;
    @track drivingLicenseEditOpen = false;
    @track drivingLicenseNotShowVerified = true;

    @track hideValidateContent = false;
    @track hideValidateButton = false;
    @track hideDLValidateButton = false;
    @track showExpiredError = false

    @track hideDLValidateContent = false;
    @track showDLExpiredError = false;

    @track showFileUploadButton = false;

    @track isFileUploadOpned = false;
    @track showImageCaptureModal = false;
    @track showFileUploadModal = false;
    @track showProfileUploadModal = false;
    @track isFileModuleError = false;
    @track fileModuleError = '';
    @track frontDocFiles = [];
    @track backDocFiles = [];
    @track fileErrorMessage = false;
    @track uploadFiles = [];
    @track rtwNoDataSectionModal = false;
    @track dlNoDataSectionModal = false;

    @track selectedContractorName;

    @track showDLValidateError = false;
    @track showValidateError = false;

    @track currentPageGeneral = 1;
    @track currentPageCompliance = 1;
    @track currentPageFinance = 1;
    @track recordsPerPage = 25;

    @track licenseTypes_option = [];
    @track licenseCategory_option = [];
    @track applyLicenseNumberValidation = false;
    @track recordBasedLicenseCategory = [];

    @track isRTWCheckFileUploded = false;
    @track showRTWCheckError = false;
    @track uplodedRTWCVId = null;
    @track uploadedRTWCheckFiles = null;
    @track isImage = false;
    @track isPreviewEnabled = false;
    @track filePreviewUrl;

    @track showFrontBackRadioBtn = true;
    @track isContinuousSelected = false;
    @track isTimeLimitedSelected = false;
    @track isNoRestrictionsSelected = false;
    @track isHasRestrictionsSelected = false;
    @track noRecordFound = false;
    @track originalContractorData = {}
    @track isExtraFieldEditable = false;
    @track hasShareCodeFile = false;
    @track allowedExtension;
    // new options
    @track rtwDocument_option;
    @track citizenStatus_option;
    @track typeOfVisa_option;
    @track anyWorkRestrictions_option;
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

    @track nonUKConfirmPoints = {
        'one': 'The photograph from the Home Office online check matches the person presenting themselves',
        'two': 'I have verified this person is the individual to whom the immigration status belongs',
        'three': 'The Home Office profile PDF has been uploaded and retained'
    }

    @track UKConfirmPoints = {
        'one': 'The photograph on this document matches the person presenting it',
        'two': 'I have verified this person is the rightful holder',
        'three': 'The document appears genuine and all images are clear'
    }

    @track documentNames = [];
    @track restrictedStatuses = ['British passport/UK National', 'EU/EEA/Swiss Citizen', 'Rest Of The World'];

    @wire(CurrentPageReference)
    getPageParameters(currentPageReference) {
        if (currentPageReference) {

            this.globalSearchValue = currentPageReference.state.name;
            if (this.globalSearchValue != null && this.data != null) {
                if (this.originalData != null) {
                    this.data = [...this.originalData];
                }

                this.data = this.data.filter(contractor => {
                    const nameMatch = !this.globalSearchValue.toLowerCase() || contractor.Client_Name__c.toLowerCase().includes(this.globalSearchValue.toLowerCase());
                    return nameMatch;
                });
                this.currentPageGeneral = 1;
            }
            console.log('currentPageReference.state.complianceFilter : ', currentPageReference.state.complianceFilter);
            if (currentPageReference.state.complianceFilter != null) {
                this.complianceFilter = currentPageReference.state.complianceFilter;
                this.complianceFilterSearch();
            }
        }
    }

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
        { id: 1, label: "General Details", isActive: true },
        { id: 2, label: "Compliance", isActive: false },
        //{ id: 3, label: "Finance", isActive: false }
    ]

    get totalPagesGeneral() {
        return Math.ceil(this.data.length / this.recordsPerPage);
    }

    get paginatedDataGeneral() {
        const startIndex = (this.currentPageGeneral - 1) * this.recordsPerPage;
        const endIndex = startIndex + this.recordsPerPage;
        return this.data.slice(startIndex, endIndex);
    }

    get disableNextGeneralButton() {
        return this.currentPageGeneral === this.totalPagesGeneral;
    }

    get disablePreviousGeneralButton() {
        return this.currentPageGeneral === 1;
    }

    get showNonUKConfirmPoints() {
        return this.selectedContractor.Citizenship_Immigration_status__c === 'Non-UK National';
    }


    connectedCallback() {
        this.isLoading = true;
        this.selectedTabLabel = 'General Details';

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
                    background-color: var(--color-secondary) !important;
                    border:none;
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

                                }
                            }

                        })
                        .catch((error) => {
                            console.log('Error:', error);
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

    renderedCallback() {
        const element = this.template.querySelector('[data-tab="' + this.selectedTabLabel + '"]');
        if (element) {
            element.classList.add('selectedTab');
        } else {
            console.log('Element not found');
        }
    }

    handleNextGeneralPage() {
        if (this.currentPageGeneral < this.totalPagesGeneral) {
            this.currentPageGeneral = this.currentPageGeneral + 1;
        }
    }

    handlePreviousGeneralPage() {
        if (this.currentPageGeneral > 1) {
            this.currentPageGeneral = this.currentPageGeneral - 1;
        }
    }

    handleOnchangeInputGeneralPage(event) {
        const inputPage = Number(event.target.value);


        // Check if the "Enter" key was pressed
        if (event.key === 'Enter') {
            if (inputPage >= 1 && inputPage <= this.totalPagesGeneral) {
                this.currentPageGeneral = inputPage; // Navigate to the entered page
            } else {
                // Optionally, reset the input or show an error if the page number is invalid
                event.target.value = this.currentPageGeneral;
            }
        }
    }

    //------------------------------------------------------------------------------

    get totalPagesCompliance() {
        return Math.ceil(this.data.length / this.recordsPerPage);
    }

    get paginatedDataCompliance() {
        const startIndex = (this.currentPageCompliance - 1) * this.recordsPerPage;
        const endIndex = startIndex + this.recordsPerPage;
        return this.data.slice(startIndex, endIndex);
    }

    get disableNextComplianceButton() {
        return this.currentPageCompliance === this.totalPagesCompliance;
    }

    get disablePreviousComplianceButton() {
        return this.currentPageCompliance === 1;
    }

    handleNextCompliancePage() {
        if (this.currentPageCompliance < this.totalPagesCompliance) {
            this.currentPageCompliance = this.currentPageCompliance + 1;
        }
    }

    handlePreviousCompliancePage() {
        if (this.currentPageCompliance > 1) {
            this.currentPageCompliance = this.currentPageCompliance - 1;
        }
    }

    handleOnchangeInputCompliancePage(event) {
        const inputPage = Number(event.target.value);


        // Check if the "Enter" key was pressed
        if (event.key === 'Enter') {
            if (inputPage >= 1 && inputPage <= this.totalPagesCompliance) {
                this.currentPageCompliance = inputPage; // Navigate to the entered page
            } else {
                // Optionally, reset the input or show an error if the page number is invalid
                event.target.value = this.currentPageCompliance;
            }
        }
    }

    //-------------------------------------------------------------------------------

    get totalPagesFinance() {
        return Math.ceil(this.data.length / this.recordsPerPage);
    }

    get paginatedDataFinance() {
        const startIndex = (this.currentPageFinance - 1) * this.recordsPerPage;
        const endIndex = startIndex + this.recordsPerPage;
        return this.data.slice(startIndex, endIndex);
    }

    get disableNextFinanceButton() {
        return this.currentPageFinance === this.totalPagesFinance;
    }

    get disablePreviousFinanceButton() {
        return this.currentPageFinance === 1;
    }
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

    handleNextFinancePage() {
        if (this.currentPageFinance < this.totalPagesFinance) {
            this.currentPageFinance = this.currentPageFinance + 1;
        }
    }

    handlePreviousFinancePage() {
        if (this.currentPageFinance > 1) {
            this.currentPageFinance = this.currentPageFinance - 1;
        }
    }

    handleOnchangeInputFinancePage(event) {
        const inputPage = Number(event.target.value);


        // Check if the "Enter" key was pressed
        if (event.key === 'Enter') {
            if (inputPage >= 1 && inputPage <= this.totalPagesFinance) {
                this.currentPageFinance = inputPage; // Navigate to the entered page
            } else {
                // Optionally, reset the input or show an error if the page number is invalid
                event.target.value = this.currentPageFinance;
            }
        }
    }

    //-------------------------------------------------------------------------------



    get showNameNi() {
        return (
            this.selectedContractor?.clientName ||
            this.selectedContractor?.nationalInsurance
        );
    }
    get showSection() {
        return !this.selectedContractor?.hasAccessCode
            && this.selectedContractor?.hasShareCode;
    }


    FetchMCandSCDetails() {
        let accountIdList = [];
        this.isLoading = true;
        getMCandSCDetails({ contactId: this.contactId, scStatusList: this.filteredStatusList })
            .then(result => {

                if (result == null) {
                    this.noRecordFound = true;
                    this.isLoading = false;
                    return;
                }

                this.originalData = JSON.parse(JSON.stringify(result));
                this.data = [...this.originalData];



                this.data.forEach((item) => {

                    accountIdList.push(item.id);
                    item.visibleRecordMenu = false;
                    item.hasAccessCode = item.hasOwnProperty('Access_Code__c') && item.Access_Code__c !== null ? true : false;
                    item.hasShareCode = item.hasOwnProperty('Share_Code__c') && item.Share_Code__c !== null ? true : false;
                    item.hasSettledStatus = item.hasOwnProperty('Settled_Status__c') && item.Settled_Status__c !== null ? true : false;
                    item.hasBiometric = item.hasOwnProperty('Biometric_Evidence__c') && item.Biometric_Evidence__c !== null ? true : false;
                    item.hasEntryDate = item.hasOwnProperty('Date_of_Entry__c') && item.Date_of_Entry__c !== null ? true : false;
                    item.hasRTWDoc = item.hasOwnProperty('Right_to_work_document__c') && item.Right_to_work_document__c !== null ? true : false;
                    item.hasExpiryDate = item.hasOwnProperty('RTW_Expiry_Date__c') && item.RTW_Expiry_Date__c !== null ? true : false;
                    item.hasEVisa = item.hasOwnProperty('Type_of_e_visa__c') && item.Type_of_e_visa__c !== null ? true : false;
                    // item.hasPermissionExpiryDate = item.hasOwnProperty('Permission_Expiry_Date__c') && item.Permission_Expiry_Date__c !== null ? true : false;
                    if (item.hasOwnProperty('Permission_Expiry_Date__c') && item.Permission_Expiry_Date__c !== null) {
                        item.hasPermissionExpiryDate = true;

                        const expiryDate = new Date(item.Permission_Expiry_Date__c);
                        expiryDate.setDate(expiryDate.getDate() - 90);

                        item.followUpCheckDate = expiryDate.toISOString().split('T')[0];
                    } else {
                        item.hasPermissionExpiryDate = false;
                        item.followUpCheckDate = null;
                    }
                    item.hasAnyWorkRestrictions = item.hasOwnProperty('Any_work_restrictions__c') && item.Any_work_restrictions__c !== null ? true : false;
                    item.hasLimitedToSpecificJobTypes = item.hasOwnProperty('Limited_To_Specific_Job_Types__c') && item.Limited_To_Specific_Job_Types__c !== null ? true : false;
                    item.hasLimitedToHoursPerWeek = item.hasOwnProperty('Limited_To_X_Hours_Per_Week__c') && item.Limited_To_X_Hours_Per_Week__c !== null ? true : false;
                    item.hasOtherRestrictions = item.hasOwnProperty('Other_Restrictions__c') && item.Other_Restrictions__c !== null ? true : false;

                    item.hasProfilePic = item.hasOwnProperty('ProfilePic_Base64') && item.ProfilePic_Base64 !== null ? true : false;
                    item.VAT_Number_Entry__c = item.hasOwnProperty('VAT_Number_Entry__c') && item.VAT_Number_Entry__c !== null ? item.VAT_Number_Entry__c : '-';
                    item.URT_Number_Entry__c = item.hasOwnProperty('URT_Number_Entry__c') && item.URT_Number_Entry__c !== null ? item.URT_Number_Entry__c : '-';
                    item.hasEVisa = item.hasOwnProperty('Type_of_e_visa__c') && item.Type_of_e_visa__c !== null ? true : false;

                    if (item.hasOwnProperty('Type_of_e_visa__c') && item.Type_of_e_visa__c == 'Time-limited right to work') {
                        item.showTimeLimitedSection = true;
                    } else {
                        item.showTimeLimitedSection = false;
                    }

                    if (item.hasOwnProperty('Any_work_restrictions__c') && item.Any_work_restrictions__c == 'Yes') {
                        item.showRestrictionsSection = true;
                    } else {
                        item.showRestrictionsSection = false;
                    }


                    item.nationalInsurance = item.hasOwnProperty('National_Insurance_Number__c') && item.National_Insurance_Number__c !== null ? item.National_Insurance_Number__c : '';
                    item.clientName = item.hasOwnProperty('Client_Name__c') && item.Client_Name__c !== null ? item.Client_Name__c : '';

                    item.bypassValidation = item.hasOwnProperty('Citizenship_Immigration_status__c') && item.Citizenship_Immigration_status__c === 'British passport/UK National';

                    item.totalscore = Math.ceil(item.Score__c);
                    item.scoreStyle = this.getProgressStyle(Math.ceil(item.Score__c));

                    item.isDLExpiring = false;
                    item.isDLExpired = false;
                    item.drivingLicenseVerify = false;
                    item.drivingLicenseNotVerify = false;
                    item.licenseDataNotAvaliable = false;
                    item.allowDLEdit = false;
                    item.requiredDLEdit = true;
                    if (item.hasOwnProperty('Driving_Licence_Number__c') && item.Driving_Licence_Number__c !== null) {
                        if (item.Driving_Licence_Expiry_Date__c) {
                            let licenseExpiryStatus = this.checkDLandRTWExpiry(item.Driving_Licence_Expiry_Date__c);
                            item.licenseExpiredIn = this.calculateLicenseExpiry(item.Driving_Licence_Expiry_Date__c);
                            if (licenseExpiryStatus == 'expiring') {
                                item.isDLExpiring = true;
                                item.allowDLEdit = true;
                            }
                            if (licenseExpiryStatus == 'expired') {
                                item.isDLExpired = true;
                                item.allowDLEdit = true;
                                item.requiredDLEdit = true;
                            }
                        }
                        if (item.isDLExpiring == false && item.isDLExpired == false) {
                            if (item.isDriving_License_Verify__c) {
                                item.drivingLicenseVerify = true;
                                // ADD ON EDIT FOR VERIFIED DRIVER SECTION
                                item.allowDLEdit = true;
                            }
                            else {
                                item.drivingLicenseNotVerify = true;
                                item.allowDLEdit = true;
                            }
                        }
                    } else {
                        item.licenseDataNotAvaliable = true;
                    }


                    item.isRTWExpiring = false;
                    item.isRTWExpired = false;
                    item.rtwLicenseVerify = false;
                    item.rtwLicenseNotVerify = false;
                    item.rtwDataNotAvaliable = false;
                    item.allowRTWEdit = false;
                    item.requiredRTWEdit = true;
                    if (item.hasOwnProperty('Citizenship_Immigration_status__c') && item.Citizenship_Immigration_status__c !== null) {
                        // if (item.RTW_Expiry_Date__c) {
                        // CHECK EXPIRY - PRIORITY ORDER
                        let expiryDateToCheck = null;
                        let rtwExpiryStatus = null;

                        // Priority 1: Check Permission_Expiry_Date__c first (for Share Code scenarios)
                        if (item.Permission_Expiry_Date__c) {
                            expiryDateToCheck = item.Permission_Expiry_Date__c;
                            rtwExpiryStatus = this.checkDLandRTWExpiry(expiryDateToCheck);
                        }
                        // Priority 2: Check RTW_Expiry_Date__c if no Permission date
                        else if (!item.bypassValidation && item.RTW_Expiry_Date__c) {
                            expiryDateToCheck = item.RTW_Expiry_Date__c;
                            rtwExpiryStatus = this.checkDLandRTWExpiry(expiryDateToCheck);
                        }
                        // adding the RTW british passport validation
                        if (!item.bypassValidation && item.RTW_Expiry_Date__c) {
                            let rtwExpiryStatus = this.checkDLandRTWExpiry(item.RTW_Expiry_Date__c);
                            if (rtwExpiryStatus == 'expiring') {
                                item.isRTWExpiring = true;
                                item.allowRTWEdit = true;
                            }
                            if (rtwExpiryStatus == 'expired') {
                                item.isRTWExpired = true;
                                item.allowRTWEdit = true;
                                item.requiredRTWEdit = true;
                                item.RtwProgressIcon = this.rtwRed;
                            }
                        } else {
                            // No expiry issues
                            if (item.is_Right_to_Work_Verify__c) {
                                item.rtwLicenseVerify = true;
                                item.allowRTWEdit = true;
                                item.RtwProgressIcon = this.rtwGreen;
                            } else {
                                item.rtwLicenseNotVerify = true;
                                item.allowRTWEdit = true;
                                item.RtwProgressIcon = this.rtwYellow;
                            }
                        }
                        if (item.hasOwnProperty('Permission_Expiry_Date__c') && item.Permission_Expiry_Date__c) {
                            console.log('item.Permission_Expiry_Date__c', item.Permission_Expiry_Date__c);
                            console.log('this.checkDLandRTWExpiry(item.Permission_Expiry_Date__c)', this.checkDLandRTWExpiry(item.Permission_Expiry_Date__c));
                            if (this.checkDLandRTWExpiry(item.Permission_Expiry_Date__c) == 'expiring') {
                                item.RtwProgressIcon = this.rtwLightRed;
                            }
                            if (this.checkDLandRTWExpiry(item.Permission_Expiry_Date__c) == 'expired') {
                                item.RtwProgressIcon = this.rtwRed;

                            }
                        }
                        if (item.isRTWExpiring == false && item.isRTWExpired == false) {
                            if (item.is_Right_to_Work_Verify__c) {
                                item.rtwLicenseVerify = true;
                                // ADD FOR ALLOW RTW EDIT
                                item.allowRTWEdit = true;
                            }
                            else {
                                item.rtwLicenseNotVerify = true;
                                item.allowRTWEdit = true;
                            }
                        }
                    } else {
                        item.rtwDataNotAvaliable = true;
                    }
                    let documentNames = [];
                    const status = item.Citizenship_Immigration_status__c;
                    const documentValue = item.Right_to_work_document__c;

                    item.allowRTWEdit = !this.restrictedStatuses.includes(status);

                    let documentLength = 0;

                    if (item.allowRTWEdit && status && documentValue && this.allowedRTWOptions[status]) {
                        const selectedOption = this.allowedRTWOptions[status].find(option => option.value === documentValue);

                        if (selectedOption && selectedOption.documentType) {
                            documentNames = [...selectedOption.documentType];
                            documentLength = selectedOption.documentType.length;
                        }
                    }

                    item.doubleRTWImage = documentLength > 1;

                    item.rtwFrontDocumentName = documentNames[0] || 'Document';
                    item.rtwBackDocumentName = documentNames[1] || '';

                    item.remainingScore = 100 - item.totalscore;
                    item.scoreTooltip = this.buildScoreTooltip(item);

                    switch (item.SC_Status__c) {
                        case 'Engaged':
                            item.statusClass = 'status-green';
                            item.contractClass = 'rtwVerifiedButton';
                            item.contractLabel = 'Signed';
                            item.displaysign = true;
                            item.isEngagedDormant = true;
                            break;
                        case 'Dormant':
                            item.statusClass = 'status-yellow';
                            item.contractClass = 'rtwVerifiedButton';
                            item.contractLabel = 'Signed';
                            item.displaysign = true;
                            item.isEngagedDormant = true;
                            break;
                        case 'Documents Completed':
                            item.statusClass = 'labelTypeButton';
                            item.contractClass = 'rtwVerifiedButton';
                            item.contractLabel = 'Signed';
                            item.displaysign = true;
                            item.isEngagedDormant = false;
                            break;
                        case 'Disengaged':
                            item.statusClass = 'labelTypeButton';
                            item.contractClass = 'rtwVerifiedButton';
                            item.contractLabel = 'Signed';
                            item.displaysign = true;
                            item.isEngagedDormant = false;
                            break;
                        case 'Contracts Sent':
                            item.statusClass = 'labelTypeButton';
                            item.contractClass = 'rtwButton';
                            item.contractLabel = 'Pending'
                            item.displaysign = false;
                            item.isEngagedDormant = false;
                            break;
                        case 'Contracts Pending':
                            item.statusClass = 'labelTypeButton';
                            item.contractClass = 'rtwButton';
                            item.contractLabel = 'Pending'
                            item.displaysign = false;
                            item.isEngagedDormant = false;
                            break;
                        case 'Onboarding Initiated':
                            item.statusClass = 'labelTypeButton';
                            item.contractClass = 'rtwButton';
                            item.contractLabel = 'Pending'
                            item.displaysign = false;
                            item.isEngagedDormant = false;
                            break;
                        case 'Onboarding':
                            item.statusClass = 'labelTypeButton';
                            item.contractClass = 'rtwButton';
                            item.contractLabel = 'Pending'
                            item.displaysign = false;
                            item.isEngagedDormant = false;
                            break;
                        default:
                            item.statusClass = 'labelTypeButton';
                            item.contractClass = 'labelTypeButton';
                            item.contractLabel = item.SC_Status__c;
                            item.displaysign = false;
                            item.isEngagedDormant = false;
                            break;
                    }
                    if (item.isBackground_Check__c == true) {
                        this.isBackgroundCheckColumn = true
                    }
                    if (item.isToxicology_Validate__c == true) {
                        this.isToxicologyColumn = true
                    }

                    if (item.Background_Check_Status__c == 'Passed') {
                        item.BackCheckStatus = true;
                        item.expressionBackPass = true;
                    } else if (item.Background_Check_Status__c == 'Fail') {
                        item.BackCheckStatus = true;
                        item.expressionBackPass = false;
                    } else {
                        item.BackCheckStatus = false;
                        item.expressionBackPass = false;
                    }
                    if (item.Toxicology_Status__c == 'Passed') {
                        item.ToxicologyCheckStatus = true;
                        item.expressionPassTox = true;
                    } else if (item.Toxicology_Status__c == 'Fail') {
                        item.ToxicologyCheckStatus = true;
                        item.expressionPassTox = false;
                    }
                    else {
                        item.ToxicologyCheckStatus = false;
                        item.expressionPassTox = false;
                    }


                    if (item.isDriving_License_Verify__c && item.is_Right_to_Work_Verify__c && item.SC_Status__c == 'Engaged'
                        && this.isBackgroundCheckColumn && (item.Background_Check_Status__c == 'Passed' || item.backGroundCheckVar == 'Passed')
                        && this.isToxicologyColumn && (item.Toxicology_Status__c == 'Passed' || item.toxicologyCheckVar == 'Passed')) {
                        item.isEvidence_Checked__c = true;
                    }
                    else if (item.isDriving_License_Verify__c && item.is_Right_to_Work_Verify__c && item.SC_Status__c == 'Engaged'
                        && this.isBackgroundCheckColumn == false
                        && this.isToxicologyColumn && (item.Toxicology_Status__c == 'Passed' || item.toxicologyCheckVar == 'Passed')) {
                        item.isEvidence_Checked__c = true;
                    }
                    else if (item.isDriving_License_Verify__c && item.is_Right_to_Work_Verify__c && item.SC_Status__c == 'Engaged'
                        && this.isBackgroundCheckColumn && (item.Background_Check_Status__c == 'Passed' || item.backGroundCheckVar == 'Passed')
                        && this.isToxicologyColumn == false) {
                        item.isEvidence_Checked__c = true;
                    }
                    else if (item.isDriving_License_Verify__c && item.is_Right_to_Work_Verify__c && item.SC_Status__c == 'Engaged'
                        && this.isBackgroundCheckColumn == false && this.isToxicologyColumn == false) {
                        item.isEvidence_Checked__c = true;
                    }
                    else {
                        item.isEvidence_Checked__c = false;
                    }

                    if (item) {

                        if (!item.hasOwnProperty('Role__c')) {
                            item.Role__c = '';
                        }

                        if (!item.hasOwnProperty('End_User_Name__c')) {
                            item.End_User_Name__c = '';
                        }

                        if (!item.hasOwnProperty('Depot_Name__c')) {
                            item.Depot_Name__c = '';
                        }
                    }


                })
                console.log('this.data--> Engaged', JSON.parse(JSON.stringify(this.data)));
                if (this.globalSearchValue != null) {
                    this.data = this.data.filter(contractor => {
                        const nameMatch = !this.globalSearchValue.toLowerCase() || contractor.Client_Name__c.toLowerCase().includes(this.globalSearchValue.toLowerCase());
                        return nameMatch;
                    });
                }
                this.data = this.originalData.filter(contractor => {
                    const nameMatch = !this.searchName || contractor.Client_Name__c.toLowerCase().includes(this.searchName);
                    const endUserMatch = !this.selectEndUser || contractor.End_User_Name__c.toLowerCase().includes(this.selectEndUser);
                    const depotMatch = !this.selectDepot || contractor.Depot_Name__c.toLowerCase().includes(this.selectDepot);
                    const roleMatch = !this.selectedRole || contractor.Role__c.toLowerCase().includes(this.selectedRole);
                    return nameMatch && endUserMatch && depotMatch && roleMatch;
                });
                if (this.complianceFilter != null) {
                    this.complianceFilterSearch();
                }
                this.isLoading = false;

            }).catch(error => {
                console.log('Error while Fetching the records', error);
            });
    }

    buildScoreTooltip(item) {
        const lines = [];
        lines.push('Missing / Pending:');

        let hasIssues = false;

        // ----- Driving License -----
        if (item.licenseDataNotAvaliable) {
            lines.push('- Driving License details missing');
            hasIssues = true;
        } else if (item.isDLExpired) {
            lines.push('- Driving License expired');
            hasIssues = true;
        } else if (item.isDLExpiring) {
            lines.push('- Driving License expiring within 90 days');
            hasIssues = true;
        } else if (!item.isDriving_License_Verify__c) {
            lines.push('- Driving License not verified');
            hasIssues = true;
        }

        // // ----- Right to Work -----
        // if (item.rtwDataNotAvaliable) {
        //     lines.push('- Right to Work details missing');
        //     hasIssues = true;
        // } else if (item.isRTWExpired) {
        //     lines.push('- Right to Work expired');
        //     hasIssues = true;
        // } else if (item.isRTWExpiring) {
        //     lines.push('- Right to Work expiring within 90 days');
        //     hasIssues = true;
        // } else if (!item.is_Right_to_Work_Verify__c) {
        //     lines.push('- Right to Work not verified');
        //     hasIssues = true;
        // }
        const isBritishPassport = item.Citizenship_Immigration_status__c === 'British passport/UK National';

        // ----- Right to Work -----
        if (item.rtwDataNotAvaliable) {
            lines.push('- Right to Work details missing');
            hasIssues = true;
        } else if (!isBritishPassport && item.isRTWExpired) {
            lines.push('- Right to Work expired');
            hasIssues = true;
        } else if (!isBritishPassport && item.isRTWExpiring) {
            lines.push('- Right to Work expiring within 90 days');
            hasIssues = true;
        } else if (!item.is_Right_to_Work_Verify__c) {
            lines.push('- Right to Work not verified');
            hasIssues = true;
        }

        // ----- SC Status -----
        if (item.SC_Status__c !== 'Engaged') {
            lines.push('- Contractor not engaged');
            hasIssues = true;
        }

        // ----- Background Check -----
        if (item.isBackground_Check__c && item.Background_Check_Status__c !== 'Passed') {
            lines.push('- Background check pending');
            hasIssues = true;
        }

        // ----- Toxicology -----
        if (item.isToxicology_Validate__c && item.Toxicology_Status__c !== 'Passed') {
            lines.push('- Toxicology check pending');
            hasIssues = true;
        }

        if (!hasIssues) {
            lines.push('- None');
        }

        return lines.join('\n');

    }



    complianceFilterSearch() {
        if (this.data == null || this.data.length == 0) return;

        this.data = this.data.filter(contractor => {
            let isMatch = true;
            if (this.complianceFilter == 'validDL') {
                isMatch = !contractor.isDriving_License_Verify__c && contractor.SC_Status__c == 'Engaged';
            }
            else if (this.complianceFilter == 'validRTW') {
                isMatch = !contractor.is_Right_to_Work_Verify__c && contractor.SC_Status__c == 'Engaged';
            }
            else if (this.complianceFilter == 'validBGC') {
                isMatch = (!contractor.isBackground_Check__c || contractor.Background_Check_Status__c != 'Passed') && contractor.SC_Status__c == 'Engaged';
            }
            else if (this.complianceFilter == 'validToxicology') {
                isMatch = (!contractor.isToxicology_Validate__c || contractor.Toxicology_Status__c != 'Passed') && contractor.SC_Status__c == 'Engaged';
            }
            else if (this.complianceFilter == 'expiredDL') {
                isMatch = contractor.DL_Expiration__c == 'Expired' && contractor.SC_Status__c == 'Engaged';
            }
            else if (this.complianceFilter == 'expiredRTW') {
                isMatch = contractor.RTW_Expiration__c == 'Expired' && contractor.SC_Status__c == 'Engaged';
            }
            else if (this.complianceFilter == 'scoreEngaged') {
                isMatch = contractor.SC_Status__c == 'Engaged';
            }
            else if (this.complianceFilter == 'scoreDormant') {
                isMatch = contractor.SC_Status__c == 'Dormant';
            }
            console.log('isMatch : ', isMatch);
            return isMatch;
        });
        console.log('this.data : ', this.data);
        if (this.complianceFilter != 'scoreEngaged' && this.complianceFilter != 'scoreDormant') {
            const tabItems = this.template.querySelectorAll('.tab');
            tabItems.forEach(item => item.classList.remove('selectedTab'));
            tabItems.forEach(item => {
                if (item.dataset.tab === 'Compliance') {
                    item.classList.add('selectedTab');
                }
            });
            this.selectedTabLabel = 'Compliance';

            this.isGeneralActive = false;
            this.isComplianceActive = true;
            this.isFinanceActive = false;
        }


    }

    handleTabClick(event) {
        this.selectedTabLabel = event.target.dataset.tab;
        this.tabs.forEach(tab => {
            this.isActive = tab.label === this.selectedTabLabel;
        });

        const tabItems = this.template.querySelectorAll('.tab');
        tabItems.forEach(item => item.classList.remove('selectedTab'));
        event.currentTarget.classList.add('selectedTab');

        if (this.selectedTabLabel === 'General Details') {
            this.isGeneralActive = true;
            this.isComplianceActive = false;
            this.isFinanceActive = false;
        }
        else if (this.selectedTabLabel === 'Compliance') {
            this.isGeneralActive = false;
            this.isComplianceActive = true;
            this.isFinanceActive = false;
        }
        else if (this.selectedTabLabel === 'Finance') {
            this.isGeneralActive = false;
            this.isComplianceActive = false;
            this.isFinanceActive = true;
        }
        //this.adjustIndicator(event.currentTarget);

    }

    adjustIndicator(tabElement) {
        const indicator = this.template.querySelector('.tab-indicator');
        indicator.style.width = tabElement.offsetWidth + 'px';
        indicator.style.transform = `translateX(${tabElement.offsetLeft}px)`;
    }

    handleDLVerifiedCheck(event) {
        this.isDLVerfiedCheck = !this.isDLVerfiedCheck;
    }

    // handleDLVerifiedName(event) {
    //     this.verifiedDLName = event.target.value;
    // }


    handleDLVerifiedName(event) {
        const value = event.target.value;
        this.verifiedDLName = value && value.trim() !== '' ? value : null;
    }

    handleRTWVerifiedCheck(event) {
        this.isRTWVerfiedCheck = !this.isRTWVerfiedCheck;
    }

    // handleRTWVerifiedName(event) {
    //     this.verifiedRTWName = event.target.value;
    // }

    handleRTWVerifiedName(event) {
        const value = event.target.value;
        this.verifiedRTWName = value && value.trim() !== '' ? value : null;
    }

    verifyClickHandle(event) {

        this.deactivateFlag();
        const startIndex = (this.currentPageCompliance - 1) * this.recordsPerPage;
        this.currentIndex = parseInt(startIndex) + parseInt(event.target.dataset.index);

        let fileTypeName = null;
        this.backGroundCheckVar = null;
        this.toxicologyCheckVar = null;


        if (event.target.name === 'RTW') {
            const contractor = this.data[this.currentIndex];
            this.originalContractorData = {
                Type_of_e_visa__c: contractor.Type_of_e_visa__c,
                Permission_Expiry_Date__c: contractor.Permission_Expiry_Date__c,
                Any_work_restrictions__c: contractor.Any_work_restrictions__c,
                Limited_To_X_Hours_Per_Week__c: contractor.Limited_To_X_Hours_Per_Week__c,
                Limited_To_Specific_Job_Types__c: contractor.Limited_To_Specific_Job_Types__c,
                Other_Restrictions__c: contractor.Other_Restrictions__c,
                showTimeLimitedSection: contractor.showTimeLimitedSection,
                showRestrictionsSection: contractor.showRestrictionsSection
            };
            this.isRightToWorkModalOpen = true;
            this.uploadSectionName = 'Right To Work Check';
            this.sectionTitle = 'Right To Work';
            //this.visibleUploadSection = true;
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
            this.isBackgroundCheckModelOpen = true;
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
            this.isToxicologyModelOpen = true;
        }

        if (event.target.name == 'failToxicology') {
            this.uploadSectionName = 'Toxicology Check';
            this.sectionTitle = 'Toxicology';
            this.isConfirmModalOpen = true;
            this.backGroundCheckVar = 'Fail';
            this.confirmAction = 'failToxicology';
        }


        if (event.target.name === 'contracts') {
            this.isContractsModelOpen = true;
        }

        if (event.target.name === 'evidence complete') {
            this.isEvidenceCompleteModelOpen = true;
        }
        this.selectedContractor = JSON.parse(JSON.stringify(this.data[this.currentIndex]));
        this.selectedContractor['currentClickIndex'] = this.currentIndex;
        // this.selectedContractorId = this.data[this.currentIndex].Account_ID__c ? this.data[this.currentIndex].Account_ID__c: this.data[this.currentIndex].Id;
        this.selectedContractorId = this.data[this.currentIndex].Id;
        this.selectedContractorName = this.selectedContractor.Client_Name__c;
        console.log('SelectedContractor: ', this.selectedContractor);
        if (this.selectedContractor['isRTWExpired'] == true) {
            this.hideValidateContent = true;
            if (this.selectedContractor['bypassValidation'] != true) {
                this.showExpiredError = true;
            }

        } else {
            this.hideValidateContent = false;
            this.showExpiredError = false;
        }

        if (this.selectedContractor['isDLExpired'] == true) {
            this.hideDLValidateContent = true;
            this.showDLExpiredError = true;
        } else {
            this.hideDLValidateContent = false;
            this.showDLExpiredError = false;
        }

        // added new for not showing initial verifiction for verified
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
                        // ADD for rtw check
                        this.selectedContractor['CheckDoc'] = result.Check;
                        this.hasShareCodeFile = !!result.Check
                        this.isExtraFieldEditable = !!result.Check
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
    openFileDialog() {
        this.template.querySelector('.hidden-file').click();
    }

    cancelModule() {
        if (this.isRightToWorkModalOpen && Object.keys(this.originalContractorData).length > 0) {
            const contractorIndex = this.selectedContractor?.currentClickIndex;

            if (contractorIndex !== undefined) {
                Object.keys(this.originalContractorData).forEach(key => {
                    if (this.selectedContractor) {
                        this.selectedContractor[key] = this.originalContractorData[key];
                    }
                    if (this.data[contractorIndex]) {
                        this.data[contractorIndex][key] = this.originalContractorData[key];
                    }
                });

                this.showTimeLimitedSection = this.originalContractorData.showTimeLimitedSection || false;
                this.showRestrictionsSection = this.originalContractorData.showRestrictionsSection || false;
            }
        }
        this.closeModal();
        this.deleteRTWCheckFile();
    }
    closeModal() {
        this.isRightToWorkModalOpen = false;
        this.isDrivingLicenseModelOpen = false;
        this.isBackgroundCheckModelOpen = false;
        this.isToxicologyModelOpen = false;
        this.isContractsModelOpen = false;
        this.isEvidenceCompleteModelOpen = false;
        this.selectedContractor = {};
        this.visibleNewContractorModal = false;
        this.visibleUploadSection = false;

        this.isDLVerfiedCheck = false;
        this.isRTWVerfiedCheck = false;
        this.verifiedDLName = null;
        this.verifiedRTWName = null;
        this.hideDLValidateButton = false;
        this.rightToWorkEditOpen = false;
        this.drivingLicenseEditOpen = false;
        this.hideValidateContent = false;
        this.hideValidateButton = false;
        this.hideDLValidateContent = false;
        this.showExpiredError = false;
        this.showDLExpiredError = false;
        this.isFileModuleError = false;
        this.fileModuleError = '';
        this.showFileUploadButton = false;
        this.rtwNoDataSectionModal = false;
        this.dlNoDataSectionModal = false;
        this.showDLValidateError = false;

        this.verifiedDLName = null;
        this.isDLVerfiedCheck = false;
        this.showRTWCheckError = false;

        this.isPreviewEnabled = false;
        this.filePreviewUrl = null;
        this.uplodedRTWCVId = null;
        this.uploadedRTWCheckFiles = null;
        this.isRTWCheckFileUploded = false;

        this.showValidateError = false;

        this.rightToWorkNotShowVerified = true;
        this.drivingLicenseNotShowVerified = true;
        this.isExtraFieldEditable = false;
    }

    deactivateFlag() {
        this.isBackgroundCheckModelOpen = false;
        this.isToxicologyModelOpen = false;
        this.selectedContractor = {};
        this.hideValidateContent = false;
        this.hideValidateButton = false;
        this.hideDLValidateContent = false;
        this.hideDLValidateButton = false;
        this.showExpiredError = false;
        this.showDLExpiredError = false;
        this.showFileUploadButton = false;
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
                // this.visibleUploadSection = true;
                //  if(this.uploadedRTWCheckFiles == null && this.isRTWCheckFileUploded == false){
                //     this.showRTWCheckError = true;
                //     return;
                // }
                // return;
                if (this.uploadSectionName == 'Right To Work Check' && this.isRTWVerfiedCheck == true &&
                    this.data[this.currentIndex].hasAccessCode == true && this.verifiedRTWName != null) {
                    // this.data[this.currentIndex].is_Right_to_Work_Verify__c = true;
                    // this.data[this.currentIndex].RTW_Verified_by__c = this.verifiedRTWName;
                    // this.data[this.currentIndex].rtwLicenseVerify = true;
                    // this.data[this.currentIndex].rtwLicenseNotVerify = false;

                    // changedFields.is_Right_to_Work_Verify__c = true;
                    // changedFields.RTW_Verified_by__c = this.verifiedRTWName;
                    // changedFields.rtwLicenseVerify = true;
                    // changedFields.rtwLicenseNotVerify = false;
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
                if (this.selectedContractor.hasShareCode == true && this.hasShareCodeFile == false) {
                    this.showRTWCheckError = true;
                    return;
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
                // if (this.checkDLandRTWExpiry(this.data[this.selectedContractor.currentClickIndex].RTW_Expiry_Date__c) == 'expiring') {
                //     this.data[this.selectedContractor.currentClickIndex].isRTWExpired = false;
                //     this.data[this.selectedContractor.currentClickIndex].rtwLicenseNotVerify = false;
                //     this.data[this.selectedContractor.currentClickIndex].rtwLicenseVerify = false;
                //     this.data[this.selectedContractor.currentClickIndex].RtwProgressIcon = this.rtwLightRed;
                //     this.data[this.selectedContractor.currentClickIndex].isRTWExpiring = true;


                //     changedFields.isRTWExpired = false;
                //     changedFields.isRTWExpiring = true;
                //     changedFields.rtwLicenseNotVerify = false;
                //     changedFields.rtwLicenseVerify = false;
                //     changedFields.RtwProgressIcon = this.rtwLightRed;
                // }
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
        if (targetName === 'RTWValidate' && this.isRTWVerfiedCheck == true && this.selectedContractor.hasAccessCode == true && updateType == 'upload' && this.verifiedRTWName != null) {
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


        if (this.uploadSectionName == 'Background Check' && this.backGroundCheckVar == 'Passed') {
            this.data[this.selectedContractor.currentClickIndex].BackCheckStatus = true;
            this.data[this.selectedContractor.currentClickIndex].expressionBackPass = true;
            this.data[this.selectedContractor.currentClickIndex].backGroundCheckVar = 'Passed';
            updateProceed = true;
        }

        if (this.uploadSectionName == 'Toxicology Check' && this.toxicologyCheckVar == 'Passed') {

            this.data[this.selectedContractor.currentClickIndex].ToxicologyCheckStatus = true;
            this.data[this.selectedContractor.currentClickIndex].expressionPassTox = true;
            this.data[this.selectedContractor.currentClickIndex].toxicologyCheckVar = 'Passed';
            updateProceed = true;
        }
        if (updateProceed == true) {
            this.callUpdateAccountClient(this.data[this.selectedContractor.currentClickIndex]);
        }

    }
    handleSelectContinuousRTW() {
        this.hideValidateContent = false;
        this.rightToWorkNotShowVerified = true;
        const contractorIndex = this.selectedContractor.currentClickIndex;

        // Update both selectedContractor and data array
        this.selectedContractor.Type_of_e_visa__c = 'Continuous right to work';
        this.data[contractorIndex].Type_of_e_visa__c = 'Continuous right to work';

        // Hide sections
        this.showTimeLimitedSection = false;
        this.selectedContractor.showTimeLimitedSection = false;
        this.data[contractorIndex].showTimeLimitedSection = false;

        this.showRestrictionsSection = false;
        this.selectedContractor.showRestrictionsSection = false;
        this.data[contractorIndex].showRestrictionsSection = false;

        // Clear time-limited fields in both selectedContractor and data array
        this.selectedContractor.Permission_Expiry_Date__c = null;
        this.data[contractorIndex].Permission_Expiry_Date__c = null;

        this.selectedContractor.Any_work_restrictions__c = null;
        this.data[contractorIndex].Any_work_restrictions__c = null;

        this.selectedContractor.Limited_To_X_Hours_Per_Week__c = null;
        this.data[contractorIndex].Limited_To_X_Hours_Per_Week__c = null;

        this.selectedContractor.Limited_To_Specific_Job_Types__c = null;
        this.data[contractorIndex].Limited_To_Specific_Job_Types__c = null;

        this.selectedContractor.Other_Restrictions__c = null;
        this.data[contractorIndex].Other_Restrictions__c = null;
        // set selection state for UI
        this.isContinuousSelected = true;
        this.isTimeLimitedSelected = false;
        this.isNoRestrictionsSelected = false;
        this.isHasRestrictionsSelected = false;
    }

    /**
     * Handle selection of Time-Limited Right to Work
     */
    handleSelectTimeLimitedRTW() {
        this.rightToWorkNotShowVerified = true;
        this.hideValidateContent = false;
        const contractorIndex = this.selectedContractor.currentClickIndex;

        // Update both selectedContractor and data array
        this.selectedContractor.Type_of_e_visa__c = 'Time-limited right to work';
        this.data[contractorIndex].Type_of_e_visa__c = 'Time-limited right to work';

        // Show time-limited section
        this.showTimeLimitedSection = true;
        this.selectedContractor.showTimeLimitedSection = true;
        this.data[contractorIndex].showTimeLimitedSection = true;
        // set selection state for UI
        this.isTimeLimitedSelected = true;
        this.isContinuousSelected = false;
    }

    /**
     * Handle selection of No Restrictions
     */
    handleSelectNoRestrictions() {
        this.rightToWorkNotShowVerified = true;
        this.hideValidateContent = false;
        const contractorIndex = this.selectedContractor.currentClickIndex;

        // Update both selectedContractor and data array
        this.selectedContractor.Any_work_restrictions__c = 'No';
        this.data[contractorIndex].Any_work_restrictions__c = 'No';

        // Hide restrictions section
        this.showRestrictionsSection = false;
        this.selectedContractor.showRestrictionsSection = false;
        this.data[contractorIndex].showRestrictionsSection = false;

        // Clear restriction fields in both selectedContractor and data array
        this.selectedContractor.Limited_To_X_Hours_Per_Week__c = null;
        this.data[contractorIndex].Limited_To_X_Hours_Per_Week__c = null;

        this.selectedContractor.Limited_To_Specific_Job_Types__c = null;
        this.data[contractorIndex].Limited_To_Specific_Job_Types__c = null;

        this.selectedContractor.Other_Restrictions__c = null;
        this.data[contractorIndex].Other_Restrictions__c = null;
        // set selection state for UI
        this.isNoRestrictionsSelected = true;
        this.isHasRestrictionsSelected = false;
    }

    /**
     * Handle selection of Has Restrictions
     */
    handleSelectHasRestrictions() {
        this.rightToWorkNotShowVerified = true;
        this.hideValidateContent = false;
        const contractorIndex = this.selectedContractor.currentClickIndex;

        // Update both selectedContractor and data array
        this.selectedContractor.Any_work_restrictions__c = 'Yes';
        this.data[contractorIndex].Any_work_restrictions__c = 'Yes';

        // Show restrictions section
        this.showRestrictionsSection = true;
        this.selectedContractor.showRestrictionsSection = true;
        this.data[contractorIndex].showRestrictionsSection = true;
        // set selection state for UI
        this.isHasRestrictionsSelected = true;
        this.isNoRestrictionsSelected = false;
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
        if (this.confirmAction === 'failBackgroundCheck') {
            this.data[this.selectedContractor.currentClickIndex].backGroundCheckVar = 'Fail';
            this.data[this.selectedContractor.currentClickIndex].SC_Status__c = 'Disengaged';
            this.data[this.selectedContractor.currentClickIndex].BackCheckStatus = true;
            this.data[this.selectedContractor.currentClickIndex].expressionBackPass = false;
        }
        if (this.confirmAction === 'failToxicology') {
            this.data[this.selectedContractor.currentClickIndex].toxicologyCheckVar = 'Fail';
            this.data[this.selectedContractor.currentClickIndex].SC_Status__c = 'Disengaged';
            this.data[this.selectedContractor.currentClickIndex].ToxicologyCheckStatus = true;
            this.data[this.selectedContractor.currentClickIndex].expressionPassTox = false;
        }


        this.closeConfirmModal();
        this.callUpdateAccountClient(this.data[this.selectedContractor.currentClickIndex]);


        this.data = this.data.filter(contractor => {
            return (!contractor.SC_Status__c.toLowerCase().includes('disengaged'));
        });
    }



    callUpdateAccountClient(updatedJsonData) {
        if (updatedJsonData.isDriving_License_Verify__c && updatedJsonData.is_Right_to_Work_Verify__c && updatedJsonData.SC_Status__c == 'Engaged'
            && this.isBackgroundCheckColumn && (updatedJsonData.Background_Check_Status__c == 'Passed' || updatedJsonData.backGroundCheckVar == 'Passed')
            && this.isToxicologyColumn && (updatedJsonData.Toxicology_Status__c == 'Passed' || updatedJsonData.toxicologyCheckVar == 'Passed')) {
            updatedJsonData.isEvidence_Checked__c = true;
        }
        else if (updatedJsonData.isDriving_License_Verify__c && updatedJsonData.is_Right_to_Work_Verify__c && updatedJsonData.SC_Status__c == 'Engaged'
            && this.isBackgroundCheckColumn == false
            && this.isToxicologyColumn && (updatedJsonData.Toxicology_Status__c == 'Passed' || updatedJsonData.toxicologyCheckVar == 'Passed')) {
            updatedJsonData.isEvidence_Checked__c = true;
        }
        else if (updatedJsonData.isDriving_License_Verify__c && updatedJsonData.is_Right_to_Work_Verify__c && updatedJsonData.SC_Status__c == 'Engaged'
            && this.isBackgroundCheckColumn && (updatedJsonData.Background_Check_Status__c == 'Passed' || updatedJsonData.backGroundCheckVar == 'Passed')
            && this.isToxicologyColumn == false) {
            updatedJsonData.isEvidence_Checked__c = true;
        }
        else if (updatedJsonData.isDriving_License_Verify__c && updatedJsonData.is_Right_to_Work_Verify__c && updatedJsonData.SC_Status__c == 'Engaged'
            && this.isBackgroundCheckColumn == false && this.isToxicologyColumn == false) {
            updatedJsonData.isEvidence_Checked__c = true;
        }
        else {
            updatedJsonData.isEvidence_Checked__c = false;
        }

        console.log('updatedJsonData-->', updatedJsonData);
        //console.log('this.FetchMCandSCDetails()-->', this.FetchMCandSCDetails());

        updateAccountClient({ selectedContractorToUpdate: updatedJsonData })
            .then(() => {
                //  refresh before reopening
                this.FetchMCandSCDetails();
                this.closeModal();
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record Updated Successfully.',
                        variant: 'success'
                    })
                );

            })
            .catch(error => {
                console.error('Error updating contractor details: ', error);
            });
    }

    closeConfirmModal() {
        this.isConfirmModalOpen = false;
        this.confirmAction = null;
        this.openDisengageConfirm = false;
    }

    handleCancel() {
        this.closeConfirmModal();
    }

    calculateTotalScore(data) {
        data.forEach(record => {
            let totalSections = 3;
            let verifiedSections = 0;

            // Check various verification statuses and increment accordingly
            if (record.is_Right_to_Work_Verify__c) {
                verifiedSections++;
            }
            if (record.isBackground_Check__c) {
                totalSections++;
                if (record.Background_Check_Status__c === 'Passed') {
                    verifiedSections++;
                }
            }
            if (record.isToxicology_Validate__c) {
                totalSections++;
                if (record.Toxicology_Status__c === 'Passed') {
                    verifiedSections++;
                }
            }

            if (record.SC_Status__c === 'Documents Completed' || record.SC_Status__c === 'Engaged') {
                verifiedSections++;
            }
            if (record.isDriving_License_Verify__c) {
                verifiedSections++;
            }

            // Calculate initial totalscore
            let totalscore = Math.floor((verifiedSections / totalSections) * 100);

            // Apply deduction based on driving license expiry status
            if (record.Driving_Licence_Expiry_Date__c) {
                let dlStatus = this.checkDLandRTWExpiry(record.Driving_Licence_Expiry_Date__c);
                if (dlStatus === 'expired') {
                    totalscore -= 10; // Deduct 10 for expired status
                } else if (dlStatus === 'expiring') {
                    totalscore -= 5; // Deduct 5 for expiring status
                }
            }

            if (record.RTW_Expiry_Date__c) {
                let RTWStatus = this.checkDLandRTWExpiry(record.RTW_Expiry_Date__c);
                if (RTWStatus === 'expired') {
                    totalscore -= 10; // Deduct 10 for expired status
                } else if (RTWStatus === 'expiring') {
                    totalscore -= 5; // Deduct 5 for expiring status
                }
            }

            // Ensure the total score is non-negative
            record.totalscore = Math.max(totalscore, 0);

            // Update the style based on the calculated score
            record.scoreStyle = this.getProgressStyle(record.totalscore);
        });

        return data;
    }


    getProgressStyle(score) {
        let color = 'var(--color-secondary)'; // Default to green for 80-100
        if (score < 40) {
            color = 'var(--color-chart-danger)'; // Red for 0-39
        } else if (score < 80) {
            color = 'var(--color-button-verify-pending-bg)'; // Yellow for 40-79
        }
        return `background: conic-gradient(${color} 0% ${score}%,  #fff ${score}% 100%);`;

    }



    rejectHandler(event) {

        if (event.target.name === 'RTWReject') {
            // Restore original values when canceling
            if (this.selectedContractor && Object.keys(this.originalContractorData).length > 0) {
                const contractorIndex = this.selectedContractor.currentClickIndex;

                // Restore values in both selectedContractor and data array
                Object.keys(this.originalContractorData).forEach(key => {
                    this.selectedContractor[key] = this.originalContractorData[key];
                    if (this.data[contractorIndex]) {
                        this.data[contractorIndex][key] = this.originalContractorData[key];
                    }
                });

                // Reset section visibility flags
                this.showTimeLimitedSection = this.originalContractorData.showTimeLimitedSection || false;
                this.showRestrictionsSection = this.originalContractorData.showRestrictionsSection || false;
            }

            // Clear stored data
            this.originalContractorData = {};
            this.closeModal();
            this.isRightToWorkModalOpen = false;
            //this.deleteRTWCheckFile();
        }

        if (event.target.name === 'drivingReject') {
            this.closeModal();
            this.isDrivingLicenseModelOpen = false;
        }

        if (event.target.name === 'backgroundCheckReject') {
            this.closeModal();
            this.isBackgroundCheckModelOpen = false;
        }

        if (event.target.name === 'toxicologyReject') {
            this.closeModal();
            this.isToxicologyModelOpen = false;
        }

        if (event.target.name === 'contractReject') {
            this.closeModal();
            this.isContractsModelOpen = false;
        }

        if (event.target.name === 'evidenceReject') {
            this.closeModal();
            this.isEvidenceCompleteModelOpen = false;
        }


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
            const nameMatch = !this.searchName || contractor.Client_Name__c.toLowerCase().includes(this.searchName);
            const endUserMatch = !this.selectEndUser || contractor.End_User_Name__c.toLowerCase().includes(this.selectEndUser);
            const depotMatch = !this.selectDepot || contractor.Depot_Name__c.toLowerCase().includes(this.selectDepot);
            const roleMatch = !this.selectedRole || contractor.Role__c.toLowerCase().includes(this.selectedRole);

            return nameMatch && endUserMatch && depotMatch && roleMatch;
        });
        this.currentPageGeneral = 1;
        this.currentPageCompliance = 1;
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



    handleAddContractor(event) {
        this.visibleNewContractorModal = true;
    }

    handleFinished(event) {
        this.visibleNewContractorModal = false;
    }

    handleUploadFile(event) {
        this.template.querySelector("lightning-file-upload").click()
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
        this.isDisenegaeLoader = true;
        this.selectedDriverId = event.target.dataset.selectedId;
        this.selectedDriverName = event.target.dataset.driverName;

        const rec = this.data.find(r => r.Id === selectedId);
        this.selectedContractor = rec ? { ...rec } : {};
        if (!this.selectedContractor.clientName) {
            this.selectedContractor.clientName =
                this.selectedContractor.Driver_Name__c ||
                this.selectedContractor.Client_Name__c ||
                '';
        }
        this.openDisengageConfirm = true;
        fetchDeductionRemainAmt({
            applicationId: this.selectedDriverId,
            mainContractorId: this.data[0].Main_Contractor__c
        })
            .then(result => {
                this.hasActiveDeduction = result.hasActiveDeduction;
                this.deductionList = (result.deductions || []).map(d => ({
                    ...d,
                    balanceAmount: parseFloat(d.balanceAmount).toFixed(2)
                }));
                const total = this.deductionList.reduce((sum, d) => sum + parseFloat(d.balanceAmount), 0);
                this.totalRemainDeductionBalance = total.toFixed(2);
                this.isDisenegaeLoader = false;
            })
            .catch(error => {
                console.error('Error fetching deductions:', error);
                this.hasActiveDeduction = false;
                this.deductionList = [];
                this.totalRemainDeductionBalance = 0;
                this.isDisenegaeLoader = false;
            });
    }

    handleDisengageClick(event) {
        let selectedDriverData = this.data.find(record => record.Id === this.selectedDriverId);
        selectedDriverData.SC_Status__c = 'Disengaged';
        this.callUpdateAccountClient(selectedDriverData);
        this.data = this.data.filter(contractor => {
            return (!contractor.SC_Status__c.toLowerCase().includes('disengaged'));
        });
        this.openDisengageConfirm = false;
    }
    get showGovLink() {
        return this.rightToWorkEditOpen
            && this.selectedContractor?.hasShareCode;
    }

    handleRTWEditClick(event) {
        let previousHideValidateContent = this.hideValidateContent;

        this.hideValidateButton = !this.hideValidateButton;
        this.rightToWorkEditOpen = !this.rightToWorkEditOpen;
        this.showRTWCheckError = false;
        this.selectedContractorId = event.currentTarget.dataset.selectedId;
        this.selectedOption = 'RTW';
        if (this.rightToWorkEditOpen) {
            // Initialize showTimeLimitedSection based on existing Type_of_e_visa__c value
            if (this.selectedContractor.Type_of_e_visa__c === 'Time-limited right to work') {
                this.showTimeLimitedSection = true;
                this.selectedContractor.showTimeLimitedSection = true;

                // Initialize showRestrictionsSection based on existing Any_work_restrictions__c value
                if (this.selectedContractor.Any_work_restrictions__c === 'Yes') {
                    this.showRestrictionsSection = true;
                    this.selectedContractor.showRestrictionsSection = true;
                } else {
                    this.showRestrictionsSection = false;
                    this.selectedContractor.showRestrictionsSection = false;
                }
            } else {
                // If Continuous or no value, hide both sections
                this.showTimeLimitedSection = false;
                this.selectedContractor.showTimeLimitedSection = false;
                this.showRestrictionsSection = false;
                this.selectedContractor.showRestrictionsSection = false;
            }
            // Initialize radio selection booleans for UI classes
            if (this.selectedContractor.Type_of_e_visa__c === 'Time-limited right to work') {
                this.isTimeLimitedSelected = true;
                this.isContinuousSelected = false;
            } else if (this.selectedContractor.Type_of_e_visa__c === 'Continuous right to work') {
                this.isContinuousSelected = true;
                this.isTimeLimitedSelected = false;
            } else {
                this.isContinuousSelected = false;
                this.isTimeLimitedSelected = false;
            }

            if (this.selectedContractor.Any_work_restrictions__c === 'Yes') {
                this.isHasRestrictionsSelected = true;
                this.isNoRestrictionsSelected = false;
            } else if (this.selectedContractor.Any_work_restrictions__c === 'No') {
                this.isNoRestrictionsSelected = true;
                this.isHasRestrictionsSelected = false;
            } else {
                this.isNoRestrictionsSelected = false;
                this.isHasRestrictionsSelected = false;
            }
        }
        if (this.selectedContractor.isRTWExpired == false) {
            this.hideValidateContent = false;//!this.hideValidateContent;

            // if (this.selectedContractor.hasAccessCode == false) {
            //     this.showFileUploadButton = !this.showFileUploadButton;;
            // } else {
            //     this.showFileUploadButton = false;
            // }
            // add showing fileUpload even though access code is present or not
            this.showFileUploadButton = !this.showFileUploadButton;

        }

        if (this.selectedContractor.isRTWExpired == true) {
            this.hideValidateContent = !this.hideValidateContent;
            console.log('this.hideValidateContent : ', this.hideValidateContent);
            if (this.hideValidateContent == false) {
                console.log('this.selectedContractor.hasAccessCode : ', this.selectedContractor.hasAccessCode);
                if (this.selectedContractor.hasAccessCode == false) {
                    this.showFileUploadButton = true;
                } else {
                    this.showFileUploadButton = false;
                }
            } else {
                this.showFileUploadButton = false;
            }
            console.log('this.showFileUploadButton : ', this.showFileUploadButton);
        }

        // added new for not showing initial verifiction for verified
        if (this.selectedContractor['rtwLicenseVerify'] == true || this.selectedContractor['isRTWExpiring'] == true) {
            this.hideValidateContent = !previousHideValidateContent;
            if (this.hideValidateContent == true) {
                this.showValidateError = false;
            }
        }
        // added new for not showing initial verifiction for verified
        if (this.selectedContractor['rtwLicenseVerify'] == true) {
            this.hideValidateContent = true;
            this.rightToWorkNotShowVerified = false;
            console.log('rightToWorkEditOpen', this.rightToWorkEditOpen);
            console.log('rightToWorkNotShowVerified', this.rightToWorkNotShowVerified);
        }
        this.showFrontBackRadioBtn = false;
        this.fileErrorMessage = '';
    }

    handleRequestNewEvidence(event) {

        const recordId = event.target.dataset.selectedId;

        sendVerificationLinkEmail({ applicationId: recordId })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Verification email sent successfully.',
                        variant: 'success'
                    })
                );

            })
            .catch(error => {
                let errorMessage = 'Error sending verification email';
                if (error?.body?.message) {
                    errorMessage = error.body.message;
                }
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: errorMessage,
                        variant: 'error'
                    })
                );

                console.error(error);
            });
    }

    // handleDLEditClick(event){
    //     this.hideDLValidateButton = !this.hideDLValidateButton;
    //     this.drivingLicenseEditOpen = !this.drivingLicenseEditOpen;
    //     this.selectedContractorId = event.currentTarget.dataset.selectedId;
    //     this.selectedOption = 'DL';
    //     if(this.selectedContractor.isDLExpiring == true ){
    //         this.hideDLValidateContent = !this.hideDLValidateContent;
    //         if(this.hideDLValidateContent){
    //             this.showFileUploadButton = true;
    //         }else{
    //             this.showFileUploadButton = false;
    //         }
    //     }
    //     if(this.selectedContractor.isDLExpired == true ){
    //         if(this.hideDLValidateContent){
    //             this.showFileUploadButton = !this.showFileUploadButton;
    //         }
    //     }
    //     if(this.selectedContractor.drivingLicenseNotVerify == true ){
    //         this.hideDLValidateContent = !this.hideDLValidateContent;
    //         this.showFileUploadButton = this.hideDLValidateContent;
    //     }

    //     this.recordBasedLicenseCategory = this.licenseCategory_option.map(option => {
    //         return {
    //             ...option,
    //             checked: this.selectedContractor['Additional_licence_categories__c'].includes(option.value)
    //         };
    //     });
    //     this.showFrontBackRadioBtn = true;
    //     this.fileErrorMessage = '';
    // }
    handleDLEditClick(event) {
        let previousHideDLValidateContent = this.hideDLValidateContent;
        this.hideDLValidateButton = !this.hideDLValidateButton;
        this.drivingLicenseEditOpen = !this.drivingLicenseEditOpen;
        this.showRTWCheckError = false;
        this.selectedContractorId = event.currentTarget.dataset.selectedId;
        this.selectedOption = 'DL';

        console.log('this.showFileUploadButton : ', this.showFileUploadButton);
        console.log('this.hideDLValidateContent : ', this.hideDLValidateContent);
        if (this.selectedContractor.isDLExpiring == true) {
            this.hideDLValidateContent = false;//!this.hideDLValidateContent;
            this.showFileUploadButton = !this.showFileUploadButton;

        }
        if (this.selectedContractor.isDLExpired == true) {
            this.hideDLValidateContent = !this.hideDLValidateContent;
            this.showFileUploadButton = !this.showFileUploadButton;
        }
        if (this.selectedContractor.drivingLicenseNotVerify == true) {
            this.hideDLValidateContent = false;//!this.hideDLValidateContent;
            this.showFileUploadButton = !this.showFileUploadButton;
        }

        // added for verified edit button
        if (this.selectedContractor.drivingLicenseVerify == true) {
            this.showFileUploadButton = !this.showFileUploadButton;
        }
        // this.recordBasedLicenseCategory = this.licenseCategory_option.map(option => {
        //     return {
        //         ...option,
        //         checked: this.selectedContractor['Additional_licence_categories__c'].includes(option.value)
        //     };
        // });

        // added new for not showing initial verifiction for verified
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

        console.log('AFTER :: this.showFileUploadButton : ', this.showFileUploadButton);
        console.log('AFTER :; this.hideDLValidateContent : ', this.hideDLValidateContent);
    }


    onChangeRTWDetails(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value.trim();
        const contractorIndex = this.selectedContractor.currentClickIndex;
        this.hideValidateContent = false;
        this.rightToWorkNotShowVerified = true;
        console.log('validation: ', event.target.dataset.passvalidation);
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
            const selectedDate = new Date(event.target.value);
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
            //this.data[contractorIndex].licenseIssueDate = fieldValue;
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


    async saveRTWandDLdata() {
        let updateProceed = false;
        let allFieldsValid = true;
        const childComp = this.template.querySelector('c-image-capture');
        let inputFields;

        if (this.selectedOption == 'RTW') {
            inputFields = this.template.querySelectorAll('.expiryDate-edit');
        } else {
            inputFields = this.template.querySelectorAll('.licenseNumber,.licenseExpiryDate,.typeOfLicense, .licenseIssueDate ,.pointOfLicense');
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
                // Only return error if it's required scenario
                if (this.selectedOption == 'RTW') {
                    // For RTW, file is required for both access code and non-access code
                    return;
                } else if (this.selectedOption == 'DL') {
                    return;
                }
            } else {
                this.fileErrorMessage = false;
            }
        }


        if (allFieldsValid) {

            let changedFields = { Id: this.data[this.selectedContractor.currentClickIndex].Id };
            const bypassValidation = this.selectedContractor?.Citizenship_Immigration_status__c === 'British passport/UK National';

            if (this.selectedOption == 'RTW') {
                if (this.selectedContractor.hasShareCode) {

                    // 3a. Type of eVisa required
                    if (!this.data[this.selectedContractor.currentClickIndex].Type_of_e_visa__c) {
                        this.showToast('Error', 'Please select Type of e-Visa.', 'error');
                        return;
                    }

                    // 3b. TIME-LIMITED SPECIFIC VALIDATIONS
                    if (this.data[this.selectedContractor.currentClickIndex].Type_of_e_visa__c === 'Time-limited right to work') {

                        // Permission Expiry Date - Required
                        if (!this.data[this.selectedContractor.currentClickIndex].Permission_Expiry_Date__c) {
                            this.showToast('Error', 'Permission Expiry Date is required for Time-limited right to work.', 'error');
                            return;
                        }

                        // Any Work Restrictions - Required
                        if (!this.data[this.selectedContractor.currentClickIndex].Any_work_restrictions__c) {
                            this.showToast('Error', 'Please select if there are any work restrictions (Yes or No).', 'error');
                            return;
                        }

                        // 3c. RESTRICTIONS DETAILS (if Yes selected)
                        if (this.data[this.selectedContractor.currentClickIndex].Any_work_restrictions__c === 'Yes') {

                            const hasLimitedHours =
                                this.data[this.selectedContractor.currentClickIndex].Limited_To_X_Hours_Per_Week__c &&
                                this.data[this.selectedContractor.currentClickIndex].Limited_To_X_Hours_Per_Week__c.toString().trim() !== '';

                            const hasJobTypes =
                                this.data[this.selectedContractor.currentClickIndex].Limited_To_Specific_Job_Types__c &&
                                this.data[this.selectedContractor.currentClickIndex].Limited_To_Specific_Job_Types__c.trim() !== '';

                            const hasOtherRestrictions =
                                this.data[this.selectedContractor.currentClickIndex].Other_Restrictions__c &&
                                this.data[this.selectedContractor.currentClickIndex].Other_Restrictions__c.trim() !== '';

                            // At least ONE restriction field must be filled
                            // if (!hasLimitedHours && !hasJobTypes && !hasOtherRestrictions) {
                            //     this.showToast(
                            //         'Error',
                            //         'Please provide at least one work restriction detail (Limited Hours, Job Types, or Other Restrictions).',
                            //         'error'
                            //     );
                            //     return;
                            // }
                            if (!hasLimitedHours) {
                                this.showToast(
                                    'Error',
                                    'Limited To X Hours Per Week is required when work restrictions are present.',
                                    'error'
                                );
                                return;
                            }
                            // Validate hours if provided
                            if (hasLimitedHours) {
                                const hours = this.data[this.selectedContractor.currentClickIndex].Limited_To_X_Hours_Per_Week__c;
                                const hoursNumber = Number(hours);

                                if (isNaN(hoursNumber)) {
                                    this.showToast('Error', 'Please enter a valid number for hours per week.', 'error');
                                    return;
                                }

                                if (hoursNumber < 0 || hoursNumber > 168) {
                                    this.showToast('Error', 'Hours per week must be between 0 and 168.', 'error');
                                    return;
                                }
                            }
                            // VALIDATION 3: Job Types - REQUIRED
                            if (!hasJobTypes) {
                                this.showToast(
                                    'Error',
                                    'Limited To Specific Job Types is required when work restrictions are present.',
                                    'error'
                                );
                                return;
                            }

                            // VALIDATION 4: Other Restrictions - REQUIRED
                            if (!hasOtherRestrictions) {
                                this.showToast(
                                    'Error',
                                    'Other Restrictions field is required when work restrictions are present.',
                                    'error'
                                );
                                return;
                            }

                        }
                    }
                }
                if ((this.isRTWVerfiedCheck == false || this.verifiedRTWName == null)) {
                    this.showValidateError = true;
                    return;
                } else {
                    this.showValidateError = false;
                    if (this.isRTWVerfiedCheck == false && this.selectedContractor.hasAccessCode == true) {
                        console.log('Hello');
                        this.visibleUploadSection = false;
                        return;
                    }
                    if (this.isRTWVerfiedCheck == true && this.selectedContractor.hasAccessCode == true) {
                        console.log('true');
                        //  if(this.uploadedRTWCheckFiles == null && this.isRTWCheckFileUploded == false){
                        //         this.showRTWCheckError = true;
                        //         return;
                        //     }
                        //this.visibleUploadSection = true;
                        this.isRightToWorkModalOpen = false;
                        // return;
                    }
                    if (this.selectedContractor.hasShareCode == true && this.isRTWVerfiedCheck == true && this.verifiedRTWName != null) {

                        if (this.selectedContractor.hasShareCode == true && this.hasShareCodeFile == false && this.frontDocFiles.length == 0) {
                            this.fileErrorMessage = true;
                            return;
                        }
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
                    }
                    // add RTW file upload
                    if (this.isRTWVerfiedCheck == true && this.selectedContractor.hasAccessCode == true && this.verifiedRTWName != null) {
                        console.log('RTW with Access Code - Using File Upload Flow');

                        // Check if files are uploaded using the new flow
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
                            RtwProgressIcon: this.rtwGreen
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
                        console.log('this.data[this.selectedContractor.currentClickIndex].expiryDate : ', this.data[this.selectedContractor.currentClickIndex].expiryDate);

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

                        // if (this.checkDLandRTWExpiry(this.data[this.selectedContractor.currentClickIndex].RTW_Expiry_Date__c) == 'expiring') {

                        // adding the RTW british passport validation
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
                        // if (this.checkDLandRTWExpiry(this.data[this.selectedContractor.currentClickIndex].RTW_Expiry_Date__c) == 'expired') {.

                        // adding the RTW british passport validation
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
                        console.log('changedFields : ', changedFields);
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
                            typeOfLicense: this.data[this.selectedContractor.currentClickIndex].typeOfLicense,
                            licenseCategory: this.data[this.selectedContractor.currentClickIndex].licenseCategory,
                            licenseNumber: this.data[this.selectedContractor.currentClickIndex].licenseNumber,
                            pointOfLicense: this.data[this.selectedContractor.currentClickIndex].pointOfLicense,
                            licenseIssueDate: this.data[this.selectedContractor.currentClickIndex].licenseIssueDate,
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
                // if (this.fileErrorMessage == false) {
                //     await this.uploadAllFiles();
                //     if (childComp) {
                //         childComp.resetFiles();
                //     }
                // }
                // this.data[this.selectedContractor.currentClickIndex].isDriving_License_Verify__c = false;
                // this.data[this.selectedContractor.currentClickIndex].Driving_License_Verified_by__c = null;
                // this.data[this.selectedContractor.currentClickIndex].drivingLicenseVerify = false;
                // if (this.checkDLandRTWExpiry(this.data[this.selectedContractor.currentClickIndex].Driving_Licence_Expiry_Date__c) == 'expiring') {
                //     this.data[this.selectedContractor.currentClickIndex].isDLExpired = false;
                //     this.data[this.selectedContractor.currentClickIndex].isDLExpiring = true;
                //     this.data[this.selectedContractor.currentClickIndex].drivingLicenseNotVerify = false;
                // }else{
                //     this.data[this.selectedContractor.currentClickIndex].isDLExpired = false;
                //     this.data[this.selectedContractor.currentClickIndex].isDLExpiring = false;
                //     this.data[this.selectedContractor.currentClickIndex].drivingLicenseNotVerify = true;
                // }
            }

            // await this.callUpdateAccountClient(this.data[this.selectedContractor.currentClickIndex]);
            if (updateProceed) {
                await this.callUpdateAccountClient(changedFields);
            }



        }
    }
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
                // mode: variant === 'error' ? 'sticky' : 'dismissable'
                mode: variant === 'error'
            })
        );
    }

    clickFrontBackUpload(event) {
        // new UI RTW
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

    handleRTWImageError() {
        this.selectedContractor.CheckDoc = undefined;
        this.isExtraFieldEditable = false;
    }

    handleSaveFiles(event) {
        const childComp = this.template.querySelector('c-image-capture');
        if (childComp) {
            const data = childComp.getUploadDocs();
            console.log(data);
            if (data) {
                if (data.uploadFrontFiles.length > 0 || data.capturedFrontFiles.length > 0) {
                    this.frontDocFiles = data.uploadFrontFiles.length > 0 ? data.uploadFrontFiles : data.capturedFrontFiles;

                    // if (!this.showFrontBackRadioBtn) {
                    //     this.selectedContractor.FrontDoc = this.frontDocFiles[0].preview;
                    // }
                    if (!this.showFrontBackRadioBtn) {

                        if (this.selectedOption == 'RTW' && (this.selectedContractor.hasAccessCode || this.selectedContractor.hasShareCode)) {
                            this.selectedContractor.CheckDoc = this.frontDocFiles[0].preview;
                            this.selectedContractor.CheckDocName = this.frontDocFiles[0].name;
                            this.isExtraFieldEditable = true;
                        } else {
                            this.selectedContractor.FrontDoc = this.frontDocFiles[0].preview;
                            this.isExtraFieldEditable = false;
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

    uploadAllFiles() {
        this.uploadFiles = [...this.frontDocFiles, ...this.backDocFiles];
        this.backDocFiles = [];
        this.frontDocFiles = [];

        this.handleUpload();
    }

    handleUpload() {

        try {
            for (const file of this.uploadFiles) {

                // let fileDocName = this.selectedContractor.Client_Name__c + '_' + this.selectedOption + ' ' + file.docType;
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

    rtwDataAdded(event) {
        const addRTWExpiryDate = event.detail.rtwExpiryDate;
        if (addRTWExpiryDate != null) {
            if (this.checkDLandRTWExpiry(addRTWExpiryDate) == 'expiring' || addRTWExpiryDate != undefined || addRTWExpiryDate != '') {
                this.data[this.currentIndex].rtwDataNotAvaliable = false;
                this.data[this.currentIndex].isRTWExpiring = true;
                this.data[this.currentIndex].rtwLicenseNotVerify = false;
            } else {
                this.data[this.currentIndex].rtwDataNotAvaliable = false;
                this.data[this.currentIndex].isRTWExpiring = false;
                this.data[this.currentIndex].rtwLicenseNotVerify = true;
            }
        } else {
            this.data[this.currentIndex].rtwDataNotAvaliable = false;
            this.data[this.currentIndex].isRTWExpiring = false;
            this.data[this.currentIndex].rtwLicenseNotVerify = true;
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
            }
        } else {
            this.data[this.currentIndex].licenseDataNotAvaliable = false;
            this.data[this.currentIndex].isDLExpiring = false;
            this.data[this.currentIndex].drivingLicenseNotVerify = true;
        }
        this.FetchMCandSCDetails();
        this.dlNoDataSectionModal = false;
        this.dispatchEvent(new ShowToastEvent({ title: 'Success', message: 'Data Added Successfully', variant: 'success' }));

    }

    handledownloadRTWfile(event) {
        const docType = event.target.dataset.doctype;
        const accountId = this.selectedContractor.Id;
        console.log('accountId >  OUTPUT : ', accountId);
        console.log('this.selectedContractor  >> OUTPUT : ', this.selectedContractor);
        let validData = false;
        if (docType == 'GConnect DL') {

            // if (this.hasFrontDLImage && this.hasBackDLImage && this.recordData.Driving_Licence_Number__c) {
            //     validData = true;
            // } else {
            //     this.errorMessage = 'No Driving Licence Document available for this SubContractor';
            //     this.showError = true;
            // }
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
    }
    handleDownload(event) {
        const docType = event.target.dataset.doctype;
        const accountId = event.target.dataset.selectedId;
        const citizenship = this.selectedContractor.Citizenship_Immigration_status__c;
        const rtwDocument = this.selectedContractor.Right_to_work_document__c;
        let validData = false;
        let requiredDocCount = 1;

        if (citizenship && this.allowedRTWOptions?.[citizenship]) {
            const selectedOption = this.allowedRTWOptions[citizenship]?.find(opt => opt.value === rtwDocument);
            if (selectedOption?.documentType?.length) requiredDocCount = selectedOption.documentType.length;
        }
        if (docType === 'GConnect RTW') {
            if (requiredDocCount === 1 && this.selectedContractor.FrontDoc) {
                validData = true;
            }
            else if (requiredDocCount === 2 && this.selectedContractor.FrontDoc && this.selectedContractor.BackDoc) {
                validData = true;
            }
            else if ((this.selectedContractor.Access_Code__c && this.selectedContractor.Biometric_Evidence__c === 'No') || this.selectedContractor.Share_Code__c) {
                validData = true;
            }
        }
        if (validData) {
            createRTWandDLDocument({ accountId: accountId, documentType: docType })
                .then(result => {
                    let vfPageName, fileType;
                    if (docType === 'GConnect RTW') { vfPageName = 'RightToWorkEvidence'; fileType = '_RTW_Evidence'; }
                    else if (docType === 'GConnect DL') { vfPageName = 'DrivingLicenceEvidence'; fileType = '_DL_Evidence'; }
                    const firstName = this.selectedContractor.First_Name__c;
                    const lastName = this.selectedContractor.Last_Name__c;
                    const filename = `${firstName}_${lastName}${fileType}.pdf`;
                    const link = document.createElement('a');
                    link.href = this.MC_Site_URL + '/apex/' + vfPageName + '?id=' + accountId;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                })
                .catch(error => { console.error("Error generating document: ", error); });
        }
    }

    /*if (validData) {
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

    }*/

    // handleUploadFinished(event){
    //     this.uploadedRTWCheckFiles = event.detail.files;
    //     this.isRTWCheckFileUploded = false;
    //     this.uplodedRTWCVId = this.uploadedRTWCheckFiles[0].contentVersionId;
    //     if (this.uploadedRTWCheckFiles.length > 0){
    //              this.imageLoading = true;
    //             console.log('this.uplodedRTWCVId : ',this.uplodedRTWCVId);
    //                 this.filePreviewUrl = this.MC_Site_URL + 'sfc/servlet.shepherd/version/download/' +this.uplodedRTWCVId;
    //                 this.isPreviewEnabled = true;

    //             updateDocumentType({ contentVersionId: this.uplodedRTWCVId, docType: 'Right To Work Check' })
    //             .then((result) => {
    //                 this.isRTWCheckFileUploded = true;
    //                 let fileType = result;
    //                 if(fileType == 'JPG' || fileType == 'JPEG' || fileType == 'PNG'){
    //                     this.isImage = true;
    //                     this.imageLoading = false;
    //                     this.showRTWCheckError = false;
    //                 }else{
    //                     this.isImage = false;
    //                     this.imageLoading = false;
    //                 }
    //                 console.log('Succesfully Updated');
    //             })
    //             .catch(error => {
    //                 this.isRTWCheckFileUploded = false;
    //                 this.imageLoading = false;
    //                 console.error('Error in updating field:', error);
    //             });
    //         }
    //     }


    // deleteRTWCheckFile() {
    //     if (this.uplodedRTWCVId) {
    //         deleteByContentVersionId({
    //             contentVersionId: this.uplodedRTWCVId
    //         })
    //         .then(result => {
    //             if (result === true) {
    //                 this.uplodedRTWCVId = null;
    //                 this.isPreviewEnabled = false;
    //                 this.uploadedRTWCheckFiles = null;
    //             } else {
    //                 console.error('Delete failed');
    //             }
    //         })
    //         .catch(error => {
    //             console.error('Error deleting file:', error);
    //         });
    //     }
    // }

    disconnectedCallback() {
        document.removeEventListener('click', this.handleOutsideClick.bind(this));
    }



}
