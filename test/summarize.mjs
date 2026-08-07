import fs from 'fs';
import path from 'path';

const resultsFile = path.join(import.meta.dirname, 'results', 'test-results.xml');
const summaryFile = path.join(import.meta.dirname, 'results', 'SUMMARY.md');

const xml = fs.readFileSync(resultsFile, 'utf8');

const passed = Number((xml.match(/<!-- pass (\d+) -->/) || [])[1] || 0);
const failed = Number((xml.match(/<!-- fail (\d+) -->/) || [])[1] || 0);
const skipped = Number((xml.match(/<!-- skipped (\d+) -->/) || [])[1] || 0);
const durationMs = Number((xml.match(/<!-- duration_ms ([\d.]+) -->/) || [])[1] || 0);
const failures = [];

const testcaseRe = /<testcase\s+name="([^"]*)"[^>]*>(?:<failure[^>]*>([\s\S]*?)<\/failure>)?<\/testcase>/g;
let match;
while ((match = testcaseRe.exec(xml)) !== null) {
    if (match[2] !== undefined) {
        failures.push({name: match[1], detail: match[2]});
    }
}

function unescape(value) {
    return value
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');
}

const lines = [
    '# 单元测试结果',
    '',
    `- 运行时间: ${new Date().toISOString()}`,
    `- 通过: ${passed}`,
    `- 失败: ${failed}`,
    `- 跳过: ${skipped}`,
    `- 总耗时: ${durationMs} ms`,
];

if (failures.length > 0) {
    lines.push('', '## 失败用例', '');
    failures.forEach(failure => {
        lines.push(`- **${failure.name}**`);
        const detail = unescape(failure.detail).trim();
        lines.push('', '```', detail.slice(0, 1200), '```');
    });
}

fs.writeFileSync(summaryFile, lines.join('\n') + '\n');
process.stdout.write(`test summary written to ${summaryFile}\n`);
