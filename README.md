# Usage

When creating an instance of `ImageUpload` you will need to provide three parameters:

* `storageAcct` - The name of the Azure storage account being used for images.
* `storageKey` - The access key associated with `storageAcct`.
* `storageContainer` - The name of a storage container that exists under `storageAcct`.

**In your Express router:**

```javascript
var express = require( "express" );
var ImageUpload = require( "express-azure-image-upload" );

var router = express.Router();


var storageAcct = "yourStorageAcct";
var storageKey = "yourStorageKey";
var storageContainer = "yourStorageContainer";

var imageUpload = new ImageUpload( storageAcct, storageKey, storageContainer );


router.post( "/whatever", function ( req, res, next ) {

    imageUpload.handler( req, res, next );

} );
```

**When making a POST request:**

Include the image in a form data property named `image`.
