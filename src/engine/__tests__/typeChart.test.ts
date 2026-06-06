import { describe, it, expect } from "vitest";
import { effectiveness } from "../typeChart";

describe("属性相克", () => {
  it("火克草 = 2 倍", () => {
    expect(effectiveness("火", "草")).toBe(2);
  });

  it("火被水克 = 0.5 倍", () => {
    expect(effectiveness("火", "水")).toBe(0.5);
  });

  it("无相克关系 = 1 倍", () => {
    expect(effectiveness("火", "电")).toBe(1);
  });
});
