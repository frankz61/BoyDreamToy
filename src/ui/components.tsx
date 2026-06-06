import type { Combatant, ElementType } from "../engine";

export const TYPE_META: Record<ElementType, { color: string; glow: string }> = {
  火: { color: "#f97316", glow: "#fb923c" },
  水: { color: "#3b82f6", glow: "#60a5fa" },
  草: { color: "#22c55e", glow: "#4ade80" },
  电: { color: "#eab308", glow: "#facc15" },
  地: { color: "#b45309", glow: "#d97706" },
  风: { color: "#06b6d4", glow: "#22d3ee" },
};

/** 出击特效：attack=本方出招上扑，hurt=对方受击抖动+红闪 */
export type Fx = "attack" | "hurt" | undefined;

function hpColor(ratio: number) {
  return ratio > 0.5 ? "#22c55e" : ratio > 0.25 ? "#eab308" : "#ef4444";
}

export function TypeBadge({ type, big }: { type: ElementType; big?: boolean }) {
  return (
    <span style={{ background: TYPE_META[type].color, color: "#fff", borderRadius: 6, padding: big ? "2px 12px" : "1px 9px", fontSize: big ? 16 : 13, fontWeight: 800 }}>
      {type}
    </span>
  );
}

export function HpBar({ cur, max, height = 10 }: { cur: number; max: number; height?: number }) {
  const ratio = Math.max(0, cur) / max;
  return (
    <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 999, height, overflow: "hidden" }}>
      <div style={{ width: `${ratio * 100}%`, height: "100%", background: hpColor(ratio), transition: "width 0.5s" }} />
    </div>
  );
}

/** 擂台上的出战召唤兽（大图展示 + 出击/受击特效）。facing 决定卡面朝向。 */
export function ArenaMon({ mon, fx, facing }: { mon: Combatant; fx?: Fx; facing: "left" | "right" }) {
  const dead = mon.curHp <= 0;
  const anim = fx === "attack" ? "fxAttack 0.55s ease" : fx === "hurt" ? "fxHurt 0.5s ease" : undefined;
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, animation: anim }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 190,
          maxHeight: "40vh",
          aspectRatio: "3 / 4",
          borderRadius: 14,
          overflow: "hidden",
          border: `3px solid ${TYPE_META[mon.type].glow}`,
          boxShadow: `0 0 26px ${TYPE_META[mon.type].glow}66`,
          background: "rgba(0,0,0,0.4)",
        }}
      >
        <img
          src={mon.image}
          alt={mon.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: facing === "left" ? "scaleX(-1)" : "none", filter: dead ? "grayscale(1) brightness(0.5)" : "none" }}
        />
        {fx === "hurt" && <div style={{ position: "absolute", inset: 0, background: "rgba(255,70,70,0.55)", mixBlendMode: "screen", animation: "fxFlash 0.45s ease forwards", pointerEvents: "none" }} />}
        {dead && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fca5a5", fontWeight: 900, fontSize: 18, letterSpacing: 3 }}>倒下</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, maxWidth: "100%" }}>
        <span style={{ fontWeight: 800, fontSize: 20, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{mon.name}</span>
        <TypeBadge type={mon.type} big />
      </div>
      <div style={{ width: "100%", maxWidth: 210 }}>
        <HpBar cur={mon.curHp} max={mon.maxHp} height={12} />
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.85)", fontSize: 15, marginTop: 4, fontWeight: 800 }}>{Math.max(0, mon.curHp)} / {mon.maxHp}</div>
      </div>
    </div>
  );
}

/** 备战席：展示该队伍中未出战的召唤兽（缩小显示，含迷你血条 / 阵亡标记） */
export function Bench({ team, activeIdx, label }: { team: Combatant[]; activeIdx: number; label: string }) {
  const reserves = team.map((m, i) => ({ m, i })).filter(({ i }) => i !== activeIdx);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 13, color: "rgba(226,232,240,0.55)", whiteSpace: "nowrap", fontWeight: 600 }}>{label}</span>
      <div style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap" }}>
        {reserves.length === 0 && <span style={{ fontSize: 12, color: "rgba(226,232,240,0.3)" }}>—</span>}
        {reserves.map(({ m }) => {
          const dead = m.curHp <= 0;
          const ratio = Math.max(0, m.curHp) / m.maxHp;
          return (
            <div key={m.uid} title={`${m.name} ${Math.max(0, m.curHp)}/${m.maxHp}`} style={{ position: "relative", width: 50, height: 50, borderRadius: 9, overflow: "hidden", border: `1.5px solid ${TYPE_META[m.type].color}`, opacity: dead ? 0.45 : 1, flexShrink: 0 }}>
              <img src={m.image} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: dead ? "grayscale(1)" : "none" }} />
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 4, background: "rgba(0,0,0,0.55)" }}>
                <div style={{ height: "100%", width: `${ratio * 100}%`, background: hpColor(ratio) }} />
              </div>
              {dead && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fca5a5", fontSize: 16, fontWeight: 900 }}>✕</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
