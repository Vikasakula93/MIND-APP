import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google GenAI
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API: CBT Thought Analysis & Cognitive Reframing
app.post('/api/cbt/analyze', async (req, res) => {
  try {
    const { thought, emotion, intensity, selectedDistortions } = req.body;

    if (!thought || typeof thought !== 'string') {
      res.status(400).json({ error: 'Thought input string is required' });
      return;
    }

    const ai = getAIClient();

    if (!ai) {
      // Fallback deterministic reframe if API key is not configured yet
      res.json({
        distortionsIdentified: selectedDistortions?.length 
          ? selectedDistortions 
          : ['Catastrophizing', 'All-or-Nothing Thinking'],
        explanation: `Your thought "${thought}" assumes a worst-case scenario without evaluating realistic probabilities.`,
        evidenceFor: 'It feels very real because emotion intensity is high.',
        evidenceAgainst: 'Past experience shows that outcomes are rarely as extreme as initial anxiety suggests.',
        cognitiveReframe: 'While this situation presents a challenge, I have the capability to handle step-by-step progress without expecting perfection.',
        actionStep: 'Take a 5-minute break, write down two controllable action steps, and proceed with the first step.',
        wisdomQuote: {
          quote: 'We suffer more often in imagination than in reality.',
          author: 'Seneca',
          tradition: 'Stoicism',
        },
        clarityScoreGain: 50,
      });
      return;
    }

    const prompt = `You are MindDojo, an expert CBT (Cognitive Behavioral Therapy) cognitive restructuring coach.
Analyze the following user automatic thought and generate a structured CBT analysis.

User Thought: "${thought}"
Primary Emotion: "${emotion || 'Anxiety'}" (${intensity || 75}% intensity)
User Selected Distortions: ${selectedDistortions?.length ? selectedDistortions.join(', ') : 'None specified'}

Provide a JSON output matching this schema:
- distortionsIdentified: array of strings (e.g., ["Catastrophizing", "Perfectionism", "Mind Reading", "All-or-Nothing", "Emotional Reasoning", "Overgeneralization"])
- explanation: brief 1-2 sentence breakdown of why this thought exhibits these cognitive distortions.
- evidenceFor: 1 sentence summarizing what makes this thought feel compelling to the user.
- evidenceAgainst: 2 sentences of logical, objective counter-evidence or alternative perspective.
- cognitiveReframe: a balanced, empowering, alternative thought statement (written in 1st person "I").
- actionStep: 1 immediate, realistic behavioral micro-task (Exposure Task / Behavioral Experiment) to break inertia.
- wisdomQuote: object with fields "quote", "author", "tradition" (e.g. Stoicism, Bhagavad Gita, Taoism, Buddhism) that deeply reinforces this reframe.
- clarityScoreGain: integer between 40 and 60.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            distortionsIdentified: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            explanation: { type: Type.STRING },
            evidenceFor: { type: Type.STRING },
            evidenceAgainst: { type: Type.STRING },
            cognitiveReframe: { type: Type.STRING },
            actionStep: { type: Type.STRING },
            wisdomQuote: {
              type: Type.OBJECT,
              properties: {
                quote: { type: Type.STRING },
                author: { type: Type.STRING },
                tradition: { type: Type.STRING },
              },
              required: ['quote', 'author', 'tradition'],
            },
            clarityScoreGain: { type: Type.INTEGER },
          },
          required: [
            'distortionsIdentified',
            'explanation',
            'evidenceFor',
            'evidenceAgainst',
            'cognitiveReframe',
            'actionStep',
            'wisdomQuote',
            'clarityScoreGain',
          ],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response from AI model');
    }

    const parsedData = JSON.parse(responseText);
    res.json(parsedData);
  } catch (err: any) {
    console.info('Using offline fallback for CBT thought analysis');
    res.json({
      distortionsIdentified: ['Catastrophizing', 'Emotional Reasoning'],
      explanation: 'Notice how feelings of uncertainty can trigger automatic predictions of worst-case outcomes. Feeling anxious does not mean bad news is inevitable.',
      evidenceFor: 'Acknowledge valid concerns without exaggerating their magnitude.',
      evidenceAgainst: 'Recall past moments when anticipated disasters did not happen and you resolved issues effectively.',
      cognitiveReframe: 'I am taking thoughtful steps day by day. Uncertainty is manageable, and I have the tools to handle whatever arises.',
      actionStep: 'Focus on one small action you can control in the next 10 minutes.',
      wisdomQuote: {
        quote: 'We suffer more often in imagination than in reality.',
        author: 'Seneca',
        tradition: 'Stoicism',
      },
      clarityScoreGain: 15,
    });
  }
});

// API: Philosophical Wisdom Search & Generation
app.post('/api/cbt/wisdom-generate', async (req, res) => {
  try {
    const { topic, tradition } = req.body;
    const searchTopic = topic || 'mindfulness and inner strength';

    const ai = getAIClient();

    if (!ai) {
      res.json({
        quote: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
        author: 'Marcus Aurelius',
        source: 'Meditations',
        tradition: tradition || 'Stoicism',
        theme: 'Internal Control & Mental Resilience',
        insight: 'Focusing on internal agency rather than external factors neutralizes anticipatory anxiety.',
        practicalApplication: 'Identify what lies in your circle of control right now, and release concern for the rest.',
      });
      return;
    }

    const prompt = `Generate a timeless philosophical quote and cognitive reflection for the user's search or situation.
Topic / Query: "${searchTopic}"
Preferred Tradition: "${tradition || 'All Traditions'}"

Return a JSON object with:
- quote: string
- author: string
- source: string (e.g., Meditations, The Enchiridion, Bhagavad Gita, Tao Te Ching, Dhammapada, Man's Search for Meaning)
- tradition: string (e.g. Stoicism, Taoism, Indian Philosophy, Buddhism, Existentialism)
- theme: string
- insight: 2 sentences explaining how this wisdom applies to cognitive reframing and daily peace.
- practicalApplication: 1 clear actionable reflection prompt or exercise.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            author: { type: Type.STRING },
            source: { type: Type.STRING },
            tradition: { type: Type.STRING },
            theme: { type: Type.STRING },
            insight: { type: Type.STRING },
            practicalApplication: { type: Type.STRING },
          },
          required: [
            'quote',
            'author',
            'source',
            'tradition',
            'theme',
            'insight',
            'practicalApplication',
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);
  } catch (err: any) {
    console.info('Using offline fallback for wisdom endpoint');
    res.json({
      quote: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
      author: 'Marcus Aurelius',
      source: 'Meditations',
      tradition: req.body?.tradition || 'Stoicism',
      theme: 'Internal Control & Mental Resilience',
      insight: 'Focusing on internal agency rather than external factors neutralizes anticipatory anxiety.',
      practicalApplication: 'Identify what lies in your circle of control right now, and release concern for the rest.',
    });
  }
});

