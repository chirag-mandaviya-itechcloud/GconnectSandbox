global without sharing class ConnectAppController {


    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getAutoSettingFlags() {
        Metadata_Control__c config = Metadata_Control__c.getInstance();
        Map<String, Object> result = new Map<String, Object>();
        result.put('isDeductionDisabled', config?.Deduction_Functionality_Disable__c == true);
        result.put('isIncidentDisabled', config?.Incident_Functionality_Disable__c == true);
        result.put('isDriverRateDisabled', config?.Contractor_Rate_Functionality_Disabled__c == true);
        result.put('isAvaliabilityDisabled', config?.Contractor_Availability_Disabled__c == true);
        result.put('isDspPasswordDisabled', config?.DSP_Password_Disabled__c == true);
        result.put('isVehicleDisabled', config?.VMS_Funcionaliy_Disabled__c == true);
        result.put('isRotaDisabled', config?.ROTA_Functionality_Disabled__c == true);
        return result;
    }


    /* This method for getting the picklist value as option for dispalying in LWC Comp.*/
	/*	 -It accepted Object Name and List of field names(must be Picklist fields) of same object as parameter */
	@AuraEnabled (cacheable=true)
	public static Map<String, List<String>> getMultiplePicklistValues(String objectName, List<String> fieldNames) {
        Map<String, List<String>> picklistValuesMap = new Map<String, List<String>>();

        for (String fieldName : fieldNames) {
            List<String> picklistValues = new List<String>();
            Schema.DescribeFieldResult fieldResult = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap().get(fieldName).getDescribe();
            List<Schema.PicklistEntry> picklistEntries = fieldResult.getPicklistValues();

            for (Schema.PicklistEntry entry : picklistEntries) {
                picklistValues.add(entry.getLabel());
            }
            picklistValuesMap.put(fieldName, picklistValues);
        }
        return picklistValuesMap;
    }


    @AuraEnabled
    global static String verifyAccount(String encryptedKey)
    {
        Map<String,object> returnMap = new Map<String,Object>();
        returnMap.put('scAccount','');
        returnMap.put('companyInformation','');
        if(String.isNotBlank(encryptedKey) && String.isNotEmpty(encryptedKey))
        {
            List<Application__c> applicationList = [Select Id,EncryptedKey__c,GDPR_Statement__c,Sign_Offers_News__c,Main_Contractor__c,Main_Contractor__r.Name from Application__c where EncryptedKey__c=:encryptedKey Limit 1];

            if(applicationList.Size() > 0){
                List<Company_Information__c> companyList= [SELECT Id, DSP_Logo__c, DSP_Content__c,Primary_Color__c,Secondary_Color__c, Hero_Section_Title_Font_Size__c,
                                                           Button_Background_Color__c,Button_Font_Color__c, Footer_Content__c, Main_Contractor__c,
                                                           Hero_Section_background_Image__c,Second_Section_Background_Image__c,DSP_Hero_Section_Logo__c,Main_Contractor__r.Include_in_vat__c,
                                                           Main_Contractor__r.Name, Carousel_Content__c
                                                           FROM Company_Information__c where Main_Contractor__c =: applicationList[0].Main_Contractor__c Limit 1];
                returnMap.put('scAccount',applicationList);
                if(companyList.Size() > 0)
                {
                    returnMap.put('companyInformation',companyList);
                }

            }
        }
        return JSON.Serialize(returnMap);
    }


    @AuraEnabled
    global static String getSubContractorDetails(String email,String encryptedKey)
    {
        Map<String,object> returnMap = new Map<String,Object>();
        returnMap.put('scAccount','');
        returnMap.put('products','');
        returnMap.put('connectVideo','');

        if(String.isNotBlank(email) && String.isNotEmpty(email) && String.isNotBlank(encryptedKey) && String.isNotEmpty(encryptedKey))
        {
            List<Application__c> appList = getApplication(email,encryptedKey);
            set<Boolean> showProduct=new set<Boolean>();
            showProduct.add(false);

            if(appList.Size() > 0)
            {
                showProduct.add(appList[0].Main_Contractor__r.Include_in_vat__c);
                for(Application__c appObj: appList)
                {
                    if(appObj.SC_Status__c == 'Onboarding')
                    {
                        appObj.SC_Status__c = 'Onboarding Initiated';
                        Update appList;
                    }
                }
                returnMap.put('scAccount',appList);

                List<Associate__c> associateList = [SELECT Id, Name, End_User__c, End_User__r.Name, Depot__c,
                                                            Depot__r.Name
                                                    FROM Associate__c
                                                    WHERE Application__c =: appList[0].Id
                                                    LIMIT 1];

                System.debug('associateList-->'+ JSON.serialize(associateList));
                returnMap.put('associationId', !associateList.isEmpty() && associateList!= null ? associateList[0].Id : 'NA');
                returnMap.put('endUserName', !associateList.isEmpty() && associateList!= null ? associateList[0].End_User__r.Name : 'NA');
                returnMap.put('depotName', !associateList.isEmpty() && associateList!= null ? associateList[0].Depot__r.Name : 'NA');
                System.debug('returnMap--After>'+ JSON.serialize(returnMap));

                List<Connect_Product__c> productList = [SELECT Id,Name, Product_Commercials__c, Main_Contractor__c,Reorder_Product__c, Amount__c, Include_in_vat__c,Is_Most_Popular__c, Description__c,VAT_Registration_Product__c, Title__c FROM Connect_Product__c
                                                        WHERE Main_Contractor__c =: appList[0].Main_Contractor__c AND Include_in_vat__c =: showProduct order by Reorder_Product__c ];

                if(productList == null || productList.isEmpty()) {
                    productList = [SELECT Id,Name, Product_Commercials__c,Main_Contractor__c,Reorder_Product__c, Amount__c, Include_in_vat__c,Is_Most_Popular__c, Description__c,VAT_Registration_Product__c, Title__c FROM Connect_Product__c
                                                        WHERE Main_Contractor__c = '' AND Include_in_vat__c =: showProduct order by Reorder_Product__c ];
                }

                List<Connect_Video__c> connectVideoList = [SELECT Id, OwnerId, IsDeleted, Name, CreatedDate, CreatedById, LastModifiedDate, LastModifiedById, SystemModstamp,
                                                            LastViewedDate, LastReferencedDate, Include_in_vat__c, Company_Information__c, Preffered_Language__c, Video_Id__c
                                                            FROM Connect_Video__c WHERE  Company_Information__r.Main_Contractor__c =:appList[0].Main_Contractor__c
                                                            AND Preffered_Language__c =:appList[0].Preffered_Language__c AND Include_in_vat__c =: appList[0].Main_Contractor__r.Include_in_vat__c Limit 1];


                if(connectVideoList == null || connectVideoList.isEmpty()) {
                    connectVideoList = [SELECT Id, OwnerId, IsDeleted, Name, CreatedDate, CreatedById, LastModifiedDate, LastModifiedById, SystemModstamp,
                                        LastViewedDate, LastReferencedDate, Include_in_vat__c, Company_Information__c, Preffered_Language__c, Video_Id__c
                                        FROM Connect_Video__c WHERE Company_Information__r.Main_Contractor__c = '' AND Preffered_Language__c =:appList[0].Preffered_Language__c AND Include_in_vat__c =: appList[0].Main_Contractor__r.Include_in_vat__c Limit 1];
                }

                if(productList.size() > 0){
                    returnMap.put('products',productList);
                }

                if(connectVideoList.size() > 0){
                    returnMap.put('connectVideo',connectVideoList);
                }

            }
        }
        return JSON.Serialize(returnMap);
    }

    @AuraEnabled
    global static String updateDetails(String outputMap){
        ConfirmDetailsWrapper detailsWrapper = (ConfirmDetailsWrapper)System.JSON.deserialize(outputMap, ConfirmDetailsWrapper.class);
                   System.debug('detailsWrapper-->'+JSON.serialize(detailsWrapper));
        List<Application__c> appList = getApplication(detailsWrapper.signUpEmail,detailsWrapper.encryptedKey);

        if(appList.size()>0)
        {
            for(Application__c applicationUpdate : appList)
            {

                applicationUpdate.Last_Confirmed_Stage__c = detailsWrapper.lastConfirmStage;
                applicationUpdate.GDPR_Statement__c = detailsWrapper.GDPRStatement;
                applicationUpdate.Sign_Offers_News__c = detailsWrapper.signOffersNews;
                if(String.IsnotBlank(detailsWrapper.selectedProduct))
                {
                    System.debug('detailsWrapper.selectedProduct-->'+detailsWrapper.selectedProduct);
                    applicationUpdate.SC_Product__c = detailsWrapper.selectedProduct;
                }
                if(String.IsnotBlank(detailsWrapper.selectedAddOnProduct))
                {
                    applicationUpdate.VAT_Registration_SC_Product__c = detailsWrapper.selectedAddOnProduct;
                }
                if(detailsWrapper.lastConfirmStage == 'Video'){
                    applicationUpdate.Confirm_Video__c = true;
                }
                if(detailsWrapper.lastConfirmStage == 'Service Terms'){
                    applicationUpdate.Confirm_Service_Terms__c = true;
                    if (applicationUpdate.Is_Existing_Driver__c) {
                        applicationUpdate.SC_Status__c = 'Documents Completed';

                    } else {
                        applicationUpdate.SC_Status__c = 'Contracts Pending';

                    }
                }
                if(detailsWrapper.lastConfirmStage == 'Right To Work'){
                    applicationUpdate.Confirm_Form64__c = true;
                }
                //Basic Details
                if(detailsWrapper.confirmBasicDetails != null)
				{
                    applicationUpdate.First_Name__c = detailsWrapper.confirmBasicDetails.firstName != null ? detailsWrapper.confirmBasicDetails.firstName : applicationUpdate.First_Name__c;
                    applicationUpdate.Last_Name__c = detailsWrapper.confirmBasicDetails.lastName != null ? detailsWrapper.confirmBasicDetails.lastName : applicationUpdate.Last_Name__c;
                    applicationUpdate.Email__c = detailsWrapper.confirmBasicDetails.email != null ? detailsWrapper.confirmBasicDetails.email : applicationUpdate.Email__c;
                    applicationUpdate.Phone__c = detailsWrapper.confirmBasicDetails.phone != null ? detailsWrapper.confirmBasicDetails.phone : applicationUpdate.Phone__c;
                    applicationUpdate.Preffered_Language__c = detailsWrapper.confirmBasicDetails.preferredLanguage != null ? detailsWrapper.confirmBasicDetails.preferredLanguage : applicationUpdate.Preffered_Language__c;
                    applicationUpdate.Amazon_Cortex_Number__c = detailsWrapper.confirmBasicDetails.cortexNumber != null ? detailsWrapper.confirmBasicDetails.cortexNumber : applicationUpdate.Amazon_Cortex_Number__c;
                }

                //Address Details
                if(detailsWrapper.confirmAddressDetails != null)
                {
                    applicationUpdate.Address_Line_1__c = detailsWrapper.confirmAddressDetails.addressLine1 != null ? detailsWrapper.confirmAddressDetails.addressLine1 : applicationUpdate.Address_Line_1__c;
                    applicationUpdate.Address_Line_2__c = detailsWrapper.confirmAddressDetails.addressLine2 != null ? detailsWrapper.confirmAddressDetails.addressLine2 : applicationUpdate.Address_Line_2__c;
                    applicationUpdate.Town__c = detailsWrapper.confirmAddressDetails.town != null ? detailsWrapper.confirmAddressDetails.town : applicationUpdate.Town__c;
                    applicationUpdate.Country__c = detailsWrapper.confirmAddressDetails.country != null ? detailsWrapper.confirmAddressDetails.country : applicationUpdate.Country__c;
                    applicationUpdate.Postcode__c = detailsWrapper.confirmAddressDetails.postCode != null ? detailsWrapper.confirmAddressDetails.postCode : applicationUpdate.Postcode__c;
                    applicationUpdate.Previous_Address_Line_1__c = detailsWrapper.confirmAddressDetails.previousAddressLine1 != null ? detailsWrapper.confirmAddressDetails.previousAddressLine1 : applicationUpdate.Previous_Address_Line_1__c;
                    applicationUpdate.Previous_Address_Line_2__c = detailsWrapper.confirmAddressDetails.previousAddressLine2 != null ? detailsWrapper.confirmAddressDetails.previousAddressLine2 : applicationUpdate.Previous_Address_Line_2__c;
                    applicationUpdate.Previous_Town__c = detailsWrapper.confirmAddressDetails.previousTown != null ? detailsWrapper.confirmAddressDetails.previousTown : applicationUpdate.Previous_Town__c;
                    applicationUpdate.Previous_Country__c = detailsWrapper.confirmAddressDetails.previousCountry != null ? detailsWrapper.confirmAddressDetails.previousCountry : applicationUpdate.Previous_Country__c;
                    applicationUpdate.Previous_Postcode__c = detailsWrapper.confirmAddressDetails.previousPostCode != null ? detailsWrapper.confirmAddressDetails.previousPostCode : applicationUpdate.Previous_Postcode__c;
                    applicationUpdate.National_Insurance_Number__c = detailsWrapper.confirmAddressDetails.nationalInsNumber != null ? detailsWrapper.confirmAddressDetails.nationalInsNumber : applicationUpdate.National_Insurance_Number__c;
                    applicationUpdate.Date_of_Birth__c = detailsWrapper.confirmAddressDetails.dateOfBirth != null ? detailsWrapper.confirmAddressDetails.dateOfBirth : applicationUpdate.Date_of_Birth__c;
                    applicationUpdate.Date_Moved_to_Current_Address__c = detailsWrapper.confirmAddressDetails.dateSCMoved != null ? detailsWrapper.confirmAddressDetails.dateSCMoved : applicationUpdate.Date_Moved_to_Current_Address__c;
                    applicationUpdate.Nationality__c = detailsWrapper.confirmAddressDetails.nationality != null ? detailsWrapper.confirmAddressDetails.nationality : applicationUpdate.Nationality__c;
                }

                // Emergancy Contact Details
                if(detailsWrapper.confirmEmergancyContactDetails != null)
                {
                    applicationUpdate.Emergency_Contact_Name__c = detailsWrapper.confirmEmergancyContactDetails.EmergencyContactName != null ? detailsWrapper.confirmEmergancyContactDetails.EmergencyContactName : applicationUpdate.Emergency_Contact_Name__c;
                    applicationUpdate.Emergency_Contact_Relationship__c = detailsWrapper.confirmEmergancyContactDetails.EmergencyContactRelation != null ? detailsWrapper.confirmEmergancyContactDetails.EmergencyContactRelation : applicationUpdate.Emergency_Contact_Relationship__c;
                    applicationUpdate.Emergency_Contract_Telephone_Number__c = detailsWrapper.confirmEmergancyContactDetails.EmergencyContactNumber != null ? detailsWrapper.confirmEmergancyContactDetails.EmergencyContactNumber : applicationUpdate.Emergency_Contract_Telephone_Number__c;

                }

                // Govt Gateway Details
                if(detailsWrapper.confirmGovtGatewayDetails != null)
                {
                    applicationUpdate.Do_You_Have_Unique_Tax_Reference_Number__c = detailsWrapper.confirmGovtGatewayDetails.uniqueTaxRefNumber != null ? detailsWrapper.confirmGovtGatewayDetails.uniqueTaxRefNumber : applicationUpdate.Do_You_Have_Unique_Tax_Reference_Number__c;
                    applicationUpdate.URT_Number_Entry__c = detailsWrapper.confirmGovtGatewayDetails.URTNumberEntry != null ? detailsWrapper.confirmGovtGatewayDetails.URTNumberEntry : applicationUpdate.URT_Number_Entry__c;
                    applicationUpdate.Do_You_Have_VAT_Number__c = detailsWrapper.confirmGovtGatewayDetails.VATNumber != null ? detailsWrapper.confirmGovtGatewayDetails.VATNumber : applicationUpdate.Do_You_Have_VAT_Number__c;
                    applicationUpdate.VAT_Registration_Number__c = detailsWrapper.confirmGovtGatewayDetails.VATNumberEntry != null ? detailsWrapper.confirmGovtGatewayDetails.VATNumberEntry : applicationUpdate.VAT_Registration_Number__c;
                    applicationUpdate.know_Govt_Gateway_details__c = detailsWrapper.confirmGovtGatewayDetails.KnowGovtGatewayDetails != null ? detailsWrapper.confirmGovtGatewayDetails.KnowGovtGatewayDetails : applicationUpdate.know_Govt_Gateway_details__c;
                    applicationUpdate.Govt_Gateway_Details__c = detailsWrapper.confirmGovtGatewayDetails.GovtGatewayEntry != null ? detailsWrapper.confirmGovtGatewayDetails.GovtGatewayEntry : applicationUpdate.Govt_Gateway_Details__c;
                    applicationUpdate.Govt_Gateway_Username__c = detailsWrapper.confirmGovtGatewayDetails.govtGatewayUsername != null ? detailsWrapper.confirmGovtGatewayDetails.govtGatewayUsername : applicationUpdate.Govt_Gateway_Username__c;
                    applicationUpdate.Govt_Gateway_Password__c = detailsWrapper.confirmGovtGatewayDetails.govtGatewayPassword != null ? detailsWrapper.confirmGovtGatewayDetails.govtGatewayPassword : applicationUpdate.Govt_Gateway_Password__c;
                }

                // Bank Details
                if(detailsWrapper.confirmBankDetails != null)
                {
                    applicationUpdate.Bank_Account_Name__c = detailsWrapper.confirmBankDetails.bankAccountName != null ? detailsWrapper.confirmBankDetails.bankAccountName : applicationUpdate.Bank_Account_Name__c;
                    applicationUpdate.Bank_Account_No__c = detailsWrapper.confirmBankDetails.bankAccountNo != null ?  detailsWrapper.confirmBankDetails.bankAccountNo : applicationUpdate.Bank_Account_No__c;
                    applicationUpdate.Sort_Code__c = detailsWrapper.confirmBankDetails.sortCode != null ? detailsWrapper.confirmBankDetails.sortCode : applicationUpdate.Sort_Code__c;
                    applicationUpdate.Who_do_you_bank_with__c = detailsWrapper.confirmBankDetails.bankWithName != null ? detailsWrapper.confirmBankDetails.bankWithName : applicationUpdate.Who_do_you_bank_with__c;
                }


                // Right To Work Details
                if(detailsWrapper.confirmRightToWorkDetails != null)
                {

                    // applicationUpdate.Citizenship_Immigration_status__c = detailsWrapper.confirmRightToWorkDetails.citi_Immi_status != null ? detailsWrapper.confirmRightToWorkDetails.citi_Immi_status : applicationUpdate.Citizenship_Immigration_status__c;
                    // applicationUpdate.Right_to_work_document__c = detailsWrapper.confirmRightToWorkDetails.rtwDoc != null ?  detailsWrapper.confirmRightToWorkDetails.rtwDoc : applicationUpdate.Right_to_work_document__c;
                    // applicationUpdate.Settled_Status__c = detailsWrapper.confirmRightToWorkDetails.settledStatus != null ? detailsWrapper.confirmRightToWorkDetails.settledStatus : applicationUpdate.Settled_Status__c;
                    // applicationUpdate.Date_of_Entry__c = detailsWrapper.confirmRightToWorkDetails.dateOfEntry != null ?  Date.valueOf(detailsWrapper.confirmRightToWorkDetails.dateOfEntry) : applicationUpdate.Date_of_Entry__c;
                    // applicationUpdate.RTW_Expiry_Date__c = detailsWrapper.confirmRightToWorkDetails.expiryDate != null ?  Date.valueOf(detailsWrapper.confirmRightToWorkDetails.expiryDate) : applicationUpdate.RTW_Expiry_Date__c;
                	// applicationUpdate.Access_Code__c = detailsWrapper.confirmRightToWorkDetails.accessCode != null ? detailsWrapper.confirmRightToWorkDetails.accessCode : applicationUpdate.Access_Code__c;
                    // applicationUpdate.Biometric_Evidence__c = detailsWrapper.confirmRightToWorkDetails.biometricEvidence != null ? detailsWrapper.confirmRightToWorkDetails.biometricEvidence : applicationUpdate.Biometric_Evidence__c;
                    applicationUpdate.Citizenship_Immigration_status__c = detailsWrapper.confirmRightToWorkDetails.citi_Immi_status != null ? detailsWrapper.confirmRightToWorkDetails.citi_Immi_status : applicationUpdate.Citizenship_Immigration_status__c;
                    applicationUpdate.Right_to_work_document__c = detailsWrapper.confirmRightToWorkDetails.rtwDoc != null ?  detailsWrapper.confirmRightToWorkDetails.rtwDoc : null;
                    applicationUpdate.Settled_Status__c = detailsWrapper.confirmRightToWorkDetails.settledStatus != null ? detailsWrapper.confirmRightToWorkDetails.settledStatus : null;
                    applicationUpdate.Date_of_Entry__c = detailsWrapper.confirmRightToWorkDetails.dateOfEntry != null ?  Date.valueOf(detailsWrapper.confirmRightToWorkDetails.dateOfEntry) : null;
                    applicationUpdate.RTW_Expiry_Date__c = detailsWrapper.confirmRightToWorkDetails.expiryDate != null ?  Date.valueOf(detailsWrapper.confirmRightToWorkDetails.expiryDate) : null;
                	applicationUpdate.Access_Code__c = detailsWrapper.confirmRightToWorkDetails.accessCode != null ? detailsWrapper.confirmRightToWorkDetails.accessCode : '';
                    applicationUpdate.Share_Code__C = detailsWrapper.confirmRightToWorkDetails.shareCode != null ? detailsWrapper.confirmRightToWorkDetails.shareCode : '';
                    applicationUpdate.Biometric_Evidence__c = detailsWrapper.confirmRightToWorkDetails.biometricEvidence != null ? detailsWrapper.confirmRightToWorkDetails.biometricEvidence : null;
                }

                // Driving License Details
                if(detailsWrapper.confirmDrivingLicenseDetails != null)
                {
                    applicationUpdate.Driving_Licence_Number__c = detailsWrapper.confirmDrivingLicenseDetails.licenseNumber != null ? detailsWrapper.confirmDrivingLicenseDetails.licenseNumber : applicationUpdate.Driving_Licence_Number__c;
                    applicationUpdate.Points_on_Licence__c = detailsWrapper.confirmDrivingLicenseDetails.pointOfLicense != null ?  detailsWrapper.confirmDrivingLicenseDetails.pointOfLicense : applicationUpdate.Points_on_Licence__c;
                    applicationUpdate.Driving_Licence_Expiry_Date__c = detailsWrapper.confirmDrivingLicenseDetails.licenseExpiryDate != null ?  Date.valueOf(detailsWrapper.confirmDrivingLicenseDetails.licenseExpiryDate) : applicationUpdate.Driving_Licence_Expiry_Date__c;
					applicationUpdate.Type_of_licence__c = detailsWrapper.confirmDrivingLicenseDetails.typeOfLicense != null ? detailsWrapper.confirmDrivingLicenseDetails.typeOfLicense : applicationUpdate.Type_of_licence__c;
                    applicationUpdate.Additional_licence_categories__c = detailsWrapper.confirmDrivingLicenseDetails.licenseCategory != null ? String.valueOf(detailsWrapper.confirmDrivingLicenseDetails.licenseCategory) : applicationUpdate.Additional_licence_categories__c;
                    applicationUpdate.Driving_Licence_Issue_Date__c = detailsWrapper.confirmDrivingLicenseDetails.licenseIssueDate != null ?  Date.valueOf(detailsWrapper.confirmDrivingLicenseDetails.licenseIssueDate) : applicationUpdate.Driving_Licence_Issue_Date__c;
                }
                System.debug('applicationUpdate-->'+JSON.serialize(applicationUpdate));
            }
            System.debug('appList-->'+JSON.serialize(appList));


            Update appList;



        }
        return null;
    }

    public static List<Application__c> getApplication(String email, String encryptedKey)
    {
        email = email.toLowerCase();
        return [SELECT Id, Name,  Main_Contractor__c,Main_Contractor__r.Include_in_vat__c,Main_Contractor__r.Name, First_Name__c, Last_Name__c,Phone__c, Email__c, Nationality__c,
                Date_of_Birth__c, National_Insurance_Number__c, Do_You_Have_Unique_Tax_Reference_Number__c,URT_Number_Entry__c, Generate_Product_Type__c,SC_Product__c,VAT_Registration_SC_Product__c,
                Date_Expires__c, Date_Signed__c, Fee_Type__c, Do_You_Have_VAT_Number__c,VAT_Registration_Number__c,
                Next_Client_Fee_Waived__c, VAT_Period__c,SC_Status__c,
                Previous_Country__c, Previous_Address_Line_1__c, Effective_Date_of_VAT_Registration__c, VAT_Scheme__c,Confirm_Video__c,
                Previous_Town__c, Previous_Postcode__c, Flat_Rate_First_Year_Discount__c,Confirm_Service_Terms__c,
                Previous_Address_Line_2__c, Town__c, Country__c, Postcode__c, Address_Line_1__c, Address_Line_2__c,Confirm_Form64__c,know_Govt_Gateway_details__c,
                Govt_Gateway_Password__c, Date_Moved_to_Current_Address__c, Govt_Gateway_Username__c, GDPR_Statement__c,Govt_Gateway_Details__c,Emergency_Contact_Name__c,Emergency_Contact_Relationship__c,Emergency_Contract_Telephone_Number__c,
                Sign_Offers_News__c, Main_Contractor_ID__c, Company_Name__c, Emergency_Contact__c,Sort_Code__c,Bank_Account_No__c,Bank_Account_Name__c,Who_do_you_bank_with__c,
                Flat_Rate_First_Year_Ends__c, Preffered_Language__c, Busineess_Rate__c, SubContractor_URL__c,EncryptedKey__c,Is_Existing_Driver__c,
                Last_Confirmed_Stage__c,Amazon_Cortex_Number__c,Duplicate_Found__c,Match_Account__c,
                Citizenship_Immigration_status__c, Right_to_work_document__c, Settled_Status__c, Date_of_Entry__c, Access_Code__c, Biometric_Evidence__c,RTW_Expiry_Date__c, DL_Requested__c, RTW_Requested__c,
                Driving_Licence_Number__c, Points_on_Licence__c, Driving_Licence_Expiry_Date__c, Type_of_licence__c, Additional_licence_categories__c, Driving_Licence_Issue_Date__c, Share_Code__c
                FROM Application__c where Email__c =:email And EncryptedKey__c=:encryptedKey Limit 1];
    }

    @AuraEnabled
    public static String prefferLanguage(){
        List<String> prefferLanguageList = new List<String>();
        Schema.DescribeFieldResult prefferLanguageResult = account.Preffered_Language__c.getDescribe();
        List<Schema.PicklistEntry> prefferLanguagePicklist = prefferLanguageResult.getPicklistValues();

        for(Schema.PicklistEntry picklistValues : prefferLanguagePicklist){

            prefferLanguageList.add(picklistValues.getValue());
        }

        if(prefferLanguageList.size() > 0){
            return JSON.serialize(prefferLanguageList);
        }else{
            return null;
        }
    }

    @AuraEnabled
    public static String nationality(){
        List<String> nationalityList = new List<String>();
        Schema.DescribeFieldResult nationalityResult = account.Nationality__c.getDescribe();
        List<Schema.PicklistEntry> nationalityPicklist = nationalityResult.getPicklistValues();

        for(Schema.PicklistEntry picklistValues : nationalityPicklist){

            nationalityList.add(picklistValues.getValue());
        }

        if(nationalityList.size() > 0){
            return JSON.serialize(nationalityList);
        }else{
            return null;
        }
    }

    global class ConfirmDetailsWrapper
    {

        public String signUpEmail {get;set;}
        public String encryptedKey {get; set;}
        public Boolean GDPRStatement{get;set;}
        public Boolean signOffersNews{get;set;}
        public String lastConfirmStage {get;set;}
        public String selectedProduct {get;set;}
        public String selectedAddOnProduct {get;set;}
        public confirmBasicDetails confirmBasicDetails {get;set;}
        public confirmAddressDetails confirmAddressDetails {get;set;}
        public confirmEmergancyContactDetails confirmEmergancyContactDetails {get;set;}
        public confirmGovtGatewayDetails confirmGovtGatewayDetails {get;set;}
        public confirmBankDetails confirmBankDetails {get;set;}
        public confirmRightToWorkDetails confirmRightToWorkDetails {get;set;} // Get the Right To Work Details
        public confirmDrivingLicenseDetails confirmDrivingLicenseDetails {get;set;} // Get the Driving License Details
    }

    global class confirmDrivingLicenseDetails{
        public String licenseNumber {get;set;}
        public String pointOfLicense{get;set;}
        public String licenseExpiryDate {get;set;}
        public String typeOfLicense {get;set;}
        public String licenseCategory {get;set;}
        public String licenseIssueDate {get;set;}
    }

     global class confirmRightToWorkDetails{
        public String citi_Immi_status {get;set;}
        public String rtwDoc{get;set;}
        public String settledStatus {get;set;}
        public String dateOfEntry {get;set;}
        public String accessCode {get;set;}
        public String shareCode {get;set;}
        public String biometricEvidence {get;set;}
        public String expiryDate {get;set;}
    }

    global class confirmBasicDetails{
        public String firstName {get;set;}
        public String lastName{get;set;}
        public String phone {get;set;}
        public String email {get;set;}
        public String preferredLanguage {get;set;}
        public String cortexNumber {get;set;}
    }
    global class confirmAddressDetails{
        public String addressLine1 {get;set;}
        public String addressLine2 {get;set;}
        public String town {get;set;}
        public String country {get;set;}
        public String postCode {get;set;}
        public String previousAddressLine1 {get;set;}
        public String previousAddressLine2 {get;set;}
        public String previousTown {get;set;}
        public String previousCountry {get;set;}
        public String previousPostCode {get;set;}
        public String nationalInsNumber {get;set;}
        public date dateOfBirth {get;set;}
        public date dateSCMoved {get;set;}
        public String nationality {get;set;}
    }

    global class confirmEmergancyContactDetails{
        public String EmergencyContactName {get;set;}
        public String EmergencyContactRelation {get;set;}
        public String EmergencyContactNumber {get;set;}
    }
    global class confirmGovtGatewayDetails{
        public String uniqueTaxRefNumber {get;set;}
        public String URTNumberEntry {get;set;}
        public String VATNumber {get;set;}
        public String VATNumberEntry {get;set;}
        public String KnowGovtGatewayDetails {get;set;}
        public String GovtGatewayEntry {get;set;}
        public String govtGatewayUsername {get;set;}
        public String govtGatewayPassword {get;set;}
    }

    global class confirmBankDetails{
        public String bankAccountName {get;set;}
        public String bankAccountNo {get;set;}
        public String sortCode{get;set;}
        public String bankWithName{get;set;}
    }


}
