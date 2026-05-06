/* ===== 游戏主入口 ===== */
const Game = {
    // 游戏状态
    state: null,

    // 初始化
    init: function() {
        this.load();
        if (!this.state) {
            this.reset();
        }
        this._createToastContainer();
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
            gold: 100,           // 初始金币
            tickets: 10,         // 初始抽卡券
            stage: 1,            // 当前关卡
            cards: {},           // 拥有的卡牌
            achievements: {},    // 已解锁成就
            stats: {
                goldTotal: 100,
                gachaCount: 0,
                battleWin: 0,
                battleLose: 0,
                loseStreak: 0,
                streakNoRare: 0,
                streakNoSSR: 0,
                rarityObtained: {},
                lastSaveTime: Date.now(),
                createTime: Date.now()
            }
        };
        this.save();
        this.render();
        this.showToast('游戏已重置', 'info');
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

    // 抽卡
    gacha: function() {
        const result = GachaSystem.draw(this.state);
        if (!result.success) {
            this.showToast(result.reason, 'error');
            return;
        }

        const card = result.card;
        const rarityInfo = CARD_CONFIG.rarityStyle[card.rarity];

        // 显示结果
        const resultDiv = document.getElementById('gacha-result');
        const cardEl = document.createElement('div');
        cardEl.className = `card-item rarity-${card.rarity}`;
        cardEl.innerHTML = `
            <span style="color:${rarityInfo.color}">●</span>
            ${card.name} <small>(${rarityInfo.name})</small>
        `;
        resultDiv.insertBefore(cardEl, resultDiv.firstChild);
        if (resultDiv.children.length > 5) {
            resultDiv.removeChild(resultDiv.lastChild);
        }

        // 检查成就
        this._checkAchievements();
        this.render();

        // SSR特殊提示
        if (card.rarity === 'SSR') {
            this.showToast(`🎉 恭喜获得 SSR：${card.name}！`, 'achievement');
        }
    },

    // 竞技
    battle: function() {
        const result = BattleSystem.fight(this.state);
        const resultDiv = document.getElementById('battle-result');

        if (result.win) {
            let msg = `✅ 胜利！通过第 ${result.stage} 关`;
            msg += `<br>获得 💰${result.reward.gold}`;
            if (result.reward.tickets > 0) msg += ` 🎫${result.reward.tickets}`;
            if (result.isBoss) msg += `<br>🎉 BOSS击破！`;
            resultDiv.innerHTML = `<div class="battle-win">${msg}</div>`;
        } else {
            resultDiv.innerHTML = `
                <div class="battle-lose">
                    ❌ 失败<br>
                    敌人战力: ${Formatter.number(result.enemyPower)}<br>
                    你的战力: ${Formatter.number(result.playerPower)}
                </div>
            `;
        }

        this._checkAchievements();
        this.render();
    },

    // ===== 渲染 =====

    render: function() {
        if (!this.state) return;

        // 资源
        document.getElementById('gold').textContent = Formatter.number(this.state.gold);
        document.getElementById('tickets').textContent = this.state.tickets;

        // 关卡
        const stageInfo = BattleSystem.getCurrentStageInfo(this.state);
        document.getElementById('current-stage').textContent = this.state.stage;
        document.getElementById('enemy-power').textContent = Formatter.number(stageInfo.enemyPower);

        // 按钮状态
        document.getElementById('gacha-btn').disabled = this.state.tickets < GachaSystem.COST.tickets;

        // 卡牌列表
        const cardsDiv = document.getElementById('cards-list');
        cardsDiv.innerHTML = '';
        for (const [id, data] of Object.entries(this.state.cards)) {
            const config = CARD_CONFIG.pool.find(c => c.id === id);
            if (!config) continue;
            const el = document.createElement('div');
            el.className = 'owned-card';
            el.innerHTML = `
                ${config.name}
                <span class="level">Lv.${data.level}</span>
                <small>x${data.count}</small>
            `;
            cardsDiv.appendChild(el);
        }
        if (cardsDiv.children.length === 0) {
            cardsDiv.innerHTML = '<span style="color:#888">暂无卡牌，快去抽卡吧！</span>';
        }

        // 成就列表
        const achDiv = document.getElementById('achievements-list');
        achDiv.innerHTML = '';
        const achList = AchievementSystem.getList(this.state);
        // 只显示已解锁的 + 前5个未解锁的（避免一次显示太多）
        const unlocked = achList.filter(a => a.unlocked);
        const locked = achList.filter(a => !a.unlocked).slice(0, 5);

        for (const ach of [...unlocked.slice(-5), ...locked]) {
            const el = document.createElement('div');
            el.className = `achievement ${ach.unlocked ? 'unlocked' : 'locked'}`;
            const rewardText = [];
            if (ach.reward.gold) rewardText.push(`💰${ach.reward.gold}`);
            if (ach.reward.tickets) rewardText.push(`🎫${ach.reward.tickets}`);
            el.innerHTML = `
                <span>${ach.unlocked ? '✅' : '🔒'} ${ach.name}</span>
                <span class="reward">${rewardText.join(' ')}</span>
            `;
            achDiv.appendChild(el);
        }

        // 生活面板 - 收益信息
        const idleInfo = IdleSystem.getInfo(this.state);
        const clickValEl = document.getElementById('click-value');
        if (clickValEl) clickValEl.textContent = idleInfo.clickValue;
        const autoValEl = document.getElementById('auto-value');
        if (autoValEl) autoValEl.textContent = idleInfo.autoValue;
        const clickLvlEl = document.getElementById('click-level');
        if (clickLvlEl) clickLvlEl.textContent = idleInfo.clickLevel;
        const autoLvlEl = document.getElementById('auto-level');
        if (autoLvlEl) autoLvlEl.textContent = idleInfo.autoLevel;
        const clickCostEl = document.getElementById('click-cost');
        if (clickCostEl) clickCostEl.textContent = idleInfo.clickUpgradeCost;
        const autoCostEl = document.getElementById('auto-cost');
        if (autoCostEl) autoCostEl.textContent = idleInfo.autoUpgradeCost;

        // 升级按钮状态
        const buyClickBtn = document.getElementById('buy-click-btn');
        if (buyClickBtn) buyClickBtn.disabled = !idleInfo.canAffordClick;
        const buyAutoBtn = document.getElementById('buy-auto-btn');
        if (buyAutoBtn) buyAutoBtn.disabled = !idleInfo.canAffordAuto;

        // 商店面板
        this._renderShop();
    },

    _renderShop: function() {
        if (!this.state) return;
        const items = ShopSystem.getItems(this.state);
        const shopDiv = document.getElementById('shop-items');
        if (!shopDiv) return;

        shopDiv.innerHTML = '';
        for (const item of items) {
            const el = document.createElement('div');
            el.className = 'shop-item';
            const canAfford = this.state.gold >= item.cost;
            el.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.icon || ''} ${item.name}</span>
                    <span class="item-desc">${item.desc}${item.stock ? ` (库存: ${item.stock})` : ''}</span>
                </div>
                <span class="item-cost">💰${item.cost}</span>
                <button ${canAfford ? '' : 'disabled'} onclick="game.buyShopItem('${item.id}')">购买</button>
            `;
            shopDiv.appendChild(el);
        }

        // 更新倒计时
        this._renderShopTimer();
    },

    // ===== 成就检查 =====

    _checkAchievements: function() {
        const unlocked = AchievementSystem.checkAll(this.state);
        for (const ach of unlocked) {
            const rewardText = [];
            if (ach.reward.gold) rewardText.push(`💰${ach.reward.gold}`);
            if (ach.reward.tickets) rewardText.push(`🎫${ach.reward.tickets}`);
            this.showToast(
                `🏆 成就解锁：${ach.name}<br>${ach.desc}<br>奖励：${rewardText.join(' ')}`,
                'achievement'
            );
        }
    },

    // ===== Toast 通知 =====

    _createToastContainer: function() {
        if (document.getElementById('toast-container')) return;
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    },

    showToast: function(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type === 'achievement' ? 'achievement-toast' : ''}`;
        toast.innerHTML = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    // ===== 生活 / 放置 =====

    click: function() {
        const earned = IdleSystem.click(this.state);
        this._checkAchievements();
        this.render();
        // 显示浮动文字效果
        this._showClickFloat(earned);
    },

    _showClickFloat: function(amount) {
        const btn = document.getElementById('click-btn');
        if (!btn) return;
        const float = document.createElement('div');
        float.textContent = `+${amount}`;
        float.style.cssText = `
            position: absolute;
            color: #ffd700;
            font-weight: bold;
            font-size: 1.2rem;
            pointer-events: none;
            animation: floatUp 0.8s ease-out forwards;
        `;
        const rect = btn.getBoundingClientRect();
        float.style.left = (rect.left + rect.width / 2) + 'px';
        float.style.top = rect.top + 'px';
        document.body.appendChild(float);
        setTimeout(() => float.remove(), 800);
    },

    buyClickUpgrade: function() {
        const result = IdleSystem.buyClickUpgrade(this.state);
        if (!result.success) {
            this.showToast(result.reason, 'error');
            return;
        }
        this.showToast(`升级A成功！点击收益 +${result.newValue} 金币`, 'info');
        this.render();
    },

    buyAutoUpgrade: function() {
        const result = IdleSystem.buyAutoUpgrade(this.state);
        if (!result.success) {
            this.showToast(result.reason, 'error');
            return;
        }
        this.showToast(`升级B成功！每秒自动 +${result.newValue} 金币`, 'info');
        this.render();
    },

    // ===== 商店 =====

    refreshShop: function() {
        const result = ShopSystem.refresh(this.state);
        if (result.success) {
            this.showToast('商店已刷新', 'info');
        }
        this.render();
    },

    buyShopItem: function(itemId) {
        const result = ShopSystem.buy(this.state, itemId);
        if (!result.success) {
            this.showToast(result.reason, 'error');
            return;
        }
        this.showToast(`购买成功：${result.received}`, 'info');
        this._checkAchievements();
        this.render();
    },

    // ===== 离线收益 =====

    _calcOfflineEarnings: function() {
        if (!this.state || !this.state.stats.lastSaveTime) return;
        const result = IdleSystem.applyOfflineGold(this.state);
        if (result.gold > 0) {
            this.showToast(
                `离线收益：💰${result.gold}（离线${Formatter.time(result.seconds)}）`,
                'info'
            );
        }
    },

    _startAutoTick: function() {
        // 每秒自动收益
        setInterval(() => {
            if (!this.state) return;
            const goldPerSec = IdleSystem.getAutoGoldPerSecond(this.state);
            if (goldPerSec > 0) {
                this.state.gold += goldPerSec;
                this.state.stats.goldTotal += goldPerSec;
                this.render();
            }
        }, 1000);
    },

    _startShopTimer: function() {
        // 每秒更新商店倒计时
        setInterval(() => {
            this._renderShopTimer();
        }, 1000);
    },

    _renderShopTimer: function() {
        if (!this.state) return;
        const remaining = ShopSystem.getNextRefreshTime(this.state);
        const timerEl = document.getElementById('refresh-timer');
        if (timerEl) {
            timerEl.textContent = Formatter.time(remaining / 1000);
        }
    }
};

// 全局游戏对象
const game = Game;

// 启动
document.addEventListener('DOMContentLoaded', () => {
    game.init();
});
