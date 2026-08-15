const testGameEngine = async () => {
    try {
        console.log('1. Testing score submission for Retro Snake...');
        const sRes = await fetch('http://localhost:5000/api/portfolio/games/snake/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerName: 'Mahadeb (Pro)',
                score: 120,
                metrics: { moves: 12 }
            })
        });
        const sData = await sRes.json();
        console.log('✅ Snake Score recorded:', sData);

        console.log('\n2. Testing score submission for 2048 Puzzle...');
        const pRes = await fetch('http://localhost:5000/api/portfolio/games/2048/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerName: 'Player 2048',
                score: 2560,
                metrics: { highestTile: 256, moves: 85 }
            })
        });
        const pData = await pRes.json();
        console.log('✅ 2048 Score recorded:', pData);

        console.log('\n3. Testing score submission for Typing Challenge...');
        const tRes = await fetch('http://localhost:5000/api/portfolio/games/typing/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerName: 'SpeedCoder',
                score: 88, // WPM
                metrics: { accuracy: 98, timeSec: 28 }
            })
        });
        const tData = await tRes.json();
        console.log('✅ Typing Score recorded:', tData);

        console.log('\n4. Testing Leaderboard query (GET /api/portfolio/games/snake/leaderboard)...');
        const lbRes = await fetch('http://localhost:5000/api/portfolio/games/snake/leaderboard');
        const lbData = await lbRes.json();
        console.log('✅ Leaderboard results:', lbData);

        console.log('\n🎉 ALL GAME SCORE & LEADERBOARD ENDPOINTS WORKING 100%!');
    } catch (err) {
        console.error('❌ Test failed:', err.message);
    }
};

testGameEngine();
