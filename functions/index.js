const vision = require('@google-cloud/vision');
const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

exports.callVision = functions.storage.object().onChange(event => {
    const object = event.data;
    const fileBucket = object.bucket;
    const filePath = object.name;
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