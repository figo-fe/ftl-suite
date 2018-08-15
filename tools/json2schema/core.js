var getType = function(data){
    if(typeof data == 'object'){
        return toString.call(data) == '[object Array]' ? 'array' : 'object';
    }else{
        return typeof data;
    }
};
var dataHandle = {
    number: function(schema, data){
        schema.type = 'string';
        schema.title = '标题';
        schema.description = '描述，不需要请删除';
        return schema;
    },
    string: function(schema, data){
        schema.type = 'string';
        schema.title = '标题';
        schema.description = '描述，不需要请删除';
        if(/\.(jpe?g|png|gif)$/.test(data)){
            schema.format = 'upload';
            schema.links = [{
                mediaType: 'image',
                href: '{{self}}'
            }]
        }
        if(/\.(exe|swf|zip|rar)$/.test(data)){
            schema.format = 'upload';
        }
        if(/^20\d{2}-\d{2}-\d{2} [\d:]{8}$/.test(data)){
            schema.format = 'datepick';
        }
        return schema;
    },
    object: function(schema, data){
        schema.type = 'object';
        schema.title = '标题';
        schema.description = '描述，不需要请删除';
        schema.properties = {};
        for(var key in data){
            schema.properties[key] = dataHandle[getType(data[key])]({}, data[key]);
        }
        return schema;
    },
    array: function(schema, data){
        schema.type = 'array';
        schema.title = '标题';
        schema.description = '描述，不需要请删除';
        schema.format = 'table';
        schema.items = {};
        if(data[0] !== undefined){
            schema.items = dataHandle[getType(data[0])]({}, data[0]);
        }
        return schema;
    }
};
var convert = function(jsonData){
    var schemaBase = {title:"schema标题"};
    switch(getType(jsonData)){
        case 'array':
            schemaBase = dataHandle['array'](schemaBase, jsonData);
            break;
        case 'object':
            schemaBase = dataHandle['object'](schemaBase, jsonData);
            break;
    }
    return schemaBase;
};

var schemabox = document.getElementById('schema');

document.getElementById('jsonCon').onkeyup = _.debounce(function(){
    var data = {};
    try{
        data = JSON.parse(this.value);
        var json = convert(data);
        schemabox.innerHTML = JSON.stringify(json,null,4);
    }catch(e){
        schemabox.innerHTML = '请确保输入的json内容符合格式, \n' + e;
    }
    
},500);