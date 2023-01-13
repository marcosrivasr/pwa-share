//@ts-check
const myWorker = new Worker("serviceWorker.js");
if ("serviceWorker" in navigator) {
  /* navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  }); */
  window.addEventListener("load", async function () {
    const registration = await navigator.serviceWorker.register(
      "serviceWorker.js"
    );
    /* document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        registration.update();
      }
    }); */
  });
}

async function _getCachedMediaMetadata() {
  const cache = await caches.open("media");
  const requests = await cache.keys();
  return Promise.all(
    requests.map(async (request) => {
      console.log(request);
      const response = await cache.match(request);
      const responseBlob = await response?.blob();
      const size = responseBlob?.size;

      console.log("request", request);

      return {
        size,
        contentType: response?.headers.get("content-type"),
        src: request.url,
      };
    })
  );
}

document.addEventListener("DOMContentLoaded", (e) => {
  loadImages();
});

async function loadImages() {
  const data = await _getCachedMediaMetadata();
  if (data && data.length > 0) {
    const images = data.filter((item) => item.contentType.startsWith("image"));

    images.forEach((image) => {
      const img = document.createElement("img");
      img.src = image.src;
      document.querySelector("#container")?.appendChild(img);
    });
  }
}

loadImages();
