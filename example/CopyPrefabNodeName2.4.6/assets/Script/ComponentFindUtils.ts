
/**
 *查找预制体节点组件 并缓存
 * @author slf
 */
export default class ComponentFindUtils{
    private static _cacheMap:Map<string,Map<string,any>> = new Map();

    /**
     * 查找节点组件
     * @param path 查找节点组件
     * @param target 节点的父组件
     * @param type 组件类型
     * @returns 
     */
    static find<T extends cc.Component>(path:string,type:any,target:cc.Component):T{
        let key:string = path+type.name;
        let cache = this.getCache(key,target);
        if(cache){
            return cache;
        }
       
        var tempNode:cc.Node = cc.find(path,target.node);
        if(tempNode != null){
            var component = tempNode.getComponent<T>(type)
            if(component != null){
                this.setCache(key,target,component);
                return component;
            }
        }
        return null as any;
    }

    /**
     * 查找节点
     * @param path 查找节点组件
     * @param target 节点的父组件
     * @returns 
     */
    static findNode(path:string,target:cc.Component):cc.Node
    {
        let cache = this.getCache(path,target);
        if(cache){
            return cache;
        }

        var tempNode:cc.Node = cc.find(path,target.node);
        if(tempNode != null){
            this.setCache(path,target,tempNode);
            return tempNode
        }
        return null as any;
    }

    /**
     * 销毁单个缓存map
     * @param target 节点的父组件 用与获取uuid
     */
    static destroy(target:cc.Component):void
    {
        let id = target.uuid;
        if(this._cacheMap.has(id)){
            this._cacheMap.delete(id);
        }
    }

    private static getCache(key:string,target:cc.Component):any
    {
        let id = target.uuid;
        if(this._cacheMap.has(id)){
            let tempMap:Map<string,any> = this._cacheMap.get(id) as Map<string,any>;
            if(tempMap.has(key)){
                return tempMap.get(key);
            }
        }
        return null;
    }

    private static setCache(key:string,target:cc.Component,component:any):void
    {
        let id = target.uuid;
        let tempMap:Map<string,any>;
        if(!this._cacheMap.has(id)){
            tempMap = new Map();
            this._cacheMap.set(id,tempMap);
        }else{
            tempMap = this._cacheMap.get(id) as Map<string,any>;;
        }

        if(!tempMap.has(key)){
            tempMap.set(key,component);
        }
    }

}