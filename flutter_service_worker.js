'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"version.json": "cc1fa9cce5af273c0909d105387fee89",
"favicon.ico": "f5539a8127f1130cbdf1b74a9c9a717e",
"index.html": "da1d7eee116df81f1e76533ff3ac5119",
"/": "da1d7eee116df81f1e76533ff3ac5119",
"main.dart.js": "3ea6cd35453b274b5737eed2ee749d25",
"flutter.js": "7d69e653079438abfbb24b82a655b0a4",
"favicon.png": "4abcc239451062d353876ae147c38f06",
"portfolio.png": "0bd08222f3955153fd283f0be792e974",
"icons/Icon-192.png": "858c860036a7e80ca20da73a056df0ee",
"icons/Icon-512.png": "a4faa731ac284078b73d6bb97ea2b07b",
"manifest.json": "a67989697c366cf4f821bde4733a6ca8",
"assets/AssetManifest.json": "18fa13f1a977d20126b916b55183acaa",
"assets/NOTICES": "02bd899a6d345b8c8caeb9dc7b3a6e3f",
"assets/FontManifest.json": "1060d3ec536fc3d6afd064e2a7e73098",
"assets/AssetManifest.bin.json": "76cb3cf9a58e8774d30c06d76cbf89a5",
"assets/packages/material_design_icons_flutter/lib/fonts/materialdesignicons-webfont.ttf": "dd74f11e425603c7adb66100f161b2a5",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/shaders/ink_sparkle.frag": "4096b5150bac93c41cbc9b45276bd90f",
"assets/AssetManifest.bin": "c5f91f0a97585e44ae686e08fc6bfead",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/assets/images/portfolio1.png": "97ce2cc6b8f3097a54babb3f668c239f",
"assets/assets/images/portfolio2.png": "c9ea4b0c330e12e5aee5a7eb280a7863",
"assets/assets/images/portfolio3.png": "3341f26d65a7ae891072e6c83fd2dc20",
"assets/assets/images/iphone.png": "23694cbc4d32e5d1985ae19f666bdc95",
"assets/assets/images/profile.png": "3fd81f03eeb14f1477940399d8c375d0",
"assets/assets/videos/home.mp4": "60166fcbb25e48fb10a14d39f27e8be7",
"assets/assets/icons/appstore.svg": "7c8467bc5a69a3197f8be6a823e5a9e3",
"assets/assets/icons/gmail.svg": "6dfaad9204312d9e21c19703e77c49b2",
"assets/assets/icons/github.svg": "9ac03f30ec6a812a0b41dc0754eb3bea",
"assets/assets/icons/instagram.svg": "26e23995bf93363353147af164d82fc4",
"assets/assets/icons/googleplay.svg": "22fd4f22dede1cc6a7651a9d73ddb378",
"assets/assets/icons/parrot.svg": "c0c60128667b0da8e706ba5056c6ba92",
"assets/assets/icons/velog.svg": "8846daea50991588ea82f5255ac0a2d2",
"assets/assets/fonts/Pretendard/Pretendard-Regular.otf": "46b0c48afd8b0ddc2ed4fcbb2df81d8b",
"assets/assets/fonts/Pretendard/Pretendard-Black.otf": "6bc3f501ba4e736b706074a29826ec0a",
"assets/assets/fonts/Pretendard/Pretendard-Medium.otf": "9ac30a1a68a5140a58b23aaf8025f1db",
"assets/assets/fonts/Pretendard/Pretendard-Light.otf": "aef3dc5f5592a0a9bfd7e8de7abdc2c5",
"assets/assets/fonts/Pretendard/Pretendard-ExtraBold.otf": "dac19e30ed93b7aed171830c38cda6a2",
"assets/assets/fonts/Pretendard/Pretendard-Bold.otf": "e93f79700405e1b4c1b3e70d8c378ca4",
"assets/assets/fonts/Pretendard/Pretendard-Thin.otf": "0b09a12c024a6380cd40dbfaf2fd79cd",
"assets/assets/fonts/Pretendard/Pretendard-ExtraLight.otf": "23002daa2dee07f8a652bb0ab06af079",
"assets/assets/fonts/Pretendard/Pretendard-SemiBold.otf": "d9d912f2630bae445757f4769271c35c",
"assets/assets/fonts/Schabo/Schabo-Condensed.otf": "ee6e7aed3fc3192405941b4642c75025",
"assets/assets/fonts/Config/ConfigCondensed.otf": "ac8a614d606b44cdb93a84ea3dcf1a6f",
"assets/assets/translations/ko-KR.json": "181dd8f6a3614403133650854cbf934f",
"assets/assets/translations/en-US.json": "4299ff41e8b6320864069f20a1384d82",
"canvaskit/skwasm.js": "87063acf45c5e1ab9565dcf06b0c18b8",
"canvaskit/skwasm.wasm": "2fc47c0a0c3c7af8542b601634fe9674",
"canvaskit/chromium/canvaskit.js": "0ae8bbcc58155679458a0f7a00f66873",
"canvaskit/chromium/canvaskit.wasm": "143af6ff368f9cd21c863bfa4274c406",
"canvaskit/canvaskit.js": "eb8797020acdbdf96a12fb0405582c1b",
"canvaskit/canvaskit.wasm": "73584c1a3367e3eaf757647a8f5c5989",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
