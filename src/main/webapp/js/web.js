var param_cnt = 0;
$(function(){
	//自动监听 键盘 Enter事件
	document.onkeydown = function(e){ 
	    var ev = document.all ? window.event : e;
	    if(ev.keyCode==13) {
	    	$("#http_test").click();
	     }
	}
	//参数添加
	$("#add_url_parameter").click(function() {
		var input_len = $("#params_table input").size();
		param_cnt++;
		add_parameter(param_cnt, "", "","");
	});
	//批量添加参数
	$('#add_raw_url_parameter').click(function() {
        $('body').dialogbox({type:"text",title:"批量添加Body参数",message:"输入Raw参数，例如：id=123&sale=yes&deleted=0"}, function($btn, $ans) {
            if($btn == "close") {
                return;
            }
            else if($btn == "ok") {
                var raw = $ans;
			  	if (raw == null || raw == "") {
			  		return;
			    }
			    var params = str_2_params(raw);
			    if (params) {
			    	for (var i = 0; i < params.length; i++) {
			    		param_cnt++;
			    		add_parameter(param_cnt, params[i]['name'], params[i]['value'],"");
			    	};
			    }
            }
        });
	});
	//批量删除参数
	$('#delete_raw_url_parameter').click(function() {
		$(".params_p").remove();
	});
	function str_2_params(str) {
		try {
			var params = new Array();
			var ps = str.split("&");
			var pv = null;
			for (var i = 0; i < ps.length; i++) {
				pv = ps[i].split("=");
				params.push({
					name: pv[0],
					value: pv[1],
					method: "post"
				})
			}
			return params
		} catch (e) {
			return false
		}
	}
	//发送请求
	$("#http_test").click(function() {
		var http_url = $("#http_url_input").val();
		var method = $("#api_method").val();
		var all_params = get_all_parameters();
		if (is_empty(http_url)) {
			alert("接口链接为空,请填写后再请求！");
			return
		}
		if (all_params === false) {
			alert("参数填写为空,请填写完整之后再试！");
			return
		}
		if(all_params.length == 0){
			alert("请先添加参数,之后再试！");
			return
		}
		
		executeApiTest(http_url,method,encryptParams(all_params));
	});
	
	//取到所有的body参数
	function get_all_parameters() {
		var flag = true;
		var params = new Array();
		$(".params_p").each(function() {
			var cnt = $(this).attr("cnt");
			var name = $(this).find("input[name=p_name_" + cnt + "]").val();
			var value = $(this).find("input[name=p_value_" + cnt + "]").val();
			var encrypt_value ='';
			var checkflag = $("input[name='encrypt_"+cnt+"'").is(':checked');
			if(checkflag){
				encrypt_value = "1";
			}
			if (is_empty(name)) {
				flag = false;
			}
			if(is_empty(value)){
				value = null;
			}
			params.push({
				name: name,
				value: value,
				encrypt:encrypt_value
			})
		});
		if(!flag){
			return flag;
		}else{
			return params;
		}
		
	}
	//参数rsa私钥加密  Encrypt with the public key...
	function encryptParams(params){
		var encrypt = new JSEncrypt();
	    encrypt.setPrivateKey($('#private').val());
		for(var i = 0; i<params.length; i++){
			if(!is_empty(params[i].value)){
				if(params[i].encrypt =='1'){
					 var encrypted = encrypt.encrypt(params[i].value);
					 params[i].value = encrypted;
				}
			}
		}
		return params;
	}
	//过滤response返回的json 串，再对返回的json数据递归遍历 过滤出需要解密的字段属性
	function analysisData(data){
		var decrypts = $("#decryptparams").val();
		var keyvalues = new Array();
		//f(data,decrypts,keyvalues);
	    var str = JSON.stringify(data,null, "\t");
	    return str;
	}
	//参数rsa私钥解密  Decrypt with the public key...
	function decryptParams(encrypted){
		var decrypt = new JSEncrypt();
	    decrypt.setPrivateKey($('#private').val());
	    var uncrypted = decrypt.decrypt(encrypted);
	    return uncrypted;
	}
	
	//递归遍历算法，匹配需要解密的key值，然后解密
	 function f (json,decryptparams,keyvalues){
		 if(json.length){
			 for(var i=0;i < json.length; i++){
				 for(var key in json[i]){
					if(json[i][key] instanceof Object){
						f(json[i][key],decryptparams,keyvalues);
					}else{
						if(decryptparams.indexOf(key) != -1){
							//rsa解密
							json[i][key] = decryptParams(json[i][key]);
						}
						keyvalues.push({
							name: key,
							value: json[i][key],
						})
					}
				 }
			 }
		 }else{
			 for(var key in json){
				 if(json[key] instanceof Object){
						f(json[key],decryptparams,keyvalues);
				 }else{
					 if(decryptparams.indexOf(key) != -1){
						//rsa解密
						 json[key] = decryptParams(json[key]);
					 }
					 keyvalues.push({
							name: key,
							value: json[key],
						})
				 }
			 }
		 }
	 }
	//对response 返回的json数据进行签名校验
	function checkoutSign(data){
		var decrypts = $("#decryptparams").val();
		var flag = false;
		var signparam = '';
		var keyvalues = new Array();
		f(data,decrypts,keyvalues);
		//判断data中是否包含 sign 字段
		for(var i = 0;i<keyvalues.length;i++){
			if(keyvalues[i].name == 'sign'){
				flag = true;
				signparam = keyvalues[i].value;
			}
		}
		if(flag){
			//得到参数签名
			var md5sign = getParamSign(keyvalues);
			if(md5sign==signparam){
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
		
		
	}
	//得到参数签名
	function getParamSign(params){
		var sign ='';
		params = sortParams(params);
		for(var i = 0;i<params.length;i++){
			if(!is_empty(params[i].value)&&(params[i].name != 'sign')){
				sign = sign +params[i].name+'='+params[i].value+'&';
			}
		}
		var md5key = $("#Md5key").val();
		//截取最后一个字符‘&’
		sign = sign.substr(0,sign.length-1)+md5key;
		sign = $.md5(sign); 
		return sign;
	}
	//得到参数字典排序后的参数列表
	function sortParams(params){
		var sort_name = new Array();
		var sort_params = new Array();
		for(var i = 0; i < params.length; i++){
			sort_name.push(params[i].name+','+i);
		}
		//参数名字典顺序排序
		sort_name.sort();
		for (var i = 0; i < sort_name.length; i++) {
			var ps = sort_name[i].split(",");
			var a = ps[1];
			sort_params.push({
				name: ps[0],
				value: params[a].value,
				encrypt:params[a].encrypt
			})
		}
		return sort_params;
	}
	
	function params_2_str(params) {
		var str = "";
		for (var i = 0; i < params.length; i++) {
			var p = params[i];
			if (p.name) {
				str = str + "&" + p.name + "=" + p.value
			}
		}
		if (str.length > 1) {
			str = str.substring(1)
		}
		return str
	}
	
	function is_empty(str) {
		if (str == null || str == "" || str == "undefined") {
			return true
		}
		return false
	}
	
	//执行接口测试
	function executeApiTest(http_url,method,all_params) {
		$("#response_header").html("执行中，请等待...");
	    var start = new Date().getTime();//起始时间
		$("#output").val("");
		var sign = getParamSign(all_params);
		var params ='{';
		for(var i = 0 ;i<all_params.length;i++){
			params = params+'"' + all_params[i].name + '":"' + all_params[i].value + '",'; 
			if(i == all_params.length-1){
				params = params + '"sign'+ '":"' + sign + '"'; 
				params = params + "}";
			}
		}
		var jsonparam = eval("("+params+")");
		$.ajax({
	        url: http_url,
	        async: true,
	        type: method,
	        data: jsonparam,
	        dataType: 'json',
	        success: function (data) {
	        	//校验签名，判断是否是来自服务器的正常数据
	        	if(checkoutSign(data)){
	        		 //对需要解密的参数进行过滤并且解密
		     	   	var resultstr = analysisData(data);
	        	}else{
	        		 //对需要解密的参数进行过滤并且解密
		     	   	var resultstr = "签名校验失败！";
	        	}
	     	    var end = new Date().getTime();//接受时间
	     	    var exectime =  (end - start)+"ms";//返回函数执行需要时间
	     	   	$("#output").val(resultstr);
	        	$("#response_header").html("执行完毕!<br><br>"
	        			+"耗时："+exectime);
	        },
	        error:function (jqXHR, textStatus, errorThrown) {
	        	var end = new Date().getTime();//接受时间
	     	    var exectime =  (end - start)+"ms";//返回函数执行需要时间
	        	$("#response_header").html("<p>...执行完毕!</p><br>"
	        					+"<p><span class = 'statustext'>HTTP状态码 :</span>"+jqXHR.status+"</p><br>"
	        				    +"<p><span class = 'statustext'>状态码的错误信息 :</span>"+jqXHR.statusText+"</p><br>"
	        					+"<p><span class = 'statustext'>textStatus :</span>"+textStatus+"</p><br>"
	        					+"<p><span class = 'statustext'>errorThrown :</span>"+errorThrown+"</p><br>"
	        					+"<p><span class = 'statustext'>耗时：</span>"+exectime+"</p>");
	        }
	    });
	}
});
function add_parameter(cnt, name, value,encrypt) {
	
	if (name == "undefined" || name == null) {
		name = ""
	}
	if (value == "undefined" || value == null) {
		value = ""
	}
	
	$("#params_end").before(
	        '<tr class="params_p" cnt="' + cnt + '">' +
	        '<td>' +
	        '<input class="params_name input-text" type="text" name="p_name_' + cnt + '" title="参数名称" alt="参数名称" value="' + name + '" maxlength="100"/>' +
	        '</td>' +
	        '<td>' +
	        '<input class="params_value input-text" type="text" name="p_value_' + cnt + '" title="参数数值" alt="参数数值" value="' + value + '" maxlength="5000"/>' +
	        '<button class="button danger tiny" onclick="javascript:del_param(this);" type="button">删除参数' +
	        '</button>' +
	        '</td>' +
	        '<td>'+ 
	        '<label style="font-size: 20px;"><input name="encrypt_'+ cnt +'" type="checkbox" value="1" class ="checkboxstyle"/>rsa</label>'+
	        '</td>'+
	        '</tr>');
	//返显是否是加密，加密打钩
	if(encrypt == "rsa"){
		 $("input[name='encrypt_"+cnt+"'").attr("checked", true);
	}
}
//删除参数
function del_param(obj) {
	$(obj).parent().parent().remove();
}
//改变select-api列表
function apichange(){
	$(".params_p").remove();//清空参数列表
	var apiselected =  $("#api_list").find("option:selected").text();
	var selectedvalue = $("#api_list").val();
	$(".spanapi").text(apiselected);
	$.ajax({
        url: 'toIndex',
        async: true,
        type: 'POST',
        data: {
        },
        dataType: 'json',
        success: function (data) {
        	var apilist = data[0].api_list;
        	for(var i = 0;i < apilist.length;i++){
        		if(apilist[i].name == selectedvalue ){
        			var parameters = apilist[i].parameters;
        			for(var a = 0; a<parameters.length; a++){
        				param_cnt++;
        				add_parameter(param_cnt, parameters[a].name, parameters[a].description,parameters[a].encrypt_type);
        			}
        		}
        	}
        },
        error: function(){
        	
        }
    });
}