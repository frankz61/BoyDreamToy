import { describe, it, expect } from "vitest";
import { calcDamage, createBattle, applyTurn, toCombatant } from "../battle";
import { CARD_POOL } from "../cards";
import type { Skill } from "../types";

const fire = CARD_POOL.find((c) => c.type === "火")!;
const grass = CARD_POOL.find((c) => c.type === "草")!;

describe("calcDamage", () => {
  it("相克时伤害翻倍", () => {
    const fireSkill: Skill = { name: "测试火技", type: "火", power: 30 };
    const r = calcDamage(fireSkill, "草");
    expect(r.mult).toBe(2);
    expect(r.damage).toBe(60);
  });

  it("被克时伤害减半", () => {
    const fireSkill: Skill = { name: "测试火技", type: "火", power: 30 };
    expect(calcDamage(fireSkill, "水").damage).toBe(15);
  });
});

describe("applyTurn", () => {
  it("扣血、记录战报,且不修改原状态（纯函数）", () => {
    const s0 = createBattle([toCombatant(fire, 0)], [toCombatant(grass, 100)]);
    const before = s0.aiTeam[0].curHp;
    const s1 = applyTurn(s0, "player", fire.skills[0]);

    expect(s1.aiTeam[0].curHp).toBeLessThan(before);
    expect(s1.log.length).toBeGreaterThan(s0.log.length);
    expect(s0.aiTeam[0].curHp).toBe(before); // 原状态不可变
  });

  it("敌方全部倒下时判定攻击方获胜", () => {
    const weak = toCombatant({ ...grass, maxHp: 1 }, 100);
    const s0 = createBattle([toCombatant(fire, 0)], [weak]);
    const s1 = applyTurn(s0, "player", { name: "致命一击", type: "火", power: 50 });

    expect(s1.aiTeam[0].curHp).toBe(0);
    expect(s1.winner).toBe("player");
  });

  it("还有后备时切换到下一只而非结束", () => {
    const weak = toCombatant({ ...grass, maxHp: 1 }, 100);
    const backup = toCombatant(grass, 101);
    const s0 = createBattle([toCombatant(fire, 0)], [weak, backup]);
    const s1 = applyTurn(s0, "player", { name: "一击", type: "火", power: 50 });

    expect(s1.winner).toBeNull();
    expect(s1.aiActive).toBe(1);
  });
});
