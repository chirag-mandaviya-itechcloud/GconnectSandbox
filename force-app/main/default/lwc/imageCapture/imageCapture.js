import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import photoIcon from '@salesforce/resourceUrl/photoCaptureIcon';
import uploadIcon from '@salesforce/resourceUrl/uploadFileIcon';
import Camera_Swap from '@salesforce/resourceUrl/Camera_Swap';
import HEADER_ICONS from '@salesforce/resourceUrl/Header_Icons';

export default class ImageCapture extends LightningElement {
    @api recordId;
    @api allowedExtension;
    @track showCamera = false;
    @track showCaptureIcon = false;
    @track images = [];
    @track files = [];
    @track profiles = [];
    MAX_FILE_SIZE = 5242880; // 5 MB in bytes

    @track photoIcon;
    @track uploadIcon;
    @track Camera_Swap;

    @track uploadFiles = [];
    @track capturedFiles = [];
    @track profileFiles = [];

    @track selectedUploadFiles = [];
    @track selectedCapturedFiles = [];
    @track selectedProfileFiles = [];
    @track fileAcceptExtension = '.png, .jpg, .jpeg';

    imageIdCounter = 0;
    currentStream = null;
    currentDeviceId = null;
    devices = [];
    currentDeviceIndex = 0;

    @api showFileUpload;
    @api showCaptureFile;
    @api showProfile;


    isFrontDoc = false;
    isBackDoc = false;
    docType = 'Front';

    // Front --
    @track uploadFrontFiles = [];
    @track selFrontUploadFiles = [];
    @track setFrontUploadDisable = false;

    @track capturedFrontFiles = [];
    @track selFrontCapturedFiles = [];
    @track setFrontCaptureDisable = false;

    //Back --
    @track uploadBackFiles = [];
    @track selBackUploadFiles = [];
    @track setBackUploadDisable = false;

    @track capturedBackFiles = [];
    @track selBackCapturedFiles = [];
    @track setBackCaptureDisable = false;

    @api showDocError = false;
    @api showErrorMessage = '';
    @api showFrontBackRadioBtn; //--271025 Change

    @track disableProfileCapture = false;
    @track disabledProfileUpload = false;

    @track isFrontCameraOpen = false;

    @track rtwGuideImage = `${HEADER_ICONS}/HeaderIcons/RTW_guide.png`;
    @track frontGuideImage = `${HEADER_ICONS}/HeaderIcons/Front_guide.png`;
    @track backGuideImage = `${HEADER_ICONS}/HeaderIcons/Back_guide.png`;
    @track showRTWGuideImage;
    @track showFrontGuideImage;
    @track showBackGuideImage;
    
    @api documentNames = [];
    
    // get optionDocType() {
    //     return [
    //         { label: "Front", value: "Front" },
    //         { label: "Back", value: "Back" }
    //     ];
    // }
    get optionDocType() {
    // For RTW documents with custom names
    if (this.documentNames && this.documentNames.length === 2) {
        return [
            { label: this.documentNames[0], value: "Front" },
            { label: this.documentNames[1], value: "Back" }
        ];
    }
    // Default for Driving License (Front/Back)
    return [
        { label: "Front", value: "Front" },
        { label: "Back", value: "Back" }
    ];
}

    connectedCallback() {
        
        
        this.photoIcon = photoIcon;
        this.uploadIcon = uploadIcon;
        this.Camera_Swap = Camera_Swap
        const style = document.createElement('style');
        style.innerText = `
                    .close_icon svg path {
                        fill: white
                    }
                `;
        setTimeout(() => {
            this.template.querySelector('.overrideStyle').appendChild(style);
        }, 100);

        if (this.allowedExtension != null) {
            this.fileAcceptExtension = this.allowedExtension;
        }

        if (this.docType === 'Front') {
            this.isFrontDoc = true;
            this.isBackDoc = false;
        } else if (this.docType === 'Back') {
            this.isFrontDoc = false;
            this.isBackDoc = true;
        }
        this.setGuideImageEnabledDisabled();
        /*if (this.showCaptureFile && this.showFileUpload) {
            this.showFrontBackRadioBtn = true;
        }
        else {
            this.showFrontBackRadioBtn = false;
        }*/
    }

