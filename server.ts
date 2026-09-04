import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API: Purify Burdens and Generate Empathetic Reframing & Hope
app.post("/api/purify", async (req, res) => {
  try {
    const { burdenText, emotionTags = [], ritualType = "stardust" } = req.body;

    if (!burdenText || typeof burdenText !== "string") {
      return res.status(400).json({ error: "手放したい内容を入力してください。" });
    }

    const systemInstruction = `あなたは、眠りにつく前の傷ついた心や疲れた心を深く癒やす、温かく慈愛に満ちた「夜の安眠・浄化ガイド」です。
ユーザーは今日一日で起きた嫌な出来事、他人からの嫌な言動・冷たい態度・理不尽な対応、自分の失敗や後悔、プレッシャーに苦しみ、眠れなくなっています。

あなたの目的は以下の通りです：
1. 【共感と受容 (empatheticValidation)】: まず「今日一日、本当にお疲れさまでした」「辛かったですね」と、ユーザーの痛みを100%否定せず、深く温かく受け止め、頑張りを労う。
2. 【課題の分離と心の解放 (boundaryReframing)】: アドラー心理学や認知療法の優しい視点を使い、「他人の不機嫌や心無い言動は、その人自身の未熟さや心の問題であり、あなたの価値とは一切無関係であること」「今日の出来事はもう過去であり、あなたの夜の時間をこれ以上奪う権利はないこと」を穏やかに優しく諭す。
3. 【心の安らぎのお守り言葉 (cleansingAffirmation)】: 息を吐きながら心の中で唱えられる、短く心にしみるフレーズ（例：「私は私のままで価値がある。今夜はすべてを手放して眠る」など）。
4. 【明日の希望の種 (hopeSeedForTomorrow)】: 明日の朝が少し楽しみになるような、プレッシャーのない小さな希望や楽しみ（例：「明日の朝、好きな温かい飲み物をゆっくり味わおう」「新しい太陽とともに、まっさらな一日が始まる」など）。
5. 【入眠のささやき (bedtimeWhisper)】: ベッドに入って目を閉じた時にじんわりと安心できる、短く心地よいおやすみの言葉。

※決して説教や反省を促すようなことは言わず、無条件の安心感と包容力を与えてください。すべて日本語の優しく丁寧で温かな口調（です・ます調）で記述してください。`;

    const prompt = `【手放したい出来事・言動・心の重荷】
${burdenText}

【感情タグ】
${emotionTags.length > 0 ? emotionTags.join(", ") : "指定なし"}

【選ばれた浄化の儀式】
${ritualType}

上記の内容を受け止め、安らかな眠りと明日の希望のためのメッセージをJSON形式で生成してください。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            empatheticValidation: {
              type: Type.STRING,
              description: "ユーザーの苦しみや努力への温かい共感と労いの言葉 (2〜3文)",
            },
            boundaryReframing: {
              type: Type.STRING,
              description: "他人の言動と自分の価値の切り離し、安心感をもたらす優しい気付き (2〜3文)",
            },
            cleansingAffirmation: {
              type: Type.STRING,
              description: "心の中で唱える短く優しいお守りフレーズ (1〜2文)",
            },
            hopeSeedForTomorrow: {
              type: Type.STRING,
              description: "明日のための小さく温かな希望の種 (1〜2文)",
            },
            bedtimeWhisper: {
              type: Type.STRING,
              description: "今夜安心して眠りにつくための安らかなささやき (1〜2文)",
            },
            summaryTitle: {
              type: Type.STRING,
              description: "手放した重荷の短い象徴名（例：『心無い言葉の影』『焦りと失敗の記憶』など最大15文字）",
            },
          },
          required: [
            "empatheticValidation",
            "boundaryReframing",
            "cleansingAffirmation",
            "hopeSeedForTomorrow",
            "bedtimeWhisper",
            "summaryTitle",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Purify Error:", error);
    // Graceful fallback in case of network issues or missing key
    return res.json({
      success: true,
      data: {
        empatheticValidation:
          "今日一日、本当によく耐えて頑張りましたね。その胸の痛みや悔しさは、あなたが誠実に生きている証拠です。",
        boundaryReframing:
          "他人の不機嫌や棘のある言葉は、相手自身の未熟さの表れであり、あなたの尊い価値とは何の関係もありません。その重荷は夜の風に預けて大丈夫です。",
        cleansingAffirmation: "「私は私の尊さを知っている。今日の重荷はすべて夜空へ還す。」",
        hopeSeedForTomorrow: "明日は新しい光とともに始まります。まずは朝の美味しい温かい一杯を自分のために楽しみましょう。",
        bedtimeWhisper: "もう何も考えなくて大丈夫。ふかふかの布団に体をあずけて、安らかにおやすみなさい。",
        summaryTitle: "手放された重荷",
      },
    });
  }
});

// API: Generate gentle hope seeds for tomorrow
app.post("/api/generate-hope", async (req, res) => {
  try {
    const { mood = "peaceful" } = req.body;
    const prompt = `眠る前の人が明日に小さな希望と楽しみを持って眠れるよう、プレッシャーにならない小さな『明日の楽しみ・希望（マイクロホープ）』を3つ提案してください。
例：「朝の陽の光を浴びて深呼吸する」「お気に入りの温かい飲み物をゆっくり飲む」「帰り道に好きな曲を聴く」など、日常のささやかな幸せにフォーカスしてください。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "あなたは就寝前の安らぎと希望を届けるガイドです。優しく温かな日本語で出力してください。",
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "希望のタイトル (短く)" },
              detail: { type: Type.STRING, description: "心温まる一言説明" },
              category: { type: Type.STRING, description: "癒やし / 味覚 / 景色 / 自分時間 など" },
            },
            required: ["title", "detail", "category"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    return res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Hope Generation Error:", error);
    return res.json({
      success: true,
      data: [
        {
          title: "朝一番の深呼吸と光",
          detail: "カーテンを開けて、澄んだ朝の空気を胸いっぱいに吸い込むひととき。",
          category: "景色",
        },
        {
          title: "温かいお気に入りの一杯",
          detail: "湯気の立つ紅茶やコーヒーの香りに包まれる自分だけの静かな時間。",
          category: "味覚",
        },
        {
          title: "自分のペースを一番に守る一日",
          detail: "周りに振り回されず、心地よいリズムで歩く穏やかな明日。",
          category: "自分時間",
        },
      ],
    });
  }
});

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

async function startServer() {
  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Night Release Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
