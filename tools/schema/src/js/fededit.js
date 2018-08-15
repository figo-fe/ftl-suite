var editor;

// Set default options
JSONEditor.defaults.theme = 'bootstrap3';
JSONEditor.defaults.iconlib = 'fontawesome4';
JSONEditor.plugins.ace.theme = 'monokai';

var AdminLTEOptions = {
    animationSpeed: 150
};
var aceEditor = ace.edit("aceEditor");
    aceEditor.setTheme("ace/theme/monokai");
    aceEditor.getSession().setMode("ace/mode/javascript");

var util = {
    kv: function (key){
        var _key = new RegExp("[?&]"+key+"=([^&]+)", "g").exec(location.href);
        if(_key){return _key[1];}else{return false;}
    }
}

$('#loadSchema').on('click',function(){
    var url = $('#schemaUrl').val();
    $.get(url,function (data){
        aceEditor.setValue(data);
    });
});

$('#saveSchema').on('click',function(){
    var path = $('#schemaUrl').val().replace('.html','.ftl');
    var code = aceEditor.getValue();
    if(confirm('注意，此处schema是ftl渲染后的代码，如果schema中有freemarker源代码请不要直接保存！确定保存？')){
        $.post('/_figoapi/saveSchema',{
            path: path,
            code: code
        }, function (data){
            alert(data);
        });
    }
});

$('#loadJsonEditor').on('click',function(){
    var schemaStr = aceEditor.getValue(),
        schema,startval;

    if(schemaStr){
        schema = JSON.parse(schemaStr);
        startval = editor ? editor.getValue() : undefined;
        if(editor) editor.destroy();
        editor = new JSONEditor(document.getElementById('editorHolder'), {
            disable_collapse: true,
            disable_edit_json: true,
            disable_properties: true,
            disable_array_add: false,
            keep_oneof_values: false,
            no_additional_properties: true,
            required_by_default: true,
            schema: schema || 0,
            startval: startval
        });

        window.editor = editor;
        $('#schemaBox').attr('class','col-md-5').hide();
        $('#jsonEditorBox').attr('class','col-md-12').show();
        aceEditor.resize();
    }
});
$('#checkMock').on('click',function(){
    if(editor && editor.getValue){
        var data = editor.getValue();
        console.log(data);
        console.log(JSON.stringify(data));
    }else{
        console.log('>>请检查是否初始化jsoneditor');
    }
});
$('#readMock').on('click',function(){
    var file = $('#mockFile').val();
    if(file){
        $.get('/_figoapi/readFtl',{
            ftl: file,
            t: +new Date
        },function (data){
            if(data.errcode == 'fail'){
                alert('读取失败，请检查文件是否存在');
            }else{
                editor && editor.setValue && editor.setValue(data);
            }
        },'json');
    }else{
        alert('mockFile不得为空')
    }
});
$('#openAce').on('click',function(){
    $(this).toggleClass('isopen');
    if($(this).hasClass('isopen')){
        $('#schemaBox').show();
        $('#jsonEditorBox').attr('class','col-md-7');
    }else{
        $('#schemaBox').hide();
        $('#jsonEditorBox').attr('class','col-md-12');
    }
    return false;
});
$('#saveMock').on('click',function(){
    if(editor && editor.getValue){
        var cont = JSON.stringify(editor.getValue());
        var file = $('#mockFile').val();
        if(!file){
            alert('mockFile不得为空');
            return;
        }
        console.log(cont);
        $.post('/_figoapi/saveFtl',{
            ftl: file,
            cont: cont
        },function (data){
            alert(data);
        });
    }
});

//import source
$('#importData').on('click',function(){
    $('#importForm').toggle();
});
$('#extraJs').on('click',function(){
    $('#extraJsBox').toggle();
});
$('#importGo').on('click',function(){
    var src = $('#sourceData').val();
    var fn = $('#convertFn').val();
    if(!src){alert('sourceData is empty');return;}
    $.get(src,function (data){
        if(fn.length){
            $.get(fn,function (convert){
                convert = eval(convert);
                data = convert(data);
                console.log(data);
                editor.setValue(data);
            });
        }else{
            editor.setValue(data);
        }
    },'json');
});
$('#extraJsGo').on('click',function(){
    $.get($('#extraJsUrl').val(),function (data){
        var js = document.createElement('script');
        js.appendChild(document.createTextNode(data));
        document.body.appendChild(js);
    });
});

// init Schema and Extrajs
var initSchemaUrl = util.kv('schema');
var extraUrl = util.kv('extra');
if(initSchemaUrl){
    $.get(initSchemaUrl,function (data){
        aceEditor.setValue(data);
        $('#loadJsonEditor').trigger('click');
        if(extraUrl){
            $('#extraJsUrl').val(extraUrl);
            $('#extraJsGo').trigger('click');
        }
    });
}