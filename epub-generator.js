import { indent } from './utils.js';

export async function generateEPUB({ title, coverBuffer, author, description, chapters }) {
  const zip = new JSZip();

  // mimetype
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // META-INF/container.xml
  zip.folder('META-INF').file('container.xml', 
`<?xml version="1.0" encoding="UTF-8"?>'
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  const OEBPS = zip.folder('OEBPS');

  // images/cover.jpg
  OEBPS.folder('images').file('cover.jpg', coverBuffer);

  // manifest & spine
  const manifestItems = [
    `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
    `<item id="cover" href="images/cover.jpg" media-type="image/jpeg"/>`
  ];
  const spineItems = [];
  
  chapters.forEach((chapter, index) => {
    manifestItems.push(`<item id="chapter${index + 1}" href="chapter-${index + 1}.xhtml" media-type="application/xhtml+xml"/>`);
    spineItems.push(`<itemref idref="chapter${index + 1}"/>`);
  });

  const manifest = indent(manifestItems, 2);
  const spine = indent(spineItems, 2);

  const uid = crypto.randomUUID()

  // content.opf
  OEBPS.file('content.opf',
`<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">${uid}</dc:identifier>
    <dc:title>${title}</dc:title>
    <dc:language>en</dc:language>
    <dc:date>${new Date().toISOString()}</dc:date>
    <dc:creator id="creator">${author}</dc:creator>
    <dc:description>${description}</dc:description>
    <meta name="cover" content="cover"/>
  </metadata>
  <manifest>
${manifest}
  </manifest>
  <spine toc="ncx">
${spine}
  </spine>
</package>`
  );

  // navMap
  const navMapItems = []

  chapters.forEach((chapter, index) => {
    navMapItems.push(
`<navPoint id="chapter${index + 1}" playOrder="${index + 1}">
      <navLabel>
        <text>${chapter.title}</text>
      </navLabel>
      <content src="chapter-${index + 1}.xhtml" />
    </navPoint>`
    )
  });

  const navMap = indent(navMapItems, 2);

  // toc.ncx
  OEBPS.file('toc.ncx',
`<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${uid}"/>
    <meta name="dtb:depth" content="2"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${title}</text>
  </docTitle>
  <docAuthor>
    <text>${author}</text>
  </docAuthor>
  <navMap>
${navMap}
  </navMap>
</ncx>`
  );

  // chapters
  chapters.forEach((chapter, index) => {
    OEBPS.file(`chapter-${index + 1}.xhtml`,
`<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>${chapter.title}</title>
  </head>
  <body>
    <h1>${chapter.title}</h1>
${chapter.body}
  </body>
</html>`
    );
  });


  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip'
  });

  const url = URL.createObjectURL(blob);
  const sanitizeTitle = title.replace(/[<>:"/\\|?*]/g, '_');
  chrome.downloads.download({
    url,
    filename: `${sanitizeTitle}.epub`,
    saveAs: true
  });
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
