var Difficult = cc.Enum({
    Simple: 1000,
    Ordinary: 2500,
    Difficult: 5000
});

cc.Class({
    extends: cc.Component,

    properties: {
        hammer: {
            default: null,
            type: cc.Prefab
        },

        countDown: {
            default: null,
            type: cc.Prefab
        },

        gameOver: {
            default: null,
            type: cc.Prefab
        },

        mouseNodes: {
            default: null,
            type: cc.Node
        },

        animalAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },

        animalDeathAtlas: {
            default: null,
            type: cc.SpriteAtlas
        },

        timeRollerBar: {
            default: null,
            type: cc.Sprite
        },

        icon: {
            default: null,
            type: cc.SpriteAtlas
        },

        gameRule: {
            default: null,
            type: cc.SpriteFrame
        },

        gameScore: {
            default: null,
            type: cc.Label
        },

        timeRollerStep: {
            default: 1,
            range: [0, 2, 0.1],
            slide: true
        },

        gameScoreEffect: {
            default: null,
            type: cc.Prefab
        },
        
        gameDifficultScore:{
            default: Difficult.Simple,
            type: Difficult,
            tooltip: "Simple:2000\n Ordinary:4000\n Difficult:6000",
        },

        gameGitHubUrl:"",

        _isCollider: false,
        _mouseNode: null,
        _mouseIndexArr: [],
        _times: 0,
        _isRunning: true,
        _score: 0
    },

    start () {
        this.initGameData();
        this.initEventListener();
    },

    initGameData () {
        for (let i = 0; i < this.mouseNodes.childrenCount; i++) {
            this.mouseNodes.children[i].getChildByName("Sp Mouse")._isCollider = false;
            this.mouseNodes.children[i].getChildByName("Sp Mouse")._isLive = false;
        }
        this._mouseDataTable = [
            {
                mouseName: "harmful_mouse_0",
                scoreUpdateFunc: function () {
                    this._score += 100;
                }
            },
            {
                mouseName: "harmful_mouse_1",
                scoreUpdateFunc: function () {
                    this._score += 500;
                }
            },
            {
                mouseName: "kind_mouse_0",
                scoreUpdateFunc: function () {
                    if (this._score === 0) {
                        this._score += 200;
                    }
                    else {
                        this._score = Math.floor(this._score * 1.2);
                    }
                }
            },
            {
                mouseName: "kind_mouse_1",
                scoreUpdateFunc: function () {
                    this._score -= 100;
                }
            },
            {
                mouseName: "rabbit_0",
                scoreUpdateFunc: function () {
                    this._score = Math.floor(this._score / 2);
                }
            }
        ];
    },

    initEventListener () {
        this.node.on(cc.Node.EventType.MOUSE_MOVE, (event)=>{
            this.onBeCreateHammerEvent(event.getLocation());
        },this);

        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event)=>{
            this.onBeCreateHammerEvent(event.getLocation());
        },this);

        this.node.on(cc.Node.EventType.TOUCH_START, (event)=>{
            this.onBeCreateHammerEvent(event.getLocation());
            this.onHammerClicked();
            if (this.gameRuleNode) {
                var gameRuleFadeOut = cc.fadeOut(1);
                this.gameRuleNode.runAction(gameRuleFadeOut);
            }
        },this);

        this.node.on(cc.Node.EventType.TOUCH_END, (event)=>{
            this.onHammerClicked();
        },this);
        
        for (let i = 0; i < this.mouseNodes.childrenCount; i++) {
            this.mouseNodes.children[i].getChildByName("Sp Mouse").getComponent(cc.Animation).on(cc.Animation.EventType.FINISHED, this.onAnimationFinishEvent, this);
        }
    },

    unEventListener () {
        this.node.targetOff(this);
        for (let i = 0; i < this.mouseNodes.childrenCount; i++) {
            this.mouseNodes.children[i].getChildByName("Sp Mouse").getComponent(cc.Animation).targetOff(this);
        }
    },

    startGame () {
        this.initMouseOutEvent();
    },
    
    initMouseOutEvent () {
        if (this._mouseIndexArr.length === 0) {
            let mouseAmount = Math.ceil(Math.random() * (this.mouseNodes.childrenCount - 1));
            
            if (mouseAmount === 0) {
                mouseAmount = 1;
            }
            
            for (let i = 0; i < 5; i++) {
                let randomNodeIndex = Math.ceil(Math.random() * (this.mouseNodes.childrenCount - 1));
                let randomSpriteFrameIndex = Math.ceil(Math.random() * (this.animalAtlas.getSpriteFrames().length - 1))
                
                if (this._mouseIndexArr.indexOf(randomNodeIndex) === -1) {
                    var mouseNode = this.mouseNodes.children[randomNodeIndex].getChildByName("Sp Mouse");
                    this.updateMouseNodeInfo(mouseNode, randomSpriteFrameIndex);
                    mouseNode.getComponent(cc.BoxCollider).enabled = true;
                    this._mouseIndexArr.push(randomNodeIndex);
                    mouseNode.getComponent(cc.Sprite).spriteFrame = this.animalAtlas.getSpriteFrames()[randomSpriteFrameIndex];
                    mouseNode.getComponent(cc.Animation).play();
                }
            }
        }
    },

    startTimeRoller () {
        var times = 3;
        this.timeRollerBar.fillStart = 0;
        this.schedule(()=> {
            if (times !== 0) {
                if (!this.countDownNode) {
                    this.countDownNode = cc.instantiate(this.countDown);
                    this.node.addChild(this.countDownNode);
                }
                this.countDownNode.getChildByName("Sp Num").opacity = 255;
                this.countDownNode.getChildByName("Nodes Start").opacity = 0;
                let spriteFrameName = "num_" + times;
                this.countDownNode.getChildByName("Sp Num").getComponent(cc.Sprite).spriteFrame = this.icon.getSpriteFrame(spriteFrameName);
                this.node.getComponent("SoundManager").playEffectSound("second", false);
            }
            else {
                this.countDownNode.getChildByName("Sp Num").opacity = 0;
                this.countDownNode.getChildByName("Nodes Start").opacity = 255;
                this.node.getComponent("SoundManager").playEffectSound("begin", false);
                this.countDownNode.runAction(cc.fadeOut(1));
                this.schedule(this.countDownScheduleCallBack, this.timeRollerStep);
                this.startGame();
            }
            times--;
        }, 1, 3);
    },

    countDownScheduleCallBack () {
        this.timeRollerBar.fillStart += 0.01;
        if (this.timeRollerBar.fillStart === this.timeRollerBar.fillRange) {
            this.unschedule(this.countDownScheduleCallBack);
            this.unEventListener();
            if (this._score > this.gameDifficultScore) {
                this.passGame();
            }
            else {
                if (!this.gameOverNode) {
                    this.gameOverNode = cc.instantiate(this.gameOver);
                    this.node.addChild(this.gameOverNode);
                }
                this.gameOverNode.opacity = 255;
                this.gameOverNode.runAction(cc.fadeOut(1.5));
                this.loseGame();
            }
            this.onFinishGameEvent();
        }
    },

    updateMouseNodeInfo(mouseNode, tag) {
        mouseNode._isLive = true;
        mouseNode._scoreUpdateFunc = this._mouseDataTable[tag].scoreUpdateFunc.bind(this);
        mouseNode._tag = tag;
    },

    onAnimationFinishEvent () {
        this._mouseIndexArr.pop();
        this.initMouseOutEvent();
    },

    onBeCreateHammerEvent (position) {
        if (!cc.isValid(this.hammerNode)) {
            this.hammerNode = cc.instantiate(this.hammer);
            this.hammerNode.zIndex = cc.macro.MAX_ZINDEX;
            this.hammerNode._isCollider = false;
            this.node.addChild(this.hammerNode);
        }
        this.hammerNode.position = this.node.convertToNodeSpaceAR(position);
    },

    onHammerClicked () {
        this.hammerNode.angle = this.hammerNode.angle === 0 ? 30 : 0;
        this.node.getComponent("SoundManager").playEffectSound("hit");
        if (this._mouseNode && this._mouseNode._isCollider && this._mouseNode._isLive && cc.find("Canvas/Sp Game Bg")) {
            this.node.getComponent("SoundManager").playEffectSound("hit");
            this.node.getComponent("SoundManager").playEffectSound("score");
            this._mouseNode._scoreUpdateFunc();
            this.showScoreEffectByTag(this._mouseNode, this._mouseNode.parent.getChildByName("Nodes Score Effect"));
            this._score = this._score < 0 ? 0 : this._score; 
            this.gameScore.string = this._score;
            this._mouseNode._isLive = false;
            let oldSpriteFrameName = this._mouseNode.getComponent(cc.Sprite).spriteFrame.name;
            let newSpriteFrameName = oldSpriteFrameName + "_death";
            this._mouseNode.getComponent(cc.Sprite).spriteFrame = this.animalDeathAtlas.getSpriteFrame(newSpriteFrameName);
            this._mouseNode.getChildByName("Anima Start").getComponent(cc.Animation).play();
        }
    },

    showScoreEffectByTag (node, scoreEffectNode) {
        for (let i = 0; i < scoreEffectNode.childrenCount; i++) {
            scoreEffectNode.children[i].opacity = node._tag === i ? 255 : 0;
            scoreEffectNode.children[i].runAction(cc.fadeOut(1));
        }
    },

    onGamePlayButtonClicked() {
        this.node.getComponent("SoundManager").playBackGroupSound();
        cc.find("Canvas/Sp Hall Bg").active = false;
        cc.find("Canvas/Sp Game Bg").active = true;
        this.startTimeRoller();
    },

    onGameRuleButtonClicked () {
        this.node.getComponent("SoundManager").playEffectSound("click", false);
        if (!this.gameRuleNode) {
            this.gameRuleNode = new cc.Node();
            this.gameRuleNode.addComponent(cc.Sprite).spriteFrame = this.gameRule;
            this.node.addChild(this.gameRuleNode);
        }
        this.gameRuleNode.opacity = 255;
    },

    onGameGitHubButtonClicked () {
        this.node.getComponent("SoundManager").playEffectSound("click", false);
        if (cc.sys.isBrowser) {
            cc.sys.openURL(this.gameGitHubUrl);
        }
    },

    onBackHallButtonClicked () {
        cc.director.loadScene("Game");
    },

    onSwitchMusicVolume (event) {
        this.node.getComponent("SoundManager").playEffectSound("click");
        this.node.getComponent("SoundManager")._isPlaying = !this.node.getComponent("SoundManager")._isPlaying;
        if (this.node.getComponent("SoundManager")._isPlaying) {
            event.target.getComponent(cc.Sprite).spriteFrame = this.icon.getSpriteFrame("sound_close");
            this.node.getComponent("SoundManager").stopAll();
        }
        else {
            event.target.getComponent(cc.Sprite).spriteFrame = this.icon.getSpriteFrame("sound_open");
            this.node.getComponent("SoundManager").playBackGroupSound();
        }
    },
    
    passGame() {
        this.node.getComponent("SoundManager").playEffectSound("pass", false);
    },

    loseGame () {
        this.node.getComponent("SoundManager").playEffectSound("lose", false);
    },

    onFinishGameEvent () {
        for (let i = 0; i < this.mouseNodes.childrenCount; i++) {
            this.mouseNodes.children[i].getChildByName("Sp Mouse").getComponent(cc.Animation).stop();
        }
        setTimeout(()=>{
            cc.director.loadScene("Game");
        },2000);
    }
});
