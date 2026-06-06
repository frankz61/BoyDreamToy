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

export function TypeBadge({ type }: { type: ElementType }) {
  return (
    <span style={{ background: TYPE_META[type].color, color: "#fff", borderRadius: 6, padding: "1px 8px", fontSize: 12, fontWeight: 700 }}>
      {type}
    </span>
  );
}

export function HpBar({ cur, max }: { cur: number; max: number }) {
  const ratio = Math.max(0, cur) / max;
  const color = ratio > 0.5 ? "#22c55e" : ratio > 0.25 ? "#eab308" : "#ef4444";
  return (
    <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 999, height: 8, overflow: "hidden" }}>
      <div style={{ width: `${ratio * 100}%`, height: "100%", background: color, transition: "width 0.5s" }} />
    </div>
  );
}

export function MonChip({ mon, active, fx }: { mon: Combatant; active: boolean; fx?: Fx }) {
  const dead = mon.curHp <= 0;
  const anim = fx === "attack" ? "fxAttack 0.55s ease" : fx === "hurt" ? "fxHurt 0.5s ease" : undefined;
  return (
    <div
      style={{
        opacity: dead ? 0.4 : 1,
        borderRadius: 12,
        padding: 8,
        background: active ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.04)",
        border: active ? `2px solid ${TYPE_META[mon.type].glow}` : "2px solid transparent",
        boxShadow: active ? `0 0 18px ${TYPE_META[mon.type].glow}55` : "none",
        transition: "border 0.3s, box-shadow 0.3s, opacity 0.3s",
        minWidth: 0,
        animation: anim,
      }}
    >
      {/* 卡面图片展示 */}
      <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "3 / 4", marginBottom: 6, background: "rgba(0,0,0,0.35)" }}>
        <img
          src={mon.image}
          alt={mon.name}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: dead ? "grayscale(1) brightness(0.6)" : "none" }}
        />
        {fx === "hurt" && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(255,70,70,0.55)", mixBlendMode: "screen", animation: "fxFlash 0.45s ease forwards", pointerEvents: "none" }} />
        )}
        {dead && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fca5a5", fontWeight: 900, fontSize: 13, letterSpacing: 2 }}>
            倒下
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 6 }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{mon.name}</span>
        <TypeBadge type={mon.type} />
      </div>
      <HpBar cur={mon.curHp} max={mon.maxHp} />
      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 4 }}>
        {Math.max(0, mon.curHp)} / {mon.maxHp}
      </div>
    </div>
  );
}
