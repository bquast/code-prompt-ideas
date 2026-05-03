export async function onRequest(context) {
    const { request, env } = context;
    const db = env.DB;
    
    const data = await request.json();
    
    // Record vote + simple ELO update (can be expanded)
    await db.prepare(`
        INSERT INTO votes (battle_id, winner_side, created_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    `).bind(data.battleId, data.winner).run();
    
    // Optional: update model scores
    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
