#!/usr/bin/env node
/**
 * WeChat Token Signal - 代币信号筛选
 * 综合三维数据筛选高质量代币信号
 *
 * 用法: node token-filter.js
 * 可选环境变量:
 *   MIN_MULTIPLE=10      最低推荐倍数（默认10）
 *   MIN_GROUPS=3         最低覆盖群数（默认3）
 *   MIN_RISK_SCORE=50    最低风险分数（默认50）
 *
 * 依赖: npm install ws
 */

const WebSocket = require('ws');

const WS_URL = 'ws://43.254.167.238:3000/token';
const MIN_MULTIPLE = parseFloat(process.env.MIN_MULTIPLE || '10');
const MIN_GROUPS = parseInt(process.env.MIN_GROUPS || '3');
const MIN_RISK_SCORE = parseInt(process.env.MIN_RISK_SCORE || '50');

let found = 0;

function connect() {
  const ws = new WebSocket(WS_URL);
  let lastMessage = Date.now();

  ws.on('open', () => {
    console.log('=== 代币信号筛选器 ===');
    console.log(`筛选条件: 倍数 >= ${MIN_MULTIPLE}x | 覆盖群 >= ${MIN_GROUPS} | 风险分 >= ${MIN_RISK_SCORE}`);
    console.log('等待数据...\n');
  });

  ws.on('message', (data) => {
    try {
      lastMessage = Date.now();
      const token = JSON.parse(data);

      const multiple = parseFloat(token.sfzf) || 0;
      const groups = token.fgq || 0;
      const riskScore = parseInt(token.risk_score) || 0;
      const isHoneypot = token.is_honeypot === '1';

      if (
        multiple >= MIN_MULTIPLE &&
        groups >= MIN_GROUPS &&
        riskScore >= MIN_RISK_SCORE &&
        !isHoneypot
      ) {
        found++;
        const caller = token.sfr || token.cxr || token.qy_name || '未知';
        const group = token.qun_name || token.sfqy || '-';

        // 修正胜率
        const winTokens = parseInt(token.sender_win_tokens) || 0;
        const totalTokens = token.sender_total_tokens || 0;
        const correctedRate = totalTokens > 0 ? (winTokens / totalTokens * 100).toFixed(1) : '-';

        console.log(`--- 信号 #${found} ---`);
        console.log(`  代币: ${token.symbol} (${token.name || ''})`);
        console.log(`  链: ${token.chain} | 合约: ${token.token}`);
        console.log(`  价格: $${token.current_price_usd} | 市值: ${token.new_market_cap_format || token.market_cap}`);
        console.log(`  推荐倍数: ${token.sfzf} | 最高倍数: ${token.fshzf}x`);
        console.log(`  来源: ${caller} | 修正胜率: ${correctedRate}%`);
        console.log(`  群: ${group} | 覆盖: ${groups}群 | 提及: ${token.qwfc}次`);
        console.log(`  风险分: ${riskScore} | 持有人: ${token.holders}`);
        console.log('');
      }
    } catch (e) {
      // ignore
    }
  });

  ws.on('close', () => setTimeout(connect, 5000));
  ws.on('error', () => {});

  // 心跳检测
  const heartbeat = setInterval(() => {
    if (Date.now() - lastMessage > 5 * 60 * 1000) {
      clearInterval(heartbeat);
      ws.terminate();
    }
  }, 60000);

  ws.on('close', () => clearInterval(heartbeat));
}

connect();
