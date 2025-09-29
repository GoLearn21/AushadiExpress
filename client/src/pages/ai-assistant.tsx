import { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { ArrowLeft, Send, Upload, Mic, MicOff, Sparkles, Camera, FileText } from 'lucide-react';
import { useLocation } from 'wouter';
import { enhancedCapture } from '../services/enhanced-capture';
import { cameraCapture } from '../services/camera-capture';
// import { pharmacyAgent } from '../services/pharmacy-agent';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'document';
  imageUrl?: string;
  documentInfo?: {
    type: 'bill' | 'prescription' | 'invoice';
    medicines?: string[];
    total?: number;
  };
}

export default function AIAssistantPage() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    addMessage('assistant', 
      'Welcome to AushadiExpress AI Assistant! 🏥\n\n' +
      'I can help you with:\n' +
      '• Analyzing bills, prescriptions, and invoices\n' +
      '• Medicine information and drug interactions\n' +
      '• Inventory management and stock levels\n' +
      '• Sales analytics and reporting\n' +
      '• Business insights from your documents\n\n' +
      'You can upload images, ask questions, or use voice commands. How can I assist you today?'
    );
  }, []);

  const addMessage = (role: 'user' | 'assistant', content: string, type: 'text' | 'image' | 'document' = 'text', imageUrl?: string, documentInfo?: any) => {
    const message: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
      type,
      imageUrl,
      documentInfo
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async (message: string, imageFile?: File) => {
    if (!message.trim() && !imageFile) return;

    let userContent = message.trim();
    let documentAnalysis = null;

    // Add user message
    if (imageFile) {
      const imageUrl = URL.createObjectURL(imageFile);
      addMessage('user', userContent || 'Uploaded an image', 'image', imageUrl);
      
      // Process the image through enhanced capture
      try {
        setIsLoading(true);
        const analysisResult = await enhancedCapture.captureAndAnalyze('file', imageFile, {
          skipConfirmation: true,
          autoClassify: true
        });

        if (analysisResult.success && analysisResult.document) {
          documentAnalysis = analysisResult.document.analysis;
          
          // Add document analysis message
          addMessage('assistant', 
            `📄 Document analyzed successfully!\n\n` +
            `**Type:** ${analysisResult.document.type.toUpperCase()}\n` +
            `**Confidence:** ${(documentAnalysis.confidence * 100).toFixed(1)}%\n\n` +
            `Document has been automatically stored and indexed for future queries.`,
            'document',
            undefined,
            {
              type: analysisResult.document.type,
              medicines: documentAnalysis.extractedData.medicines?.map(m => m.name) || [],
              total: documentAnalysis.extractedData.total
            }
          );

          // Enhance the user query with document context
          if (!userContent) {
            userContent = `I just uploaded a ${analysisResult.document.type}. Please analyze it and provide insights.`;
          } else {
            userContent = `I uploaded a ${analysisResult.document.type} image. ${userContent}`;
          }
        }
      } catch (error) {
        console.error('Image analysis failed:', error);
        addMessage('assistant', 
          '❌ Sorry, I couldn\'t analyze the image. Please try again or ask me something else.'
        );
        setIsLoading(false);
        return;
      }
    } else {
      addMessage('user', userContent);
    }

    setIsLoading(true);

    try {
      // Get AI response through pharmacy agent
      const { pharmacyAgent } = await import('@/services/pharmacy-agent');
      const response = await pharmacyAgent.processQuery(userContent, {
        hasImage: !!imageFile,
        documentAnalysis,
        currentScreen: 'AI Assistant'
      });

      addMessage('assistant', response);

    } catch (error) {
      console.error('AI Assistant error:', error);
      addMessage('assistant', 
        '❌ I encountered an error processing your request. Please try again or rephrase your question.'
      );
      
      toast({
        title: 'Assistant Error',
        description: 'Failed to get AI response',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = inputText;
    setInputText('');
    await handleSendMessage(message);
  };

  const handleImageUpload = async () => {
    try {
      setIsUploading(true);
      
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = async (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (file) {
          await handleSendMessage('', file);
        }
        setIsUploading(false);
      };
      
      input.oncancel = () => {
        setIsUploading(false);
      };
      
      input.click();
    } catch (error) {
      console.error('Image upload failed:', error);
      setIsUploading(false);
      toast({
        title: 'Upload Failed',
        description: 'Could not upload image',
        variant: 'destructive'
      });
    }
  };

  const handleCameraCapture = async () => {
    try {
      setIsUploading(true);
      
      const result = await cameraCapture.captureImage();
      
      if (result.success && result.file) {
        await handleSendMessage('', result.file);
      } else {
        toast({
          title: 'Capture Failed',
          description: result.error || 'Could not capture image',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Camera capture failed:', error);
      toast({
        title: 'Capture Failed',
        description: 'Could not access camera',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleVoiceToggle = async () => {
    if (isListening) {
      setIsListening(false);
      // Stop voice recognition
    } else {
      setIsListening(true);
      // Start voice recognition
      toast({
        title: 'Voice Recognition',
        description: 'Voice input will be available in a future update',
        variant: 'default'
      });
      setTimeout(() => setIsListening(false), 2000);
    }
  };

  const quickActions = [
    { 
      label: 'Analyze Medicine Interactions', 
      icon: '💊',
      action: () => handleSendMessage('Help me check for drug interactions and safety information')
    },
    { 
      label: 'Recent Documents Summary', 
      icon: '📄',
      action: () => handleSendMessage('Show me a summary of recently uploaded documents')
    },
    { 
      label: 'Inventory Status', 
      icon: '📦',
      action: () => handleSendMessage('What\'s my current inventory status and any low stock alerts?')
    },
    { 
      label: 'Sales Analytics', 
      icon: '📊',
      action: () => handleSendMessage('Give me today\'s sales analytics and key insights')
    }
  ];

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation('/')}
            data-testid="back-button"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              AI Assistant
            </h1>
            <p className="text-xs text-muted-foreground">Pharmacy Intelligence</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {isLoading ? 'Thinking...' : 'Ready'}
        </Badge>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">AI Assistant Ready</h3>
            <p className="text-muted-foreground mb-6">
              Upload documents, ask questions, or try a quick action below
            </p>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4 text-left"
                  onClick={action.action}
                  data-testid={`quick-action-${index}`}
                >
                  <span className="text-lg mr-3">{action.icon}</span>
                  <span className="text-sm">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-12'
                  : 'bg-muted mr-12'
              }`}
            >
              {message.type === 'image' && message.imageUrl && (
                <div className="mb-2">
                  <img 
                    src={message.imageUrl} 
                    alt="Uploaded image" 
                    className="max-w-full h-auto rounded-lg"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
              
              {message.type === 'document' && message.documentInfo && (
                <div className="mb-2 p-3 bg-background/50 rounded-lg border">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4" />
                    <Badge variant="outline">{message.documentInfo.type}</Badge>
                  </div>
                  {message.documentInfo.medicines && message.documentInfo.medicines.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Medicines: {message.documentInfo.medicines.slice(0, 3).join(', ')}
                      {message.documentInfo.medicines.length > 3 && ` +${message.documentInfo.medicines.length - 3} more`}
                    </div>
                  )}
                  {message.documentInfo.total && (
                    <div className="text-xs text-muted-foreground">
                      Total: ₹{message.documentInfo.total}
                    </div>
                  )}
                </div>
              )}
              
              <div className="whitespace-pre-wrap text-sm">
                {message.content}
              </div>
              
              <div className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
              }`}>
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-3 mr-12">
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background/95 backdrop-blur p-4 space-y-3">
        {/* Action Buttons */}
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCameraCapture}
            disabled={isUploading || isLoading}
            data-testid="camera-button"
          >
            <Camera className="w-4 h-4 mr-2" />
            Camera
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImageUpload}
            disabled={isUploading || isLoading}
            data-testid="upload-button"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleVoiceToggle}
            disabled={isLoading}
            data-testid="voice-button"
            className={isListening ? 'bg-red-500 text-white' : ''}
          >
            {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
            Voice
          </Button>
        </div>

        {/* Text Input */}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about medicines, documents, or get insights..."
            disabled={isLoading}
            className="flex-1"
            data-testid="message-input"
          />
          <Button 
            type="submit" 
            disabled={isLoading || (!inputText.trim())}
            data-testid="send-button"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        
        <div className="text-xs text-center text-muted-foreground">
          AI responses may contain errors. Verify important medical information.
        </div>
      </div>
    </div>
  );
}