
import { _decorator, Component, Node, Label, Sprite, Vec2, Vec3 } from 'cc';
import ComponentFindUtils from './ComponentFindUtils';
import { TestPrefabNodeName } from './TestPrefabNodeName';
const { ccclass, property } = _decorator;

@ccclass('TestExtend')
export class TestExtend extends Component {
    public refreshView():void
    {
        console.log(this.name+"__刷新成功");
    }
}