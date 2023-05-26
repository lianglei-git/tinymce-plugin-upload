使用方法：将解压得到的文件夹，放到TinyMCE主目录下的plugins文件夹内。

```js 
tinymce.init({
    selector: '#custom-plugin',
    plugins: 'tinymce_plugin_upload', 
    toolbar: 'tinymce_plugin_upload',
    // attachment_max_size: 10485760, // 可选  文档大小
    // attachment_load_types: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],// 可选  文档类型
    /**
     * res -- object ↓ key -- guide
     *       close         --> 关闭探窗
     *       fd            --> 上传文件的对象(FormData)
     *       openTips      --> tips提示窗  --> 参数 {text: 提示文本, type: 提示类型(error,warning,success), timeout: 显示时长}
     *       insertinymceontent --> 往编辑器里面添加内容， 可直接传入html类型字符串; 插入的时候光标已经滞后， 无需考虑! 
     *       editor        --> 编辑器实例对象         
     */
    attachment_upload_handler(res) { // 上传回调
    // 上传完成之后需要关闭弹窗, 有两种方式  
    //                                  第一种: 应用Promise resolve出来参数， 参数为 true
    //                                  第二种: 使用抛出对象中close 手动关闭
        return new Promise(res => {
            setTimeout(() => {
                res('我返回给你啦啦啦啦啦')
            }, 3000)
        })
    }
}); ```


