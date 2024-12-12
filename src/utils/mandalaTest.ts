import { generateMandalaContent } from "./mandalaOpenai";

async function testMandalaGeneration(): Promise<void> {
  console.log("マンダラチャート生成テストを開始します...");

  const testTopics: string[] = [
    "プログラミング学習",
    "ビジネス成長",
    "健康管理",
  ];

  for (const topic of testTopics) {
    console.log(`\n中心テーマ: ${topic}`);
    try {
      const elements = await generateMandalaContent(topic);
      console.log("生成された要素:");
      elements.forEach((element: string, index: number) => {
        console.log(`${index + 1}. ${element}`);
      });
    } catch (error) {
      console.error(`エラー (${topic}):`, error);
    }
  }
}

testMandalaGeneration();
