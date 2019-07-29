// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    editor: {
        menu: "CustomComponent/CollisionManagement",
    },

    properties: {
    },

    onLoad () {
        var colliderManager = cc.director.getCollisionManager();
        colliderManager.enabled = true;
        // colliderManager.enabledDebugDraw = true;
    },

    start () {
        this.gameComponent = cc.find("Canvas").getComponent("Game");
    },

    onCollisionEnter (other, self) {
        if (this.node.group === cc.game.groupList[1]) {
            this.node._isCollider = true;
            this.gameComponent._mouseNode = this.node;
        }
        else if (this.node.group === cc.game.groupList[2]) {
        
        }
    },

    onCollisionExit (other, self) {
        if (this.node.group === cc.game.groupList[1]) {
            this.node._isCollider = false;
        }
        else if (this.node.group === cc.game.groupList[2]) {

        }
    },

    initGroup () {
        if (this.editorGroup === Group.Default) {
            this.contrastGroup = this.GroupName[0];
        }
        else if (this.editorGroup === Group.Mouse) {
            this.contrastGroup = this.GroupName[1];
        }
        else if (this.editorGroup === Group.Hammer) {
            this.contrastGroup = this.GroupName[2];
        }
    }
    // update (dt) {},
});
