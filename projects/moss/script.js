document.addEventListener('DOMContentLoaded', function() {
    
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.6)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.left = (e.clientX - e.target.offsetLeft) + 'px';
            ripple.style.top = (e.clientY - e.target.offsetTop) + 'px';
            ripple.style.width = ripple.style.height = '20px';

            this.style.position = 'relative';
            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.textShadow = '0 0 10px #00ff00';
        });

        item.addEventListener('mouseleave', function() {
            this.style.textShadow = 'none';
        });
    });

const title = document.querySelector('.glitch-text h1');
    function randomGlitch() {
        title.style.animation = 'none';
        setTimeout(() => {
            title.style.animation = 'glitch 2s infinite';
        }, 10);
    }

    setInterval(randomGlitch, Math.random() * 10000 + 5000);

const terminalLines = document.querySelectorAll('.terminal-text p');
    let isAnimating = false;
    let originalTexts = [];

terminalLines.forEach(line => {
        originalTexts.push(line.textContent);
    });

    function typeWriter(element, originalText, delay = 0, callback = null) {
        element.textContent = '';
        element.style.opacity = '1';

        setTimeout(() => {
            let i = 0;
            function type() {
                if (i < originalText.length) {
                    element.textContent += originalText.charAt(i);
                    i++;
                    setTimeout(type, 50);
                } else if (callback) {
                    callback();
                }
            }
            type();
        }, delay);
    }

    function typeWriterReverse(element, delay = 0, callback = null) {
        const currentText = element.textContent;

        setTimeout(() => {
            let i = currentText.length;
            function typeReverse() {
                if (i > 0) {
                    element.textContent = currentText.substring(0, i - 1);
                    i--;
                    setTimeout(typeReverse, 30);
                } else {
                    element.style.opacity = '0';
                    if (callback) {
                        callback();
                    }
                }
            }
            typeReverse();
        }, delay);
    }

    function animateTerminalLines(lines, reverse = false) {
        if (isAnimating) return;
        isAnimating = true;

        let completedLines = 0;
        const totalLines = lines.length;

        lines.forEach((line, index) => {
            const delay = reverse ? (totalLines - index - 1) * 300 : index * 1000;

            if (reverse) {
                typeWriterReverse(line, delay, () => {
                    completedLines++;
                    if (completedLines === totalLines) {
                        isAnimating = false;
                        
                        setTimeout(() => {
                            animateTerminalLines(lines, false);
                        }, 1000);
                    }
                });
            } else {
                typeWriter(line, originalTexts[index], delay, () => {
                    completedLines++;
                    if (completedLines === totalLines) {
                        isAnimating = false;
                        
                        setTimeout(() => {
                            animateTerminalLines(lines, true);
                        }, 5000);
                    }
                });
            }
        });
    }

const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const lines = entry.target.querySelectorAll('p');
                lines.forEach(line => {
                    line.style.opacity = '0';
                });

animateTerminalLines(lines, false);
                observer.unobserve(entry.target);
            }
        });
    });

    const terminalSection = document.querySelector('.terminal-text');
    if (terminalSection) {
        observer.observe(terminalSection);
    }

function createMatrixRain() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '0';
        canvas.style.opacity = '0.1';
        document.body.appendChild(canvas);

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = '10';
        const matrix = chars.split('');
        const fontSize = 14;
        const columns = canvas.width / fontSize;

        const drops = [];
        for (let x = 0; x < columns; x++) {
            drops[x] = 1;
        }

        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#00ff00';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = matrix[Math.floor(Math.random() * matrix.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        setInterval(draw, 100);

window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

function createScanlines() {
        const scanline = document.createElement('div');
        scanline.style.position = 'fixed';
        scanline.style.top = '0';
        scanline.style.left = '0';
        scanline.style.width = '100%';
        scanline.style.height = '2px';
        scanline.style.background = 'rgba(0, 255, 0, 0.8)';
        scanline.style.boxShadow = '0 0 10px #00ff00';
        scanline.style.zIndex = '1000';
        scanline.style.pointerEvents = 'none';
        document.body.appendChild(scanline);

        let position = 0;
        function animateScanline() {
            position += 2;
            if (position > window.innerHeight) {
                position = -2;
            }
            scanline.style.top = position + 'px';
            requestAnimationFrame(animateScanline);
        }
        animateScanline();
    }

document.getElementById('toggle-rotation')?.addEventListener('click', function() {
        if (window.mossViewer) {
            window.mossViewer.toggleAutoRotate();
            this.style.background = window.mossViewer.autoRotate ? '#00ff00' : '#000000';
            this.style.color = window.mossViewer.autoRotate ? '#000000' : '#00ff00';
        }
    });

    document.getElementById('toggle-zoom')?.addEventListener('click', function() {
        if (window.mossViewer) {
            window.mossViewer.toggleAutoZoom();
            this.style.background = window.mossViewer.autoZoom ? '#00ff00' : '#000000';
            this.style.color = window.mossViewer.autoZoom ? '#000000' : '#00ff00';
        }
    });

    document.getElementById('reset-view')?.addEventListener('click', function() {
        if (window.mossViewer) {
            window.mossViewer.resetView();
            this.style.background = '#00ff00';
            this.style.color = '#000000';
            setTimeout(() => {
                this.style.background = '#000000';
                this.style.color = '#00ff00';
            }, 200);
        }
    });
});

const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);