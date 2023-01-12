const myWorker = new Worker("serviceWorker.js");
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then((res) => console.log("service worker registered"))
      .catch((err) => console.log("service worker not registered", err));
  });
}

myWorker.onmessage = (e) => {
  boton.textContent = e.data;
  console.log("Message received from worker");
};

const boton = document.querySelector("#boton");
boton.addEventListener("click", (e) => {
  console.log("hola");
  myWorker.postMessage("hello there");
});

async function _getCachedMediaMetadata() {
  const cache = await caches.open("media");
  const requests = await cache.keys();
  return Promise.all(
    requests.reverse().map(async (request) => {
      console.log(request);
      const response = await cache.match(request);
      const responseBlob = await response.blob();
      const size = responseBlob.size;

      console.log("request", request);

      return {
        size,
        contentType: response.headers.get("content-type"),
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
      document.querySelector("#container").appendChild(img);
    });
  }
}

loadImages();
