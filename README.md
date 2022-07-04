# cocos-copyPrefabName
cocos复制预制体节点名称插件
将该文件夹放入到 ~/.CocosCreator/packages（Windows 用户为 C:\Users\${你的用户名}\.CocosCreator\packages），或者放入到 ${你的项目路径}/packages 文件夹下即可完成扩展包的安装。

根据命名规则 输出预制体 节点名  （随意嵌套） 输出的变量名字 采用get方式，即用即获取，获取后会缓存，二次获取不会消耗性能
现有命名 节点名字包含（node、lbl、img、item）
node = cc.Node
lbl = cc.Label
img = cc.Sprite
item = 用户自定义脚本（如果挂在多个自定义脚本 会默认取 第一个自定义脚本为类型）

extend 扩展参考（如果挂在多个自定义脚本 也会精准获取 组件脚本类名） 

自定义模板 根据命名来获取固定的 组件类名称 
    参考main.js 的copyProperty.start函数   
    if (proName.indexOf("extend")!=-1){	


将下面脚本放入你的 逻辑类内 ， 最好放在自己框架的组件基类里
=========================================================

 	/**属性字典 */
    private proDic:Map<string,cc.Component>;
    public constructor() {
        super();
        this.proDic = new Map<string,cc.Component>();
    }
     public onDestroy(): void {
        this.proDic && this.proDic.clear();
        this.proDic = null;
    }

 	/**
     * 查找子项，并缓存
     */
     public findNode(path:string):cc.Node {
        let key:string = path;
        if(this.proDic.has(key)){
            return this.proDic.get(key) as any;
        }
        var tempNode:any = cc.find(path,this.node);
        if(tempNode != null){
            this.proDic.set(key,tempNode);
            return tempNode;
        }
        return null;
    }

    /**
     * 查找子项组件，并缓存
     */
     public find<T extends cc.Component>(path:string,type?:any):T {
        let key:string = path+type.name;
        if(this.proDic.has(key)){
            return <T>this.proDic.get(key);
        }
        var tempNode:cc.Node = cc.find(path,this.node);
        if(tempNode != null){
            if(type == null){
                return tempNode as any;
            }
            var component = tempNode.getComponent<T>(type)
            if(component != null){
                this.proDic.set(key,component);
                return component;
            }
        }
        return null;
    }
