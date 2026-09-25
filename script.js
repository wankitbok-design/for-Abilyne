document.addEventListener('DOMContentLoaded', () => {
    const card = document.getElementById('birthdayCard');
    const canvas = document.getElementById('treeCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 350;
    canvas.height = 580;

    let branchData = [];
    let heartPetals = [];
    let animationCounter = 0;
    let animId = null;

    function buildTreeStructure(startX, startY, length, angle, width, depth) {
        if (depth > 6) return;

        const rad = angle * Math.PI / 180;
        const endX = startX + length * Math.cos(rad);
        const endY = startY + length * Math.sin(rad);

        branchData.push({
            startX, startY, endX, endY,
            width, depth,
            growthDelay: depth * 10
        });

        const nextLength = length * 0.75;
        const nextWidth = width * 0.7;

        buildTreeStructure(
            endX, endY, 
            nextLength + Math.random()*10, 
            angle - 22 - Math.random()*10, 
            nextWidth, depth + 1
        );
        buildTreeStructure(
            endX, endY, 
            nextLength + Math.random()*10, 
            angle + 22 + Math.random()*10, 
            nextWidth, depth + 1
        );
    }

    function initPetals() {
        heartPetals = [];
        for (let i = 0; i < 20; i++) {
            let petal = {
                x: Math.random() * canvas.width,
                y: Math.random() * -canvas.height,
                size: 3 + Math.random() * 4,
                speedY: 1 + Math.random() * 1.5,
                swing: Math.random() * 2,
                swingSpeed: 0.02 + Math.random() * 0.02,
                angle: Math.random() * 360
            };
            heartPetals.push(petal);
        }
    }

    function renderFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let itemsRemaining = false;
        animationCounter += 2;

        branchData.forEach(b => {
            if (animationCounter > b.growthDelay) {
                ctx.beginPath();
                ctx.moveTo(b.startX, b.startY);

                let timeDiff = animationCounter - b.growthDelay;
                let progression = Math.min(1, timeDiff / 12);
                
                let currentX = b.startX + (b.endX - b.startX) * progression;
                let currentY = b.startY + (b.endY - b.startY) * progression;

                ctx.lineTo(currentX, currentY);
                ctx.lineWidth = b.width;
                
                let opacity = 1 - (b.depth * 0.08);
                ctx.strokeStyle = "rgba(110,24,73," + opacity + ")";
                
                ctx.lineCap = 'round';
                ctx.stroke();

                if (progression < 1) itemsRemaining = true;

                if (progression >= 1 && b.depth >= 4) {
                    let leafSize = 4 + (b.depth * 0.5);
                    drawHeartIcon(b.endX, b.endY, leafSize, '#ff1493', 4);
                }
            } else {
                itemsRemaining = true;
            }
        });

        heartPetals.forEach(p => {
            p.y += p.speedY;
            p.x += Math.sin(p.angle) * 0.5;
            p.angle += p.swingSpeed;

            if (p.y > canvas.height) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
            }

            drawHeartIcon(p.x, p.y, p.size, 'rgba(255, 105, 180, 0.6)', 0);
        });

        if (itemsRemaining || card.classList.contains('open')) {
            animId = requestAnimationFrame(renderFrame);
        }
    }

    function drawHeartIcon(x, y, size, color, blur) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.rotate(Math.PI);
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-size/2, size/2, -size, 0, 0, -size);
        ctx.bezierCurveTo(size, 0, size/2, size/2, 0, 0);
        ctx.fillStyle = color;
        if (blur > 0) {
            ctx.shadowColor = '#ff6ebd';
            ctx.shadowBlur = blur;
        }
        ctx.fill();
        ctx.restore();
    }

    card.addEventListener('click', () => {
        card.classList.toggle('open');

        if (card.classList.contains('open')) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cancelAnimationFrame(animId);
            branchData = [];
            animationCounter = 0;

            buildTreeStructure(175, 540, 80, -90, 7, 0);
            initPetals();
            setTimeout(renderFrame, 350); 
        } else {
            cancelAnimationFrame(animId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });
});
