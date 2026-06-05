/* ===== 游戏主入口 ===== */
const Game = {
    // 游戏状态
    state: null,

    // 初始化
    init: function() {
        // 初始化效果注册表（必须在任何系统操作之前）
        if (typeof EffectRegistry !== 'undefined' && EffectRegistry.init) {
            EffectRegistry.init();
        }

        this.load();
        if (!this.state) {
            this.reset();
        }
        this._createToastContainer();
        this._initMobileTabs();
        // 恢复上次保存的视图（默认抽取）
        const savedView = this.state.currentView || 'gacha';
        this.switchView(savedView);
        this.render();

        // 自动保存（每30秒）
        setInterval(() => this.save(), 30000);

        // 离线收益计算
        this._calcOfflineEarnings();

        // 启动自动收益和商店计时器
        this._startAutoTick();
        this._startShopTimer();
    },

    // 创建存档
    reset: function() {
        this.state = {
            points: 50,          // 初始系统点(原100，降低因为点击收益高了)
            shards: 20,          // 初始世界碎片(原10，让玩家能抽20次)
            world: 1,            // 当前世界
            subStage: 1,          // 当前世界内的子关卡
            worldProgress: {},    // 各世界最高通关进度 { "1": 5 }
            cards: {},           // 拥有的卡牌
            achievements: {},    // 已解锁成就
            idle: {              // 初始放置等级
                clickLevel: 0,
                autoLevel: 1     // 初始自动收益1级
            },
            stats: {
                pointsTotal: 50,
                gachaCount: 0,
                battleWin: 0,
                battleLose: 0,
                loseStreak: 0,
                streakNoRare: 0,
                streakNoSSR: 0,
                rarityObtained: {},
                lastSaveTime: Date.now(),
                createTime: Date.now(),
                // 隐藏成就追踪
                gachaSingleSSR: false,      // hid_002: 是否单抽过SSR
                underdogWin: false,         // hid_008: 是否低战力获胜过
                clickSpamCount: 0,          // hid_009: 点击计数
                clickSpamStartTime: 0       // hid_009: 点击计时起点
            },
            saveVersion: SaveSystem.CURRENT_VERSION, // 存档版本号
            currentView: 'gacha'   // 默认显示抽取视图
        };
        this.save();
        this.render();
        this.showToast('系统已重置', 'info');
    },

    // 保存
    save: function() {
        if (!this.state) return;
        this.state.stats.lastSaveTime = Date.now();
        SaveSystem.save(this.state);
        this.showToast('已保存', 'info');
    },

    // 读取
    load: function() {
        this.state = SaveSystem.load();
        if (this.state) {
            this.render();
            this.showToast('存档已读取', 'info');
        }
    },

    // ===== 核心操作 =====

    // 抽卡 (count=1 单抽, count=10 十连)
    gacha: function(count) {
        count = parseInt(count, 10) || 1;
        const result = GachaSystem.draw(this.state, count);
        if (!result.success) {
            this.showToast(result.reason, 'error');
            return;
        }

        // 显示结果
        const resultDiv = document.getElementById('gacha-result');
        
        // 如果是十连，显示汇总
        if (count === 10) {
            const rarityCount = {};
            for (const card of result.cards) {
                rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1;
            }
            const summaryEl = document.createElement('div');
            summaryEl.className = 'gacha-summary';
            summaryEl.style.cssText = 'background:#1a1a2e;padding:8px 12px;margin:4px 0;border-radius:6px;border-left:3px solid #ffd54f;';
            let summaryText = '🎉 十连抽结果: ';
            const parts = [];
            if (rarityCount.SSR) parts.push(`<span style="color:#ffd54f">SSR×${rarityCount.SSR}</span>`);
            if (rarityCount.SR) parts.push(`<span style="color:#ba68c8">SR×${rarityCount.SR}</span>`);
            if (rarityCount.R) parts.push(`<span style="color:#4fc3f7">R×${rarityCount.R}</span>`);
            if (rarityCount.N) parts.push(`<span style="color:#888">N×${rarityCount.N}</span>`);
            summaryText += parts.join(' ');
            summaryEl.innerHTML = summaryText;
            resultDiv.insertBefore(summaryEl, resultDiv.firstChild);
            
            // 显示每张卡
            for (const card of result.cards) {
                const rarityInfo = CARD_CONFIG.rarityStyle[card.rarity];
                const cardEl = document.createElement('div');
                cardEl.className = `card-item rarity-${card.rarity}`;
                cardEl.innerHTML = `
                    <span style="color:${rarityInfo.color}">●</span>
                    ${card.name} <small>(${rarityInfo.name})</small>
                `;
                resultDiv.insertBefore(cardEl, resultDiv.firstChild);
            }
            
            // SSR特殊提示
            if (rarityCount.SSR > 0) {
                const ssrCards = result.cards.filter(c => c.rarity === 'SSR');
                this.showToast(`🎉 恭喜获得 ${rarityCount.SSR} 张SSR！${ssrCards.map(c => c.name).join('、')}`, 'achievement');
            }
        } else {
            // 单抽显示
            const card = result.cards[0];
            const rarityInfo = CARD_CONFIG.rarityStyle[card.rarity];
            const cardEl = document.createElement('div');
            cardEl.className = `card-item rarity-${card.rarity}`;
            cardEl.innerHTML = `
                <span style="color:${rarityInfo.color}">●</span>
                ${card.name} <small>(${rarityInfo.name})</small>
            `;
            resultDiv.insertBefore(cardEl, resultDiv.firstChild);
            
            if (card.rarity === 'SSR') {
                this.showToast(`🎉 恭喜获得 SSR：${card.name}！`, 'achievement');
            }
        }
        
        // 限制显示数量
        while (resultDiv.children.length > 15) {
            resultDiv.removeChild(resultDiv.lastChild);
        }

        // 记录隐藏成就数据
        if (count === 1) {
            const hasSSR = result.cards.some(c => c.rarity === 'SSR');
            if (hasSSR) {
                this.state.stats.gachaSingleSSR = true;
            }
        }

        // 记录日志
        if (count === 10) {
            const rarityCount = {};
            for (const card of result.cards) {
                rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1;
            }
            let logMsg = `🎲 十连抽: `;
            const parts = [];
            if (rarityCount.SSR) parts.push(`SSR×${rarityCount.SSR}`);
            if (rarityCount.SR) parts.push(`SR×${rarityCount.SR}`);
            if (rarityCount.R) parts.push(`R×${rarityCount.R}`);
            if (rarityCount.N) parts.push(`N×${rarityCount.N}`);
            logMsg += parts.join(' ');
            this._log(logMsg, 'gacha');
        } else {
            const card = result.cards[0];
            this._log(`🎲 单抽: ${card.name} (${CARD_CONFIG.rarityStyle[card.rarity].name})`, 'gacha');
        }

        // 检查成就
        this._checkAchievements();
        this.render();
    },

    // 竞技（挑战当前进度关卡）
    battle: function() {
        const result = BattleSystem.fight(this.state);
        this._handleBattleResult(result);
    },

    // 挑战指定关卡（用于重复挑战或打BOSS）
    battleAt: function(world, subStage) {
        const result = BattleSystem.fight(this.state, world, subStage);
        this._handleBattleResult(result);
    },

    // 处理战斗结果
    _handleBattleResult: function(result) {
        const resultDiv = document.getElementById('battle-result');

        if (result.win) {
            let msg = `✅ 胜利！${CARD_CONFIG.getWorldName(result.world)} · 第 ${result.subStage} 关`;
            msg += `<br>获得 💰${result.reward.points}`;
            if (result.reward.shards > 0) msg += ` 🎫${result.reward.shards}`;
            if (result.droppedCard) {
                const rStyle = CARD_CONFIG.rarityStyle[result.droppedCard.rarity];
                msg += `<br>🎁 掉落: <span style="color:${rStyle.color}">${result.droppedCard.name}</span> (${rStyle.name})`;
            }
            if (result.isBoss) msg += `<br>🎉 BOSS击破！`;
            resultDiv.innerHTML = `<div class="battle-win">${msg}</div>`;

            // 记录绝地反击（hid_008）
            if (result.playerPower < result.enemyPower * 0.9) {
                this.state.stats.underdogWin = true;
            }

            // 记录日志
            let logMsg = `⚔️ ${CARD_CONFIG.getWorldName(result.world)} · 第 ${result.subStage} 关 胜利`;
            if (result.isBoss) logMsg += ' (BOSS)';
            logMsg += `, 获得 💰${result.reward.points}`;
            if (result.reward.shards > 0) logMsg += ` 🎫${result.reward.shards}`;
            if (result.droppedCard) logMsg += ` [掉落: ${result.droppedCard.name}]`;
            this._log(logMsg, 'battle-win');
        } else {
            resultDiv.innerHTML = `
                <div class="battle-lose">
                    ❌ 失败<br>
                    ${CARD_CONFIG.getWorldName(result.world)} · 第 ${result.subStage} 关<br>
                    敌人战力: ${Formatter.number(result.enemyPower)}<br>
                    你的战力: ${Formatter.number(result.playerPower)}
                </div>
            `;
            this._log(`⚔️ ${CARD_CONFIG.getWorldName(result.world)} · 第 ${result.subStage} 关失败`, 'battle-lose');
        }

        this._checkAchievements();
        this.render();
    },

    // 进入下一世界
    nextWorld: function() {
        if (!STAGE_CONFIG.canUnlockNextWorld(this.state)) {
            this.showToast('需要先通关当前世界第5关', 'error');
            return;
        }
        this.state.world++;
        this.state.subStage = 1;
        this.showToast(`进入 ${CARD_CONFIG.getWorldName(this.state.world)}！`, 'achievement');
        this._log(`🌍 进入新世界: ${CARD_CONFIG.getWorldName(this.state.world)}`, 'achievement');
        this.render();
    },

    // ===== 渲染（委托给 UIRenderer）=====

    render: function() {
        UIRenderer.render(this.state);
    },

    _renderShop: function() {
        UIRenderer.renderShop(this.state);
    },

    // ===== 成就检查 =====

    _checkAchievements: function() {
        const unlocked = AchievementSystem.checkAll(this.state);
        for (const ach of unlocked) {
            const rewardText = [];
            if (ach.reward.points) rewardText.push(`💰${ach.reward.points}`);
            if (ach.reward.shards) rewardText.push(`🎫${ach.reward.shards}`);
            UIComponents.showToast(
                `🏆 成就解锁：${ach.name}<br>${ach.desc}<br>奖励：${rewardText.join(' ')}`,
                'achievement'
            );
            UIComponents.log(`🏆 成就解锁: ${ach.name} (${ach.desc}) 奖励: ${rewardText.join(' ')}`, 'achievement');
        }
    },

    // ===== 视图导航 =====

    VIEW_MAP: {
        gacha: 'view-gacha',
        battle: 'view-battle',
        collection: 'view-collection',
        idle: 'view-idle'
    },

    _initMobileTabs: function() {
        this.switchView('gacha');
    },

    switchView: function(viewName) {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('view-active', view.id === `view-${viewName}`);
        });
        if (this.state) {
            this.state.currentView = viewName;
        }
    },

    // ===== 委托给 UIComponents =====

    showToast: function(message, type = 'info') {
        UIComponents.showToast(message, type);
    },

    _createToastContainer: function() {
        UIComponents.createToastContainer();
    },

    _log: function(message, type = 'info') {
        UIComponents.log(message, type);
    },

    _showClickFloat: function(amount) {
        UIComponents.showClickFloat(amount);
    },

    // ===== 委托给 UIRenderer =====

    _renderAchievements: function() {
        UIRenderer.renderAchievements(this.state);
    },

    _renderStats: function() {
        UIRenderer.renderStats(this.state);
    },

    _renderCollection: function() {
        UIRenderer.renderCollection(this.state);
    },

    _renderShopTimer: function() {
        UIRenderer.renderShopTimer(this.state);
    },

    // ===== 生活 / 放置 =====

    // 公共方法：点击赚钱
    click: function() {
        const earned = IdleSystem.click(this.state);
        this._checkAchievements();
        this.render();
        // 显示浮动文字效果
        this._showClickFloat(earned);
        
        // 记录点击狂魔（hid_009）
        const now = Date.now();
        if (now - this.state.stats.clickSpamStartTime > 60000) {
            // 超过1分钟，重置计数
            this.state.stats.clickSpamStartTime = now;
            this.state.stats.clickSpamCount = 1;
        } else {
            this.state.stats.clickSpamCount++;
        }
        
        // 每10次点击记录一次日志，避免刷屏
        if (this.state.stats.clickSpamCount % 10 === 0) {
            this._log(`💰 点击赚系统点 +${earned} (累计${this.state.stats.clickSpamCount}次)`, 'info');
        }
    },

    // 公共方法：购买升级A
    buyClickUpgrade: function() {
        const result = IdleSystem.buyClickUpgrade(this.state);
        if (!result.success) {
            this.showToast(result.reason, 'error');
            return;
        }
        this.showToast(`升级A成功！点击收益 +${result.newValue} 系统点`, 'info');
        this._log(`⬆️ 升级A成功，点击收益 +${result.newValue} 系统点`, 'upgrade');
        this.render();
    },

    // 公共方法：购买升级B
    buyAutoUpgrade: function() {
        const result = IdleSystem.buyAutoUpgrade(this.state);
        if (!result.success) {
            this.showToast(result.reason, 'error');
            return;
        }
        this.showToast(`升级B成功！每秒自动 +${result.newValue} 系统点`, 'info');
        this._log(`⬆️ 升级B成功，自动收益 +${result.newValue} 系统点/秒`, 'upgrade');
        this.render();
    },

    // ===== 商店 =====

    // 公共方法：刷新商店
    refreshShop: function() {
        const result = ShopSystem.refresh(this.state);
        if (result.success) {
            this.showToast('商店已刷新', 'info');
        }
        this.render();
    },

    // 公共方法：购买商店物品
    buyShopItem: function(itemId) {
        const result = ShopSystem.buy(this.state, itemId);
        if (!result.success) {
            this.showToast(result.reason, 'error');
            return;
        }
        this.showToast(`购买成功：${result.received}`, 'info');
        this._log(`🛒 购买: ${result.received}`, 'shop');
        this._checkAchievements();
        this.render();
    },

    // ===== 离线收益 =====

    // 内部：计算并应用离线收益
    _calcOfflineEarnings: function() {
        if (!this.state || !this.state.stats.lastSaveTime) return;
        const result = IdleSystem.applyOfflinePoints(this.state);
        if (result.points > 0) {
            this.showToast(
                `离线收益：💰${result.points}（离线${Formatter.time(result.seconds)}）`,
                'info'
            );
            this._log(`💤 离线收益: 💰${result.points} (离线${Formatter.time(result.seconds)})`, 'info');
        }
    },

    // 内部：启动自动收益计时器
    _startAutoTick: function() {
        // 每秒自动收益 - 只更新金币显示，不触发全量渲染
        setInterval(() => {
            if (!this.state) return;
            const pointsPerSec = IdleSystem.getAutoPointsPerSecond(this.state);
            if (pointsPerSec > 0) {
                this.state.points += pointsPerSec;
                this.state.stats.pointsTotal += pointsPerSec;
                // 只更新系统点显示，避免全量渲染导致图鉴跳动
                const pointsEl = document.getElementById('points');
                if (pointsEl) {
                    pointsEl.textContent = Formatter.number(this.state.points);
                }
                // 成就检测（可能触发成就解锁）
                const newAchievements = AchievementSystem.checkAll(this.state);
                if (newAchievements.length > 0) {
                    // 有成就解锁时才更新成就列表和战力显示
                    this._renderAchievements();
                    const achBonus = AchievementSystem.getTotalPowerBonus(this.state);
                    const achBonusEl = document.getElementById('achievement-bonus');
                    if (achBonusEl) {
                        achBonusEl.textContent = `+${achBonus}%`;
                    }
                    for (const ach of newAchievements) {
                        const bonusText = ach.reward.powerBonus ? ` (+${ach.reward.powerBonus}%战力)` : '';
                        this.showToast(`🏆 成就解锁: ${ach.name}${bonusText}`, 'achievement');
                        this._log(`🏆 成就解锁: ${ach.name}${bonusText}`, 'achievement');
                    }
                }
            }
        }, 1000);
    },

    // 内部：启动商店倒计时计时器
    _startShopTimer: function() {
        // 每秒更新商店倒计时
        setInterval(() => {
            this._renderShopTimer();
        }, 1000);
    },

    // 委托方法（精简后保留，供 _startAutoTick 等内部调用）
    _renderAchievements: function() { UIRenderer.renderAchievements(this.state); },
    _renderShopTimer: function() { UIRenderer.renderShopTimer(this.state); }
};

// 全局游戏对象
const game = Game;

// 启动
document.addEventListener('DOMContentLoaded', () => {
    game.init();
});
