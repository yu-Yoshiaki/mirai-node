import { openai } from "./openaiConfig";

export const generateMandalaContent = async (centerTopic: string) => {
  try {
    console.log("generateMandalaContent: ", centerTopic);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
あなたはマンダラチャートを生成するアシスタントです。
中心テーマに対して、それを実現するための8つの具体的な要素を提案してください。
以下の条件を満たすように生成してください：

1. 具体的で実行可能な内容
2. 中心テーマの目標達成に直接関連する内容
3. 相互に重複しない独立した内容
4. 簡潔な表現（1-3単語程度）

結果は以下のようなJSON形式で返してください：
{
  "elements": [
    "要素1",
    "要素2",
    "要素3",
    "要素4",
    "要素5",
    "要素6",
    "要素7",
    "要素8"
  ]
}`,
        },
        {
          role: "user",
          content: `中心テーマ「${centerTopic}」に関連する8つの要素を生成してください。`,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.elements) || parsed.elements.length !== 8) {
      throw new Error("Invalid response format");
    }

    return parsed.elements;
  } catch (error) {
    console.error("OpenAI API error:", error);
    // エラー時のフォールバック
    return [
      `${centerTopic}の計画`,
      `${centerTopic}の準備`,
      `${centerTopic}の実践`,
      `${centerTopic}の評価`,
      `${centerTopic}の改善`,
      `${centerTopic}の継続`,
      `${centerTopic}の発展`,
      `${centerTopic}の共有`,
    ];
  }
};