    handleFileChange(event) {
        const selectedFiles = event.target.files;
        const fileArray = [];
        this.selectedUploadFiles = selectedFiles;
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const fileReader = new FileReader();

            fileReader.onload = () => {
                const base64Data = fileReader.result.split(',')[1];
                const isImage = file.type.startsWith('image/');
                const fileObj = {
                    id: Date.now() + i,
                    name: file.name,
                    base64Data: base64Data,
                    contentType: file.type,
                    isImage: isImage,
                    preview: isImage ? fileReader.result : null
                };
                fileArray.push(fileObj);
                if (fileArray.length === selectedFiles.length) {
                    this.files = [...this.files, ...fileArray];
                    this.uploadFiles = [...this.uploadFiles, ...fileArray];
                }
            };

            fileReader.readAsDataURL(file);
        }
    }

    handleProfileChange(event) {
        const selectedFiles = event.target.files;
        if (selectedFiles.length === 0) return;

        const file = selectedFiles[0];
        this.selectedProfileFiles = selectedFiles;

        // Check if the file size is within the allowed limit (5 MB)
        if (file && file.size <= this.MAX_FILE_SIZE) {
            const fileReader = new FileReader();

            fileReader.onload = () => {
                const base64Data = fileReader.result.split(',')[1];
                const isImage = file.type.startsWith('image/');
                if (isImage) {

                    if (file.size > (3 * 1024 * 1024)) {
                        // Resize the image to reduce its size to 3 MB or less
                        this.resizeImage(file, base64Data)
                            .then((resizedBase64) => {
                                this.createProfileObject(file, resizedBase64, true);
                            })
                            .catch(() => {
                                this.showErrorToast('Failed to resize the image.');
                            });
                    } else {
                        this.createProfileObject(file, base64Data, true);
                    }

                
                }else{
                    this.createProfileObject(file, resizedBase64, false);    
                }
                
                //this.createProfileObject(file, base64Data, false);
                
            };

            fileReader.readAsDataURL(file); // Read file content as base64 string
        } else {
            this.showErrorToast('Profile photo must be under 5 MB.');
        }
    }

    resizeImage(file, base64Data) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = `data:${file.type};base64,${base64Data}`;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const targetSize = 3 * 1024 * 1024; // Target size: 3 MB
                let quality = 0.9; // Start with 90% quality
                let resizedBase64 = '';
                let sizeInBytes = 0;
    
                // Set canvas size based on original image dimensions
                canvas.width = img.width;
                canvas.height = img.height;
    
                // Draw image to canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
                // Convert PNG to JPG if needed
                let outputFormat = 'image/jpeg';  // Default output as JPG
                if (file.type === 'image/png') {
                    // Draw the image on canvas and convert to JPG
                    resizedBase64 = canvas.toDataURL(outputFormat, quality).split(',')[1];
                } else {
                    // Keep the original type 
                    outputFormat = file.type;
                    resizedBase64 = canvas.toDataURL(outputFormat, quality).split(',')[1];
                }
    
                // Get approximate size in bytes
                sizeInBytes = Math.floor((resizedBase64.length * 3) / 4);
    
                // Use a loop to adjust quality for target size
                while (sizeInBytes > targetSize && quality > 0) {
                    quality -= 0.05; // Reduce quality by 5% per iteration
                    resizedBase64 = canvas.toDataURL(outputFormat, quality).split(',')[1];
                    sizeInBytes = Math.floor((resizedBase64.length * 3) / 4); // Recalculate size
                }
    
                // Check if final size is within limits
                if (sizeInBytes <= targetSize) {
                    resolve(resizedBase64);
                } else {
                    reject(new Error('Unable to compress to desired size'));
                }
            };
    
            img.onerror = (error) => reject(error);
        });
    }
    

    // resizeImage(file, base64Data) {
    //     return new Promise((resolve, reject) => {
    //         const img = new Image();
    //         img.src = `data:${file.type};base64,${base64Data}`;
    //         console.log('file.size-->', file.type);
            
    //         img.onload = () => {
    //             const canvas = document.createElement('canvas');
    //             const ctx = canvas.getContext('2d');


    //             canvas.width = img.width;
    //             canvas.height = img.height;
    //             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    //             let quality = 0.9; // Start with 90% quality
    //             let resizedBase64 = '';
    //             let sizeInBytes = 0;
    //             const targetSize = 3 * 1024 * 1024; // Target size: 3 MB

    //             resizedBase64 = canvas.toDataURL(file.type, quality).split(',')[1];
    //             sizeInBytes = Math.floor((resizedBase64.length * 3) / 4); // Approximate size in bytes
    //             // Use a while loop to gradually reduce the image quality until it's under 3 MB
    //             while (sizeInBytes > targetSize && quality > 0) {
    //                 quality -= 0.05; // Reduce quality by 5% per iteration
    //                 console.log('quality-Reduce-->', quality);
    //                 resizedBase64 = canvas.toDataURL(file.type, quality).split(',')[1];
    //                 console.log('resizedBase64- WHILE-->', resizedBase64);
    //                 sizeInBytes = Math.floor((resizedBase64.length * 3) / 4);
    //                 console.log('sizeInBytes- WHILE-->', sizeInBytes);
                    
    //             }
    //             console.log('sizeInBytes <= targetSize-->', sizeInBytes <= targetSize);
    //             if (sizeInBytes <= targetSize) {
    //                 resolve(resizedBase64);
    //             } else {
    //                 reject(new Error('Unable to compress to desired size'));
    //             }
    //         };

    //         img.onerror = (error) => reject(error);
    //     });
    // }

    // Create file object for further processing
    createProfileObject(file, base64Data, isImage) {
        const fileObj = {
            id: Date.now(),
            name: file.name,
            base64Data: base64Data,
            contentType: file.type,
            isImage: isImage,
            docType: 'Profile',
            imageSource: 'UPLOAD',
            fileType: file.type.replace('image/', ''),
            preview: isImage ? `data:${file.type};base64,${base64Data}` : null
        };

        this.profiles = [fileObj];
        this.profileFiles = [fileObj];
    }

    // Show error toast
    showErrorToast(message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: message,
                variant: 'error'
            })
        );
    }


    handleRemoveImage(event) {
        const imageName = event.target.dataset.imageName;
        this.displayProfile = [];
        this.showCamera = false;
    }
    handleRemoveProfile(event) {
        const fileId = event.target.dataset.index;
        this.disableProfileCapture = false;
        this.disabledProfileUpload = false;
        this.showCamera = false;
        this.profiles = this.profiles.filter(file => file.id !== parseInt(fileId));
        this.profileFiles = this.profileFiles.filter(file => file.id !== parseInt(fileId));
    }



    @api
    resetFiles() {
        this.files = [];
        this.uploadFiles = [];
        this.images = [];
        this.capturedFiles = [];
        this.selectedUploadFiles = [];
        this.selectedProfileFiles = [];
        this.profileFiles = [];
        this.profiles = [];
        this.uploadFrontFiles = [];
        this.uploadBackFiles = [];
        this.capturedFrontFiles = [];
        this.capturedBackFiles = [];
    }

    @api
    getUploadDocs() {
        return {
            selectedUploadFiles: this.selectedUploadFiles,
            uploadFiles: this.uploadFiles,
            uploadFrontFiles: this.uploadFrontFiles,
            uploadBackFiles: this.uploadBackFiles,
            capturedFrontFiles: this.capturedFrontFiles,
            capturedBackFiles: this.capturedBackFiles
        };
    }

    @api
    getCapturedDocs() {
        return {
            capturedFiles: this.capturedFiles,
            images: this.images
        };
    }

    @api
    getProfileDocs() {
        return {
            profileFiles: this.profileFiles,
            selectedProfileFiles: this.selectedProfileFiles
        };
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }

    captureFrontImage() {
        this.showCamera = true;
        window.setTimeout(() => {
            this.initializeCamera();
        }, 500);
    }

    removeImage(event) {
        const imageId = event.target.dataset.index;
        this.images = this.images.filter(image => image.id !== parseInt(imageId, 10));
        this.capturedFiles = this.capturedFiles.filter(image => image.id !== parseInt(imageId, 10));
        this.showCamera = false;
    }


    //==========================================================================================================================================================
    onChangeDocType(event) {

        this.docType = event.target.value;
        if (event.target.value == 'Front') {
            this.isFrontDoc = true;
            this.isBackDoc = false;
        } else if (event.target.value == 'Back') {
            this.isFrontDoc = false;
            this.isBackDoc = true;
        }
        this.showCamera = false;
        this.setGuideImageEnabledDisabled()
    }


    // File Upload  ========================================================================

    createFrontFileObject(file, base64Data, isImage) {

        const fileObj = {
            id: Date.now(),
            name: file.name,
            base64Data: base64Data,
            contentType: file.type,
            fileType: file.type.split('/')[1],
            docType: 'Front',
            imageSource: 'UPLOAD',
            isImage: isImage,
            preview: isImage ? `data:${file.type};base64,${base64Data}` : null
        };

        this.uploadFrontFiles = [fileObj];
        this.setGuideImageEnabledDisabled();
    }

    createBackFileObject(file, base64Data, isImage) {

        const fileObj = {
            id: Date.now(),
            name: file.name,
            base64Data: base64Data,
            contentType: file.type,
            fileType: file.type.split('/')[1],
            docType: 'Back',
            imageSource: 'UPLOAD',
            isImage: isImage,
            preview: isImage ? `data:${file.type};base64,${base64Data}` : null
        };

        this.uploadBackFiles = [fileObj];
        this.setGuideImageEnabledDisabled();
    }

    handleFileUploadChange(event) {
        this.showCamera = false;
        const selectedFiles = event.target.files;
        if (selectedFiles.length === 0) return;

        if(this.isFrontDoc){
            this.selFrontUploadFiles = selectedFiles;
        }
        if(this.isBackDoc){
            this.selBackUploadFiles = selectedFiles;
        }

        const file = selectedFiles[0];

        // Validate file extension (case-insensitive)
        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
        
        // Parse allowedExtensions string into array and convert to lowercase
        const allowedExts = this.fileAcceptExtension
            .toLowerCase()
            .split(',')
            .map(ext => ext.trim());
        
        if (!allowedExts.includes(fileExtension)) {
            // Check if it's a PDF for specific error message
            if (fileExtension === '.pdf') {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'PDF files are not allowed.',
                        variant: 'error'
                    })
                );
            } else {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: `File type ${fileExtension} is not allowed. Allowed types: ${this.fileAcceptExtension}`,
                        variant: 'error'
                    })
                );
            }
            return;
        }

        if (file.size > this.MAX_FILE_SIZE) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'File must be under 5 MB',
                    variant: 'error'
                })
            );
            return;
        }
        
    
        
        const fileReader = new FileReader();


        if(this.isFrontDoc){
            fileReader.onload = () => {
                const base64Data = fileReader.result.split(',')[1];
                const isImage = file.type.startsWith('image/');
                if (isImage) {
                    if (file.size > (3 * 1024 * 1024)) {
                        this.resizeImage(file, base64Data)
                            .then((resizedBase64) => {
                                this.createFrontFileObject(file, resizedBase64, true);
                            })
                            .catch(() => {
                                this.showErrorToast('Failed to resize the image.');
                            });
                    } else {
                        this.createFrontFileObject(file, base64Data, true);
                    }
                } else {
                    this.createFrontFileObject(file, base64Data, false);
                }
            };
            this.setFrontbuttonDisabled();
            //this.isBackDoc = true;
            //this.isFrontDoc = false;
            //this.docType = 'Back';
        }
        if(this.isBackDoc){
            fileReader.onload = () => {
                const base64Data = fileReader.result.split(',')[1];
                const isImage = file.type.startsWith('image/');
                if (isImage) {
                    if (file.size > (3 * 1024 * 1024)) {
                        this.resizeImage(file, base64Data)
                            .then((resizedBase64) => {
                                this.createBackFileObject(file, resizedBase64, true);
                            })
                            .catch(() => {
                                this.showErrorToast('Failed to resize the image.');
                            });
                    } else {
                        this.createBackFileObject(file, base64Data, true);
                    }
                } else {
                    this.createBackFileObject(file, base64Data, false);
                }
            };
            this.setBackbuttonDisabled();
            
        }


        fileReader.readAsDataURL(file);
            
            
        
    }


    delFrontUploadFile(event) {

        const fileId = event.target.dataset.index;
        this.uploadFrontFiles = this.uploadFrontFiles.filter(file => file.id !== parseInt(fileId));
        this.selFrontUploadFiles = this.uploadFrontFiles;
        if (this.selFrontUploadFiles.length == 0 && this.selFrontCapturedFiles.length == 0) {
            this.setFrontButtonEnabled();
        }
        this.setGuideImageEnabledDisabled();
        this.clearCache();
    }

    delBackUploadFile(event) {

        const fileId = event.target.dataset.index;
        this.uploadBackFiles = this.uploadBackFiles.filter(file => file.id !== parseInt(fileId));
        this.selBackUploadFiles = this.uploadBackFiles;
        if (this.selBackUploadFiles.length == 0 && this.selBackCapturedFiles.length == 0) {
            this.setBackButtonEnabled();
        }
        this.setGuideImageEnabledDisabled();
        this.clearCache();
    }

    clearCache(){
         const inputs = this.template.querySelectorAll('input[type="file"]');
        inputs.forEach(input => {
            input.value = null;
        });
    }

    // Capture Image  ========================================================================
    removeFrontImage(event) {
        const imageId = event.target.dataset.index;
        this.capturedFrontFiles = this.capturedFrontFiles.filter(image => image.id !== parseInt(imageId, 10));
        this.selFrontCapturedFiles = this.capturedFrontFiles;
        this.showCamera = false;
        if (this.selFrontUploadFiles.length == 0 && this.selFrontCapturedFiles.length == 0) {
            this.setFrontButtonEnabled();
        }
        this.setGuideImageEnabledDisabled();
    }

    removeBackImage(event) {
        const imageId = event.target.dataset.index;
        this.capturedBackFiles = this.capturedBackFiles.filter(image => image.id !== parseInt(imageId, 10));
        this.selBackCapturedFiles = this.capturedBackFiles;
        this.showCamera = false;
        if (this.selBackUploadFiles.length == 0 && this.selBackCapturedFiles.length == 0) {
            this.setBackButtonEnabled();
        }
        this.setGuideImageEnabledDisabled();
    }


    captureImage() {
        this.showCamera = true;
        window.setTimeout(() => {
            this.initializeCamera();
        }, 500);
    }

    async initializeCamera() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.devices = devices.filter(device => device.kind === 'videoinput');
            this.startCamera(false);
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Unable to access camera',
                    variant: 'error'
                })
            );
            console.error('Error initializing camera:', error);
        }
    }

    handleToggleChange(event){
        let isChecked = event.target.checked;
        let frontCamera = false;
        if (isChecked) {
            frontCamera = true;
        }
        else {
            frontCamera = false;
        }
        this.startCamera(frontCamera);
    }

    handleCameraSwap(){
        if (this.isFrontCameraOpen == false) {
            this.isFrontCameraOpen = true;
        }
        else {
            this.isFrontCameraOpen = false;
        }
        this.startCamera(this.isFrontCameraOpen);
    }

    startCamera(isFrontCamera) {

        let deviceId;
        let constraints;
        if (isFrontCamera) {
            deviceId = this.devices.find(device => device.label.toLowerCase().includes('front'))?.deviceId;
            constraints = {
                video: {
                    deviceId: { exact: deviceId },
                    facingMode: 'user' // 'user' for front camera, 'environment' for back camera
                }
            };
        } else {
            deviceId = this.devices.find(device => device.label.toLowerCase().includes('back'))?.deviceId;
            constraints = {
                video: {
                    deviceId: { exact: deviceId },
                    facingMode: 'environment' // 'user' for front camera, 'environment' for back camera
                }
            };
        }
        if (this.currentStream != null) {
            this.currentStream.getTracks()
                .forEach(track => track.stop());
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                const video = this.template.querySelector('video');
                video.srcObject = stream;
                this.currentStream = stream;

                this.showCaptureIcon = true;
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Unable to access camera',
                        variant: 'error'
                    })
                );
                console.error('Error starting camera:', error);
            });
    }

    takePhoto() {
        const canvas = this.template.querySelector('canvas');
        const video = this.template.querySelector('video');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        this.imageIdCounter = this.imageIdCounter + 1;
        const base64String = imageData.replace("data:image/png;base64,", "");
        const fileSize = Math.round((base64String.length * (3 / 4)));
        if (fileSize > this.MAX_FILE_SIZE) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'The captured image exceeds the 5MB size limit.',
                    variant: 'error'
                })
            );
            return;
        }
        if (this.isFrontDoc) {

            this.capturedFrontFiles = [{
                id: Date.now(),
                preview: imageData,
                base64Data: imageData.replace("data:image/png;base64,", ""),
                contentType: 'image/png',
                fileType: 'png',
                docType: 'Front',
                imageSource: 'CAPTURED',
                isImage: true
            }];
            this.selFrontCapturedFiles = this.capturedFrontFiles;
            this.setFrontbuttonDisabled();
            this.setGuideImageEnabledDisabled();
            //this.isBackDoc = true;
            //this.isFrontDoc = false;
            //this.docType = 'Back';

        } else if (this.isBackDoc) {
            this.capturedBackFiles = [{
                id: Date.now(),
                preview: imageData,
                base64Data: imageData.replace("data:image/png;base64,", ""),
                contentType: 'image/png',
                fileType: 'png',
                docType: 'Back',
                imageSource: 'CAPTURED',
                isImage: true
            }];
            this.selBackCapturedFiles = this.capturedBackFiles;

            this.setBackbuttonDisabled();
            this.setGuideImageEnabledDisabled();
        }


        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Photo captured successfully.',
                variant: 'success'
            })
        );
    }


    takePhotoForProfile() {
        const canvas = this.template.querySelector('canvas');
        const video = this.template.querySelector('video');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        const base64String = imageData.replace("data:image/png;base64,", "");
        const fileSize = Math.round((base64String.length * (3 / 4)));
        if (fileSize > this.MAX_FILE_SIZE) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'The captured image exceeds the 5MB size limit.',
                    variant: 'error'
                })
            );
            return;
        }


        this.profileFiles = [{
            id: Date.now(),
            preview: imageData,
            base64Data: imageData.replace("data:image/png;base64,", ""),
            contentType: 'image/png',
            fileType: 'png',
            docType: 'Profile',
            imageSource: 'CAPTURED',
            isImage: true,
            name: 'Profile_picture.png'
        }];
        this.selectedProfileFiles = this.profileFiles;
        this.disableProfileCapture = false;
        this.disabledProfileUpload = true;

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Photo captured successfully.',
                variant: 'success'
            })
        );
    }

    // Button Enabled/Disabled =======================================

    setFrontbuttonDisabled(){

        if (this.selFrontCapturedFiles.length > 0 && this.selFrontUploadFiles.length == 0) {
            this.setFrontCaptureDisable = false;
            this.setFrontUploadDisable = true;
        }
        if (this.selFrontCapturedFiles.length == 0 && this.selFrontUploadFiles.length > 0) {
            this.setFrontCaptureDisable = true;
            this.setFrontUploadDisable = false;
        }
    }

    setFrontButtonEnabled(){
        this.setFrontUploadDisable = false;
        this.setFrontCaptureDisable = false;
    }

    setBackbuttonDisabled(){

        if (this.selBackCapturedFiles.length > 0 && this.selBackUploadFiles.length == 0) {
            this.setBackCaptureDisable = false;
            this.setBackUploadDisable = true;
        }
        if (this.selBackCapturedFiles.length == 0 && this.selBackUploadFiles.length > 0) {
            this.setBackCaptureDisable = true;
            this.setBackUploadDisable = false;
        }
    }

    setBackButtonEnabled(){
        this.setBackUploadDisable = false;
        this.setBackCaptureDisable = false;
    }

    setGuideImageEnabledDisabled(){
        if(this.showFrontBackRadioBtn  == undefined){
            this.showFrontGuideImage = false;
            this.showRTWGuideImage = false;
        }else{
            if(this.showFrontBackRadioBtn){
                //if(this.isFrontDoc){
                if(this.uploadFrontFiles.length > 0 || this.capturedFrontFiles.length > 0  || 
                   this.uploadBackFiles.length > 0 || this.capturedBackFiles.length > 0 )
                {
                    this.showFrontGuideImage = false;
                }else{
                    this.showFrontGuideImage = true;
                }
                //}
                // if(this.isBackDoc){
                //     if(this.uploadBackFiles.length > 0 || this.capturedBackFiles.length > 0){
                //         this.showBackGuideImage = false;
                //     } else{
                //         this.showBackGuideImage = true;
                //     }
                // }
                
    
            }else{
                if(this.uploadFrontFiles.length > 0 || this.capturedFrontFiles.length > 0){
                    this.showRTWGuideImage = false;
                }else{
                    this.showRTWGuideImage = true;
                }
            }
        }
        
        
        
    }


}