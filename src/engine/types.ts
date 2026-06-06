// 引擎层公共类型定义。纯类型，不含任何运行时逻辑。

export type ElementType = "火" | "水" | "草" | "电" | "地" | "风";

export type Side = "player" | "ai";

export interface Skill {
  name: string;
  type: ElementType;
  power: number;
}

/** 卡池里的静态卡牌定义 */
export interface Card {
  id: string;
  name: string;
  type: ElementType;
  maxHp: number;
  skills: Skill[];
  image: string; // 卡面图片路径（public/ 下，运行时以 / 开头访问）
}

/** 进入对战后的实例（带当前血量、唯一 uid） */
export interface Combatant extends Card {
  uid: string;
  curHp: number;
}

/** 一次出招的结算结果，给表现层播动画用 */
export interface HitResult {
  side: Side; // 攻击方
  attackerName: string;
  skill: Skill;
  damage: number;
  mult: number; // 相克倍率
  fainted: boolean;
}

/** 一场战斗的完整状态。applyTurn 输入输出都是它 */
export interface BattleState {
  playerTeam: Combatant[];
  aiTeam: Combatant[];
  playerActive: number; // 玩家当前出战索引
  aiActive: number; // AI 当前出战索引
  log: string[];
  lastHit: HitResult | null;
  winner: Side | null;
}

/** 闯关配置：每一关用一条纯数据描述，调难度只改这里 */
export interface StageConfig {
  id: number;
  name: string;
  hpScale: number; // 敌方血量倍率
  powerScale: number; // 敌方技能倍率
  teamSize: number;
  aiSmart: boolean; // true=贪心选最优技能，false=随机出招
}
