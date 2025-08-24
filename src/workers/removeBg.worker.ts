// removeBg.worker.ts - 배경제거용 워커 (알파마스크 기반 단순 배경 제거)
self.onmessage = function (e) {
  const { imgData, bg, thresh, feather, matte } = e.data;
  const a = imgData.data;
  for (let i = 0; i < a.length; i += 4) {
    const r = a[i], g = a[i + 1], b = a[i + 2];
    const d = Math.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2);
    let alpha = 0;
    if (d < thresh) alpha = 0;
    else if (d > thresh + feather) alpha = 255;
    else alpha = Math.round(255 * (d - thresh) / feather);
    const k = alpha / 255;
    a[i] = Math.round(matte[0] * (1 - k) + r * k);
    a[i + 1] = Math.round(matte[1] * (1 - k) + g * k);
    a[i + 2] = Math.round(matte[2] * (1 - k) + b * k);
    a[i + 3] = alpha;
  }
  // @ts-expect-error: transferables for worker
  self.postMessage(imgData, [imgData.data.buffer]);
};
