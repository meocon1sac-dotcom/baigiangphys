import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Zap, Sparkles, Layers, Sliders, Info } from "lucide-react";
import { SimulationConfig } from "../types";
import { MathRenderer } from "./MathRenderer";

interface PhysicsSimulatorsProps {
  config?: SimulationConfig;
}

export const PhysicsSimulators: React.FC<PhysicsSimulatorsProps> = ({ config }) => {
  const [activeTab, setActiveTab] = useState<string>(config?.type || "projectile");

  // Synchronize with external config when provided
  useEffect(() => {
    if (config?.type) {
      setActiveTab(config.type);
    }
  }, [config?.type]);

  return (
    <div id="physics-lab-container" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
              <Zap className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Phòng Thí Nghiệm Vật Lý Tương Tác
            </h3>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Mô phỏng động học & định luật thời gian thực, điều chỉnh tham số và kiểm chứng công thức.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 max-w-full overflow-x-auto">
          <button
            id="tab-sim-projectile"
            onClick={() => setActiveTab("projectile")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "projectile"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            Ném xiên / ngang
          </button>
          <button
            id="tab-sim-pendulum"
            onClick={() => setActiveTab("pendulum")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "pendulum"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            Con lắc & Dao động
          </button>
          <button
            id="tab-sim-circuits"
            onClick={() => setActiveTab("circuits")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "circuits"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            Mạch điện & Định luật Ôm
          </button>
          <button
            id="tab-sim-optics"
            onClick={() => setActiveTab("optics_snell")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "optics_snell"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            Khúc xạ Snell
          </button>
          <button
            id="tab-sim-freefall"
            onClick={() => setActiveTab("free_fall")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "free_fall"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            Rơi tự do
          </button>
        </div>
      </div>

      <div className="mt-5">
        {activeTab === "projectile" && <ProjectileSimulator initialParams={config?.initialParams} />}
        {activeTab === "pendulum" && <PendulumSimulator initialParams={config?.initialParams} />}
        {activeTab === "circuits" && <CircuitSimulator initialParams={config?.initialParams} />}
        {activeTab === "optics_snell" && <OpticsSnellSimulator initialParams={config?.initialParams} />}
        {activeTab === "free_fall" && <FreeFallSimulator initialParams={config?.initialParams} />}
      </div>
    </div>
  );
};

/* =========================================================================
   1. PROJECTILE MOTION SIMULATOR (Ném Xiên)
   ========================================================================= */
const ProjectileSimulator: React.FC<{ initialParams?: Record<string, number> }> = ({ initialParams }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [v0, setV0] = useState<number>(initialParams?.v0 ?? 25);
  const [angle, setAngle] = useState<number>(initialParams?.angle ?? 45);
  const [gravity, setGravity] = useState<number>(initialParams?.gravity ?? 9.8);
  const [height0, setHeight0] = useState<number>(initialParams?.height ?? 0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0);
  const [trajectory, setTrajectory] = useState<{ x: number; y: number }[]>([]);

  // Derived physics values
  const rad = (angle * Math.PI) / 180;
  const vx = v0 * Math.cos(rad);
  const vy0 = v0 * Math.sin(rad);

  // Time to hit ground: y(t) = h0 + vy0*t - 0.5*g*t^2 = 0
  const discriminant = vy0 * vy0 + 2 * gravity * height0;
  const totalFlightTime = (vy0 + Math.sqrt(Math.max(0, discriminant))) / gravity;
  const maxHeight = height0 + (vy0 * vy0) / (2 * gravity);
  const maxRange = vx * totalFlightTime;

  // Animation frame loop
  useEffect(() => {
    let animationId: number;
    let lastTimestamp: number | null = null;

    if (isRunning) {
      const step = (timestamp: number) => {
        if (!lastTimestamp) lastTimestamp = timestamp;
        const dt = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;

        setSimTime((prev) => {
          const next = prev + dt * 1.5; // slight speedup factor for smooth feeling
          if (next >= totalFlightTime) {
            setIsRunning(false);
            return totalFlightTime;
          }
          return next;
        });

        animationId = requestAnimationFrame(step);
      };
      animationId = requestAnimationFrame(step);
    }

    return () => cancelAnimationFrame(animationId);
  }, [isRunning, totalFlightTime]);

  // Current position
  const currentX = vx * simTime;
  const currentY = Math.max(0, height0 + vy0 * simTime - 0.5 * gravity * simTime * simTime);
  const currentVy = vy0 - gravity * simTime;
  const currentSpeed = Math.sqrt(vx * vx + currentVy * currentVy);

  // Update trajectory points
  useEffect(() => {
    if (simTime > 0) {
      setTrajectory((prev) => [...prev, { x: currentX, y: currentY }]);
    } else {
      setTrajectory([{ x: 0, y: height0 }]);
    }
  }, [simTime, currentX, currentY, height0]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Scaling factors (world coordinates -> screen coordinates)
    const paddingX = 50;
    const paddingY = 40;
    const scaleX = (width - paddingX * 2) / Math.max(80, maxRange * 1.15);
    const scaleY = (height - paddingY * 2) / Math.max(40, maxHeight * 1.3);

    const toScreenX = (x: number) => paddingX + x * scaleX;
    const toScreenY = (y: number) => height - paddingY - y * scaleY;

    // Draw Grid and Axis
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Horizontal ground line
    ctx.moveTo(paddingX - 10, toScreenY(0));
    ctx.lineTo(width - 20, toScreenY(0));
    // Vertical Y-axis
    ctx.moveTo(paddingX, height - paddingY + 10);
    ctx.lineTo(paddingX, 20);
    ctx.stroke();

    // Ground grass / fill
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(paddingX - 10, toScreenY(0), width, paddingY);

    // Distance tick markers
    ctx.fillStyle = "#64748b";
    ctx.font = "10px JetBrains Mono, monospace";
    const stepDist = maxRange > 60 ? 20 : maxRange > 20 ? 10 : 5;
    for (let x = 0; x <= maxRange * 1.1; x += stepDist) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, toScreenY(0) - 4);
      ctx.lineTo(sx, toScreenY(0) + 4);
      ctx.stroke();
      ctx.fillText(`${x}m`, sx - 8, toScreenY(0) + 16);
    }

    // Height tick markers
    const stepHeight = maxHeight > 40 ? 10 : 5;
    for (let y = 0; y <= maxHeight * 1.1; y += stepHeight) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(paddingX - 4, sy);
      ctx.lineTo(paddingX + 4, sy);
      ctx.stroke();
      ctx.fillText(`${y}m`, paddingX - 34, sy + 3);
    }

    // Theoretical full trajectory curve (dotted cyan)
    ctx.strokeStyle = "rgba(6, 182, 212, 0.35)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * totalFlightTime;
      const px = vx * t;
      const py = Math.max(0, height0 + vy0 * t - 0.5 * gravity * t * t);
      if (i === 0) ctx.moveTo(toScreenX(px), toScreenY(py));
      else ctx.lineTo(toScreenX(px), toScreenY(py));
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Actual covered trajectory (solid glowing cyan)
    if (trajectory.length > 1) {
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 3;
      ctx.beginPath();
      trajectory.forEach((pt, idx) => {
        const sx = toScreenX(pt.x);
        const sy = toScreenY(pt.y);
        if (idx === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.stroke();
    }

    // Cannon / Launch base
    ctx.fillStyle = "#475569";
    ctx.fillRect(paddingX - 10, toScreenY(height0), 10, scaleY * height0);

    // Current Projectile Ball
    const ballX = toScreenX(currentX);
    const ballY = toScreenY(currentY);

    // Glow
    const gradient = ctx.createRadialGradient(ballX, ballY, 2, ballX, ballY, 14);
    gradient.addColorStop(0, "rgba(234, 179, 8, 1)");
    gradient.addColorStop(0.5, "rgba(234, 179, 8, 0.4)");
    gradient.addColorStop(1, "rgba(234, 179, 8, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ballX, ballY, 14, 0, Math.PI * 2);
    ctx.fill();

    // Solid core
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Velocity Vector arrow (v_x, v_y)
    const arrowScale = 1.2;
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ballX, ballY);
    ctx.lineTo(ballX + vx * arrowScale, ballY - currentVy * arrowScale);
    ctx.stroke();

    // Arrow tip
    const angleV = Math.atan2(-currentVy, vx);
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    const tipX = ballX + vx * arrowScale;
    const tipY = ballY - currentVy * arrowScale;
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - 6 * Math.cos(angleV - Math.PI / 6), tipY - 6 * Math.sin(angleV - Math.PI / 6));
    ctx.lineTo(tipX - 6 * Math.cos(angleV + Math.PI / 6), tipY - 6 * Math.sin(angleV + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

  }, [trajectory, currentX, currentY, currentVy, vx, maxRange, maxHeight, height0, totalFlightTime, gravity]);

  const handleReset = () => {
    setIsRunning(false);
    setSimTime(0);
    setTrajectory([{ x: 0, y: height0 }]);
  };

  const handleLaunch = () => {
    if (simTime >= totalFlightTime) {
      setSimTime(0);
      setTrajectory([{ x: 0, y: height0 }]);
    }
    setIsRunning(!isRunning);
  };

  return (
    <div className="space-y-4">
      {/* Simulation Screen */}
      <div className="relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-inner flex flex-col items-center">
        <canvas
          ref={canvasRef}
          width={750}
          height={320}
          className="w-full max-h-[320px] object-contain"
        />

        {/* Realtime overlay stats badge */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-lg p-2.5 text-xs text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <div className="text-slate-400">Thời gian (t):</div>
            <div className="font-mono font-bold text-cyan-400">{simTime.toFixed(2)} s</div>
          </div>
          <div>
            <div className="text-slate-400">Tọa độ (x, y):</div>
            <div className="font-mono font-bold text-yellow-400">({currentX.toFixed(1)}, {currentY.toFixed(1)}) m</div>
          </div>
          <div>
            <div className="text-slate-400">Tầm xa (L):</div>
            <div className="font-mono font-bold text-emerald-400">{maxRange.toFixed(1)} m</div>
          </div>
          <div>
            <div className="text-slate-400">Độ cao cực đại (H):</div>
            <div className="font-mono font-bold text-pink-400">{maxHeight.toFixed(1)} m</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            id="btn-projectile-launch"
            onClick={handleLaunch}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-lg ${
              isRunning
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? "Tạm dừng" : simTime >= totalFlightTime ? "Bắn lại" : "Phóng vật"}
          </button>
          <button
            id="btn-projectile-reset"
            onClick={handleReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Đặt lại"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Param Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Vận tốc ban đầu (v₀)</span>
            <span className="font-mono font-bold text-cyan-400">{v0} m/s</span>
          </div>
          <input
            id="slider-v0"
            type="range"
            min="5"
            max="60"
            step="1"
            value={v0}
            onChange={(e) => { setV0(Number(e.target.value)); handleReset(); }}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Góc bắn (α)</span>
            <span className="font-mono font-bold text-yellow-400">{angle}°</span>
          </div>
          <input
            id="slider-angle"
            type="range"
            min="0"
            max="90"
            step="1"
            value={angle}
            onChange={(e) => { setAngle(Number(e.target.value)); handleReset(); }}
            className="w-full accent-yellow-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Gia tốc trọng trường (g)</span>
            <span className="font-mono font-bold text-emerald-400">{gravity} m/s²</span>
          </div>
          <input
            id="slider-gravity"
            type="range"
            min="1.6"
            max="24.8"
            step="0.1"
            value={gravity}
            onChange={(e) => { setGravity(Number(e.target.value)); handleReset(); }}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <button onClick={() => { setGravity(1.62); handleReset(); }} className="hover:text-cyan-400">Mặt Trăng (1.6)</button>
            <button onClick={() => { setGravity(3.71); handleReset(); }} className="hover:text-cyan-400">Sao Hỏa (3.7)</button>
            <button onClick={() => { setGravity(9.8); handleReset(); }} className="hover:text-cyan-400">Trái Đất (9.8)</button>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Độ cao bệ phóng (h₀)</span>
            <span className="font-mono font-bold text-pink-400">{height0} m</span>
          </div>
          <input
            id="slider-height0"
            type="range"
            min="0"
            max="30"
            step="1"
            value={height0}
            onChange={(e) => { setHeight0(Number(e.target.value)); handleReset(); }}
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Formulas & Theoretical Reference */}
      <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/40 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Công thức lý thuyết:</span>
        </div>
        <div className="flex flex-wrap gap-4 font-mono text-cyan-300">
          <span><MathRenderer content="$L = \frac{v_0^2 \sin(2\alpha)}{g}$" /></span>
          <span><MathRenderer content="$H_{max} = \frac{v_0^2 \sin^2\alpha}{2g}$" /></span>
          <span><MathRenderer content="$y = x \tan\alpha - \frac{g}{2 v_0^2 \cos^2\alpha} x^2$" /></span>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. SIMPLE PENDULUM SIMULATOR (Con Lắc Đơn)
   ========================================================================= */
const PendulumSimulator: React.FC<{ initialParams?: Record<string, number> }> = ({ initialParams }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [length, setLength] = useState<number>(initialParams?.length ?? 1.5); // meters
  const [mass, setMass] = useState<number>(initialParams?.mass ?? 1.0); // kg
  const [gravity, setGravity] = useState<number>(initialParams?.gravity ?? 9.8); // m/s^2
  const [initialTheta, setInitialTheta] = useState<number>(initialParams?.angle ?? 30); // degrees
  const [damping, setDamping] = useState<number>(0.02); // air resistance
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Physics state
  const stateRef = useRef({
    theta: (initialTheta * Math.PI) / 180,
    omega: 0, // angular velocity
    alpha: 0, // angular acceleration
  });

  const [displayAngle, setDisplayAngle] = useState<number>(initialTheta);
  const [kineticEnergy, setKineticEnergy] = useState<number>(0);
  const [potentialEnergy, setPotentialEnergy] = useState<number>(0);

  // Natural period T = 2*pi*sqrt(L/g)
  const theoreticalPeriod = 2 * Math.PI * Math.sqrt(length / gravity);

  useEffect(() => {
    stateRef.current.theta = (initialTheta * Math.PI) / 180;
    stateRef.current.omega = 0;
  }, [initialTheta, length, gravity]);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (isRunning) {
        // Equation of motion: alpha = -(g/L)*sin(theta) - damping*omega
        const st = stateRef.current;
        st.alpha = -(gravity / length) * Math.sin(st.theta) - damping * st.omega;
        st.omega += st.alpha * dt;
        st.theta += st.omega * dt;

        setDisplayAngle((st.theta * 180) / Math.PI);

        // Energies
        const v = length * st.omega;
        const h = length * (1 - Math.cos(st.theta));
        const ke = 0.5 * mass * v * v;
        const pe = mass * gravity * h;
        setKineticEnergy(ke);
        setPotentialEnergy(pe);
      }

      // Draw
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);

          const pivotX = w / 2;
          const pivotY = 40;
          const pixelScale = 110; // pixels per meter
          const bobX = pivotX + length * pixelScale * Math.sin(stateRef.current.theta);
          const bobY = pivotY + length * pixelScale * Math.cos(stateRef.current.theta);

          // Draw ceiling pivot
          ctx.fillStyle = "#475569";
          ctx.fillRect(pivotX - 30, pivotY - 8, 60, 8);

          // Draw vertical reference dashed line
          ctx.strokeStyle = "#334155";
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(pivotX, pivotY);
          ctx.lineTo(pivotX, pivotY + length * pixelScale + 20);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw String
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pivotX, pivotY);
          ctx.lineTo(bobX, bobY);
          ctx.stroke();

          // Pivot pin
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
          ctx.fill();

          // Bob ball (size proportional to mass)
          const radius = Math.min(22, 10 + mass * 6);
          const grad = ctx.createRadialGradient(bobX - 3, bobY - 3, 2, bobX, bobY, radius);
          grad.addColorStop(0, "#38bdf8");
          grad.addColorStop(1, "#0284c7");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(bobX, bobY, radius, 0, Math.PI * 2);
          ctx.fill();

          // Velocity vector arrow
          const vx = length * stateRef.current.omega * Math.cos(stateRef.current.theta);
          const vy = -length * stateRef.current.omega * Math.sin(stateRef.current.theta);
          ctx.strokeStyle = "#22c55e";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(bobX, bobY);
          ctx.lineTo(bobX + vx * 20, bobY + vy * 20);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, gravity, length, mass, damping]);

  const totalEnergy = kineticEnergy + potentialEnergy;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Canvas */}
        <div className="lg:col-span-2 relative bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-2 min-h-[300px]">
          <canvas ref={canvasRef} width={480} height={300} className="w-full max-h-[300px]" />

          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-lg p-2 text-xs text-slate-300">
            <div>Góc lệch (θ): <span className="font-mono font-bold text-cyan-400">{displayAngle.toFixed(1)}°</span></div>
            <div>Chu kỳ lý thuyết: <span className="font-mono font-bold text-yellow-400">{theoreticalPeriod.toFixed(2)} s</span></div>
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-all"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? "Tạm dừng" : "Tiếp tục"}
            </button>
            <button
              onClick={() => {
                stateRef.current.theta = (initialTheta * Math.PI) / 180;
                stateRef.current.omega = 0;
              }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
              title="Đặt lại góc ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Energy Meter Bars */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Bảo toàn Cơ năng ($W = W_đ + W_t$)
          </h4>

          <div className="space-y-4 my-auto py-2">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span className="text-emerald-400 font-medium">Động năng (Wđ)</span>
                <span className="font-mono">{kineticEnergy.toFixed(2)} J</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-75"
                  style={{ width: `${Math.min(100, (kineticEnergy / Math.max(0.01, totalEnergy)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span className="text-cyan-400 font-medium">Thế năng (Wt)</span>
                <span className="font-mono">{potentialEnergy.toFixed(2)} J</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full transition-all duration-75"
                  style={{ width: `${Math.min(100, (potentialEnergy / Math.max(0.01, totalEnergy)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span className="text-yellow-400 font-medium">Tổng cơ năng (W)</span>
                <span className="font-mono font-bold text-yellow-300">{totalEnergy.toFixed(2)} J</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div className="bg-yellow-400 h-full w-full opacity-90" />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            Khi vật qua VTCB: Wđ cực đại, Wt = 0.<br/>
            Tại vị trí biên: Wt cực đại, Wđ = 0.
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Chiều dài dây (L)</span>
            <span className="font-mono font-bold text-cyan-400">{length} m</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.1"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Khối lượng quả nặng (m)</span>
            <span className="font-mono font-bold text-yellow-400">{mass} kg</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.1"
            value={mass}
            onChange={(e) => setMass(Number(e.target.value))}
            className="w-full accent-yellow-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Góc kéo ban đầu (α₀)</span>
            <span className="font-mono font-bold text-emerald-400">{initialTheta}°</span>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            step="1"
            value={initialTheta}
            onChange={(e) => setInitialTheta(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Hệ số cản không khí (b)</span>
            <span className="font-mono font-bold text-pink-400">{damping}</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.1"
            step="0.005"
            value={damping}
            onChange={(e) => setDamping(Number(e.target.value))}
            className="w-full accent-pink-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. OHM'S LAW & CIRCUIT SIMULATOR (Định luật Ôm)
   ========================================================================= */
const CircuitSimulator: React.FC<{ initialParams?: Record<string, number> }> = ({ initialParams }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [voltage, setVoltage] = useState<number>(initialParams?.voltage ?? 12); // Volts
  const [resistance, setResistance] = useState<number>(initialParams?.resistance ?? 6); // Ohms
  const [isSwitchClosed, setIsSwitchClosed] = useState<boolean>(true);

  // I = U / R
  const current = isSwitchClosed ? voltage / Math.max(0.1, resistance) : 0;
  const power = isSwitchClosed ? voltage * current : 0;

  // Electron animation phase
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    let animId: number;

    const render = () => {
      if (isSwitchClosed && current > 0) {
        phaseRef.current += current * 0.8; // speed proportional to current
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.clearRect(0, 0, w, h);

          // Circuit rectangle loop coordinates
          const left = 70;
          const right = w - 70;
          const top = 60;
          const bottom = h - 60;

          // Wire
          ctx.strokeStyle = isSwitchClosed ? "#38bdf8" : "#475569";
          ctx.lineWidth = 4;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          ctx.beginPath();
          ctx.moveTo(left, top);
          ctx.lineTo(right, top);
          ctx.lineTo(right, bottom);
          ctx.lineTo(left, bottom);
          ctx.closePath();
          ctx.stroke();

          // Left component: Battery (Nguồn điện)
          const midY = (top + bottom) / 2;
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(left - 20, midY - 35, 40, 70);

          // Long positive bar
          ctx.strokeStyle = "#ef4444";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(left - 18, midY - 20);
          ctx.lineTo(left + 18, midY - 20);
          ctx.stroke();
          ctx.fillStyle = "#ef4444";
          ctx.font = "12px sans-serif";
          ctx.fillText("+", left + 22, midY - 16);

          // Short thick negative bar
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(left - 10, midY + 15);
          ctx.lineTo(left + 10, midY + 15);
          ctx.stroke();
          ctx.fillStyle = "#3b82f6";
          ctx.fillText("-", left + 22, midY + 19);

          ctx.fillStyle = "#f8fafc";
          ctx.font = "11px JetBrains Mono";
          ctx.fillText(`U = ${voltage}V`, left - 32, midY + 45);

          // Top component: Switch (Khóa K)
          const midX = (left + right) / 2;
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(midX - 30, top - 15, 60, 30);

          ctx.fillStyle = "#94a3b8";
          ctx.beginPath();
          ctx.arc(midX - 20, top, 4, 0, Math.PI * 2);
          ctx.arc(midX + 20, top, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = isSwitchClosed ? "#22c55e" : "#ef4444";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(midX - 20, top);
          if (isSwitchClosed) {
            ctx.lineTo(midX + 20, top);
          } else {
            ctx.lineTo(midX + 15, top - 20);
          }
          ctx.stroke();

          ctx.fillStyle = "#cbd5e1";
          ctx.font = "11px sans-serif";
          ctx.fillText(`Khóa K: ${isSwitchClosed ? "ĐÓNG" : "MỞ"}`, midX - 32, top - 24);

          // Right component: Resistor (Điện trở R)
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(right - 25, midY - 35, 50, 70);

          // Resistor zigzag or box
          ctx.strokeStyle = "#eab308";
          ctx.lineWidth = 3;
          ctx.strokeRect(right - 14, midY - 24, 28, 48);

          // Color stripes on resistor
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(right - 12, midY - 14, 24, 4);
          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(right - 12, midY - 4, 24, 4);
          ctx.fillStyle = "#eab308";
          ctx.fillRect(right - 12, midY + 6, 24, 4);

          ctx.fillStyle = "#facc15";
          ctx.font = "11px JetBrains Mono";
          ctx.fillText(`R = ${resistance} Ω`, right - 28, midY + 45);

          // Bottom component: Ammeter (Ampe kế A)
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(midX - 25, bottom - 25, 50, 50);

          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(midX, bottom, 18, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = "#38bdf8";
          ctx.font = "bold 14px sans-serif";
          ctx.fillText("A", midX - 5, bottom + 5);

          // Animate Drifting Electrons along the perimeter
          if (isSwitchClosed && current > 0) {
            const perimeter = 2 * (right - left) + 2 * (bottom - top);
            const numElectrons = 24;

            ctx.fillStyle = "#67e8f9";
            for (let i = 0; i < numElectrons; i++) {
              const dist = (i * (perimeter / numElectrons) + phaseRef.current) % perimeter;
              let ex = 0;
              let ey = 0;

              // Calculate (ex, ey) along rectangle path (counter-clockwise: electrons move to positive terminal)
              if (dist < right - left) {
                // top edge: right to left (electrons)
                ex = right - dist;
                ey = top;
              } else if (dist < (right - left) + (bottom - top)) {
                // left edge: top to bottom
                ex = left;
                ey = top + (dist - (right - left));
              } else if (dist < 2 * (right - left) + (bottom - top)) {
                // bottom edge: left to right
                ex = left + (dist - ((right - left) + (bottom - top)));
                ey = bottom;
              } else {
                // right edge: bottom to top
                ex = right;
                ey = bottom - (dist - (2 * (right - left) + (bottom - top)));
              }

              ctx.beginPath();
              ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [voltage, resistance, isSwitchClosed, current]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Canvas Schematic */}
        <div className="lg:col-span-2 relative bg-slate-950 rounded-xl border border-slate-800 p-2 flex items-center justify-center min-h-[300px]">
          <canvas ref={canvasRef} width={500} height={280} className="w-full max-h-[280px]" />

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button
              onClick={() => setIsSwitchClosed(!isSwitchClosed)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isSwitchClosed
                  ? "bg-rose-500 hover:bg-rose-400 text-white"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
              }`}
            >
              {isSwitchClosed ? "Ngắt khóa K" : "Đóng khóa K"}
            </button>
          </div>
        </div>

        {/* Meters Display */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Số Đo Dụng Cụ Đo & Công Suất
          </h4>

          <div className="space-y-3 my-auto">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Cường độ dòng điện (I):</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">
                {current.toFixed(2)} <span className="text-sm text-cyan-200">Ampe (A)</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">$I = U / R = {voltage} / {resistance}$</div>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Công suất toả nhiệt (P):</div>
              <div className="text-xl font-mono font-bold text-yellow-400">
                {power.toFixed(2)} <span className="text-sm text-yellow-200">Watt (W)</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">$P = U \\cdot I = I^2 \\cdot R$</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            Hạt mang điện (electron) dịch chuyển ngược chiều quy ước của dòng điện.
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Điện áp nguồn (U)</span>
            <span className="font-mono font-bold text-red-400">{voltage} V</span>
          </div>
          <input
            type="range"
            min="1"
            max="36"
            step="0.5"
            value={voltage}
            onChange={(e) => setVoltage(Number(e.target.value))}
            className="w-full accent-red-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Điện trở tải (R)</span>
            <span className="font-mono font-bold text-yellow-400">{resistance} Ω</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            step="0.5"
            value={resistance}
            onChange={(e) => setResistance(Number(e.target.value))}
            className="w-full accent-yellow-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   4. OPTICS: SNELL'S LAW & REFRACTION SIMULATOR (Khúc Xạ Ánh Sáng)
   ========================================================================= */
const OpticsSnellSimulator: React.FC<{ initialParams?: Record<string, number> }> = ({ initialParams }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [n1, setN1] = useState<number>(initialParams?.refractionN1 ?? 1.0); // Medium 1
  const [n2, setN2] = useState<number>(initialParams?.refractionN2 ?? 1.5); // Medium 2
  const [incidentAngleDeg, setIncidentAngleDeg] = useState<number>(45); // i (degrees)

  const iRad = (incidentAngleDeg * Math.PI) / 180;
  // Snell's Law: n1 * sin(i) = n2 * sin(r) => sin(r) = (n1 / n2) * sin(i)
  const sinR = (n1 / n2) * Math.sin(iRad);
  const isTIR = sinR > 1.0; // Total Internal Reflection
  const refractedAngleDeg = !isTIR ? (Math.asin(sinR) * 180) / Math.PI : 0;
  const criticalAngleDeg = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const midX = w / 2;
    const midY = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Medium 1 background (top)
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, w, midY);

    // Medium 2 background (bottom, tinted with cyan depending on n2)
    ctx.fillStyle = `rgba(14, 116, 144, ${Math.min(0.5, (n2 - 1) * 0.4)})`;
    ctx.fillRect(0, midY, w, midY);

    // Boundary interface line
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();

    // Normal line (Pháp tuyến NN')
    ctx.strokeStyle = "#64748b";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(midX, 20);
    ctx.lineTo(midX, h - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px sans-serif";
    ctx.fillText("N (Pháp tuyến)", midX + 6, 32);
    ctx.fillText("N'", midX + 6, h - 28);

    // Medium Labels
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(`Môi trường 1 (n₁ = ${n1.toFixed(2)})`, 20, 35);
    ctx.fillText(`Môi trường 2 (n₂ = ${n2.toFixed(2)})`, 20, midY + 35);

    // Ray lengths
    const rayLen = 160;

    // 1. Incident Ray (Tia tới SI)
    const startX = midX - rayLen * Math.sin(iRad);
    const startY = midY - rayLen * Math.cos(iRad);

    ctx.strokeStyle = "#ef4444"; // Red laser beam
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(midX, midY);
    ctx.stroke();

    // Laser Source Point S
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(startX, startY, 6, 0, Math.PI * 2);
    ctx.fill();

    // 2. Reflected Ray (Tia phản xạ IR)
    const reflectEndX = midX + rayLen * Math.sin(iRad);
    const reflectEndY = midY - rayLen * Math.cos(iRad);

    ctx.strokeStyle = isTIR ? "#ef4444" : "rgba(239, 68, 68, 0.4)";
    ctx.lineWidth = isTIR ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(reflectEndX, reflectEndY);
    ctx.stroke();

    // 3. Refracted Ray (Tia khúc xạ IK)
    if (!isTIR) {
      const rRad = (refractedAngleDeg * Math.PI) / 180;
      const refractEndX = midX + rayLen * Math.sin(rRad);
      const refractEndY = midY + rayLen * Math.cos(rRad);

      ctx.strokeStyle = "#22c55e"; // Green refracted beam
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(refractEndX, refractEndY);
      ctx.stroke();

      // Refracted angle arc
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(midX, midY, 35, Math.PI / 2 - rRad, Math.PI / 2);
      ctx.stroke();
    }

    // Incident angle arc
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(midX, midY, 40, (3 * Math.PI) / 2 - iRad, (3 * Math.PI) / 2);
    ctx.stroke();

  }, [n1, n2, incidentAngleDeg, refractedAngleDeg, isTIR, iRad]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative bg-slate-950 rounded-xl border border-slate-800 p-2 flex items-center justify-center min-h-[300px]">
          <canvas ref={canvasRef} width={500} height={300} className="w-full max-h-[300px]" />

          {isTIR && (
            <div className="absolute top-4 right-4 bg-rose-500/20 border border-rose-500/50 text-rose-300 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse">
              ⚡ Hiện tượng Phản Xạ Toàn Phần!
            </div>
          )}
        </div>

        {/* Readout panel */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Định Luật Khúc Xạ Snell
          </h4>

          <div className="space-y-3 my-auto">
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
              <div className="text-slate-400">Góc tới (i):</div>
              <div className="text-xl font-mono font-bold text-amber-400">{incidentAngleDeg}°</div>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
              <div className="text-slate-400">Góc khúc xạ (r):</div>
              <div className="text-xl font-mono font-bold text-emerald-400">
                {isTIR ? "Không có (Phản xạ toàn phần)" : `${refractedAngleDeg.toFixed(1)}°`}
              </div>
            </div>

            {criticalAngleDeg !== null && (
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                <div className="text-slate-400">Góc giới hạn (θ_gh):</div>
                <div className="text-base font-mono font-bold text-pink-400">{criticalAngleDeg.toFixed(1)}°</div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            Biểu thức: <span className="font-mono text-cyan-300">$n_1 \sin(i) = n_2 \sin(r)$</span>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Góc tới (i)</span>
            <span className="font-mono font-bold text-amber-400">{incidentAngleDeg}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="89"
            step="1"
            value={incidentAngleDeg}
            onChange={(e) => setIncidentAngleDeg(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Chiết suất Môi trường 1 (n₁)</span>
            <span className="font-mono font-bold text-cyan-400">{n1.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="2.42"
            step="0.01"
            value={n1}
            onChange={(e) => setN1(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <button onClick={() => setN1(1.0)} className="hover:text-cyan-400">Không khí (1.0)</button>
            <button onClick={() => setN1(1.33)} className="hover:text-cyan-400">Nước (1.33)</button>
            <button onClick={() => setN1(1.5)} className="hover:text-cyan-400">Thủy tinh (1.5)</button>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Chiết suất Môi trường 2 (n₂)</span>
            <span className="font-mono font-bold text-emerald-400">{n2.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="2.42"
            step="0.01"
            value={n2}
            onChange={(e) => setN2(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <button onClick={() => setN2(1.0)} className="hover:text-emerald-400">Không khí (1.0)</button>
            <button onClick={() => setN2(1.33)} className="hover:text-emerald-400">Nước (1.33)</button>
            <button onClick={() => setN2(2.42)} className="hover:text-emerald-400">Kim cương (2.42)</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   5. FREE FALL SIMULATOR (Rơi Tự Do)
   ========================================================================= */
const FreeFallSimulator: React.FC<{ initialParams?: Record<string, number> }> = ({ initialParams }) => {
  const [dropHeight, setDropHeight] = useState<number>(initialParams?.height ?? 50); // meters
  const [gravity, setGravity] = useState<number>(initialParams?.gravity ?? 9.8);
  const [simTime, setSimTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const totalFallTime = Math.sqrt((2 * dropHeight) / gravity);
  const finalSpeed = Math.sqrt(2 * gravity * dropHeight);

  useEffect(() => {
    let animId: number;
    let lastTime: number | null = null;

    if (isRunning) {
      const step = (t: number) => {
        if (!lastTime) lastTime = t;
        const dt = (t - lastTime) / 1000;
        lastTime = t;

        setSimTime((prev) => {
          const next = prev + dt;
          if (next >= totalFallTime) {
            setIsRunning(false);
            return totalFallTime;
          }
          return next;
        });

        animId = requestAnimationFrame(step);
      };
      animId = requestAnimationFrame(step);
    }

    return () => cancelAnimationFrame(animId);
  }, [isRunning, totalFallTime]);

  const currentDistance = Math.min(dropHeight, 0.5 * gravity * simTime * simTime);
  const currentHeight = dropHeight - currentDistance;
  const currentSpeed = gravity * simTime;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tower drop animation view */}
        <div className="lg:col-span-2 relative bg-slate-950 rounded-xl border border-slate-800 p-6 flex items-center justify-center min-h-[300px] overflow-hidden">
          {/* Vertical ruler line */}
          <div className="relative h-[220px] w-24 border-r-2 border-dashed border-slate-700">
            {/* Top platform */}
            <div className="absolute -top-3 right-0 w-16 h-3 bg-slate-700 rounded-l" />

            {/* Ground */}
            <div className="absolute -bottom-3 -left-12 right-0 w-48 h-4 bg-emerald-900/60 border-t border-emerald-500" />

            {/* Falling ball */}
            <div
              className="absolute right-[-14px] w-7 h-7 bg-amber-400 rounded-full shadow-lg shadow-amber-500/50 transition-all duration-75 flex items-center justify-center text-[9px] font-bold text-slate-950"
              style={{
                top: `${(currentDistance / dropHeight) * 200}px`,
              }}
            >
              ●
            </div>
          </div>

          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={() => {
                if (simTime >= totalFallTime) setSimTime(0);
                setIsRunning(!isRunning);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-all"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? "Dừng" : simTime >= totalFallTime ? "Thả lại" : "Thả rơi"}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                setSimTime(0);
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Realtime stats */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col justify-between">
          <h4 className="text-sm font-semibold text-white">Chỉ số Thời Gian Thực</h4>

          <div className="space-y-3 my-auto">
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
              <div className="text-slate-400">Thời gian rơi (t):</div>
              <div className="text-xl font-mono font-bold text-cyan-400">{simTime.toFixed(2)} s</div>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
              <div className="text-slate-400">Độ cao còn lại (h):</div>
              <div className="text-xl font-mono font-bold text-yellow-400">{currentHeight.toFixed(1)} m</div>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
              <div className="text-slate-400">Vận tốc tức thời (v):</div>
              <div className="text-xl font-mono font-bold text-emerald-400">{currentSpeed.toFixed(1)} m/s</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            Vận tốc khi chạm đất: <span className="font-mono text-emerald-400">{finalSpeed.toFixed(1)} m/s</span> ({((finalSpeed * 3.6)).toFixed(0)} km/h)
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Độ cao thả rơi (h)</span>
            <span className="font-mono font-bold text-cyan-400">{dropHeight} m</span>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            step="5"
            value={dropHeight}
            onChange={(e) => { setDropHeight(Number(e.target.value)); setSimTime(0); setIsRunning(false); }}
            className="w-full accent-cyan-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Gia tốc trọng trường (g)</span>
            <span className="font-mono font-bold text-emerald-400">{gravity} m/s²</span>
          </div>
          <input
            type="range"
            min="1.6"
            max="24.8"
            step="0.1"
            value={gravity}
            onChange={(e) => { setGravity(Number(e.target.value)); setSimTime(0); setIsRunning(false); }}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
