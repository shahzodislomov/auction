export function createImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous"; // Allow cross-origin images
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = url;
    });
  }
  