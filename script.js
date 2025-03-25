const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const soundToggleBtn = document.getElementById('soundToggle');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Create audio elements for collision sounds
const boinkSound = new Audio('assets/Bell1sec.mp3');
const blueSound = new Audio('assets/HybridLogo.mp3');
const whiteSound = new Audio('assets/Marimba.mp3');
const redSound = new Audio('assets/TrapDrums.mp3');
boinkSound.volume = 0.3; // Set volume to 30%
blueSound.volume = 0.3; // Set volume to 30%
whiteSound.volume = 0.3; // Set volume to 30%
redSound.volume = 0.3; // Set volume to 30%
let soundEnabled = false;

// Update button text based on audio context state
function updateButtonState() {
    soundToggleBtn.textContent = soundEnabled ? 'Disable Sound' : 'Enable Sound';
    soundToggleBtn.style.backgroundColor = soundEnabled ? '#f44336' : '#4CAF50';
}

// Sound toggle handler
soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    updateButtonState();
    // Test sound on enable
    if (soundEnabled) {
        boinkSound.currentTime = 0;
        boinkSound.play();
    }
});

// Function to play sound for green balls
function playBoinkSound() {
    if (soundEnabled) {
        boinkSound.currentTime = 0; // Reset sound to start
        boinkSound.play();
    }
}

// Function to play sound for blue balls
function playBlueSound() {
    if (soundEnabled) {
        blueSound.currentTime = 0; // Reset sound to start
        blueSound.play();
    }
}

// Function to play sound for white balls
function playWhiteSound() {
    if (soundEnabled) {
        whiteSound.currentTime = 0; // Reset sound to start
        whiteSound.play();
    }
}

// Function to play sound for red balls
function playRedSound() {
    if (soundEnabled) {
        redSound.currentTime = 0; // Reset sound to start
        redSound.play();
    }
}

// Initialize button state
updateButtonState();

// Ball class
class Ball {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.dx = (Math.random() - 0.5) * 8; // Random horizontal velocity
        this.dy = (Math.random() - 0.5) * 8; // Random vertical velocity
        this.mass = radius; // Mass proportional to radius
        this.lastCollisionTime = 0; // To prevent multiple sound plays
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update(balls) {
        // Bounce off walls
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }

        // Check collision with other balls
        balls.forEach(ball => {
            if (ball === this) return; // Skip self

            // Calculate distance between balls
            const dx = ball.x - this.x;
            const dy = ball.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if balls are colliding
            if (distance < this.radius + ball.radius) {
                const currentTime = Date.now();
                // Play appropriate sound if enough time has passed since last collision
                if (currentTime - this.lastCollisionTime > 100) { // 100ms cooldown
                    if (this.color === 'red' || ball.color === 'red') {
                        playRedSound();
                    } else if (this.color === 'blue' || ball.color === 'blue') {
                        playBlueSound();
                    } else if (this.color === 'white' || ball.color === 'white') {
                        playWhiteSound();
                    } else if (this.color === 'green' || ball.color === 'green') {
                        playBoinkSound();
                    }
                    this.lastCollisionTime = currentTime;
                }

                // Collision resolution using elastic collision formulas
                const normalX = dx / distance;
                const normalY = dy / distance;

                // Relative velocity
                const relativeVelocityX = this.dx - ball.dx;
                const relativeVelocityY = this.dy - ball.dy;

                // Calculate impulse
                const impulse = 2 * (normalX * relativeVelocityX + normalY * relativeVelocityY) 
                             / (1/this.mass + 1/ball.mass);

                // Update velocities
                this.dx -= (impulse * normalX) / this.mass;
                this.dy -= (impulse * normalY) / this.mass;
                ball.dx += (impulse * normalX) / ball.mass;
                ball.dy += (impulse * normalY) / ball.mass;

                // Prevent balls from sticking together by moving them apart
                const overlap = (this.radius + ball.radius - distance) / 2;
                this.x -= overlap * normalX;
                this.y -= overlap * normalY;
                ball.x += overlap * normalX;
                ball.y += overlap * normalY;
            }
        });

        // Update position
        this.x += this.dx;
        this.y += this.dy;

        this.draw();
    }
}

// Create balls
const balls = [
    new Ball(100, 100, 30, 'red'),     // Bigger red ball
    new Ball(200, 200, 40, 'blue'),    // Even bigger blue ball
    new Ball(300, 300, 20, 'green'),
    new Ball(400, 400, 20, 'white'),
    new Ball(150, 250, 20, 'green'),
    new Ball(450, 150, 20, 'green'),
    new Ball(250, 450, 20, 'green')
];

// Adjust velocities based on mass
balls.forEach(ball => {
    // Scale down velocity for larger balls to maintain reasonable speeds
    const massScale = 20 / ball.mass; // 20 is our reference mass (original ball size)
    ball.dx *= massScale;
    ball.dy *= massScale;
});

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    balls.forEach(ball => {
        ball.update(balls);
    });

    requestAnimationFrame(animate);
}

animate(); 