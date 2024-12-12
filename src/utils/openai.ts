import { openai } from "./openaiConfig";

const systemPrompt = `
あなたは未来の行動をサジェストするAIアシスタントです。
ユーザーの行動に対して、具体的で実行可能な次のアクションを5つ提案してください。
提案は以下の条件を満たす必要があります：

1. 具体的で実行可能であること
2. ポジティブな表現を使用すること
3. 短く簡潔な表現であること（30文字以内）
4. 必ず「！」で終わること

レスポンスは以下のようなJSON形式で返してください：
{
  "suggestions": [
    "提案1！",
    "提案2！",
    "提案3！",
    "提案4！",
    "提案5！"
  ]
}
`;

export const generateAISuggestions = async (
  action: string
): Promise<string[]> => {
  console.log("generateAISuggestions called with:", action);
  console.log("OpenAI API Key:", !!import.meta.env.VITE_OPENAI_API_KEY);

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: action },
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 200,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    console.log("OpenAI Response:", content);

    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
        return parsed.suggestions.slice(0, 5);
      }
      throw new Error("Invalid response format");
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      throw parseError;
    }
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return [
      `${action}を継続的に実践しよう！`,
      `${action}の質を向上させよう！`,
      `${action}を記録していこう！`,
      `${action}を習慣化しよう！`,
      `${action}を楽しもう！`,
    ];
  }
};
