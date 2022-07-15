# cocos-copyPrefabName
cocos复制预制体节点名称插件
2.x将该文件夹放入到 ~/.CocosCreator/packages（Windows 用户为 C:\Users\${你的用户名}\.CocosCreator\packages），或者放入到 ${项目路径}/packages 文件夹下即可完成扩展包的安装。
使用方法 打开预制体 ，点击 扩展/输出预制体节点名

3.x将该文件夹放入到Windows：%USERPROFILE%\.CocosCreator\extensions;MacOS：$HOME/.CocosCreator/extensions，或者放入到${项目目录}/extensions 文件夹下即可完成扩展包的安装。
使用方法 打开预制体 ，点击 Extension/copy-prefab-name

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

