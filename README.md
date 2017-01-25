#Freemarker Develop Suite (ftl-suite)
> Make front-end freemarker template developing efficiently and conveniently

## How to use, only 3 steps:
1. Make sure Java is installed on your machine (version 1.4 or later)
2. Install ftl-suite `npm install ftl-suite --save-dev`
3. Start services `[PORT=80] node node_modules/ftl-suite`

## Feature
1. Render ftl files in local server without IDE
2. According to the interface document mock data, parallel development with back-end
3. Proxy Ajax to the remote server
4. URL Rewrite
5. Restore the online environment perfectly

## Configurations
When you start the service for the first time, ftl-suite will create a config file named **fsconfig.json**. You can edit it directly or visit http://127.0.0.1/mockadmin/ (Add the Port if it is not 80)

Default config:
```
{
    ftlRoot: 'ftl',
    remoteHost: '',
    proxyPre: '',
    proxyArr: [],
    route: {}
}
```

### ftlRoot
freemarker root folder, E.g.
```
ftl
../main/ftl
....
```

### remoteHost
Ajax remote server, Support URL and IP, E.g.
```
xx.com
http://xx.com
https://xx.com
123.123.123.123
http://123.123.123.123
....
```

### proxyPre
Prefix of proxy URL, E.g.
```
single:
api => /api/xxx/xxx
ajax => /ajax/xxx/xxx

multiple:
(api|ajax) => /(api|ajax)/xxx/xxx
```

### proxyArr
Customize URLs need to proxy, E.g.
```
[
    "/api/login/info",
    "/api/login/check"
]
```

### route
URL Rewrite map, E.g.
```
{
    "/user/home": "/html/user/home/main.html"
}
```

**You can edit all configurations by visiting http://127.0.0.1/mockadmin/**

## Note
1. Prefixed with "static|src|mock|html?|tools?" will return static files
2. To avoid errors, it is recommended to use the "mockadmin" to edit configuration
3. You can find more surprise in index.js

## MIT License

Copyright (c) 2017

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.