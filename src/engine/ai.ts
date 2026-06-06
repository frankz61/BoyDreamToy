import type { Card, Combatant, ElementType, Skill } from "./types";
import { calcDamage } from "./battle";

/** 贪心：选对当前对手期望伤害最高的技能 */
export function aiChooseSkill(attacker: Combatant, defenderType: ElementType): Skill {
  return attacker.skills.reduce((best, s) =>
    calcDamage(s, defenderType).damage > calcDamage(best, defenderType).damage ? s : best
  );
}

/** 随机出招（给低难度关卡用） */
export function randomSkill(attacker: Combatant, rng: () => number = Math.random): Skill {
  return attacker.skills[Math.floor(rng() * attacker.skills.length)];
}

/** 选队启发式：挑血量最高的若干只。想让 AI 更聪明就改这里。 */
export function aiSelectTeam(hand: Card[], size: number): Card[] {
  return [...hand].sort((a, b) => b.maxHp - a.maxHp).slice(0, size);
}
