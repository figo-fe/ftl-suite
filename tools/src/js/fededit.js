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
};

// 载入符合规范的schema
$.get('/fsapi/filelist?ext=ftl&dir=ftl&t='+(+new Date),function(ret){
    var options = '<option value="null">选择已有Schema（将同时加载同名extra.ftl）</option>';

    if(ret.code == 200){
        ret.data.forEach(function(v){
            if(/\.schema\.ftl$/.test(v)){
                options += '<option>/'+ v +'</option>';
            }
        });
        schemaUrl.innerHTML = options;
        $('#schemaUrl').select2();
    }else{
        alert(ret.msg);
    }
});

$('#loadSchema').on('click',function(){
    var url = $('#schemaUrl').val();
    if(url !== 'null'){
        $.get(url, function (data){
            aceEditor.setValue(data);
            $('#loadJsonEditor').trigger('click');
            $.get(url.replace('.schema.ftl', '.extra.ftl'), function(data){
                if(data.indexOf('Failed!\nSource file not found:') == -1){
                    $('#extraCode').html($(data));
                }
            });
        });
    }else{
        alert('请先选择schema再导入');
    }
    return false;
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