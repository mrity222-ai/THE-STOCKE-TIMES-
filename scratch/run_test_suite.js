const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) { json = data; }
        resolve({ statusCode: res.statusCode, headers: res.headers, body: json, rawBody: data });
      });
    });
    req.on('error', err => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runFullTestSuite() {
  console.log('============ 🚀 STARTING FULL END-TO-END TEST SUITE ============');
  const results = [];

  // Step 0: Admin Login
  console.log('\n🔐 Authenticating Admin User...');
  let sessionCookie = '';
  try {
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'info@avedatechnologies.com', password: 'Admin@123456' });

    if (loginRes.statusCode === 200 && loginRes.body?.success) {
      console.log('✅ Admin Login Successful!');
      const cookies = loginRes.headers['set-cookie'];
      if (cookies) sessionCookie = cookies.join('; ');
    } else {
      console.log('⚠️ Admin login returned:', loginRes.statusCode, loginRes.body);
    }
  } catch (err) {
    console.log('⚠️ Admin login error:', err.message);
  }

  // 1️⃣ Test Case 1A: Market Data API
  console.log('\n📊 Test 1A: Yahoo Finance Market Data API (GET /api/market-data)...');
  try {
    const marketRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/api/market-data', method: 'GET' });
    const isOk = marketRes.statusCode === 200 && Array.isArray(marketRes.body?.indices);
    const nifty = marketRes.body?.indices?.find(i => i.symbol === 'NIFTY 50');
    console.log(`Result: ${isOk ? '✅ PASS' : '❌ FAIL'} (Status: ${marketRes.statusCode}, Nifty: ${nifty ? nifty.value : 'N/A'})`);
    results.push({ test: 'Yahoo Finance Market Data API', pass: isOk, detail: `Fetched ${marketRes.body?.indices?.length || 0} indices` });
  } catch (err) {
    console.log('❌ FAIL:', err.message);
    results.push({ test: 'Yahoo Finance Market Data API', pass: false, detail: err.message });
  }

  // 2️⃣ Test Case 1B: Finnhub News API
  console.log('\n📰 Test 1B: Finnhub Breaking News API (GET /api/finnhub/news)...');
  try {
    const newsRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/api/finnhub/news', method: 'GET' });
    const isOk = newsRes.statusCode === 200 && Array.isArray(newsRes.body?.news);
    console.log(`Result: ${isOk ? '✅ PASS' : '❌ FAIL'} (Status: ${newsRes.statusCode}, Articles fetched: ${newsRes.body?.news?.length || 0})`);
    results.push({ test: 'Finnhub News API', pass: isOk, detail: `${newsRes.body?.news?.length || 0} news items fetched` });
  } catch (err) {
    console.log('❌ FAIL:', err.message);
    results.push({ test: 'Finnhub News API', pass: false, detail: err.message });
  }

  // 3️⃣ Test Case 1C: Finnhub Webhook Receiver
  console.log('\n⚡ Test 1C: Finnhub Real-Time Webhook Endpoint (POST /api/finnhub/webhook)...');
  try {
    const webhookRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/finnhub/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Finnhub-Secret': 'dav1e0pr01qrjdu8j23g'
      }
    }, { event: 'ping', symbol: 'NSE:RELIANCE', timestamp: Date.now() });
    const isOk = webhookRes.statusCode === 200 && webhookRes.body?.status === 'ok';
    console.log(`Result: ${isOk ? '✅ PASS' : '❌ FAIL'} (Status: ${webhookRes.statusCode}, Message: ${webhookRes.body?.message})`);
    results.push({ test: 'Finnhub Webhook Receiver', pass: isOk, detail: `ACK Instant 200 OK: ${webhookRes.body?.message}` });
  } catch (err) {
    console.log('❌ FAIL:', err.message);
    results.push({ test: 'Finnhub Webhook Receiver', pass: false, detail: err.message });
  }

  // 4️⃣ Test Case 2 & 3: AI Agents Post Writing & Publishing
  console.log('\n🤖 Test 2 & 3: 10 AI Agents AutoPilot Article Generation & Live Publishing...');
  const sampleTopic = 'Tata Motors Q2 Earnings & Nifty 50 Market Forecast 2026';
  let createdArticleId = null;
  let createdArticleSlug = null;

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (sessionCookie) headers['Cookie'] = sessionCookie;

    const autoRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/ai/autopilot-post',
      method: 'POST',
      headers
    }, {
      topic: sampleTopic,
      category: 'stock-market',
      country: 'IN',
      autoPublish: true
    });

    const isOk = autoRes.statusCode === 200 && autoRes.body?.success && autoRes.body?.article;
    if (isOk) {
      createdArticleId = autoRes.body.article.id;
      createdArticleSlug = autoRes.body.article.slug;
      const wordCount = autoRes.body.article.content ? autoRes.body.article.content.split(/\s+/).length : 0;

      console.log(`✅ PASS! AI Post Created & Published Live!`);
      console.log(`   📌 Article ID: ${createdArticleId}`);
      console.log(`   📌 Slug: ${createdArticleSlug}`);
      console.log(`   📌 Title: ${autoRes.body.article.title}`);
      console.log(`   📌 Word Count: ~${wordCount} words`);
      console.log(`   📌 Featured Image: ${autoRes.body.article.featuredImage ? 'Yes (Generated/Curated)' : 'No'}`);

      results.push({ test: 'AI Agents Article Writing & Publishing', pass: true, detail: `Article ID: ${createdArticleId}, Slug: ${createdArticleSlug}, ~${wordCount} words` });
    } else {
      console.log('❌ FAIL:', autoRes.statusCode, autoRes.body);
      results.push({ test: 'AI Agents Article Writing & Publishing', pass: false, detail: JSON.stringify(autoRes.body) });
    }
  } catch (err) {
    console.log('❌ FAIL:', err.message);
    results.push({ test: 'AI Agents Article Writing & Publishing', pass: false, detail: err.message });
  }

  // 5️⃣ Test Case 3B: Verify Live Article in List & Sitemap
  console.log('\n🌐 Test 3B: Verifying Live Post Rendering & Sitemap Update...');
  try {
    const listRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/api/articles', method: 'GET' });
    const articles = Array.isArray(listRes.body) ? listRes.body : listRes.body?.articles || [];
    const foundInList = articles.some(a => a.id === createdArticleId || a.slug === createdArticleSlug);

    const sitemapRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/sitemap.xml', method: 'GET' });
    const foundInSitemap = typeof sitemapRes.rawBody === 'string' && createdArticleSlug && sitemapRes.rawBody.includes(createdArticleSlug);

    console.log(`   📌 Found in Live Articles Feed: ${foundInList ? '✅ YES' : '❌ NO'}`);
    console.log(`   📌 Found in Sitemap.xml: ${foundInSitemap ? '✅ YES' : '❌ NO'}`);

    const pass = foundInList && foundInSitemap;
    results.push({ test: 'Live Article Feed & Sitemap Verification', pass, detail: `Feed: ${foundInList ? 'OK' : 'MISSING'}, Sitemap: ${foundInSitemap ? 'OK' : 'MISSING'}` });
  } catch (err) {
    console.log('❌ FAIL:', err.message);
    results.push({ test: 'Live Article Feed & Sitemap Verification', pass: false, detail: err.message });
  }

  // 6️⃣ Test Case 4: Article Deletion Test
  console.log('\n🗑️ Test 4: Deleting Article via DELETE /api/articles/:id...');
  if (createdArticleId) {
    try {
      const delRes = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: `/api/articles/${createdArticleId}`,
        method: 'DELETE'
      });

      const isDelOk = delRes.statusCode === 200 && delRes.body?.success;
      console.log(`   📌 Delete API Response: ${isDelOk ? '✅ PASS' : '❌ FAIL'} (${delRes.body?.message})`);

      // Verify removal from feed
      const verifyListRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/api/articles', method: 'GET' });
      const verifyArticles = Array.isArray(verifyListRes.body) ? verifyListRes.body : verifyListRes.body?.articles || [];
      const stillInList = verifyArticles.some(a => a.id === createdArticleId || a.slug === createdArticleSlug);

      // Verify removal from sitemap
      const verifySitemapRes = await makeRequest({ hostname: 'localhost', port: 3000, path: '/sitemap.xml', method: 'GET' });
      const stillInSitemap = typeof verifySitemapRes.rawBody === 'string' && createdArticleSlug && verifySitemapRes.rawBody.includes(createdArticleSlug);

      console.log(`   📌 Removed from Live Articles Feed: ${!stillInList ? '✅ YES (Deleted)' : '❌ NO (Still present)'}`);
      console.log(`   📌 Removed from Sitemap.xml: ${!stillInSitemap ? '✅ YES (Deleted)' : '❌ NO (Still present)'}`);

      const pass = isDelOk && !stillInList && !stillInSitemap;
      results.push({ test: 'Article Deletion & Cleanup Protocol', pass, detail: `Cleaned from DB, Feed & Sitemap` });
    } catch (err) {
      console.log('❌ FAIL:', err.message);
      results.push({ test: 'Article Deletion & Cleanup Protocol', pass: false, detail: err.message });
    }
  } else {
    console.log('⚠️ Skipping deletion test since article creation did not return ID.');
  }

  console.log('\n================ 📊 FINAL TEST RESULTS SUMMARY ================');
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.test.padEnd(45, '.')} ${r.pass ? '✅ PASS' : '❌ FAIL'} (${r.detail})`);
  });
  console.log('===============================================================\n');
}

runFullTestSuite();
