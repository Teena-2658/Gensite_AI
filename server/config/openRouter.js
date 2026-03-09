const openRouterUrl="https://openrouter.ai/api/v1/chat/completions"
const model="deepseek/deepseek-chat"
export const generateResponse=async(prompt)=>{
  const res=await fetch(openRouterUrl, {
  method: 'POST',
  headers: {
    Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: model,
    messages: [
      {
        role: 'system',
        content:"you must return only validRAW JSON"
      },
      {
        role: 'user',
        content: prompt,
      }
    ],
    temparature: 0.2
  }),
});
if(!res.ok)
{
    const err=await res.text()
    throw new Error("OpenRouter API error: " + err)
}
const data=await res.json()
return data.choices[0].message.content

}