import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RtwUpload extends LightningElement {

    @api uploadMode        = 'single';
    @api documentType      = '';
    @api selectedRtwOption = '';
    @api recordId;

    // camera
    @track showCamera        = false;
    @track showFrontCamera   = false;
    @track showBackCamera    = false;
    @track showCaptureIcon   = false;
    @track isFrontCameraOpen = false;
    currentStream = null;

    @track showResubmissionNotice = false;
    MAX_FILE_SIZE = 5242880; // 5 MB

    // files
    @track uploadFrontFiles   = [];
    @track capturedFrontFiles = [];
    @track uploadBackFiles    = [];
    @track capturedBackFiles  = [];

    // pending restore (set before component re-renders)
    _pendingRestore = null;
    _restored       = false;

    guidelines = [
        "The full document page must be visible — don't crop any edges",
        "The photo must be clear and in focus — all text should be readable",
        "Place the document on a flat, dark surface — not on your lap or sofa",
        "Make sure the document is still valid and hasn't expired"
    ];

    @api
    set rtwFiles(value) {
        this._rtwFiles = value;

        if (value && value.length > 0) {
            this.restoreFromParent(value);
        }
    }
    get rtwFiles() {
        return this._rtwFiles;
    }

    // ─── computed ──────────────────────────────────────────
    get isSingleMode() { return this.uploadMode === 'single'; }
    get isDualMode()   { return this.uploadMode === 'dual';   }

    get hasFrontFile() {
        return this.uploadFrontFiles.length > 0 || this.capturedFrontFiles.length > 0;
    }
    get hasBackFile() {
        return this.uploadBackFiles.length > 0 || this.capturedBackFiles.length > 0;
    }

    // ── single combined list used in template for:each ─────
    // Always max 1 item for single mode (enforced on upload)
    get frontFilesList() {
        return [...this.uploadFrontFiles, ...this.capturedFrontFiles];
    }
    get backFilesList() {
        return [...this.uploadBackFiles, ...this.capturedBackFiles];
    }

    get certificateLabel() {
        return this.documentType.includes('Irish')
            ? 'Irish Birth or Adoption Certificate'
            : 'Birth or Adoption Certificate';
    }
    get showCertificateWarning() {
        return this.isDualMode && !this.documentType.includes('Irish');
    }

    connectedCallback() {
        console.log('RtwUpload connectedCallback | mode:', this.uploadMode);
    }

    // ─── KEY FIX: renderedCallback applies the restore ─────
    // When parent shows confirmRTWUploadPage=true after back,
    // the child is newly created. restoreFiles() queues the data,
    // renderedCallback applies it once the DOM exists.
    renderedCallback() {
        if (this._pendingRestore && !this._restored) {
            this._restored = true;
            const d = this._pendingRestore;
            // spread into new arrays so LWC detects the change
            this.uploadFrontFiles   = [...(d.uploadFrontFiles   || [])];
            this.uploadBackFiles    = [...(d.uploadBackFiles    || [])];
            this.capturedFrontFiles = [...(d.capturedFrontFiles || [])];
            this.capturedBackFiles  = [...(d.capturedBackFiles  || [])];
            this._pendingRestore    = null;
            console.log('✅ Files restored – front:', this.uploadFrontFiles.length,
                        'back:', this.uploadBackFiles.length);
        }
    }

    restoreFromParent(files) {

        const front = files.filter(f => f.docType === 'Right To Work Front');
        const back  = files.filter(f => f.docType === 'Right To Work Back');

        this.uploadFrontFiles = front.length ? front.map(f => ({ ...f })) : [];
        this.uploadBackFiles  = back.length  ? back.map(f => ({ ...f }))  : [];
    }
    closeCamera() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }

        this.showCamera = false;
        this.showFrontCamera = false;
        this.showBackCamera = false;
        this.showCaptureIcon = false;
    }
    // ─── FILE UPLOAD ───────────────────────────────────────
    // Uses the file-input-overlay CSS trick (input covers zone, opacity:0)
    // so clicking the zone directly triggers the native file picker.

    handleFileUploadChange(event) {
        // this handler is for FRONT (single mode + dual section 1)
        this.showCamera = false;
        this.showFrontCamera = false;
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        if (!this._validateFile(file)) { event.target.value = null; return; }

        const reader = new FileReader();
        reader.onload = () => {
            const b64   = reader.result.split(',')[1];
            const isImg = file.type.startsWith('image/');
            if (isImg && file.size > 3 * 1024 * 1024) {
                this.resizeImage(file, b64)
                    .then(rb => this.createFrontFileObject(file, rb, true))
                    .catch(() => this.showErrorToast('Failed to resize image.'));
            } else {
                this.createFrontFileObject(file, b64, isImg);
            }
        };
        reader.readAsDataURL(file);
        event.target.value = null; // allow re-selecting same file
    }

    handleBackFileUploadChange(event) {
        this.showBackCamera = false;
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        if (!this._validateFile(file)) { event.target.value = null; return; }

        const reader = new FileReader();
        reader.onload = () => {
            const b64   = reader.result.split(',')[1];
            const isImg = file.type.startsWith('image/');
            if (isImg && file.size > 3 * 1024 * 1024) {
                this.resizeImage(file, b64)
                    .then(rb => this.createBackFileObject(file, rb, true))
                    .catch(() => this.showErrorToast('Failed to resize image.'));
            } else {
                this.createBackFileObject(file, b64, isImg);
            }
        };
        reader.readAsDataURL(file);
        event.target.value = null;
    }

    _validateFile(file) {
        const ext     = '.' + file.name.split('.').pop().toLowerCase();
        const allowed = ['.jpg', '.jpeg', '.png'];
        if (!allowed.includes(ext)) {
            this.showErrorToast('Allowed types: JPG, PNG'); return false;
        }
        if (file.size > this.MAX_FILE_SIZE) {
            this.showErrorToast('File must be under 5 MB'); return false;
        }
        return true;
    }

    createFrontFileObject(file, base64Data, isImage) {
        // ── Always replace (single mode = only 1 image allowed) ──
        this.capturedFrontFiles = []; // clear captured if upload chosen
        this.uploadFrontFiles = [{
            id:          Date.now(),
            name:        file.name,
            base64Data,
            contentType: file.type,
            fileType:    file.type.split('/')[1],
            fileSize:    this._formatSize(file.size),
            docType:     'Right To Work Front',
            imageSource: 'UPLOAD',
            isImage,
            // ── PREVIEW: always set the data URL ──
            preview:     `data:${file.type};base64,${base64Data}`
        }];
        console.log('Front file created, isImage:', isImage, 'preview set:', !!this.uploadFrontFiles[0].preview);
    }

    createBackFileObject(file, base64Data, isImage) {
        this.capturedBackFiles = []; // clear captured if upload chosen
        this.uploadBackFiles = [{
            id:          Date.now(),
            name:        file.name,
            base64Data,
            contentType: file.type,
            fileType:    file.type.split('/')[1] ,
            fileSize:    this._formatSize(file.size),
            docType:     'Right To Work Back',
            imageSource: 'UPLOAD',
            isImage,
            preview:     `data:${file.type};base64,${base64Data}`
        }];
    }

    _formatSize(bytes) {
        if (!bytes) return '';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // ─── delete handlers ───────────────────────────────────
    delFrontFile(event) {
        const id = parseInt(event.currentTarget.dataset.index);
        this.uploadFrontFiles   = this.uploadFrontFiles.filter(f => f.id !== id);
        this.capturedFrontFiles = this.capturedFrontFiles.filter(f => f.id !== id);
    }
    delBackFile(event) {
        const id = parseInt(event.currentTarget.dataset.index);
        this.uploadBackFiles   = this.uploadBackFiles.filter(f => f.id !== id);
        this.capturedBackFiles = this.capturedBackFiles.filter(f => f.id !== id);
    }

    // ─── CAMERA ────────────────────────────────────────────
    captureImage() {
        this.showCamera = true; this.showFrontCamera = false; this.showBackCamera = false;
        window.setTimeout(() => this.initializeCamera(), 500);
    }
    captureFrontImage() {
        this.showFrontCamera = true; this.showCamera = false; this.showBackCamera = false;
        window.setTimeout(() => this.initializeCamera(), 500);
    }
    captureBackImage() {
        this.showBackCamera = true; this.showCamera = false; this.showFrontCamera = false;
        window.setTimeout(() => this.initializeCamera(), 500);
    }

    async initializeCamera() {
        try {
            await navigator.mediaDevices.enumerateDevices();
            this.startCamera(false);
        } catch (e) { this.showErrorToast('Unable to access camera'); }
    }

    handleCameraSwap() {
        this.isFrontCameraOpen = !this.isFrontCameraOpen;
        this.startCamera(this.isFrontCameraOpen);
    }

    // startCamera(isFront) {
    //     const constraints = { video: { facingMode: isFront ? 'user' : 'environment' } };
    //     if (this.currentStream) this.currentStream.getTracks().forEach(t => t.stop());
    //     navigator.mediaDevices.getUserMedia(constraints)
    //         .then(stream => {
    //             const video = this.template.querySelector('video');
    //             if (video) { video.srcObject = stream; this.currentStream = stream; }
    //             this.showCaptureIcon = true;
    //         })
    //         .catch(() => this.showErrorToast('Unable to access camera'));
    // }
    startCamera(isFront) {
        const constraints = { video: { facingMode: isFront ? 'user' : 'environment' } };
        if (this.currentStream) this.currentStream.getTracks().forEach(t => t.stop());
        
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                const video = this.template.querySelector('video');
                if (video) { 
                    video.srcObject = stream; 
                    this.currentStream = stream; 
                }
                this.showCaptureIcon = true;
            })
            .catch(error => {
                console.error('Camera error:', error.name, error.message);
                this.showErrorToast(`Unable to access camera`);
            });
    }

    _snapPhoto() {
        const canvas = this.template.querySelector('canvas');
        const video  = this.template.querySelector('video');
        if (!canvas || !video) return null;
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        const b64       = imageData.replace('data:image/png;base64,', '');
        if (Math.round((b64.length * 3) / 4) > this.MAX_FILE_SIZE) {
            this.showErrorToast('Image exceeds 5 MB.'); return null;
        }
        if (this.currentStream) this.currentStream.getTracks().forEach(t => t.stop());
        return { imageData, b64 };
    }

    // ✅ FIX: Close camera UI IMMEDIATELY after taking photo
    takePhoto() {
        const snap = this._snapPhoto(); 
        if (!snap) return;
        
        // ✅ Close camera UI first
        this.showCamera = false;
        this.showCaptureIcon = false;
        
        // Clear upload and save captured photo
        this.uploadFrontFiles   = [];
        this.capturedFrontFiles = [{
            id: Date.now(), 
            name: 'captured.png',
            preview: snap.imageData, 
            base64Data: snap.b64,
            contentType: 'image/png', 
            fileType: 'png', 
            fileSize: '',
            docType: 'Right To Work Front', 
            imageSource: 'CAPTURED', 
            isImage: true
        }];
        
        this.showToast('Success', 'Photo captured successfully.', 'success');
    }

    // ✅ FIX: Close front camera UI IMMEDIATELY after taking photo
    takeFrontPhoto() {
        const snap = this._snapPhoto(); 
        if (!snap) return;
        
        // ✅ Close camera UI first
        this.showFrontCamera = false;
        this.showCaptureIcon = false;
        
        this.uploadFrontFiles   = [];
        this.capturedFrontFiles = [{
            id: Date.now(), 
            name: 'captured.png',
            preview: snap.imageData, 
            base64Data: snap.b64,
            contentType: 'image/png', 
            fileType: 'png', 
            fileSize: '',
            docType: 'Right To Work Front', 
            imageSource: 'CAPTURED', 
            isImage: true
        }];
        
        this.showToast('Success', 'Photo captured successfully.', 'success');
    }

    // ✅ FIX: Close back camera UI IMMEDIATELY after taking photo
    takeBackPhoto() {
        const snap = this._snapPhoto(); 
        if (!snap) return;
        
        // ✅ Close camera UI first
        this.showBackCamera = false;
        this.showCaptureIcon = false;
        
        this.uploadBackFiles   = [];
        this.capturedBackFiles = [{
            id: Date.now(), 
            name: 'captured.png',
            preview: snap.imageData, 
            base64Data: snap.b64,
            contentType: 'image/png', 
            fileType: 'png', 
            fileSize: '',
            docType: 'Right To Work Back', 
            imageSource: 'CAPTURED', 
            isImage: true
        }];
        
        this.showToast('Success', 'Photo captured successfully.', 'success');
    }

    // ─── resize ────────────────────────────────────────────
    resizeImage(file, base64Data) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = `data:${file.type};base64,${base64Data}`;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width; canvas.height = img.height;
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                const target = 3 * 1024 * 1024;
                let q = 0.9;
                let b64 = canvas.toDataURL('image/jpeg', q).split(',')[1];
                let sz  = Math.floor((b64.length * 3) / 4);
                while (sz > target && q > 0.1) {
                    q -= 0.05;
                    b64 = canvas.toDataURL('image/jpeg', q).split(',')[1];
                    sz  = Math.floor((b64.length * 3) / 4);
                }
                sz <= target ? resolve(b64) : reject(new Error('Cannot compress'));
            };
            img.onerror = e => reject(e);
        });
    }

    // ─── @api methods ──────────────────────────────────────

    @api
    getUploadDocs() {
        return {
            uploadFrontFiles:   this.uploadFrontFiles,
            uploadBackFiles:    this.uploadBackFiles,
            capturedFrontFiles: this.capturedFrontFiles,
            capturedBackFiles:  this.capturedBackFiles
        };
    }

    // Called by parent BEFORE showing the upload screen.
    // Queues the data; renderedCallback applies it once DOM exists.
    @api
    restoreFiles(savedDocs) {
        if (!savedDocs) return;
        this._pendingRestore = savedDocs;
        this._restored       = false;
        // If component is already rendered, apply immediately
        if (this.template.host) {
            this.uploadFrontFiles   = [...(savedDocs.uploadFrontFiles   || [])];
            this.uploadBackFiles    = [...(savedDocs.uploadBackFiles    || [])];
            this.capturedFrontFiles = [...(savedDocs.capturedFrontFiles || [])];
            this.capturedBackFiles  = [...(savedDocs.capturedBackFiles  || [])];
            this._pendingRestore    = null;
            this._restored          = true;
            console.log('✅ restoreFiles applied immediately');
        }
    }

    @api
    resetFiles() {
        this.uploadFrontFiles   = []; this.uploadBackFiles   = [];
        this.capturedFrontFiles = []; this.capturedBackFiles = [];
        this._pendingRestore    = null; this._restored = false;
        this.showCamera = false; this.showFrontCamera = false; this.showBackCamera = false;
        if (this.currentStream) this.currentStream.getTracks().forEach(t => t.stop());
    }

    // ─── toasts ────────────────────────────────────────────
    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
    showErrorToast(msg) { this.showToast('Error', msg, 'error'); }
}