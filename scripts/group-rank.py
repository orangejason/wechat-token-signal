#!/usr/bin/env python3
"""
WeChat Token Signal - 群热度排行
实时统计群热度，每100条数据输出 TOP N 排行

用法: python group-rank.py [TOP_N]
依赖: pip install websockets
"""

import asyncio
import json
import sys
from collections import defaultdict

import websockets

WS_URL = 'ws://43.254.167.238:3000/token'
TOP_N = int(sys.argv[1]) if len(sys.argv) > 1 else 10


async def track():
    groups = defaultdict(lambda: {'tokens': set(), 'mentions': 0, 'sqzs': 0, 'fgq': 0, 'qwfc': 0, 'cazs': 0})
    count = 0

    while True:
        try:
            async with websockets.connect(WS_URL) as ws:
                print(f'已连接，统计群热度 TOP {TOP_N}...\n')
                async for message in ws:
                    try:
                        t = json.loads(message)
                        count += 1

                        group = t.get('qun_name') or t.get('sfqy')
                        if not group:
                            continue

                        g = groups[group]
                        g['tokens'].add(t.get('symbol', '?'))
                        g['mentions'] += 1
                        g['sqzs'] = max(g['sqzs'], t.get('sqzs', 0))
                        g['fgq'] = max(g['fgq'], t.get('fgq', 0))
                        g['qwfc'] = max(g['qwfc'], t.get('qwfc', 0))
                        g['cazs'] = max(g['cazs'], t.get('cazs', 0))

                        # 每100条输出排行
                        if count % 100 == 0:
                            ranked = sorted(
                                groups.items(),
                                key=lambda x: (
                                    x[1]['sqzs'] * 0.4
                                    + x[1]['fgq'] * 10 * 0.3
                                    + x[1]['qwfc'] * 0.2
                                    + x[1]['cazs'] * 0.1
                                ),
                                reverse=True,
                            )

                            print(f'\n{"=" * 80}')
                            print(f'  群热度 TOP {TOP_N}（已处理 {count} 条，{len(groups)} 个群）')
                            print(f'{"=" * 80}')

                            for i, (name, d) in enumerate(ranked[:TOP_N]):
                                heat = (
                                    d['sqzs'] * 0.4
                                    + d['fgq'] * 10 * 0.3
                                    + d['qwfc'] * 0.2
                                    + d['cazs'] * 0.1
                                )
                                print(
                                    f'  {i + 1:>2}. {name[:20]:<20} | '
                                    f'热度:{heat:<8.1f} | '
                                    f'社群指数:{d["sqzs"]:<5} | '
                                    f'提及{d["mentions"]}次 | '
                                    f'{len(d["tokens"])}个代币'
                                )

                            print()

                    except json.JSONDecodeError:
                        pass

        except (websockets.ConnectionClosed, ConnectionRefusedError, OSError) as e:
            print(f'\n连接断开 ({e})，5秒后重连...')
            await asyncio.sleep(5)


if __name__ == '__main__':
    asyncio.run(track())
