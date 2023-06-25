'use strict';
const fs = require("fs");
const path = require("path");
let openPrefabUuid;

let copyProperty = (function(){
	let copyProperty={};
	//id映射类名
	let idToClassDic={};
	//id映射预制体路径
	copyProperty.idToPathDic={};
	
	let jsList = [];
	
	//加载预制体路径
	copyProperty.loadPath = function(filePath){
		let files = fs.readFileSync(filePath,"utf8");
		let content = JSON.parse(files);
		let obj = {};
		Object.keys(content).forEach((fileName)=>{
			if(path.extname(fileName) == ".prefab"){				//预制体
				obj[content[fileName].uuid] = fileName;
			}
		});
		this.idToPathDic = obj;
	}
	
	
	//加载类名
	copyProperty.loadClass = function(filePath){
		let files = fs.readdirSync(filePath);
		let self = this;
		files.forEach((fileName)=>{
			if(path.extname(fileName) == ".js"){				//js文件
				self.parseClassName(filePath+"/"+fileName);
			}else if(fs.statSync(filePath+"/"+fileName).isDirectory()){	//文件夹
				self.loadClass(filePath+"/"+fileName);
			}
		});
	}
	
	
	var regexp = /_cclegacy\._RF\.push.*\);/g;
	//解析id 类名
	copyProperty.parseClassName = function(classidFile){
		let data = fs.readFileSync(classidFile);
		if(regexp.test(data.toString())){
			let cStr = data.toString().match(regexp);
			let sps;
			cStr.forEach((cS)=>{
				cS=cS.replaceAll("'","").replaceAll(" ","").replaceAll('"',"");
				sps = cS.split(',');
				idToClassDic[sps[1]]=sps[2]
			})
		}
	}
	
	
	copyProperty.start = function(prefabPath){	
		let data = fs.readFileSync(prefabPath);
		jsList = JSON.parse(data.toString());
		let proName;
		jsList.forEach((js,idx)=>{
			proName = js._name;
			if(proName){
				if (proName.indexOf("node")!=-1){
					parseNode(proName,js)
				}else if (proName.indexOf("lbl")!=-1){
					parseBuiltinComponent(proName,'cc.Label',js)
				}else if (proName.indexOf("rich")!=-1){
					parseBuiltinComponent(proName,'cc.RichText',js)
				}else if (proName.indexOf("img")!=-1){
					parseBuiltinComponent(proName,'cc.Sprite',js)
				}else if (proName.indexOf("item")!=-1){
					parseCustomComponent(proName,js)
				}else if (proName.indexOf("extend")!=-1){	//自定义模板 根据命名规则来获取固定的 组件类名
					parseCustomComponent(proName,js,'TestExtend')
				}
			}else if(js.value){//3.0嵌套预制体
				parsePrefab(js.value,js,idx);
			}
		})
	}
	
	//3.0嵌套预制体
	function parsePrefab(value,js,idx){
		if(typeof(value) == "string"){
			if (value.indexOf("item")!=-1){
				parsePrefabCustomComponent(value,js,'',idx)
			}else if (value.indexOf("extend")!=-1){	//自定义模板 根据命名规则来获取固定的 组件类名
				parsePrefabCustomComponent(value,js,'TestExtend',idx)
			}
		}
		
	}
	
	//解析嵌套预制体用户自定义脚本组件
	function parsePrefabCustomComponent(name,json,type='',idx){
		try{
			let obj = jsList[json.targetInfo.__id__];
			if(obj.__type__ == "cc.TargetInfo"){
				let localId = obj.localID[0];
				let temp;
				for(var i = 0;i<jsList.length;i++){
					temp = jsList[i];
					if(temp.fileId == localId){
						
						let propertys = jsList[temp.instance.__id__].propertyOverrides;
						for(var j = 0;j<propertys.length;j++){
							if(propertys[j].__id__ == idx){
								
								let prefabFile = copyProperty.idToPathDic[temp.asset.__uuid__];
								let data = fs.readFileSync(prefabFile);
								let list = JSON.parse(data.toString());
								let item = list[1];
								type=findCustomType(item,list,type,false);
								if (type != ''){
									let tempJson = {
										_name:name,
										_parent:{
											__id__:temp.root.__id__
										}
									};
									let content = `private get ${name}() : ${type} {return ComponentFindUtils.find<${type}>("${findPath(tempJson)}",${type},this);}`
									console.log(content);
								}
								return;
							}
						}
					}
				}
				
			}
			
		}catch(e){
			console.log(e);
		}
	}
	
	
	//解析node组件
	function parseNode(name,json){
		let type = 'Node';
		let content = `private get ${name}() : ${type} {return ComponentFindUtils.findNode("${findPath(json)}",this);}`;
		console.log(content);
	}
	
	//解析内置组件
	function parseBuiltinComponent(name,type,json){
		type = findType(type,json);
		if (type != ''){
			type = type.replace("cc.","");
			let content = `private get ${name}() : ${type} {return ComponentFindUtils.find<${type}>("${findPath(json)}",${type},this);}`
			console.log(content);
		}
	}
	
	//解析用户自定义脚本组件
	function parseCustomComponent(name,json,type=''){
		type=findCustomType(json,jsList,type);
		if (type != ''){
			let content = `private get ${name}() : ${type} {return ComponentFindUtils.find<${type}>("${findPath(json)}",${type},this);}`
			console.log(content);
		}
	}
	
	//查找组件node 路径
	function findPath(json){
		let str = json._name || "";
		let idx = json._parent.__id__;
		try{
			if(idx != 1){
				let path = findPath(jsList[idx]);
				if(str != "" && path != ""){
					return path+"/"+str
				}else if(path != ""){
					return path;
				}else{
					return str;
				}
			}
		}catch(e){
			console.log(e);
		}
		return str
	}
	
	//查找组件类型
	function findType(type,json){
		try{
			let item,tempType;
			for(var i=0;i<json._components.length;i++){
				item = json._components[i];
				tempType = jsList[item.__id__].__type__;
				if(tempType.indexOf(type) != -1){
					return tempType;
				}
			}
		}catch(e){
			console.log(e);
		}
		return ''
	}
	
	//查找自定义组件类型
	function findCustomType(json,list,typeName='',isCheckPrefab = true){
		try{
			if(isCheckPrefab && json._parent == null){
				return ''
			}
			
			let item,className,id;
			for(var i=0;i<json._components.length;i++){
				item = json._components[i];
				id = list[item.__id__].__type__;
				if(id.indexOf("cc.") == -1){
					className = idToClassDic[id];
					if(typeName == '' && className){
						return className;
					}else if(className && className == typeName){
						return className;
					}
				}
			}
		}catch(e){
			console.log(e);
		}
		return ''
		
	}
	return copyProperty;
})();

