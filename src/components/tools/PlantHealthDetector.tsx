import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAgentContext } from '@/contexts/AgentContext';
import { AlertCircle, Settings } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlantAnalysis {
  healthScore: number;
  status: 'thriving' | 'okay' | 'struggling' | 'critical';
  plantName: string;
  issues: string[];
  suggestions: { action: string; animation: string }[];
  funFact: string;
  growthPrediction: string;
}

interface Achievement {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

type AppState = 'idle' | 'scanning' | 'results' | 'error';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-scan',   label: 'First Scan!',   emoji: '🌱', description: 'You scanned your first plant!' },
  { id: 'plant-doctor', label: 'Plant Doctor',   emoji: '👨‍⚕️', description: 'Diagnosed a struggling plant!' },
  { id: 'green-thumb',  label: 'Green Thumb',    emoji: '🌿', description: 'Found a thriving plant!' },
];

const STATUS_CONFIG = {
  thriving:   { emoji: '🌱', color: 'text-green-400',  bg: 'bg-green-500/20',  border: 'border-green-500/40',  label: 'Thriving!' },
  okay:       { emoji: '😐', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', label: 'Doing OK' },
  struggling: { emoji: '😟', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/40', label: 'Struggling' },
  critical:   { emoji: '💀', color: 'text-red-400',    bg: 'bg-red-500/20',    border: 'border-red-500/40',    label: 'Critical!' },
};

const SUGGESTION_ICONS: Record<string, string> = {
  scissors: '✂️',
  water:    '💧',
  sun:      '☀️',
  repot:    '🪴',
  fertilize:'🌿',
  spray:    '💦',
  default:  '🌿',
};

const CUSTOM_STYLES = `
  @keyframes phd-bugCrawl {
    0%   { transform: translateX(-20px) translateY(0px) rotate(0deg); opacity: 0; }
    10%  { opacity: 1; }
    50%  { transform: translateX(60px) translateY(-15px) rotate(15deg); }
    90%  { opacity: 1; }
    100% { transform: translateX(140px) translateY(5px) rotate(-5deg); opacity: 0; }
  }
  @keyframes phd-waterDrip {
    0%   { transform: translateY(-10px) scaleY(0.5); opacity: 0; }
    20%  { opacity: 1; transform: translateY(0px) scaleY(1); }
    80%  { opacity: 1; }
    100% { transform: translateY(90px) scaleY(1.3); opacity: 0; }
  }
  @keyframes phd-sunRay {
    0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.7; }
    50%      { transform: rotate(180deg) scale(1.2); opacity: 1; }
  }
  @keyframes phd-warningFlash {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%      { opacity: 0.3; transform: scale(1.15); }
  }
  @keyframes phd-radarSweep {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes phd-pulseRing {
    0%   { transform: scale(0.8); opacity: 0.9; }
    100% { transform: scale(1.5); opacity: 0; }
  }
  @keyframes phd-scissorSnip {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25%      { transform: rotate(-25deg) scale(1.15); }
    75%      { transform: rotate(25deg) scale(1.15); }
  }
  @keyframes phd-badgeBounce {
    0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
    60%  { transform: scale(1.2) rotate(5deg); opacity: 1; }
    80%  { transform: scale(0.95) rotate(-2deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes phd-xpCount {
    0%   { transform: scale(0.4) rotate(-10deg); opacity: 0; }
    70%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes phd-textReveal {
    0%   { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes phd-float {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes phd-shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

const IssueOverlay: React.FC<{ issues: string[] }> = ({ issues }) => {
  const nodes: React.ReactNode[] = [];

  issues.forEach((issue) => {
    const lc = issue.toLowerCase();

    if (lc.includes('pest') || lc.includes('bug') || lc.includes('insect') || lc.includes('mite') || lc.includes('aphid')) {
      [0, 1, 2, 3].forEach((i) =>
        nodes.push(
          <span
            key={`bug-${i}`}
            style={{
              position: 'absolute',
              top: `${18 + i * 14}%`,
              left: 0,
              fontSize: '1.4rem',
              animation: `phd-bugCrawl ${2.2 + i * 0.35}s ease-in-out ${i * 0.55}s infinite`,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {i % 2 === 0 ? '🐛' : '🐞'}
          </span>
        )
      );
    }

    if (lc.includes('overwater') || lc.includes('root rot') || lc.includes('soggy') || lc.includes('waterlog')) {
      [0, 1, 2, 3, 4].forEach((i) =>
        nodes.push(
          <span
            key={`drop-${i}`}
            style={{
              position: 'absolute',
              top: 0,
              left: `${12 + i * 17}%`,
              fontSize: '1.1rem',
              animation: `phd-waterDrip ${1.6 + i * 0.2}s linear ${i * 0.3}s infinite`,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            💧
          </span>
        )
      );
    }

    if (lc.includes('underwater') || lc.includes('drought') || lc.includes('dry') || lc.includes('wilt') || lc.includes('thirst')) {
      nodes.push(
        <React.Fragment key="sun-overlay">
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(rgba(251,191,36,0.12), transparent)',
              pointerEvents: 'none',
              zIndex: 9,
            }}
          />
          <span
            style={{
              position: 'absolute',
              top: '8%',
              right: '8%',
              fontSize: '2.2rem',
              animation: 'phd-sunRay 3s ease-in-out infinite',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            ☀️
          </span>
        </React.Fragment>
      );
    }

    if (lc.includes('nutrient') || lc.includes('deficien') || lc.includes('yellow') || lc.includes('chloro')) {
      [0, 1, 2].forEach((i) =>
        nodes.push(
          <span
            key={`warn-${i}`}
            style={{
              position: 'absolute',
              top: `${22 + i * 22}%`,
              left: `${18 + i * 28}%`,
              fontSize: '1.3rem',
              animation: `phd-warningFlash 1s ease-in-out ${i * 0.4}s infinite`,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            ⚠️
          </span>
        )
      );
    }
  });

  return <>{nodes}</>;
};

const SuggestionCard: React.FC<{
  suggestion: { action: string; animation: string };
  index: number;
}> = ({ suggestion, index }) => {
  const icon = SUGGESTION_ICONS[suggestion.animation] ?? SUGGESTION_ICONS.default;

  const animStyle: React.CSSProperties = {
    display: 'inline-block',
    animation:
      suggestion.animation === 'scissors' || suggestion.animation === 'prune'
        ? `phd-scissorSnip 0.7s ease-in-out ${index * 0.18}s infinite`
        : suggestion.animation === 'water'
        ? `phd-waterDrip 2s ease-in-out ${index * 0.3}s infinite`
        : suggestion.animation === 'sun'
        ? `phd-sunRay 2.5s ease-in-out ${index * 0.25}s infinite`
        : `phd-float 2s ease-in-out ${index * 0.3}s infinite`,
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-green-900/30 border border-green-700/30">
      <span style={animStyle} className="text-2xl flex-shrink-0 mt-0.5">
        {icon}
      </span>
      <p className="text-sm text-green-100 leading-relaxed">{suggestion.action}</p>
    </div>
  );
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 50) return 'text-yellow-400';
  if (score >= 30) return 'text-orange-400';
  return 'text-red-400';
}

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  if (score >= 30) return 'bg-orange-500';
  return 'bg-red-500';
}

function validateAnalysis(raw: Record<string, unknown>): PlantAnalysis {
  const validStatuses = ['thriving', 'okay', 'struggling', 'critical'] as const;
  const status = validStatuses.includes(raw.status as typeof validStatuses[number])
    ? (raw.status as PlantAnalysis['status'])
    : 'okay';

  return {
    healthScore: Math.max(0, Math.min(100, Number(raw.healthScore) || 0)),
    status,
    plantName: String(raw.plantName || 'Unknown Plant'),
    issues: Array.isArray(raw.issues) ? (raw.issues as unknown[]).map(String) : [],
    suggestions: Array.isArray(raw.suggestions)
      ? (raw.suggestions as Record<string, string>[])
          .slice(0, 4)
          .map((s) => ({ action: String(s.action || ''), animation: String(s.animation || 'default') }))
      : [],
    funFact: String(raw.funFact || ''),
    growthPrediction: String(raw.growthPrediction || ''),
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const PlantHealthDetector: React.FC = () => {
  const { apiKey } = useAgentContext();
  const { toast } = useToast();

  const [appState, setAppState] = useState<AppState>('idle');
  const [analysis, setAnalysis] = useState<PlantAnalysis | null>(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('plant-detector-achievements') || '[]');
    } catch {
      return [];
    }
  });
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  const [showXpAnimation, setShowXpAnimation] = useState(false);

  // ── Camera ──────────────────────────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraReady(false);

    const tryGetStream = async (constraints: MediaStreamConstraints) => {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    };

    try {
      await tryGetStream({ video: { facingMode: 'environment' } });
    } catch (err: unknown) {
      const domErr = err as DOMException;
      // facingMode 'environment' may not be available on desktop — retry without constraint
      if (domErr.name === 'OverconstrainedError' || domErr.name === 'ConstraintNotSatisfiedError') {
        try {
          await tryGetStream({ video: true });
        } catch (fallbackErr: unknown) {
          const fe = fallbackErr as DOMException;
          setCameraError(
            fe.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow camera access and reload.'
              : 'Unable to access camera: ' + fe.message
          );
        }
      } else if (domErr.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access and reload.');
      } else if (domErr.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError('Unable to access camera: ' + domErr.message);
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (apiKey) {
      startCamera();
    }
    return () => stopCamera();
  }, [apiKey, startCamera, stopCamera]);

  // ── Frame capture ────────────────────────────────────────────────────────────

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return null;

    // Cap at 640px wide to keep payload manageable
    const maxWidth = 640;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, []);

  // ── OpenAI Vision call ───────────────────────────────────────────────────────

  const analyzeWithVision = useCallback(
    async (base64Image: string): Promise<PlantAnalysis> => {
      const systemPrompt = `You are an expert plant health diagnostician. Analyze the plant in the image and return ONLY a JSON object with exactly these fields:
{
  "healthScore": <integer 0-100; 80-100=thriving, 50-79=okay, 30-49=struggling, 0-29=critical>,
  "status": <"thriving"|"okay"|"struggling"|"critical">,
  "plantName": <string; "Unknown Plant" if not identifiable>,
  "issues": <array of short lowercase strings; e.g. ["overwatering","pest infestation","nutrient deficiency"]>,
  "suggestions": <array of up to 4 objects: {"action": <imperative sentence>, "animation": <one of "scissors","water","sun","repot","fertilize","spray">}>,
  "funFact": <one fun/encouraging sentence about this plant species>,
  "growthPrediction": <one sentence about what will happen if the top suggestion is followed>
}
If no plant is visible, return healthScore:0, status:"critical", plantName:"No Plant Detected", issues:["no plant visible"], suggestions:[], funFact:"Point the camera at a plant!", growthPrediction:"Find a plant to scan!".`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: 800,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: 'low',
                  },
                },
                { type: 'text', text: 'Analyze this plant image and return the JSON health report.' },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { error?: { message?: string } }).error?.message ?? `API error ${response.status}`);
      }

      const data = await response.json();
      let raw = data.choices?.[0]?.message?.content ?? '{}';
      // Strip markdown fences just in case
      raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      return validateAnalysis(JSON.parse(raw));
    },
    [apiKey]
  );

  // ── Achievements ─────────────────────────────────────────────────────────────

  const checkAndUnlockAchievements = useCallback(
    (result: PlantAnalysis) => {
      const toUnlock: string[] = [];

      if (!unlockedAchievements.includes('first-scan')) toUnlock.push('first-scan');
      if (result.status === 'thriving' && !unlockedAchievements.includes('green-thumb'))
        toUnlock.push('green-thumb');
      if (
        (result.status === 'struggling' || result.status === 'critical') &&
        !unlockedAchievements.includes('plant-doctor')
      )
        toUnlock.push('plant-doctor');

      if (toUnlock.length === 0) return;

      const updated = [...unlockedAchievements, ...toUnlock];
      setUnlockedAchievements(updated);
      localStorage.setItem('plant-detector-achievements', JSON.stringify(updated));

      toUnlock.forEach((id, i) => {
        const ach = ACHIEVEMENTS.find((a) => a.id === id)!;
        setTimeout(() => {
          toast({
            title: `${ach.emoji} Achievement Unlocked!`,
            description: `${ach.label} — ${ach.description}`,
            duration: 4000,
          });
          setNewlyUnlocked(ach);
          setTimeout(() => setNewlyUnlocked(null), 4000);
        }, i * 1500);
      });
    },
    [unlockedAchievements, toast]
  );

  // ── Scan handler ──────────────────────────────────────────────────────────────

  const handleScan = useCallback(async () => {
    if (!apiKey || appState === 'scanning') return;

    const dataUrl = captureFrame();
    if (!dataUrl) return;

    setCapturedImageUrl(dataUrl);
    setAppState('scanning');
    setErrorMessage('');

    if ('vibrate' in navigator) navigator.vibrate([50, 30, 50]);

    try {
      const base64 = dataUrl.split(',')[1];
      const result = await analyzeWithVision(base64);
      setAnalysis(result);
      setAppState('results');

      if ('vibrate' in navigator) navigator.vibrate(100);
      setShowXpAnimation(true);
      setTimeout(() => setShowXpAnimation(false), 1500);
      checkAndUnlockAchievements(result);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
      setAppState('error');
    }
  }, [apiKey, appState, captureFrame, analyzeWithVision, checkAndUnlockAchievements]);

  const handleScanAgain = useCallback(() => {
    setAppState('idle');
    setAnalysis(null);
    setCapturedImageUrl(null);
    setNewlyUnlocked(null);
    setShowXpAnimation(false);
    setErrorMessage('');
    // Restart camera if stream was lost
    if (!streamRef.current?.active) {
      startCamera();
    }
  }, [startCamera]);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-gradient-to-b from-green-950 to-slate-900 rounded-2xl overflow-hidden -m-5 md:-m-8 p-5 md:p-8 space-y-5 min-h-[500px]">
      <style>{CUSTOM_STYLES}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-green-300 flex items-center gap-2">
            🌿 Plant Health Detector
          </h1>
          <p className="text-green-600 text-xs mt-0.5">Powered by GPT-4o Vision</p>
        </div>
        {/* Achievement row */}
        <div className="flex gap-1.5">
          {ACHIEVEMENTS.map((ach) => (
            <span
              key={ach.id}
              title={ach.label}
              className={`text-xl transition-all duration-500 ${
                unlockedAchievements.includes(ach.id)
                  ? 'opacity-100 drop-shadow-[0_0_6px_rgba(74,222,128,0.6)]'
                  : 'opacity-20 grayscale'
              }`}
              style={unlockedAchievements.includes(ach.id) ? { animation: 'phd-float 2.5s ease-in-out infinite' } : {}}
            >
              {ach.emoji}
            </span>
          ))}
        </div>
      </div>

      {/* No API key */}
      {!apiKey && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="text-6xl" style={{ animation: 'phd-float 2s ease-in-out infinite' }}>🔑</div>
          <h2 className="text-xl font-bold text-green-300">API Key Required</h2>
          <p className="text-green-500 text-sm max-w-xs leading-relaxed">
            This tool uses GPT-4o Vision to analyze your plant. Please set your OpenAI API key using the Settings button in the header.
          </p>
          <div className="flex items-center gap-2 text-green-600 text-xs bg-green-900/30 border border-green-800/40 px-4 py-2 rounded-full">
            <Settings className="h-3.5 w-3.5" />
            <span>Header → Settings ⚙</span>
          </div>
        </div>
      )}

      {/* Camera + Idle/Scanning */}
      {apiKey && appState !== 'results' && (
        <div className="space-y-4">
          {/* Camera viewport */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-72">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={() => setCameraReady(true)}
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Camera error */}
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 gap-3 p-6">
                <span className="text-5xl">📷</span>
                <p className="text-center text-red-300 text-sm">{cameraError}</p>
                <Button
                  size="sm"
                  onClick={startCamera}
                  className="bg-green-700 hover:bg-green-600 text-white"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Scanning overlay */}
            {appState === 'scanning' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 flex items-center justify-center">
                  {/* Pulse rings */}
                  <div
                    className="absolute w-44 h-44 rounded-full border-2 border-green-400"
                    style={{ animation: 'phd-pulseRing 1.2s ease-out infinite' }}
                  />
                  <div
                    className="absolute w-44 h-44 rounded-full border-2 border-green-400"
                    style={{ animation: 'phd-pulseRing 1.2s ease-out 0.4s infinite' }}
                  />
                  {/* Radar circle + sweep */}
                  <div className="w-44 h-44 rounded-full border border-green-500/60 relative overflow-hidden">
                    <div
                      className="absolute inset-0 origin-center"
                      style={{ animation: 'phd-radarSweep 1.5s linear infinite' }}
                    >
                      <div className="absolute top-0 left-1/2 h-1/2 w-px bg-gradient-to-b from-green-400 to-transparent origin-bottom" />
                    </div>
                  </div>
                  <p
                    className="absolute text-green-300 text-sm font-bold"
                    style={{ marginTop: '132px' }}
                  >
                    Analyzing...
                  </p>
                </div>
              </div>
            )}

            {/* Idle corner decorators */}
            {appState === 'idle' && cameraReady && !cameraError && (
              <>
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-green-400 rounded-tl-sm" />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-green-400 rounded-tr-sm" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-green-400 rounded-bl-sm" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-green-400 rounded-br-sm" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-green-400 text-xs px-3 py-1 rounded-full whitespace-nowrap">
                  Point at your plant 🌿
                </div>
              </>
            )}
          </div>

          {/* Scan button */}
          <Button
            onClick={handleScan}
            disabled={appState === 'scanning' || !cameraReady || !!cameraError}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white rounded-xl shadow-lg shadow-green-950/60 disabled:opacity-50 transition-all"
          >
            {appState === 'scanning' ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin text-xl">🌀</span> Scanning...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                🔬 Scan Plant
              </span>
            )}
          </Button>

          {/* Error */}
          {appState === 'error' && (
            <div className="flex items-start gap-2 rounded-xl bg-red-900/30 border border-red-700/40 p-4">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-semibold text-sm">Scan Failed</p>
                <p className="text-red-400 text-xs mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {apiKey && appState === 'results' && analysis && (
        <div className="space-y-5">

          {/* Captured image with overlays */}
          <div className="relative rounded-2xl overflow-hidden aspect-video max-h-64 bg-black">
            {capturedImageUrl && (
              <img src={capturedImageUrl} alt="Scanned plant" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0">
              <IssueOverlay issues={analysis.issues} />
            </div>
          </div>

          {/* Plant name + XP */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-green-200">{analysis.plantName}</h2>
              <p className="text-green-600 text-xs">
                {analysis.issues.length > 0
                  ? `${analysis.issues.length} issue${analysis.issues.length !== 1 ? 's' : ''} detected`
                  : 'No issues detected!'}
              </p>
            </div>
            <div
              className={`text-3xl font-black tabular-nums ${getScoreColor(analysis.healthScore)}`}
              style={showXpAnimation ? { animation: 'phd-xpCount 0.7s cubic-bezier(0.175,0.885,0.32,1.275) forwards' } : {}}
            >
              {analysis.healthScore} XP
            </div>
          </div>

          {/* Health bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-400 font-semibold">Plant Health</span>
              <span className={`font-bold ${getScoreColor(analysis.healthScore)}`}>
                {analysis.healthScore}/100
              </span>
            </div>
            <div className="relative h-4 w-full rounded-full bg-green-950 overflow-hidden border border-green-800/50">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(analysis.healthScore)}`}
                style={{ width: `${analysis.healthScore}%` }}
              />
              {/* Shimmer */}
              <div
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ animation: 'phd-shimmer 2s ease-in-out infinite' }}
              />
            </div>
          </div>

          {/* Status badge */}
          <div
            className={`flex items-center gap-4 p-4 rounded-2xl border ${STATUS_CONFIG[analysis.status].bg} ${STATUS_CONFIG[analysis.status].border}`}
          >
            <span
              className="text-5xl flex-shrink-0"
              style={{ animation: 'phd-badgeBounce 0.6s cubic-bezier(0.68,-0.55,0.265,1.55) forwards' }}
            >
              {STATUS_CONFIG[analysis.status].emoji}
            </span>
            <div>
              <p className={`text-xl font-black ${STATUS_CONFIG[analysis.status].color}`}>
                {STATUS_CONFIG[analysis.status].label}
              </p>
              {analysis.issues.length > 0 && (
                <p className="text-green-400 text-xs mt-0.5 leading-relaxed">
                  {analysis.issues.join(' · ')}
                </p>
              )}
            </div>
          </div>

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-green-300 font-bold text-xs uppercase tracking-wider">🎯 Action Plan</h3>
              <div className="space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <SuggestionCard key={i} suggestion={s} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Growth prediction */}
          <div className="rounded-xl bg-emerald-900/30 border border-emerald-700/30 p-4">
            <p className="text-emerald-400 font-bold text-xs uppercase tracking-wide mb-1.5">🚀 Growth Prediction</p>
            <p
              className="text-emerald-200 text-sm leading-relaxed"
              style={{ animation: 'phd-textReveal 0.7s ease-out 0.2s both' }}
            >
              {analysis.growthPrediction}
            </p>
          </div>

          {/* Fun fact speech bubble */}
          <div className="relative flex items-start gap-3">
            <span
              className="text-4xl flex-shrink-0 mt-1"
              style={{ animation: 'phd-float 3s ease-in-out infinite' }}
            >
              🌵
            </span>
            <div className="flex-1 rounded-2xl bg-green-900/40 border border-green-700/30 p-4">
              <p className="text-green-400 font-bold text-xs uppercase tracking-wide mb-1">💬 Fun Fact</p>
              <p
                className="text-green-200 text-sm italic leading-relaxed"
                style={{ animation: 'phd-textReveal 0.7s ease-out 0.4s both' }}
              >
                {analysis.funFact}
              </p>
            </div>
          </div>

          {/* Newly unlocked achievement banner */}
          {newlyUnlocked && (
            <div
              className="flex items-center gap-3 p-4 rounded-xl bg-yellow-900/40 border border-yellow-600/40"
              style={{ animation: 'phd-badgeBounce 0.5s ease-out forwards' }}
            >
              <span className="text-3xl animate-bounce">{newlyUnlocked.emoji}</span>
              <div>
                <p className="text-yellow-300 font-bold text-sm">Achievement Unlocked!</p>
                <p className="text-yellow-400 text-xs">{newlyUnlocked.label} — {newlyUnlocked.description}</p>
              </div>
            </div>
          )}

          {/* Unlocked achievements pills */}
          {unlockedAchievements.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ACHIEVEMENTS.filter((a) => unlockedAchievements.includes(a.id)).map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-800/40 border border-green-600/30 text-xs text-green-300"
                >
                  <span>{ach.emoji}</span>
                  <span>{ach.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Scan again */}
          <Button
            onClick={handleScanAgain}
            className="w-full h-12 bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-600 hover:to-emerald-500 text-white font-bold rounded-xl transition-all"
          >
            🔄 Scan Again
          </Button>
        </div>
      )}
    </div>
  );
};
