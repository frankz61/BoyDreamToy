# 属性对决 · 人机闯关（原型）

回合制卡牌对战：抽 10 选 3，连续挑战 5 关 AI，难度逐关递增，含属性相克伤害加成。

## 运行

```bash
npm install
npm run dev        # 本地开发
npm test           # 跑引擎单测
npm run build      # 生产构建
```

## 目录结构

```
src/
  engine/                 ← 纯逻辑层（不依赖 React，可独立测试 / 复用）
    types.ts              核心类型
    typeChart.ts          属性相克表（纯数据）
    cards.ts              卡池（纯数据）
    stages.ts             闯关配置（纯数据）
    battle.ts             伤害公式、applyTurn 等纯函数
    ai.ts                 AI 选队 / 出招
    campaign.ts           按关卡生成被缩放的敌方队伍
    index.ts              统一出口
    __tests__/            Vitest 单测
  ui/                     ← 表现层（React）
    App.tsx               闯关流程主组件
    components.tsx        小组件 + 主题色
  main.tsx
```

## 设计要点

引擎层是 **纯函数 + 确定性**：`applyTurn(state, side, skill)` 输入相同永远输出相同，
不修改入参。这一层完全不碰 React。

- 单机：客户端跑引擎 + `ai.ts` 当对手（当前形态）。
- 联机：把 `engine/` 原样搬到 Node.js / Colyseus 服务端当权威裁判，
  前后端共用同一份代码。`applyTurn` 不用改一行。

## 最常改的地方（都是纯数据 / 纯函数）

| 想做的事 | 改哪里 |
|---|---|
| 加精灵、调技能数值 | `engine/cards.ts` |
| 调属性相克与倍率 | `engine/typeChart.ts` |
| 加关卡、调难度曲线 | `engine/stages.ts` |
| 让 AI 更聪明 | `engine/ai.ts` |

## 容易扩展的方向

战斗中换人、技能 PP / 冷却、先手速度属性、伤害浮动——都在 `engine/battle.ts`
的 `applyTurn` 里扩展，加测试后再让 AI 改功能更稳。
