chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.type === 'GET_META') {
      
      const title = document.querySelector('.title')?.innerText.trim() || 'Untitled';
      const cover = document.querySelector('.book > .lazy')?.src || '';

      // author
      const metaItems = document.querySelectorAll('.info-meta li');
      let author = '';
      for (const li of metaItems) {
        const heading = li.querySelector('h3');
        if (heading && heading.textContent.trim() === 'Author:') {
          const authorLink = li.querySelector('a');
          author = authorLink?.textContent.trim() || '';
          break;
        }
      }

      const description = document.querySelector('.desc-text')?.innerText.trim() || ''
      
      const chapters = Array.from(
        document.querySelectorAll('.panel-body a')
      ).map(a => ({ 
        url: a.href, 
        title: a.title 
      }));

      sendResponse({ title, cover, author, description, chapters });
    }
  });
  