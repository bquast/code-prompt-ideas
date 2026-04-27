export async function onRequest(context) {
    const { env } = context;
    const db = env.DB; // D1 binding

    // Simple random battle from seeded data
    const stmt = await db.prepare(`
        SELECT 
            b.id as battleId,
            p.prompt,
            g1.model as modelA,
            g1.code as codeA,
            g2.model as modelB,
            g2.code as codeB
        FROM battles b
        JOIN prompts p ON b.prompt_id = p.id
        JOIN generations g1 ON b.gen1_id = g1.id
        JOIN generations g2 ON b.gen2_id = g2.id
        ORDER BY RANDOM() LIMIT 1
    `);
    
    const battle = await stmt.first();
    
    if (!battle) {
        // Fallback static for initial deploy
        return Response.json({
            battleId: 'demo-1',
            prompt: "Write a vanilla JS function that reverses a string without using built-in reverse()",
            modelA: "Model X (Claude)",
            codeA: `function reverseStr(str) {\n  let result = "";\n  for (let i = str.length - 1; i >= 0; i--) {\n    result += str[i];\n  }\n  return result;\n}`,
            modelB: "Model Y (Grok)",
            codeB: `function reverseStr(str) {\n  return [...str].reduceRight((a, c) => a + c, "");\n}`
        });
    }
    
    return Response.json(battle);
}