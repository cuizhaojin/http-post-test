<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>restful 调试工具</title>
<link rel="stylesheet" href="css/web.css"/>
<link rel="stylesheet" href="css/jquery.dialogbox.css"/>
<script type="text/javascript" src="js/jquery-1.9.1.min.js"></script>
<script type="text/javascript" src="js/jquery.dialogbox.js"></script>
<script type="text/javascript" src="js/jsencrypt.min.js"></script>
<script type="text/javascript" src="js/jquery.md5.js"></script>
<script type="text/javascript" src="js/web.js"></script>
<script type="text/javascript">
$(function(){
	/*初始化页面参数列表*/
	$.ajax({
        url: 'toIndex',
        async: true,
        type: 'POST',
        data: {
        },
        dataType: 'json',
        success: function (data) {
        	initApiList(data[0].api_list);
        	initDecryptParams(data[1].decryptset);
        },
        error: function(){
        	
        }
    });
	//初始化接口列表
	function initApiList(obj){
		for (var i=0;i<obj.length;i++)
		{
			$("#api_list").append("<option value='"+obj[i].name+"'>"+obj[i].api_descr+"</option>");
		}
	}
	//初始化需要解密参数集合
	function initDecryptParams(obj){
		var decryptparams = '';
		for (var i = 0 ;i < obj.length; i++)
	    {
			decryptparams = decryptparams + obj[i].decryptname + ',';
	    }
		decryptparams = decryptparams.substr(0,decryptparams.length-1);
		$("body").prepend("<input type='hidden'  id = 'decryptparams' name = 'decryptparams' value='"+decryptparams+"'/>");
	}
});
</script>
</head>
<body>
<input type="hidden"  id = "public" name = "publickey" value="MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAIQnw04/F7YpKK4VOyEDu5j3Y5zmXvSst/BcnbGqv7kzzeQu/XKdBwuC9ypkKVhB0P7HZzf3giJnwTj/WtRfIjECAwEAAQ=="/>
<input type="hidden"  id = "private" name = "privatekey" value="MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEAhCfDTj8XtikorhU7IQO7mPdjnOZe9Ky38Fydsaq/uTPN5C79cp0HC4L3KmQpWEHQ/sdnN/eCImfBOP9a1F8iMQIDAQABAkA3eVF8aPOVHZXb7UGSzDRVM5N26yT05AOaO+ZeC+TK4p+YSrWzlZJaqkYhPyJV/KBi0aaHCZ1/tqBIBfYDI8eBAiEAu+Cf3AAvzBgRQ//19/9HXrVGPVxyFlvMf63vdnu7HckCIQC0EtYT0hia0O7Hn8hB3TQVH6Dm7Kk0rHTODaf3K7b1KQIhAJTPPS9fQnyQj5Rht6w/mYMNZ94QTBkjit2SojohlLrpAiB+4a7aNHWF0KYPHrTaQ+UI5UpYrHTlWobLEbBCZxj5UQIgLR8xkv5JbfLtUbKupgIp3Fk4eBdOSBEMViXx7feTy6M="/>
<input type="hidden"  id = "Md5key" name = "Md5key" value="123456"/>
	<div class="container">
		<h3 style="text-align: center;margin: 30px 0;">restful 接口 测试页</h3>
		<ol id="manual" class="manual">
			<b>使用说明：</b>
			<li>（1）选择合适的接口。</li>
			<li>（2）系统会生成该接口的参数表，您也可以直接添加参数并在文本框内填入对应的参数值。</li>
			<li>（3）测试页参数需要rsa加密的请自行勾选。</li>
			<li>（4）点击发送<span style="color: blue">(或按回车键)</span>请求按钮，即可得到相应的调试信息。</li>
		</ol>
		
		<form class = "form">
			<div style="margin: 10px 0;">
				<div class ="optiondiv">
					<select class="select" id="api_method" >
						<option value="GET">GET</option>
						<option value="POST" selected="">POST</option>
					</select>
				</div>
				<div class="http">
					<input type="text" class="input-text" id="http_url_input"
						title="HTTP接口URL" alt="HTTP接口URL" value="" placeholder="http://">
				</div>
				<button class="button success small" id="http_test" type="button">发送请求</button>
			</div>
			<div style="margin: 10px 0;">
				<div class ="optiondiv">
					<select class="select" id="api_list" onchange="apichange()">
						<option value="select" selected="">请选择接口</option>
					</select>
				</div>
				<div class="http">
					<span class="spanapi">请选择接口</span>
				</div>
			</div>
			<table id="params_table" class="table table-bordered" style="margin-bottom: 25px;">
				<thead>
					<tr class ="table_tr">
						<th width="35%">Body参数名称</th>
						<th>Body参数值</th>
						<th>是否rsa加密</th>
					</tr>
				</thead>
				<tbody>
					<tr id="params_end">
						<td colspan="3">
							<button class="button primary small" id="add_url_parameter"
								type="button">添加参数</button>
							<button class="button success small" id="add_raw_url_parameter"
								type="button">RAW批量添加</button>
							<button class="button delete small" id="delete_raw_url_parameter"
								type="button">RAW批量删除</button>
						</td>
					</tr>
				</tbody>
			</table>
			<table id="response_table" class="table table-bordered" style="table-layout:fixed;">
					<thead>
				        <tr>
				            <th width="35%">Response Status</th>
				            <th>Response Body</th>
				        </tr>
				    </thead>
				    <tbody>
				    	<tr>
				        	<td valign="top" id="response_header" style="word-wrap:break-word;"></td>
				        	<td valign="top">
				        		<textarea id="output"></textarea>
				        	</td>
				        </tr>
				    </tbody>
				</table>
		</form>
	</div>
</html>