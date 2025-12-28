'use client';

import {useEffect, useState} from 'react';
import {GoogleGenAI} from "@google/genai";

type Situation = '지각했다' | '답장을 못 했다' | '약속을 취소해야 한다' | '약속에 못 갔다' | '일을 늦게 냈다' | '일을 실수했다' | '회식/모임에 못 간다' | '연락을 못 했다' | '일정이 갑자기 바뀌었다' | '개인 사정이 생겼다';
type Target = '상사' | '동료' | '친구' | '애인' | '가족' | '처음 보는 사람';
type Tone = '진지하게' | '최대한 공손하게' | '솔직하게' | '웃기게' | '뻔뻔하게' | '감정 담아서' | '변명 같지 않게';

const MainPage: React.FC = () => {
  const [situation, setSituation] = useState<Situation | ''>('');
  const [target, setTarget] = useState<Target | ''>('');
  const [tone, setTone] = useState<Tone | ''>('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);

  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY});

  // STEP 1이 변경되면 하위 단계 모두 리셋
  useEffect(() => {
    setTarget('');
    setTone('');
    setAdditionalInfo('');
    setResult('');
  }, [situation]);

  // STEP 2가 변경되면 하위 단계 리셋
  useEffect(() => {
    setTone('');
    setAdditionalInfo('');
    setResult('');
  }, [target]);

  // STEP 3이 변경되면 하위 단계 리셋
  useEffect(() => {
    setAdditionalInfo('');
    setResult('');
  }, [tone]);

  const situations: Situation[] = [
    '지각했다',
    '답장을 못 했다',
    '약속을 취소해야 한다',
    '약속에 못 갔다',
    '일을 늦게 냈다',
    '일을 실수했다',
    '회식/모임에 못 간다',
    '연락을 못 했다',
    '일정이 갑자기 바뀌었다',
    '개인 사정이 생겼다'
  ];

  const targets: Target[] = [
    '상사',
    '동료',
    '친구',
    '애인',
    '가족',
    '처음 보는 사람'
  ];

  const tones: Tone[] = [
    '진지하게',
    '최대한 공손하게',
    '솔직하게',
    '웃기게',
    '뻔뻔하게',
    '감정 담아서',
    '변명 같지 않게'
  ];

  const getPrompt = () => {
    return `
      너는 사람들이 실제로 써먹을 수 있는 "현실적인 변명하는 메시지"를 작성하는 도우미다.
      
      아래 조건을 만족하는 한국어 문장 1개를 생성하라.
      
      [상황]
      - ${situation}
      
      [상대방]
      - ${target}
      
      [톤]
      - ${tone}
      
      [추가 상황 설명]
      - ${additionalInfo ?? '없음'}
      
      출력 조건:
      - 한국어로만 작성
      - 길이는 2~3문장
      - 바로 복사해서 메시지로 보낼 수 있게 작성
      
      문장만 출력하고, 설명이나 부연은 하지 말 것.
    `;
  }


  const handleGenerate = async () => {
    const prompt = getPrompt();
    setIsLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      setResult(response.text ?? '');
      console.log(response.text);
    } catch (error: any) {
      if (error?.status === 429) { // 한도 초과 에러
        setIsLimitExceeded(true);
        setIsLoading(false);
        return;
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResult = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const canGenerate = situation && target && tone;

  return (
    <main className="min-h-screen bg-gray-600 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12 relative">
          {/* 스프링노트 배경 */}
          <div className="relative inline-block">
            {/* 노트 본체 */}
            <div className="relative bg-white rounded-lg shadow-2xl px-16 py-8">
              {/* 스프링 링 여러개 */}
              <div className="absolute -top-6 left-12 w-3 h-8 bg-gray-400 rounded-full"></div>
              <div className="absolute -top-6 left-24 w-3 h-8 bg-gray-400 rounded-full"></div>
              <div className="absolute -top-6 left-36 w-3 h-8 bg-gray-400 rounded-full"></div>
              <div className="absolute -top-6 right-36 w-3 h-8 bg-gray-400 rounded-full"></div>
              <div className="absolute -top-6 right-24 w-3 h-8 bg-gray-400 rounded-full"></div>
              <div className="absolute -top-6 right-12 w-3 h-8 bg-gray-400 rounded-full"></div>

              {/* 노트 줄 */}
              <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none px-8">
                <div className="h-full flex flex-col justify-around py-4">
                  <div className="w-full h-px bg-gray-200"></div>
                  <div className="w-full h-px bg-gray-200"></div>
                  <div className="w-full h-px bg-gray-200"></div>
                  <div className="w-full h-px bg-gray-200"></div>
                  <div className="w-full h-px bg-gray-200"></div>
                </div>
              </div>

              {/* 제목 텍스트 */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2 relative z-10 excuse-title">
                변명이 필요하세요?
              </h1>
              <p className="text-gray-600 text-sm relative z-10">
                상황에 맞는 완벽한 변명을 AI가 만들어 드립니다.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* STEP 1: 상황 선택 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-white font-semibold text-sm">
              1
            </span>
              <h2 className="text-xl font-semibold text-gray-900">
                어떤 상황인가요?
              </h2>
            </div>
            <select
              value={situation}
              onChange={(e) => setSituation(e.target.value as Situation)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
            >
              <option value="">상황을 선택해주세요</option>
              {situations.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* STEP 2: 대화 상대 선택 */}
          {situation && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-white font-semibold text-sm">
                2
              </span>
                <h2 className="text-xl font-semibold text-gray-900">
                  누구에게 말하나요?
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {targets.map((t) => (
                  <label
                    key={t}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      target === t
                        ? 'border-gray-800 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="target"
                      value={t}
                      checked={target === t}
                      onChange={(e) => setTarget(e.target.value as Target)}
                      className="w-4 h-4 text-gray-800"
                    />
                    <span className="font-medium text-gray-900">{t}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: 대화 톤 선택 */}
          {target && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 text-white font-semibold text-sm">
                3
              </span>
                <h2 className="text-xl font-semibold text-gray-900">
                  어떤 톤으로 말할까요?
                </h2>
              </div>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors"
              >
                <option value="">톤을 선택해주세요</option>
                {tones.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* STEP 4: 추가 정보 */}
          {tone && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-400 text-white font-semibold text-sm">
                4
              </span>
                <h2 className="text-xl font-semibold text-gray-900">
                  추가 정보 <span className="text-sm text-gray-500">(선택사항)</span>
                </h2>
              </div>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="변명에 포함하고 싶은 추가 정보가 있다면 입력해주세요"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-gray-500 focus:outline-none transition-colors resize-none"
                rows={4}
              />
            </div>
          )}

          {/* 생성 버튼 */}
          {canGenerate && (
            <div className="animate-fadeIn">
              <button
                onClick={handleGenerate}
                className="w-full py-4 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                변명 생성하기 ✨
              </button>
            </div>
          )}

          {/* 로딩 또는 결과 표시 */}
          {isLoading && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">⏳</span>
                <h2 className="text-xl font-semibold text-gray-900">
                  변명 생성 중...
                </h2>
              </div>
              <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-lg">
                {/* 스켈레톤 UI */}
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">💬</span>
                  <h2 className="text-xl font-semibold text-gray-900">
                    생성된 변명
                  </h2>
                </div>
                <button
                  onClick={handleCopyResult}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {copied ? '✓ 복사됨!' : '📋 복사하기'}
                </button>
              </div>
              <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {result}
                </p>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-0 right-0 z-20 text-center">
            <p className="text-white/60 text-sm font-medium">
              Created by Nahyeon Choi.
            </p>
          </div>

          {/* 영업 종료 오버레이 */}
          {isLimitExceeded && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-70 rounded-2xl flex items-center justify-center backdrop-blur-sm animate-fadeIn z-50">
              <div className="text-center px-8">
                <div className="text-6xl mb-4">🚫</div>
                <h3 className="text-3xl font-bold text-white mb-3">영업 종료</h3>
                <p className="text-gray-200 text-lg mb-2">AI 크레딧 한도를 초과했습니다</p>
                <p className="text-gray-300 text-sm">내일 다시 찾아주세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default MainPage;