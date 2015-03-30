var util = require( "util" );
var EventEmitter = require( "events" ).EventEmitter;
var uuid = require( "node-uuid" );
var azure = require( "azure-storage" );
var multiparty = require( "multiparty" );


module.exports = ImageUpload;


function ImageUpload ( storageAcct, storageKey, storageContainer ) {

    EventEmitter.call( this );

    this.req = null;
    this.res = null;
    this.next = null;

    this.storageAcct = storageAcct;
    this.storageKey = storageKey;
    this.storageContainer = storageContainer;
    this.blobService = azure.createBlobService( storageAcct, storageKey );

    this.imageUrl = "https://%s.blob.core.windows.net/%s/%s";
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

    var _this = this;

    var errors = [];

    var form = new multiparty.Form();
    form.parse( _this.req, function ( err, fields, files ) {

        if ( err ) {
            return _this.emit( "error", err );
        }

        var image = files.image[ 0 ];

        if ( typeof image === "undefined" ) {
            var imageRequired = {
                param: "files.image",
                msg: "No image provided",
                value: "undefined"
            };
            errors.push( imageRequired );
        }

        if ( _this.imageTypes.indexOf( image.headers[ "content-type" ] ) === -1 ) {
            var imageType = {
                param: "files.image",
                msg: "Invalid image type",
                value: image.headers[ "content-type" ]
            };
            errors.push( imageType );
        }

        if ( errors.length > 0 ) {
            return _this.emit( "invalid", errors );
        }

        return _this.emit( "upload", image );

    } );

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

        var url = util.format( _this.imageUrl, _this.storageAcct, _this.storageContainer, blobName );

        _this.emit( "done", url );

    }

    _this.blobService.createBlockBlobFromLocalFile( _this.storageContainer, blobName, imageData.path, fileOptions, onCreate );

};


ImageUpload.prototype.done = function( imageUrl ) {

    var body = {
        url: imageUrl
    };

    this.res.status( 201 ).json( body );

};
