import { LightningElement, api } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader'; // Importing loadScript function
import youtubewidget from '@salesforce/resourceUrl/youtubewidget';
export default class YoutubePlayer extends LightningElement {
    player;
    videoDuration = 0;
		@api videoid
		@api width;
		@api height;
		@api bccolor;
		@api fontcolor;
        progressStyle = '';
        intervalId

		connectedCallback(){
            // console.log('videoid',videoid);
            // console.log('fontcolor',fontcolor);
				//this.videoid='zTghW5-2bZg';
				//this.height='360';
				//this.width='640';
				Promise.all([
            // Load the static resource
            loadScript(this, youtubewidget)

            
        ]).then(() => {
            
						
						this.createPlayer();
            console.log('Script loaded');

            const style = document.createElement('style');
            style.innerText = `
            
           
              .progress-bar{ 
                background-color: ${this.bccolor} !important;
            }
             

        `;
            setTimeout(() => {
            this.template.querySelector('.overrideStyle').appendChild(style);
        }, 100);
            

        }).catch(error => {
            // Error occurred while loading script
            console.error('Error loading script: ', error);
        });
		}
   

    createPlayer() {
        this.player = new window.YT.Player(this.template.querySelector('.player'), {
            height: this.height,
            width: this.width,
            videoId: this.videoid, // Replace with your desired video ID
            playerVars: {
                controls: 0,
                disablekb: 1,
                modestbranding: 1,
                playsinline: 1,
                rel: 0,
                fs: 0
            },
            events: {
                'onReady': this.onPlayerReady.bind(this),
                'onStateChange': this.onPlayerStateChange.bind(this)
            }
        });

        
    }

    onPlayerReady(event) {
        this.videoDuration = this.player.getDuration();
        event.target.playVideo();
    }

    onPlayerStateChange(event) {
        if (event.data === window.YT.PlayerState.PLAYING) {
            
            // this.template.querySelector('.overlay').style.zIndex = 9000;
            this.intervalId  = setInterval(() => {
                const completedPercentage = (this.player.getCurrentTime() / this.videoDuration) * 100;
                this.template.querySelector('.completion-percentage').innerText = `Completion Percentage:  ${Math.floor(completedPercentage)} %`;
                this.progressStyle = `width: ${completedPercentage.toFixed(2)}%`;
            }, 1000);
        }
        if (event.data === window.YT.PlayerState.ENDED) {
            console.log('Ended Video');
            const completedPercentage = 100;
            // this.template.querySelector('.overlay').style.zIndex = -1;
             clearInterval(this.intervalId);
            this.template.querySelector('.completion-percentage').innerText = `Completion Percentage:  ${Math.floor(completedPercentage)} %`;
            // this.template.querySelector('.completion-percentage').innerText = `100%`;
            this.progressStyle = `width:100% !important`;
            this.dispatchEvent(new CustomEvent('videoend'));

        }
    }
}