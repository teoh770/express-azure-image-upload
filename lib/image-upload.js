var util = require( "util" );
var EventEmitter = require( "events" ).EventEmitter;
var uuid = require( "node-uuid" );
var azure = require( "azure" );


module.exports = ImageUpload;


function ImageUpload ( storageAcct, storageKey, storageContainer ) {

    EventEmitter.call( this );

    this.req = null;
    this.res = null;
    this.next = null;

    this.storageContainer = storageContainer;
    this.blobService = azure.createBlobService( storageAcct, storageKey );
    this.imageTypes = [ "image/jpeg", "image/jpg" ];

    this.on( "error", this.error );
    this.on( "invalid", this.validationError );
    this.on( "upload", this.upload );
    this.on( "done", this.done );

}

util.inherits( ImageUpload, EventEmitter );


ImageUpload.prototype.handler = function( req, res, next ) {

    this.req = req;
    this.res = res;
    this.next = next;

    this.validate();

};


ImageUpload.prototype.validate = function() {

    var errors = [];
    var imageData = this.req.files.image;

    if ( typeof imageData === "undefined" ) {
        var imageRequired = {
            param: "files.image",
            msg: "No image provided",
            value: "undefined"
        };
        errors.push( imageRequired );
    }

    if ( this.imageTypes.indexOf( imageData.type ) === -1 ) {
        var imageType = {
            param: "files.image",
            msg: "Invalid image type",
            value: this.req.files.image.type
        };
        errors.push( imageType );
    }

    if ( errors.length > 0 ) {
        return this.emit( "invalid", errors );
    }

    return this.emit( "upload", this.req.files.image );

};


ImageUpload.prototype.error = function( err ) {

    this.next( err );

};


ImageUpload.prototype.validationError = function( err ) {

    this.res.status( 400 ).json( err );

};


ImageUpload.prototype.upload = function( imageData ) {

    var _this = this;

    var blobName = uuid.v1();
    var fileOptions = {
        contentType: _this.imageTypes[ 0 ]
    };

    function onCreate ( err ) {

        if ( err ) {
            return _this.emit( "error", err );
        }

        _this.emit( "done", _this.blobService.getBlobUrl( _this.storageContainer, blobName ) );
    }

    _this.blobService.createBlockBlobFromFile( _this.storageContainer, blobName, imageData.path, fileOptions, onCreate );

};


ImageUpload.prototype.done = function( imageUrl ) {

    var body = {
        url: imageUrl
    };

    this.res.status( 201 ).json( body );

};
