import { buildGptPrompt } from '../promptTemplate';

export default async function generateQuoteNamesFromGPT({
  projectType, shopBudget, shopCount, mustItems, productNames, lowerBound, upperBound, mustProductCandidates
}) {
  const prompt = buildGptPrompt({
    projectType, shopBudget, shopCount, mustItems,
    productNames, lowerBound, upperBound, mustProductCandidates
  });

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    console.log("GPT API 원본 응답:", JSON.stringify(data, null, 2));

    if (data.choices && data.choices[0]) {
      return JSON.parse(data.choices[0].message.content);
    } else {
      console.error("GPT에서 content를 받지 못했습니다:", data);
      return null;
    }
  } catch (err) {
    console.error("GPT API 호출 오류:", err);
    return null;
  }
}