module.exports = {
  load() {
  // 当 package 被正确加载的时候执行
	//let filePath = Editor.Project.path+"/temp/programming/packer-driver/targets/editor/mods/fs/0/assets/Scripts";
	let filePath = Editor.Project.path+"/temp/programming/packer-driver/targets/editor/chunks";
	let filePrefabPath = Editor.Project.path+"/library/.assets-info.json";
	copyProperty.loadClass(filePath);
	copyProperty.loadPath(filePrefabPath);
  },

  unload() {
    // 当 package 被正确卸载的时候执行
  },
  
  methods: {
    'start' (){
		if(!openPrefabUuid){
    		console.log('请重新打开预制体');
    		return;
    	}
		let prefabFile = copyProperty.idToPathDic[openPrefabUuid];
    	if(!prefabFile){
    	// 当 package 被正确加载的时候执行
			//let filePath = Editor.Project.path+"/temp/programming/packer-driver/targets/editor/mods/fs/0/assets/Scripts";
			let filePath = Editor.Project.path+"/temp/programming/packer-driver/targets/editor/chunks";
			let filePrefabPath = Editor.Project.path+"/library/.assets-info.json";
			copyProperty.loadClass(filePath);
			copyProperty.loadPath(filePrefabPath);
			
			prefabFile = copyProperty.idToPathDic[openPrefabUuid];
			if(!prefabFile){
				console.log('场景暂时不支持');
				return;
			}
    	}
		copyProperty.start(prefabFile);
    },
    'openPrefab' (d,s){
    	openPrefabUuid = d;
    }
  },
};



