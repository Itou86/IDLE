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

    // ===== 离线收益 =====

    _calcOfflineEarnings: function() {
        if (!this.state || !this.state.stats.lastSaveTime) return;
        const offline = (Date.now() - this.state.stats.lastSaveTime) / 1000;
        if (offline < 60) return; // 小于1分钟不算

        // 简单离线收益：每分钟1金币
        const minutes = Math.floor(offline / 60);
        const earnings = Math.min(minutes, 60 * 24); // 最多算24小时
        this.state.gold += earnings;
        this.state.stats.goldTotal += earnings;

        if (earnings > 0) {
            this.showToast(`离线收益：💰${earnings}（离线${Formatter.time(offline)}）`, 'info');
        }
    }
};

// 全局游戏对象
const game = Game;

// 启动
document.addEventListener('DOMContentLoaded', () => {
    game.init();
});
