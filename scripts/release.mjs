#!/usr/bin/env node
// Versioning for the Brokspace zero-touch release flow (see README.md).
//
//   node release.mjs plan          what to release from the commits since the last v* tag
//   node release.mjs bump X.Y.Z    write X.Y.Z into the version files and CHANGELOG.md
//
// Run from the root of a repository checked out with its history and tags
// (actions/checkout with fetch-depth: 0). No dependencies.
//
// Versions come from Conventional Commits since the last tag:
//   feat                                  -> minor
//   fix, perf, revert, build(deps), chore(deps) -> patch
//   `type!:` or `BREAKING CHANGE:`        -> major (minor while 0.x, as Cargo reads 0.x)
//   anything else (docs, ci, test, chore, deps-dev, ...) -> no release
//
// Version files: Cargo.toml ([workspace.package] or [package]) with the
// workspace's own entries in Cargo.lock, package.json with package-lock.json,
// shard.json. The first one found is the source of truth.

import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const read = (file) => (existsSync(file) ? readFileSync(file, 'utf8') : undefined);

// --- versions ---------------------------------------------------------------

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

function parse(version) {
    const m = SEMVER.exec(version ?? '');
    return m ? m.slice(1).map(Number) : undefined;
}

function compare(a, b) {
    const [x, y] = [parse(a), parse(b)];
    for (let i = 0; i < 3; i++) {
        if (x[i] !== y[i]) return x[i] - y[i];
    }
    return 0;
}

const LEVELS = ['none', 'patch', 'minor', 'major'];

function increment(version, level) {
    const [major, minor, patch] = parse(version);
    if (level === 'major' && major === 0) level = 'minor';
    if (level === 'major') return `${major + 1}.0.0`;
    if (level === 'minor') return `${major}.${minor + 1}.0`;
    return `${major}.${minor}.${patch + 1}`;
}

// --- commits ----------------------------------------------------------------

const HEADER = /^(?<type>[a-z]+)(?:\((?<scope>[^)]*)\))?(?<breaking>!)?: (?<subject>.+)$/;

export function classify(message) {
    const [header, ...rest] = message.split('\n');
    const m = HEADER.exec(header.trim());
    if (!m) return { level: 'none' };
    const { type, scope, breaking, subject } = m.groups;
    if (type === 'chore' && /^release\b/.test(subject)) return { level: 'none' };
    let level = 'none';
    if (breaking || /^BREAKING[ -]CHANGE:/m.test(rest.join('\n'))) level = 'major';
    else if (type === 'feat') level = 'minor';
    else if (['fix', 'perf', 'revert'].includes(type)) level = 'patch';
    else if (['build', 'chore'].includes(type) && scope === 'deps') level = 'patch';
    return { level, type, scope, subject };
}

function lastTag() {
    const tags = git('tag', '--list', 'v*')
        .split('\n')
        .filter((tag) => parse(tag.slice(1)));
    tags.sort((a, b) => compare(b.slice(1), a.slice(1)));
    return tags[0];
}

function commitsSince(tag) {
    const range = tag ? [`${tag}..HEAD`] : ['HEAD'];
    const log = git('log', '--no-merges', '--format=%B%x1e', ...range);
    return log
        .split('\x1e')
        .map((message) => message.trim())
        .filter(Boolean);
}

// --- version files ----------------------------------------------------------

function cargoSection(text) {
    for (const name of ['workspace.package', 'package']) {
        const start = text.indexOf(`[${name}]\n`);
        if (start === -1) continue;
        const after = text.indexOf('\n[', start + 1);
        const end = after === -1 ? text.length : after;
        const m = /^version = "([^"]+)"$/m.exec(text.slice(start, end));
        if (m) return { start, end, version: m[1] };
    }
    return undefined;
}

export function currentVersion() {
    const cargo = read('Cargo.toml')?.replace(/\r\n/g, '\n');
    if (cargo) {
        const section = cargoSection(cargo);
        if (section) return section.version;
    }
    const pkg = read('package.json');
    if (pkg) return JSON.parse(pkg).version;
    const shard = read('shard.json');
    if (shard) return JSON.parse(shard).version;
    return undefined;
}

function write(file, text, eol) {
    writeFileSync(file, eol === '\r\n' ? text.replace(/\n/g, '\r\n') : text);
    console.log(`updated ${file}`);
}

function withLf(file) {
    const raw = read(file);
    if (raw === undefined) return undefined;
    return { text: raw.replace(/\r\n/g, '\n'), eol: raw.includes('\r\n') ? '\r\n' : '\n' };
}

