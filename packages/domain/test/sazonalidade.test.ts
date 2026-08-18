import { describe, expect, it } from "vitest";
import { multiplicadorSazonal } from "../src/engine/sazonalidade.js";

describe("multiplicadorSazonal", () => {
  it("aplica alta no pico da Quaresma/Pascoa (marco)", () => {
    expect(multiplicadorSazonal(3)).toBeGreaterThan(1);
  });

  it("aplica vale em dezembro e janeiro", () => {
    expect(multiplicadorSazonal(1)).toBeLessThan(1);
    expect(multiplicadorSazonal(12)).toBeLessThan(1);
  });

  it("fica estavel (1.0) fora do periodo sazonal documentado", () => {
    expect(multiplicadorSazonal(7)).toBe(1);
  });

  it("retorna 1 para um mes invalido, em vez de quebrar", () => {
    expect(multiplicadorSazonal(0)).toBe(1);
    expect(multiplicadorSazonal(13)).toBe(1);
  });
});
