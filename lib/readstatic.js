var fs = require('fs');
var mimeMap = {
    'css': 'text/css',
    'gif': 'image/gif',
    'html': 'text/html',
    'ico': 'image/x-icon',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'text/javascript',
    'json': 'application/json',
    'pdf': 'application/pdf',
    'png': 'image/png',
    'svg': 'image/svg+xml',
    'swf': 'application/x-shockwave-flash',
    'tiff': 'image/tiff',
    'txt': 'text/plain',
    'wav': 'audio/x-wav',
    'wma': 'audio/x-ms-wma',
    'wmv': 'video/x-ms-wmv',
    'xml': 'text/xml'
};

module.exports = function(realPath, callback){
    var ext = realPath.match(/\.\w+$/);

    fs.readFile(realPath, function(err, data){
        var ret = err ? {
            mime: 'text/plain',
            data: String(err),
            code: 404
        } : {
            mime: ext ? mimeMap[ext[0].slice(1)] : 'text/plain',
            data: fs.readFileSync(realPath),
            code: 200
        };

        typeof callback == 'function' && callback(ret);
    });
};