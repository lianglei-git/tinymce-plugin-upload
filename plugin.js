
Function.prototype.pluginBefore = function (fn) {
    let self = this
    return function (...args) {
        let res = fn.apply(null, args)
        return self.call(null, res)
    }
}

Function.prototype.pluginAfter = function (fn) {
    let self = this
    return function (...args) {
        let res = fn.apply(null, args)
        return self.call(null, res)
    }
}

const isPromise = p => Object.prototype.toString.call(p) == "[object Promise]"
const has = (tag, i) => Reflect.has(tag, i);
const get = (tag, i) => Reflect.get(tag, i);
const getEl = el => document.querySelector(el);

// const pluginFunc = new Map()

function goEnd(_editor) { // 光标滞后
    let s = _editor.getParam('selector')
    let editor = tinyMCE.editors[s.slice(1, s.length)];
    editor.execCommand('selectAll');
    editor.selection.getRng().collapse(false);
    editor.focus();
}

const loadFileing = (editor, fd) => {
    let uploadCal = editor.getParam('attachment_upload_handler') || (() => {})
    getEl('#butt').innerText = "导入中..."
    goEnd(editor)
    let p = uploadCal({
        editor,
        fd,
        close: editor.windowManager.close,
        openTips: editor.notificationManager.open,
        insertinymceontent: editor.insertinymceontent,
    }) 

    isPromise(p)
        ? p.then(res => {
            if (res) editor.windowManager.close()
        }) : console.warn('Please return Promise')
}

const loadFileBefore = (editor, files) => {
    const types = new Set(editor.getParam('attachment_load_types') || ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'])
    const fd = new FormData(document.forms[0])
    if (types.has(files[0].type)) {
        const maxSizeLimit =
            editor.getParam('attachment_max_size') || 10 * 1024 * 1024;
        if (files[0].size > maxSizeLimit) {
            editor.notificationManager.open({
                text: `附件最大支持 10MB ，超过 10MB 的附件将不会被上传。`,
                type: 'warning',
                timeout: 5000,
            });
        } else {
            fd.append(files[0].name, files[0])
            loadFileing(editor, fd)
        }

    } else {
        editor.notificationManager.open({
            text: `只支持doc,docx`,
            type: 'error',
            timeout: 1000,
        });
    }
}
tinymce.PluginManager.add('tinymce_plugin_upload', function (editor, url) {

    const close = editor.windowManager.close
    editor.windowManager.close = () => {
        getEl('#killFile').value = ""
        getEl('#butt').innerText = "选择文档"
        close()
    }

    const fileChange = _ => {// 仅支持单传
        let files = _.target.files || _.dataTransfer.files;
        if (files.length == 0) return
        if (files.length == 1) loadFileBefore(editor, files)
        else editor.notificationManager.open({
            text: `只能选择单独文件哦`,
            type: 'error',
            timeout: 1000,
        });
    }

    const _filc = e => {
        if (getEl('#butt').innerText === "导入中...") {
            editor.notificationManager.open({
                text: `文件正在上传中...`,
                type: 'warning',
                timeout: 5000,
            });
            return
        }
        let el = getEl("#killFile")
        el.click()
        el.addEventListener('change', es => fileChange.pluginBefore(es => es).pluginBefore(es => es)(es))
    }

    document.addEventListener('click', e => {
        if (has(e.target.dataset, 'type') && get(e.target.dataset, 'type') == '_sel') {
            if (e.isTrusted) _filc(e)
            else alert('禁止手动修改！')
        }
    })
    var openDialog = function () {
        return editor.windowManager.open({
            title: '文档导入',
            body: {
                type: 'panel',
                items: [
                    {
                        type: 'htmlpanel',
                        html: `
                        <div class="select-file">
                          <button id="butt" data-type="_sel">选择文档</button>
                          <input id="killFile" type="file" />
                          <p> 文档支持doc, docx格式导入,最大支持10MB </p>
                        </div>
                        `
                    }
                ]
            },
            buttons: [{
                type: 'cancel',
                text: '取消'
            },]
        });

    };

    editor.ui.registry.addButton('tinymce_plugin_upload', {
        text: '选择文件',
        onAction: function () {
            openDialog();
        }
    });

    editor.ui.registry.addMenuItem('tinymce_plugin_upload', {
        text: '选择文件',
        onAction: function () {
            openDialog();
        }
    });

    return {
        getMetadata: function () {
            return {
                name: "upload Word(doc, docx)",
                url: "http://www.sparrowend.com"
            };
        }
    };
});

