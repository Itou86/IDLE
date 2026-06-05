/* ===== UI 渲染器 ===== */
// 职责：所有 DOM 渲染逻辑集中于此
// 设计：纯函数风格，接收 gameState 参数，不隐式依赖全局 Game 对象
const UIRenderer = {
    // 主渲染入口：统筹所有面板
    render: function(gameState) {
        if (!gameState) return;
        this._renderResources(gameState);
        this._renderStageInfo(gameState);
        this._renderButtons(gameState);
        this._renderCardList(gameState);
        this.renderCollection(gameState);
        this.renderStats(gameState);
        this.renderAchievements(gameState);
        this._renderAchievementBonus(gameState);
        this._renderIdleInfo(gameState);
        this.renderShop(gameState);
    },

    // ===== 资源显示 =====
    _renderResources: function(gameState) {
        const pointsEl = document.getElementById('points');
        if (pointsEl) pointsEl.textContent = Formatter.number(gameState.points);
        const shardsEl = document.getElementById('shards');
        if (shardsEl) shardsEl.textContent = gameState.shards;
    },

    // ===== 关卡信息 =====
    _renderStageInfo: function(gameState) {
        const stageInfo = BattleSystem.getCurrentStageInfo(gameState);
        const worldName = CARD_CONFIG.getWorldName(gameState.world);

        const currentStageEl = document.getElementById('current-stage');
        if (currentStageEl) {
            currentStageEl.textContent = `${worldName} · 第${gameState.subStage}关`;
        }
        const enemyPowerEl = document.getElementById('enemy-power');
        if (enemyPowerEl) {
            enemyPowerEl.textContent = Formatter.number(stageInfo.enemyPower);
        }
        const worldEl = document.getElementById('current-world');
        if (worldEl) {
            worldEl.textContent = worldName;
        }
        const nextWorldBtn = document.getElementById('next-world-btn');
        if (nextWorldBtn) {
            const canNext = STAGE_CONFIG.canUnlockNextWorld(gameState);
            nextWorldBtn.style.display = canNext ? 'inline-block' : 'none';
        }
    },

    // ===== 按钮状态 =====
    _renderButtons: function(gameState) {
        const gachaBtn = document.getElementById('gacha-btn');
        const gacha10Btn = document.getElementById('gacha-10-btn');
        const canSingle = gameState.shards >= GachaSystem.COST.shards;
        const canTen = gameState.shards >= GachaSystem.COST_10.shards;
        if (gachaBtn) {
            gachaBtn.disabled = !canSingle;
            gachaBtn.textContent = canSingle ? `单抽 (${GachaSystem.COST.shards} 🎫)` : `单抽 (碎片不足)`;
        }
        if (gacha10Btn) {
            gacha10Btn.disabled = !canTen;
            gacha10Btn.textContent = canTen ? `十连抽 (${GachaSystem.COST_10.shards} 🎫)` : `十连抽 (碎片不足)`;
        }
    },

    // ===== 卡牌背包列表 =====
    _renderCardList: function(gameState) {
        const cardsDiv = document.getElementById('cards-list');
        if (!cardsDiv) return;
        cardsDiv.innerHTML = '';
        for (const [id, data] of Object.entries(gameState.cards)) {
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
            cardsDiv.innerHTML = '<span style="color:#888">背包为空，快去次元抽取吧！</span>';
        }
    },

    // ===== 成就列表 =====
    renderAchievements: function(gameState) {
        const achDiv = document.getElementById('achievements-list');
        if (!achDiv) return;
        achDiv.innerHTML = '';
        const achList = AchievementSystem.getList(gameState);
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

    // ===== 成就战力加成显示 =====
    _renderAchievementBonus: function(gameState) {
        const achBonus = AchievementSystem.getTotalPowerBonus(gameState);
        const achBonusEl = document.getElementById('achievement-bonus');
        if (achBonusEl) {
            achBonusEl.textContent = `+${achBonus}%`;
        }
    },

    // ===== 角色属性面板 =====
    renderStats: function(gameState) {
        if (!gameState) return;
        const stats = StatSystem.getCharacterStats(gameState);
        const breakdown = StatSystem.getStatBreakdown(gameState);

        // 有效战力
        const effPowerEl = document.getElementById('effective-power');
        if (effPowerEl) effPowerEl.textContent = Formatter.number(stats.effectivePower);

        // 生命
        const hpEl = document.getElementById('hp-value');
        const hpMaxEl = document.getElementById('hp-max');
        if (hpEl) hpEl.textContent = stats.hp;
        if (hpMaxEl) hpMaxEl.textContent = stats.hp;

        // 属性网格
        const gridEl = document.getElementById('stats-grid');
        if (gridEl) {
            let html = '';
            for (const statKey of STAT_CONFIG.calcOrder) {
                const def = STAT_CONFIG.definitions[statKey];
                if (!def) continue;
                const value = stats[statKey] || 0;
                if (value === 0 && statKey !== 'power' && statKey !== 'defense') continue;

                const formatted = StatSystem.formatStat(statKey, value);
                const baseVal = breakdown.base[statKey] || 0;
                const cardVal = breakdown.cards[statKey] || 0;
                const setVal = breakdown.sets[statKey] || 0;
                const pct = breakdown.percent[statKey] || 0;
                const ach = statKey === 'power' || statKey === 'defense' || statKey === 'hp' ? breakdown.achievement : 0;

                let tooltip = `基础: ${baseVal}`;
                if (cardVal) tooltip += `\n卡牌: +${cardVal}`;
                if (setVal) tooltip += `\n套装: +${setVal}`;
                if (pct) tooltip += `\n百分比: +${pct}%`;
                if (ach) tooltip += `\n成就: +${ach}%`;

                html += `
                    <div class="stat-item" title="${tooltip}">
                        <span class="stat-icon">${def.icon}</span>
                        <span class="stat-name">${def.name}</span>
                        <span class="stat-value">${formatted}</span>
                    </div>
                `;
            }
            gridEl.innerHTML = html;
        }
    },

    // ===== 商店面板 =====
    renderShop: function(gameState) {
        if (!gameState) return;
        const items = ShopSystem.getItems(gameState);
        const shopDiv = document.getElementById('shop-items');
        if (!shopDiv) return;

        shopDiv.innerHTML = '';
        for (const item of items) {
            const el = document.createElement('div');
            el.className = 'shop-item';
            const canAfford = gameState.points >= item.cost;
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
        this.renderShopTimer(gameState);
    },

    // ===== 商店倒计时 =====
    renderShopTimer: function(gameState) {
        if (!gameState) return;
        const remaining = ShopSystem.getNextRefreshTime(gameState);
        const timerEl = document.getElementById('refresh-timer');
        if (timerEl) {
            timerEl.textContent = Formatter.time(remaining / 1000);
        }
    },

    // ===== 卡组图鉴 =====
    renderCollection: function(gameState) {
        const collectionDiv = document.getElementById('collection-list');
        if (!collectionDiv) return;

        const activeSets = GachaSystem.getActiveSets(gameState);
        const progress = GachaSystem.getCollectionProgress(gameState);

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

            const setVisible = hasAnyCard || set.isComplete;
            const collapseClass = setVisible ? '' : 'set-collapsed';

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
    },

    // ===== 放置收益信息 =====
    _renderIdleInfo: function(gameState) {
        const idleInfo = IdleSystem.getInfo(gameState);
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

        const buyClickBtn = document.getElementById('buy-click-btn');
        if (buyClickBtn) buyClickBtn.disabled = !idleInfo.canAffordClick;
        const buyAutoBtn = document.getElementById('buy-auto-btn');
        if (buyAutoBtn) buyAutoBtn.disabled = !idleInfo.canAffordAuto;
    },
};

// 全局暴露
if (typeof window !== 'undefined') {
    window.UIRenderer = UIRenderer;
}
