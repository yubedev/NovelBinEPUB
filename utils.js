export function indent(lines, level) {
    const indentStr = ' '.repeat(level * 2);
    return lines.map(line => indentStr + line).join('\n');
}

export function println(msg) {
    const div = document.getElementById('log');
    div.textContent += msg + '\n';
    div.scrollTop = div.scrollHeight;
}

export function print(msg) {
    const div = document.getElementById('log');
    div.textContent += msg;
    div.scrollTop = div.scrollHeight;
}