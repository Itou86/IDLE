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
        this._initMobileTabs();
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
            gold: 50,            // 初始金币(原100，降低因为点击收益高了)
            tickets: 20,         // 初始抽卡券(原10，让玩家能抽20次)
            stage: 1,            // 当前关卡
            cards: {},           // 拥有的卡牌
            achievements: {},    // 已解锁成就
            idle: {              // 初始放置等级
                clickLevel: 0,
                autoLevel: 1     // 初始自动收益1级
            },
            stats: {
                goldTotal: 50,
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
            
            // 记录绝地反击（hid_008）
            if (result.playerPower < result.enemyPower * 0.9) {
                this.state.stats.underdogWin = true;
            }
            
            // 记录日志
            let logMsg = `⚔️ 通过第 ${result.stage} 关`;
            if (result.isBoss) logMsg += ' (BOSS)';
            logMsg += `, 获得 💰${result.reward.gold}`;
            if (result.reward.tickets > 0) logMsg += ` 🎫${result.reward.tickets}`;
            this._log(logMsg, 'battle-win');
        } else {
            resultDiv.innerHTML = `
                <div class="battle-lose">
                    ❌ 失败<br>
                    敌人战力: ${Formatter.number(result.enemyPower)}<br>
                    你的战力: ${Formatter.number(result.playerPower)}
                </div>
            `;
            this._log(`⚔️ 第 ${result.stage} 关失败 (敌人${Formatter.number(result.enemyPower)} vs 我方${Formatter.number(result.playerPower)})`, 'battle-lose');
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

        // 按钮状态 - 抽卡
        const gachaBtn = document.getElementById('gacha-btn');
        const gacha10Btn = document.getElementById('gacha-10-btn');
        const canSingle = this.state.tickets >= GachaSystem.COST.tickets;
        const canTen = this.state.tickets >= GachaSystem.COST_10.tickets;
        if (gachaBtn) {
            gachaBtn.disabled = !canSingle;
            gachaBtn.textContent = canSingle ? `单抽 (${GachaSystem.COST.tickets} 🎫)` : `单抽 (券不足)`;
        }
        if (gacha10Btn) {
            gacha10Btn.disabled = !canTen;
            gacha10Btn.textContent = canTen ? `十连抽 (${GachaSystem.COST_10.tickets} 🎫)` : `十连抽 (券不足)`;
        }

        // 卡牌列表
        const cardsDiv = document.getElementById('cards-list');
        if (cardsDiv) {
            cardsDiv.innerHTML = '';
            for (const [id, data] of Object.entries(this.state.cards)) {
                const config = CARD_CONFIG.pool.find(c => c.id === id);
                if (!config) continue;
                const rarityInfo = CARD_CONFIG.rarityStyle[config.rarity];
                const el = document.createElement('div');
                el.className = 'owned-card';
                el.innerHTML = `
                    <span style="color:${rarityInfo.color}">●</span>
                    ${config.name}
                    <span class="level">Lv.${data.level}</span>
                    <small>x${data.count}</small>
                `;
                cardsDiv.appendChild(el);
            }
            if (cardsDiv.children.length === 0) {
                cardsDiv.innerHTML = '<span style="color:#888">暂无卡牌，快去抽卡吧！</span>';
            }
        }

        // 卡组图鉴
        this._renderCollection();

        // 成就列表
        this._renderAchievements();

        // 成就战力加成显示
        const achBonus = AchievementSystem.getTotalPowerBonus(this.state);
        const achBonusEl = document.getElementById('achievement-bonus');
        if (achBonusEl) {
            achBonusEl.textContent = `+${achBonus}%`;
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
            this._log(`🏆 成就解锁: ${ach.name} (${ach.desc}) 奖励: ${rewardText.join(' ')}`, 'achievement');
        }
    },

    // ===== Toast 通知 =====

    _createToastContainer: function() {
        if (document.getElementById('toast-container')) return;
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    },

    // ===== Mobile Tabs =====

    TAB_PANELS: {
        gacha: ['gacha-panel'],
        battle: ['battle-panel'],
        cards: ['cards-panel', 'collection-panel', 'achievements-panel'],
        life: ['life-panel', 'shop-panel'],
        log: ['log-panel']
    },

    _initMobileTabs: function() {
        // Set default active tab on mobile
        this.switchTab('gacha');
    },

    switchTab: function(tabName) {
        const panelIds = this.TAB_PANELS[tabName] || [];

        // Update tab buttons
        document.querySelectorAll('.mobile-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update panels visibility (only affects mobile via CSS media query)
        document.querySelectorAll('main > section').forEach(section => {
            section.classList.toggle('panel-active', panelIds.includes(section.id));
        });
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

    // ===== 日志系统 =====

    _log: function(message, type = 'info') {
        const logList = document.getElementById('log-list');
        if (!logList) return;

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `<span class="log-time">${timeStr}</span>${message}`;
        logList.insertBefore(entry, logList.firstChild);

        // 限制日志数量
        while (logList.children.length > 50) {
            logList.removeChild(logList.lastChild);
        }
    },

    // ===== 生活 / 放置 =====

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
            this._log(`💰 点击赚金币 +${earned} (累计${this.state.stats.clickSpamCount}次)`, 'info');
        }
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
        this._log(`⬆️ 升级A成功，点击收益 +${result.newValue} 金币`, 'upgrade');
        this.render();
    },

    buyAutoUpgrade: function() {
        const result = IdleSystem.buyAutoUpgrade(this.state);
        if (!result.success) {
            this.showToast(result.reason, 'error');
            return;
        }
        this.showToast(`升级B成功！每秒自动 +${result.newValue} 金币`, 'info');
        this._log(`⬆️ 升级B成功，自动收益 +${result.newValue} 金币/秒`, 'upgrade');
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
        this._log(`🛒 购买: ${result.received}`, 'shop');
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
            this._log(`💤 离线收益: 💰${result.gold} (离线${Formatter.time(result.seconds)})`, 'info');
        }
    },

    _startAutoTick: function() {
        // 每秒自动收益 - 只更新金币显示，不触发全量渲染
        setInterval(() => {
            if (!this.state) return;
            const goldPerSec = IdleSystem.getAutoGoldPerSecond(this.state);
            if (goldPerSec > 0) {
                this.state.gold += goldPerSec;
                this.state.stats.goldTotal += goldPerSec;
                // 只更新金币显示，避免全量渲染导致图鉴跳动
                const goldEl = document.getElementById('gold');
                if (goldEl) {
                    goldEl.textContent = Formatter.number(this.state.gold);
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
    },

    _renderAchievements: function() {
        const achDiv = document.getElementById('achievements-list');
        if (!achDiv) return;
        achDiv.innerHTML = '';
        const achList = AchievementSystem.getList(this.state);
        // 只显示已解锁的 + 前5个未解锁的（避免一次显示太多）
        const unlocked = achList.filter(a => a.unlocked);
        const locked = achList.filter(a => !a.unlocked).slice(0, 5);

        for (const ach of [...unlocked.slice(-5), ...locked]) {
            const el = document.createElement('div');
            el.className = `achievement ${ach.unlocked ? 'unlocked' : 'locked'}`;
            const bonusText = ach.reward.powerBonus ? `⚔️+${ach.reward.powerBonus}%` : '';
            el.innerHTML = `
                <span>${ach.unlocked ? '✅' : '🔒'} ${ach.name}</span>
                <span class="reward">${bonusText}</span>
            `;
            achDiv.appendChild(el);
        }
    },

    // ===== 卡组图鉴渲染 =====
    _renderCollection: function() {
        const collectionDiv = document.getElementById('collection-list');
        if (!collectionDiv) return;

        const activeSets = GachaSystem.getActiveSets(this.state);
        const progress = GachaSystem.getCollectionProgress(this.state);

        let html = `
            <div class="collection-progress">
                <div>📚 卡牌收集: ${progress.cardsOwned}/${progress.cardsTotal} (${progress.cardPercent}%)</div>
                <div>🎯 套装完成: ${progress.setsComplete}/${progress.setsTotal} (${progress.setPercent}%)</div>
            </div>
            <div class="sets-grid">
        `;

        for (const set of activeSets) {
            const statusIcon = set.isComplete ? '✅' : '⏳';
            const statusClass = set.isComplete ? 'set-complete' : 'set-incomplete';
            const hasAnyCard = set.collected.some(c => c.has);
            
            // 如果套装中一张卡都没有，默认折叠显示（节省空间）
            const setVisible = hasAnyCard || set.isComplete;
            const collapseClass = setVisible ? '' : 'set-collapsed';
            
            // 构建卡牌收集状态 - 显示卡牌名称和稀有度
            let cardsHtml = '';
            for (const c of set.collected) {
                const cardConfig = CARD_CONFIG.pool.find(p => p.id === c.id);
                const rarityColor = cardConfig ? CARD_CONFIG.rarityStyle[cardConfig.rarity].color : '#888';
                const rarityName = cardConfig ? CARD_CONFIG.rarityStyle[cardConfig.rarity].name : '?';
                const hasClass = c.has ? 'has-card' : 'missing-card';
                const opacity = c.has ? '1' : '0.35';
                cardsHtml += `
                    <div class="set-card-detail ${hasClass}" style="opacity:${opacity}">
                        <span class="card-rarity-dot" style="color:${rarityColor}">●</span>
                        <span class="card-name">${cardConfig ? cardConfig.name : c.id}</span>
                        <span class="card-rarity-tag" style="color:${rarityColor}">${rarityName}</span>
                        ${c.has ? '<span class="card-owned">✓</span>' : '<span class="card-missing">—</span>'}
                    </div>
                `;
            }

            // 套装效果
            const bonusParts = [];
            if (set.bonus.power) bonusParts.push(`⚔️+${set.bonus.power}`);
            if (set.bonus.defense) bonusParts.push(`🛡️+${set.bonus.defense}`);
            if (set.bonus.gold) bonusParts.push(`💰+${set.bonus.gold}`);
            if (set.bonus.speed) bonusParts.push(`⚡+${set.bonus.speed}`);
            if (set.bonus.dropRate) bonusParts.push(`🍀+${set.bonus.dropRate}%`);
            if (set.bonus.heal) bonusParts.push(`❤️+${set.bonus.heal}`);

            html += `
                <div class="set-item ${statusClass} ${collapseClass}">
                    <div class="set-header">
                        <span class="set-status">${statusIcon}</span>
                        <span class="set-name">${set.name}</span>
                        <span class="set-count">${set.collected.filter(c => c.has).length}/${set.ids.length}</span>
                    </div>
                    <div class="set-desc">${set.desc || ''}</div>
                    <div class="set-cards-detail">${cardsHtml}</div>
                    <div class="set-bonus">${bonusParts.join(' ')}</div>
                </div>
            `;
        }

        html += '</div>';
        collectionDiv.innerHTML = html;
    }
};

// 全局游戏对象
const game = Game;

// 启动
document.addEventListener('DOMContentLoaded', () => {
    game.init();
});
