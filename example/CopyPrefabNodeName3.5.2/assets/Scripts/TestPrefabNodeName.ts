
import { _decorator, Component, Node, Label, Sprite, Vec2, Vec3 } from 'cc';
import ComponentFindUtils from './ComponentFindUtils';
import { TestExtend } from './TestExtend';
import { TestItem } from './TestItem';
const { ccclass, property } = _decorator;

@ccclass('TestPrefabNodeName')
export class TestPrefabNodeName extends Component {
    private get imgTest() : Sprite {return ComponentFindUtils.find<Sprite>("Node/imgTest",Sprite,this);}
    private get lblTest() : Label {return ComponentFindUtils.find<Label>("Node/imgTest/lblTest",Label,this);}
    private get extendTest() : TestExtend {return ComponentFindUtils.find<TestExtend>("Node/extendTest",TestExtend,this);}
    private get nodeTest() : Node {return ComponentFindUtils.findNode("nodeTest",this);}
    private get itemTest() : TestItem {return ComponentFindUtils.find<TestItem>("nodeTest/itemTest",TestItem,this);}
    private get itemTestDisconnect() : TestItem {return ComponentFindUtils.find<TestItem>("itemTestDisconnect",TestItem,this);}
    private get lbl() : Label {return ComponentFindUtils.find<Label>("itemTestDisconnect/lbl",Label,this);}
    start () {
        this.lblTest.string = "testCopyPrefabNodeName";
        this.imgTest.node.position = new Vec3(100,-100,0);

        this.nodeTest.once(Node.EventType.TOUCH_END,this.close,this);
        
        this.lblTest.string = "testCopyPrefabNodeName123";

        this.itemTest.refreshView();
        this.extendTest.refreshView();
    }

    close(){
        this.node.parent?.removeChild(this.node);
        this.node.destroy();
    }

    onDestroy(){
        ComponentFindUtils.destroy(this);
    }
}