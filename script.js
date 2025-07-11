class BreathingCircle {
    constructor() {
        this.circleFill = document.querySelector('.circle-fill');
        this.currentStageElement = document.querySelector('.current-stage');
        this.progressInfo = document.querySelector('.progress-info');
        this.container = document.querySelector('.container');
        
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Breathing cycle configuration (in milliseconds)
        this.stages = {
            inhale: { duration: 4000, name: 'Inhale' },
            holdInhale: { duration: 2000, name: 'Hold' },
            exhale: { duration: 6000, name: 'Exhale' },
            holdExhale: { duration: 2000, name: 'Hold' }
        };
        
        this.currentStage = 'inhale';
        this.isRunning = false;
        this.isPaused = false;
        this.startTime = 0;
        this.pausedTime = 0;
        this.animationId = null;
        
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
    }
    
    start() {
        if (this.isPaused) {
            // Resume from pause
            this.startTime = Date.now() - this.pausedTime;
            this.isPaused = false;
        } else {
            // Fresh start
            this.startTime = Date.now();
            this.currentStage = 'inhale';
        }
        
        this.isRunning = true;
        this.updateButtonStates();
        this.animate();
    }
    
    pause() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            this.isRunning = false;
            this.pausedTime = Date.now() - this.startTime;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            this.updateButtonStates();
        }
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentStage = 'inhale';
        this.startTime = 0;
        this.pausedTime = 0;
        this.displayProgress = 0;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Reset the circle to empty state
        this.setCircleFill(0);
        this.updateDisplay();
        this.updateButtonStates();
    }
    
    animate() {
        if (!this.isRunning) return;
        
        const currentTime = Date.now();
        const elapsedTime = currentTime - this.startTime;
        
        this.updateBreathingCycle(elapsedTime);
        this.updateDisplay();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateBreathingCycle(elapsedTime) {
        const totalCycleDuration = Object.values(this.stages).reduce((sum, stage) => sum + stage.duration, 0);
        const cyclePosition = elapsedTime % totalCycleDuration;
        
        let accumulatedTime = 0;
        
        // Determine current stage and calculate progress
        for (const [stageName, stageConfig] of Object.entries(this.stages)) {
            if (cyclePosition >= accumulatedTime && cyclePosition < accumulatedTime + stageConfig.duration) {
                this.currentStage = stageName;
                
                const stageElapsed = cyclePosition - accumulatedTime;
                const stageProgress = Math.min(stageElapsed / stageConfig.duration, 1);
                
                this.updateProgress(stageName, stageProgress);
                break;
            }
            accumulatedTime += stageConfig.duration;
        }
    }
    
    updateProgress(stageName, stageProgress) {
        let fillProgress;
        
        switch (stageName) {
            case 'inhale':
                // Circle fills from 0 to 1 during inhale
                fillProgress = stageProgress;
                break;
                
            case 'holdInhale':
                // Circle stays completely filled during hold after inhale
                fillProgress = 1;
                break;
                
            case 'exhale':
                // Circle empties from 1 to 0 during exhale
                fillProgress = 1 - stageProgress;
                break;
                
            case 'holdExhale':
                // Circle stays completely empty during hold after exhale
                fillProgress = 0;
                break;
                
            default:
                fillProgress = 0;
        }
        
        this.setCircleFill(fillProgress);
        this.displayProgress = Math.round(fillProgress * 100);
    }
    
    setCircleFill(progress) {
        // Use scale transform to show fill progress
        const scale = Math.max(0, Math.min(1, progress));
        this.circleFill.style.transform = `scale(${scale})`;
        
        // Add subtle opacity change for better visual effect
        this.circleFill.style.opacity = scale > 0 ? 0.8 + (scale * 0.2) : 0;
    }
    
    updateDisplay() {
        // Update stage name
        const stageName = this.stages[this.currentStage]?.name || this.currentStage;
        this.currentStageElement.textContent = stageName;
        
        // Update progress percentage
        this.progressInfo.textContent = `Progress: ${this.displayProgress || 0}%`;
        
        // Update container class for stage-specific styling
        this.container.className = 'container';
        this.container.classList.add(`stage-${this.currentStage.toLowerCase().replace(/([A-Z])/g, '-$1')}`);
    }
    
    updateButtonStates() {
        this.startBtn.disabled = this.isRunning;
        this.pauseBtn.disabled = !this.isRunning;
        this.resetBtn.disabled = false;
        
        if (this.isPaused) {
            this.startBtn.disabled = false;
            this.startBtn.textContent = 'Resume';
        } else {
            this.startBtn.textContent = 'Start';
        }
    }
}

// Initialize the breathing circle when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const breathingCircle = new BreathingCircle();
    
    // Add some debug information to console
    console.log('Breathing Circle Animation initialized');
    console.log('Stage durations:', breathingCircle.stages);
});