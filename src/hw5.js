import {RenderCourt} from './RenderCourt.js'
import {OrbitControls} from './OrbitControls.js'
import {BaketballControls} from './BasketballContols.js'
import { ShotMechanism } from './ShotMachnism.js';
import { UserControls } from './UserControls.js';
import { UserInterface } from './UserInterface.js';


let courtRender = new RenderCourt()
courtRender.createCourt()

let shotMechanism = new ShotMechanism(courtRender);
let userInterface = new UserInterface(shotMechanism);
userInterface.displayUserInterface();
let userControl = new UserControls(courtRender, shotMechanism, userInterface);


const controls = new OrbitControls(courtRender.camera, courtRender.renderer.domElement);
const ballControls = new BaketballControls(courtRender.ball, courtRender.courtGeometry, courtRender.renderer.domElement);

document.addEventListener('keydown', userControl.handleKeyDown.bind(userControl));

// Animation function
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.enabled = userControl.isOrbitEnabled;
  controls.update();
  ballControls.update();

  if (shotMechanism.isBallInMotion) {
    shotMechanism.shootBallAnimation();
    const enteredRightHoop = shotMechanism.checkScore(courtRender.rightHoop);
    const enteredLeftHoop = shotMechanism.checkScore(courtRender.leftHoop);
    if (enteredLeftHoop || enteredRightHoop) {
      userInterface.updateSuccessfullShoot();
    }
    if (shotMechanism.collidedWithCourt) {
      userInterface.updateUnsuccessfulShot();
    }
  }
  
  courtRender.renderer.render(courtRender.scene, courtRender.camera);
}

animate();
