


function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}


class RenderCourt {
  constructor () {
        
    // Adding a way to get the folder of this current file
    this.baseUrl = new URL('.', import.meta.url).href;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.scene.background = new THREE.Color(0x000000);

    this.leftBoard = null;
    this.rightBoard = null;

    this.leftHoop = null;
    this.rightHoop = null;

    this.ball = null;
    this.courtGeometry = null;

    this.netCenterBelowLinesRight = null;
    this.netCenterBelowLinesLeft = null;
    this.ballInitialPosition = null;

  }

  // Create basketball court
  createBasketballCourt() {
    // Court floor - just a simple brown surface
    const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
    this.courtGeometry = courtGeometry;
    const textureLoader = new THREE.TextureLoader();
    const courtTexture = textureLoader.load(`${this.baseUrl}court_texture.jpg`); 

    const courtMaterial = new THREE.MeshPhongMaterial({ 
      map: courtTexture,
      specular: 0x111111,
      shininess: 50,
      flatShading: false,
      side: THREE.DoubleSide,
    });
    // const courtMaterial = new THREE.MeshPhongMaterial({ 
    //   color: 0xc68642,  // Brown wood color
    //   shininess: 50
    // });
    const court = new THREE.Mesh(courtGeometry, courtMaterial);
    court.receiveShadow = true;
    this.scene.add(court);
    
    return courtGeometry;
  }


