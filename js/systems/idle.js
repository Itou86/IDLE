/* ===== 放置收益系统 ===== */
const IdleSystem = {
    // 基础配置
    BASE_CLICK_GOLD: 2,      // 点击基础收益(原1)
    BASE_AUTO_GOLD: 1,       // 自动基础收益(原0，初始给1)
    
    // 升级配置
    clickUpgrade: {
        baseCost: 5,         // 初始价格(原10)
        costMultiplier: 1.3,  // 价格增长倍数(原1.5)
        valuePerLevel: 1,     // 每级增加点击收益
    },
    
    autoUpgrade: {
        baseCost: 20,        // 初始价格(原50)
        costMultiplier: 1.5,  // 价格增长倍数(原1.8)
        valuePerLevel: 1,     // 每级增加每秒收益
    },

    // 点击赚钱
    click: function(gameState) {
        const clickLevel = gameState.idle?.clickLevel || 0;
        const goldPerClick = this.BASE_CLICK_GOLD + clickLevel * this.clickUpgrade.valuePerLevel;
        gameState.gold += goldPerClick;
        gameState.stats.goldTotal += goldPerClick;
        return goldPerClick;
    },

    // 获取每秒自动收益
    getAutoGoldPerSecond: function(gameState) {
        const autoLevel = gameState.idle?.autoLevel || 0;
        return this.BASE_AUTO_GOLD + autoLevel * this.autoUpgrade.valuePerLevel;
    },

    // 计算离线收益
    calculateOfflineGold: function(gameState) {
        const now = Date.now();
        const lastTime = gameState.stats.lastSaveTime || now;
        const offlineSeconds = Math.floor((now - lastTime) / 1000);
        
        // 最多计算8小时的离线收益
        const maxOfflineSeconds = 8 * 3600;
        const effectiveSeconds = Math.min(offlineSeconds, maxOfflineSeconds);
        
        const goldPerSecond = this.getAutoGoldPerSecond(gameState);
        const offlineGold = effectiveSeconds * goldPerSecond;
        
        return {
            gold: offlineGold,
            seconds: effectiveSeconds,
            capped: offlineSeconds > maxOfflineSeconds
        };
    },

    // 应用离线收益
    applyOfflineGold: function(gameState) {
        const result = this.calculateOfflineGold(gameState);
        if (result.gold > 0) {
            gameState.gold += result.gold;
            gameState.stats.goldTotal += result.gold;
        }
        return result;
    },

    // 获取升级A价格
    getClickUpgradeCost: function(gameState) {
        const level = gameState.idle?.clickLevel || 0;
        return Math.floor(this.clickUpgrade.baseCost * Math.pow(this.clickUpgrade.costMultiplier, level));
    },

    // 获取升级B价格
    getAutoUpgradeCost: function(gameState) {
        const level = gameState.idle?.autoLevel || 0;
        return Math.floor(this.autoUpgrade.baseCost * Math.pow(this.autoUpgrade.costMultiplier, level));
    },

    // 购买升级A
    buyClickUpgrade: function(gameState) {
        const cost = this.getClickUpgradeCost(gameState);
        if (gameState.gold < cost) {
            return { success: false, reason: '金币不足' };
        }
        
        gameState.gold -= cost;
        if (!gameState.idle) gameState.idle = {};
        gameState.idle.clickLevel = (gameState.idle.clickLevel || 0) + 1;
        
        return { 
            success: true, 
            newLevel: gameState.idle.clickLevel,
            newValue: this.BASE_CLICK_GOLD + gameState.idle.clickLevel * this.clickUpgrade.valuePerLevel
        };
    },

    // 购买升级B
    buyAutoUpgrade: function(gameState) {
        const cost = this.getAutoUpgradeCost(gameState);
        if (gameState.gold < cost) {
            return { success: false, reason: '金币不足' };
        }
        
        gameState.gold -= cost;
        if (!gameState.idle) gameState.idle = {};
        gameState.idle.autoLevel = (gameState.idle.autoLevel || 0) + 1;
        
        return { 
            success: true, 
            newLevel: gameState.idle.autoLevel,
            newValue: this.BASE_AUTO_GOLD + gameState.idle.autoLevel * this.autoUpgrade.valuePerLevel
        };
    },

    // 获取当前收益信息（用于UI显示）
    getInfo: function(gameState) {
        const clickLevel = gameState.idle?.clickLevel || 0;
        const autoLevel = gameState.idle?.autoLevel || 0;
        
        return {
            clickValue: this.BASE_CLICK_GOLD + clickLevel * this.clickUpgrade.valuePerLevel,
            autoValue: this.BASE_AUTO_GOLD + autoLevel * this.autoUpgrade.valuePerLevel,
            clickLevel: clickLevel,
            autoLevel: autoLevel,
            clickUpgradeCost: this.getClickUpgradeCost(gameState),
            autoUpgradeCost: this.getAutoUpgradeCost(gameState),
            canAffordClick: gameState.gold >= this.getClickUpgradeCost(gameState),
            canAffordAuto: gameState.gold >= this.getAutoUpgradeCost(gameState)
        };
    }
};
