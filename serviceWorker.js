//@ts-check
const cacheName = "media";
/* const broadcastChannel =
  "BroadcastChannel" in self ? new BroadcastChannel("shareMessages") : null;
const assets = [
  "/",
  "/index.html",
  /*  "/css/style.css",
  "/js/app.js",
  "/images/coffee1.jpg",
  "/images/coffee2.jpg",
  "/images/coffee3.jpg",
  "/images/coffee4.jpg",
  "/images/coffee5.jpg",
  "/images/coffee6.jpg",
  "/images/coffee7.jpg",
  "/images/coffee8.jpg",
  "/images/coffee9.jpg",
];

self.addEventListener("install", (installEvent) => {
  installEvent.waitUntil(
    caches.open(cacheName).then((cache) => {
      cache.addAll(assets);
    })
  );
}); */

self.addEventListener("fetch", (fetchEvent) => {
  console.log({ fetchEvent });
  const urlPrefix = "/_media/";
  const url = new URL(fetchEvent.request.url);
  // If this is an incoming POST request for the
  // registered "action" URL, respond to it.
  if (
    fetchEvent.request.method === "POST" &&
    url.pathname === "/share-target"
  ) {
    fetchEvent.respondWith(
      (async () => {
        const formData = await fetchEvent.request.formData();
        const mediaFiles = formData.getAll("media");
        for (const mediaFile of mediaFiles) {
          // TODO: Instead of bailing, come up with a
          // default name for each possible MIME type.
          if (!mediaFile.name) {
            console.log("no name found");
            continue;
          }

          const cacheKey = new URL(
            `${urlPrefix}${Date.now()}-${mediaFile.name}`,
            self.location
          ).href;
          const response = new Response(mediaFile, {
            headers: {
              "content-length": mediaFile.size,
              "content-type": mediaFile.type,
            },
          });

          clients.matchAll({ type: "window" }).then((clientsArr) => {
            clients.openWindow(response.url);
          });
          (await caches.open(cacheName)).put(cacheKey, response);
        }

        /*  caches.match(fetchEvent.request).then((res) => {
          return res || fetch(fetchEvent.request);
        }); */
        return Response.redirect("/", 303);
      })()
    );
  } else if (fetchEvent.request.destination === "image") {
    // Open the cache
    fetchEvent.respondWith(
      caches.open(cacheName).then((cache) => {
        // Respond with the image from the cache or from the network
        return cache.match(fetchEvent.request).then((cachedResponse) => {
          return (
            cachedResponse ||
            fetch(fetchEvent.request.url).then((fetchedResponse) => {
              // Add the network response to the cache for future visits.
              // Note: we need to make a copy of the response to save it in
              // the cache and use the original as the request response.
              cache.put(fetchEvent.request, fetchedResponse.clone());

              // Return the network response
              return fetchedResponse;
            })
          );
        });
      })
    );
  }
});

self.addEventListener("message", (ev) => {
  console.log("mensaje recibido", ev);

  self.postMessage("Hola de vuelta");
});
