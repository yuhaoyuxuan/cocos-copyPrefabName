import ComponentFindUtils from "./ComponentFindUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TestItem extends cc.Component {
    private get lbl() : cc.Label {return ComponentFindUtils.find<cc.Label>("lbl",cc.Label,this);}

    public refreshView():void
    {
        this.lbl.string = "testItem";
    }

    onDestroy(){
        ComponentFindUtils.destroy(this);
    }
}