// API: Behavioral Experiment / Exposure Task Suggestion
app.post('/api/cbt/experiment-suggestion', async (req, res) => {
  try {
    const { challengeArea } = req.body;
    const ai = getAIClient();

    if (!ai) {
      res.json({
        title: 'Micro-Outreach Challenge',
        challengeArea: challengeArea || 'Professional Outreach',
        description: 'Overcoming hesitation in professional outreach.',
        task: 'Apply to one company or send one introduction email today.',
        durationHours: 4,
        xpReward: 100,
      });
      return;
    }

    const prompt = `Create a gentle, actionable CBT Exposure Experiment or Behavioral Task for someone working through: "${challengeArea || 'hesitation and social friction'}".
Return JSON with:
- title: string (e.g. "Micro-Outreach Challenge", "Imperfection Experiment")
- challengeArea: string
- description: string
- task: string (1 short actionable step)
- durationHours: number (e.g. 4, 12, 24)
- xpReward: number (50 to 150)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            challengeArea: { type: Type.STRING },
            description: { type: Type.STRING },
            task: { type: Type.STRING },
            durationHours: { type: Type.NUMBER },
            xpReward: { type: Type.NUMBER },
          },
          required: ['title', 'challengeArea', 'description', 'task', 'durationHours', 'xpReward'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.info('Using offline fallback for experiment endpoint');
    res.json({
      title: 'Micro-Outreach Challenge',
      challengeArea: req.body?.challengeArea || 'Professional Outreach',
      description: 'Overcoming hesitation in professional outreach.',
      task: 'Apply to one company or send one introduction email today.',
      durationHours: 4,
      xpReward: 100,
    });
  }
});

// API: AI-Powered Daily Affirmation Generator
app.post('/api/cbt/affirmation', async (req, res) => {
  try {
    const { userName, streakDays, clarityScore, topDistortion } = req.body;
    const name = userName || 'Practitioner';
    const streak = streakDays || 7;
    const score = clarityScore || 85;
    const distortion = topDistortion || 'Catastrophizing';

    const ai = getAIClient();

    if (!ai) {
      res.json({
        greeting: `Good Morning, ${name}!`,
        affirmationText: `Today, I recognize that my thoughts are signals, not absolute truths. With a ${streak}-day streak and growing cognitive clarity, I step forward with calm confidence and release the urge to predict worst-case outcomes.`,
        focusMantra: 'Present Focus, Steady Calm',
        stoicMicroTip: 'When anxiety urges you to rush ahead, ground your breath for 3 seconds and focus exclusively on the single immediate task.',
        themeTag: 'Mindful Grounding',
      });
      return;
    }

    const prompt = `You are MindDojo, an empowering CBT & Stoic daily affirmation coach.
Generate a personalized, deeply context-aware morning motivation affirmation for:
- User Name: ${name}
- Current Streak: ${streak} days
- Clarity Score Index: ${score}
- Key Cognitive Pattern to neutralize today: ${distortion}

Return JSON with:
- greeting: string (e.g., "Good Morning, Alex!", "Rise & Center, Alex!")
- affirmationText: string (2-3 empowering first-person "I" sentences tailored specifically to countering ${distortion} while honoring their ${streak}-day journey)
- focusMantra: string (3-6 word memorable daily mantra)
- stoicMicroTip: string (1 actionable Stoic/CBT wisdom tip for today)
- themeTag: string (e.g. "Catastrophizing Shift", "Inner Sovereignty", "Calm Execution")`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greeting: { type: Type.STRING },
            affirmationText: { type: Type.STRING },
            focusMantra: { type: Type.STRING },
            stoicMicroTip: { type: Type.STRING },
            themeTag: { type: Type.STRING },
          },
          required: ['greeting', 'affirmationText', 'focusMantra', 'stoicMicroTip', 'themeTag'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.info('Using offline fallback for affirmation endpoint');
    res.json({
      greeting: `Good Morning, ${req.body?.userName || 'Practitioner'}!`,
      affirmationText: `Today, I recognize that my thoughts are signals, not absolute truths. With my momentum, I step forward with calm confidence and release the urge to predict worst-case outcomes.`,
      focusMantra: 'Present Focus, Steady Calm',
      stoicMicroTip: 'When anxiety urges you to rush ahead, ground your breath for 3 seconds and focus exclusively on the single immediate task.',
      themeTag: 'Mindful Grounding',
    });
  }
});

// API: AI-Powered Body Scan Posture & Relaxation Analysis
app.post('/api/cbt/bodyscan-analysis', async (req, res) => {
  try {
    const { bodyRegion, shoulderSymmetry, neckTilt, relaxationDepth, userNotes } = req.body;
    const region = bodyRegion || 'Shoulders & Neck';
    const symmetry = shoulderSymmetry || 88;
    const tilt = neckTilt || 3;
    const depth = relaxationDepth || 75;

    const ai = getAIClient();

    if (!ai) {
      res.json({
        postureFeedback: `Your shoulder symmetry is at ${symmetry}%. Drop your left shoulder slightly to unburden trapped upper trapezius tension.`,
        relaxationScore: Math.min(98, depth + 8),
        alignmentTip: 'Keep your chin parallel to the floor and gently lengthen the spine like a suspended thread.',
        somaticPrompt: 'Inhale into the back of your ribcage, exhaling through open lips for 4 seconds.',
        detectedTensionLevel: symmetry < 75 ? 'Moderate Hunching' : 'Relaxed Neutral Alignment',
      });
      return;
    }

    const prompt = `You are a biofeedback somatics expert and CBT mindfulness coach.
Analyze the user's live posture and body scan metrics for region "${region}":
- Shoulder Symmetry Metric: ${symmetry}%
- Neck Tilt Angle: ${tilt}°
- Current Relaxation Depth: ${depth}%
- Notes: ${userNotes || 'Routine body scan'}

Return JSON:
- postureFeedback: string (1-2 precise, gentle real-time physical posture adjustments)
- relaxationScore: number (0-100 calculated relaxation rating)
- alignmentTip: string (1 practical alignment cue)
- somaticPrompt: string (1 somatic breathing/release prompt)
- detectedTensionLevel: string (e.g., "Optimal Neutral", "Mild Trapezius Tightness", "Jaw Clenching Detected")`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            postureFeedback: { type: Type.STRING },
            relaxationScore: { type: Type.NUMBER },
            alignmentTip: { type: Type.STRING },
            somaticPrompt: { type: Type.STRING },
            detectedTensionLevel: { type: Type.STRING },
          },
          required: ['postureFeedback', 'relaxationScore', 'alignmentTip', 'somaticPrompt', 'detectedTensionLevel'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.info('Using offline fallback for bodyscan endpoint');
    res.json({
      postureFeedback: `Your shoulder symmetry is holding steady. Drop your shoulders away from your ears to release trapped upper trapezius tension.`,
      relaxationScore: Math.min(98, (req.body?.relaxationDepth || 75) + 5),
      alignmentTip: 'Keep your chin parallel to the floor and gently lengthen the spine like a suspended thread.',
      somaticPrompt: 'Inhale into the back of your ribcage, exhaling through open lips for 4 seconds.',
      detectedTensionLevel: 'Relaxed Alignment',
    });
  }
});

// API: AI-Powered Growth Garden Reflection & Stage Evaluation
app.post('/api/cbt/garden-analysis', async (req, res) => {
  try {
    const { userName, streakDays, totalXp, clarityScore, totalSessions } = req.body;
    const name = userName || 'Practitioner';
    const streak = streakDays || 14;
    const xp = totalXp || 1250;
    const clarity = clarityScore || 85;
    const sessions = totalSessions || 18;

    const ai = getAIClient();

    if (!ai) {
      res.json({
        treeTitle: 'Oak of Unshakable Clarity',
        growthStage: 'Stage 4: Luminous Canopy',
        reflectionPoem: `Rooted deep in ${streak} days of mindful discipline, your tree stretches towards emotional clarity. With ${sessions} reframing sessions completed, its leaves reflect the light of steady self-sovereignty.`,
        nextMilestoneHint: 'Reach a 21-day streak to unlock the Golden Lotus Fountain and double bloom density.',
        gardenEnergy: 'Serene Radiance',
      });
      return;
    }

    const prompt = `You are a mindfulness ecosystem guide and CBT garden mentor.
Analyze the user's Growth Garden metrics:
- User Name: ${name}
- Streak Days: ${streak}
- Total XP: ${xp}
- Clarity Index Score: ${clarity}%
- Completed Reframing Sessions: ${sessions}

Return JSON:
- treeTitle: string (poetic title for their virtual 3D tree based on progress, e.g., "Blossoming Sakura of Stoic Calm", "Grand Oak of Equanimity")
- growthStage: string (e.g., "Stage 3: Deep Trapezius Roots", "Stage 5: Golden Canopy Sovereign")
- reflectionPoem: string (2-3 sentence evocative, philosophical reflection linking their mental progress to the blooming virtual garden)
- nextMilestoneHint: string (1 motivating goal hint to nurture further growth)
- gardenEnergy: string (e.g., "Vibrant Serenity", "Golden Equanimity", "Luminous Focus")`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            treeTitle: { type: Type.STRING },
            growthStage: { type: Type.STRING },
            reflectionPoem: { type: Type.STRING },
            nextMilestoneHint: { type: Type.STRING },
            gardenEnergy: { type: Type.STRING },
          },
          required: ['treeTitle', 'growthStage', 'reflectionPoem', 'nextMilestoneHint', 'gardenEnergy'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.info('Using offline fallback for garden endpoint');
    res.json({
      treeTitle: 'Oak of Unshakable Clarity',
      growthStage: 'Stage 4: Luminous Canopy',
      reflectionPoem: `Rooted deep in ${req.body?.streakDays || 14} days of mindful discipline, your tree stretches towards emotional clarity. With steady practice, its leaves reflect the light of inner sovereignty.`,
      nextMilestoneHint: 'Maintain your reframing streak to unlock the Reflection Koi Pond.',
      gardenEnergy: 'Serene Radiance',
    });
  }
});

// API: AI CBT Mentor / Therapist Real-Time Context-Aware Advice
app.post('/api/cbt/mentor-advice', async (req, res) => {
  try {
    const { currentThought, currentEmotion, currentStep, selectedDistortions, userQuery } = req.body;
    const thought = currentThought || '';
    const emotion = currentEmotion || 'Anxiety';
    const step = currentStep || 1;
    const distortions = selectedDistortions || [];
    const query = userQuery || '';

    const ai = getAIClient();

    if (!ai) {
      let therapistNudge = "I am listening closely. Remember that thoughts are mental events, not objective facts.";
      let socraticQuestions = [
        "What factual evidence supports this thought, and what evidence contradicts it?",
        "If a close friend shared this exact concern with you, what advice would you give them?",
        "What is a more balanced, self-compassionate way to look at this situation?"
      ];
      let cognitiveTrapWarning = thought.toLowerCase().includes('never') || thought.toLowerCase().includes('always') 
        ? "Notice the use of absolute terms like 'always' or 'never'. This is a hallmark of All-or-Nothing thinking." 
        : thought.toLowerCase().includes('what if') 
        ? "Notice the 'what if' pattern. This indicates anticipatory catastrophizing."
        : undefined;

      res.json({
        therapistNudge,
        socraticQuestions,
        cognitiveTrapWarning,
        recommendedMicroExercise: "Take a 4-second slow inhale, hold for 4 seconds, and release tension in your shoulders.",
        responseMessage: query ? `As your CBT mentor, I encourage you to pause and evaluate "${query}". Consider focusing on what you can control right now.` : undefined
      });
      return;
    }

    const systemPrompt = `You are Dr. Aurelia, an expert digital CBT therapist and compassionate mindfulness mentor.
Your role is to provide real-time, context-aware guidance as the user logs automatic thoughts or completes a CBT cognitive reframing session.

User Context:
- Current Draft Thought: "${thought}"
- Primary Emotion: ${emotion}
- CBT Session Stage: Step ${step}
- Selected Distortions: ${distortions.join(', ') || 'None selected yet'}
${query ? `- Specific Question from User: "${query}"` : ''}

Provide your guidance in JSON format:
- therapistNudge: string (1-2 empathetic, insightful sentences directly reflecting on their current thought or stage)
- socraticQuestions: string[] (array of 3 sharp, Beckian Socratic questions to prompt deeper reframing)
- cognitiveTrapWarning: string or null (if the user's thought contains absolute words, catastrophizing, or mind reading, briefly warn them kindly; otherwise null)
- recommendedMicroExercise: string (1 concise grounding or somatic technique suited for their emotion)
- responseMessage: string or null (if userQuery was provided, give a direct, compassionate 2-3 sentence therapist answer; otherwise null)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            therapistNudge: { type: Type.STRING },
            socraticQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            cognitiveTrapWarning: { type: Type.STRING },
            recommendedMicroExercise: { type: Type.STRING },
            responseMessage: { type: Type.STRING },
          },
          required: ['therapistNudge', 'socraticQuestions', 'recommendedMicroExercise'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.info('Using offline fallback for mentor advice endpoint');
    res.json({
      therapistNudge: req.body?.currentThought 
        ? `Notice the thought: "${req.body.currentThought}". Ask yourself if this reflects an unchangeable truth or a passing state of mind.`
        : "Every automatic thought is an invitation to practice self-inquiry. Notice the feeling without judging yourself.",
      socraticQuestions: [
        "What factual evidence supports this thought, and what evidence contradicts it?",
        "What is the worst case, best case, and most realistic outcome?",
        "If a supportive friend shared this thought with you, what would you tell them?"
      ],
      cognitiveTrapWarning: req.body?.currentThought?.toLowerCase().includes('always') || req.body?.currentThought?.toLowerCase().includes('never')
        ? "Notice the use of absolute terms like 'always' or 'never'. This is a hallmark of All-or-Nothing thinking."
        : undefined,
      recommendedMicroExercise: "Unclench your jaw, lower your shoulders, and take three deep abdominal breaths.",
      responseMessage: req.body?.userQuery ? `As your CBT mentor, I hear your question regarding "${req.body.userQuery}". Focus on separating immediate feelings from objective facts.` : undefined
    });
  }
});

// Setup Vite Development Server or Static Production Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MindDojo Server running on http://localhost:${PORT}`);
  });
}

startServer();

