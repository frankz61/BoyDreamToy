import type { Card } from "./types";

/** 卡池。加精灵 / 调数值就是往这个数组里增改对象。 */
export const CARD_POOL: Card[] = [
  { id: "fire1", name: "炎角龙", type: "火", maxHp: 95, skills: [{ name: "烈焰吐息", type: "火", power: 38 }, { name: "岩石尾", type: "地", power: 28 }] },
  { id: "fire2", name: "灰烬狐", type: "火", maxHp: 78, skills: [{ name: "火花冲", type: "火", power: 34 }, { name: "疾风爪", type: "风", power: 26 }] },
  { id: "water1", name: "碧波鳗", type: "水", maxHp: 90, skills: [{ name: "水流击", type: "水", power: 34 }, { name: "电光鞭", type: "电", power: 26 }] },
  { id: "water2", name: "涡流龟", type: "水", maxHp: 108, skills: [{ name: "激流炮", type: "水", power: 32 }, { name: "大地踏", type: "地", power: 28 }] },
  { id: "grass1", name: "藤蔓灵", type: "草", maxHp: 84, skills: [{ name: "飞叶刀", type: "草", power: 36 }, { name: "烈日光", type: "火", power: 24 }] },
  { id: "grass2", name: "苔甲虫", type: "草", maxHp: 100, skills: [{ name: "藤鞭", type: "草", power: 30 }, { name: "钻地袭", type: "地", power: 32 }] },
  { id: "elec1", name: "雷光鼠", type: "电", maxHp: 70, skills: [{ name: "十万伏特", type: "电", power: 40 }, { name: "铁尾", type: "地", power: 26 }] },
  { id: "elec2", name: "伏特犬", type: "电", maxHp: 84, skills: [{ name: "放电", type: "电", power: 34 }, { name: "撕咬", type: "风", power: 24 }] },
  { id: "ground1", name: "岩壁象", type: "地", maxHp: 118, skills: [{ name: "地震", type: "地", power: 38 }, { name: "火山踏", type: "火", power: 28 }] },
  { id: "ground2", name: "砂之蝎", type: "地", maxHp: 88, skills: [{ name: "钻地突", type: "地", power: 34 }, { name: "毒叶针", type: "草", power: 24 }] },
  { id: "wind1", name: "飓风隼", type: "风", maxHp: 80, skills: [{ name: "空气斩", type: "风", power: 36 }, { name: "电翼击", type: "电", power: 26 }] },
  { id: "wind2", name: "云羽鹿", type: "风", maxHp: 92, skills: [{ name: "暴风", type: "风", power: 34 }, { name: "草叶飞", type: "草", power: 26 }] },
];
