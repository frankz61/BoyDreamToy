import type { ElementType } from "./types";

/**
 * 属性相克表：TYPE_CHART[攻击方][防守方] = 倍率。
 * 表里没列的组合一律按 1 倍处理。
 * 这是一张纯数据 —— 调平衡只改这里，逻辑代码一行不用动。
 */
export const TYPE_CHART: Record<ElementType, Partial<Record<ElementType, number>>> = {
  火: { 草: 2, 风: 2, 水: 0.5, 地: 0.5 },
  水: { 火: 2, 地: 2, 草: 0.5, 电: 0.5 },
  草: { 水: 2, 地: 2, 火: 0.5, 风: 0.5 },
  电: { 水: 2, 风: 2, 地: 0.5, 草: 0.5 },
  地: { 火: 2, 电: 2, 水: 0.5, 风: 0.5 },
  风: { 草: 2, 地: 2, 电: 0.5, 火: 0.5 },
};

export function effectiveness(attackType: ElementType, defendType: ElementType): number {
  return TYPE_CHART[attackType]?.[defendType] ?? 1;
}
