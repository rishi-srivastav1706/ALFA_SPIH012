import dotenv from 'dotenv';
dotenv.config();

const QUESTIONS_BANK = {
  "Mathematics": {
    "1-3": [
      { text: "What is 5 + 3?", hint: "Count forward from 5." },
      { text: "If you have 10 apples and give 4 to your friend, how many apples do you have left?", hint: "Subtract 4 from 10." },
      { text: "What fraction of the circle is shaded if it is cut into 4 equal parts and 3 are colored?", hint: "Fractions are represented as shaded parts over total parts." },
      { text: "Solve: 24 - 15 = ?", hint: "Try borrowing from the tens place." },
      { text: "Raju has 3 packs of crayons. Each pack has 5 crayons. How many crayons does Raju have in total?", hint: "Use multiplication: 3 groups of 5." }
    ],
    "4-7": [
      { text: "Solve: 3/5 + 1/5 = ?", hint: "Since denominators are the same, just add the numerators." },
      { text: "Find the area of a rectangle with length 8 cm and width 5 cm.", hint: "Area of a rectangle = length × width." },
      { text: "If 3x = 15, what is the value of x?", hint: "Divide both sides by 3." },
      { text: "Convert 0.75 into a fraction in its simplest form.", hint: "0.75 is 75/100. Simplify it." },
      { text: "A train travels 120 km in 2 hours. What is its average speed in km/h?", hint: "Speed = Distance / Time." }
    ],
    "8-10": [
      { text: "Solve the quadratic equation: x^2 - 5x + 6 = 0.", hint: "Factor the equation into (x - 2)(x - 3) = 0." },
      { text: "If the hypotenuse of a right-angled triangle is 13 cm and one side is 5 cm, find the other side.", hint: "Use the Pythagorean theorem: a^2 + b^2 = c^2." },
      { text: "Find the sum of the first 20 terms of the Arithmetic Progression: 2, 5, 8, 11...", hint: "Use the formula: S_n = n/2 * (2a + (n-1)d)." },
      { text: "Evaluate: log_2(32) + log_3(9) = ?", hint: "log_2(32) is 5, and log_3(9) is 2." },
      { text: "What is the probability of drawing a red king from a standard deck of 52 cards?", hint: "There are 2 red kings in a deck of 52 cards." }
    ]
  },
  "Science": {
    "1-3": [
      { text: "Which part of the plant grows under the ground and absorbs water?", hint: "It holds the plant firmly in the soil." },
      { text: "Name one living thing and one non-living thing you see in a park.", hint: "Living things can breathe and grow; non-living things cannot." },
      { text: "Is the sun a star, a planet, or a moon?", hint: "It is the center of our solar system and shines with its own light." },
      { text: "What are the three states of water?", hint: "Think of ice, tap water, and steam." },
      { text: "How do plants make their own food? What is this process called?", hint: "It starts with P and needs sunlight." }
    ],
    "4-7": [
      { text: "What is the function of the skeletal system in the human body?", hint: "Think about shape, support, and protection." },
      { text: "Explain the difference between a physical change and a chemical change.", hint: "In physical changes, no new substance is made; in chemical changes, a new substance is formed." },
      { text: "Why do we see dew drops on leaves on cold winter mornings? Which process of water cycle causes this?", hint: "Water vapor cools down and turns back to liquid." },
      { text: "Explain the difference between herbivores, carnivores, and omnivores.", hint: "Think about what plants, animals, or both eat." },
      { text: "What is force? List two effects that force can have on an object.", hint: "Think of pushing or pulling, and how it changes speed or shape." }
    ],
    "8-10": [
      { text: "What is force? List two effects that force can have on an object.", hint: "Think of pushing or pulling, and how it changes speed or shape." },
      { text: "What is the function of the skeletal system in the human body?", hint: "Think about shape, support, and protection." },
      { text: "Explain the difference between a physical change and a chemical change.", hint: "In physical changes, no new substance is made; in chemical changes, a new substance is formed." },
      { text: "Why do we see dew drops on leaves on cold winter mornings? Which process of water cycle causes this?", hint: "Water vapor cools down and turns back to liquid." },
      { text: "Explain the difference between herbivores, carnivores, and omnivores.", hint: "Think about what plants, animals, or both eat." }
    ]
  },
  "Environmental Science": {
    "4-7": [
      { text: "What are the 3 R's of waste management?", hint: "Reduce, Reuse, Recycle." },
      { text: "Why is acid rain harmful to historical monuments made of marble?", hint: "Acid reacts with calcium carbonate (marble) and erodes it." },
      { text: "What is deforestation, and how does it affect the soil?", hint: "Cutting down trees leads to soil erosion because roots hold the soil." },
      { text: "Name two renewable sources of energy and explain why they are better than fossil fuels.", hint: "Think of solar energy, wind energy." },
      { text: "What is global warming, and which gas is primarily responsible for it?", hint: "It is the rise in Earth's temperature caused by greenhouse gases like CO2." }
    ],
    "1-3": [
      { text: "What are the 3 R's of waste management?", hint: "Reduce, Reuse, Recycle." },
      { text: "Why is acid rain harmful to historical monuments made of marble?", hint: "Acid reacts with calcium carbonate (marble) and erodes it." },
      { text: "What is deforestation, and how does it affect the soil?", hint: "Cutting down trees leads to soil erosion because roots hold the soil." },
      { text: "Name two renewable sources of energy and explain why they are better than fossil fuels.", hint: "Think of solar energy, wind energy." },
      { text: "What is global warming, and which gas is primarily responsible for it?", hint: "It is the rise in Earth's temperature caused by greenhouse gases like CO2." }
    ],
    "8-10": [
      { text: "What are the 3 R's of waste management?", hint: "Reduce, Reuse, Recycle." },
      { text: "Why is acid rain harmful to historical monuments made of marble?", hint: "Acid reacts with calcium carbonate (marble) and erodes it." },
      { text: "What is deforestation, and how does it affect the soil?", hint: "Cutting down trees leads to soil erosion because roots hold the soil." },
      { text: "Name two renewable sources of energy and explain why they are better than fossil fuels.", hint: "Think of solar energy, wind energy." },
      { text: "What is global warming, and which gas is primarily responsible for it?", hint: "It is the rise in Earth's temperature caused by greenhouse gases like CO2." }
    ]
  },
  "Physical Science": {
    "8-10": [
      { text: "State Newton's Second Law of Motion and write its mathematical formula.", hint: "Force is directly proportional to acceleration." },
      { text: "What is the difference between an ionic bond and a covalent bond?", hint: "Ionic bonds involve transferring electrons; covalent bonds involve sharing them." },
      { text: "Explain Ohm's Law and write its formula relating Voltage, Current, and Resistance.", hint: "V = I * R." },
      { text: "What is a neutralization reaction? Give one example.", hint: "Acid + Base -> Salt + Water." },
      { text: "Why does a pencil look bent when dipped in a glass of water?", hint: "This is due to Refraction of light." }
    ],
    "1-3": [
      { text: "State Newton's Second Law of Motion and write its formula.", hint: "Force = mass x acceleration." },
      { text: "What is the difference between an ionic bond and a covalent bond?", hint: "Ionic bonds transfer electrons; covalent share them." },
      { text: "Explain Ohm's Law and write its formula relating Voltage, Current, and Resistance.", hint: "V = I * R." },
      { text: "What is a neutralization reaction? Give one example.", hint: "Acid + Base -> Salt + Water." },
      { text: "Why does a pencil look bent when dipped in a glass of water?", hint: "This is due to Refraction of light." }
    ],
    "4-7": [
      { text: "State Newton's Second Law of Motion and write its mathematical formula.", hint: "Force is directly proportional to acceleration." },
      { text: "What is the difference between an ionic bond and a covalent bond?", hint: "Ionic bonds involve transferring electrons; covalent bonds involve sharing them." },
      { text: "Explain Ohm's Law and write its formula relating Voltage, Current, and Resistance.", hint: "V = I * R." },
      { text: "What is a neutralization reaction? Give one example.", hint: "Acid + Base -> Salt + Water." },
      { text: "Why does a pencil look bent when dipped in a glass of water?", hint: "This is due to Refraction of light." }
    ]
  },
  "Biology": {
    "8-10": [
      { text: "What is the powerhouse of the cell, and why is it called so?", hint: "It produces energy in the form of ATP." },
      { text: "Describe the difference between mitosis and meiosis division.", hint: "Mitosis is for growth/repair (produces 2 cells); meiosis is for reproduction (produces 4 cells)." },
      { text: "Explain the role of xylem and phloem in plants.", hint: "One carries water; the other carries food/nutrients." },
      { text: "What is photosynthesis? Write the chemical equation for it.", hint: "Carbon Dioxide + Water + Sunlight -> Glucose + Oxygen." },
      { text: "Explain Mendel's Law of Dominance with a simple monohybrid cross.", hint: "Think of tall (T) and dwarf (t) pea plants." }
    ],
    "1-3": [
      { text: "What is the powerhouse of the cell?", hint: "It produces energy for the cell." },
      { text: "Describe the difference between mitosis and meiosis division.", hint: "Mitosis produces 2 cells; meiosis produces 4." },
      { text: "Explain the role of xylem and phloem in plants.", hint: "One carries water; the other carries food." },
      { text: "What is photosynthesis?", hint: "Plants making food with sunlight." },
      { text: "Explain Mendel's Law of Dominance with a simple cross.", hint: "Dominant traits mask recessive ones." }
    ],
    "4-7": [
      { text: "What is the powerhouse of the cell, and why is it called so?", hint: "It produces energy in the form of ATP." },
      { text: "Describe the difference between mitosis and meiosis division.", hint: "Mitosis is for growth/repair; meiosis is for reproduction." },
      { text: "Explain the role of xylem and phloem in plants.", hint: "One carries water; the other carries food." },
      { text: "What is photosynthesis?", hint: "Plants making food with sunlight." },
      { text: "Explain Mendel's Law of Dominance with a simple cross.", hint: "Dominant traits hide recessive ones." }
    ]
  },
  "Social Studies": {
    "1-3": [
      { text: "Who is known as the Father of our Nation in India?", hint: "His birthday is celebrated on October 2nd." },
      { text: "Name the four main cardinal directions.", hint: "North, South, East, West." },
      { text: "Why do we need rules in our school and classroom?", hint: "Rules help keep us safe and organized." },
      { text: "What is the name of our country, and what is its capital?", hint: "New Delhi is the capital." },
      { text: "What is the difference between public transport and private transport?", hint: "Buses/Trains are public; personal cars are private." }
    ],
    "4-7": [
      { text: "What was the significance of the Indus Valley Civilization?", hint: "Think about planned cities, drainage systems, and Harappa." },
      { text: "Explain the difference between weather and climate.", hint: "Weather is day-to-day; climate is the average pattern over a long period." },
      { text: "Who wrote the Constitution of India?", hint: "He is fondly called Babasaheb." },
      { text: "Describe the water cycle and its key stages.", hint: "Evaporation, Condensation, Precipitation." },
      { text: "What are the three organs of the Indian Government?", hint: "Legislature, Executive, and Judiciary." }
    ],
    "8-10": [
      { text: "What were the primary causes of the French Revolution of 1789?", hint: "Think of social inequality (the three estates), financial crisis, and absolute monarchy." },
      { text: "Explain the concept of Sustainable Development.", hint: "Meeting present needs without compromising future generations' needs." },
      { text: "What is federalism? Mention two key features of federalism in India.", hint: "Two or more levels of government." },
      { text: "Explain the role of the Reserve Bank of India (RBI) in regulating the monetary policy.", hint: "RBI issues currency notes and controls credit supply." },
      { text: "What was the Dandi March, and why did Mahatma Gandhi choose salt as a symbol of protest?", hint: "Salt was tax-free for all, a basic necessity, making it a universal symbol." }
    ]
  },
  "Hindi": {
    "1-3": [
      { text: "वर्णमाला के पांच स्वर लिखिए।", hint: "जैसे अ, आ..." },
      { text: "निम्नलिखित संज्ञा शब्दों में से किसी एक का वाक्य बनाइए: 'पुस्तक' या 'मित्र'।", hint: "मेरी पुस्तक सुंदर है।" },
      { text: "संज्ञा किसे कहते हैं? एक उदाहरण दीजिए।", hint: "किसी व्यक्ति, वस्तु या स्थान के नाम को संज्ञा कहते हैं।" },
      { text: "क्रिया शब्द किसे कहते हैं? दो उदाहरण दीजिए।", hint: "काम बताने वाले शब्द, जैसे खेलना, पढ़ना।" },
      { text: "विपरीतार्थक (उल्टा) शब्द लिखिए: 'दिन' और 'बड़ा'।", hint: "दिन का उल्टा रात होता है।" }
    ],
    "4-7": [
      { text: "सर्वनाम की परिभाषा लिखकर दो उदाहरण दीजिए।", hint: "संज्ञा के स्थान पर प्रयोग होने वाले शब्द." },
      { text: "विशेषण किसे कहते हैं? वाक्य में विशेषण पहचानिए: 'यह काला घोड़ा है।'", hint: "संज्ञा की विशेषता बताने वाले शब्द।" },
      { text: "निम्नलिखित शब्दों के दो-दो पर्यायवाची शब्द लिखिए: 'सूर्य' और 'पानी'।", hint: "सूर्य - रवि, दिनकर; पानी - जल, नीर।" },
      { text: "मुहावरे का अर्थ लिखकर वाक्य में प्रयोग कीजिए: 'अंगूठा दिखाना'।", hint: "वक्त पर मना कर देना।" },
      { text: "संधि किसे कहते हैं? 'देवालय' का संधि विच्छेद कीजिए।", hint: "दो वर्णों के मेल को संधि कहते हैं। देव + आलय।" }
    ],
    "8-10": [
      { text: "समास की परिभाषा लिखिए तथा 'यथाशक्ति' में कौन सा समास है, बताइए।", hint: "अव्ययीभाव समास।" },
      { text: "अलंकार किसे कहते हैं? 'कनक कनक ते सौ गुनी' में कौन सा अलंकार है?", hint: "काव्य की शोभा बढ़ाने वाले तत्व। इसमें यमक अलंकार है।" },
      { text: "कबीरदास जी के दोहों की मुख्य विशेषताएँ क्या थीं?", hint: "समाज सुधार, आडंबरों का विरोध, सरल भाषा।" },
      { text: "रस की परिभाषा देते हुए 'वीर रस' का स्थायी भाव लिखिए।", hint: "वीर रस का स्थायी भाव 'उत्साह' होता है।" },
      { text: "सूरदास जी की रचनाओं में किस रस की प्रधानता है? किन्हीं दो रचनाओं के नाम लिखिए।", hint: "वात्सल्य रस की प्रधानता। सूरसागर, सूरसारावली।" }
    ]
  },
  "Telugu": {
    "1-3": [
      { text: "తెలుగు వర్ణమాలలోని మొదటి ఐదు అచ్చులు రాయండి.", hint: "అ, ఆ..." },
      { text: "'పుస్తకం' అనే పదంతో ఒక సొంత వాక్యం రాయండి.", hint: "నా దగ్గర ఒక మంచి పుస్తకం ఉంది." },
      { text: "నామవాచకం అనగానేమి? ఒక ఉదాహరణ ఇవ్వండి.", hint: "పేర్లను తెలిపే పదాలను నామవాచకం అంటారు." },
      { text: "కరియ అంటే ఏమిటి? రెండు ఉదాహరణలు రాయండి.", hint: "పనులను తెలిపే పదాలు, ఉదాహరణకు: ఆడడం, చదవడం." },
      { text: "వ్యతిరేక పదాలు రాయండి: 'పగలు' మరియు 'పెద్ద'.", hint: "పగలు వ్యతిరేక పదం రాత్రి." }
    ],
    "4-7": [
      { text: "సర్వనామం అనగానేమి? రెండు ఉదాహరణలు ఇవ్వండి.", hint: "నామవాచకానికి బదులుగా ఉపయోగించే పదాలు." },
      { text: "విశేషణం అంటే ఏమిటి? ఈ వాక్యంలో విశేషణం గుర్తించండి: 'అది తెల్లని ఆవు.'", hint: "గుణాలను తెలిపే పదాలు." },
      { text: "ఈ క్రింది పదాలకు రెండు పర్యాయపదాలు రాయండి: 'సూర్యుడు' మరియు 'నీరు'.", hint: "సూర్యుడు - భానుడు, రవి; నీరు - జలం, గంగ." },
      { text: "జాతీయాన్ని సొంత వాక్యంలో ప్రయోగించండి: 'కంటికి రెప్పలా'.", hint: "జాగ్రत्ताగా కాపాడుకోవడం." },
      { text: "సంధి అంటే ఏమిటి? 'రామాలయం' పదాన్ని విడదీయండి.", hint: "పూర్వ పర స్వరాలకు పరస్వరం ఏకాదేశమగుట. రామ + ఆలయం." }
    ],
    "8-10": [
      { text: "ద్వంద్వ సమాసం అనగానేమి? ఒక ఉదాహరణ రాయండి.", hint: "ఉభయ పదార్థ ప్రధాన సమాసం. ఉదాహరణకు: తల్లిదండ్రులు." },
      { text: "అలంకారం అంటే ఏమిటి? 'లతా లతా' అనే పదంలో ఏ అలంకారం ఉంది?", hint: "కావ్యానికి అందాన్ని ఇచ్చేవి." },
      { text: "వేమన శతక పద్యాల యొక్క ముఖ్య లక్షణం ఏమిటి?", hint: "సామాజిక స్పృహ, ఆటవెలది ఛందస్సు." },
      { text: "కరుణ రసం యొక్క ప్రాధాన్యతను వివరించండి.", hint: "దుఃఖం, కరుణను కలిగించే రసం." },
      { text: "పోతన భాగవతం యొక్క శైలిని మరియు భక్తి భావాన్ని తెలపండి.", hint: "సరళమైన, మధురమైన భక్తి శైలి." }
    ]
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { grade, subject, difficulty, language } = req.body;
  const token = req.headers['x-hf-token'] || process.env.HF_TOKEN;

  if (!token) {
    const userGrade = Number(grade) || 3;
    let gradeTier = "1-3";
    if (userGrade >= 4 && userGrade <= 7) {
      gradeTier = "4-7";
    } else if (userGrade >= 8 && userGrade <= 10) {
      gradeTier = "8-10";
    }

    const subName = subject || "Mathematics";
    const diff = Math.min(5, Math.max(1, Number(difficulty) || 3));

    // Get subject questions, fallback to Mathematics if not found
    const subjectQuestions = QUESTIONS_BANK[subName] || QUESTIONS_BANK["Mathematics"];
    // Get tier questions, fallback to 1-3 if not found
    const tierQuestions = subjectQuestions[gradeTier] || subjectQuestions["1-3"];
    
    // Select question corresponding to difficulty index (0 to 4)
    const questionIndex = Math.min(tierQuestions.length - 1, diff - 1);
    const selectedQuestion = tierQuestions[questionIndex] || tierQuestions[0];

    return res.status(200).json({
      question_text: selectedQuestion.text,
      hint: selectedQuestion.hint
    });
  }

  try {
    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are EDUTOR, an encouraging, child-friendly tutor. Your job is to generate a single practice question for a student in Grade ${grade} for the subject "${subject}".
The difficulty level is ${difficulty} out of 5 (1 is simple recall/vocabulary, 5 is analytical reasoning/problem solving).
The question and hint must be written in the requested language: ${language}.
For language subjects like Hindi or Telugu, ensure both question and hint are written exclusively in that language.
Ensure the response matches this JSON format:
{
  "question_text": "<the practice question text>",
  "hint": "<a child-friendly tip or clue in ${language}>"
}
Do not return any text before or after the JSON block.
<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;

    const apiResponse = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 300, return_full_text: false, temperature: 0.7 }
      })
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      throw new Error(`Hugging Face API returned error status ${apiResponse.status}: ${errText}`);
    }

    const data = await apiResponse.json();
    let text = data[0]?.generated_text || "";

    let jsonResult;
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonResult = JSON.parse(text.substring(jsonStart, jsonEnd));
      } else {
        throw new Error("Could not parse JSON block from output");
      }
    } catch (e) {
      jsonResult = {
        question_text: `Explain one interesting concept you learned in ${subject}.`,
        hint: `Think about a topic you read recently!`
      };
    }

    return res.status(200).json(jsonResult);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
