import type { Card } from "./types";

/**
 * 卡池。名称 / 技能名取自 cards/ 卡面美术，元素属性、HP、技能威力仍沿用本游戏的平衡数值
 * （不照抄卡面上的 HP 与伤害）。加精灵 / 调数值就是往这个数组里增改对象。
 */
export const CARD_POOL: Card[] = [
  { id: "fire1", name: "火焰鸟", type: "火", maxHp: 95, image: "/cards/fire1.jpg", skills: [{ name: "噬魂火烙印", type: "火", power: 38 }, { name: "焚天妖炎", type: "地", power: 28 }] },
  { id: "fire2", name: "暗黑火焰鸟", type: "火", maxHp: 78, image: "/cards/fire2.jpg", skills: [{ name: "怨气燃烧", type: "火", power: 34 }, { name: "厄火纠缠", type: "风", power: 26 }] },
  { id: "water1", name: "哥达鸭", type: "水", maxHp: 90, image: "/cards/water1.jpg", skills: [{ name: "大力溅水", type: "水", power: 34 }, { name: "激流幻象", type: "电", power: 26 }] },
  { id: "water2", name: "帕路奇亚", type: "水", maxHp: 108, image: "/cards/water2.jpg", skills: [{ name: "维度旋涡", type: "水", power: 32 }, { name: "引力空间", type: "地", power: 28 }] },
  { id: "grass1", name: "碧草面具", type: "草", maxHp: 84, image: "/cards/grass1.jpg", skills: [{ name: "太晶万叶舞", type: "草", power: 36 }, { name: "钻石能量爆", type: "火", power: 24 }] },
  { id: "grass2", name: "全力玛夏多", type: "草", maxHp: 100, image: "/cards/grass2.jpg", skills: [{ name: "全力残影拳", type: "草", power: 30 }, { name: "完全打击", type: "地", power: 32 }] },
  { id: "elec1", name: "雷电云", type: "电", maxHp: 70, image: "/cards/elec1.jpg", skills: [{ name: "巨劈雷闪电", type: "电", power: 40 }, { name: "落雷震击", type: "地", power: 26 }] },
  { id: "elec2", name: "颤弦蝾螈", type: "电", maxHp: 84, image: "/cards/elec2.jpg", skills: [{ name: "巨毒电音爆", type: "电", power: 34 }, { name: "毒乐最终章", type: "风", power: 24 }] },
  { id: "ground1", name: "奈克洛兹玛", type: "地", maxHp: 118, image: "/cards/ground1.jpg", skills: [{ name: "超能力浩劫", type: "地", power: 38 }, { name: "镭射月光翼", type: "火", power: 28 }] },
  { id: "ground2", name: "耿鬼", type: "地", maxHp: 88, image: "/cards/ground2.jpg", skills: [{ name: "暗影潜袭", type: "地", power: 34 }, { name: "次元吞噬", type: "草", power: 24 }] },
  { id: "wind1", name: "阿尔宙斯", type: "风", maxHp: 80, image: "/cards/wind1.jpg", skills: [{ name: "极光增辉", type: "风", power: 36 }, { name: "超时空回溯", type: "电", power: 26 }] },
  { id: "wind2", name: "雷电云·天空", type: "风", maxHp: 92, image: "/cards/wind2.jpg", skills: [{ name: "天空威赫", type: "风", power: 34 }, { name: "疾风震雷", type: "草", power: 26 }] },
];
