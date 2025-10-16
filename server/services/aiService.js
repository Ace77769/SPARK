// server/services/aiService.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class AIService {
  async extractTextFromPDF(pdfBuffer) {
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const tempPdfPath = path.join(tempDir, `temp_${Date.now()}.pdf`);
    fs.writeFileSync(tempPdfPath, pdfBuffer);
    console.log(`📄 Saved temp PDF: ${tempPdfPath}`);
    return tempPdfPath;
  }

  async generateQuiz(subject, pdfPath, numberOfQuestions = 5) {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, '..', 'python_ai_service.py');
      const cmd = `python "${pythonScript}" "${subject}" "${pdfPath}" ${numberOfQuestions}`;

      console.log('🐍 Running python:', cmd);
      exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        // delete temp pdf
        try { if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath); } catch (e) {}

        if (error) {
          console.error('❌ Python service error:', error);
          console.error('stderr:', stderr);
          return reject(new Error(`AI service failed: ${error.message}`));
        }

        // stdout should be JSON
        try {
          console.log('📤 Python stdout preview:', stdout.slice(0, 1000));
          const result = JSON.parse(stdout);
          if (result.error) return reject(new Error(result.error));
          resolve(result.questions || []);
        } catch (parseErr) {
          console.error('❌ Failed to parse Python output, stdout: ', stdout);
          return reject(new Error('Invalid JSON from AI service'));
        }
      });
    });
  }
}

module.exports = new AIService();
