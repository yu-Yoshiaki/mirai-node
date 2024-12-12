import { useEffect } from 'react';
import { generateMandalaContent } from '../utils/mandalaOpenai';

export const MandalaTest = () => {
  useEffect(() => {
    const testMandalaGeneration = async () => {
      console.log('マンダラチャート生成テストを開始します...');

      const testTopics: string[] = [
        'プログラミング学習',
        'ビジネス成長',
        '健康管理'
      ];

      for (const topic of testTopics) {
        console.log(`\n中心テーマ: ${topic}`);
        try {
          const elements = await generateMandalaContent(topic);
          console.log('生成された要素:');
          elements.forEach((element: string, index: number) => {
            console.log(`${index + 1}. ${element}`);
          });
        } catch (error) {
          console.error(`エラー (${topic}):`, error);
        }
      }
    };

    testMandalaGeneration();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">マンダラチャートテスト</h1>
      <p>コンソールを確認してください。</p>
    </div>
  );
};
