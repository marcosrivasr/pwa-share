const staticDevCoffee = "dev-coffee-site-v1";
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
  "/images/coffee9.jpg", */
];

self.addEventListener("install", (installEvent) => {
  installEvent.waitUntil(
    caches.open(staticDevCoffee).then((cache) => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", (fetchEvent) => {
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
            /*  if (broadcastChannel) {
              broadcastChannel.postMessage(
                "Sorry! No name found on incoming media."
              );
            } */
            continue;
          }

          console.log(mediaFile.name);

          const cacheKey = new URL(
            `${urlPrefix}${Date.now()}-${mediaFile.name}`,
            self.location
          ).href;
          await cache.put(
            cacheKey,
            new Response(mediaFile, {
              headers: {
                "content-length": mediaFile.size,
                "content-type": mediaFile.type,
              },
            })
          );
        }
        return Response.redirect("/", 200);
      })()
    );
  }
  /*  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((res) => {
      return res || fetch(fetchEvent.request);
    })
  ); */
});

/* self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // If this is an incoming POST request for the
  // registered "action" URL, respond to it.
  if (event.request.method === "POST" && url.pathname === "/share") {
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        const link = formData.get("link") || "";
        const responseUrl = await saveBookmark(link);
        return Response.redirect(responseUrl, 303);
      })()
    );
  }
});
 */
