import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
    gravity: number;
    drag: number;
    shape: 'circle' | 'rect' | 'star';
    sparkle?: boolean;
}

const COLORS = [
    '#009E49', // Brand Green
    '#E2231A', // Brand Red
    '#FFD700', // Gold
    '#FF8C00', // Amber
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#F59E0B', // Yellow
];

export const FireworksCelebration: React.FC<{ triggerKey?: number }> = ({ triggerKey = 0 }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let isRunning = true;

        // Resize canvas to match screen
        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
        };
        resize();
        window.addEventListener('resize', resize);

        // Helper to spawn explosion burst (Fireworks)
        const spawnFirework = (x: number, y: number, count = 50) => {
            const baseColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
                const speed = 3 + Math.random() * 6;
                particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1,
                    color: Math.random() > 0.4 ? baseColor : COLORS[Math.floor(Math.random() * COLORS.length)],
                    size: 3 + Math.random() * 4,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.2,
                    gravity: 0.12,
                    drag: 0.96,
                    shape: Math.random() > 0.4 ? 'star' : 'circle',
                    sparkle: Math.random() > 0.5,
                });
            }
        };

        // Helper to spawn cannon confetti burst from corners
        const spawnCannon = (fromLeft = true, count = 35) => {
            const originX = fromLeft ? window.innerWidth * 0.08 : window.innerWidth * 0.92;
            const originY = window.innerHeight * 0.75;
            const targetAngle = fromLeft ? -Math.PI / 4 : (-Math.PI * 3) / 4;

            for (let i = 0; i < count; i++) {
                const angle = targetAngle + (Math.random() - 0.5) * 0.7;
                const speed = 9 + Math.random() * 9;
                particles.push({
                    x: originX,
                    y: originY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    size: 4 + Math.random() * 6,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.3,
                    gravity: 0.22,
                    drag: 0.97,
                    shape: Math.random() > 0.5 ? 'rect' : 'circle',
                });
            }
        };

        // Draw a 5-point star
        const drawStar = (c: CanvasRenderingContext2D, cx: number, cy: number, spikes = 5, outerRadius = 6, innerRadius = 3) => {
            let rot = (Math.PI / 2) * 3;
            let x = cx;
            let y = cy;
            const step = Math.PI / spikes;

            c.beginPath();
            c.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                c.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                c.lineTo(x, y);
                rot += step;
            }
            c.lineTo(cx, cy - outerRadius);
            c.closePath();
            c.fill();
        };

        // Trigger choreographed sequence
        spawnCannon(true, 40);
        spawnCannon(false, 40);

        const t1 = setTimeout(() => {
            spawnFirework(window.innerWidth * 0.5, window.innerHeight * 0.25, 60);
        }, 300);

        const t2 = setTimeout(() => {
            spawnFirework(window.innerWidth * 0.3, window.innerHeight * 0.2, 50);
            spawnFirework(window.innerWidth * 0.7, window.innerHeight * 0.22, 50);
        }, 700);

        const t3 = setTimeout(() => {
            spawnCannon(true, 30);
            spawnCannon(false, 30);
            spawnFirework(window.innerWidth * 0.5, window.innerHeight * 0.18, 55);
        }, 1400);

        // Stop completely after 5.5 seconds to save resources
        const endTimer = setTimeout(() => {
            isRunning = false;
        }, 5500);

        // Animation loop
        const loop = () => {
            if (!isRunning && particles.length === 0) {
                ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
                return;
            }

            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.vx *= p.drag;
                p.vy *= p.drag;
                p.rotation += p.rotationSpeed;
                p.alpha -= 0.012;

                if (p.alpha <= 0 || p.y > window.innerHeight + 50) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.fillStyle = p.color;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);

                if (p.shape === 'star') {
                    drawStar(ctx, 0, 0, 5, p.size, p.size * 0.45);
                } else if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.7);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Shimmer glow for sparkle particles
                if (p.sparkle && Math.random() > 0.4) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size * 0.35, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);

        return () => {
            isRunning = false;
            window.removeEventListener('resize', resize);
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(endTimer);
            cancelAnimationFrame(animationFrameId);
        };
    }, [triggerKey]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50 w-full h-full"
            style={{ width: '100vw', height: '100vh' }}
        />
    );
};

export default FireworksCelebration;
