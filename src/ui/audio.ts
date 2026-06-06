/**
 * 纯代码合成的音频（Web Audio API），无需任何音频素材文件。
 * - playAttack(mult)：技能命中音效，按相克倍率变化音色
 * - playSelect()：按键/选择提示音
 * - startBgm()/stopBgm()：循环背景音（轻量琶音 + 低频铺底）
 * - toggleMute()/getMuted()：静音开关
 * 浏览器自动播放策略要求首次声音必须在用户手势中触发，故 AudioContext 懒创建。
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bgmGain: GainNode | null = null;
let bgmTimer: number | null = null;
let droneOsc: OscillatorNode | null = null;
let muted = false;
let step = 0;

const BGM_VOL = 0.16;
const MASTER_VOL = 0.6;
// A 小调五声音阶，循环出一段平静的战斗铺底
const SCALE = [220, 261.63, 293.66, 329.63, 392, 329.63, 293.66, 261.63];

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : MASTER_VOL;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** 一个带 ADSR 包络的简单音符 */
function tone(freq: number, dur: number, type: OscillatorType, vol: number, dest: AudioNode, when = 0) {
  const c = ctx;
  if (!c) return;
  const t = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(dest);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** 技能命中：白噪冲击 + 下滑方波，相克越强音色越亮、越重 */
export function playAttack(mult: number) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime;
  const strong = mult >= 2;
  const weak = mult <= 0.5;

  // 噪声冲击
  const len = Math.floor(c.sampleRate * 0.2);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filt = c.createBiquadFilter();
  filt.type = "bandpass";
  filt.frequency.value = strong ? 2000 : weak ? 500 : 1100;
  const ng = c.createGain();
  ng.gain.setValueAtTime(strong ? 0.6 : 0.4, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  src.connect(filt);
  filt.connect(ng);
  ng.connect(master);
  src.start(t);
  src.stop(t + 0.22);

  // 下滑音
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = strong ? "sawtooth" : "square";
  osc.frequency.setValueAtTime(strong ? 520 : 300, t);
  osc.frequency.exponentialRampToValueAtTime(strong ? 90 : 70, t + 0.2);
  g.gain.setValueAtTime(0.3, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
  osc.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + 0.26);

  if (strong) tone(880, 0.18, "triangle", 0.2, master, 0.04); // 拔群高光
}

/** 按键 / 选择提示音 */
export function playSelect() {
  const c = ac();
  if (!c || !master) return;
  tone(660, 0.09, "triangle", 0.18, master);
  tone(990, 0.07, "triangle", 0.12, master, 0.03);
}

/** 胜负提示 */
export function playResult(win: boolean) {
  const c = ac();
  if (!c || !master) return;
  const notes = win ? [392, 523.25, 659.25, 783.99] : [392, 329.63, 261.63, 196];
  notes.forEach((f, i) => tone(f, 0.3, "triangle", 0.22, master!, i * 0.12));
}

/** 启动循环背景音（轻量琶音 + 低频铺底） */
export function startBgm() {
  const c = ac();
  if (!c || !master || bgmTimer !== null) return;

  bgmGain = c.createGain();
  bgmGain.gain.value = BGM_VOL;
  bgmGain.connect(master);

  // 低频铺底
  droneOsc = c.createOscillator();
  droneOsc.type = "sine";
  droneOsc.frequency.value = 110;
  const dg = c.createGain();
  dg.gain.value = 0.5;
  droneOsc.connect(dg);
  dg.connect(bgmGain);
  droneOsc.start();

  step = 0;
  bgmTimer = window.setInterval(() => {
    if (!ctx || !bgmGain) return;
    const f = SCALE[step % SCALE.length];
    step++;
    tone(f, 0.5, "triangle", 0.5, bgmGain, 0);
    if (step % 4 === 0) tone(f * 2, 0.35, "sine", 0.25, bgmGain, 0.12);
  }, 430);
}

export function stopBgm() {
  if (bgmTimer !== null) {
    clearInterval(bgmTimer);
    bgmTimer = null;
  }
  try {
    droneOsc?.stop();
  } catch {
    /* 已停止 */
  }
  droneOsc = null;
  bgmGain = null;
}

/** 切换静音，返回切换后的状态 */
export function toggleMute(): boolean {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : MASTER_VOL;
  return muted;
}

export function getMuted(): boolean {
  return muted;
}
