import {
    LightningElement,
    track,
    wire,
    api
} from 'lwc';
import {
    CurrentPageReference
} from 'lightning/navigation';
import verifyAccount from '@salesforce/apex/ConnectAppController.verifyAccount';
import getSubContractorDetails from '@salesforce/apex/ConnectAppController.getSubContractorDetails';
import prefferLanguage from '@salesforce/apex/ConnectAppController.prefferLanguage';
import nationality from '@salesforce/apex/ConnectAppController.nationality';
import updateDetails from '@salesforce/apex/ConnectAppController.updateDetails';
import fetchAddress from '@salesforce/apex/AddressAPIController.fetchAddress';
import fetchFullAddress from '@salesforce/apex/AddressAPIController.fetchFullAddress';
import CongratulationsImage from '@salesforce/resourceUrl/CongratulationsImage';
import existingDriverCongratulationImage from '@salesforce/resourceUrl/existingDriverCongratulation';
// import powerByLogo from '@salesforce/resourceUrl/powerByLogo';
import PoweredByLogo from '@salesforce/resourceUrl/PoweredByLogo';

import getMultiplePicklistValues from '@salesforce/apex/ConnectAppController.getMultiplePicklistValues';
import uploadFile from '@salesforce/apex/ImageUploaderController.saveUplodededFiles';
import saveProfilePhoto from '@salesforce/apex/ImageUploaderController.saveProfilePhoto';
import searchExistingAccounts from '@salesforce/apex/AccountDuplicateChecker.searchExistingAccounts';
import inserAccount from '@salesforce/apex/ScFlowFinishProcess.createAccount';
import updateAssociation from '@salesforce/apex/ScFlowFinishProcess.updateAssociation';
import GConnectLogo from '@salesforce/resourceUrl/GconnectLogo';
import deleteExistingDocument from '@salesforce/apex/ImageUploaderController.deleteExistingDocument';

import {
    ShowToastEvent
} from 'lightning/platformShowToastEvent';

export default class ConnectDetails extends LightningElement {

    powerByLogo = `${PoweredByLogo}/Powered_by_Main_Colour.png`;
    buttonBackGroundColor = '#1A98D5';
    buttonFontColor = '#000000';
    primaryColor = 'black';
    secondaryColor = 'blue';
    MAX_FILE_SIZE = 5242880; // 5 MB in bytes //2048000; // 2 MB //
    connectLogo = `${GConnectLogo}/Connect-Wordmark-Whiteout.png`;
    spinner = false;
    errorMessage;
    editMode = true;
    lastConfirmStage;
    haveUTRNumber;
    // pdfUrl = TCpdf;

    signUpPage = true;
    confirmBasicDetailsPage = false;
    confirmAddressDetailsPage = false;
    confirmEmergencyContactpage = false;
    confirmGovtGatewayDetailspage = false;
    confirmVideoDetailsPage = false;
    confirmServicePlanDetailsPage = false;
    confirmServiceTermsDetailsPage = false;
    confirmBankDetailsPage = false;
    confirmProfilePicture = false;
    confirmForm64Page = false;
    confirmDrivingLicensePage = false;
    congratulationsPage = false;
    confirmRTWUploadPage = false;
    confirmDLUploadPage = false;
    confirmNationalInsurancePageconfirmNationalInsurancePage = false;


    isButtonDisabled = true;

    @track applyLicenseNumberValidation = true;

    isUTREntryDisabled = true;
    isVATEntryDisabled = true;
    isGovDetDisabled = true;
    //confirmVideoDetailsPage = true

    showCongratsImg = false;
    fileErrorMessage = false;
    fileErrorDLMessage = false;

    showAccessCode = false;
    showFileUploadCombo = false;
    isRTWDoc = false;
    citizenshipIsEEU = false;
    showRTWExpiryDate = false;
    disabledTermBtn = false;

    @track showDrivingValidationMessage; // for Displaying the Validation related error message || 09-09-2025
    @track showDrivingValidation = false; // For check the Validation Error message is available or not || 09-09-2025


    @track encryptedKey;
    accountName;
    GDPRStatement;
    signOffersNews;
    firstName;
    lastName;
    email;
    phone;
    preferredLanguage = 'English';

    previosAddressVisible = true;
    addressLine1;
    addressLine2;
    town;
    country;
    postCode;
    previousAddressLine1;
    previousAddressLine2;
    previousTown;
    previousCountry;
    previousPostCode;
    nationalInsNumber;
    dateOfBirth;
    dateSCMoved;
    nationality;
    EmergencyContactName;
    EmergencyContactRelation;
    EmergencyContactNumber;

    typeOfLicense;
    licenseNumber;
    pointOfLicense;
    licenseExpiryDate;

    biometricEvidence;
    accessCode;
    shareCode;
    expiryDate;
    dateOfEntry;
    settledStatus;
    rtwDoc;
    citi_Immi_status;



    uniqueTaxRefNumber = 'No';
    URTNumberEntry;
    VATNumber = 'No';
    VATNumberEntry;
    KnowGovtGatewayDetails = 'No';
    GovtGatewayEntry;
    govtGatewayUsername;
    govtGatewayPassword;

    bankAccountName;
    bankAccountNo;
    sortCode;
    bankWithName;

    videoSrc;
    @track videoId;

    @track existingSCDetails = [];
    @track productList = [];
    @track productDefaultList = [];
    @track vatRegisteredProducts = [];
    @track collectDetails = {};
    @track collectBasicDetails = {};
    @track collectAddressDetails = {};
    @track collectEmergancyContactDetails = {};
    @track collectGovtGatewayDetails = {};
    @track collectVideoDetails = {};
    @track collectServicePlanDetails = {};
    @track collectServiceTermsDetails = {};
    @track collectForm64Details = {};
    @track collectLicenseDetails = {};
    @track collectBankDetails = {};



    @track activeTab = 'tab-default-1';
    @track tab1Selected = true;
    @track tab2Selected = false;
    @track tab3Selected = false;

    @track prefferLanguageList = [];
    @track nationalityList = [];

    @track showPlayButton = false;
    @track showVideo = false;

    @track maxDate;
    // @track maxDateofBirth;
    @track CongratulationsImage;
    @track existingDriverCongratulationImage;
    @track accountId;
    @track DSPName;
    @track isTermcondition = false;
    @track opelGDPRModalSection = false;
    @track exisingDriverContent = false;

    @track endUser;
    @track selectedDepot;

    @track currentAddressOptions = [];
    showCurrentAddress = false;
    selectedCurrentAddress = '';
    @track previousAddressOptions = [];
    showPreviousAddress = false;
    selectedPreviousAddress = '';

    /*Picklist Options*/
    @track cIStatus_option = [];
    @track rtw_option = [];
    @track filtered_rtw_option = [];
    @track settledStatus_option = [];
    @track bioEvi_option = [];
    @track licenseTypes_option = [];
    @track licenseCategory_option = [];

    @track uploadFiles = [];
    @track profileFiles = [];
    @track capturedFiles = [];

    @track frontDocFiles = [];
    @track backDocFiles = [];
    @api fileModuleError = '';
    @api isFileModuleError = false;

    @track recordId;
    @track showCboxCategoryError = false;
    @track showBioEviError = false;

    @track isProfileUploadOpned = false;
    @track displayProfile = [];
    @track selectedRTWOption;

    @track showImageCaptureModal = false;
    @track showFileUploadModal = false;
    @track showProfileUploadModal = false;

    @track uploadFileFlag = false;
    @track capturedFileFlag = false;
    @track profileFlag = false;

    @track uploadType = 'None'

    @track profileFileUploded = false;
    @track rtwFilesUploded = false;
    @track licenseFilesUploded = false;

    @track currentNINumber;
    @track currentLicenceNumber;
    @track currentLicenceType; // New Variable for getting the type || 09-09-25
    @track associationId;

    @track isApplicationDuplicate = 'NA';
    @track showProductScreen = true;
    @track existingAccounts;

    updateErrorMessage = '';
    isError = false;

    @track showFrontBackRadioBtn;
    @track documentUploadType;
    @track frontDLFiles = [];
    @track backDLFiles = [];
    @track RTWFiles = [];

    @track isProfilePicError = false;
    @track isDlDocError = false;
    @track isRtwDocError = false;
    @track showWelcomeScreen1 = false;
    @track showWelcomeScreen2 = false;

    @track GDPRStatementError = false;
    @track showCortexNumber = false;

    rtwData = {
        categories: [
            {
                id: 'british',
                label: 'British Citizen',
                value: 'British Citizen',  // Added for mapping
                flag: '🇬🇧',
                evidence: [
                    {
                        id: 'british-passport',
                        name: 'British passport',
                        value: 'British passport',  // Added for mapping
                        description: 'Current or expired'
                    },
                    {
                        id: 'british-birth_cert',
                        name: 'Birth/Adoption Certificate + National Insurance document',
                        value: 'Birth/Adoption Certificate + National Insurance document',  // Added for mapping
                        description: "Full certificate showing at least one parent's name. Short certificates are not accepted."
                    },
                    {
                        id: 'british-naturalisation',
                        name: 'Certificate of registration/naturalisation + National Insurance document',
                        value: 'Certificate of registration/naturalisation + National Insurance document',  // Added for mapping
                        description: 'Certificate of registration or naturalisation as a British citizen'
                    }
                ]
            },
            {
                id: 'irish',
                label: 'Irish Citizen',
                value: 'Irish Citizen',  // Added for mapping
                flag: '🇮🇪',
                infoMessage: "Irish citizens have an automatic right to work in the UK under the Common Travel Area arrangement. You don't need to apply for settled status.",
                evidence: [
                    {
                        id: 'irish-passport',
                        name: 'Irish passport or passport card',
                        value: 'Irish passport or passport card',  // Added for mapping
                        description: 'Current or expired, but must not be clipped (cancelled)'
                    },
                    {
                        id: 'irish-birth_cert',
                        name: 'Irish Birth/Adoption Certificate + National Insurance document',
                        value: 'Irish Birth/Adoption Certificate + National Insurance document',  // Added for mapping
                        description: 'Your Irish birth or adoption certificate plus official proof of your NI number'
                    }
                ]
            },
            {
                id: 'nonuk',
                label: 'Non-UK National',
                value: 'Non-UK National',  // Added for mapping
                flag: '🌍',
                description: 'With permission to work in the UK',
                shareCodeRequired: true,
                shareCodeMessage: {
                    line1: "You'll need a share code to prove your right to work. This is a 9-character code starting with 'W' that you generate online.",
                    line2: "If you don't have one yet, go to gov.uk/prove-right-to-work to create one. Share codes are valid for 90 days.",
                    link: 'https://www.gov.uk/prove-right-to-work'
                }
            }
        ]
    };
    @track selectedCategoryId = null;
    @track selectedEvidenceId = null;
    selectedCategoryId;
    selectedEvidenceId;
    shareCode;

    @track showUploadScreen = false;
    @track uploadMode = 'single'; // 'single' or 'dual'
    @track currentUploadDocumentType = '';
    // @track uploadedFiles = [];
    @track confirmRTWUploadPage = false;  // shows upload screen
    @track rtwFilesUploded = false;
    @track frontDocFiles = [];
    @track backDocFiles = [];
    @track savedRTWDocs = null;  // saved files when user goes Back
    @track savedRTWOption = null;  // which doc was selected when saved
    shareCodeValue = '';

    get categories() {
        return this.rtwData.categories.map(cat => {
            return {
                ...cat,
                cssClass: this.selectedCategoryId === cat.id ? 'category-option selected' : 'category-option'
            };
        });
    }

    get selectedCategory() {
        return this.rtwData.categories.find(cat => cat.id === this.selectedCategoryId);
    }

    get evidenceList() {
        if (!this.selectedCategory || !this.selectedCategory.evidence) {
            return [];
        }
        
        return this.selectedCategory.evidence.map(doc => {
            return {
                ...doc,
                cssClass: this.selectedEvidenceId === doc.id ? 'evidence-option selected' : 'evidence-option'
            };
        });
    }

    get showEvidence() {
        return this.selectedCategory && this.selectedCategory.evidence && this.selectedCategory.evidence.length > 0;
    }

    get showIrishInfo() {
        return this.selectedCategoryId === 'irish';
    }

    get showShareCode1() {
        return this.selectedCategory && this.selectedCategory.shareCodeRequired === true;
    }

    get shareCodeData() {
        if (this.selectedCategory && this.selectedCategory.shareCodeMessage) {
            return this.selectedCategory.shareCodeMessage;
        }
        return {};
    }

    handleCategoryClick(event) {
        const categoryId = event.currentTarget.getAttribute('data-id');
        const category = this.rtwData.categories.find(cat => cat.id === categoryId);
        
        if (!category) return;
        
        this.selectedCategoryId = categoryId;
    
        this.citi_Immi_status = category.value;

        this.rtwDoc = null;
        this.shareCode = null;
        this.selectedEvidenceId = null;
        
        this.collectForm64Details.rtwDoc = null;
        this.collectForm64Details.shareCode = null;
        
        if (category.value === 'Non-UK National') {
            if (!this.shareCode) {
                this.shareCode = null;
            }
            this.isRTWDoc = false;
            this.showFileUploadCombo = false;
            this.showShareCode = true;
        } else {
            this.isRTWDoc = true;
            this.showFileUploadCombo = false;
            this.showShareCode = false;
        }
        
        this.collectForm64Details.citi_Immi_status = category.value;
    
        const syntheticEvent = {
            target: {
                name: 'citi_Immi_status',
                value: category.value
            }
        };
        this.onChangeForm64Details(syntheticEvent);
    }

    determineUploadMode(rtwDocValue) {
        this.currentUploadDocumentType = rtwDocValue;

        const dualDocs = [
            'Birth/Adoption Certificate + National Insurance document',
            'Certificate of registration/naturalisation + National Insurance document',
            'Irish Birth/Adoption Certificate + National Insurance document'
        ];

        this.uploadMode = dualDocs.includes(rtwDocValue) ? 'dual' : 'single';
        console.log('uploadMode →', this.uploadMode);
    }

