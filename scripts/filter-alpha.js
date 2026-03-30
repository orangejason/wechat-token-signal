#!/usr/bin/env node
/**
 * WeChat Token Signal - 高倍数 Alpha 代币筛选
 * 筛选首发至今高倍数、高胜率首发人推荐的早期代币
 *
 * 用法: node filter-alpha.js
 * 可选环境变量:
 *   MIN_MULTIPLE=10      最低首发倍数（默认10）
 *   MIN_WIN_RATE=90      最低首发人胜率（默认90）
 *   MIN_RISK_SCORE=50    最低风险分数（默认50）
 *
 * 依赖: npm install ws
 */

const WebSocket = require('ws');

const WS_URL = 'ws://43.254.167.238:3000/token';
const MIN_MULTIPLE = parseFloat(process.env.MIN_MULTIPLE || '10');
const MIN_WIN_RATE = parseFloat(process.env.MIN_WIN_RATE || '90');
const MIN_RISK_SCORE = parseInt(process.env.MIN_RISK_SCORE || '50');

let found = 0;

function connect() {
  const ws = new WebSocket(WS_URL);

  ws.on('open', () => {
    console.log('=== Alpha 代币筛选器 ===');
    console.log(`筛选条件: 首发倍数 >= ${MIN_MULTIPLE}x | 胜率 >= ${MIN_WIN_RATE}% | 风险分 >= ${MIN_RISK_SCORE}`);
    console.log('等待数据...\n');
  });

  ws.on('message', (data) => {
    try {
      const token = JSON.parse(data);

      const multiple = parseFloat(token.sfzf) || 0;
      const winRate = parseFloat(token.sender_win_rate) || 0;
      const riskScore = parseInt(token.risk_score) || 0;
      const isHoneypot = token.is_honeypot === '1';

      if (
        multiple >= MIN_MULTIPLE &&
        winRate >= MIN_WIN_RATE &&
        riskScore >= MIN_RISK_SCORE &&
        !isHoneypot
      ) {
        found++;
        console.log(`--- Alpha #${found} ---`);
        console.log(`  代币: ${token.symbol} (${token.name || ''})`);
        console.log(`  链: ${token.chain}`);
        console.log(`  合约: ${token.token}`);
        console.log(`  当前价: $${token.current_price_usd}`);
        console.log(`  市值: ${token.new_market_cap_format || token.market_cap}`);
        console.log(`  首发倍数: ${token.sfzf}`);
        console.log(`  最高倍数: ${token.fshzf}x`);
        console.log(`  首发人: ${token.sfr}`);
        console.log(`  首发人胜率: ${token.sender_win_rate}%`);
        console.log(`  首发人最佳: ${token.sender_best_multiple}x`);
        console.log(`  首发社群: ${token.sfqy}`);
        console.log(`  首发时间: ${token.sfsj}`);
        console.log(`  风险分: ${riskScore}`);
        console.log(`  持有人: ${token.holders}`);
        console.log(`  5m涨幅: ${token.price_change_5m}%`);
        console.log(`  1h涨幅: ${token.price_change_1h}%`);
        console.log('');
      }
    } catch (e) {
      // ignore parse errors
    }
  });

  ws.on('close', () => {
    console.log('连接断开，5秒后重连...');
    setTimeout(connect, 5000);
  });

  ws.on('error', () => {});
}

connect();
