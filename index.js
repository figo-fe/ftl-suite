var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var qs = require("querystring");
var rootPath = process.cwd();
var configPath = path.join(rootPath, 'fsconfig.json');
var Freemarker = require('freemarker.js');
var httphelper = require('./lib/httphelper');
var readstatic = require('./lib/readstatic');
var port = process.env.PORT || 9090;

var defaultCfg = {
    ftlRoot: 'ftl',
    remoteHost: '',
    proxyPre: '',
    proxyArr: [],
    route: {}
};

var bodyParse = function(req, fn){
    var arr = [];
    req.on('data', function(data){
        arr.push(data);
    });
    req.on('end', function(){
        var data = Buffer.concat(arr).toString(),ret;
        try{
            ret = qs.parse(data);
        }catch(err){
            ret = {
                code: 500,
                msg: 'post data error'
            }
        }
        fn && fn(ret);
    });
};

fs.existsSync(configPath) || fs.writeFile(configPath, JSON.stringify(defaultCfg, null, 4));

var server = http.createServer(function(req, res){
    var urlpath = url.parse(req.url).path;
    var pathname = urlpath.split('?')[0];
    var config = JSON.parse(fs.readFileSync(configPath, {encoding:'utf8'}));
    var fm = new Freemarker({viewRoot: path.join(rootPath, config.ftlRoot)});
    var route = config.route;
    var realPath, buffer;

    for(var key in route){
        if(urlpath.indexOf(key) == 0){
            pathname = route[key];
            break;
        }
    }

    // ftl-suite api
    if(pathname.indexOf('/fsapi/') == 0 && req.method == 'POST'){
        buffer = '';
        switch(pathname){
            case '/fsapi/savefile':
                bodyParse(req, function(body){
                    fs.writeFile(path.join(rootPath, body.path), body.cont, function(err, data){
                        res.writeHead(200, {'Content-Type' : 'application/json; charset=UTF-8'});
                        res.write(err ? '{"code":500,"msg":"'+ String(err) +'"}' : '{"code":200,"msg":"success"}');
                        res.end();
                    });
                });
                break;
        }
        return;
    }

    // remote
    if(config.proxyPre && new RegExp('^\/'+ config.proxyPre +'\/').test(pathname) || config.proxyArr.indexOf(pathname) >= 0){
        if(!config.remoteHost){
            res.end('remoteHost is not set in fsconfig.json');
        }
        if(req.method == 'GET'){
            httphelper.get(config.remoteHost  + urlpath, 5000, function (err, data){
                if(req.headers['x-requested-with'] == 'XMLHttpRequest'){
                    res.writeHead(200, {'Content-Type' : 'application/json; charset=UTF-8'});
                }
                res.end(err ? 'server error' : data);
            }, 'utf-8' ,{
                'User-Agent': req['headers']['user-agent'],
                'Cookie': req.headers.cookie || ''
            });
        }else{
            buffer = '';
            req.on('data',function(rawData){
                buffer += rawData;
            });
            req.on('end', function(){
                httphelper.post(config.remoteHost  + urlpath, 10000, (function(){
                    var data = {};
                    buffer.split('&').forEach(function(kv){
                        kv = kv.split('=');
                        data[kv[0]] = kv[1];
                    });
                    return data;
                }()), function (err, data){
                    if(req.headers['x-requested-with'] == 'XMLHttpRequest'){
                        res.writeHead(200, {'Content-Type' : 'application/json; charset=UTF-8'});
                    }
                    res.end(err ? 'server error' : data);
                }, 'utf-8' ,{
                    'User-Agent': req['headers']['user-agent'],
                    'Cookie': req.headers.cookie || ''
                });
            });
        }
        return;
    }

    // local
    /\/$/.test(pathname) && (pathname += 'index.html');

    if(/^\/(static|src|mock|html?|tools?|mockadmin)\//.test(pathname) || pathname == '/fsconfig.json'){
        if(pathname.indexOf('/mockadmin/') == 0){
            realPath = path.join(__dirname, 'admin', pathname.replace(/^\/mockadmin\//, ''));
        }else{
            realPath = path.join(rootPath, pathname);
        }
        readstatic(realPath, function(ret){
            res.writeHead(ret.code, {'Content-Type': ret.mime});
            res.end(ret.data);
        });
    }else{
        // render freemarker
        var ftl = pathname.replace(/\.html?$/,'.ftl');
        fs.readFile(path.join(rootPath, 'mock/data', ftl), {encoding:'utf8'}, function(err, data){
            var ftlData = err ? {} : JSON.parse(data);
            fm.render(ftl, ftlData, function (err, data, out){
                res.end(err ? out : data);
            });
        });
    }
});

console.log('==============================\n'+
    'fsconfig.json created,\n'+
    'you can edit it directly or browse "/mockadmin/"'+
    '\n==============================');

console.log(('Service started at 127.0.0.1:' + port + '...').cyan);

server.listen(port, '127.0.0.1');