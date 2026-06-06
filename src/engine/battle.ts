import type { BattleState, Card, Combatant, ElementType, HitResult, Side, Skill } from "./types";
import { CARD_POOL } from "./cards";
import { effectiveness } from "./typeChart";

/** 伤害公式：基础威力 × 相克倍率,取整。无随机 —— 同样输入永远同样输出。 */
export function calcDamage(skill: Skill, defenderType: ElementType): { damage: number; mult: number } {
  const mult = effectiveness(skill.type, defenderType);
  return { damage: Math.round(skill.power * mult), mult };
}

/** 从卡池抽 n 张不重复的牌。rng 可注入,便于测试与(未来)服务端用固定种子复现。 */
export function drawHand(n: number, rng: () => number = Math.random): Card[] {
  const pool = CARD_POOL.map((c) => ({ ...c }));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(n, pool.length));
}

export function toCombatant(card: Card, idx: number): Combatant {
  return { ...card, uid: `${card.id}_${idx}`, curHp: card.maxHp };
}

export function firstAlive(team: Combatant[]): number {
  return team.findIndex((m) => m.curHp > 0);
}

export function createBattle(playerTeam: Combatant[], aiTeam: Combatant[]): BattleState {
  return {
    playerTeam,
    aiTeam,
    playerActive: 0,
    aiActive: 0,
    log: ["对战开始！"],
    lastHit: null,
    winner: null,
  };
}

const effText = (m: number) => (m >= 2 ? "（效果拔群！）" : m <= 0.5 ? "（效果不太好…）" : "");

/**
 * 结算一次出招。纯函数：返回全新的 BattleState,绝不修改入参。
 * side = 攻击方。skill = 本次使用的技能（AI 的技能由 ai.ts 选好后传入）。
 */
export function applyTurn(state: BattleState, side: Side, skill: Skill): BattleState {
  const isPlayer = side === "player";
  const atkTeam = isPlayer ? state.playerTeam : state.aiTeam;
  const atkIdx = isPlayer ? state.playerActive : state.aiActive;
  const defIdx = isPlayer ? state.aiActive : state.playerActive;
  const attacker = atkTeam[atkIdx];

  // 克隆防守方队伍后再改血量,保证不可变
  const defTeam = (isPlayer ? state.aiTeam : state.playerTeam).map((c) => ({ ...c }));
  const defender = defTeam[defIdx];
  const { damage, mult } = calcDamage(skill, defender.type);
  defender.curHp = Math.max(0, defender.curHp - damage);
  const fainted = defender.curHp <= 0;

  const who = isPlayer ? "你方" : "对方";
  const newLog = [...state.log, `${who} ${attacker.name} 使用 ${skill.name}，造成 ${damage} 点伤害${effText(mult)}`];
  if (fainted) newLog.push(`${defender.name} 倒下了！`);

  const hit: HitResult = { side, attackerName: attacker.name, skill, damage, mult, fainted };

  const next: BattleState = {
    ...state,
    [isPlayer ? "aiTeam" : "playerTeam"]: defTeam,
    log: newLog.slice(-8),
    lastHit: hit,
  };

  if (fainted) {
    const nextAlive = firstAlive(defTeam);
    if (nextAlive === -1) {
      next.winner = side; // 对方全员倒下,攻击方胜
    } else if (isPlayer) {
      next.aiActive = nextAlive;
    } else {
      next.playerActive = nextAlive;
    }
  }
  return next;
}
