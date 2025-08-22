/* eslint-disable import/no-unresolved */
import { MM2PX } from "../constants";

export async function createCanvas(
  el: HTMLCanvasElement,
  widthMM: number,
  heightMM: number
) {
  const { fabric } = await import("fabric");
  const canvas = new fabric.Canvas(el, {
    width: MM2PX(widthMM),
    height: MM2PX(heightMM),
    selection: true,
    preserveObjectStacking: true,
  });
  canvas.setZoom(1);
  return canvas;
}
