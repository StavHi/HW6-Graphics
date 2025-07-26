const EventDispatcher = THREE.EventDispatcher;
const BALL_RADIUS = 0.5;

class BaketballControls extends EventDispatcher {
    constructor(object, courtGeometry, domElement, speed=0.1) {
        super();

		if ( domElement === undefined ) console.warn( 'THREE.BaketballControls: The second parameter "domElement" is now mandatory.' );
		if ( domElement === document ) console.error( 'THREE.BaketballControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.' );

		this.object = object;
		this.domElement = domElement;
		this.domElement.style.touchAction = 'none'; 
        this.courtGeometry = courtGeometry;

		this.enabled = true;
        this.keys = { 'ArrowLeft': false, 'ArrowUp': false, 'ArrowRight': false, 'ArrowDown': false };
        this.speed = speed;


        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleKeyPressed = this.handleKeyPressed.bind(this);

        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        document.addEventListener('keypress', this.handleKeyPressed);
    }
          
    handleKeyDown(event) {
        if (this.keys.hasOwnProperty(event.key)) {
            this.keys[event.key] = true;
        }
    }

    handleKeyUp(event) {
        if (this.keys.hasOwnProperty(event.key)) {
            this.keys[event.key] = false;
        }
    }

    handleKeyPressed(event) {
        if (this.keys.hasOwnProperty(event.key)) {
            this.keys[event.key] = false;
        }
    }

    
    update() {
        let moved = false;
        const pos = this.object.position;
        const depthThreshold = this.courtGeometry.parameters.depth / 2 - 0.5;
        const widthThreshold = this.courtGeometry.parameters.width / 2 - 0.5;
        const rotationFactor = 0.5;

        const movement = new THREE.Vector3();

        if (this.keys.ArrowUp) {
            const delta = Math.max(-this.speed, -depthThreshold - pos.z);
            pos.z += delta;
            movement.z += delta *  rotationFactor;
            moved = true;
        }
        if (this.keys.ArrowDown) {
            const delta = Math.min(this.speed, depthThreshold - pos.z);
            pos.z += delta;
            movement.z += delta * rotationFactor;
            moved = true;
        }
        if (this.keys.ArrowLeft) {
            const delta = Math.max(-this.speed, -widthThreshold - pos.x);
            pos.x += delta;
            movement.x += delta * rotationFactor;
            moved = true;
        }
        if (this.keys.ArrowRight) {
            const delta = Math.min(this.speed, widthThreshold - pos.x);
            pos.x += delta;
            movement.x += delta * rotationFactor;
            moved = true;
        }

        if (moved) {
            const moveLength = movement.length();
            if (moveLength > 0.0001) {
                const rotationAxis = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), movement).normalize();
                const ballCircumference = 2 * Math.PI * BALL_RADIUS;
                const angularDistance = (moveLength / ballCircumference) * 2 * Math.PI;

                this.object.rotateOnWorldAxis(rotationAxis, angularDistance);
            }

            this.dispatchEvent({
                type: 'move',
                position: pos.clone()
            });
        }
    }

    dispose() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('keypress', this.handleKeyPressed);
    }

}

export {BaketballControls};