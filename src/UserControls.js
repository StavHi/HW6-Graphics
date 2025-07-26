import { INITIAL_POWER } from "./ShotMachnism.js";

const POWER_KEY_BUTTON_DIFF = 5; // How much to add/decrease from power when pressing the button


class UserControls {
    constructor (courtRender, shotMechanism, userInterface) {
        this.isOrbitEnabled = true;
        this.courtRender = courtRender;
        this.shotMechanism = shotMechanism;
        this.userInterface = userInterface;
        this.ballInitialPosition = new THREE.Vector3(courtRender.ball.position.x, courtRender.ball.position.y, 
            courtRender.ball.position.z);
    }


        
    // Handle key events
    handleKeyDown(e) {
        let k = e.key;
        switch (k) {
            case "o":
                this.isOrbitEnabled = !this.isOrbitEnabled;
                break;
            case "w":
                this.shotMechanism.power = Math.min(this.shotMechanism.power + POWER_KEY_BUTTON_DIFF, 100);
                this.userInterface.createPowerShotDisplay();
                break;
            case "s":
                this.shotMechanism.power = Math.max(this.shotMechanism.power - POWER_KEY_BUTTON_DIFF, 0);
                this.userInterface.createPowerShotDisplay();
                break;
            case "r":
                this.courtRender.ball.position.copy(this.ballInitialPosition);
                this.shotMechanism.ballVelocity = new THREE.Vector3();
                this.shotMechanism.isBallInMotion = false;
                this.shotMechanism.power = INITIAL_POWER;
                this.userInterface.createPowerShotDisplay();
                break;
            case " ":
                if (!this.shotMechanism.isBallInMotion) {
                    this.userInterface.shotAttempts += 1;
                    this.userInterface.shotInProcess = true;
                    const target = this.shotMechanism.getNearestHoopPosition(this.courtRender.ball.position);
                    this.shotMechanism.shootBall(target);
                    if (this.shotMechanism.scored) {
                        this.userInterface.updateSuccessfullShoot();
                    }
                }
                break;
        }
    }


}

export {UserControls}