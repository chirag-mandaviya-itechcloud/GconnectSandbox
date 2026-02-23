import { LightningElement } from 'lwc';
import pdfResource from '@salesforce/resourceUrl/Service_Terms';

export default class ServiceTermNoVAT extends LightningElement {
     pdfUrl = pdfResource;
}