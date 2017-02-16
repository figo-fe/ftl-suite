var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var qs = require('querystring');
var glob = require('glob');
var objExtend = require('extend');
var rootPath = process.cwd();
var configPath = path.join(rootPath, 'fsconfig.json');
var Freemarker = require('./freemarker');
var httphelper = require('./lib/httphelper');
var readstatic = require('./lib/readstatic');
var port = process.env.PORT || 9090;

var defaultCfg = {
    ftlRoot: 'ftl',
    route: {},
    globalData: {}
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

try{
    fs.mkdirSync(path.join(rootPath, 'mock'));
    fs.mkdirSync(path.join(rootPath, 'mock','data'));
    fs.mkdirSync(path.join(rootPath, 'mock','ajax'));
}catch(e){}

var server = http.createServer(function(req, res){
    var urlPath = url.parse(req.url).path;
    var config = JSON.parse(fs.readFileSync(configPath, {encoding:'utf8'}));
    var fm = new Freemarker({viewRoot: path.join(rootPath, config.ftlRoot)});
    var route = config.route;
    var pathname, realPath, urlReplaced;

    // fix favicon.ico request
    if(urlPath == '/favicon.ico'){
        res.end('');
        return;
    }

    // route
    for(var urlReg in route){
        urlReplaced = route[urlReg]; 
        urlReg = new RegExp('^'+ urlReg.replace(/\//g,'\/') +'$');
        if(urlReg.test(urlPath)){
            urlPath = urlPath.replace(urlReg, urlReplaced);
            break;
        }
    }

    pathname = urlPath.split('?')[0];

    /\/$/.test(pathname) && (pathname += 'index.html');

    // ftl-suite api
    if(pathname.indexOf('/fsapi/') == 0){
        res.writeHead(200, {'Content-Type' : 'application/json; charset=UTF-8'});
        switch(pathname){
            case '/fsapi/savefile':
                bodyParse(req, function(body){
                    fs.writeFile(path.join(rootPath, body.path), body.cont, function(err, data){
                        res.end(err ? '{"code":500,"msg":"'+ String(err) +'"}' : '{"code":200,"msg":"success"}');
                    });
                });
                break;
            case '/fsapi/filelist':
                (function(){
                    var rootDir = urlPath.match(/dir=([^&]+)/)[1];
                    glob('**/*.json',{
                        cwd: path.join(rootPath, rootDir),
                        nodir: true
                    }, function(err, files){
                        res.end(err ? '{"code":500,"msg":"'+ String(err) +'"}' : JSON.stringify({
                            code: 200,
                            msg: 'success',
                            data: files
                        }));
                    })
                }());
                break;
        }
        return;
    }

    // remote
    if(/^https?:\/\//.test(urlPath)){

        if(req.method == 'GET'){
            httphelper.get(urlPath, 5000, function (err, data){
                if(req.headers['x-requested-with'] == 'XMLHttpRequest'){
                    res.writeHead(200, {'Content-Type' : 'application/json; charset=UTF-8'});
                }
                res.end(err ? 'server error' : data);
            }, 'utf-8' ,{
                'User-Agent': req['headers']['user-agent'],
                'Cookie': req.headers.cookie || ''
            });
        }else if(req.method == 'POST'){
            bodyParse(req, function(postData){
                httphelper.post(urlPath, 10000, postData, function (err, data){
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
        fs.readFile(path.join(rootPath, 'mock/data', ftl.replace(/\.ftl$/,'.json')), {encoding:'utf8'}, function(err, data){
            var ftlData = err ? {} : data;
            try{
                ftlData = JSON.parse(ftlData);
            }catch(e){
                ftlData = {};
            };
            fm.render(ftl, objExtend(config.globalData, ftlData), function (err, data, out){
                res.end(err ? out : data);
            });
        });
    }
});

console.log(('Started server on http://127.0.0.1:' + port + '...').cyan);

server.listen(port, '127.0.0.1');
server.on('error', function(err){
    console.log(err.toString().red);
});