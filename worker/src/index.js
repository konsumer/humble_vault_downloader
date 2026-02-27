export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve frontend
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(HTML, {
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
        },
      });
    }

    // API: Fetch vault games
    if (url.pathname === '/api/games') {
      try {
        const games = await fetchAllGames(env.HUMBLE_TOKEN);
        return new Response(JSON.stringify(games), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // API: Get signed download URL
    if (url.pathname === '/api/download' && request.method === 'POST') {
      try {
        const { machineName, filename } = await request.json();
        
        if (!env.HUMBLE_TOKEN) {
          throw new Error('HUMBLE_TOKEN not configured. Run: npx wrangler secret put HUMBLE_TOKEN');
        }
        
        const signedUrl = await getSignedUrl(env.HUMBLE_TOKEN, machineName, filename);
        
        if (!signedUrl) {
          throw new Error('No signed URL returned from Humble Bundle API');
        }
        
        return new Response(JSON.stringify({ signedUrl }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (error) {
        console.error('Download error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};

async function fetchAllGames(token) {
  const allGames = [];
  let index = 0;

  while (true) {
    const url = `https://www.humblebundle.com/client/catalog?property=start&direction=desc&index=${index}`;
    
    const response = await fetch(url, {
      headers: {
        Cookie: `_simpleauth_sess=${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.statusText}`);
    }

    const catalog = await response.json();

    if (catalog.length === 0) {
      break;
    }

    allGames.push(...catalog);
    index += 1;
  }

  // Sort alphabetically
  allGames.sort((a, b) => {
    const nameA = (a["human-name"] || "").toLowerCase();
    const nameB = (b["human-name"] || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return allGames;
}

async function getSignedUrl(token, machineName, filename) {
  const params = new URLSearchParams();
  params.append('machine_name', machineName);
  params.append('filename', filename);

  console.log('Requesting signed URL:', { machineName, filename });

  const response = await fetch('https://www.humblebundle.com/api/v1/user/download/sign', {
    method: 'POST',
    headers: {
      Cookie: `_simpleauth_sess=${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Sign URL failed:', response.status, errorText);
    throw new Error(`Failed to get signed URL (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  console.log('Sign URL response:', data);
  
  if (!data || !data.signed_url) {
    throw new Error('Invalid response from Humble Bundle API: ' + JSON.stringify(data));
  }
  
  return data.signed_url;
}

const HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
        background: #f5f5f5;
        color: #333;
      }
      #loading {
        text-align: center;
        padding: 40px;
      }
      #games {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 20px;
      }
      .game {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex;
        flex-direction: column;
        cursor: pointer;
      }
      .game:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      }
      .game-header {
        position: relative;
        height: 180px;
        overflow: hidden;
      }
      .game-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .game-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
      }
      .game-content {
        padding: 16px;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .game h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        color: #333;
        line-height: 1.3;
      }
      .game-developer {
        font-size: 12px;
        color: #666;
        margin-bottom: 12px;
      }
      .game-description {
        font-size: 13px;
        color: #666;
        margin-bottom: 12px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.5;
        flex: 1;
      }
      .carousel {
        display: flex;
        gap: 4px;
        margin-bottom: 12px;
        overflow-x: auto;
        scrollbar-width: thin;
      }
      .carousel::-webkit-scrollbar {
        height: 4px;
      }
      .carousel::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 2px;
      }
      .carousel-item {
        position: relative;
        height: 50px;
        border-radius: 3px;
        cursor: pointer;
        transition: transform 0.2s;
        flex-shrink: 0;
      }
      .carousel-item img {
        height: 100%;
        border-radius: 3px;
      }
      .carousel-item:hover {
        transform: scale(1.1);
      }
      .carousel-item.video::after {
        content: '▶';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        padding-left: 2px;
      }
      .platforms {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: auto;
      }
      .platform {
        background: #007bff;
        color: white;
        padding: 8px 14px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: background 0.2s;
        white-space: nowrap;
      }
      .platform:hover {
        background: #0056b3;
      }
      .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .modal.active {
        display: flex;
      }
      .modal-content {
        max-width: 800px;
        width: 100%;
        max-height: 90vh;
        position: relative;
      }
      .modal-content img {
        max-width: 100%;
        max-height: 90vh;
        border-radius: 4px;
      }
      .modal-content iframe {
        width: 100%;
        aspect-ratio: 16/9;
        border: none;
        border-radius: 4px;
      }
      .modal-close {
        position: absolute;
        top: -40px;
        right: 0;
        color: white;
        font-size: 35px;
        font-weight: bold;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
        line-height: 1;
        z-index: 1001;
      }
      .modal-close:hover {
        color: #ccc;
      }
      .game-detail {
        background: white;
        border-radius: 8px;
        padding: 30px;
        max-height: 85vh;
        overflow-y: auto;
        color: #333;
      }
      .game-detail h2 {
        margin: 0 0 8px 0;
        color: #333;
        font-size: 28px;
      }
      .game-detail .developer {
        color: #666;
        margin-bottom: 20px;
        font-size: 16px;
      }
      .game-detail .description {
        line-height: 1.8;
        margin-bottom: 20px;
        color: #444;
        font-size: 15px;
      }
      .game-detail .detail-carousel {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 10px;
        margin-bottom: 20px;
      }
      .game-detail .detail-carousel-item {
        position: relative;
        cursor: pointer;
        border-radius: 4px;
        overflow: hidden;
      }
      .game-detail .detail-carousel-item img {
        width: 100%;
        height: auto;
        display: block;
        transition: transform 0.2s;
      }
      .game-detail .detail-carousel-item:hover img {
        transform: scale(1.05);
      }
      .game-detail .detail-carousel-item.video::after {
        content: '▶';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        padding-left: 4px;
      }
      .game-detail .platforms {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      @media (prefers-color-scheme: dark) {
        body {
          background: #1a1a1a;
          color: #e0e0e0;
        }
        .game {
          background: #2a2a2a;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }
        .game:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
        }
        .game-badge {
          background: rgba(42, 42, 42, 0.95);
          color: #e0e0e0;
        }
        .game h3 {
          color: #e0e0e0;
        }
        .game-developer {
          color: #999;
        }
        .game-description {
          color: #b0b0b0;
        }
        .carousel::-webkit-scrollbar-thumb {
          background: #555;
        }
        .platform {
          background: #0d6efd;
        }
        .platform:hover {
          background: #0a58ca;
        }
        .game-detail {
          background: #2a2a2a;
          color: #e0e0e0;
        }
        .game-detail h2 {
          color: #e0e0e0;
        }
        .game-detail .developer {
          color: #999;
        }
        .game-detail .description {
          color: #b0b0b0;
        }
      }
    </style>
  </head>
  <body>
    <div id="loading">Loading games...</div>
    <div id="games"></div>
    <div id="modal" class="modal" onclick="closeModal(event)">
      <div class="modal-content">
        <button class="modal-close" onclick="closeModal()">&times;</button>
        <div id="modal-body"></div>
      </div>
    </div>

    <script>
      let allGames = [];

      function openModal(content, isVideo = false) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = '';
        
        if (isVideo) {
          const iframe = document.createElement('iframe');
          iframe.src = \`https://www.youtube.com/embed/\${content}?autoplay=1\`;
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.allowFullscreen = true;
          modalBody.appendChild(iframe);
        } else {
          const img = document.createElement('img');
          img.src = content;
          modalBody.appendChild(img);
        }
        
        modal.classList.add('active');
      }

      function openGameDetail(game) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = '';
        
        const detail = document.createElement('div');
        detail.className = 'game-detail';
        
        const title = document.createElement('h2');
        title.textContent = game['human-name'] || '';
        detail.appendChild(title);
        
        if (game.developers && game.developers.length > 0) {
          const dev = document.createElement('div');
          dev.className = 'developer';
          const devNames = game.developers.map(d => d['developer-name']).join(', ');
          const pubNames = game.publishers ? game.publishers.map(p => p['publisher-name']).join(', ') : '';
          dev.textContent = \`By \${devNames}\${pubNames && pubNames !== devNames ? ' • Published by ' + pubNames : ''}\`;
          detail.appendChild(dev);
        }
        
        if (game['description-text']) {
          const desc = document.createElement('div');
          desc.className = 'description';
          desc.innerHTML = game['description-text'];
          detail.appendChild(desc);
        }
        
        if (game['carousel-content']) {
          const carousel = document.createElement('div');
          carousel.className = 'detail-carousel';
          
          if (game['carousel-content']['youtube-link']) {
            game['carousel-content']['youtube-link'].forEach((videoId) => {
              const item = document.createElement('div');
              item.className = 'detail-carousel-item video';
              const thumbImg = document.createElement('img');
              thumbImg.src = \`https://img.youtube.com/vi/\${videoId}/mqdefault.jpg\`;
              thumbImg.alt = 'Video';
              item.appendChild(thumbImg);
              item.onclick = (e) => {
                e.stopPropagation();
                openModal(videoId, true);
              };
              carousel.appendChild(item);
            });
          }
          
          if (game['carousel-content'].screenshot) {
            game['carousel-content'].screenshot.forEach((screenshot) => {
              const item = document.createElement('div');
              item.className = 'detail-carousel-item';
              const img = document.createElement('img');
              img.src = screenshot;
              img.alt = 'Screenshot';
              item.appendChild(img);
              item.onclick = (e) => {
                e.stopPropagation();
                openModal(screenshot);
              };
              carousel.appendChild(item);
            });
          }
          
          if (carousel.children.length > 0) {
            detail.appendChild(carousel);
          }
        }
        
        if (game.downloads) {
          const platforms = document.createElement('div');
          platforms.className = 'platforms';
          
          Object.entries(game.downloads).forEach(([platform, platformData]) => {
            if (platformData?.url?.web) {
              const btn = document.createElement('div');
              btn.className = 'platform';
              const size = platformData.size || '';
              btn.textContent = \`Download \${platform}\${size ? ' (' + size + ')' : ''}\`;
              btn.onclick = (e) => {
                e.stopPropagation();
                downloadFile(
                  platformData['machine_name'] || game['machine-name'],
                  platformData.url.web,
                  btn
                );
              };
              platforms.appendChild(btn);
            }
          });
          
          detail.appendChild(platforms);
        }
        
        modalBody.appendChild(detail);
        modal.classList.add('active');
      }

      function closeModal(event) {
        if (!event || event.target.id === 'modal' || event.target.classList.contains('modal-close')) {
          const modal = document.getElementById('modal');
          modal.classList.remove('active');
          document.getElementById('modal-body').innerHTML = '';
        }
      }

      async function fetchGames() {
        try {
          const response = await fetch('/api/games');
          const games = await response.json();
          allGames = games;
          displayGames(games);
        } catch (error) {
          document.getElementById('loading').textContent = 'Error loading games: ' + error.message;
        }
      }

      function stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      }

      function displayGames(games) {
        document.getElementById('loading').style.display = 'none';
        const container = document.getElementById('games');

        games.forEach((game) => {
          const div = document.createElement('div');
          div.className = 'game';
          div.onclick = () => openGameDetail(game);

          if (game['background-color']) {
            div.style.backgroundColor = game['background-color'];
          }

          const header = document.createElement('div');
          header.className = 'game-header';

          const img = document.createElement('img');
          img.className = 'game-image';
          img.src = game.image || '';
          img.alt = game['human-name'] || '';
          header.appendChild(img);

          if (game['humble-original']) {
            const badge = document.createElement('div');
            badge.className = 'game-badge';
            badge.textContent = 'HUMBLE ORIGINAL';
            header.appendChild(badge);
          }

          div.appendChild(header);

          const content = document.createElement('div');
          content.className = 'game-content';

          const title = document.createElement('h3');
          title.textContent = game['human-name'] || '';
          content.appendChild(title);

          if (game.developers && game.developers.length > 0) {
            const dev = document.createElement('div');
            dev.className = 'game-developer';
            dev.textContent = game.developers.map(d => d['developer-name']).join(', ');
            content.appendChild(dev);
          }

          if (game['description-text']) {
            const desc = document.createElement('div');
            desc.className = 'game-description';
            desc.textContent = stripHtml(game['description-text']);
            content.appendChild(desc);
          }

          if (game['carousel-content']) {
            const carousel = document.createElement('div');
            carousel.className = 'carousel';
            
            if (game['carousel-content']['youtube-link']) {
              game['carousel-content']['youtube-link'].forEach((videoId) => {
                const item = document.createElement('div');
                item.className = 'carousel-item video';
                const thumbImg = document.createElement('img');
                thumbImg.src = \`https://img.youtube.com/vi/\${videoId}/default.jpg\`;
                thumbImg.alt = 'Video';
                item.appendChild(thumbImg);
                item.onclick = (e) => {
                  e.stopPropagation();
                  openModal(videoId, true);
                };
                carousel.appendChild(item);
              });
            }

            if (game['carousel-content'].thumbnail && game['carousel-content'].screenshot) {
              game['carousel-content'].thumbnail.forEach((thumb, index) => {
                const item = document.createElement('div');
                item.className = 'carousel-item';
                const thumbImg = document.createElement('img');
                thumbImg.src = thumb;
                thumbImg.alt = 'Screenshot';
                item.appendChild(thumbImg);
                item.onclick = (e) => {
                  e.stopPropagation();
                  openModal(game['carousel-content'].screenshot[index]);
                };
                carousel.appendChild(item);
              });
            }
            
            if (carousel.children.length > 0) {
              content.appendChild(carousel);
            }
          }

          const platforms = document.createElement('div');
          platforms.className = 'platforms';

          if (game.downloads) {
            Object.entries(game.downloads).forEach(([platform, platformData]) => {
              if (platformData?.url?.web) {
                const btn = document.createElement('div');
                btn.className = 'platform';
                const size = platformData.size || '';
                btn.textContent = \`\${platform}\${size ? ' (' + size + ')' : ''}\`;
                btn.onclick = (e) => {
                  e.stopPropagation();
                  downloadFile(
                    platformData['machine_name'] || game['machine-name'],
                    platformData.url.web,
                    btn
                  );
                };
                platforms.appendChild(btn);
              }
            });
          }

          content.appendChild(platforms);
          div.appendChild(content);
          container.appendChild(div);
        });
      }

      async function downloadFile(machineName, filename, btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Getting download link...';
        btn.style.pointerEvents = 'none';

        try {
          const response = await fetch('/api/download', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ machineName, filename }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || \`HTTP \${response.status}\`);
          }

          const data = await response.json();
          console.log('Download API response:', data);
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          if (!data.signedUrl) {
            throw new Error('No download URL in response: ' + JSON.stringify(data));
          }
          
          // Open download in new tab
          window.open(data.signedUrl, '_blank');
          btn.textContent = '✓ Opening download';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.pointerEvents = 'auto';
          }, 2000);
        } catch (error) {
          btn.textContent = '✗ Error';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.pointerEvents = 'auto';
          }, 2000);
          console.error('Download error:', error);
          alert('Download error: ' + error.message);
        }
      }

      fetchGames();
    </script>
  </body>
</html>
`;