    handleEvidenceClick(event) {
        this.RTWFiles = null;
        const evidenceId = event.currentTarget.dataset.id;
        const evidence   = this.selectedCategory.evidence.find(ev => ev.id === evidenceId);
        if (!evidence) return;

        const newRtwValue = evidence.value;

        if (this.savedRTWOption !== null && this.savedRTWOption !== newRtwValue) {
            this.savedRTWDocs   = null;
            this.savedRTWOption = null;
            const child = this.template.querySelector('c-rtw-upload');
            if (child) child.resetFiles();
        }

        this.selectedEvidenceId  = evidenceId;
        this.rtwDoc = evidence.value;
        this.showFileUploadCombo = true;
        this.determineUploadMode(evidence.value);
    }

    get questions() {
        return [{
                label: "Yes",
                value: "Yes"
            },
            {
                label: "No",
                value: "No"
            },
            {
                label: "Yes but I will provide it later",
                value: "Yes but I will provide it later"
            }
        ];
    }

    get fileUploadType() {
        return [{
                label: "--None--",
                value: 'None'
            },
            {
                label: "Upload File",
                value: "Upload File"
            },
            {
                label: "Capture Image",
                value: "Capture Image"
            }
            //{ label: "Upload Profile", value: "Upload Profile" }
        ];
    }

    get fileUploadTypeDL() {
        return [{
                label: "--None--",
                value: 'None'
            },
            {
                label: "Upload File",
                value: "Upload File"
            },
            {
                label: "Capture Image",
                value: "Capture Image"
            }
        ];
    }

    selectedRTWDocumentNames = null;
    // NEW RTW
    @track allowedRTWOptions = {
        'British Citizen': [
            {
                label: 'British passport',
                value: 'British passport'
            },
            {
                label: 'Birth/Adoption Certificate + National Insurance document',
                value: 'Birth/Adoption Certificate + National Insurance document'
            },
            {
                label: 'Certificate of registration/naturalisation + National Insurance document',
                value: 'Certificate of registration/naturalisation + National Insurance document'
            }
        ],

        'Irish Citizen': [
            {
                label: 'Irish passport or passport card',
                value: 'Irish passport or passport card'
            },
            {
                label: 'Irish Birth/Adoption Certificate + National Insurance document',
                value: 'Irish Birth/Adoption Certificate + National Insurance document'
            }
        ]
    };




