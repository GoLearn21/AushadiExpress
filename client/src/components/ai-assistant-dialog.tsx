import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { remoteAI, voiceAssistant, ocrAssistant, type AIAssistantContext } from '@/lib/ai-assistant';
import { documentStorage } from '@/services/document-storage';
import { enhancedCapture } from '@/services/enhanced-capture';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIAssistantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  context?: AIAssistantContext;
}

export function AIAssistantDialog({ isOpen, onClose, context }: AIAssistantDialogProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkVoiceSupport();
    if (isOpen && messages.length === 0) {
      addWelcomeMessage();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkVoiceSupport = async () => {
    const supported = await voiceAssistant.isSupported();
    setVoiceSupported(supported);
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Hello! I'm your AI assistant for AushadiExpress. I can help you with:\n\n• Medicine information and drug interactions\n• Inventory management\n• Prescription validation\n• Document analysis\n• Sales insights\n\nHow can I assist you today?`,
      timestamp: Date.now()
    };
    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const message: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    addMessage('user', message);
    setIsLoading(true);

    try {
      // Enhance context with document data for AI queries
      const enhancedContext = await enhanceContextWithDocuments(message, context);
      const response = await remoteAI.ask(message, enhancedContext);
      addMessage('assistant', response);
    } catch (error) {
      console.error('AI Assistant error:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      toast({
        title: 'Assistant Error',
        description: 'Failed to get AI response',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceContextWithDocuments = async (message: string, currentContext?: AIAssistantContext) => {
    try {
      // Get recent documents for context
      const recentDocs = await enhancedCapture.getRecentDocuments(5);
      
      // Search for relevant documents based on the message
      const relevantDocs = message.toLowerCase().includes('document') || message.toLowerCase().includes('recent')
        ? await enhancedCapture.searchDocuments(message, undefined)
        : [];

      return {
        ...currentContext,
        userData: {
          ...currentContext?.userData,
          recentDocuments: recentDocs.map(doc => ({
            id: doc.id,
            type: doc.type,
            date: doc.createdAt,
            medicines: doc.analysis.extractedData.medicines || [],
            summary: doc.analysis.rawText.substring(0, 200)
          })),
          relevantDocuments: relevantDocs.slice(0, 3).map(doc => ({
            type: doc.type,
            medicines: doc.analysis.extractedData.medicines || [],
            total: doc.analysis.extractedData.total
          }))
        }
      };
    } catch (error) {
      console.warn('Failed to enhance context with documents:', error);
      return currentContext;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = inputText;
    setInputText('');
    await handleSendMessage(message);
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      await voiceAssistant.stopListening();
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      await voiceAssistant.startListening(
        async (transcript) => {
          setIsListening(false);
          setInputText(transcript);
          // Auto-send voice input
          await handleSendMessage(transcript);
        },
        (error) => {
          setIsListening(false);
          console.error('Voice input error:', error);
          toast({
            title: 'Voice Input Failed',
            description: error === 'not-allowed' ? 'Microphone permission required' : 'Voice recognition failed',
            variant: 'destructive'
          });
        }
      );
    } catch (error) {
      setIsListening(false);
      toast({
        title: 'Voice Not Supported',
        description: 'Voice input is not available on this device',
        variant: 'destructive'
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    addMessage('user', `📷 Analyzing image: ${file.name}`);

    try {
      const extractedText = await ocrAssistant.scanText(file);
      
      if (extractedText.trim()) {
        const analysisPrompt = `Please analyze this document text and provide insights:\n\n${extractedText}`;
        const analysis = await remoteAI.ask(analysisPrompt, context);
        addMessage('assistant', `📄 **Document Analysis:**\n\n${analysis}\n\n**Extracted Text:**\n${extractedText.substring(0, 500)}${extractedText.length > 500 ? '...' : ''}`);
      } else {
        addMessage('assistant', 'I couldn\'t extract any readable text from this image. Please try a clearer image or different document.');
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      addMessage('assistant', 'Sorry, I couldn\'t analyze that image. Please try again with a clearer photo.');
      toast({
        title: 'Image Analysis Failed',
        description: 'Could not process the uploaded image',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const quickActions = [
    { label: 'Check Drug Interactions', action: () => handleSendMessage('Help me check for drug interactions') },
    { label: 'Recent Documents', action: () => handleSendMessage('Show me recent documents and their analysis') },
    { label: 'Sales Summary', action: () => handleSendMessage('Give me today\'s sales summary') },
    { label: 'Document Report', action: () => handleSendMessage('Generate a report of analyzed documents') }
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🤖 AI Assistant
              {context?.currentScreen && (
                <Badge variant="secondary" className="text-xs">
                  {context.currentScreen}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <Card className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <CardContent className="p-3">
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <Card className="bg-muted">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
                      <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <div className="text-sm text-muted-foreground mb-2">Quick actions:</div>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={action.action}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask me anything about pharmacy operations..."
                  disabled={isLoading || isListening}
                  className="flex-1"
                  data-testid="ai-input"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !inputText.trim() || isListening}
                  data-testid="ai-send"
                >
                  <span className="material-icons">send</span>
                </Button>
              </div>
              
              <div className="flex gap-2">
                {voiceSupported && (
                  <Button
                    type="button"
                    variant={isListening ? "destructive" : "outline"}
                    size="sm"
                    onClick={handleVoiceInput}
                    disabled={isLoading}
                    data-testid="ai-voice"
                  >
                    <span className="material-icons">
                      {isListening ? 'mic_off' : 'mic'}
                    </span>
                    {isListening ? 'Stop' : 'Voice'}
                  </Button>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  data-testid="ai-image"
                >
                  <span className="material-icons">photo_camera</span>
                  Analyze Image
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </>
  );
}