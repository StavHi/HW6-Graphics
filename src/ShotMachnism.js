const GRAVITY = -9.8;
const BALL_RADIUS = 0.5;
const TIME_STEP = 1 / 60;
const INITIAL_POWER = 50;

// Physics part 

class ShotMechanism {
    constructor (courtRender) {
        this.courtRender = courtRender;
        this.lastBallYRight = null;
        this.lastBallYLeft = null;
        this.scored = false;

        this.ballVelocity = new THREE.Vector3();
        this.isBallInMotion = false;
        this.launchTime = null;
        this.successfullShotMade = false;
        this.power = INITIAL_POWER;

        this.collidedWithCourt = false;
    }

    getClosestHoopCenter() {
        const distToLeft = this.courtRender.ball.position.distanceTo(this.courtRender.netCenterBelowLinesLeft);
        const distToRight = this.courtRender.ball.position.distanceTo(this.courtRender.netCenterBelowLinesRight);
        return distToLeft < distToRight ? this.courtRender.netCenterBelowLinesLeft : this.courtRender.netCenterBelowLinesRight;
    }


    shootBall() {
        const ringCenter = this.getClosestHoopCenter();
        const direction = new THREE.Vector3().subVectors(ringCenter, this.courtRender.ball.position);

        const baseHeight = Math.max(this.courtRender.ball.position.y, ringCenter.y);
        const arcHeight = baseHeight * 1.5;

        const timeToApex = Math.sqrt((2 * (arcHeight - this.courtRender.ball.position.y)) / -GRAVITY);
        const timeFromApex = Math.sqrt((2 * (arcHeight - ringCenter.y)) / -GRAVITY);
        const totalFlightTime = (timeToApex + timeFromApex);

        const Vy = -GRAVITY * timeToApex;
        const Vx = direction.x / totalFlightTime;
        const Vz = direction.z / totalFlightTime;

        this.ballVelocity.set(Vx, Vy, Vz);

        const powerFactor = (1 + (this.power / 100)) * 0.75; 
        this.ballVelocity.multiplyScalar(powerFactor);

        this.isBallInMotion = true;
        this.launchTime = performance.now();
    }




    getNearestHoopPosition(ballPosition) {

        const distToRight = ballPosition.distanceTo(this.courtRender.netCenterBelowLinesRight);
        const distToLeft = ballPosition.distanceTo(this.courtRender.netCenterBelowLinesLeft);

        return distToRight < distToLeft ? this.courtRender.netCenterBelowLinesRight : this.courtRender.netCenterBelowLinesLeft;
    }


    checkHoopCollision(hoop) {
        const hoopRadius = hoop.geometry.parameters.radius;
        const hoopTubeRadius = 0.06;
        const collisionThreshold = BALL_RADIUS + hoopTubeRadius;

        const hoopCenter = hoop.position.clone();

        const toBallHorizontal = new THREE.Vector3(this.courtRender.ball.position.x - hoopCenter.x, 0,
             this.courtRender.ball.position.z - hoopCenter.z);
        const horizontalDistance = toBallHorizontal.length();
        const verticalDistance = Math.abs(this.courtRender.ball.position.y - hoopCenter.y);

        const radialDiff = horizontalDistance - hoopRadius;

        if (Math.abs(radialDiff) <= collisionThreshold && verticalDistance <= collisionThreshold) {
            let normal;

            if (horizontalDistance < 0.001) {
            normal = new THREE.Vector3(0, this.courtRender.ball.position.y > hoopCenter.y ? 1 : -1, 0);
            } else {
            const closestPointOnHoop = new THREE.Vector3(
                hoopCenter.x + (toBallHorizontal.x / horizontalDistance) * hoopRadius,
                hoopCenter.y,
                hoopCenter.z + (toBallHorizontal.z / horizontalDistance) * hoopRadius
            );
            normal = new THREE.Vector3().subVectors(this.courtRender.ball.position, closestPointOnHoop).normalize();
            }

            const velocityDotNormal = this.ballVelocity.dot(normal);

            if (velocityDotNormal < 0) {
                const velocityNormal = normal.clone().multiplyScalar(velocityDotNormal);
                const velocityTangent = this.ballVelocity.clone().sub(velocityNormal);

                const bouncedNormal = normal.clone().multiplyScalar(-velocityDotNormal * 0.6);
                const dampedTangent = velocityTangent.multiplyScalar(0.95);

                this.ballVelocity.copy(bouncedNormal.add(dampedTangent));
            }

            const penetrationDepth = collisionThreshold - Math.abs(radialDiff) + 0.01;
            let correction = normal.clone().multiplyScalar(penetrationDepth);
            if (Math.abs(normal.y - 1) < 0.001) { 
                correction = correction.clone().multiplyScalar(0.1);
            }
            this.courtRender.ball.position.add(correction);
        }
    }


