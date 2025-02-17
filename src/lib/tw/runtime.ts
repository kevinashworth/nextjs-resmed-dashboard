import { converter, differenceEuclidean, modeOklch, modeP3, toGamut as _toGamut, useMode as _mode } from "culori/fn";

import { makeVariable, shades } from "./common";

import type { Color, Oklch } from "culori/fn";

// See https://culorijs.org/guides/tree-shaking/, but basically, tree-shaking
// requires us to 'register them manually with the useMode() method'.
const _oklch = _mode(modeOklch);
const _p3 = _mode(modeP3);

const toGamut = _toGamut as (..._args: unknown[]) => (_color: string) => Color;

/**
 * A map of CSS variable name to color
 */
type SingleVariable = [string, string];

export function getVariables({
  baseName,
  hue,
  mode = "consistent",
}: {
  baseName: string;
  hue: number;
  mode?: "bright" | "consistent";
}): SingleVariable[] {
  const calculator = mode === "bright" ? highestChroma : consistentChroma;
  return shades.map((shade, shadeIndex) => {
    const cssVariable = makeVariable({ name: baseName, shade });
    const color = calculator({ shadeIndex, hue, returnSerializedColor: false });
    return [cssVariable, color];
  });
}

export function updateVariables(variables: SingleVariable[], el?: HTMLElement) {
  const target = el ?? document.documentElement;

  for (const [varName, value] of variables) {
    target.style.setProperty(varName, value + "");
  }
}

const lightnessForShade = (shade: number) => {
  const highestL = 89;
  const lowestL = 13;
  const diffL = highestL - lowestL;

  const shadeDiff = shades[shades.length - 1] - shades[0];

  // Maintaining the proximity of colors with a step of 50 and 100
  const multiplier = shade / shadeDiff;

  return (lowestL + (highestL - diffL * multiplier)) / 100;
};
const lightness = shades.map(lightnessForShade);

export const highestChroma = ({
  shadeIndex,
  hue,
  returnSerializedColor = true,
}: {
  shadeIndex: number;
  hue: number;
  returnSerializedColor?: boolean;
}) => {
  const oklch = converter("oklch");

  // Setting an obsurdly high chroma
  const color = `oklch(${lightness[shadeIndex]} 0.4 ${hue})`;

  // Clamping it to the highest chroma possible
  const serializedColor = serializeColor(oklch(toGamut("p3", "oklch", differenceEuclidean("oklch"), 0)(color)));
  if (returnSerializedColor) {
    return serializedColor;
  }
  return color;
};

export const consistentChroma = ({
  shadeIndex,
  hue,
  returnSerializedColor = true,
}: {
  shadeIndex: number;
  hue: number;
  returnSerializedColor?: boolean;
}) => {
  const oklch = converter("oklch");

  // Using a pinned chroma
  const color = `oklch(${lightness[shadeIndex]} ${chromaData[shadeIndex]} ${hue})`;

  const serializedColor = serializeColor(oklch(toGamut("p3", "oklch", differenceEuclidean("oklch"), 0)(color)));
  if (returnSerializedColor) {
    return serializedColor;
  }
  return color;
};

const chromaData: Record<number, number> = {
  0: 0.0114,
  1: 0.0331,
  2: 0.0774,
  3: 0.1275,
  4: 0.1547,
  5: 0.1355,
  6: 0.1164,
  7: 0.0974,
  8: 0.0782,
  9: 0.0588,
  10: 0.0491,
};

const serializeColor = (c: Oklch): string => `${c.l.toFixed(3)} ${c.c.toFixed(3)} ${c.h?.toFixed(3)}`;
