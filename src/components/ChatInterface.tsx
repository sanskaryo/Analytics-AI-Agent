import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardFooter } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Send, User, Bot, LightbulbIcon } from 'lucide-react';
import { DatasetInfo } from '@/lib/dataUtils';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  datasetInfo?: DatasetInfo;
  sampleQuestions: string[];
  onRunQuery: (query: string) => Promise<string>; // Update to expect a Promise<string> return
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  datasetInfo, 
  sampleQuestions,
  onRunQuery 
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      // Wait for the response from onRunQuery
      const response = await onRunQuery(input);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response || "I've processed your query and updated the visualizations based on your request.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    } catch (error) {
      console.error("Error processing query:", error);
      toast({
        variant: "destructive",
        title: "Error processing query",
        description: "Could not get a response from the AI assistant. Please try again."
      });
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I couldn't process that query. Could you try rephrasing or asking something else?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSampleQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <Card className="w-full h-[calc(100vh-11rem)] max-h-[calc(100vh-11rem)] flex flex-col fade-in overflow-hidden">
      <CardHeader className="pb-2 md:pb-3 flex-shrink-0">
        <CardTitle className="text-lg md:text-xl flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Data Visualization Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow p-0 overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-3 md:p-4 flex-grow flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 md:mb-4 animate-fade-in">
              <LightbulbIcon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
            
            <h3 className="font-semibold text-base md:text-lg mb-2 animate-fade-up delay-1">
              Ask anything about your data
            </h3>
            
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4 md:mb-6 animate-fade-up delay-2">
              Use natural language to explore and visualize your dataset.
            </p>
            
            <div className="space-y-2 w-full max-w-sm animate-fade-up delay-3">
              <p className="text-sm font-medium text-left">Try asking:</p>
              
              <div className="grid grid-cols-1 gap-2">
                {sampleQuestions.slice(0, 3).map((question, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="justify-start text-left h-auto py-2 text-sm"
                    onClick={() => handleSampleQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full max-h-full overflow-hidden">
            <ScrollArea className="h-full max-h-full py-1 px-3">
              <div className="space-y-3 md:space-y-4 pb-2">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`
                        flex gap-3 max-w-[80%] animate-fade-up
                        ${message.role === 'user' ? 'flex-row-reverse' : ''}
                      `}
                    >
                      <Avatar
                        className={`
                        ${message.role === 'user' ? 'bg-primary' : 'bg-secondary'}
                        h-12 w-12
                        `}
                      >
                        {message.role === 'user' 
                        ? <User className="h-10 w-10 m-auto text-white" /> 
                        : <Bot className="h-10 w-10 m-auto" />
                        }
                      </Avatar>
                      
                      <div className={`
                        rounded-lg p-3 text-sm
                        ${message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary text-secondary-foreground'
                        }
                        break-words whitespace-pre-wrap
                      `}>
                        {message.content}
                        <div className={`
                          text-xs mt-1 opacity-70
                          ${message.role === 'user' ? 'text-right' : ''}
                        `}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[80%] animate-fade-up">
                      <Avatar className="bg-secondary h-12 w-12">
                        <Bot className="h-8 w-8" />
                      </Avatar>
                      
                      <div className="rounded-lg p-3 text-sm bg-secondary">
                        <div className="flex gap-1 items-center">
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-3 pb-3 md:pt-4 md:pb-4 flex-shrink-0">
        <form 
          className="flex gap-2 w-full" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Textarea
            ref={inputRef}
            placeholder="Ask about your data..."
            value={input}
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={handleKeyDown}
            className="flex-grow resize-none min-h-[48px] max-h-36"
          />
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim()}
            className="h-[48px] shrink-0 bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;
