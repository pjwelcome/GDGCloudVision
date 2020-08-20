const vision = require('@google-cloud/vision');
const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp()


exports.sayHello = functions.https.onCall ((data, context) => {
  const text = data.text;
  var db = admin.firestore();
  const webDetection = JSON.parse('{"webEntities": [{"entityId": "/m/02p7_j8","score": 1.44225,"description": "Carnival in Rio de Janeiro"},{"entityId": "/m/06gmr","score": 1.2913725,"description": "Rio de Janeiro"}]}');
        let imageRef = db.collection('images').doc(text);
        imageRef.set(webDetection);
});

exports.callVisions = functions.storage.object().onFinalize(async (event) => {
    const fileBucket = event.bucket;
    const filePath = event.name;
    const gcsPath = `gs://${fileBucket}/${filePath}`;

    // Creates a client
    const client = new vision.ImageAnnotatorClient();
    // Detect similar images on the web to a local file
     return client
      .webDetection(gcsPath)
      .then(results => {
        
        const webDetection = results[0].webDetection;
        if (webDetection.fullMatchingImages.length) {
          console.log(
            `Full matches found: ${webDetection.fullMatchingImages.length}`
          );
          webDetection.fullMatchingImages.forEach(image => {
            console.log(`  URL: ${image.url}`);
            console.log(`  Score: ${image.score}`);
          });
        }
  
        if (webDetection.partialMatchingImages.length) {
          console.log(
            `Partial matches found: ${webDetection.partialMatchingImages.length}`
          );
          webDetection.partialMatchingImages.forEach(image => {
            console.log(`  URL: ${image.url}`);
            console.log(`  Score: ${image.score}`);
          });
        }
  
        if (webDetection.webEntities.length) {
          console.log(`Web entities found: ${webDetection.webEntities.length}`);
          webDetection.webEntities.forEach(webEntity => {
            console.log(`  Description: ${webEntity.description}`);
            console.log(`  Score: ${webEntity.score}`);
          });
        }
        var db = admin.firestore();
        let imageRef = db.collection('images').doc(filePath.slice(7));
        imageRef.set(webDetection);
      })
      .catch(err => {
        console.error('ERROR:', err);
      });
});