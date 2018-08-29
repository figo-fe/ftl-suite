const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const qs = require('querystring');
const objExtend = require('extend');
const glob = require('glob');
const request = require('superagent');
const Freemarker = require('freemarker.js');

const readstatic = require('./lib/readstatic');
const rootPath = process.cwd();
const configPath = path.join(rootPath, 'fsconfig.json');

const port = process.env.PORT || 9090;

const defaultCfg = {
    ftlRoot: 'ftl',
    cmsDomain: '',
    route: {},
    globalData: {}
};

const bodyParse = function(req, fn){
    let arr = [];
    req.on('data', function(data){
        arr.push(data);
    });
    req.on('end', function(){
        let data = Buffer.concat(arr).toString(),ret;
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

// create config file fsconfig.json
fs.existsSync(configPath) || fs.writeFile(configPath, JSON.stringify(defaultCfg, null, 4), () => {});

try{
    fs.mkdirSync(path.join(rootPath, 'mock'));
    fs.mkdirSync(path.join(rootPath, 'mock','data'));
    fs.mkdirSync(path.join(rootPath, 'mock','ajax'));
}catch(e){}

const server = http.createServer(function(req, res){
    let urlPath = url.parse(req.url).path;
    let config = JSON.parse(fs.readFileSync(configPath, {encoding:'utf8'}));
    let fm = new Freemarker({viewRoot: path.join(rootPath, config.ftlRoot)});
    let route = config.route;
    let pathname, realPath, urlReplaced;

    // fix favicon.ico request
    if(urlPath == '/favicon.ico') return res.end('');

    // route
    for(let urlReg in route){
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
                    let rootDir = urlPath.match(/dir=([^&]+)/)[1];
                    let ext = (urlPath.match(/ext=([^&]+)/) || []).pop() || 'json';
                    let filter = '**/*.' + ext;

                    glob(filter, {
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
    if(/^https?:\/\//.test(urlPath) || /^\/cms\/ajax\//.test(urlPath)){

        // 兼容代理CMS接口
        if(!/^http/.test(config.cmsDomain)){
            return res.end('Please define cmsDomain of fsconfig.json, like "http://cms.game-test.sogou-inc.com"');
        }

        urlPath = /^http/.test(urlPath) ? urlPath : (config.cmsDomain + urlPath);

        if(req.headers['x-requested-with'] == 'XMLHttpRequest'){
            res.writeHead(200, {'Content-Type' : 'application/json; charset=UTF-8'});
        }

        if(req.method == 'GET'){
            request.get(urlPath)
                .set('User-Agent', req['headers']['user-agent'])
                .set('Cookie', req.headers.cookie || '')
                .end((err, resp) => res.end(err ? 'server error' : resp.text));
        }else if(req.method == 'POST'){
            bodyParse(req, function(postData){
                request.post(urlPath)
                    .send(postData)
                    .set('User-Agent', req['headers']['user-agent'])
                    .set('Cookie', req.headers.cookie || '')
                    .end((err, resp) => res.end(err ? 'server error' : resp.text));
            });
        }
        return;
    }

    // local
    if(/^\/(static|src|mock|html?|tools?|_tools)\//.test(pathname) || pathname == '/fsconfig.json'){
        if(pathname.indexOf('/_tools/') == 0){
            realPath = path.join(__dirname, 'tools', pathname.replace(/^\/_tools\//, ''));
        }else{
            realPath = path.join(rootPath, pathname);
        }
        readstatic(realPath, function(ret){
            res.writeHead(ret.code, {'Content-Type': ret.mime + '; charset=UTF-8'});
            res.end(ret.data);
        });
    }else{
        // render freemarker
        let ftl = pathname.replace(/\.html?$/,'.ftl');
        fs.readFile(path.join(rootPath, 'mock/data', ftl.replace(/\.ftl$/,'.json')), {encoding:'utf8'}, function(err, data){
            let ftlData = err ? {} : data;
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