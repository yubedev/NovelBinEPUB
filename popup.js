import { generateEPUB } from './epub-generator.js';
import { indent, println } from './utils.js';

let data = null;

(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url.includes('novelbin.com')) {
    alert("This extension only works on novelbin.com");
    return;
  }
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  }, () => {
    chrome.tabs.sendMessage(tab.id, { type: 'GET_META' }, (res) => {
      if (chrome.runtime.lastError || !res) {
        document.getElementById('title').textContent = 'Error fetching data';
        println(chrome.runtime.lastError?.message || 'No response');
        return;
      }
      data = res;
      document.getElementById('title').textContent = res.title;
      document.getElementById('cover').src = res.cover;
      document.getElementById('chapters').textContent = `Chapters: ${res.chapters.length}`;
      document.getElementById('saveBtn').disabled = false;
      println('Metadata loaded.');
    });
  });
})();


document.getElementById('saveBtn').addEventListener('click', async () => {
  if (!data) return;
  document.getElementById('saveBtn').disabled = true;
  println('Fetching chapters…');

  const coverResponse = await fetch(data.cover);
  const coverBlob = await coverResponse.blob();
  const coverBuffer = await coverBlob.arrayBuffer();

  const chapters = [];
  for (let i = 0; i < data.chapters.length; i++) {
    const {url, title} = data.chapters[i];
    println(`→ Chapter ${i + 1}/${data.chapters.length}`);

    while (true) {
      try {
        const html = await fetch(url).then(r => r.text());
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const paragraphs = doc.querySelectorAll('#chr-content > p');
        if (paragraphs.length == 0) {
          print(".")
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
        const content = Array.from(paragraphs).map(p => p.outerHTML)
        chapters.push({ title, body: indent(content, 2) });
        break;

      } catch (e) {
        println(`! Failed to fetch: ${e.message}`);
      }
      
    }
  }

  println('Generating EPUB…');
  try {
    await generateEPUB({
      title: data.title,
      coverBuffer,
      author: data.author,
      description: data.description,
      chapters
    });
    println('Download started.');
  } catch (e) {
    println(`! EPUB error: ${e.message}`);
  }
});
