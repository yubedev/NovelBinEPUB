export function indent(lines, level) {
    const indentStr = ' '.repeat(level * 2);
    return lines.map(line => indentStr + line).join('\n');
}

export function logprintln(msg) {
    const div = document.getElementById('log');
    const line = document.createElement("div");
    line.textContent = msg;
    div.appendChild(line);
    div.scrollTop = div.scrollHeight;
}

export function logprint(msg) {
    const div = document.getElementById('log');
    let lastLine = div.lastChild;
    if (!lastLine) {
        lastLine = document.createElement("div");
        div.appendChild(lastLine);
    }
    lastLine.textContent += msg;
    div.scrollTop = div.scrollHeight;
}