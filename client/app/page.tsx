'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Stethoscope, User, Send, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendChatMessage } from '../utils/api'

interface ConsultationSummary {
  name?: string;
  age?: string;
  gender?: string;
  chief_complaint?: string;
  history_of_present_illness?: string;
  past_medical_history?: string;
  medications?: string;
  allergies?: string;
  family_history?: string;
  possible_diagnosis?: string;
  possible_treatment?: string;
  symptoms?: {
    [key: string]: string;
  };
}

export default function Gazassist() {
  const [summary, setSummary] = useState<ConsultationSummary | null>(null);
  const [messages, setMessages] = useState([
    {
      id: '1',
      content: 'Asalamu alaykum, how can I help you today?',
      role: 'assistant' as const,
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user' as const,
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMessage.content);
      const messageContent = response.includes('--SUMMARY') 
        ? response.substring(0, response.indexOf('--SUMMARY')).trim()
        : response;
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: messageContent,
        role: 'assistant' as const,
      };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);

      if (response.includes('--SUMMARY')) {
        const summaryStart = response.indexOf('--SUMMARY') + 10;
        const summaryJson = response.substring(summaryStart).trim();
        try {
          const parsedSummary = JSON.parse(summaryJson);
          setSummary(parsedSummary);
        } catch (error) {
          console.error('Error parsing summary JSON:', error);
        }
      }
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm currently experiencing difficulties and cannot provide assistance at the moment. Please try again later or seek immediate medical attention if this is an emergency.",
        role: 'assistant' as const,
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSummaryTable = (summary: ConsultationSummary) => {
    const rows = Object.entries(summary).map(([key, value]) => {
      if (key === 'symptoms' && typeof value === 'object') {
        return (
          <div key={key} className="border-t py-3">
            <div className="font-medium capitalize mb-2">{key.replace(/_/g, ' ')}</div>
            <div className="pl-4">
              {Object.entries(value).map(([symptomKey, symptomValue]) => (
                <div key={symptomKey} className="grid grid-cols-2 gap-2 mb-1">
                  <div className="text-sm capitalize text-gray-600">{symptomKey}:</div>
                  <div className="text-sm">{symptomValue}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div key={key} className="border-t py-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium capitalize">{key.replace(/_/g, ' ')}:</div>
            <div className="text-gray-700">{value}</div>
          </div>
        </div>
      );
    });

    return (
      <div className="divide-gray-200">{rows}</div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2F8B99] to-[#1e5962]">
      <nav className="bg-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-6 h-6 text-[#2F8B99]" />
            <span className="text-xl font-semibold text-gray-800">Gazassist</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-[#2F8B99]">About</Button>
            <Button variant="ghost" className="text-[#2F8B99]">How it works</Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 pt-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid lg:grid-cols-[1fr_300px]">
              <div className="border-r">
                <div className="p-6 bg-[#2F8B99] text-white">
                  <h2 className="text-xl font-semibold flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Gazassist Consultation
                  </h2>
                  <p className="mt-2 text-sm opacity-90">
                    Chat with Gazassist for medical support and initial assessment
                  </p>
                </div>
                <div className="h-[60vh] flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className={`flex items-start mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Avatar className={`${message.role === 'user' ? 'bg-[#2F8B99]/10' : 'bg-gray-100'} ${message.role === 'user' ? 'ml-2' : 'mr-2'}`}>
                              <AvatarFallback>
                                {message.role === 'user' ? 
                                  <User className="text-[#2F8B99]" /> : 
                                  <Stethoscope className="text-[#2F8B99]" />
                                }
                              </AvatarFallback>
                            </Avatar>
                            <div 
                              className={`p-3 rounded-xl ${
                                message.role === 'user' 
                                  ? 'bg-[#2F8B99] text-white' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <p>{message.content}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start mb-4"
                      >
                        <Avatar className="mr-2 bg-gray-100">
                          <AvatarFallback>
                            <Stethoscope className="text-[#2F8B99]" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 p-3 rounded-xl text-gray-800 flex items-center">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          <p>Analyzing your symptoms...</p>
                        </div>
                      </motion.div>
                    )}
                  </ScrollArea>
                  <div className="p-4 border-t bg-gray-50">
                    <form onSubmit={handleSubmit} className="flex space-x-2">
                      <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Describe your symptoms..."
                        className="flex-grow bg-white border-gray-200"
                        disabled={isLoading}
                      />
                      <Button 
                        type="submit" 
                        disabled={isLoading} 
                        className="bg-[#2F8B99] hover:bg-[#246d78] text-white"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Consultation Summary</h3>
                  <div className="bg-white p-4 rounded-xl border">
                    {summary ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="prose prose-sm max-w-none"
                      >
                        {renderSummaryTable(summary)}
                      </motion.div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">
                        Your consultation summary will appear here
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

