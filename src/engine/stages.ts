import type { StageConfig } from "./types";

/**
 * 闯关配置。一关一条数据，难度随 hpScale / powerScale / aiSmart 递增。
 * 想加关卡 / 调难度曲线，改这个数组即可。
 */
export const STAGES: StageConfig[] = [
  { id: 1, name: "新手训练员", hpScale: 0.85, powerScale: 0.85, teamSize: 3, aiSmart: false },
  { id: 2, name: "林间挑战者", hpScale: 1.0, powerScale: 0.95, teamSize: 3, aiSmart: false },
  { id: 3, name: "岩石道馆", hpScale: 1.1, powerScale: 1.0, teamSize: 3, aiSmart: true },
  { id: 4, name: "雷鸣高手", hpScale: 1.2, powerScale: 1.1, teamSize: 3, aiSmart: true },
  { id: 5, name: "冠军 · BOSS", hpScale: 1.4, powerScale: 1.2, teamSize: 3, aiSmart: true },
];