    checkBoardCollision(board) {
        const toBallFromBoard = new THREE.Vector3().subVectors(this.courtRender.ball.position, board.position);
        const distToPlane = toBallFromBoard.dot(board.normal);
        const collisionThreshold = BALL_RADIUS + 0.1;


        if (distToPlane < BALL_RADIUS && distToPlane > 0) {
        const projectedPoint = this.courtRender.ball.position.clone().sub(board.normal.clone().multiplyScalar(distToPlane));
        const localVec = new THREE.Vector3().subVectors(projectedPoint, board.position);

        const rightDist = localVec.dot(board.right);
        const upDist = localVec.dot(board.up);

        if (Math.abs(rightDist) <= board.width / 2 && Math.abs(upDist) <= board.height / 2) {
                const velocityDotNormal = this.ballVelocity.dot(board.normal);

                if (velocityDotNormal < 0) {
                const velocityNormal = board.normal.clone().multiplyScalar(velocityDotNormal);
                const velocityTangent = this.ballVelocity.clone().sub(velocityNormal);

                const bouncedNormal = board.normal.clone().multiplyScalar(-velocityDotNormal * 0.8); // adjust energy loss
                const dampedTangent = velocityTangent.multiplyScalar(0.95); // friction

                this.ballVelocity.copy(bouncedNormal.add(dampedTangent));
            }

            const penetrationDepth = collisionThreshold - distToPlane;
            if (penetrationDepth > 0) {
                const correction = board.normal.clone().multiplyScalar(penetrationDepth + 0.01);
                this.courtRender.ball.position.add(correction);
            }
        }
        }
    }


    checkScore(hoop) {
        let enteredHoop = false;
        let lastBallY;
        if (hoop == this.courtRender.rightHoop) {
            lastBallY = this.lastBallYRight;
        } else {
            lastBallY = this.lastBallYLeft;
        }

        const hoopCenter = hoop.position;
        const hoopRadius = 0.75;
        const verticalTolerance = 1.5;

        const horizontalDistance = new THREE.Vector2(
            this.courtRender.ball.position.x - hoopCenter.x,
            this.courtRender.ball.position.z - hoopCenter.z
        ).length();

        const isWithinHoop = horizontalDistance < hoopRadius;

        const ballY = this.courtRender.ball.position.y;
        const hoopY = hoopCenter.y;

        const isWithinHeight = ballY < hoopY && ballY > hoopY - verticalTolerance;

        if (isWithinHoop && isWithinHeight && lastBallY > ballY && !this.scored && this.ballVelocity.y < 0) {
            this.scored = true;
            enteredHoop = true;
        }

        if (ballY < hoopY - verticalTolerance - 0.5) {
            this.scored = false;
        }

        lastBallY = ballY;

        if (hoop == this.courtRender.rightHoop) {
            this.lastBallYRight = ballY;
        } else {
            this.lastBallYLeft = ballY;
        }
        return enteredHoop;
    }


    checkCourtCollision() {
        this.collidedWithCourt = false;
        if (this.courtRender.ball.position.y <= BALL_RADIUS) {
            this.courtRender.ball.position.y = BALL_RADIUS;

            this.ballVelocity.y *= -0.6;

            this.ballVelocity.x *= 0.8;
            this.ballVelocity.z *= 0.8;

            if (Math.abs(this.ballVelocity.y) < 0.5) {
                this.ballVelocity.set(0, 0, 0);
                this.isBallInMotion = false;
            }

            this.collidedWithCourt = true;
        }
    }

    
    modifyRotation() {
        const speed = this.ballVelocity.length();
        if (speed > 0.01) {
            const direction = this.ballVelocity.clone().normalize();
            const worldUp = new THREE.Vector3(0, 1, 0);

            const rotationAxis = new THREE.Vector3().crossVectors(worldUp, direction).normalize();
            const speed = this.ballVelocity.length();
            const angularSpeed = speed * 0.5; 
            const deltaAngle = angularSpeed * TIME_STEP;

            if (!isNaN(rotationAxis.x)) {
                this.courtRender.ball.rotateOnWorldAxis(rotationAxis, deltaAngle);
            }
        }
    }

    
    shootBallAnimation() {
        
        this.ballVelocity.y += GRAVITY * TIME_STEP;

        this.courtRender.ball.position.add(this.ballVelocity.clone().multiplyScalar(TIME_STEP));

        this.modifyRotation();
        this.checkCourtCollision();

        this.checkHoopCollision(this.courtRender.leftHoop);
        this.checkHoopCollision(this.courtRender.rightHoop);
        this.checkBoardCollision(this.courtRender.rightBoard);
        this.checkBoardCollision(this.courtRender.leftBoard);
    }

}

export {ShotMechanism, INITIAL_POWER};