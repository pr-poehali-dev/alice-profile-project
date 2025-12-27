import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import AdminChat from './AdminChat';

const FRIENDS_API = 'https://functions.poehali.dev/342aac3e-ef55-49fa-ace2-8dd5b1f449b6';
const MESSAGES_API = 'https://functions.poehali.dev/608d960b-d134-4197-8349-2123b2614c46';
const CHAT_API = 'https://functions.poehali.dev/c8aaa711-b2c8-4443-b41f-4fc1c70642dc';

interface FriendRequest {
  id: number;
  name: string;
  description: string;
  avatar_url: string | null;
  status: string;
  created_at: string;
}

interface Message {
  id: number;
  name: string;
  email: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(FRIENDS_API, {
        method: 'GET',
        headers: {
          'X-Admin-Password': password
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
        
        const msgResponse = await fetch(MESSAGES_API, {
          method: 'GET',
          headers: { 'X-Admin-Password': password }
        });
        if (msgResponse.ok) {
          const msgData = await msgResponse.json();
          setMessages(msgData);
        }
        
        setIsAuthenticated(true);
        toast({
          title: "Вход выполнен! ✅",
          description: "Добро пожаловать в админ-панель",
        });
      } else {
        toast({
          title: "Ошибка входа",
          description: "Неверный пароль",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось подключиться к серверу",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const response = await fetch(FRIENDS_API, {
        method: 'GET',
        headers: { 'X-Admin-Password': password }
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }

      const msgResponse = await fetch(MESSAGES_API, {
        method: 'GET',
        headers: { 'X-Admin-Password': password }
      });
      if (msgResponse.ok) {
        const msgData = await msgResponse.json();
        setMessages(msgData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const response = await fetch(FRIENDS_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({ id, status })
      });

      if (response.ok) {
        toast({
          title: "Статус обновлён",
          description: `Заявка ${status === 'approved' ? 'одобрена' : 'отклонена'}`,
        });
        loadRequests();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${FRIENDS_API}?id=${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': password }
      });

      if (response.ok) {
        toast({
          title: "Заявка удалена",
          description: "Заявка успешно удалена из базы",
        });
        loadRequests();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить заявку",
        variant: "destructive"
      });
    }
  };

  const handleMessageRead = async (id: number, is_read: boolean) => {
    try {
      const response = await fetch(MESSAGES_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password
        },
        body: JSON.stringify({ id, is_read })
      });

      if (response.ok) {
        loadRequests();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive"
      });
    }
  };

  const handleMessageDelete = async (id: number) => {
    try {
      const response = await fetch(`${MESSAGES_API}?id=${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': password }
      });

      if (response.ok) {
        toast({
          title: "Сообщение удалено",
          description: "Сообщение успешно удалено из базы",
        });
        loadRequests();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить сообщение",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(loadRequests, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, password]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#2D1B4E] to-[#1A1F2C] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-[#2D1B4E]/80 to-[#1A1F2C]/80 backdrop-blur-xl border-purple-500/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Админ-панель
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-purple-300">Пароль администратора</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Вход...
                  </>
                ) : (
                  <>
                    <Icon name="Lock" size={18} className="mr-2" />
                    Войти
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showChat) {
    return <AdminChat password={password} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#2D1B4E] to-[#1A1F2C] text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Админ-панель
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowChat(true)}
              variant="outline"
              className="border-purple-500/30 text-white hover:bg-purple-500/20"
            >
              <Icon name="MessageCircle" size={18} className="mr-2" />
              Открыть чат
            </Button>
            <Button
              onClick={loadRequests}
              variant="outline"
              className="border-purple-500/30 text-white hover:bg-purple-500/20"
            >
              <Icon name="RefreshCw" size={18} className="mr-2" />
              Обновить
            </Button>
            <Button
              onClick={() => setIsAuthenticated(false)}
              variant="outline"
              className="border-purple-500/30 text-white hover:bg-purple-500/20"
            >
              <Icon name="LogOut" size={18} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#2D1B4E]/80">
            <TabsTrigger value="requests" className="data-[state=active]:bg-purple-500/50">
              <Icon name="UserPlus" size={18} className="mr-2" />
              Заявки в друзья ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-purple-500/50">
              <Icon name="MessageCircle" size={18} className="mr-2" />
              Сообщения ({messages.filter(m => !m.is_read).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-6">
        {requests.length === 0 ? (
          <Card className="bg-gradient-to-br from-[#2D1B4E]/80 to-[#1A1F2C]/80 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-12 text-center">
              <Icon name="Users" size={48} className="mx-auto mb-4 text-purple-400" />
              <p className="text-gray-300 text-lg">Пока нет заявок в друзья</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card key={request.id} className="bg-gradient-to-br from-[#2D1B4E]/80 to-[#1A1F2C]/80 backdrop-blur-xl border-purple-500/20 animate-fade-in">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <Avatar className="h-20 w-20 border-2 border-purple-400/50">
                      {request.avatar_url ? (
                        <AvatarImage src={request.avatar_url} alt={request.name} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-xl">
                          {request.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white">{request.name}</h3>
                        <Badge 
                          className={
                            request.status === 'approved' 
                              ? 'bg-green-500/50' 
                              : request.status === 'rejected' 
                              ? 'bg-red-500/50' 
                              : 'bg-yellow-500/50'
                          }
                        >
                          {request.status === 'approved' ? 'Одобрено' : request.status === 'rejected' ? 'Отклонено' : 'Ожидает'}
                        </Badge>
                      </div>
                      <p className="text-gray-300">{request.description}</p>
                      <p className="text-sm text-gray-400">
                        <Icon name="Calendar" size={14} className="inline mr-1" />
                        {new Date(request.created_at).toLocaleString('ru-RU')}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 md:ml-auto">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => handleStatusChange(request.id, 'approved')}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <Icon name="Check" size={18} className="mr-2" />
                            Одобрить
                          </Button>
                          <Button
                            onClick={() => handleStatusChange(request.id, 'rejected')}
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                          >
                            <Icon name="X" size={18} className="mr-2" />
                            Отклонить
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => handleDelete(request.id)}
                        variant="outline"
                        className="border-purple-500/30 text-white hover:bg-red-500/20"
                      >
                        <Icon name="Trash2" size={18} className="mr-2" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
        {messages.length === 0 ? (
          <Card className="bg-gradient-to-br from-[#2D1B4E]/80 to-[#1A1F2C]/80 backdrop-blur-xl border-purple-500/20">
            <CardContent className="p-12 text-center">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-purple-400" />
              <p className="text-gray-300 text-lg">Пока нет сообщений</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {messages.map((message) => (
              <Card key={message.id} className="bg-gradient-to-br from-[#2D1B4E]/80 to-[#1A1F2C]/80 backdrop-blur-xl border-purple-500/20 animate-fade-in">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white">{message.name}</h3>
                          {!message.is_read && (
                            <Badge className="bg-blue-500/50">Новое</Badge>
                          )}
                        </div>
                        {message.email && (
                          <p className="text-sm text-purple-300">
                            <Icon name="Mail" size={14} className="inline mr-1" />
                            {message.email}
                          </p>
                        )}
                        <p className="text-sm text-gray-400">
                          <Icon name="Calendar" size={14} className="inline mr-1" />
                          {new Date(message.created_at).toLocaleString('ru-RU')}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {!message.is_read && (
                          <Button
                            onClick={() => handleMessageRead(message.id, true)}
                            variant="outline"
                            size="sm"
                            className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                          >
                            <Icon name="CheckCheck" size={16} className="mr-1" />
                            Прочитано
                          </Button>
                        )}
                        {message.is_read && (
                          <Button
                            onClick={() => handleMessageRead(message.id, false)}
                            variant="outline"
                            size="sm"
                            className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                          >
                            <Icon name="Archive" size={16} className="mr-1" />
                            Не прочитано
                          </Button>
                        )}
                        <Button
                          onClick={() => handleMessageDelete(message.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 border border-purple-500/20">
                      <p className="text-gray-200 whitespace-pre-wrap">{message.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;