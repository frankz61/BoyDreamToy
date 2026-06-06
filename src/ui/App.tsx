import { useState } from "react";
import { Swords, RotateCcw, ChevronRight, Trophy, Volume2, VolumeX } from "lucide-react";
import {
  STAGES,
  drawHand,
  toCombatant,
  createBattle,
  applyTurn,
  buildStageTeam,
  aiChooseSkill,
  randomSkill,
  calcDamage,
} from "../engine";
import type { BattleState, Card, Skill } from "../engine";
import { TYPE_META, TypeBadge, ArenaMon, Bench, type Fx } from "./components";
import { startBgm, stopBgm, playAttack, playSelect, playResult, toggleMute, getMuted } from "./audio";

type Screen = "home" | "select" | "battle" | "stageWin" | "gameWin" | "gameOver";

const effLabel = (m: number) => (m >= 2 ? "效果拔群！" : m <= 0.5 ? "效果不太好…" : "");

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [stageIdx, setStageIdx] = useState(0);
  const [hand, setHand] = useState<Card[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [match, setMatch] = useState<BattleState | null>(null);
  const [busy, setBusy] = useState(false);
  const [fxKey, setFxKey] = useState(0); // 每次出招自增，用于重放出击/受击动画
  const [muted, setMuted] = useState(getMuted());

  const stage = STAGES[stageIdx];

  /** 根据最近一次命中，判断某只精灵当前该播放的特效 */
  const fxFor = (side: "player" | "ai", idx: number): Fx => {
    if (!match || !match.lastHit) return undefined;
    const atkSide = match.lastHit.side;
    const defSide = atkSide === "player" ? "ai" : "player";
    const atkIdx = atkSide === "player" ? match.playerActive : match.aiActive;
    const defIdx = defSide === "player" ? match.playerActive : match.aiActive;
    if (side === atkSide && idx === atkIdx) return "attack";
    if (side === defSide && idx === defIdx) return "hurt";
    return undefined;
  };

  const startCampaign = () => {
    setStageIdx(0);
    goSelect(0);
  };

  const goSelect = (idx: number) => {
    setHand(drawHand(10));
    setPicked([]);
    setStageIdx(idx);
    setScreen("select");
  };

  const togglePick = (i: number) => {
    playSelect();
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : p.length < stage.teamSize ? [...p, i] : p));
  };

  const confirm = () => {
    const playerTeam = picked.map((i) => toCombatant(hand[i], i));
    const aiTeam = buildStageTeam(STAGES[stageIdx]);
    setMatch(createBattle(playerTeam, aiTeam));
    setBusy(false);
    setFxKey(0);
    setScreen("battle");
    startBgm(); // 进入战斗（用户手势内）启动背景音
  };

  const playerAttack = (skill: Skill) => {
    if (!match || busy || match.winner) return;
    playSelect();
    const afterPlayer = applyTurn(match, "player", skill);
    setMatch(afterPlayer);
    setFxKey((k) => k + 1);
    if (afterPlayer.lastHit) playAttack(afterPlayer.lastHit.mult);

    if (afterPlayer.winner === "player") {
      setBusy(true);
      setTimeout(() => endBattle("player"), 800);
      return;
    }

    setBusy(true);
    setTimeout(() => {
      const aiMon = afterPlayer.aiTeam[afterPlayer.aiActive];
      const target = afterPlayer.playerTeam[afterPlayer.playerActive];
      const aiSkill = stage.aiSmart ? aiChooseSkill(aiMon, target.type) : randomSkill(aiMon);
      const afterAi = applyTurn(afterPlayer, "ai", aiSkill);
      setMatch(afterAi);
      setFxKey((k) => k + 1);
      if (afterAi.lastHit) playAttack(afterAi.lastHit.mult);
      if (afterAi.winner === "ai") {
        setTimeout(() => endBattle("ai"), 800);
      } else {
        setBusy(false);
      }
    }, 900);
  };

  const endBattle = (winner: "player" | "ai") => {
    if (winner === "ai") {
      playResult(false);
      stopBgm();
      return setScreen("gameOver");
    }
    playResult(true);
    if (stageIdx >= STAGES.length - 1) {
      stopBgm();
      return setScreen("gameWin");
    }
    setScreen("stageWin"); // 关与关之间 BGM 继续
  };

  const reset = () => {
    stopBgm();
    setMatch(null);
    setScreen("home");
  };

  const onMute = () => setMuted(toggleMute());

  return (
    <div
      style={{
        minHeight: 560,
        background: "radial-gradient(1200px 500px at 50% -10%, #1e293b 0%, #0f172a 55%, #020617 100%)",
        borderRadius: 16,
        padding: "clamp(12px, 3vw, 20px)",
      }}
    >
      {/* 顶栏 + 关卡进度 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Swords size={22} color="#38bdf8" />
          <span style={{ fontWeight: 800, fontSize: "clamp(16px, 4.2vw, 20px)", letterSpacing: 1 }}>属性对决 · 闯关</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onMute} title={muted ? "开启声音" : "静音"} style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.08)", border: "none", color: "#cbd5e1", borderRadius: 8, padding: "8px 10px", cursor: "pointer" }}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          {screen !== "home" && (
            <button onClick={reset} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "none", color: "#cbd5e1", borderRadius: 8, padding: "8px 14px", fontSize: 14, cursor: "pointer" }}>
              <RotateCcw size={14} /> 退出
            </button>
          )}
        </div>
      </div>
      {screen !== "home" && (
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {STAGES.map((s, i) => (
            <div key={s.id} style={{ flex: 1, height: 5, borderRadius: 2, background: i < stageIdx ? "#4ade80" : i === stageIdx ? "#38bdf8" : "rgba(255,255,255,0.12)" }} />
          ))}
        </div>
      )}

      {/* 首页 */}
      {screen === "home" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "56px 0", gap: 18 }}>
          <div style={{ fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 800 }}>连续挑战 {STAGES.length} 关 AI</div>
          <div style={{ color: "rgba(226,232,240,0.75)", maxWidth: 440, lineHeight: 1.8, fontSize: 16 }}>
            每关随机抽 10 张、选 3 只出战。难度逐关递增，失败即结束。注意属性相克——打中克制造成双倍伤害。
          </div>
          <button onClick={startCampaign} style={{ display: "flex", alignItems: "center", gap: 8, background: "#38bdf8", color: "#04263a", border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 18, fontWeight: 800, cursor: "pointer" }}>
            开始闯关 <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* 选牌 */}
      {screen === "select" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 17 }}>第 {stage.id} 关 · {stage.name} — 选 {stage.teamSize} 只</span>
            <span style={{ color: "#38bdf8", fontWeight: 800, fontSize: 16 }}>已选 {picked.length} / {stage.teamSize}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
            {hand.map((c, i) => {
              const sel = picked.includes(i);
              return (
                <button key={i} onClick={() => togglePick(i)} style={{ textAlign: "left", cursor: "pointer", borderRadius: 12, padding: 10, background: sel ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.05)", border: sel ? "2px solid #38bdf8" : "2px solid rgba(255,255,255,0.08)", color: "#e2e8f0", transition: "all 0.2s" }}>
                  <div style={{ aspectRatio: "3 / 4", borderRadius: 8, overflow: "hidden", marginBottom: 8, background: "rgba(0,0,0,0.3)" }}>
                    <img src={c.image} alt={c.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 16 }}>{c.name}</span>
                    <TypeBadge type={c.type} />
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(226,232,240,0.7)", marginBottom: 6 }}>HP {c.maxHp}</div>
                  {c.skills.map((s, k) => (
                    <div key={k} style={{ fontSize: 13, color: "rgba(226,232,240,0.85)" }}>
                      · {s.name} <span style={{ color: TYPE_META[s.type].glow }}>({s.type}{s.power})</span>
                    </div>
                  ))}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
            <button onClick={confirm} disabled={picked.length !== stage.teamSize} style={{ display: "flex", alignItems: "center", gap: 8, border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 18, fontWeight: 800, cursor: picked.length === stage.teamSize ? "pointer" : "not-allowed", background: picked.length === stage.teamSize ? "#38bdf8" : "rgba(255,255,255,0.1)", color: picked.length === stage.teamSize ? "#04263a" : "rgba(226,232,240,0.4)" }}>
              确认出战 <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* 对战 · 擂台 */}
      {screen === "battle" && match && (() => {
        const aiMon = match.aiTeam[match.aiActive];
        const myMon = match.playerTeam[match.playerActive];
        return (
          <div className="battle" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* 对手备战席 */}
            <Bench team={match.aiTeam} activeIdx={match.aiActive} label="对手备战席" />

            {/* 擂台：双方出战召唤兽对峙 */}
            <div
              style={{
                position: "relative",
                borderRadius: 16,
                padding: "14px 8px",
                background: "radial-gradient(120% 90% at 50% 0%, rgba(56,189,248,0.12), rgba(2,6,23,0)), linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.28))",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 6,
                overflow: "hidden",
              }}
            >
              <ArenaMon mon={aiMon} fx={fxFor("ai", match.aiActive)} facing="left" />
              {/* 中央 VS / 伤害爆点 */}
              <div style={{ position: "relative", width: 92, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", alignSelf: "stretch" }}>
                {match.lastHit ? (
                  <div key={fxKey} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <div style={{ position: "absolute", left: -220, right: -220, top: "50%", height: 8, marginTop: -4, background: `linear-gradient(90deg, transparent, ${match.lastHit.side === "player" ? "#fca5a5" : "#fcd34d"}, transparent)`, animation: "fxSlash 0.5s ease forwards", pointerEvents: "none" }} />
                    <div style={{ fontSize: 40, fontWeight: 900, color: match.lastHit.side === "player" ? "#fca5a5" : "#fcd34d", animation: "fxDmg 0.5s ease", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>-{match.lastHit.damage}</div>
                    {effLabel(match.lastHit.mult) && <div style={{ fontSize: 14, fontWeight: 800, textAlign: "center", color: match.lastHit.mult >= 2 ? "#4ade80" : "#94a3b8" }}>{effLabel(match.lastHit.mult)}</div>}
                  </div>
                ) : (
                  <div style={{ fontSize: 24, fontWeight: 900, color: "rgba(255,255,255,0.25)" }}>VS</div>
                )}
              </div>
              <ArenaMon mon={myMon} fx={fxFor("player", match.playerActive)} facing="right" />
            </div>

            {/* 我方备战席 */}
            <Bench team={match.playerTeam} activeIdx={match.playerActive} label="我方备战席" />

            {/* 技能按钮（大，便于操控与查看） */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
              {myMon.skills.map((s, k) => {
                const { damage, mult } = calcDamage(s, aiMon.type);
                return (
                  <button
                    key={k}
                    onClick={() => playerAttack(s)}
                    disabled={busy || !!match.winner}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: busy || match.winner ? "not-allowed" : "pointer",
                      opacity: busy || match.winner ? 0.5 : 1,
                      background: "rgba(255,255,255,0.06)",
                      border: `2px solid ${TYPE_META[s.type].color}`,
                      borderRadius: 14,
                      padding: "16px 18px",
                      color: "#e2e8f0",
                      transition: "all 0.15s",
                      minHeight: 66,
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <TypeBadge type={s.type} big />
                      <span style={{ fontWeight: 800, fontSize: 18 }}>{s.name}</span>
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: mult >= 2 ? "#4ade80" : mult <= 0.5 ? "#94a3b8" : "rgba(226,232,240,0.9)" }}>≈{damage}</span>
                  </button>
                );
              })}
            </div>

            {/* 战报（精简） */}
            <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: "10px 12px", fontSize: 14, color: "rgba(226,232,240,0.72)", lineHeight: 1.6, minHeight: 56 }}>
              {match.log.slice(-3).map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
        );
      })()}

      {/* 过关 */}
      {screen === "stageWin" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "48px 0", gap: 16 }}>
          <div style={{ fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 900, color: "#4ade80" }}>第 {stage.id} 关通过！</div>
          <div style={{ color: "rgba(226,232,240,0.75)", fontSize: 16 }}>下一关：{STAGES[stageIdx + 1].name}</div>
          <button onClick={() => goSelect(stageIdx + 1)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#38bdf8", color: "#04263a", border: "none", borderRadius: 12, padding: "14px 32px", fontWeight: 800, fontSize: 18, cursor: "pointer" }}>
            进入下一关 <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* 通关 */}
      {screen === "gameWin" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "48px 0", gap: 16 }}>
          <Trophy size={56} color="#facc15" />
          <div style={{ fontSize: "clamp(22px, 5.5vw, 28px)", fontWeight: 900, color: "#facc15" }}>恭喜通关全部 {STAGES.length} 关！</div>
          <button onClick={startCampaign} style={{ background: "#38bdf8", color: "#04263a", border: "none", borderRadius: 12, padding: "12px 28px", fontWeight: 800, fontSize: 17, cursor: "pointer" }}>再次挑战</button>
        </div>
      )}

      {/* 失败 */}
      {screen === "gameOver" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "48px 0", gap: 16 }}>
          <div style={{ fontSize: "clamp(22px, 5.5vw, 28px)", fontWeight: 900, color: "#fca5a5" }}>在第 {stage.id} 关失败了…</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => goSelect(stageIdx)} style={{ background: "#38bdf8", color: "#04263a", border: "none", borderRadius: 12, padding: "12px 28px", fontWeight: 800, fontSize: 17, cursor: "pointer" }}>重打本关</button>
            <button onClick={startCampaign} style={{ background: "rgba(255,255,255,0.1)", color: "#e2e8f0", border: "none", borderRadius: 12, padding: "12px 28px", fontWeight: 800, fontSize: 17, cursor: "pointer" }}>从头开始</button>
          </div>
        </div>
      )}
    </div>
  );
}
