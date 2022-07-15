'use strict';
const fs = require("fs");
let openPrefabUuid;

let copyProperty = (function(){
	let copyProperty={};
	//id映射类名
	let idToClassDic={};
	let jsList = [];
	
	//解析id 类名
	copyProperty.init = function(classidFile){
		let data = fs.readFileSync(classidFile);
		let cStr = data.toString().match(/cc\._RF\.push.*\);/g);
		
		cStr.forEach((cS)=>{
			cS=cS.replaceAll("'","").replaceAll(" ","")
			idToClassDic[cS.split(',')[1]]=cS.split(',')[2].split(')')[0]
		})
	}
	
	
	copyProperty.start = function(prefabPath){	
		let data = fs.readFileSync(prefabPath);
		jsList = JSON.parse(data.toString());
		let proName;
		jsList.forEach((js)=>{
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
					parseCustomComponent(proName,js,'TTT')
				}
			}
		})
	}
	
	
	//解析node组件
	function parseNode(name,json){
		let type = 'cc.Node';
		let content = `private get ${name}() : ${type} {return ComponentFindUtils.findNode("${findPath(json)}",this);}`;
		Editor.info(content);
	}
	
	//解析内置组件
	function parseBuiltinComponent(name,type,json){
		type = findType(type,json);
		if (type != ''){
			let content = `private get ${name}() : ${type} {return ComponentFindUtils.find<${type}>("${findPath(json)}",${type},this);}`
			Editor.info(content);
		}
	}
	
	//解析用户自定义脚本组件
	function parseCustomComponent(name,json,type=''){
		type=findCustomType(json,type);
		if (type != ''){
			let content = `private get ${name}() : ${type} {return ComponentFindUtils.find<${type}>("${findPath(json)}",${type},this);}`
			Editor.info(content);
		}
	}
	
	//查找组件node 路径
	function findPath(json){
		let str = json._name;
		let idx = json._parent.__id__;
		try{
			if(idx != 1){
				return findPath(jsList[idx])+"/"+str
			}
		}catch(e){
			Editor.info(e);
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
			Editor.info(e);
		}
		return ''
	}
	
	//查找自定义组件类型
	function findCustomType(json,typeName=''){
		try{
			let item,className,id;
			for(var i=0;i<json._components.length;i++){
				item = json._components[i];
				id = jsList[item.__id__].__type__;
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
			Editor.info(e);
		}
		return ''
		
	}
	return copyProperty;
})();



module.exports = {
  load() {
    // 当 package 被正确加载的时候执行
	let classidFile = Editor.Project.path+"/temp/quick-scripts/dst/__qc_bundle__.js"
	copyProperty.init(classidFile);
  },

  unload() {
    // 当 package 被正确卸载的时候执行
  },
  messages: {
    'copy-prefab-name:start' (){
		let prefabFile = Editor.assetdb._uuid2path[openPrefabUuid];
    	if(!prefabFile){
    		Editor.info('请重新打开预制体');
    		return;
    	}
		copyProperty.start(prefabFile);
    },
    'scene:enter-prefab-edit-mode' (d,s){
    	openPrefabUuid = s;
    }
  },
};



