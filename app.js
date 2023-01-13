const myWorker = new Worker("serviceWorker.js");
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
  window.addEventListener("load", async function () {
    const registration = await navigator.serviceWorker.register(
      "serviceWorker.js"
    );
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        registration.update();
      }
    });

    await syncContentIndex(registration);
    /*     navigator.serviceWorker
      .register("/serviceWorker.js")
      .then((res) => console.log("service worker registered"))
      .catch((err) => console.log("service worker not registered", err)); */
  });
}

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

// This method syncs the currently cached media with the Content Indexing API
// (on browsers that support it). The Cache Storage is the source of truth.
async function syncContentIndex(registration) {
  //  Bail early if the Content Indexing API isn't supported.
  if (!("index" in registration)) {
    return;
  }

  // Get a list of everything currently in the content index. The id of each
  // entry will match the media URLs that are stored in the cache.
  const allEntries = await registration.index.getAll();
  const idsInIndex = new Set(allEntries.map((entry) => entry.id));

  // Get a list of all cached media.
  const cachedMediaMetadata = await _getCachedMediaMetadata;

  for (const metadata of cachedMediaMetadata) {
    if (idsInIndex.has(metadata.src)) {
      // If a given id/URL is in both the content index and currently in our
      // cache, remove it from the set.
      idsInIndex.delete(metadata.src);
    } else {
      // Otherwise, if the id/URL is cached but not currently in the index, add
      // it to the index.
      // category should end up being 'image', 'audio', or 'video'.
      const [category] = metadata.contentType.split("/");
      await registration.index.add({
        // Use the cached media URL as the id.
        id: metadata.src,
        // Our web app has a route for viewing a specific cached media URL.
        // Note that this needs to be the URL for a page that will display the
        // cached media; *not* the URL for the media itself.
        launchUrl: `/#/view/${metadata.src}`,
        // Use a generic title and description.
        title: `A saved ${category}`,
        description: "Saved via the Scrapbook PWA.",
        icons: [
          {
            sizes: "192x192",
            // If the cached media item is an image, use it as the icon.
            // Otherwise, use a generic video or audio icon.
            src: category === "image" ? metadata.src : iconSrcs[category],
            type: category === "image" ? metadata.contentType : "image/png",
          },
        ],
        // 'article' isn't a great fit for images, but there's nothing better.
        // See https://github.com/rayankans/content-index/issues/7#issuecomment-561761805
        category: category === "image" ? "article" : category,
      });
    }
  }

  for (const idToRemove of idsInIndex) {
    // Finally, for all of the ids that are currently in the index but aren't
    // cached (i.e. all values that are still in the idsInIndex set), remove
    // them from the index.
    await registration.index.delete(idToRemove);
  }
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
