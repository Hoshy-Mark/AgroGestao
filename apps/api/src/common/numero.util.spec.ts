import { clamp } from "./numero.util.js";

describe("clamp", () => {
  it("mantem o valor quando ja esta dentro do intervalo", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });

  it("corta no maximo quando o valor ultrapassa", () => {
    expect(clamp(120, 0, 100)).toBe(100);
  });

  it("corta no minimo quando o valor fica abaixo", () => {
    expect(clamp(-10, 0, 100)).toBe(0);
  });
});
