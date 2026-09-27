import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scan, statsFromMatches } from '../js/scanner.js';

const expected = {
  'advanced_ioc.txt': { url: [4, 4], email: [1, 1], ipv4: [1, 1], domain: [1, 1], hash: [2, 2],
    filePath: [4, 4], registryKey: [3, 3], bitcoin: [3, 3], cve: [4, 4], mitre: [8, 8] },
  'apache.txt': { url: [1, 1], email: [1, 1], ipv4: [10, 7], hash: [1, 1] },
  'auth.log': { ipv4: [8, 8], filePath: [2, 2] },
  'dns.log': { ipv4: [20, 4], domain: [8, 8] },
  'mail.log': { email: [5, 4], domain: [4, 2], ipv4: [6, 3] },
  'proxy.log': { url: [10, 10], ipv4: [10, 8] }
};
for (const [file, counts] of Object.entries(expected)) {
  test(`A-3 ${file}: total / unique for every type`, () => {
    const text = readFileSync(new URL('../samples/' + file, import.meta.url), 'utf8');
    const stats = statsFromMatches(scan(text));
    for (const [type, data] of Object.entries(stats)) {
      assert.deepEqual([data.total, data.unique], counts[type] || [0, 0], type);
    }
  });
}

const values = {
  'advanced_ioc.txt': {
    filePath: [String.raw`C:\Windows\System32\evil.exe`, String.raw`C:\Users\victim\AppData\Local\Temp\update.ps1`,
      '/tmp/.hidden/backdoor.sh', '/Users/admin/Library/LaunchAgents/com.malware.plist'],
    domain: ['evil-c2-server.com']
  },
  'apache.txt': { ipv4: ['192.0.2.10', '203.0.113.55', '198.51.100.23', '192.0.2.44',
    '203.0.113.77', '192.0.2.99', '203.0.113.88'] },
  'auth.log': { filePath: ['/home/user1', '/bin/ls'] },
  'dns.log': { domain: ['bad-domain.xyz', 'update.example.org', 'test.example.net', 'login.evil.com',
    'safe.example.com', 'admin.evil.com', 'ftp.example.net', 'test.badsite.ru'] },
  'mail.log': { domain: ['mail.example.org', 'example.net'],
    email: ['spam@badmail.com', 'abc123@example.org', 'sender@example.org', 'user1@example.net'] }
};
test('A-3 all specified unique values', () => {
  for (const [file, types] of Object.entries(values)) {
    const stats = statsFromMatches(scan(readFileSync(new URL('../samples/' + file, import.meta.url), 'utf8')));
    for (const [type, items] of Object.entries(types)) assert.deepEqual(stats[type].items, items);
  }
});

const examples = [
  ['192.168.1.1', 'ipv4'], ['2001:db8::1', 'ipv6'], ['::1', 'ipv6'], ['fe80::1', 'ipv6'],
  ['::ffff:192.0.2.1', 'ipv6'], ['example.com', 'domain'], ['user@example.com', 'email'],
  ['d41d8cd98f00b204e9800998ecf8427e', 'hash'], ['https://example.com/path', 'url'],
  [String.raw`C:\Windows\System32\cmd.exe`, 'filePath'], [String.raw`HKLM\SOFTWARE\Microsoft`, 'registryKey'],
  ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', 'bitcoin'], ['CVE-2021-44228', 'cve'], ['T1059.001', 'mitre'],
  ...['flag{example_flag}', 'CTF{another_flag}', 'picoCTF{pico_flag_example}', 'hacktheBox{htb_challenge_flag}',
    'TryHackMe{thm_room_flag}', 'HTB{short_format}', 'THM{short_format}'].map(value => [value, 'flag'])
];
for (const [value, type] of examples) {
  test(`A-4 ${value}`, () => {
    assert.deepEqual(scan(value), [{ type, start: 0, end: value.length, raw: value, value, line: 1 }]);
  });
}

for (const value of ['[02/Jul/2025:10:00:01 +0900]', 'Jul 2 10:01:01 localhost sshd[1234]:',
  'GET /index.html HTTP/1.1', 'main.js', 'setup.exe', 'Object.keys', '999.999.999.999',
  'version 1.2.3.4.5', 'MAC 00:1A:2B:3C:4D:5E', 'AT1234', 'PART1234', 'T12345', 'xCVE-2021-44228']) {
  test(`A-5 not an IOC: ${value}`, () => assert.deepEqual(scan(value), []));
}

test('boundaries, nulls, Unicode, long input, IPv6, SHA512 and flag maximum', () => {
  for (const input of [null, undefined, 123, {}, [], '', '😀日本語', 'a'.repeat(10000)]) assert.deepEqual(scan(input), []);
  for (const input of ['fe80::1%eth0', '1:2:3:4:5:6:7:8', '::']) assert.equal(scan(input)[0]?.type, 'ipv6');
  for (const input of ['1:2:3:4:5:6:7', '1:2:3:4:5:6:7:8:9', '1::2::3']) assert.deepEqual(scan(input), []);
  assert.equal(scan('f'.repeat(128))[0].type, 'hash');
  assert.deepEqual(scan('z' + 'f'.repeat(128)), []);
  assert.equal(scan('flag{' + 'x'.repeat(256) + '}').length, 1);
  assert.equal(scan('flag{' + 'x'.repeat(257) + '}').length, 0);
  assert.equal(scan(String.raw`\\server\share`)[0].type, 'filePath');
  assert.deepEqual(scan('/index.html /api/user'), []);
  assert.deepEqual(scan('xCVE-2021-12345 CVE-2021-12345678 T1234.1234 T1234.'), []);
  assert.equal(scan('https://example.com/path).')[0].raw, 'https://example.com/path');
});
