import re

def transform_css_file(input_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Apply all transformations
    transforms = [
        # Major structure colors
        ('linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', 'linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 50%, #FFDAB9 100%)'),
        ('linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 'linear-gradient(135deg, #FFF8DC 0%, #FFE4B5 100%)'),
        ('rgba(31, 41, 55, 0.95)', '#FFFAEF'),
        ('rgba(31, 41, 55, 0.9)', '#FFF9E6'),
        ('rgba(31, 41, 55, 0.8)', '#FFFAEF'),
        ('rgba(31, 41, 55, 0.5)', '#FFF9E6'),
        ('rgba(17, 24, 39, 0.9)', '#FFFAEF'),
        ('rgba(30, 41, 59, 0.8)', '#fff'),
        ('rgba(255, 255, 255, 0.05)', '#FFFAEF'),
        
        # Borders - specific ones first
        ('border: 1px solid rgba(59, 130, 246, 0.3)', 'border: 5px solid #FFD700'),
        ('border: 1px solid rgba(59, 130, 246, 0.2)', 'border: 3px solid #FFD700'),
        ('border: 2px solid #374151', 'border: 3px solid #FFD700'),
        ('border: 1px solid #374151', 'border: 3px solid #FFD700'),
        ('border: 1px solid rgba(239, 68, 68, 0.2)', 'border: 3px solid #FF6347'),
        ('border: 1px solid rgba(255, 215, 0, 0.2)', 'border: 3px solid #FFD700'),
        ('border: 1px solid rgba(255, 215, 0, 0.3)', 'border: 5px solid #FFD700'),
        ('border: 1px solid rgba(245, 158, 11, 0.2)', 'border: 3px solid #FFD700'),
        ('border: 1px solid #f59e0b', 'border: 3px solid #f59e0b'),
        ('border-bottom: 2px solid #374151', 'border-bottom: 3px solid #FFD700'),
        ('border-bottom: 2px solid #e5e7eb', 'border-bottom: 3px solid #FFD700'),
        ('border-top: 2px solid #e5e7eb', 'border-top: 3px solid #FFD700'),
        ('border-top: 1px solid #374151', 'border-top: 3px solid #FFD700'),
        
        # Text colors
        ('color: white;', 'color: #2C3E50;'),
        ('color: #f9fafb', 'color: #FF6347'),
        ('color: #e5e7eb', 'color: #2C3E50'),
        ('color: #d1d5db', 'color: #2C3E50'),
        ('color: #9ca3af', 'color: #5A6C7D'),
        ('color: #6b7280', 'color: #5A6C7D'),
        
        # Blue accents and gradients
        ('rgba(59, 130, 246, 0.3)', 'rgba(255, 215, 0, 0.3)'),
        ('rgba(59, 130, 246, 0.2)', 'rgba(255, 165, 0, 0.3)'),
        ('rgba(59, 130, 246, 0.1)', 'rgba(255, 215, 0, 0.2)'),
        ('border-color: #3b82f6', 'border-color: #FFA500'),
        ('color: #60a5fa', 'color: #FF6347'),
        ('background: #3b82f6', 'background: linear-gradient(135deg, #FFD700, #FFA500)'),
        ('linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)', 'linear-gradient(135deg, #FF6347, #FFD700)'),
        ('rgba(96, 165, 250, 0.3)', 'rgba(255, 215, 0, 0.3)'),
        ('border-top: 3px solid #60a5fa', 'border-top: 3px solid #FFD700'),
        
        # Gray backgrounds and buttons
        ('background: #374151', 'background: #FFD700'),
        ('background: #1f2937', 'background: #fff'),
        ('background: #e5e7eb', 'background: #fff'),
        ('linear-gradient(135deg, #475569, #334155)', 'linear-gradient(135deg, #FFD700, #FFA500)'),
        ('linear-gradient(135deg, #64748b, #475569)', 'linear-gradient(135deg, #FFA500, #FFD700)'),
        ('linear-gradient(135deg, #475569 0%, #334155 100%)', 'linear-gradient(135deg, #FFD700, #FFA500)'),
        ('linear-gradient(135deg, #64748b 0%, #475569 100%)', 'linear-gradient(135deg, #FFA500, #FFD700)'),
        ('background: #4b5563', 'background: linear-gradient(135deg, #FFA500, #FFD700)'),
        ('background: rgba(245, 158, 11, 0.1)', 'background: rgba(255, 215, 0, 0.2)'),
        ('color: #fbbf24', 'color: #FF6347'),
        
        # Error/warning colors  
        ('color: #ef4444', 'color: #FF6347'),
        ('background: rgba(239, 68, 68, 0.1)', 'background: rgba(255, 99, 71, 0.1)'),
        ('rgba(239, 68, 68, 0.3)', 'rgba(255, 99, 71, 0.3)'),
        ('linear-gradient(135deg, #ef4444, #dc2626)', 'linear-gradient(135deg, #FF6347, #dc2626)'),
        
        # Specific gradient colors
        ('linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)', 'linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FF6347 100%)'),
        
        # Font weights
        ('font-weight: 700', 'font-weight: 900'),
       ('font-weight: 600;', 'font-weight: 900;'),
    ]
    
    for old, new in transforms:
        content = content.replace(old, new)
    
    # Fix missing semicolons
    content = content.replace('background: linear-gradient(135deg, #FFA500, #FFD700)\n  box-shadow', 'background: linear-gradient(135deg, #FFA500, #FFD700);\n  box-shadow')
    
    # Fix specific colors for buttons (white text)
    content = content.replace('.nav-btn {\n  padding: 12px 20px;\n  border: 3px solid #FFD700;\n  background: #fff;\n  color: #2C3E50;', '.nav-btn {\n  padding: 12px 20px;\n  border: 3px solid #FFD700;\n  background: linear-gradient(135deg, #FFD700, #FFA500);\n  color: white;')
    content = content.replace('.nav-btn:hover:not(:disabled) {\n  border-color: #FFA500;\n  background: #FFD700;', '.nav-btn:hover:not(:disabled) {\n  border-color: #FFA500;\n  background: linear-gradient(135deg, #FFA500, #FFD700);')
    content = content.replace('.back-btn {\n  background: #FFD700;\n  color: #2C3E50;', '.back-btn {\n  background: linear-gradient(135deg, #FFD700, #FFA500);\n  color: white;')
    content = content.replace('.submit-quiz-btn {\n  background: linear-gradient(135deg, #FF6347, #dc2626);\n  color: #2C3E50;', '.submit-quiz-btn {\n  background: linear-gradient(135deg, #FF6347, #dc2626);\n  color: white;')
    content = content.replace('.question-nav-btn.active {\n  background: linear-gradient(135deg, #FFD700, #FFA500);\n  color: #2C3E50;', '.question-nav-btn.active {\n  background: linear-gradient(135deg, #FFD700, #FFA500);\n  color: white;')
    content = content.replace('.question-nav-btn.answered {\n  background: #10b981;\n  color: #2C3E50;', '.question-nav-btn.answered {\n  background: #10b981;\n  color: white;')
    content = content.replace('.option-indicator {\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n  background: #FFD700;\n  color: #2C3E50;', '.option-indicator {\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n  background: #FFD700;\n  color: white;')
    content = content.replace('.option-label.selected .option-indicator {\n  background: #10b981;\n  color: #2C3E50;', '.option-label.selected .option-indicator {\n  background: #10b981;\n  color: white;')
    content = content.replace('.question-text {\n  font-size: 18px;\n  line-height: 1.6;\n  color: #FF6347;', '.question-text {\n  font-size: 18px;\n  line-height: 1.6;\n  color: #2C3E50;')
    content = content.replace('border: 1px solid #374151', 'border: 3px solid #FFD700')
    
    # Add font-family
    content = content.replace('.quiz-container {', '.quiz-container {\n  font-family: \'
