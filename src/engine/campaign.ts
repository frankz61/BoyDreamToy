import type { Card, Combatant, StageConfig } from "./types";
import { drawHand, toCombatant } from "./battle";
import { aiSelectTeam } from "./ai";

/**
 * 按关卡配置生成敌方队伍：抽牌 -> 选队 -> 按 hpScale / powerScale 缩放。
 * 难度全部来自 StageConfig 这条纯数据。
 */
export function buildStageTeam(stage: StageConfig, rng: () => number = Math.random): Combatant[] {
  const hand = drawHand(10, rng);
  const picked = aiSelectTeam(hand, stage.teamSize);
  return picked.map((c, i) => {
    const scaled: Card = {
      ...c,
      maxHp: Math.round(c.maxHp * stage.hpScale),
      skills: c.skills.map((s) => ({ ...s, power: Math.round(s.power * stage.powerScale) })),
    };
    return toCombatant(scaled, i + 100);
  });
}
