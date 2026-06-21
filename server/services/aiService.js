// server/services/aiService.js
const axios = require('axios');

class AIService {
  /**
   * PDF text extraction and quiz generation is now delegated entirely to the AI service container
   * via HTTP API. We simply forward the PDF buffer as a base64-encoded string.
   */
  async extractTextFromPDF(pdfBuffer) {
    // Return base64 string directly so we can send it in the HTTP request payload
    return pdfBuffer.toString('base64');
  }

  async generateQuiz(subject, pdfBase64, numberOfQuestions = 5) {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    console.log(`🤖 Requesting quiz generation from AI Service: ${aiServiceUrl}/generate`);

    try {
      const response = await axios.post(
        `${aiServiceUrl}/generate`,
        {
          subject: subject,
          pdf_base64: pdfBase64,
          num_questions: numberOfQuestions
        },
        {
          timeout: 90000 // 90-second timeout for AI pipeline
        }
      );

      if (response.data && response.data.questions) {
        const aiGenerated = response.data.aiGenerated !== false;
        console.log(`✅ AI service returned ${response.data.questions.length} questions (aiGenerated=${aiGenerated})`);
        return {
          questions: response.data.questions,
          aiGenerated,
        };
      } else {
        console.warn('⚠️ AI Service did not return standard questions format. Fallback empty array.');
        return { questions: [], aiGenerated: false };
      }
    } catch (error) {
      console.error('❌ AI microservice communication failure:', error.message);
      if (error.response) {
        console.error('Response details:', error.response.status, error.response.data);
      }
      throw new Error(`AI Quiz Generation failed: ${error.message}`);
    }
  }
}

module.exports = new AIService();
