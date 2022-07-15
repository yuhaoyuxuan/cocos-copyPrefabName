import ComponentFindUtils from "./ComponentFindUtils";
import TestItem from "./TestItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestPrefabNodeName extends cc.Component {
        private get lblT() : cc.Label {return ComponentFindUtils.find<cc.Label>("New Node/lblT",cc.Label,this);}
        private get imgs() : cc.Sprite {return ComponentFindUtils.find<cc.Sprite>("New Node/lblT/imgs",cc.Sprite,this);}
        private get nodeTest() : cc.Node {return ComponentFindUtils.findNode("New Node/nodeTest",this);}
        private get itemTest() : TestItem {return ComponentFindUtils.find<TestItem>("New Node/nodeTest/Background/itemTest",TestItem,this);}
        private get lbl() : cc.Label {return ComponentFindUtils.find<cc.Label>("New Node/nodeTest/Background/itemTest/lbl",cc.Label,this);}

    start () {
        this.lblT.string = "testCopyPrefabNodeName";
        this.imgs.node.x = 300;

        this.nodeTest.once(cc.Node.EventType.TOUCH_END,this.close,this);
        
        this.lblT.string = "testCopyPrefabNodeName123";
        this.itemTest.refreshView();
    }

    close(){
        this.node.parent?.removeChild(this.node);
        this.node.destroy();
    }

    onDestroy(){
        ComponentFindUtils.destroy(this);
    }
}