function bumpCargo(from, to) {
    const toml = withLf('Cargo.toml');
    if (!toml) return;
    let { text } = toml;
    const section = cargoSection(text);
    if (!section) return;
    const head = text.slice(0, section.start);
    const body = text.slice(section.start, section.end).replace(`version = "${from}"`, `version = "${to}"`);
    text = head + body + text.slice(section.end);
    // The workspace's own crates: `brok-core = { version = "X", path = "..." }`.
    text = text
        .split('\n')
        .map((line) => (line.includes('path = ') ? line.replace(`version = "${from}"`, `version = "${to}"`) : line))
        .join('\n');
    write('Cargo.toml', text, toml.eol);

    const lock = withLf('Cargo.lock');
    if (!lock) return;
    // Workspace members are the entries without a `source` (registry or git).
    const blocks = lock.text.split('\n[[package]]\n');
    const updated = blocks.map((block, i) =>
        i > 0 && !/^source = /m.test(block) ? block.replace(`\nversion = "${from}"\n`, `\nversion = "${to}"\n`) : block,
    );
    write('Cargo.lock', updated.join('\n[[package]]\n'), lock.eol);
}

function bumpJson(file, to, from) {
    const json = withLf(file);
    if (!json) return;
    // The first top-level "version" only, keeping the file's formatting.
    const text = json.text.replace(new RegExp(`^(\\s{2}|\\t)"version": "${from.replace(/\./g, '\\.')}"`, 'm'), `$1"version": "${to}"`);
    write(file, text, json.eol);
}

function bumpPackageLock(to) {
    const json = withLf('package-lock.json');
    if (!json) return;
    const lock = JSON.parse(json.text);
    lock.version = to;
    if (lock.packages?.['']) lock.packages[''].version = to;
    write('package-lock.json', `${JSON.stringify(lock, null, 2)}\n`, json.eol);
}

// --- changelog --------------------------------------------------------------

const SECTIONS = [
    ['Added', (c) => c.type === 'feat'],
    ['Fixed', (c) => ['fix', 'revert'].includes(c.type)],
    ['Changed', (c) => c.type === 'perf' || c.scope === 'deps' || c.level === 'major'],
];

function generatedNotes(commits) {
    const releasable = commits.map(classify).filter((c) => c.level !== 'none');
    const out = [];
    for (const [title, test] of SECTIONS) {
        const items = releasable.filter((c) => test(c) && !c.done);
        if (!items.length) continue;
        out.push(`### ${title}`, '');
        for (const item of items) {
            item.done = true;
            out.push(`- ${item.subject.charAt(0).toUpperCase()}${item.subject.slice(1)}`);
        }
        out.push('');
    }
    return out.join('\n').trim();
}

function bumpChangelog(to, commits) {
    const file = withLf('CHANGELOG.md');
    if (!file) return;
    const { text } = file;
    const heading = /^## \[Unreleased\][^\n]*\n/m.exec(text);
    if (!heading) {
        console.log('CHANGELOG.md has no "## [Unreleased]" section; left as is');
        return;
    }
    const start = heading.index + heading[0].length;
    const next = text.slice(start).search(/^## /m);
    const end = next === -1 ? text.length : start + next;
    const curated = text.slice(start, end).trim();
    const notes = curated || generatedNotes(commits) || '- Maintenance release.';
    const date = new Date().toISOString().slice(0, 10);
    const section = `## [Unreleased]\n\n## [${to}] - ${date}\n\n${notes}\n\n`;
    write('CHANGELOG.md', text.slice(0, heading.index) + section + text.slice(end), file.eol);
}

// --- commands ---------------------------------------------------------------

function output(values) {
    for (const [key, value] of Object.entries(values)) {
        console.log(`${key}=${value}`);
        if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
    }
}

export function plan() {
    const current = currentVersion();
    if (!parse(current)) {
        output({ release: 'false', reason: 'no X.Y.Z version in Cargo.toml, package.json or shard.json' });
        return;
    }
    const tag = lastTag();
    const last = tag?.slice(1);
    const commits = commitsSince(tag);
    const level = commits.map((message) => classify(message).level).reduce((a, b) => (LEVELS.indexOf(b) > LEVELS.indexOf(a) ? b : a), 'none');

    // Not tagged yet, or the version files are already ahead of the tag:
    // that version is the release, no bump needed.
    if (!last || compare(current, last) > 0) {
        output({ release: 'true', current, last: last ?? '', next: current, level, bump: 'false' });
        return;
    }
    if (level === 'none') {
        output({ release: 'false', current, last, next: '', level, bump: 'false' });
        return;
    }
    output({ release: 'true', current, last, next: increment(last, level), level, bump: 'true' });
}

export function bump(to) {
    if (!parse(to)) throw new Error(`not a version: ${to}`);
    const from = currentVersion();
    const tag = lastTag();
    bumpCargo(from, to);
    if (existsSync('package.json')) {
        bumpJson('package.json', to, from);
        bumpPackageLock(to);
    }
    if (existsSync('shard.json')) bumpJson('shard.json', to, from);
    bumpChangelog(to, commitsSince(tag));
}

const [command, arg] = process.argv.slice(2);
if (command === 'plan') plan();
else if (command === 'bump') bump(arg);
else if (command) {
    console.error('usage: release.mjs plan | bump X.Y.Z');
    process.exit(2);
}
