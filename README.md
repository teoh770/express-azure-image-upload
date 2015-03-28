# Usage

When creating an instance of `ImageUpload` you will need to provide three parameters:

* `storageAcct` - The name of the Azure storage account being used for images.
* `storageKey` - The access key associated with `storageAcct`.
* `storageContainer` - The name of a storage container that exists under `storageAcct`.

In your Express router:

```javascript
var express = require( "express" );
var ImageUpload = require( "express-azure-image-upload" );


function imageHandler () {

    var storageAcct = "yourStorageAcct";
    var storageKey = "yourStorageKey";
    var storageContainer = "yourStorageContainer";

    var imageUpload = new ImageUpload( storageAcct, storageKey, storageContainer );

    return imageUpload.handler;

}


var router = express.Router();

router.post( "/whatever", imageHandler() );
```
