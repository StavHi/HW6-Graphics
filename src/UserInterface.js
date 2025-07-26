const SCORE_FOR_SUCCESSFULL_SHOT = 2;
const SUCCESSFUL_SHOT_MESSAGE = "SHOT MADE!";
const UNSUCCESSFUL_SHOT_MESSAGE = "MISSED SHOT";
const TIME_MESSAGE = 2;

class UserInterface {
    constructor (shotMechanism) {
        this.score = 0;
        this.shotAttempts = 0;
        this.shotsMade = 0;
        
        this.powerShotElement;
        this.scoreElement;
        this.shootMessageElement;

        this.shotMechanism = shotMechanism;
        this.shotInProcess = false;
        this.successfullShotMade = false;
    }

        
    showAndHideShootMessage(message, durationInSeconds) {
        const displayElement = this.shootMessageElement;
        displayElement.innerText = message;
        setTimeout(function() {
            displayElement.innerText = ''; 
        }, durationInSeconds * 1000);
    }

    
    createInstructionDisplay() {
        // Instructions display
        const instructionsElement = document.createElement('div');
        instructionsElement.style.position = 'absolute';
        instructionsElement.style.bottom = '2%';
        instructionsElement.style.left = '1%';
        instructionsElement.style.color = 'white';
        instructionsElement.style.fontSize = '16px';
        instructionsElement.style.fontFamily = 'Arial, sans-serif';
        instructionsElement.style.textAlign = 'left';
        instructionsElement.innerHTML = `
            <h3>Controls:</h3>
            <p>O - Toggle orbit camera</p>
            <p>Arrow Keys -	Move basketball</p>
            <p>W - increase shot power</p>
            <p>S - decrease shot power</p>
            <p>Spacebar - Shoot basketball to nearest hoop</p>
            <p>R - reset basketball</p>
        `;
        document.body.appendChild(instructionsElement);
        }

    getShotsPercentage() {
        if (this.shotsMade == undefined || this.shotAttempts == undefined || this.shotAttempts == 0) {
            return 0;
        }
        return Math.round(this.shotsMade / this.shotAttempts * 100);
    }


    createScoreDisplay(){
        // Score display
        if (!this.scoreElement) {
            this.scoreElement = document.createElement('div');
            this.scoreElement.style.position = 'absolute';
            this.scoreElement.style.top = '2%';
            this.scoreElement.style.left = '1%';
            this.scoreElement.style.color = '#FFD580';
            this.scoreElement.style.fontSize = '16px';
            this.scoreElement.style.fontFamily = 'Arial, sans-serif';
            this.scoreElement.style.textAlign = 'left';
            document.body.appendChild(this.scoreElement);
        }
        this.scoreElement.innerHTML = `
            <h3>Score: ${this.shotsMade * SCORE_FOR_SUCCESSFULL_SHOT}</h3>
            <h4>Shot Attempts: ${this.shotAttempts}</h4>
            <h4>Shots Made: ${this.shotsMade}</h4>
            <h4>Shooting Percentage: ${this.getShotsPercentage()}%</h4>
        `;
    }


    createPowerShotDisplay(){
        // Power display
        if (!this.powerShotElement) {
            this.powerShotElement = document.createElement('div');
            this.powerShotElement.style.position = 'absolute';
            this.powerShotElement.style.top = '2%';
            this.powerShotElement.style.left = '93%';
            this.powerShotElement.style.color = '#FFFFFF';
            this.powerShotElement.style.fontSize = '16px';
            this.powerShotElement.style.fontFamily = 'Arial, sans-serif';
            this.powerShotElement.style.textAlign = 'center';
            document.body.appendChild(this.powerShotElement);
        }
        this.powerShotElement.innerHTML = `
            <h3>Power: ${this.shotMechanism.power}</h3>
        `;
        }

    createShootMessageDisplay(){
        if (!this.shootMessageElement) {
            this.shootMessageElement = document.createElement('div');
            this.shootMessageElement.style.position = 'absolute';
            this.shootMessageElement.style.top = '2%';
            this.shootMessageElement.style.left = '46%';
            this.shootMessageElement.style.color = '#FFFFFF';
            this.shootMessageElement.style.fontSize = '16px';
            this.shootMessageElement.style.fontFamily = 'Arial, sans-serif';
            this.shootMessageElement.style.textAlign = 'center';
            document.body.appendChild(this.shootMessageElement);
        }
        this.shootMessageElement.innerHTML = '';
    }


    updateSuccessfullShoot() {
        this.shotsMade += 1;
        this.createScoreDisplay();
        this.showAndHideShootMessage(SUCCESSFUL_SHOT_MESSAGE, TIME_MESSAGE);
        this.successfullShotMade = true;
    }

    updateUnsuccessfulShot() {
        this.createScoreDisplay();
        if (this.shotInProcess && !this.successfullShotMade) {
            this.showAndHideShootMessage(UNSUCCESSFUL_SHOT_MESSAGE, TIME_MESSAGE);
        } 
        this.shotInProcess = false;
        this.successfullShotMade = false;
    }

    
    displayUserInterface(){
        this.createInstructionDisplay();
        this.createScoreDisplay();
        this.createPowerShotDisplay();
        this.createShootMessageDisplay();
    }

}

export { UserInterface}