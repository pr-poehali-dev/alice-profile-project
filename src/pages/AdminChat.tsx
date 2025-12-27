import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const CHAT_API = 'https://functions.poehali.dev/c8aaa711-b2c8-4443-b41f-4fc1c70642dc';

interface ChatMessage {
  id: number;
  sender: string;
  name: string | null;
  message: string;
  created_at: string;
}

interface AdminChatProps {
  password: string;
}

const AdminChat = ({ password }: AdminChatProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(CHAT_API);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'admin',
          name: null,
          message: newMessage
        })
      });

      if (response.ok) {
        setNewMessage('');
        loadMessages();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div 
      className="h-full flex flex-col"
      style={{
        backgroundImage: 'url(https://cdn.poehali.dev/projects/d7c2701a-ee3d-48e1-90e8-201508829b10/files/9af3b10f-edcd-4108-8c79-32f5e18db518.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin')}
            className="text-white hover:bg-white/20"
          >
            <Icon name="ArrowLeft" size={24} />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-lg">Чат с пользователями</h1>
            <p className="text-sm text-white/80">Администратор</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg) => {
            const isAdmin = msg.sender === 'admin';
            return (
              <div key={msg.id} className={`flex gap-2 ${isAdmin ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                {!isAdmin && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      {msg.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[70%] ${isAdmin ? 'order-1' : 'order-2'}`}>
                  {msg.name && (
                    <p className={`text-xs text-gray-600 mb-1 ${isAdmin ? 'text-right' : 'text-left'}`}>
                      {msg.name}
                    </p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 shadow-md ${
                      isAdmin
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    <p className={`text-xs mt-1 ${isAdmin ? 'text-white/70' : 'text-gray-500'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <Avatar className="h-8 w-8 mt-1 order-2">
                    <AvatarImage src="https://cdn.poehali.dev/projects/d7c2701a-ee3d-48e1-90e8-201508829b10/files/a0795fc7-b8f6-4804-8021-a1593336caf3.jpg" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 p-4 shadow-lg">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            disabled={isSending}
            className="flex-1 rounded-full bg-gray-100 border-0 focus-visible:ring-purple-500"
          />
          <Button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="rounded-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 px-6"
          >
            {isSending ? (
              <Icon name="Loader2" size={20} className="animate-spin" />
            ) : (
              <Icon name="Send" size={20} />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminChat;
