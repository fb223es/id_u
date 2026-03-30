self.addEventListener("install", function(event) {
  console.log("SW installerad");
});

self.addEventListener("fetch", function(event) {
  console.log("SW fångar request:", event.request.url);
});