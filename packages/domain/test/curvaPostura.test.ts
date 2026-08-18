import { describe, expect, it } from "vitest";
import { taxaPosturaPorSemana } from "../src/engine/curvaPostura.js";

describe("taxaPosturaPorSemana", () => {
  it("e zero antes do inicio da postura", () => {
    expect(taxaPosturaPorSemana(10, "branca")).toBe(0);
  });

  it("sobe ao longo do inicio de postura (17-20 semanas)", () => {
    const s17 = taxaPosturaPorSemana(17, "branca");
    const s18 = taxaPosturaPorSemana(18, "branca");
    const s20 = taxaPosturaPorSemana(20, "branca");

    expect(s17).toBeCloseTo(0.05);
    expect(s18).toBeCloseTo(0.1);
    expect(s20).toBeCloseTo(0.5);
    expect(s18).toBeGreaterThan(s17);
    expect(s20).toBeGreaterThan(s18);
  });

  it("atinge o pico de postura entre 24-30 semanas", () => {
    const pico = taxaPosturaPorSemana(27, "branca");
    expect(pico).toBeGreaterThan(0.85);
    expect(pico).toBeLessThanOrEqual(1);
  });

  it("declina ate o descarte por volta de 90 semanas", () => {
    const platoTardio = taxaPosturaPorSemana(60, "branca");
    const descarte = taxaPosturaPorSemana(90, "branca");
    expect(descarte).toBeLessThan(platoTardio);
  });

  it("linhagem branca tem pico igual ou maior que a vermelha", () => {
    const branca = taxaPosturaPorSemana(27, "branca");
    const vermelha = taxaPosturaPorSemana(27, "vermelha");
    expect(branca).toBeGreaterThanOrEqual(vermelha);
  });

  it("nao ultrapassa o ultimo ponto da curva para idades muito altas", () => {
    expect(taxaPosturaPorSemana(200, "branca")).toBe(
      taxaPosturaPorSemana(90, "branca")
    );
  });
});
