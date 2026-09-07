document.querySelectorAll('img[data-chroma-key]').forEach((image) => {
  const removeKey = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < pixels.data.length; index += 4) {
      if (pixels.data[index] === 255 && pixels.data[index + 1] === 0 && pixels.data[index + 2] === 0) pixels.data[index + 3] = 0;
    }
    context.putImageData(pixels, 0, 0);
    image.replaceWith(canvas);
  };
  if (image.complete) removeKey(); else image.addEventListener('load', removeKey, { once: true });
});
