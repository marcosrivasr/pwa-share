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
