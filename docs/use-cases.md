# 应用场景详解

## 场景 1: 早期 Alpha 发现

利用微信社群首发数据，追踪高胜率首发人推荐的新代币。

### 策略

1. 筛选 `sender_win_rate > 90%` 且 `sender_total_tokens > 50` 的首发人
2. 关注 `sfsj` 在 1 小时内的新首发代币
3. 结合 `risk_score >= 60` 过滤高风险项目
4. 检查 `is_honeypot !== '1'` 排除蜜罐

### 信号强度评估

| 条件 | 权重 | 说明 |
|------|------|------|
| 首发人胜率 > 95% | 高 | 历史表现优秀的推荐者 |
| 首发时间 < 30 分钟 | 高 | 极早期发现 |
| 覆盖群数 > 5 | 中 | 多个社群同时关注 |
| 风险分 > 70 | 中 | 合约安全性较高 |
| 买入量/卖出量 > 3x | 中 | 买方力量强势 |

### 实现思路

```javascript
// 高胜率首发人 + 新发现 + 安全过滤
ws.on('message', (data) => {
  const t = JSON.parse(data);
  const winRate = parseFloat(t.sender_win_rate);
  const launchMinutesAgo = (Date.now() - new Date(t.sfsj).getTime()) / 60000;

  if (winRate > 90 && launchMinutesAgo < 60 && parseInt(t.risk_score) >= 60) {
    // 发送告警通知
  }
});
```

---

## 场景 2: Meme 代币实时监控看板

构建实时仪表板展示代币核心指标。

### 展示维度

- **价格变动**: 5m / 1h / 4h / 24h 多时间维度
- **买卖力度对比**: 实时买入量 vs 卖出量
- **市值变化趋势**: `old_market_cap` → `new_market_cap`
- **社群热度排名**: `sqzs` 社群指数排序
- **首发人排行**: 按胜率和推荐数量排序

### 关键指标卡片

| 指标 | 数据源 | 刷新频率 |
|------|--------|----------|
| 实时价格 | `current_price_usd` | 每条推送 |
| 5m 涨幅 | `price_change_5m` | 每条推送 |
| 买卖比 | `buy_volume_u_5m / sell_volume_u_5m` | 每条推送 |
| 持有人数 | `holders` | 每条推送 |
| 社群热度 | `sqzs` | 每条推送 |
| 首发倍数 | `sfzf` | 每条推送 |

---

## 场景 3: 风控预警系统

基于风险字段构建实时预警系统。

### 预警规则

| 规则 | 触发条件 | 风险等级 |
|------|----------|----------|
| 蜜罐检测 | `is_honeypot === '1'` | 极高 |
| 可增发代币 | `is_mintable === '1'` | 高 |
| 钓鱼钱包占比高 | `phishing_wallet_rate > 0.1` | 高 |
| 捆绑钱包占比高 | `bundle_wallet_rate > 0.2` | 高 |
| Rug Pull 风险 | `rug_risk_rate > 0.3` | 极高 |
| 持仓过度集中 | TOP1 `zbbl > 50%` | 高 |
| LP 未锁定 | `is_lp_not_locked === '1'` | 中 |
| 未放弃所有权 | `has_not_renounced === '1'` | 中 |
| 未审计 | `has_not_audited === '1'` | 低 |

### 综合安全评分

```javascript
function calcSafetyScore(token) {
  let score = parseInt(token.risk_score) || 0;
  if (token.is_honeypot === '1') score -= 50;
  if (token.is_mintable === '1') score -= 20;
  if (token.phishing_wallet_rate > 0.1) score -= 15;
  if (token.bundle_wallet_rate > 0.2) score -= 15;
  if (token.rug_risk_rate > 0.3) score -= 30;
  return Math.max(0, Math.min(100, score));
}
```

---

## 场景 4: 社群信号聚合

跨多个微信社群聚合信号，发现正在传播的热门代币。

### 核心指标

| 指标 | 字段 | 含义 |
|------|------|------|
| 扩散速度 | `fgq` | 覆盖群数越多，传播越广 |
| 传播广度 | `qwfc` | 全网分享次数 |
| 社群热度 | `sqzs` | 社群综合热度指数 |
| 查询热度 | `cazs` | 被查询的频率 |

### 热度排行算法

```python
heat_score = (sqzs * 0.4) + (fgq * 10 * 0.3) + (qwfc * 0.2) + (cazs * 0.1)
```

### 信号扩散阶段

1. **萌芽期**: 1-2 个群出现，`fgq <= 2`
2. **扩散期**: 3-10 个群传播，`fgq` 快速增长
3. **爆发期**: 10+ 个群热议，`sqzs` 大幅飙升
4. **衰退期**: 新分享减少，`cazs` 下降

---

## 场景 5: 首发人跟踪系统

建立首发人画像，跟踪高质量推荐者。

### 首发人评估维度

| 维度 | 字段 | 权重 |
|------|------|------|
| 胜率 | `sender_win_rate` | 40% |
| 推荐数量 | `sender_total_tokens` | 20% |
| 最佳倍数 | `sender_best_multiple` | 20% |
| 成功数量 | `sender_win_tokens` | 20% |

### 首发人分级

| 等级 | 条件 |
|------|------|
| S 级 | 胜率 > 95% 且推荐 > 100 个 且最佳 > 1000x |
| A 级 | 胜率 > 90% 且推荐 > 50 个 |
| B 级 | 胜率 > 80% 且推荐 > 20 个 |
| C 级 | 其他 |
