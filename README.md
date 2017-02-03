#Freemarker Development Suite (ftl-suite)
> Make freemarker development efficiently and conveniently

## How to use? Only 3 steps!
1. Make sure Java is installed on your machine (version 1.4 or later)
2. Install ftl-suite `npm install ftl-suite --save-dev`
3. Start services `[PORT=80] node node_modules/ftl-suite`

## Feature
1. Render FTLs in local server without IDE
2. Analog data based on interface documentation, parallel development with back-end
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
    proxyPrefix: '',
    proxyList: [],
    route: {},
    globalData: {}
}
```

### ftlRoot
freemarker root folder, e.g.
```
ftl
../main/ftl
....
```

### remoteHost
Ajax remote server, Support URL and IP, e.g.
```
xx.com
http://xx.com
https://xx.com
123.123.123.123
http://123.123.123.123
....
```

### proxyPrefix
Prefix of proxy URL, e.g.
```
single:
api => /api/xxx/xxx
ajax => /ajax/xxx/xxx

multiple:
(api|ajax) => /(api|ajax)/xxx/xxx
```

### proxyList
Customize URLs need to proxy, e.g.
```
[
    "/api/login/info",
    "/api/login/check"
]
```

### route
URL Rewrite map, e.g.
```
{
    "/user/home": "/html/user/home/main.html"
}
```

**You can edit all configurations by visiting http://127.0.0.1/mockadmin/**

## Rendering
When you visit an URL in browser, the service will find the appropriate FTL, rendering from a json file in the same path in "mock/data".

e.g.

```
visit: /main/index.html
ftl: /ftl/main/index.ftl
data: /mock/data/main/index.json
```

Note:

1. Prefixed with "static|src|mock|html?|tools?" will return static files
2. To avoid errors, it is recommended to use the "mockadmin" to edit configuration
3. Create Date Model like: "2017-01-01 00:00:00?dt"

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