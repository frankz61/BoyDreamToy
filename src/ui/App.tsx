import { useState } from "react";
import { Swords, RotateCcw, ChevronRight, Trophy } from "lucide-react";
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
import { TYPE_META, TypeBadge, HpBar, MonChip } from "./components";

type Screen = "home" | "select" | "battle" | "stageWin" | "gameWin" | "gameOver";

const effLabel = (m: number) => (m >= 2 ? "效果拔群！" : m <= 0.5 ? "效果不太好…" : "");

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [stageIdx, setStageIdx] = useState(0);
  const [hand, setHand] = useState<Card[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [match, setMatch] = useState<BattleState | null>(null);
  const [busy, setBusy] = useState(false);

  const stage = STAGES[stageIdx];

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

  const togglePick = (i: number) =>
    setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : p.length < stage.teamSize ? [...p, i] : p));

  const confirm = () => {
    const playerTeam = picked.map((i) => toCombatant(hand[i], i));
    const aiTeam = buildStageTeam(STAGES[stageIdx]);
    setMatch(createBattle(playerTeam, aiTeam));
    setBusy(false);
    setScreen("battle");
  };

  const playerAttack = (skill: Skill) => {
    if (!match || busy || match.winner) return;
    const afterPlayer = applyTurn(match, "player", skill);
    setMatch(afterPlayer);

    if (afterPlayer.winner === "player") {
      setBusy(true);
      setTimeout(() => endBattle("player"), 700);
      return;
    }

    setBusy(true);
    setTimeout(() => {
      const aiMon = afterPlayer.aiTeam[afterPlayer.aiActive];
      const target = afterPlayer.playerTeam[afterPlayer.playerActive];
      const aiSkill = stage.aiSmart ? aiChooseSkill(aiMon, target.type) : randomSkill(aiMon);
      const afterAi = applyTurn(afterPlayer, "ai", aiSkill);
      setMatch(afterAi);
      if (afterAi.winner === "ai") {
        setTimeout(() => endBattle("ai"), 700);
      } else {
        setBusy(false);
      }
    }, 900);
  };

  const endBattle = (winner: "player" | "ai") => {
    if (winner === "ai") return setScreen("gameOver");
    if (stageIdx >= STAGES.length - 1) return setScreen("gameWin");
    setScreen("stageWin");
  };

  const reset = () => {
    setMatch(null);
    setScreen("home");
  };

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
          <Swords size={20} color="#38bdf8" />
          <span style={{ fontWeight: 800, fontSize: "clamp(15px, 4.2vw, 18px)", letterSpacing: 1 }}>属性对决 · 闯关</span>
        </div>
        {screen !== "home" && (
          <button onClick={reset} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "none", color: "#cbd5e1", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer" }}>
            <RotateCcw size={14} /> 退出
          </button>
        )}
      </div>
      {screen !== "home" && (
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {STAGES.map((s, i) => (
            <div key={s.id} style={{ flex: 1, height: 4, borderRadius: 2, background: i < stageIdx ? "#4ade80" : i === stageIdx ? "#38bdf8" : "rgba(255,255,255,0.12)" }} />
          ))}
        </div>
      )}

      {/* 首页 */}
      {screen === "home" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "56px 0", gap: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>连续挑战 {STAGES.length} 关 AI</div>
          <div style={{ color: "rgba(226,232,240,0.7)", maxWidth: 420, lineHeight: 1.7, fontSize: 14 }}>
            每关随机抽 10 张、选 3 只出战。难度逐关递增,失败即结束。注意属性相克——打中克制造成双倍伤害。
          </div>
          <button onClick={startCampaign} style={{ display: "flex", alignItems: "center", gap: 8, background: "#38bdf8", color: "#04263a", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
            开始闯关 <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* 选牌 */}
      {screen === "select" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontWeight: 700 }}>第 {stage.id} 关 · {stage.name} — 选 {stage.teamSize} 只</span>
            <span style={{ color: "#38bdf8", fontWeight: 700 }}>已选 {picked.length} / {stage.teamSize}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(116px, 1fr))", gap: 10 }}>
            {hand.map((c, i) => {
              const sel = picked.includes(i);
              return (
                <button key={i} onClick={() => togglePick(i)} style={{ textAlign: "left", cursor: "pointer", borderRadius: 12, padding: 12, background: sel ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.05)", border: sel ? "2px solid #38bdf8" : "2px solid rgba(255,255,255,0.08)", color: "#e2e8f0", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</span>
                    <TypeBadge type={c.type} />
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(226,232,240,0.65)", marginBottom: 6 }}>HP {c.maxHp}</div>
                  {c.skills.map((s, k) => (
                    <div key={k} style={{ fontSize: 11, color: "rgba(226,232,240,0.8)" }}>
                      · {s.name} <span style={{ color: TYPE_META[s.type].glow }}>({s.type}{s.power})</span>
                    </div>
                  ))}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
            <button onClick={confirm} disabled={picked.length !== stage.teamSize} style={{ display: "flex", alignItems: "center", gap: 8, border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 16, fontWeight: 800, cursor: picked.length === stage.teamSize ? "pointer" : "not-allowed", background: picked.length === stage.teamSize ? "#38bdf8" : "rgba(255,255,255,0.1)", color: picked.length === stage.teamSize ? "#04263a" : "rgba(226,232,240,0.4)" }}>
              确认出战 <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* 对战 */}
      {screen === "battle" && match && (
        <div>
          <div style={{ fontSize: 12, color: "rgba(226,232,240,0.55)", marginBottom: 6 }}>对手队伍</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
            {match.aiTeam.map((m, i) => <MonChip key={m.uid} mon={m} active={i === match.aiActive && m.curHp > 0} />)}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 70, gap: 4, marginBottom: 14 }}>
            {match.lastHit ? (
              <>
                <div style={{ fontSize: 26, fontWeight: 900, color: match.lastHit.side === "player" ? "#fca5a5" : "#fcd34d" }}>-{match.lastHit.damage}</div>
                {effLabel(match.lastHit.mult) && (
                  <div style={{ fontSize: 14, fontWeight: 800, color: match.lastHit.mult >= 2 ? "#4ade80" : "#94a3b8" }}>{effLabel(match.lastHit.mult)}</div>
                )}
              </>
            ) : (
              <div style={{ color: "rgba(226,232,240,0.4)", fontSize: 13 }}>选择一个技能出招</div>
            )}
          </div>

          <div style={{ fontSize: 12, color: "rgba(226,232,240,0.55)", marginBottom: 6 }}>你的队伍</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
            {match.playerTeam.map((m, i) => <MonChip key={m.uid} mon={m} active={i === match.playerActive && m.curHp > 0} />)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
            {match.playerTeam[match.playerActive].skills.map((s, k) => {
              const target = match.aiTeam[match.aiActive];
              const { damage, mult } = calcDamage(s, target.type);
              return (
                <button key={k} onClick={() => playerAttack(s)} disabled={busy || !!match.winner} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: busy || match.winner ? "not-allowed" : "pointer", opacity: busy || match.winner ? 0.5 : 1, background: "rgba(255,255,255,0.06)", border: `1px solid ${TYPE_META[s.type].color}`, borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", transition: "all 0.2s" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <TypeBadge type={s.type} />
                    <span style={{ fontWeight: 700 }}>{s.name}</span>
                  </span>
                  <span style={{ fontSize: 13, color: mult >= 2 ? "#4ade80" : mult <= 0.5 ? "#94a3b8" : "rgba(226,232,240,0.8)" }}>≈{damage}</span>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 14, background: "rgba(0,0,0,0.25)", borderRadius: 10, padding: 12, fontSize: 12, color: "rgba(226,232,240,0.7)", lineHeight: 1.7 }}>
            {match.log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      )}

      {/* 过关 */}
      {screen === "stageWin" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "48px 0", gap: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#4ade80" }}>第 {stage.id} 关通过！</div>
          <div style={{ color: "rgba(226,232,240,0.7)" }}>下一关：{STAGES[stageIdx + 1].name}</div>
          <button onClick={() => goSelect(stageIdx + 1)} style={{ display: "flex", alignItems: "center", gap: 8, background: "#38bdf8", color: "#04263a", border: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 800, cursor: "pointer" }}>
            进入下一关 <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* 通关 */}
      {screen === "gameWin" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "48px 0", gap: 14 }}>
          <Trophy size={48} color="#facc15" />
          <div style={{ fontSize: 24, fontWeight: 900, color: "#facc15" }}>恭喜通关全部 {STAGES.length} 关！</div>
          <button onClick={startCampaign} style={{ background: "#38bdf8", color: "#04263a", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 800, cursor: "pointer" }}>再次挑战</button>
        </div>
      )}

      {/* 失败 */}
      {screen === "gameOver" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "48px 0", gap: 14 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fca5a5" }}>在第 {stage.id} 关失败了…</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => goSelect(stageIdx)} style={{ background: "#38bdf8", color: "#04263a", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 800, cursor: "pointer" }}>重打本关</button>
            <button onClick={startCampaign} style={{ background: "rgba(255,255,255,0.1)", color: "#e2e8f0", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 800, cursor: "pointer" }}>从头开始</button>
          </div>
        </div>
      )}
    </div>
  );
}
