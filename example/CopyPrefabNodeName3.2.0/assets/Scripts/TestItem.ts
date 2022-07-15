
import { _decorator, Component, Node, Label, Sprite, Vec2, Vec3 } from 'cc';
import ComponentFindUtils from './ComponentFindUtils';
import { TestPrefabNodeName } from './TestPrefabNodeName';
const { ccclass, property } = _decorator;

@ccclass('TestItem')
export class TestItem extends Component {
    private get lbl() : Label {return ComponentFindUtils.find<Label>("lbl",Label,this);}
    public refreshView():void
    {
        this.lbl.string = "testItem";
    }

    onDestroy(){
        ComponentFindUtils.destroy(this);
    }
}