  createArc(x) {
    const fact = x / Math.abs(x);
    const ellipseGeometry = new THREE.EllipseCurve( 0, 0, fact * 7, fact * 7, Math.PI, 0, false, 0);

    // Get points on the curve
    const points = ellipseGeometry.getPoints(100);

    const movedPoints = points.map(current_point => new THREE.Vector3(current_point.y + x, 0, current_point.x))

    // Create geometry from points
    const arcGeometry = new THREE.BufferGeometry().setFromPoints(movedPoints);
    const arcMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff
    });
    const arc = new THREE.Line(arcGeometry, arcMaterial);
    
    arc.position.set(0, 0.11, 0); 
    arc.receiveShadow = true;
    this.scene.add(arc);
  }

  createCenterCircle() {
    // Adding white center circle

    const courtCenterCircleGeometry = new THREE.RingGeometry (3.3, 3.4, 100);
    // const courtCenterCircleGeometry = new THREE.CircleGeometry(3.5, 100);
    const courtCenterCircleMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,  // White color
      shininess: 50
    });
    const courtCenterCircle = new THREE.Mesh(courtCenterCircleGeometry, courtCenterCircleMaterial);
    courtCenterCircle.rotation.x = -Math.PI / 2;
    courtCenterCircle.position.set(0, 0.11, 0); 
    courtCenterCircle.receiveShadow = true;
    this.scene.add(courtCenterCircle);
  }

  createCenterLine() {
      const centerLineGeometryCurve = new THREE.LineCurve3(
      new THREE.Vector3(0, 0, -7.5),
      new THREE.Vector3(0, 0, 7.5),
    );

    // Get points on the curve
    const points = centerLineGeometryCurve.getPoints(2);

    // Create geometry from points
    const centerLineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const centerLineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff
    });
    const centerLine = new THREE.Line(centerLineGeometry, centerLineMaterial);
    // firstArcGeometryLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, 0.11, 0); 
    // firstArc.receiveShadow = true;
    this.scene.add(centerLine);
  }

  createBasketballCourtLines() {
    // Based on this: https://www.dimensions.com/element/basketball-court

    this.createCenterCircle();
    this.createArc(-15);
    this.createArc(15);
    this.createCenterLine();
  }

  createPole(x, fact) {
      // Creating support structure. pole that touches the court.
    const supportStructurePoleGeometry  = new THREE.CylinderGeometry( 0.8, 0.8, 0.3, 30 );
    const supportStructurePoleMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x555555,  // gray color
      shininess: 0
    });
    const supportStructurePole = new THREE.Mesh(supportStructurePoleGeometry, supportStructurePoleMaterial);
    // supportStructureCourt.rotation.x = -Math.PI / 2;
    supportStructurePole.position.set(fact * x, 0.21, 0); 
    supportStructurePole.castShadow = true;
    supportStructurePole.receiveShadow = true;
    this.scene.add(supportStructurePole);

    // Creating support structure. pole that touches the court.
    const poleGeometry  = new THREE.CylinderGeometry( 0.2, 0.2, 10, 30 );
    const poleMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x555555,  // gray color
      shininess: 0
    });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    // supportStructureCourt.rotation.x = -Math.PI / 2;
    pole.position.set(fact * x, 4.91, 0); 
    pole.castShadow = true;
    pole.receiveShadow = true;
    this.scene.add(pole);
  }

  createSupportArms(x, fact) { 
    // Creating support structure, arm that touches the board.
    const supportStructureArmGeometry = new THREE.CylinderGeometry( 0.15, 0.15, 2, 30 );
    const supportStructureArmMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x555555,  // Gray color
      shininess: 0
    });
    const supportStructureArm = new THREE.Mesh(supportStructureArmGeometry, supportStructureArmMaterial);
    supportStructureArm.rotation.z = degrees_to_radians(fact * 90);
    supportStructureArm.position.set(fact * (x - 0.95), 0.76 + 8, 0); 
    supportStructureArm.castShadow = true;
    supportStructureArm.receiveShadow = true;
    this.scene.add(supportStructureArm);

    // Creating support structure, arm that touches the board.
    const supportStructureArmGeometry2 = new THREE.CylinderGeometry( 0.15, 0.15, 2.2, 30 );
    const supportStructureArmMaterial2 = new THREE.MeshPhongMaterial({ 
      color: 0x555555,  // Gray color
      shininess: 0
    });
    const supportStructureArm2 = new THREE.Mesh(supportStructureArmGeometry2, supportStructureArmMaterial2);
    supportStructureArm2.rotation.z = degrees_to_radians(fact * 45);
    supportStructureArm2.position.set(fact * (x - 0.75), 0.98 + 7, 0); 
    supportStructureArm2.castShadow = true;
    supportStructureArm2.receiveShadow = true;
    this.scene.add(supportStructureArm2);
  }

  addBorderHeight(board, boardGeometry, fact) {
    const borderGeometry = new THREE.BoxGeometry(3.5, 0.1, 0.5);
    const borderMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x2A2A2A,
    });
    const border = new THREE.Mesh(borderGeometry, borderMaterial);
    border.rotation.copy(board.rotation);
    border.position.copy(board.position);
    border.position.z += fact * (-borderGeometry.parameters.depth / 2 - boardGeometry.parameters.depth / 2);
    border.receiveShadow = true;
    border.castShadow = true;
    this.scene.add(border);
  }


  addBorderWidth(board, boardGeometry, fact) {
    const borderGeometry = new THREE.BoxGeometry(0.5, 0.1, 6.5);
    const borderMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x2A2A2A,
    });
    const border = new THREE.Mesh(borderGeometry, borderMaterial);
    border.rotation.copy(board.rotation);
    border.rotation.y = degrees_to_radians(fact * 180);
    border.position.copy(board.position);
    border.position.y += fact * (-borderGeometry.parameters.width / 2 - boardGeometry.parameters.width / 2);
    border.receiveShadow = true;
    border.castShadow = true;
    this.scene.add(border);
  }


  createBoard(x, fact) {

    const boardGeometry = new THREE.BoxGeometry(3, 0.1, 5.5);
    const boardMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,  // Brown wood color
      shininess: 0,
      transparent: true,
      opacity: 0.85
    });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.rotation.z = degrees_to_radians(fact * 90);
    board.position.set(fact * (x - 2), 1.5 + 7, 0); 
    board.receiveShadow = true;
    board.castShadow = true;
    this.scene.add(board);

    this.addBorderHeight(board, boardGeometry, 1);
    this.addBorderHeight(board, boardGeometry, -1);
    this.addBorderWidth(board, boardGeometry, 1);
    this.addBorderWidth(board, boardGeometry, -1);

    board.updateMatrixWorld(true);

    board.normal =  new THREE.Vector3(0, 1, 0).applyQuaternion(board.quaternion).normalize();
    board.right =  new THREE.Vector3(0, 0, 1).clone().applyQuaternion(board.quaternion).normalize();
    board.up = new THREE.Vector3(1, 0, 0).clone().applyQuaternion(board.quaternion).normalize();
    board.height = 4.5;
    board.width = 7;


    if (fact == 1) {
      this.rightBoard = board;
    } else {
      this.leftBoard = board;
    }

  }


  createHoopRing(x, fact) {
      //Adding hoop's ring
    const ringGeometry = new THREE.TorusGeometry(0.75, 0.06, 16, 100);
    const ringMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xFF8C00,  // Orange color
      shininess: 50
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(fact * (x - 2.85), 1.5 + 7, 0); 
    ring.rotation.x = degrees_to_radians(fact * 90);
    ring.receiveShadow = true;
    ring.castShadow = true;
    this.scene.add(ring);
    return {ring, ringGeometry};
  }


  createRingNet(ring, ringGeometry) {
    // Adding nets
    const lineLength = 1.55;
    const numNetLines = 16;
    const netCenterBelowLines = new THREE.Vector3(ring.position.x, ring.position.y - lineLength, ring.position.z);

    const lowerRingRadiusUpperRingRadiusDiff = 0.2
    for (let i=0; i < numNetLines; i++) {
      const angle = (i / numNetLines) * 2 * Math.PI;
      const vect1 = new THREE.Vector3(ring.position.x + ringGeometry.parameters.radius * Math.cos(angle),
                                      ring.position.y,
                                      ring.position.z + ringGeometry.parameters.radius * Math.sin(angle));
      const vect2 = new THREE.Vector3(ring.position.x + (ringGeometry.parameters.radius - 
                                      lowerRingRadiusUpperRingRadiusDiff) * Math.cos(angle),
                                      ring.position.y - lineLength,
                                      ring.position.z + (ringGeometry.parameters.radius - 
                                      lowerRingRadiusUpperRingRadiusDiff) * Math.sin(angle));
      const lineNetGeometryCurve = new THREE.LineCurve3(vect1, vect2);
        // Get points on the curve
      const points = lineNetGeometryCurve.getPoints(2);

      // Create geometry from points
      const lineNetGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineNetMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff
      });
      const lineNet = new THREE.Line(lineNetGeometry, lineNetMaterial);
      lineNet.receiveShadow = true;
      lineNet.castShadow = true;
      // firstArc.receiveShadow = true;
      this.scene.add(lineNet);
    }
    return netCenterBelowLines;
  }


  createBasketballHook(x, fact) {
    this.createPole(x, fact);
    this.createSupportArms(x, fact);
    this.createBoard(x, fact);
    const {ring, ringGeometry} = this.createHoopRing(x, fact);
    if (fact == 1) {
      this.rightHoop = ring;
    } else {
      this.leftHoop = ring;
    }
    const netCenterBelowLines = this.createRingNet(ring, ringGeometry);
    return netCenterBelowLines;
  }

  createRingLine(radius, segments = 300) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * 2 * Math.PI;
      points.push(new THREE.Vector3(radius * Math.cos(theta), 0, radius * Math.sin(theta)));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }

  addSingleSeam(ball, ballGeometry, rotation) {
    const seamLineGeometry = this.createRingLine(ballGeometry.parameters.radius);
    const seamMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const ring = new THREE.Line(seamLineGeometry, seamMaterial);
    ring.rotation.copy(rotation);
    ball.add(ring);
  }


  addSeams(ball, ballGeometry) {
    this.addSingleSeam(ball, ballGeometry, new THREE.Euler(0, Math.PI / 2, 0));
    this.addSingleSeam(ball, ballGeometry, new THREE.Euler(0, 0, Math.PI / 2));
    this.addSingleSeam(ball, ballGeometry, new THREE.Euler(0, 0, -Math.PI / 4));
    this.addSingleSeam(ball, ballGeometry, new THREE.Euler(0, 0, Math.PI / 4));
    }

  createBaskeballBall() {
    const ballGeometry = new THREE.SphereGeometry(0.5, 32, 16);
    const textureLoader = new THREE.TextureLoader();
    const ballTexture = textureLoader.load(`${this.baseUrl}texture.jpg`); 

    const ballMaterial = new THREE.MeshPhongMaterial({ 
      map: ballTexture,
      specular: 0x111111,
      shininess: 10,
      flatShading: false,
      side: THREE.DoubleSide,
    });

    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 0.61, 0);
    ball.receiveShadow = true;
    ball.castShadow = true;
    ball.rotation.y = Math.PI / 4;
    this.scene.add(ball);

    this.addSeams(ball, ballGeometry);

    return ball;
  }

  createCourt () {
    // Create all elements
    this.courtGeometry = this.createBasketballCourt();
    this.createBasketballCourtLines();
    this.netCenterBelowLinesRight = this.createBasketballHook(14, 1);
    this.netCenterBelowLinesLeft = this.createBasketballHook(14, -1);
    this.ball = this.createBaskeballBall();
    this.ballInitialPosition = this.ball.position.clone();

    // Set camera position for better view
    const cameraTranslate = new THREE.Matrix4();
    cameraTranslate.makeTranslation(0, 15, 30);
    this.camera.applyMatrix4(cameraTranslate);
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Set background color
    // Add lights to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 15);
    this.scene.add(directionalLight);

    // Enable shadows
    this.renderer.shadowMap.enabled = true;
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
  }
  
}

export {RenderCourt};