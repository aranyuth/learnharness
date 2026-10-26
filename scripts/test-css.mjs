import http from 'node:http';

http.get('http://localhost:3000/socratic', (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    const cssLinks = [...data.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi)].map(m => m[0]);
    console.log('CSS Links found:', cssLinks);
    for (const link of cssLinks) {
      const match = link.match(/href=["']([^"']+)["']/);
      if (match) {
        const href = match[1];
        http.get('http://localhost:3000' + href, (cssRes) => {
          let cssData = '';
          cssRes.on('data', c => cssData += c);
          cssRes.on('end', () => {
            console.log(href, 'Status:', cssRes.statusCode, 'Bytes:', cssData.length);
            console.log('Sample CSS snippet:', cssData.slice(0, 300));
          });
        });
      }
    }
  });
});