    // For Getting the PickList Values from the Account object for listed fields 
    @wire(getMultiplePicklistValues, {
        objectName: 'Account',
        fieldNames: ['Biometric_Evidence__c', 'Right_to_work_document__c', 'Settled_Status__c', 'Citizenship_Immigration_status__c', 'Type_of_licence__c', 'Additional_licence_categories__c']
    })
    wiredPicklistOptions({
        error,
        data
    }) {
        if (data) {
            // Uncomment in future
            // if (data.Citizenship_Immigration_status__c) {
            //     this.cIStatus_option = data.Citizenship_Immigration_status__c.map(value => {
            //         return {
            //             label: value,
            //             value: value
            //         };
            //     });
            // }
            if (data && data.Citizenship_Immigration_status__c) {
                this.cIStatus_option = data.Citizenship_Immigration_status__c
                    .filter(value =>
                        value !== 'British passport/UK National' &&
                        value !== 'EU/EEA/Swiss Citizen' &&
                        value !== 'Rest Of The World'
                    )
                    .map(value => {
                        return {
                            label: value,
                            value: value
                        };
                    });
            } else {
                this.cIStatus_option = [];
            }

            if (data.Settled_Status__c) {
                this.settledStatus_option = data.Settled_Status__c.map(value => {
                    return {
                        label: value,
                        value: value
                    };
                });
            }
            if (data.Right_to_work_document__c) {
                this.rtw_option = data.Right_to_work_document__c.map(value => {
                    return {
                        label: value,
                        value: value
                    };
                });
            }
            if (data.Biometric_Evidence__c) {
                this.bioEvi_option = data.Biometric_Evidence__c.map(value => {
                    return {
                        label: value,
                        value: value
                    };
                });
            }
            if (data.Type_of_licence__c) {
                this.licenseTypes_option = data.Type_of_licence__c.map(value => {
                    return {
                        label: value,
                        value: value
                    };
                });
            }
            if (data.Additional_licence_categories__c) {
                this.licenseCategory_option = data.Additional_licence_categories__c.map(value => {
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

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.parameters = currentPageReference.state;
            this.encryptedKey = this.parameters.id;
        }
    }

    connectedCallback() {

        this.CongratulationsImage = CongratulationsImage;
        this.existingDriverCongratulationImage = existingDriverCongratulationImage;

        //    const today = new Date();
        //    const seventeenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        //    this.maxDateofBirth = seventeenYearsAgo.toISOString().split('T')[0];

        this.updateTabSelection(this.activeTab);
        this.spinner = true;
        verifyAccount({
                encryptedKey: this.encryptedKey
            })
            .then((response) => {

                const parsedResponse = JSON.parse(response);
                if (parsedResponse.scAccount.length !== 0) {
                    let row = parsedResponse.scAccount[0];
                    this.GDPRStatement = row.GDPR_Statement__c;
                    this.signOffersNews = row.Sign_Offers_News__c;
                    this.DSPName = row.Main_Contractor__r.Name;
                    this.recordId = row.Id;

                    if (parsedResponse.companyInformation.length !== 0) {
                        let row = parsedResponse.companyInformation[0];
                        this.buttonBackGroundColor = row.Button_Background_Color__c;
                        this.buttonFontColor = row.Button_Font_Color__c;
                        this.primaryColor = row.Primary_Color__c;
                        this.secondaryColor = row.Secondary_Color__c;



                    }

                }
                this.spinner = false;
                this.collectDetails['GDPRStatement'] = this.GDPRStatement;
                this.collectDetails['signOffersNews'] = this.signOffersNews;
                const style = document.createElement('style');
                style.innerText = `
                    
                    .slds-input:active, .slds-input:focus {
                        box-shadow: none;
                        border-color: #1DC079 !important;
                        background-color: #FFFFFF;
                    }
                    input.slds-input {
                        background-color: #FFFFFF;
                        border: 1px solid #B2B4C3;
                        border-radius: 8px;
                      }
                      label.slds-form-element__label.slds-no-flex {
                        color: #0C101F;
                      }
                      lightning-combobox label {
                        color: #0C101F !important;
                      }
                      .slds-tabs_default__item.slds-is-active:after {
                        background-color: unset !important;
                      }

					   .btncolor {
 							background-color: ${this.buttonBackGroundColor} !important;
							border-color: ${this.buttonBackGroundColor} !important;
                            color: ${this.buttonFontColor} !important;
					   }

                    .confirmButton{ 
                        background-color: ${this.buttonBackGroundColor} !important;
                        color: ${this.buttonFontColor} !important;
                    }
                      .Paymentsbtn{ 
                        background-color: ${this.buttonBackGroundColor} !important;
                        color: ${this.buttonFontColor} !important;
                    }
                      .confirmButton2{ 
                        background-color: ${this.buttonBackGroundColor} !important;
                        color: ${this.buttonFontColor} !important;
                    }
                      .BussinessPlan_bottom .slds-is-active{ 
                        background-color: ${this.buttonBackGroundColor} !important;
                        color: ${this.buttonFontColor} !important;
                    }

                    .primaryContent { 
                        color: ${this.primaryColor} !important;
                    }

                    .secondaryContent { 
                        color: ${this.secondaryColor} !important;
                    } 

                    .fileBtn button{
                        background-color: #1DC079; 
                        color: #ffffff; 
                        border: none;
                        border-radius: 4px;
                        font-size: 13px;
                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
                    .fileBtn button:hover{
                        background-color: #1DC079 !important; 
                        transform:unset !important;
                    }

                    //svg path {
                    //    fill: #DB4237 !important;
                    //}
                
                    .slds-button_brand, .slds-button--brand{
                        --slds-c-button-color-background: #DB4237 !important;
                        --slds-c-button-color-border: #DB4237 !important;
                    }
                    .slds-button_brand, .slds-button--brand:hover{
                        --slds-c-button-color-background: #DB4237 !important;
                        --slds-c-button-color-border: #DB4237 !important;
                    }


                    .fileBtn button svg path {
                        fill: #ffffff !important;
                    }
                    
                    .dateOfBirth {
                        width:100% !important;
                    } 
                    .dateOfBirth input{
                        width:100% !important;
                    } 

                    .gdpr_modal svg path {
                        fill: black;                    
                    }

                    .slds-checkbox_toggle .slds-checkbox_faux_container .slds-checkbox_faux{
                        border-color: #DB4237;
                        background-color: #DB4237;
                    }

                    .biometric-radio .slds-form-element__control .slds-radio {
                        display: inline
                    }

                    // .slds-radio [type=radio]:checked+.slds-radio__label .slds-radio_faux:after {
                    //     background-color: #d32f2f !important;
                    // }

                    .fileUploadModal  .slds-modal__container {
                        max-width: 60rem !important;
                        min-width: 50rem !important;
                    }

                    .EmergencyContactNumber input{
                        padding-left: 35px;
                    }

                    .confirmPhone input{
                        padding-left: 35px;
                    }

                    @media (max-width: 991.98px){ 
                        .fileUploadModal  .slds-modal__container {
                            min-width: 35rem !important;
                        }
                    }
                    @media (max-width: 767.98px){ 
                        .fileUploadModal  .slds-modal__container {
                        max-width: unset !important;
                            min-width: unset !important;
                        }
                    }

                `;
                setTimeout(() => {
                    this.template.querySelector('.overrideStyle').appendChild(style);

                    // -------------------------------------- Meta Tag Start-------------------------------

                    const metaTag = document.createElement('meta');
                    // Set attributes for viewport meta tag
                    metaTag.setAttribute('name', 'viewport');
                    metaTag.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
                    // Append meta tag to document head
                    document.head.appendChild(metaTag);



                    // -------------------------------------- Meta Tag End -------------------------------

                }, 100);

                const numLiElements = document.querySelectorAll('.slds-tabs_default__nav li').length;
                const liWidth = `${100 / numLiElements}%`;

                // Apply the calculated width to each li element
                document.querySelectorAll('.slds-tabs_default__nav li').forEach(li => {
                    li.style.width = liWidth;
                });


            })
            .catch((error) => {
                console.log('Error:', error);
                this.spinner = false;
            });

        prefferLanguage()
            .then((response) => {

                var prefferLanguageResult = JSON.parse(response);
                for (var i = 0; i < prefferLanguageResult.length; i++) {
                    this.collectprefferLanguage = {
                        'label': prefferLanguageResult[i],
                        'value': prefferLanguageResult[i]
                    };
                    this.prefferLanguageList = [...this.prefferLanguageList, this.collectprefferLanguage];
                }
            })
            .catch((error) => {
                console.log('Error:', error);
                this.spinner = false;
            });

        nationality()
            .then((response) => {
                var nationalityResult = JSON.parse(response);
                for (var i = 0; i < nationalityResult.length; i++) {
                    this.collectnationality = {
                        'label': nationalityResult[i],
                        'value': nationalityResult[i]
                    };
                    this.nationalityList = [...this.nationalityList, this.collectnationality];
                }
            })
            .catch((error) => {
                console.log('Error:', error);
                this.spinner = false;
            });


    }


    // ----------------------------- CONFIRM BUTTON METHODs ---------------------------------------//

    //<!-- 1. Login Screen -->
    callSignUp() {

        this.spinner = true;
        this.collectDetails['lastConfirmStage'] = 'Sign Up';
        this.collectDetails['encryptedKey'] = this.encryptedKey;

        if (this.collectDetails['GDPRStatement'] == false) {
            this.GDPRStatementError = true;
            this.spinner = false;
            return;
        } else {
            this.GDPRStatementError = false;
            getSubContractorDetails({
                    email: this.collectDetails['signUpEmail'],
                    encryptedKey: this.encryptedKey
                })
                .then((response) => {
                    let ConnectVideo;

                    const parsedResponse = JSON.parse(response);
                    if (parsedResponse.scAccount.length !== 0) {
                        this.spinner = false;
                        this.signUpPage = false;
                        let row = parsedResponse.scAccount[0];
                        this.accountId = row.Id;
                        this.accountName = row.Name;


                        ConnectVideo = parsedResponse.connectVideo[0];
                        this.firstName = row.First_Name__c;
                        this.lastName = row.Last_Name__c;
                        this.email = row.Email__c;
                        this.phone = row.Phone__c != null ? row.Phone__c.replace('+44', '') : '';
                        this.preferredLanguage = row.Preffered_Language__c;
                        this.endUser = parsedResponse.endUserName;
                        this.selectedDepot = parsedResponse.depotName;
                        this.associationId = parsedResponse.associationId;
                        if (this.endUser == 'Amazon') {
                            this.showCortexNumber = true;
                        } else {
                            this.showCortexNumber = false;
                        }



                        if (row.Is_Existing_Driver__c) {
                            this.exisingDriverContent = true;
                        } else {
                            this.exisingDriverContent = false;
                        }


                        if (row.Biometric_Evidence__c == 'Yes' || row.Right_to_work_document__c != null) {
                            this.showFileUploadCombo = true;
                            if (this.selectedRTWOption == 'British passport') {
                                this.selectedRTWOption = 'Passport';
                            } else if (this.selectedRTWOption == 'British Birth or Adoption Certificate') {
                                this.selectedRTWOption = 'Adoption';
                            } else if (this.selectedRTWOption == 'Naturalisation') {
                                this.selectedRTWOption = 'Naturalisation';
                            } else if (this.selectedRTWOption == 'Work Visa') {
                                this.selectedRTWOption = 'Visa';
                            } else if (this.selectedRTWOption == 'Work Permit') {
                                this.selectedRTWOption = 'Permit';
                            } else if (this.selectedRTWOption == 'Other') {
                                this.selectedRTWOption = 'Other';
                            } else {
                                this.selectedRTWOption = 'RTW';
                            }
                            this.showAccessCode = false;
                            this.selectedRTWOption = 'Biometric';
                        } else {
                            this.showFileUploadCombo = false;
                            this.showAccessCode = true;
                        }
                        this.assignUpdatedData(row);



                        this.lastConfirmStage = row.Last_Confirmed_Stage__c;

                        this.collectGovtGatewayDetails['uniqueTaxRefNumber'] = row.Do_You_Have_Unique_Tax_Reference_Number__c;
                        this.errorMessage = '';

                        //============================================================================
                        if (this.lastConfirmStage == 'Sign Up') {
                            this.confirmBasicDetailsPage = true;
                        }
                        if (this.lastConfirmStage == 'Basic Details') {
                            this.confirmProfilePicture = true;
                        }
                        if (this.lastConfirmStage == 'Profile Picture') {
                            this.confirmNationalInsurancePage = true //<<--------  NEW VARIABLE
                        }
                        if (this.lastConfirmStage == 'National Insurance') { // <=== NEW PICKLIST VALUE 
                            this.confirmDrivingLicensePage = true;
                        }
                        if (this.lastConfirmStage == 'Driving Licence') {
                            this.confirmDLUploadPage = true; //<<--------  NEW VARIABLE
                        }
                        if (this.lastConfirmStage == 'DL Upload') { // <=== NEW PICKLIST VALUE 
                            this.confirmForm64Page = true;
                        }
                        if (this.lastConfirmStage == 'Right To Work') {
                            this.confirmRTWUploadPage = true;
                        }
                        if (this.lastConfirmStage == 'RTW Upload') { // <=== NEW PICKLIST VALUE 
                            this.confirmGovtGatewayDetailspage = true;
                        }
                        if (this.lastConfirmStage == 'GovtGateway Details') {
                            this.confirmAddressDetailsPage = true;
                        }
                        if (this.lastConfirmStage == 'Address Details') {
                            this.confirmEmergencyContactpage = true;
                        }
                        if (this.lastConfirmStage == 'Emergency Contact') {
                            this.confirmBankDetailsPage = true;
                        }
                        if (this.lastConfirmStage == 'Bank Details') {
                            this.confirmVideoDetailsPage = true;
                        }
                        if (this.lastConfirmStage == 'Video') {
                            this.confirmServicePlanDetailsPage = true;
                        }
                        if (this.lastConfirmStage == 'Service Plan') {
                            if (row.Do_You_Have_Unique_Tax_Reference_Number__c == 'Yes' && this.vatRegisteredProducts.length > 0) {
                                this.confirmAddOnServicePlan = true;
                            } else {
                                if (row.SC_Product__c) {
                                    this.confirmServiceTermsDetailsPage = true;
                                } else {
                                    this.confirmServiceTermsDetailsPage = true;
                                }
                            }
                        }
                        if (this.lastConfirmStage == 'Service AddOn Plan') {
                            if (row.SC_Product__c) {
                                this.confirmServiceTermsDetailsPage = true;
                            } else {
                                this.confirmServiceTermsDetailsPage = true;
                            }
                        }
                        if (this.lastConfirmStage == 'Service Terms') {
                            this.congratulationsPage = true;
                        }
                        //========================================================================
                        if (row.Driving_Licence_Number__c != null) {
                            this.currentLicenceNumber = row.Driving_Licence_Number__c;
                            this.currentLicenceType = row.Type_of_licence__c; // get the LicenceType if available || 09-09-2025
                        }
                        if (row.National_Insurance_Number__c != null) {
                            this.currentNINumber = row.National_Insurance_Number__c;
                        }

                        // if(this.email != null && this.currentLicenceNumber != null && this.currentNINumber != null ){
                        //     console.log('this.showWelcomeScreen2-->',this.showWelcomeScreen2);
                        //     this.checkDuplicateAccount();
                        // }
                        if (this.email != null && this.currentLicenceNumber != null && this.currentNINumber != null) {
                            if (row.Duplicate_Found__c == true || (row.Match_Account__c != null && row.Match_Account__c != undefined)) {
                                this.isApplicationDuplicate = 'YES';
                                this.duplicateAccountId = row.Match_Account__c; //result.matchAccountId;
                                this.showProductScreen = false;
                                this.showWelcomeScreen2 = true;
                                if (this.lastConfirmStage == 'Service Terms') {
                                    this.congratulationsPage = true;
                                }
                            } else if ((row.Duplicate_Found__c == false || row.Duplicate_Found__c == undefined) && (row.Match_Account__c == null || row.Match_Account__c == undefined)) {
                                this.isApplicationDuplicate = 'NO';
                                this.showProductScreen = true;
                                this.showWelcomeScreen1 = true;
                            }
                        }


                        if (ConnectVideo) {
                            this.videoId = ConnectVideo.Video_Id__c;
                        }
                        this.productList = parsedResponse.products;

                        if (parsedResponse.products) {
                            let vatIndex = 0;
                            this.productList = parsedResponse.products.map((product, index) => {
                                if (product.VAT_Registration_Product__c) {

                                    this.vatRegisteredProducts.push({
                                        ...product,
                                        Amount__c: product.Amount__c !== undefined ? product.Amount__c.toFixed(2) : undefined,
                                        className: `tab${vatIndex + 1}Class`,
                                        contentId: `tab-default-${vatIndex + 1}`,
                                        tabId: `tab-default-${vatIndex + 1}__item`,
                                        tabClass: vatIndex == 0 ? 'slds-tabs_default__item slds-is-active' : 'slds-tabs_default__item',
                                        contentClass: vatIndex == 0 ? 'slds-tabs_default__content slds-show' : 'slds-tabs_default__content slds-hide',
                                        isSelected: vatIndex == 0,
                                        priceDataPopular: product.Is_Most_Popular__c ? 'price_data price_data_popular' : 'price_data'
                                    });
                                    vatIndex++;
                                    return null; // Exclude this product from productList
                                } else {
                                    const newIndex = index - this.vatRegisteredProducts.length;
                                    return {
                                        ...product,
                                        Amount__c: product.Amount__c !== undefined ? product.Amount__c.toFixed(2) : undefined,
                                        className: `tab${newIndex + 1}Class`,
                                        contentId: `tab-default-${newIndex + 1}`,
                                        tabId: `tab-default-${newIndex + 1}__item`,
                                        tabClass: newIndex == 0 ? 'slds-tabs_default__item slds-is-active' : 'slds-tabs_default__item',
                                        contentClass: newIndex == 0 ? 'slds-tabs_default__content slds-show' : 'slds-tabs_default__content slds-hide',
                                        isSelected: newIndex == 0,
                                        priceDataPopular: product.Is_Most_Popular__c ? 'price_data price_data_popular' : 'price_data'
                                    };
                                }
                            }).filter(product => product !== null); // Filter out null values

                            // Filter out VAT registered products and remove them from productList
                            this.vatRegisteredProducts.forEach(vatProduct => {
                                const index = this.productList.findIndex(product => product.Id === vatProduct.Id);
                                if (index !== -1) {
                                    this.productList.splice(index, 1);
                                }
                            });
                            if (this.vatRegisteredProducts.length > 0) {
                                this.vatRegisteredProducts[0].isSelected = true;
                            }
                        }

                    } else {
                        this.spinner = false;
                        this.errorMessage = 'Opps! Please Enter Valid Email Address...';
                    }

                })
                .catch((error) => {
                    console.log('Error:', error);
                    this.spinner = false;
                });
        }


    }

    //<!-- 2. Basic Detail -->
    async callConfirmBasicDetails() {
        let allFieldsValid = true;

        const inputFields = this.template.querySelectorAll('.confirmFirstName,.confirmLastName,.confirmEmail,.confirmPhone,.confirmPreferredLanguage');

        inputFields.forEach(inputField => {
            let value = inputField.value;

            if (!inputField.classList.contains('confirmPreferredLanguage')) {
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
            this.collectDetails['lastConfirmStage'] = 'Basic Details';

            this.collectDetails['confirmBasicDetails'] = this.collectBasicDetails;
            await this.updateConfirmDetails();
            if (!this.isError) {
                this.confirmBasicDetailsPage = false;
                this.confirmProfilePicture = true;
                this.collectDetails['signUpEmail'] = this.email;
            } else {
                this.showToast('Error', this.updateErrorMessage, 'error');
            }
        }
    }

    //<!-- 3. Profile Picture Upload -->
    async callConfirmProfilePicture() {

        if (this.profileFiles.length === 0) {
            //this.fileErrorMessage = true;
            this.isProfilePicError = true;
        } else {

            this.spinner = true;
            this.collectDetails['lastConfirmStage'] = 'Profile Picture';

            //this.fileErrorMessage = false;
            this.isProfilePicError = false;

            await saveProfilePhoto({
                    recordId: this.recordId,
                    base64Data: this.profileFiles[0].base64Data,
                    contentType: this.profileFiles[0].fileType
                })
                .then(() => {
                    this.profileFileUploded = true;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Profile uploaded successfully.',
                            variant: 'success'
                        })
                    );
                })
                .catch(error => {
                    console.error('error-->', error);
                    this.profileFileUploded = false;
                    this.spinner = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Error uploading profile: ' + error.body.message,
                            variant: 'error'
                        })
                    );
                });
            if (this.profileFileUploded == true) {
                await this.updateConfirmDetails();
                if (!this.isError) {
                    this.confirmProfilePicture = false;
                    this.confirmNationalInsurancePage = true;
                    this.spinner = false;
                } else {
                    this.showToast('Error', this.updateErrorMessage, 'error');
                    this.spinner = false;
                }
            }



        }
    }

    //<!-- 4. National Insurance Screen -->
    //NEW CONFIRM METHOD
    async callConfirmNationalInsuranceDetails() {

        let allFieldsValid = true;

        const inputFields = this.template.querySelectorAll('.insuranceNumber,.dateOfBirth,.nationality');

        inputFields.forEach(inputField => {
            let value = inputField.value;
            if (!inputField.classList.contains('nationality')) {
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
            this.collectDetails['lastConfirmStage'] = 'National Insurance';

            this.currentNINumber = this.collectAddressDetails['nationalInsNumber'];
            this.collectDetails['confirmAddressDetails'] = this.collectAddressDetails;
            await this.updateConfirmDetails();
            if (!this.isError) {
                this.confirmNationalInsurancePage = false;
                this.confirmDrivingLicensePage = true;
            } else {
                this.showToast('Error', this.updateErrorMessage, 'error');
            }
        }
    }


    //<!-- 5. Driving Licence Details -->
    async callConfirmDrivingLicense() {
        let allFieldsValid = true;
        const inputFields = this.template.querySelectorAll('.licenseNumber,.licenseExpiryDate,.typeOfLicense, .licenseIssueDate');
        inputFields.forEach(inputField => {
            let value = inputField.value;
            if (!inputField.classList.contains('typeOfLicense')) {
                value = value.trim();
            }
            inputField.value = value;
            inputField.reportValidity();
            if (!inputField.checkValidity()) {
                allFieldsValid = false;
                inputField.focus();
            }
        });


        // const checkboxes = this.template.querySelectorAll('.licenseCategory');
        // let isAnyChecked = Array.from(checkboxes).some(cb => cb.checked);
        // this.showCboxCategoryError = !isAnyChecked;
        // if (!isAnyChecked) {
        //     allFieldsValid = false;
        // }
        if (allFieldsValid) {
            this.spinner = true
            this.collectDetails['lastConfirmStage'] = 'Driving Licence';

            this.currentLicenceNumber = this.collectLicenseDetails['licenseNumber'];
            this.collectDetails['confirmDrivingLicenseDetails'] = this.collectLicenseDetails;
            await this.updateConfirmDetails();
            if (!this.isError) {
                this.confirmDrivingLicensePage = false;
                this.confirmDLUploadPage = true;
                this.checkDuplicateAccount();
            } else {
                this.showToast('Error', this.updateErrorMessage, 'error');
            }
            this.spinner = false;
        }
    }

    //<!-- 6. Driving Licence Doc Upload -->
    //NEW CONFIRM METHOD
    async callConfirmDLUploadDetails() {
        // Getting List From Child Comp.
        const childComp = this.template.querySelector('c-image-capture');

        if ((this.frontDocFiles.length == 0 || this.backDocFiles.length == 0)) {
            //this.fileErrorMessage = true;
            this.isDlDocError = true;
        } else {
            // this.fileErrorMessage = false;
            this.isDlDocError = false;
        }
        // Check if all values in confirmDrivingLicenceDetails are not null or empty
        //if (!this.fileErrorMessage) {
        if (!this.isDlDocError) {
            this.spinner = true
            this.collectDetails['lastConfirmStage'] = 'DL Upload';

            //if (this.fileErrorMessage == false) {
            if (this.isDlDocError == false) {
                this.selectedRTWOption = 'DL';
                await this.uploadAllFiles();
                if (childComp) {
                    childComp.resetFiles();

                }
            }
            if (this.licenseFilesUploded == true) {
                await this.updateConfirmDetails();
                if (!this.isError) {
                    this.confirmDLUploadPage = false;
                    this.confirmForm64Page = true;
                } else {
                    this.showToast('Error', this.updateErrorMessage, 'error');
                }
                this.spinner = false;
            }
        }
    }


    //<!-- 7. OLD RTW Details -->
    // async callConfirmForm64() {
    //     let allFieldsValid = true;
    //     // const inputFields = this.template.querySelectorAll('.dateOfEntry,.accessCode,.settledStatus,.rtwDoc,.citi_Immi_status,.expiryDate');
    //     const inputFields = this.template.querySelectorAll('.shareCode,.rtwDoc,.citi_Immi_status,.expiryDate');
    //     console.log('-->inputFields',inputFields);
    //     inputFields.forEach(inputField => {
    //         let value = inputField.value;
    //         if (!inputField.classList.contains('citi_Immi_status') && !inputField.classList.contains('rtwDoc') && !inputField.classList.contains('settledStatus')) {
    //             value = value.trim();
    //         }
    //         console.log('value-->',value);
    //         inputField.value = value;
    //         inputField.reportValidity();
    //         if (!inputField.checkValidity()) {
    //             allFieldsValid = false;
    //             inputField.focus();
    //         }
    //     });

    //     // Validate radio group
    //     let radioGrpValue;
    //     if (this.citizenshipIsEEU) {
    //         const radioGroup = this.template.querySelector('.biometricEvidence');
    //         radioGrpValue = radioGroup.value;
    //         if (radioGroup.value === '' || radioGroup.value === undefined) {
    //             this.showBioEviError = true;
    //         } else {
    //             this.showBioEviError = false;
    //         }
    //     } else {
    //         this.showBioEviError = false;
    //     }

    //     let confirmSuccess = false;
    //     if (allFieldsValid && !this.showBioEviError) {
    //         if (this.citizenshipIsEEU) {
    //             if ((radioGrpValue === 'Yes' && !this.isRtwDocError) || radioGrpValue === 'No') {
    //                 confirmSuccess = true;
    //             }
    //         } else {
    //             if (!this.isRtwDocError) {
    //                 confirmSuccess = true;
    //             }
    //         }
    //     }
    //     if (confirmSuccess == true) {
    //         this.spinner = true;
    //         this.collectDetails['lastConfirmStage'] = 'Right To Work';
    //         this.collectDetails['confirmRightToWorkDetails'] = this.collectForm64Details;

            
    //         // if (!this.collectDetails.confirmRightToWorkDetails) {
    //         //     this.collectDetails.confirmRightToWorkDetails = {
    //         //         citi_Immi_status: this.citi_Immi_status,
    //         //         rtwDoc: this.showRTWDoc ? this.rtwDoc : null,
    //         //         expiryDate: this.showRTWExpiryDate ? this.expiryDate : null,
    //         //         dateOfEntry: this.citizenshipIsEEU ? this.dateOfEntry : null,
    //         //         settledStatus: this.citizenshipIsEEU ? this.settledStatus : null,
    //         //         biometricEvidence: this.citizenshipIsEEU ? this.biometricEvidence : null,
    //         //         accessCode: this.showAccessCode ? this.accessCode : null
    //         //     };
    //         // }

    //         //if (this.rtwFilesUploded == true || radioGrpValue == 'No') {
    //         await this.updateConfirmDetails();
    //         if (!this.isError) {
    //             this.confirmForm64Page = false;
    //             if (this.showFileUploadCombo) {
    //                 this.confirmRTWUploadPage = true;
    //             } else {
    //                 this.confirmGovtGatewayDetailspage = true;
    //             }
    //         } else {
    //             this.showToast('Error', this.updateErrorMessage, 'error');
    //         }
    //         this.spinner = false;
    //         //}
    //     }

    // }


    // <!-- 7. NEW RTW Details -->
    // async callConfirmForm64() {
    //     let allFieldsValid = true;
        
    //     // Validate category selection
    //     if (!this.citi_Immi_status) {
    //         this.showToast('Error', 'Please select your citizenship status', 'error');
    //         return;
    //     }
        
    //     // Validate document selection (if applicable)
    //     if (this.isRTWDoc && !this.rtwDoc) {
    //         this.showToast('Error', 'Please select the document you will provide', 'error');
    //         return;
    //     }
        
    //     // Validate share code (if applicable)
    //     if (this.showShareCode) {
    //         const shareCodeInput = this.template.querySelector('input[name="shareCode"]');
    //         if (shareCodeInput) {
    //             let value = shareCodeInput.value ? shareCodeInput.value.trim().toUpperCase() : '';
    //             let errorMessage = '';

    //             const alphaNumericPattern = /^[A-Z0-9]+$/;
                
    //             if (value.length === 0) {
    //                 errorMessage = 'Share Code is required.';
    //             }
    //             else if (!value.startsWith('W')) {
    //                 errorMessage = 'Share Code is invalid. It must start with W.';
    //             } 
    //             else if (value.length !== 9) {
    //                 errorMessage = 'Share Code must be exactly 9 characters.';
    //             } 
    //             else if (!alphaNumericPattern.test(value)) {
    //                 errorMessage = 'Share Code must contain letters and numbers only.';
    //             }

    //             if (errorMessage) {
    //                 this.showToast('Error', errorMessage, 'error');
    //                 return;
    //             }
                
    //             this.shareCode = value;
    //             this.collectForm64Details.shareCode = value;
    //         }
    //     }

    //     let confirmSuccess = false;

    //     if (allFieldsValid && !this.isRtwDocError) {
    //         confirmSuccess = true;
    //     }

    //     if (confirmSuccess == true) {
    //         this.spinner = true;
    //         this.collectDetails['lastConfirmStage'] = 'Right To Work';
    //         this.collectDetails['confirmRightToWorkDetails'] = this.collectForm64Details;

    //         await this.updateConfirmDetails();
    //         if (!this.isError) {
    //             this.confirmForm64Page = false;
    //             if (this.showFileUploadCombo) {
    //                 this.confirmRTWUploadPage = true;
    //             } else {
    //                 this.confirmGovtGatewayDetailspage = true;
    //             }
    //         } else {
    //             this.showToast('Error', this.updateErrorMessage, 'error');
    //         }
    //         this.spinner = false;
    //     }
    // }
    async callConfirmForm64() {        
        let allFieldsValid = true;
        console.log('This',this.shareCode);
        // Validate category selection
        if (!this.citi_Immi_status) {
            this.showToast('Error', 'Must choose one of the 3 categories.', 'error');
            return;
        }
        
        // Validate document selection (if applicable)
        if (this.isRTWDoc && !this.rtwDoc) {
            this.showToast('Error', 'Please select the document type', 'error');
            return;
        }
        else{
            this.collectForm64Details.rtwDoc = this.rtwDoc;
        }
        
        // Validate share code (if applicable)
        // if (this.showShareCode) {
        //     const shareCodeInput = this.template.querySelector('input[name="shareCode"]');
        //     if (shareCodeInput) {
        //         let value = shareCodeInput.value ? shareCodeInput.value.trim().toUpperCase() : '';
        //         let errorMessage = '';

        //         const alphaNumericPattern = /^[A-Z0-9]+$/;
                
        //         if (value.length === 0) {
        //             errorMessage = 'Share Code is required.';
        //         }
        //         else if (!value.startsWith('W')) {
        //             errorMessage = 'Share Code is invalid. It must start with W.';
        //         } 
        //         else if (value.length !== 9) {
        //             errorMessage = 'Share Code must be exactly 9 characters.';
        //         } 
        //         else if (!alphaNumericPattern.test(value)) {
        //             errorMessage = 'Share Code must contain letters and numbers only.';
        //         }

        //         if (errorMessage) {
        //             this.showToast('Error', errorMessage, 'error');
        //             return;
        //         }
                
        //         this.shareCode = value;
        //         this.collectForm64Details.shareCode = value;
        //     }
        // }
        if (this.showShareCode) {

            const value = this.collectForm64Details.shareCode
                ? this.collectForm64Details.shareCode.trim().toUpperCase()
                : '';

            const alphaNumericPattern = /^[A-Z0-9]{8}$/;

            if (!value) {
                this.showToast('Error', 'Share Code is required.', 'error');
                return;
            }

            if (!alphaNumericPattern.test(value)) {
                this.showToast('Error', 'Share Code must be exactly 8 letters and numbers.', 'error');
                return;
            }
            const fullValue = 'W' + value;

            this.shareCode = fullValue;
            this.collectForm64Details.shareCode = fullValue;
                
        }

        if (allFieldsValid && !this.isRtwDocError) {
            let shareCode = this.collectForm64Details.shareCode;

            if (shareCode) {
                shareCode = shareCode.trim().toUpperCase();

                if (shareCode.length === 8) {
                    shareCode = 'W' + shareCode;
                }

                this.collectForm64Details.shareCode = shareCode;
            }
            this.spinner = true;
            this.collectDetails['lastConfirmStage'] = 'Right To Work';
            this.collectDetails['confirmRightToWorkDetails'] = this.collectForm64Details;

            await this.updateConfirmDetails();

        if (!this.isError) {
            this.confirmForm64Page             = false;
            this.showUploadScreen              = false;
            this.confirmGovtGatewayDetailspage = false;

            setTimeout(() => {
                if (this.showFileUploadCombo) {
                    this.confirmRTWUploadPage = true;
                } else {
                    this.confirmGovtGatewayDetailspage = true;
                }
            }, 100);
        } else {
            console.error('❌ Update failed:', this.updateErrorMessage);
            this.showToast('Error', this.updateErrorMessage, 'error');
                }
            this.spinner = false;
            }
    }


    //<!-- 8. RTW Doc Upload -->
    //NEW CONFIRM METHOD
    async callConfirmRTWUploadDetails() {

        const childComp = this.template.querySelector('c-rtw-upload');

        if (childComp) {
            const docs         = childComp.getUploadDocs();
            this.frontDocFiles = [...(docs.uploadFrontFiles || []), ...(docs.capturedFrontFiles || [])];
            this.backDocFiles  = [...(docs.uploadBackFiles  || []), ...(docs.capturedBackFiles  || [])];
        }

        this.RTWFiles = [...this.frontDocFiles, ...this.backDocFiles];
        this.selectedRTWOption = 'RTW'

        if (!this.RTWFiles || this.RTWFiles.length === 0) {
            this.isRtwDocError = true;
        } else {
            this.isRtwDocError = false;
        }

        if (this.uploadMode === 'dual') {
            if (this.frontDocFiles.length === 0 || this.backDocFiles.length === 0) {
                this.isRtwDocError = true;
            }
        }

         if (this.isRtwDocError){
            this.updateErrorMessage = 'Please upload the required document(s) before continuing.';
            this.showToast('Error', this.updateErrorMessage, 'error');
            return;
        }

        this.spinner = true;
        this.collectDetails['lastConfirmStage'] = 'RTW Upload';

        if (!this.isRtwDocError) {
            await this.uploadAllFiles();
            if (childComp) childComp.resetFiles();
        }

        // Clear saved state after successful submit
        this.savedRTWDocs   = null;
        this.savedRTWOption = null;

        if (this.rtwFilesUploded === true) {
            await this.updateConfirmDetails();
            if (!this.isError) {
                this.confirmRTWUploadPage = false;
                this.confirmForm64Page = false;
                this.confirmGovtGatewayDetailspage = false;
                setTimeout(() => {
                    this.confirmGovtGatewayDetailspage = true;
                }, 100);
            } else {
                this.showToast('Error', this.updateErrorMessage, 'error');
            }
        }
        this.spinner = false;
    }

    //<!-- 9. VAT and UTR Details -->
    async callConfirmGovtGatewayDetails() {

        let allFieldsValid = true;

        const inputFields = this.template.querySelectorAll('.URTNumberEntry,.VATNumberEntry,.govtGatewayUsername,.govtGatewayPassword');

        inputFields.forEach(inputField => {
            const value = inputField.value.trim();
            inputField.value = value;
            inputField.reportValidity();
            if (!inputField.checkValidity()) {
                allFieldsValid = false;
                inputField.focus();
            }
        });

        if (allFieldsValid) {
            this.collectDetails['lastConfirmStage'] = 'GovtGateway Details';

            this.collectDetails['confirmGovtGatewayDetails'] = this.collectGovtGatewayDetails;
            await this.updateConfirmDetails();
            if (!this.isError) {
                this.confirmGovtGatewayDetailspage = false;
                this.confirmAddressDetailsPage = true;
            } else {
                this.showToast('Error', this.updateErrorMessage, 'error');
            }
        }
    }

    //<!-- 10. Address Details -->
    async callConfirmAddressDetails() {

        let allFieldsValid = true;

        const inputFields = this.template.querySelectorAll('.address2Valid,.address1Valid,.townValid,.countryValid,.postCodeValid,.dateSCMoved,.previousAddressLine1,.previousAddressLine2,.previousTown,.previousCountry,.previousPostCode');

        inputFields.forEach(inputField => {

            let value = inputField.value;
            inputField.value = value; // Update the input value without leading and trailing spaces
            inputField.reportValidity(); // Report validity including the trimmed value
            if (!inputField.checkValidity()) {
                allFieldsValid = false;
                inputField.focus(); // Set focus on the first invalid input field
            }

        });


        if (allFieldsValid) {
            this.collectDetails['lastConfirmStage'] = 'Address Details';

            this.collectDetails['confirmAddressDetails'] = this.collectAddressDetails;
            await this.updateConfirmDetails();
            if (!this.isError) {
                this.confirmAddressDetailsPage = false;
                this.confirmEmergencyContactpage = true;
            } else {
                this.showToast('Error', this.updateErrorMessage, 'error');
            }
        }
    }

    //<!-- 11. Emergancy Details -->
    async callConfirmEmergencyContactDetails() {

        let allFieldsValid = true;

        const inputFields = this.template.querySelectorAll('.EmergencyContactName,.EmergencyContactRelation,.EmergencyContactNumber');

        inputFields.forEach(inputField => {
            const value = inputField.value.trim(); // Remove leading and trailing spaces
            inputField.value = value; // Update the input value without leading and trailing spaces
            inputField.reportValidity(); // Report validity including the trimmed value
            if (!inputField.checkValidity()) {
                allFieldsValid = false;
                inputField.focus(); // Set focus on the first invalid input field
            }

            if (inputField.name === 'EmergencyContactNumber') {
                const phoneNum = value.trim();
                if (phoneNum === '+44') {
                    // Set custom validity message for invalid phone format
                    inputField.setCustomValidity('Please Confirm Phone Number');
                    inputField.reportValidity(); // Report the custom validity
                    allFieldsValid = false; // Set allFieldsValid to false as the phone number is invalid
                } else {
                    // Reset custom validity message if phone number is valid
                    inputField.setCustomValidity('');
                }
            }

        });

        if (allFieldsValid) {
            this.collectDetails['lastConfirmStage'] = 'Emergency Contact';

            this.collectDetails['confirmEmergancyContactDetails'] = this.collectEmergancyContactDetails;
            await this.updateConfirmDetails();
            if (!this.isError) {
                this.confirmEmergencyContactpage = false;
                this.confirmBankDetailsPage = true;
            } else {
                this.showToast('Error', this.updateErrorMessage, 'error');
            }
        }
    }

    //<!-- 12. Bank Details -->
    async callConfirmBankDetails() {
        let allFieldsValid = true;

        const inputFields = this.template.querySelectorAll('.accountNameValid,.accountNoValid,.sortCodeValid,.bankWithNameValid');

        inputFields.forEach(inputField => {
            const value = inputField.value.trim();
            inputField.value = value;
            inputField.reportValidity();

            if (!inputField.checkValidity()) {
                allFieldsValid = false;
                inputField.focus();
            }
        });
        if (allFieldsValid) {
            this.collectDetails['lastConfirmStage'] = 'Bank Details';


            this.collectDetails['confirmBankDetails'] = this.collectBankDetails;
            await this.updateConfirmDetails();
            if (!this.isError) {
                this.confirmBankDetailsPage = false;
                this.confirmVideoDetailsPage = true;

            } else {
                this.showToast('Error', this.updateErrorMessage, 'error');
            }
        }
    }

    //<!-- 13. Video Details -->
    async callConfirmVideo() {
        this.collectDetails['lastConfirmStage'] = 'Video';

        await this.updateConfirmDetails();
        if (!this.isError) {
            this.confirmVideoDetailsPage = false;
            this.confirmServicePlanDetailsPage = true;

            if (this.isApplicationDuplicate == 'YES' || (this.duplicateAccountId != null && this.duplicateAccountId != undefined)) {
                this.callConfirmServiceTerms();
            }
        } else {
            this.showToast('Error', this.updateErrorMessage, 'error');
        }
    }

    //<!-- 14. Choose Genrate Product Screen -->
    async callConfirmServicePlan(event) {
        if (event.target.dataset.id == 'IdontKnow') {
            this.collectDetails['selectedProduct'] = '';
            this.isTermcondition = false;
        } else {
            const buttonId = event.target.dataset.id;
            this.collectDetails['selectedProduct'] = buttonId;
            this.isTermcondition = true;
        }

        this.collectDetails['lastConfirmStage'] = 'Service Plan';



        await this.updateConfirmDetails();
        if (!this.isError) {
            this.confirmServicePlanDetailsPage = false;
            if (this.collectGovtGatewayDetails['uniqueTaxRefNumber'] == 'Yes' && this.vatRegisteredProducts.length > 0) {
                this.confirmAddOnServicePlan = true;
            } else {
                if (this.isTermcondition) {
                    this.confirmServiceTermsDetailsPage = true;
                } else {
                    this.confirmServiceTermsDetailsPage = true;
                }

            }
        } else {
            this.showToast('Error', this.updateErrorMessage, 'error');
        }
    }

    //<!-- 15. Choose Aedon Product Screen -->
    async callConfirmServicePlanAddOn(event) {
        if (event.target.dataset.id == 'withoutVAT') {
            this.collectDetails['selectedAddOnProduct'] = '';
        } else {
            const buttonId = event.target.dataset.id;
            this.collectDetails['selectedAddOnProduct'] = buttonId;
        }


        this.collectDetails['lastConfirmStage'] = 'Service AddOn Plan';

        await this.updateConfirmDetails();
        if (!this.isError) {
            this.confirmAddOnServicePlan = false;
            this.confirmServiceTermsDetailsPage = true;
        } else {
            this.showToast('Error', this.updateErrorMessage, 'error');
        }
    }

    //<!-- 16. Service and Terms -->
    async callConfirmServiceTerms() {
        this.collectDetails['lastConfirmStage'] = 'Service Terms';
        this.spinner = true;
        this.disabledTermBtn = true;
        await this.updateConfirmDetails();
        if (!this.isError) {
            if (this.isApplicationDuplicate == 'YES') {
                //
                if (this.duplicateAccountId != null) {
                    // 100% Match
                    await this.createAccountRecord();
                } else {
                    // partial Match
                    //this.confirmServiceTermsDetailsPage = false;
                    //this.congratulationsPage = true;
                    await this.updateAssociationRecord();
                }
            } else if (this.isApplicationDuplicate == 'NO') {
                // 0% match
                await this.createAccountRecord();
            }

        } else {
            this.showToast('Error', this.updateErrorMessage, 'error');
        }
        this.spinner = false;
    }

    // ----------------------------- END ---------------------------------------//

    renderedCallback() {
        // Calculate the width for each li element
        const numLiElements = this.template.querySelectorAll('.slds-tabs_default__nav li').length;
        const liWidth = `${100 / numLiElements}%`;

        // Apply the calculated width to each li element
        this.template.querySelectorAll('.slds-tabs_default__nav li').forEach(li => {
            li.style.width = liWidth;
        });
    }

    // ----------------------------- OnChange METHODs ---------------------------------------//
    onchangeBasicDetails(event) {
        let name = event.target.name;
        let value = event.target.value.trim();

        if (name == 'email') {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|co\.uk)$/;

            if (!emailRegex.test(value)) {
                event.target.setCustomValidity("Email must have @ and .com, .co.uk ");
            } else {
                event.target.setCustomValidity("");
            }
            this.email = value;
            this.collectBasicDetails[event.target.name] = value;
        } else if (name == 'phone') {
            let phoneNum = event.target.value.trim();
            phoneNum = this.convertPhoneNumber(phoneNum);
            this.collectBasicDetails[name] = phoneNum;
        } else {
            this.collectBasicDetails[event.target.name] = value;
        }

    }

    onchangeNIDetails(event) {
        let name = event.target.name;
        let value = event.target.value.trim();
        if (name == 'nationalInsNumber') {
            const pattern = /^[A-Za-z]{2}\d{6}[A-Za-z]{1}$/;

            if (!pattern.test(value)) {
                event.target.setCustomValidity("National Insurance Number must be in the format: AA123456A");
            } else {
                event.target.setCustomValidity("");
            }
        }
        if (name == 'dateOfBirth') {
            const selectedDate = new Date(event.target.value);
            const minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - 18);
            if (selectedDate > minDate) {
                event.target.setCustomValidity("Your age must be at least 18 years ago.");
            } else {
                event.target.setCustomValidity("");
            }

        }
        this.collectAddressDetails[event.target.name] = event.target.value;
    }

    onchangeAddressDetails(event) {
        let name = event.target.name;
        let value = event.target.value.trim();

        if (name == 'dateSCMoved') {
            const threeYearsAgo = new Date();
            threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
            const selectedDate = new Date(value);
            if (selectedDate >= threeYearsAgo) {
                this.previosAddressVisible = false;
            } else {
                this.previosAddressVisible = true;
            }
            const minDate = new Date();
            if (selectedDate > minDate) {
                event.target.setCustomValidity("Future Date Not allowed.");
            } else {
                event.target.setCustomValidity("");
            }
            event.target.reportValidity();
        }
        if (name === 'postCode') {
            const pattern = /^([A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}|GIR ?0A{2})$/;
            if (!pattern.test(value)) {
                event.target.setCustomValidity("Please enter a valid postcode in the format");
            } else {
                event.target.setCustomValidity(""); // Reset custom validity message
            }
        }
        if (name === 'previousPostCode') {
            const pattern = /^([A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}|GIR ?0A{2})$/;
            if (!pattern.test(value)) {
                event.target.setCustomValidity("Please enter a valid postcode in the format");
            } else {
                event.target.setCustomValidity(""); // Reset custom validity message
            }
        }
        if (name === 'addressLine1') {
            this.addressLine1 = event.target.value;
            this.fetchData(name);
        }
        if (name === 'previousAddressLine1') {
            this.previousAddressLine1 = event.target.value;
            this.fetchData(name);
        }
        this.collectAddressDetails[event.target.name] = event.target.value;

    }

    handleCurrentAddressSelection(event) {
        this.selectedCurrentAddress = event.target.dataset.value;
        this.showCurrentAddress = false;
        fetchFullAddress({
                selectedAddress: this.selectedCurrentAddress
            })
            .then(result => {
                // Handle the response data
                // this.addressLine1 = result.Result.RawAddress.ThoroughfareName + ' ' + result.Result.RawAddress.ThoroughfareDesc + ' '  + result.Result.RawAddress.BuildingName + ' ' + result.Result.RawAddress.DependentLocality;
                this.town = result.Result.RawAddress.Locality;
                this.postCode = result.Result.RawAddress.Postcode;

                let filteredAddress1 = "";
                let filteredAddress2 = "";

                for (let i = 0; i < result.Result.Address.Lines.length; i++) {
                    const line = result.Result.Address.Lines[i];

                    const trimmedLine = line.trim();


                    if (trimmedLine && trimmedLine !== result.Result.RawAddress.Locality && trimmedLine.replace(/\s+/g, "") !== result.Result.RawAddress.Postcode.replace(/\s+/g, "")) {
                        if (i === 0) {
                            filteredAddress1 = trimmedLine;
                        } else {
                            filteredAddress2 += trimmedLine + ", ";
                        }
                    }
                }

                filteredAddress2 = filteredAddress2.slice(0, -2);
                this.country = 'United Kingdom';

                this.addressLine1 = filteredAddress1;
                this.addressLine2 = filteredAddress2;
                this.collectAddressDetails = {
                    ...this.collectAddressDetails, // Keep existing properties
                    addressLine1: this.addressLine1,
                    addressLine2: this.addressLine2,
                    town: this.town,
                    postCode: this.postCode,
                    country: this.country
                };


            })
            .catch(error => {
                console.error('Error fetching Full address :', error);
            });

    }

    handlePreviousAddressSelection(event) {
        this.selectedPreviousAddress = event.target.dataset.value;

        this.showPreviousAddress = false;
        fetchFullAddress({
                selectedAddress: this.selectedPreviousAddress
            })
            .then(result => {
                this.previousTown = result.Result.RawAddress.Locality;
                this.previousPostCode = result.Result.RawAddress.Postcode;

                let filteredAddress1 = "";
                let filteredAddress2 = "";

                for (let i = 0; i < result.Result.Address.Lines.length; i++) {
                    const line = result.Result.Address.Lines[i];
                    const trimmedLine = line.trim();

                    if (trimmedLine && trimmedLine !== result.Result.RawAddress.Locality && trimmedLine.replace(/\s+/g, "") !== result.Result.RawAddress.Postcode.replace(/\s+/g, "")) {
                        if (i === 0) {
                            filteredAddress1 = trimmedLine;
                        } else {
                            filteredAddress2 += trimmedLine + ", ";
                        }
                    }
                }

                filteredAddress2 = filteredAddress2.slice(0, -2);
                this.previousCountry = 'United Kingdom';

                this.previousAddressLine1 = filteredAddress1;
                this.previousAddressLine2 = filteredAddress2;
                this.collectAddressDetails = {
                    ...this.collectAddressDetails,
                    previousAddressLine1: this.previousAddressLine1,
                    previousAddressLine2: this.previousAddressLine2,
                    previousTown: this.previousTown,
                    previousPostCode: this.previousPostCode,
                    previousCountry: this.previousCountry
                };

            })
            .catch(error => {
                console.error('Error fetching Full address :', error);
            });

    }

    convertPhoneNumber(phoneNum) {

        let convertedPhoneNum = '+44' + phoneNum.slice(-10);
        // Remove '+44' or '44' at the start
        // if (phoneNum.startsWith('+44')) {
        //     phoneNum = phoneNum.substring(3);
        // } else if (phoneNum.startsWith('44')) {
        //     phoneNum = phoneNum.substring(2);
        // }

        // // Handle different cases
        // if (phoneNum.startsWith('00')) {
        //     convertedPhoneNum = '+44' + phoneNum.substring(2); // Remove '00'
        // } else if (phoneNum.startsWith('0')) {
        //     convertedPhoneNum = '+44' + phoneNum.substring(1); // Remove leading '0'
        // } else {
        //     convertedPhoneNum = '+44' + phoneNum; // Assume missing country code
        // }

        return convertedPhoneNum;
    }

    onchangeEmergencyContactDetails(event) {
        let name = event.target.name;
        let value = event.target.value.trim();

        if (name === 'EmergencyContactNumber') {
            let phoneNum = value;
            phoneNum = this.convertPhoneNumber(phoneNum);
            this.collectEmergancyContactDetails[name] = phoneNum;

        } else {
            this.collectEmergancyContactDetails[name] = value;
        }
    }
    onchangeGovtGatewayDetails(event) {
        let name = event.target.name;
        let value = event.target.value.trim();
        if (name == 'uniqueTaxRefNumber') {

            if (value == 'No' || value == 'Yes but I will provide it later') {
                this.URTNumberEntry = this.URTNumberEntry == null ? '' : null; // Reset the value
                this.collectGovtGatewayDetails['URTNumberEntry'] = ''
            }
            this.isUTREntryDisabled = value == 'Yes' ? false : true;
        }

        if (name == 'VATNumber') {
            this.isVATEntryDisabled = value == 'Yes' ? false : true;
            if (value == 'No' || value == 'Yes but I will provide it later') {
                this.VATNumberEntry = this.VATNumberEntry == null ? '' : null; // Reset the value
                this.collectGovtGatewayDetails['VATNumberEntry'] = ''
            }
        }

        if (name == 'KnowGovtGatewayDetails') {
            this.isGovDetDisabled = value == 'Yes' ? false : true;
            if (value == 'No' || value == 'Yes but I will provide it later') {

                this.govtGatewayUsername = this.govtGatewayUsername == null ? '' : null; // Reset the value
                this.collectGovtGatewayDetails['govtGatewayUsername'] = ''

                this.govtGatewayPassword = this.govtGatewayPassword == null ? '' : null; // Reset the value
                this.collectGovtGatewayDetails['govtGatewayPassword'] = ''
            }
        }
        this.collectGovtGatewayDetails[event.target.name] = event.target.value;
    }

    onchangeBankDetails(event) {

        this.collectBankDetails[event.target.name] = event.target.value.trim();
    }
    
    // OLD RTW 
    // onChangeForm64Details(event) {

    //      console.log('this.rtwDoc: ', this.rtwDoc);
    //             console.log('this.showFileUploadCombo: ', this.showFileUploadCombo);
    //     if (event.target.name === 'citi_Immi_status') {

    //         this.rtwDoc = null;
    //         this.expiryDate = null;
    //         this.dateOfEntry = null;
    //         this.settledStatus = null;
    //         this.biometricEvidence = '';
    //         this.accessCode = null;


    //         this.collectForm64Details.rtwDoc = null;
    //             this.collectForm64Details.expiryDate = null;
    //             this.collectForm64Details.dateOfEntry = null;
    //             this.collectForm64Details.settledStatus = null;
    //             this.collectForm64Details.biometricEvidence = null;
    //             this.collectForm64Details.accessCode = null;

    //         if (event.target.value == 'EU/EEA/Swiss Citizen') {
    //             this.citizenshipIsEEU = true;
    //             this.isRTWDoc = false;
    //             this.showFileUploadCombo = false;
    //             this.showAccessCode = false;
    //             this.showRTWExpiryDate = false;
    //             if (this.biometricEvidence != null && this.biometricEvidence != '') {
    //                 if (this.biometricEvidence == 'Yes') {
    //                     this.showFileUploadCombo = true;
    //                     this.showAccessCode = false;
    //                     this.selectedRTWOption = 'Biometric';
    //                 } else {
    //                     this.showFileUploadCombo = false;
    //                     this.showAccessCode = true;
    //                 }
    //             }



    //         } else {
    //             this.citizenshipIsEEU = false;
    //             this.isRTWDoc = true;
    //             this.showFileUploadCombo = false;
    //             this.showAccessCode = false;
    //             let citiImmiStatus = event.target.value;
    //             this.rtw_option = this.allowedRTWOptions[citiImmiStatus];

            

    //             if (this.rtwDoc != null) {
    //                 if (this.rtwDoc == 'British passport') {
    //                     this.selectedRTWOption = 'Passport';
    //                     this.showRTWExpiryDate = true;
    //                 } else if (this.rtwDoc == 'British Birth or Adoption Certificate') {
    //                     this.selectedRTWOption = 'Adoption';
    //                     this.showRTWExpiryDate = false;
    //                 } else if (this.rtwDoc == 'Naturalisation') {
    //                     this.selectedRTWOption = 'Naturalisation';
    //                     this.showRTWExpiryDate = false;
    //                 } else if (this.rtwDoc == 'Work Visa') {
    //                     this.selectedRTWOption = 'Visa';
    //                     this.showRTWExpiryDate = true;
    //                 } else if (this.rtwDoc == 'Work Permit') {
    //                     this.selectedRTWOption = 'Permit';
    //                     this.showRTWExpiryDate = true;
    //                 } else if (this.rtwDoc == 'Other') {
    //                     this.selectedRTWOption = 'Other';
    //                     this.showRTWExpiryDate = true;
    //                 }
    //                 this.showFileUploadCombo = true;
    //             }
    //         }
    //     }
    //     if (event.target.name === 'rtwDoc') {
    //         this.expiryDate = null;

    //         this.collectForm64Details.expiryDate = null;
    //         this.showFileUploadCombo = true;
    //         if (event.target.value == 'British passport') {
    //             this.selectedRTWOption = 'Passport';
    //             this.showRTWExpiryDate = true;
    //         } else if (event.target.value == 'British Birth or Adoption Certificate') {
    //             this.selectedRTWOption = 'Adoption';
    //             this.showRTWExpiryDate = false;
    //         } else if (event.target.value == 'Naturalisation') {
    //             this.selectedRTWOption = 'Naturalisation';
    //             this.showRTWExpiryDate = false;
    //         } else if (event.target.value == 'Work Visa') {
    //             this.selectedRTWOption = 'Visa';
    //             this.showRTWExpiryDate = true;
    //         } else if (event.target.value == 'Work Permit') {
    //             this.selectedRTWOption = 'Permit';
    //             this.showRTWExpiryDate = true;
    //         } else if (event.target.value == 'Other') {
    //             this.selectedRTWOption = 'Other';
    //             this.showRTWExpiryDate = true;
    //         }
    //     }
    //     if (event.target.name === 'biometricEvidence') {
    //         this.accessCode = null;
    //         this.collectForm64Details.accessCode = null;

    //         if (event.target.value == 'Yes') {
    //             this.showFileUploadCombo = true;
    //             this.showAccessCode = false;
    //             this.selectedRTWOption = 'Biometric';
    //         } else {
    //             this.showFileUploadCombo = false;
    //             this.showAccessCode = true;
    //         }
    //     }
    //     if (event.target.name == 'accessCode') {
    //         let accessCodePattern = /^[A-Z0-9]*$/;
    //         let accessCodeValue = event.target.value;
    //         let errorMessage = '';
    //         if (!accessCodePattern.test(accessCodeValue)) {
    //             errorMessage = 'Access code must be alphanumeric.';
    //         }
    //         if (accessCodeValue.length < 9 || accessCodeValue.length > 9) {
    //             errorMessage = 'Access code must has 9 characters.';
    //         }
    //         if (accessCodeValue.length == 9) {
    //             let plainDigitsPattern = /^\d{9}$/;
    //             let plainAlphabetsPattern = /^[A-Z]{9}$/;

    //             if (plainDigitsPattern.test(accessCodeValue) || plainAlphabetsPattern.test(accessCodeValue)) {
    //                 errorMessage = 'Access code must be alphanumeric.';
    //             }
    //         }
    //         event.target.setCustomValidity(errorMessage);
    //         event.target.reportValidity();
    //     }
    //     if (event.target.type == 'date') {
    //         if (event.target.name == 'dateOfEntry') {
    //             const selectedDate = new Date(event.target.value);
    //             const minDate = new Date();
    //             if (selectedDate > minDate) {
    //                 event.target.setCustomValidity("Not allowing future date.");
    //             } else {
    //                 event.target.setCustomValidity("");
    //                 this.collectLicenseDetails[event.target.name] = event.target.value.trim();
    //             }
    //             event.target.reportValidity();
    //         }
    //         if (event.target.name == 'expiryDate') {

    //             const selectedDate = new Date(event.target.value);
    //             const minDate = new Date();
    //             minDate.setHours(0, 0, 0, 0);

    //             let currentCitizenshipStatus = this.citi_Immi_status;
    //             if (this.collectForm64Details['citi_Immi_status']) {
    //                 currentCitizenshipStatus = this.collectForm64Details['citi_Immi_status'];
    //             }

    //             let rightToWorkDocument = this.rtwDoc;
    //             if (this.collectForm64Details['rtwDoc']) {
    //                 rightToWorkDocument = this.collectForm64Details['rtwDoc'];
    //             }

    //             let byPassExpiryDateValidation = false;
    //             if (currentCitizenshipStatus == 'British passport/UK National' && rightToWorkDocument == 'British passport') {
    //                 byPassExpiryDateValidation = true;
    //             }

    //             if (selectedDate < minDate && !byPassExpiryDateValidation) {
    //                 event.target.setCustomValidity("Past date is not allowed.");
    //             } else {
    //                 event.target.setCustomValidity("");
    //                 this.collectLicenseDetails[event.target.name] = event.target.value.trim();
    //             }
    //             event.target.reportValidity();
    //             this.expiryDate = event.target.value;
    //         }
    //     }
    //     console.log('-->this.collectForm64Details',this.collectForm64Details);
    //     this.collectForm64Details[event.target.name] = event.target.value.trim();
    //     // this.collectForm64Details[event.target.name] = event.target.value ? event.target.value.trim() : null;

    // }

    // NEW RTW
    shareCode = null;
    showShareCode = false

    onChangeForm64Details(event) {

        if (event.target.name === 'citi_Immi_status') {

            this.rtwDoc = null;
            // NEW RTW
            this.shareCode = null;


            this.collectForm64Details.rtwDoc = null;
                // NEW RTW
                this.collectForm64Details.shareCode = null;

            if (event.target.value == 'Non-UK National') {
                // this.citizenshipIsEEU = true;
                this.isRTWDoc = false;
                this.showFileUploadCombo = false;
                // this.showAccessCode = true;
                this.showShareCode = true;
              
            } else {
                // this.citizenshipIsEEU = false;
                this.isRTWDoc = true;
                this.showFileUploadCombo = false;
                // this.showAccessCode = false;
                this.showShareCode = false;
                let citiImmiStatus = event.target.value;
                this.rtw_option = this.allowedRTWOptions[citiImmiStatus];

                if (this.rtwDoc != null) {
                    if (this.rtwDoc == 'British passport') {
                        this.selectedRTWOption = 'BritishPassport';
                        // this.showRTWExpiryDate = false;
                    } 
                    else if (this.rtwDoc == 'Birth/Adoption Certificate + National Insurance document') {
                        this.selectedRTWOption = 'BirthAdoptionNI';
                        // this.showRTWExpiryDate = false;
                    } 
                    else if (this.rtwDoc == 'Certificate of registration/naturalisation + National Insurance document') {
                        this.selectedRTWOption = 'NaturalisationNI';
                        // this.showRTWExpiryDate = false;
                    } 
                    else if (this.rtwDoc == 'Irish passport or passport card') {
                        this.selectedRTWOption = 'IrishPassport';
                        // this.showRTWExpiryDate = false;
                    } 
                    else if (this.rtwDoc == 'Irish Birth/Adoption Certificate + National Insurance document') {
                        this.selectedRTWOption = 'IrishBirthAdoptionNI';
                        // this.showRTWExpiryDate = false;
                    } 

                    this.showFileUploadCombo = true;
                }

            }
        }
        if (event.target.name === 'rtwDoc') {
            this.showFileUploadCombo = true;
            if (this.rtwDoc == 'British passport') {
                    this.selectedRTWOption = 'BritishPassport';
                    // this.showRTWExpiryDate = false;
                } 
                else if (this.rtwDoc == 'Birth/Adoption Certificate + National Insurance document') {
                    this.selectedRTWOption = 'BirthAdoptionNI';
                    // this.showRTWExpiryDate = false;
                } 
                else if (this.rtwDoc == 'Certificate of registration/naturalisation + National Insurance document') {
                    this.selectedRTWOption = 'NaturalisationNI';
                    // this.showRTWExpiryDate = false;
                } 
                else if (this.rtwDoc == 'Irish passport or passport card') {
                    this.selectedRTWOption = 'IrishPassport';
                    // this.showRTWExpiryDate = false;
                } 
                else if (this.rtwDoc == 'Irish Birth/Adoption Certificate + National Insurance document') {
                    this.selectedRTWOption = 'IrishBirthAdoptionNI';
                    // this.showRTWExpiryDate = false;
                } 
        }
        
        if (event.target.name === 'shareCode') {

            let value = event.target.value
                ? event.target.value.trim().toUpperCase()
                : '';

            // Remove non-alphanumeric
            value = value.replace(/[^A-Z0-9]/g, '');

            // Limit to 8 characters
            value = value.substring(0, 8);

            // Update input UI
            event.target.value = value;

            let errorMessage = '';
            const alphaNumericPattern = /^[A-Z0-9]{8}$/;

            if (value.length === 0) {
                errorMessage = 'Share Code is required.';
            } 
            else if (!alphaNumericPattern.test(value)) {
                errorMessage = 'Share Code must be exactly 8 letters and numbers.';
            }

            event.target.setCustomValidity(errorMessage);
            event.target.reportValidity();

            // Save ONLY 8 characters (backend adds W)
            this.shareCode = value;
            this.collectForm64Details.shareCode = value;

            return;
        }
      
        this.collectForm64Details[event.target.name] = event.target.value.trim();

    }

    onChangeLicenseDetails(event) {
        const regex = /^[A-Z0-9]+$/;
        if (event.target.name == 'licenseExpiryDate') {
            const selectedDate = new Date(event.target.value);
            const minDate = new Date();
            minDate.setHours(0, 0, 0, 0);
            if (selectedDate < minDate) {

                event.target.setCustomValidity("Past date is not allowed.");
            } else {
                event.target.setCustomValidity("");
                this.collectLicenseDetails[event.target.name] = event.target.value.trim();
            }
            event.target.reportValidity();
        } else if (event.target.name == 'typeOfLicense') {
            // Change in the condition -- Add the 'Full European (EEC)' for not to check the Licence Number || 09-09-2025
            if (event.target.value.trim() == 'International' || event.target.value.trim() == 'Full European (EEC)') {
                this.applyLicenseNumberValidation = false;
            } else {
                this.applyLicenseNumberValidation = true;
            }
            this.collectLicenseDetails['typeOfLicense'] = event.target.value.trim();

            /* Start : Check the Licence Number based on Driving Type before save the Driving Details */

            let licenseNumberPattern = /^[A-Z0-9]*$/;
            let licenseNumber;
            if (this.collectLicenseDetails['licenseNumber'] == null || this.collectLicenseDetails['licenseNumber'] == undefined) {
                licenseNumber = this.currentLicenceNumber;
            } else {
                licenseNumber = this.collectLicenseDetails['licenseNumber'];
            }
            let errorMessage = '';
            if (!licenseNumberPattern.test(licenseNumber) && this.applyLicenseNumberValidation) {
                errorMessage = 'Licence number must be alphanumeric.';
            } else {
                errorMessage = '';
            }

            if ((licenseNumber.length < 16 || licenseNumber.length > 18) && this.applyLicenseNumberValidation) {
                errorMessage = 'Licence number must be between 16 and 18 characters.';
            } else {
                errorMessage = '';
            }

            let licenseNumberField = this.template.querySelectorAll('.licenseNumber')[0];
            licenseNumberField.setCustomValidity(errorMessage);
            licenseNumberField.reportValidity();
            /* End : Check the Licence Number based on Driving Type before save the Driving Details */
        } else if (event.target.type == 'checkbox') {
            const selectedValues = [];
            this.template.querySelectorAll('.cBox').forEach(checkbox => {
                if (checkbox.checked) {
                    selectedValues.push(checkbox.value);
                }
            });
            this.collectLicenseDetails['licenseCategory'] = selectedValues.join(';');
        } else if (event.target.name == 'licenseNumber') {
            let licenseNumberPattern = /^[A-Z0-9]*$/;
            let licenseNumber = event.target.value;
            let errorMessage = '';
            if (!licenseNumberPattern.test(licenseNumber) && this.applyLicenseNumberValidation) {
                errorMessage = 'Licence number must be alphanumeric.';
            } else {
                errorMessage = '';
            }

            if ((licenseNumber.length < 16 || licenseNumber.length > 18) && this.applyLicenseNumberValidation) {
                errorMessage = 'Licence number must be between 16 and 18 characters.';
            } else {
                errorMessage = '';
            }

            if (errorMessage == '' || errorMessage == null || errorMessage == undefined) {
                this.collectLicenseDetails['licenseNumber'] = event.target.value.trim();
            }
            event.target.setCustomValidity(errorMessage);
            event.target.reportValidity();
        } else if (event.target.name == 'licenseIssueDate') {
            const selectedDate = new Date(event.target.value);
            const minDate = new Date();
            if (selectedDate > minDate) {

                event.target.setCustomValidity("Future date is not allowed.");
            } else {
                event.target.setCustomValidity("");
                this.collectLicenseDetails[event.target.name] = event.target.value.trim();
            }
            event.target.reportValidity();
        } else {
            this.collectLicenseDetails[event.target.name] = event.target.value.trim();
        }
        this.showDrivingValidation = false;
        this.showDrivingValidationMessage = null;
    }

    onChangeUploadType(event) {
        this.isProfileUploadOpned = false;
        this.showImageCaptureModal = false;
        this.showFileUploadModal = false;
        this.showProfileUploadModal = false;

        if (event.target.value == 'Upload Profile') {
            this.isProfileUploadOpned = true;
            this.showImageCaptureModal = false;
            this.showFileUploadModal = false;
            this.showProfileUploadModal = true;
        } else if (event.target.value == 'Capture Image') {
            this.isProfileUploadOpned = true;
            this.showImageCaptureModal = true;
            this.showFileUploadModal = false;
            this.showProfileUploadModal = false;
        } else if (event.target.value == 'Upload File') {
            this.isProfileUploadOpned = true;
            this.showImageCaptureModal = false;
            this.showFileUploadModal = true;
            this.showProfileUploadModal = false;
        }
        this.uploadType = event.target.value;

    }

    onchangeConfirmSave(event) {
        this.collectDetails[event.target.name] = event.target.value.trim();
        let name = event.target.name;
        if (name == 'signOffersNews' || name == 'GDPRStatement') {
            this.collectDetails[event.target.name] = event.target.checked;
        }
    }

    // ----------------------------- END ---------------------------------------//


    opelGDPRModal() {
        this.opelGDPRModalSection = true;
    }
    closeGDPRModal() {
        this.opelGDPRModalSection = false;
    }

    handleTabClick1(event) {
        const selectedTabId = event.target.id.split('__item')[0];

        this.tabs = this.productList.map(tab => {
            if (tab.tabId.split('__item')[0] === selectedTabId) {
                tab.isSelected = true;
                tab.tabClass = 'slds-tabs_default__item slds-is-active';
                tab.contentClass = 'slds-tabs_default__content slds-show';
            } else {
                tab.isSelected = false;
                tab.tabClass = 'slds-tabs_default__item';
                tab.contentClass = 'slds-tabs_default__content slds-hide';
            }
            return tab;
        });

        this.tabs = this.vatRegisteredProducts.map(tab => {
            if (tab.tabId.split('__item')[0] === selectedTabId) {
                tab.isSelected = true;
                tab.tabClass = 'slds-tabs_default__item slds-is-active';
                tab.contentClass = 'slds-tabs_default__content slds-show';
            } else {
                tab.isSelected = false;
                tab.tabClass = 'slds-tabs_default__item';
                tab.contentClass = 'slds-tabs_default__content slds-hide';
            }
            return tab;
        });
    }


    handleTabClick(event) {
        const tabId = event.target.id.split('__item')[0];
        this.activeTab = tabId;
        this.updateTabSelection(tabId);
    }

    updateTabSelection(tabId) {
        if (tabId === 'tab-default-1') {
            this.tab1Selected = true;
            this.tab1Class = 'slds-is-active';
            this.tab2Class = '';
            this.tab3Class = '';
            this.tab2Selected = false;
            this.tab3Selected = false;
        } else if (tabId === 'tab-default-2') {
            this.tab1Class = '';
            this.tab2Class = 'slds-is-active';
            this.tab3Class = '';
            this.tab1Selected = false;
            this.tab2Selected = true;
            this.tab3Selected = false;
        } else if (tabId === 'tab-default-3') {
            this.tab1Class = '';
            this.tab2Class = '';
            this.tab3Class = 'slds-is-active';
            this.tab1Selected = false;
            this.tab2Selected = false;
            this.tab3Selected = true;
        }

    }

    handleVideoEnd() {
        this.isButtonDisabled = false;
    }

    enableEditMode() {
        this.editMode = false;
    }

    fetchData(name) {

        if (name === 'addressLine1') {
            fetchAddress({
                    searchAddress: this.addressLine1
                })
                .then(result => {

                    if (result.Results && result.Results.length > 0) {
                        this.showCurrentAddress = true;
                        this.currentAddressOptions = result.Results.map(item => {
                            return {
                                label: item.label,
                                value: item.value
                            };
                        });
                    } else {
                        this.showCurrentAddress = false;
                        this.currentAddressOptions = [];
                        this.selectedCurrentAddress = '';
                    }
                })
                .catch(error => {
                    console.error('Error fetching address:', error);
                });
        } else if (name === 'previousAddressLine1') {
            fetchAddress({
                    searchAddress: this.previousAddressLine1
                })
                .then(result => {

                    if (result.Results && result.Results.length > 0) {
                        this.showPreviousAddress = true;
                        this.previousAddressOptions = result.Results.map(item => {
                            return {
                                label: item.label,
                                value: item.value
                            };
                        });
                    } else {
                        this.showPreviousAddress = false;
                        this.previousAddressOptions = [];
                        this.selectedPreviousAddress = '';
                    }

                })
                .catch(error => {
                    console.error('Error fetching address:', error);
                });
        }

    }

    //uploadde file to save 
    handleUpload() {
    console.log('this.uploadFiles', this.uploadFiles);    
        try {
            for (const file of this.uploadFiles) {

                let fileDocName = this.accountName + '_' + this.selectedRTWOption + ' ' + file.docType;
                let docType = null;
                if (this.selectedRTWOption == 'DL') {
                    if (file.docType == 'Front') {
                        docType = 'Driving License Front';
                    } else {
                        docType = 'Driving License Back';
                    }
                } else {
                    // if (file.docType == 'Front') {
                    docType = 'Right To Work Front';
                    // } else {
                    //     docType = 'Right To Work Back';
                    // }
                }
                if(this.selectedRTWOption == 'RTW'){
                    if(file.docType == 'Right To Work Front'){
                       docType = 'Right To Work Front'; 
                    }
                    else{
                        docType = 'Right To Work Back'; 
                    }
                    if (this.uploadMode === 'single') {
                        deleteExistingDocument({
                            recordId: this.recordId,
                            docType: 'Right To Work Back'
                        });
                    }
                }
                uploadFile({
                    parentId: this.recordId,
                    fileName: fileDocName,
                    base64Data: file.base64Data,
                    contentType: file.fileType,
                    docType: docType
                });
                this.rtwFilesUploded = true;
                this.licenseFilesUploded = true;
                this.showToast('Success', 'Files Uploaded Successfully', 'success');


            }
            if (this.displayProfile.size > 0) {
                for (const file of this.displayProfile) {
                    let docType = 'Profile Picture';
                    uploadFile({
                        parentId: this.recordId,
                        fileName: "Profile Picture",
                        base64Data: file.base64Data,
                        contentType: file.contentType,
                        docType: docType
                    });
                }
            }
            this.selectedRTWOption = null;
        } catch (error) {
            this.rtwFilesUploded = false;
            this.licenseFilesUploded = false;
            console.error('Error in handleUpload:', error.body.message);
        }
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }

    uploadAllFiles() {
        this.uploadFiles = [...this.frontDocFiles, ...this.backDocFiles];
        //this.backDocFiles = [];
        //this.frontDocFiles = [];
        this.handleUpload();
    }

    updateConfirmDetails() {
        this.spinner = true;
        console.log(this.collectDetails);
        return updateDetails({
                outputMap: JSON.stringify(this.collectDetails)
            })
            .then((response) => {
                this.spinner = false;
                this.isError = false;

            })
            .catch((error) => {
                this.spinner = false;
                this.updateErrorMessage = error.body.pageErrors[0].message;
                this.isError = true;
            });
    }

    clickFrontBackUpload(event) {
        this.isProfileUploadOpned = true;
        this.showImageCaptureModal = true;
        this.showFileUploadModal = true;
        this.showProfileUploadModal = false;
        this.isFileModuleError = false;
        this.fileModuleError = '';
        let uploadType = event.target.dataset.uploadtype;
        this.documentUploadType = event.target.dataset.uploadtype;
        if (uploadType == 'RTW') {
            this.showFrontBackRadioBtn = false;
        } else {
            this.showFrontBackRadioBtn = true;
        }

    }
    clickProfileUpload(event) {
        this.isProfileUploadOpned = true;
        this.showImageCaptureModal = false;
        this.showFileUploadModal = false;
        this.showProfileUploadModal = true;
        //this.fileErrorMessage = false;
        this.isRtwDocError = false;
        this.isProfilePicError = false;
        this.isDlDocError = false;
        //this.showFrontBackRadioBtn = false;

    }

    handleFileCancel(event) {
        this.uploadType = 'None';
        this.isProfileUploadOpned = false;
        this.fileUploadType = '';
    }

    handleFileChange(event) {
        const file = event.target.files[0];
        if (file && file.size <= this.MAX_FILE_SIZE) { // Check file size under 5MB
            const reader = new FileReader();
            reader.onload = () => {
                this.displayProfile = [{
                    name: file.name,
                    url: reader.result,
                    base64Data: reader.result.split(',')[1],
                    id: Date.now(),
                    contentType: file.type
                }];
            };
            reader.readAsDataURL(file);
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Profile photo must be under 5 MB',
                    variant: 'error'
                })
            );
        }
    }

    handleRemoveImage(event) {
        const imageName = event.target.dataset.imageName;
        this.displayProfile = [];
    }

    handleSaveProfileFiles(event) {
        this.uploadFileFlag = false;
        this.profileFlag = false;
        this.capturedFileFlag = false;

        // Getting List From Child Comp.
        const childComp = this.template.querySelector('c-image-capture');

        if (childComp) {
            if (this.showProfileUploadModal) {
                const profileData = childComp.getProfileDocs();
                if (profileData) {
                    if (profileData.profileFiles.length > 0) {
                        this.profileFiles = profileData.profileFiles;
                    } else {
                        this.fileModuleError = 'Please Upload evidence';
                        this.isFileModuleError = true;
                        return;
                    }
                } else {
                    console.log('No data returned from child component');
                }
            } else {
                const data = childComp.getUploadDocs();
                if (data) {
                    if (data.uploadFrontFiles.length > 0 || data.capturedFrontFiles.length > 0) {
                        this.frontDocFiles = data.uploadFrontFiles.length > 0 ? data.uploadFrontFiles : data.capturedFrontFiles;
                        if (this.documentUploadType == 'RTW') {
                            this.RTWFiles = this.frontDocFiles;
                            this.showFrontBackRadioBtn = false;
                        } else {
                            this.frontDLFiles = this.frontDocFiles;
                        }


                    } else {
                        this.fileModuleError = 'Please Upload the related Front File';
                        this.isFileModuleError = true;
                        return;
                    }
                    if (this.showFrontBackRadioBtn && this.documentUploadType != 'RTW') {
                        if (data.uploadBackFiles.length > 0 || data.capturedBackFiles.length > 0) {
                            this.backDocFiles = data.uploadBackFiles.length > 0 ? data.uploadBackFiles : data.capturedBackFiles;
                            this.backDLFiles = this.backDocFiles;
                        } else {
                            this.fileModuleError = 'Please Upload the related Back File';
                            this.isFileModuleError = true;
                            return;
                        }
                    } else {
                        this.backDocFiles = [];
                    }
                } else {
                    console.log('No data returned from child component');
                }
            }
        } else {
            console.log('Child component not found');
        }
        this.isProfileUploadOpned = false;
        //this.fileErrorMessage = false;
        this.isRtwDocError = false;
        this.isProfilePicError = false;
        this.isDlDocError = false;
    }

    callBackButton(event) {
       if(this.isRtwDocError) this.isRtwDocError = false;
        this.spinner = true;
        getSubContractorDetails({
                email: this.email,
                encryptedKey: this.encryptedKey
            })
            .then((response) => {

                const parsedResponse = JSON.parse(response);
                console.log('parsedResponse',parsedResponse);
                if (parsedResponse.scAccount.length !== 0) {
                    let row = parsedResponse.scAccount[0];
                    this.assignUpdatedData(row);
                }
            })
            .catch((error) => {
                console.log('Error:', error);
                this.spinner = false;
            });

        let currentScreenName = event.target.name;
        if (currentScreenName == 'profilePicture') {
            this.confirmBasicDetailsPage = true;
            this.confirmProfilePicture = false;
        }
        if (currentScreenName == 'identifiers') {
            this.confirmProfilePicture = true;
            this.confirmNationalInsurancePage = false;
        }
        if (currentScreenName == 'drivingLicence') {
            this.confirmNationalInsurancePage = true;
            this.confirmDrivingLicensePage = false;
        }
        if (currentScreenName == 'drivingLicenceUpload') {
            this.confirmDrivingLicensePage = true;
            this.confirmDLUploadPage = false;
        }
        if (currentScreenName == 'rtw') {
            this.confirmDLUploadPage = true;
            this.confirmForm64Page = false;
        }
        if (currentScreenName == 'rtwUpload') {
            this.confirmForm64Page = true;
            this.confirmRTWUploadPage = false;
        }
        if (currentScreenName == 'govtgateway') {
            if (this.showFileUploadCombo) {
                this.confirmRTWUploadPage = true;
            } else {
                this.confirmForm64Page = true;
            }
            this.confirmGovtGatewayDetailspage = false;
        }
        if (currentScreenName == 'addressDetails') {
            this.confirmGovtGatewayDetailspage = true;
            this.confirmAddressDetailsPage = false;
        }
        if (currentScreenName == 'emergencyDetails') {
            this.confirmAddressDetailsPage = true;
            this.confirmEmergencyContactpage = false;
        }
        if (currentScreenName == 'bankDetails') {
            this.confirmEmergencyContactpage = true;
            this.confirmBankDetailsPage = false;
        }


        this.spinner = false;
    }

    checkDuplicateAccount() {
        this.showWelcomeScreen1 = false;
        this.showWelcomeScreen2 = false;
        const requestData = JSON.stringify({
            Email__c: this.email,
            Driving_Licence_Number__c: this.currentLicenceNumber,
            National_Insurance_Number__c: this.currentNINumber
        });
        searchExistingAccounts({
                requestData: requestData,
                appId: this.recordId
            })
            .then((result) => {
                if (result.duplicateFound == true || (result.matchedAccounts != null && result.matchedAccounts != undefined)) {
                    this.isApplicationDuplicate = 'YES';
                    this.duplicateAccountId = result.matchAccountId;
                    this.showProductScreen = false;
                    this.showWelcomeScreen2 = true;
                } else if ((result.duplicateFound == false || result.duplicateFound == undefined) && (result.matchedAccounts == null || result.matchedAccounts == undefined)) {
                    this.isApplicationDuplicate = 'NO';
                    this.showProductScreen = true;
                    this.showWelcomeScreen1 = true;
                }

            })
            .catch((error) => {
                console.error(error);
                this.showToast('Error', error.body?.message || 'Unknown error', 'error');
            });
    }

    createAccountRecord() {
        inserAccount({
                applicationId: this.recordId,
                accountId: this.duplicateAccountId
            })
            .then(() => {
                this.confirmServiceTermsDetailsPage = false;
                this.congratulationsPage = true;
                this.spinner = false;
            })
            .catch(error => {
                console.error(error);
                this.showToast('Error', error.body?.message || 'Unknown error', 'error');
            });
    }

    // async createAccountRecord() {
    //     try {
    //         await inserAccount({ applicationId: this.recordId, accountId: this.duplicateAccountId });
    //         this.confirmServiceTermsDetailsPage = false;
    //         this.congratulationsPage = true;
    //         this.spinner = false;
    //     } catch (error) {
    //         console.error(error);
    //         this.showToast('Error', error.body?.message || 'Unknown error', 'error');
    //     }
    // }

    updateAssociationRecord() {
        this.spinner = true;
        updateAssociation({
                applicationId: this.recordId
            })
            .then(() => {
                this.confirmServiceTermsDetailsPage = false;
                this.congratulationsPage = true;
                this.spinner = false;
            })
            .catch(error => {
                console.error(error);
                this.showToast('Error', error.body?.message || 'Unknown error', 'error');
            });
    }

    assignUpdatedData(rowData) {

        //this.fileErrorMessage = false;
        this.editMode = true;
        this.firstName = rowData.First_Name__c ? rowData.First_Name__c : '';
        this.lastName = rowData.Last_Name__c ? rowData.Last_Name__c : '';
        this.email = rowData.Email__c ? rowData.Email__c : '';
        this.phone = rowData.Phone__c != null ? rowData.Phone__c.replace('+44', '') : '';
        this.preferredLanguage = rowData.Preffered_Language__c ? rowData.Preffered_Language__c : '';
        this.cortexNumber = rowData.Amazon_Cortex_Number__c ? rowData.Amazon_Cortex_Number__c : '';

        this.nationality = rowData.Nationality__c ? rowData.Nationality__c : '';
        this.dateOfBirth = rowData.Date_of_Birth__c ? rowData.Date_of_Birth__c : '';
        this.nationalInsNumber = rowData.National_Insurance_Number__c ? rowData.National_Insurance_Number__c : '';

        this.typeOfLicense = rowData.Type_of_licence__c ? rowData.Type_of_licence__c : '';
        this.licenseNumber = rowData.Driving_Licence_Number__c ? rowData.Driving_Licence_Number__c : '';
        this.licenseExpiryDate = rowData.Driving_Licence_Expiry_Date__c ? rowData.Driving_Licence_Expiry_Date__c : '';
        this.licenseIssueDate = rowData.Driving_Licence_Issue_Date__c  ? rowData.Driving_Licence_Issue_Date__c : '';
        this.pointOfLicense = rowData.Points_on_Licence__c ? rowData.Points_on_Licence__c : '';
        if (rowData.Additional_licence_categories__c != null) {
            const selectedValues = rowData.Additional_licence_categories__c ?
                rowData.Additional_licence_categories__c.split(';') : [];
            this.licenseCategory_option = this.licenseCategory_option.map(item => {
                return {
                    ...item,
                    checked: selectedValues.includes(item.value)
                };
            });
        }
        this.citi_Immi_status = rowData.Citizenship_Immigration_status__c ? rowData.Citizenship_Immigration_status__c : '';
        this.rtwDoc = rowData.Right_to_work_document__c ? rowData.Right_to_work_document__c : '';
        this.settledStatus = rowData.Settled_Status__c ? rowData.Settled_Status__c : '';
        this.dateOfEntry = rowData.Date_of_Entry__c ? rowData.Date_of_Entry__c : '';
        this.expiryDate = rowData.RTW_Expiry_Date__c ? rowData.RTW_Expiry_Date__c : '';
        this.accessCode = rowData.Access_Code__c ? rowData.Access_Code__c : '';
        // this.shareCode = rowData.Share_Code__c ? rowData.Share_Code__c : '';
        // ✅ Remove 'W' prefix from share code when displaying in UI
        if (rowData.Share_Code__c) {
            let shareCodeValue = rowData.Share_Code__c;
            // If share code starts with 'W', remove it for UI display
            if (shareCodeValue.length === 9 && (shareCodeValue.startsWith('W') || shareCodeValue.startsWith('w'))) {
                shareCodeValue = shareCodeValue.substring(1);
            }
            this.shareCode = shareCodeValue;
            this.collectForm64Details.shareCode = shareCodeValue;
        } else {
            this.shareCode = '';
            this.collectForm64Details.shareCode = '';
        }
        this.biometricEvidence = rowData.Biometric_Evidence__c ? rowData.Biometric_Evidence__c : '';

        // OLD RTW
        // if (this.citi_Immi_status != null) {
        //     this.rtw_option = this.allowedRTWOptions[this.citi_Immi_status];
        //     if (this.citi_Immi_status == 'EU/EEA/Swiss Citizen') {
        //         this.citizenshipIsEEU = true;
        //         this.isRTWDoc = false;
        //         this.showFileUploadCombo = false;
        //         this.showAccessCode = false;
        //         this.showRTWExpiryDate = false;

        //     } else {
        //         this.citizenshipIsEEU = false;
        //         this.isRTWDoc = true;
        //         this.showFileUploadCombo = false;
        //         this.showAccessCode = false;

        //         if (this.rtwDoc != null) {
        //             if (this.rtwDoc == 'British passport') {
        //                 this.selectedRTWOption = 'Passport';
        //                 this.showRTWExpiryDate = true;
        //             } else if (this.rtwDoc == 'British Birth or Adoption Certificate') {
        //                 this.selectedRTWOption = 'Adoption';
        //                 this.showRTWExpiryDate = false;
        //             } else if (this.rtwDoc == 'Naturalisation') {
        //                 this.selectedRTWOption = 'Naturalisation';
        //                 this.showRTWExpiryDate = false;
        //             } else if (this.rtwDoc == 'Work Visa') {
        //                 this.selectedRTWOption = 'Visa';
        //                 this.showRTWExpiryDate = true;
        //             } else if (this.rtwDoc == 'Work Permit') {
        //                 this.selectedRTWOption = 'Permit';
        //                 this.showRTWExpiryDate = true;
        //             } else if (this.rtwDoc == 'Other') {
        //                 this.selectedRTWOption = 'Other';
        //                 this.showRTWExpiryDate = true;
        //             }
        //             this.showFileUploadCombo = true;
        //         }
        //     }
        // }

        // OLD RTW
        // if (this.biometricEvidence != null && this.biometricEvidence != '') {
        //     if (this.biometricEvidence == 'Yes') {
        //         this.showFileUploadCombo = true;
        //         this.showAccessCode = false;
        //         this.selectedRTWOption = 'Biometric';
        //     } else {
        //         this.showFileUploadCombo = false;
        //         this.showAccessCode = true;
        //     }
        // }

        // NEW RTW
        // ================================
        // AUTO SELECT CATEGORY
        // ================================
        if (this.citi_Immi_status) {

            const matchedCategory = this.rtwData.categories.find(cat => 
                cat.value === this.citi_Immi_status
            );

            if (matchedCategory) {
                this.selectedCategoryId = matchedCategory.id;
            }

            // ================================
            // AUTO SELECT EVIDENCE
            // ================================
            if (this.rtwDoc && matchedCategory && matchedCategory.evidence) {

                const matchedEvidence = matchedCategory.evidence.find(ev =>
                    ev.value === this.rtwDoc
                );

                if (matchedEvidence) {
                    this.selectedEvidenceId = matchedEvidence.id;
                }
            }
        }
        if (this.shareCode) {
            this.collectForm64Details.shareCode = this.shareCode;
        }
        // Add this after restoring RTW data
        if (this.rtwDoc && this.selectedCategoryId) {
            const selectedCategory = this.rtwData.categories.find(cat => cat.id === this.selectedCategoryId);
            if (selectedCategory && selectedCategory.evidence) {
                const evidence = selectedCategory.evidence.find(ev => ev.value === this.rtwDoc);
                if (evidence) {
                    this.selectedEvidenceId = evidence.id;
                    // NEW: Restore upload mode
                    this.determineUploadMode(this.rtwDoc);
                }
            }
        }



        this.bankAccountName = rowData.Bank_Account_Name__c ? rowData.Bank_Account_Name__c : '';
        this.bankAccountNo = rowData.Bank_Account_No__c ? rowData.Bank_Account_No__c : '';
        this.sortCode = rowData.Sort_Code__c ? rowData.Sort_Code__c : '';
        this.bankWithName = rowData.Who_do_you_bank_with__c ? rowData.Who_do_you_bank_with__c : '';


        this.uniqueTaxRefNumber = rowData.Do_You_Have_Unique_Tax_Reference_Number__c ? rowData.Do_You_Have_Unique_Tax_Reference_Number__c : '';
        this.URTNumberEntry = rowData.URT_Number_Entry__c ? rowData.URT_Number_Entry__c : '';
        this.VATNumber = rowData.Do_You_Have_VAT_Number__c ? rowData.Do_You_Have_VAT_Number__c : '';
        this.VATNumberEntry = rowData.VAT_Registration_Number__c ? rowData.VAT_Registration_Number__c : '';
        this.KnowGovtGatewayDetails = rowData.know_Govt_Gateway_details__c ? rowData.know_Govt_Gateway_details__c : '';
        this.govtGatewayUsername = rowData.Govt_Gateway_Username__c ? rowData.Govt_Gateway_Username__c : '';
        this.govtGatewayPassword = rowData.Govt_Gateway_Password__c ? rowData.Govt_Gateway_Password__c : '';


        this.EmergencyContactName = rowData.Emergency_Contact_Name__c ? rowData.Emergency_Contact_Name__c : '';
        this.EmergencyContactRelation = rowData.Emergency_Contact_Relationship__c ? rowData.Emergency_Contact_Relationship__c : '';
        this.EmergencyContactNumber = rowData.Emergency_Contract_Telephone_Number__c ? rowData.Emergency_Contract_Telephone_Number__c.replace('+44', '') : '';


        this.addressLine1 = rowData.Address_Line_1__c ? rowData.Address_Line_1__c : '';
        this.addressLine2 = rowData.Address_Line_2__c ? rowData.Address_Line_2__c : '';
        this.town = rowData.Town__c ? rowData.Town__c : '';
        this.country = rowData.Country__c ? rowData.Country__c : '';
        this.postCode = rowData.Postcode__c ? rowData.Postcode__c : '';

        this.previousAddressLine1 = rowData.Previous_Address_Line_1__c ? rowData.Previous_Address_Line_1__c : '';
        this.previousAddressLine2 = rowData.Previous_Address_Line_2__c ? rowData.Previous_Address_Line_2__c : '';
        this.previousTown = rowData.Previous_Town__c ? rowData.Previous_Town__c : '';
        this.previousCountry = rowData.Previous_Country__c ? rowData.Previous_Country__c : '';
        this.previousPostCode = rowData.Previous_Postcode__c ? rowData.Previous_Postcode__c : '';
        this.dateSCMoved = rowData.Date_Moved_to_Current_Address__c ? rowData.Date_Moved_to_Current_Address__c : '';
        if (rowData.Date_Moved_to_Current_Address__c != null) {
            const threeYearsAgo = new Date();
            threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
            if (rowData.Date_Moved_to_Current_Address__c >= threeYearsAgo) {
                this.previosAddressVisible = false;
            } else {
                this.previosAddressVisible = true;
            }
        }

    }

}