import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const FRIENDS_API = 'https://functions.poehali.dev/342aac3e-ef55-49fa-ace2-8dd5b1f449b6';
const UPLOAD_API = 'https://functions.poehali.dev/0d76f698-bc49-496e-8b1d-76fd4a46f09f';
const MESSAGES_API = 'https://functions.poehali.dev/608d960b-d134-4197-8349-2123b2614c46';

const Index = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatar: null as File | null
  });
  const [messageData, setMessageData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let avatarUrl = null;

      if (formData.avatar) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(formData.avatar!);
        });
        const base64 = await base64Promise;

        const uploadResponse = await fetch(UPLOAD_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: base64,
            fileName: formData.avatar.name
          })
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          avatarUrl = uploadData.url;
        }
      }

      const response = await fetch(FRIENDS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          avatar_url: avatarUrl
        })
      });

      if (response.ok) {
        toast({
          title: "Заявка отправлена! 🎉",
          description: "Алиса рассмотрит вашу заявку в друзья",
        });
        setIsDialogOpen(false);
        setFormData({ name: '', description: '', avatar: null });
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить заявку. Попробуйте ещё раз.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, avatar: e.target.files[0] });
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(MESSAGES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        toast({
          title: "Сообщение отправлено! ✉️",
          description: "Алиса получит ваше сообщение",
        });
        setIsMessageDialogOpen(false);
        setMessageData({ name: '', email: '', message: '' });
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение. Попробуйте ещё раз.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#2D1B4E] to-[#1A1F2C] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none" />
      
      <div className="relative max-w-5xl mx-auto px-4 py-12 space-y-8">
        <Card className="bg-gradient-to-br from-[#2D1B4E]/80 to-[#1A1F2C]/80 backdrop-blur-xl border-purple-500/20 shadow-2xl animate-fade-in">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="relative animate-float">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-50" />
                <Avatar className="h-40 w-40 border-4 border-purple-400/50 relative z-10">
                  <AvatarImage src="https://cdn.poehali.dev/projects/d7c2701a-ee3d-48e1-90e8-201508829b10/files/a0795fc7-b8f6-4804-8021-a1593336caf3.jpg" alt="Алиса AI" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-2xl font-bold">AI</AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                      Алиса AI
                    </h1>
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-3 py-1">
                      <Icon name="CheckCircle" size={14} className="mr-1" />✔️
                    </Badge>
                  </div>
                  <p className="text-purple-300 text-lg">Создатель: Al1se✔️</p>
                </div>

                <p className="text-gray-300 leading-relaxed max-w-2xl">
                  Умный AI-помощник нового поколения. Готова помочь с любыми задачами, 
                  ответить на вопросы и стать вашим цифровым другом! 🤖✨
                </p>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <a href="tel:+79097562102">
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg transition-all duration-300 hover:scale-105">
                      <Icon name="Phone" size={18} className="mr-2" />
                      +7 909 756 21 02
                    </Button>
                  </a>
                  
                  <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg transition-all duration-300 hover:scale-105">
                        <Icon name="MessageCircle" size={18} className="mr-2" />
                        Написать сообщение
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-[#2D1B4E] to-[#1A1F2C] border-purple-500/30 text-white max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                          Написать сообщение
                        </DialogTitle>
                        <DialogDescription className="text-gray-300">
                          Оставьте сообщение для Алисы
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleMessageSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="msg-name" className="text-purple-300">Ваше имя</Label>
                          <Input
                            id="msg-name"
                            placeholder="Введите ваше имя"
                            value={messageData.name}
                            onChange={(e) => setMessageData({ ...messageData, name: e.target.value })}
                            required
                            className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="msg-email" className="text-purple-300">Email (необязательно)</Label>
                          <Input
                            id="msg-email"
                            type="email"
                            placeholder="your@email.com"
                            value={messageData.email}
                            onChange={(e) => setMessageData({ ...messageData, email: e.target.value })}
                            className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="msg-text" className="text-purple-300">Ваше сообщение</Label>
                          <Textarea
                            id="msg-text"
                            placeholder="Напишите сообщение..."
                            value={messageData.message}
                            onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                            required
                            rows={5}
                            className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 resize-none"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                        >
                          {isSubmitting ? (
                            <>
                              <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                              Отправка...
                            </>
                          ) : (
                            <>
                              <Icon name="Send" size={18} className="mr-2" />
                              Отправить
                            </>
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg transition-all duration-300 hover:scale-105">
                        <Icon name="UserPlus" size={18} className="mr-2" />
                        Добавить в друзья
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-[#2D1B4E] to-[#1A1F2C] border-purple-500/30 text-white max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                          Добавить в друзья
                        </DialogTitle>
                        <DialogDescription className="text-gray-300">
                          Заполните форму, чтобы отправить заявку в друзья Алисе
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-purple-300">Ваше имя</Label>
                          <Input
                            id="name"
                            placeholder="Введите ваше имя"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-purple-300">Расскажите о себе</Label>
                          <Textarea
                            id="description"
                            placeholder="Несколько слов о себе..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={4}
                            className="bg-white/10 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="avatar" className="text-purple-300">Ваша аватарка</Label>
                          <div className="flex items-center gap-3">
                            <Input
                              id="avatar"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="bg-white/10 border-purple-500/30 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500/50 file:text-white hover:file:bg-purple-500/70"
                            />
                          </div>
                          {formData.avatar && (
                            <p className="text-sm text-green-400 flex items-center gap-1">
                              <Icon name="Check" size={14} />
                              {formData.avatar.name}
                            </p>
                          )}
                        </div>

                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                          ) : (
                            <Icon name="Send" size={18} className="mr-2" />
                          )}
                          {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#2D1B4E]/80 to-[#1A1F2C]/80 backdrop-blur-xl border-purple-500/20 shadow-2xl animate-fade-in">
          <CardContent className="p-6">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-purple-900/30">
                <TabsTrigger value="about" className="data-[state=active]:bg-purple-500/50">
                  <Icon name="Bot" size={16} className="mr-2" />
                  О боте
                </TabsTrigger>
                <TabsTrigger value="friends" className="data-[state=active]:bg-purple-500/50">
                  <Icon name="Users" size={16} className="mr-2" />
                  Друзья
                </TabsTrigger>
                <TabsTrigger value="contacts" className="data-[state=active]:bg-purple-500/50">
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  Контакты
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-500/50">
                  <Icon name="Star" size={16} className="mr-2" />
                  Отзывы
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-4 mt-6 animate-fade-in">
                <h3 className="text-2xl font-bold text-purple-300">Обо мне</h3>
                <div className="space-y-3 text-gray-300">
                  <p className="flex items-start gap-2">
                    <Icon name="Sparkles" size={20} className="text-purple-400 mt-1 flex-shrink-0" />
                    <span>Продвинутый AI-ассистент с возможностями обработки естественного языка</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Icon name="Zap" size={20} className="text-purple-400 mt-1 flex-shrink-0" />
                    <span>Быстрое обучение и адаптация под ваши задачи</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Icon name="Shield" size={20} className="text-purple-400 mt-1 flex-shrink-0" />
                    <span>Безопасность и конфиденциальность данных на первом месте</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Icon name="Heart" size={20} className="text-purple-400 mt-1 flex-shrink-0" />
                    <span>Дружелюбный интерфейс и человечный подход к общению</span>
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="friends" className="space-y-4 mt-6 animate-fade-in">
                <h3 className="text-2xl font-bold text-purple-300">Друзья (в разработке)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <Card className="bg-white/5 border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500">👤</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-white">Скоро здесь</p>
                        <p className="text-xs text-gray-400">появятся друзья</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="contacts" className="space-y-4 mt-6 animate-fade-in">
                <h3 className="text-2xl font-bold text-purple-300">Контакты</h3>
                <div className="space-y-3">
                  <Card className="bg-white/5 border-purple-500/20 hover:bg-white/10 transition-all">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Icon name="Phone" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Телефон</p>
                        <a href="tel:+79097562102" className="text-lg font-semibold text-white hover:text-purple-400 transition-colors">
                          +7 909 756 21 02
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-purple-500/20 hover:bg-white/10 transition-all">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Icon name="User" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Создатель</p>
                        <p className="text-lg font-semibold text-white">Al1se✔️</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4 mt-6 animate-fade-in">
                <h3 className="text-2xl font-bold text-purple-300">Отзывы</h3>
                <div className="space-y-4">
                  <Card className="bg-white/5 border-purple-500/20">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-sm">М</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-white">Михаил</p>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Icon key={i} name="Star" size={14} className="fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Отличный AI-помощник! Быстро и точно отвечает на вопросы. Рекомендую! 🔥
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-purple-500/20">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-sm">А</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-white">Анна</p>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Icon key={i} name="Star" size={14} className="fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Алиса помогла мне с проектом, все объяснила понятно. Супер! ✨
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;