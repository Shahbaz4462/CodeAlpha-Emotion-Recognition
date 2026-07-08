/**
 * Speech Emotion Recognition - Frontend Logic Engine
 * Handles SPA navigation, theme switching, mock file processing, live recording simulation, and dynamic UI updates.
 */

// --- CONFIGURATION ---
// To receive contact form emails directly to shahbaz04462@gmail.com on Vercel:
// 1. Go to https://formspree.io/ and register a free account.
// 2. Create a form targeting your email (shahbaz04462@gmail.com).
// 3. Paste the Form ID you receive from Formspree in the variable below:
const FORMSPREE_FORM_ID = ""; // e.g. "xoqgyyee"

document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Switcher Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // --- Navigation Routing ---
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.section');
    const launchBtn = document.getElementById('launch-btn');

    function navigateTo(targetId) {
        window.scrollTo(0, 0);
        // Update Nav Links Active State
        navLinks.forEach(link => {
            if (link.dataset.target === targetId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Toggle Sections
        sections.forEach(section => {
            if (section.id === targetId) {
                section.classList.add('active-section');
            } else {
                section.classList.remove('active-section');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.dataset.target;
            navigateTo(targetId);
        });
    });

    if (launchBtn) {
        launchBtn.addEventListener('click', () => {
            navigateTo('analyze-section');
        });
    }

    // --- File Upload & Analysis Logic ---
    const uploadZone = document.getElementById('upload-zone');
    const audioUpload = document.getElementById('audio-upload');
    const fileUploadWrapper = document.querySelector('.file-upload-wrapper');
    const resultsDashboard = document.getElementById('results-dashboard');
    const emotionValue = document.getElementById('emotion-value');
    const confidenceFill = document.getElementById('confidence-fill');
    const confidenceText = document.getElementById('confidence-percentage');
    const resetBtn = document.getElementById('reset-btn');
    
    // Live Record Logic
    const recordBtn = document.getElementById('record-btn');
    const recordStatus = document.getElementById('record-status');
    const audioWave = document.getElementById('audio-wave');
    let isRecording = false;

    // Live Record Event
    if (recordBtn) {
        recordBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent triggering upload
            if (!isRecording) {
                // Start Recording Simulation
                isRecording = true;
                recordBtn.classList.add('recording');
                recordBtn.innerHTML = '<span class="record-icon">🛑</span> Stop Recording';
                recordStatus.textContent = "Listening live... (Speak clearly)";
                recordStatus.style.color = "var(--danger-color)";
                recordStatus.style.fontWeight = "600";
                if (audioWave) audioWave.classList.remove('hidden');
            } else {
                // Stop Recording and Analyze
                isRecording = false;
                recordBtn.classList.remove('recording');
                recordBtn.innerHTML = '<span class="record-icon">🎙️</span> Start Live Recording';
                recordStatus.textContent = "Audio captured. Processing...";
                recordStatus.style.color = "var(--text-muted)";
                recordStatus.style.fontWeight = "400";
                if (audioWave) audioWave.classList.add('hidden');
                
                // Slight delay then simulate processing
                setTimeout(() => {
                    simulateBackendProcessing("Live_Audio_Capture.wav");
                }, 500);
            }
        });
    }

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        if (uploadZone) uploadZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop zone
    ['dragenter', 'dragover'].forEach(eventName => {
        if (uploadZone) uploadZone.addEventListener(eventName, () => {
            uploadZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        if (uploadZone) uploadZone.addEventListener(eventName, () => {
            uploadZone.classList.remove('dragover');
        }, false);
    });

    // Handle dropped files
    if (uploadZone) {
        uploadZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        });
    }

    // Handle clicked upload
    if (fileUploadWrapper) {
        fileUploadWrapper.addEventListener('click', () => {
            if (!isRecording) {
                audioUpload.click();
            }
        });
    }

    if (audioUpload) {
        audioUpload.addEventListener('change', function() {
            handleFiles(this.files);
        });
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('audio/')) {
                simulateBackendProcessing(file.name);
            } else {
                alert('Please upload a valid audio file (.wav, .mp3)');
            }
        }
    }

    // Emotion Simulation Map (For Demonstration)
    const mockEmotions = ['Neutral', 'Calm', 'Happy', 'Sad', 'Angry', 'Fearful', 'Disgust', 'Surprised'];

    function simulateBackendProcessing(filename) {
        // Hide upload, show results loading
        uploadZone.classList.add('hidden');
        resultsDashboard.classList.remove('hidden');
        
        emotionValue.textContent = 'Extracting Features...';
        emotionValue.style.color = 'var(--text-muted)';
        confidenceFill.style.width = '0%';
        confidenceText.textContent = '0%';

        // Simulate API Delay
        setTimeout(() => {
            emotionValue.textContent = 'Ensemble Inference...';
            confidenceFill.style.width = '45%';
            confidenceText.textContent = '45%';
            
            setTimeout(() => {
                // Generate Mock Result
                const detectedEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
                // Generate a realistic high confidence score (80 - 99%)
                const confidence = Math.floor(Math.random() * (99 - 80 + 1)) + 80;

                emotionValue.textContent = detectedEmotion;
                emotionValue.style.color = 'var(--primary-color)';
                
                // Animate Progress Bar
                confidenceFill.style.width = `${confidence}%`;
                confidenceText.textContent = `${confidence}%`;

            }, 1500);
        }, 1200);
    }

    // Reset Analyzer
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resultsDashboard.classList.add('hidden');
            uploadZone.classList.remove('hidden');
            if (audioUpload) audioUpload.value = ''; // clear input
            if (recordStatus) {
                recordStatus.textContent = "Click to record your voice (Speak clearly)";
            }
        });
    }

    // --- Contact Form Submission Handler ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('.submit-button');
            const originalText = btn.textContent;
            
            btn.textContent = 'Sending Message...';
            btn.disabled = true;
            btn.style.opacity = '0.7';
            
            const formData = new FormData(contactForm);
            const jsonObject = {};
            formData.forEach((value, key) => {
                jsonObject[key] = value;
            });
            
            // Route form target: Use Formspree if a Form ID is provided, otherwise fall back to local Flask API
            const useFormspree = FORMSPREE_FORM_ID && FORMSPREE_FORM_ID.trim() !== "";
            const requestUrl = useFormspree 
                ? `https://formspree.io/f/${FORMSPREE_FORM_ID.trim()}`
                : "/api/contact";
                
            fetch(requestUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(jsonObject)
            })
            .then(response => {
                if (response.ok) {
                    return response.json().catch(() => ({ success: true }));
                } else {
                    throw new Error("Form submission failed");
                }
            })
            .then(data => {
                // Formspree API returns simple ok status, local backend returns { success: true }
                if (data.success || useFormspree) {
                    btn.textContent = 'Message Sent Successfully!';
                    btn.style.background = 'var(--success-color)';
                    contactForm.reset();
                } else {
                    btn.textContent = 'Error Sending!';
                    btn.style.background = 'var(--danger-color)';
                }
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.background = ''; // restore CSS gradient
                }, 3000);
            })
            .catch(error => {
                console.error("Error submitting contact form:", error);
                btn.textContent = 'Error Sending!';
                btn.style.background = 'var(--danger-color)';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.background = ''; // restore CSS gradient
                }, 3000);
            });
        });
    }
});
