async function checkModels() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY}`);
  const data = await res.json();
  console.log("Available models:", data.models?.map((m: any) => m.name));
}
checkModels();
