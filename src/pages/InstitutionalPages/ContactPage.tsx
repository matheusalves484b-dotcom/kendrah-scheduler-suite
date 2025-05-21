import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import { toast } from 'sonner';
const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success("Mensagem enviada com sucesso! Retornaremos em breve.");
      setFormData({
        name: '',
        email: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1000);
  };
  return <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-white to-purple-50 py-16 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-kendrah-black mb-6">
              Entre em Contato
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Estamos aqui para ajudar você com qualquer dúvida sobre o Kendrah
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-bold mb-6">Envie uma mensagem</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full" placeholder="Seu nome" />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full" placeholder="seu.email@exemplo.com" />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Mensagem
                    </label>
                    <Textarea id="message" name="message" value={formData.message} onChange={handleChange} required className="w-full min-h-[150px]" placeholder="Como podemos ajudar?" />
                  </div>
                  
                  <Button type="submit" className="w-full bg-kendrah-purple hover:bg-kendrah-purple/90" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                  </Button>
                </form>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-6">Outras formas de contato</h2>
                <div className="space-y-6">
                  <Card className="border border-gray-200">
                    <CardContent className="flex items-start space-x-4 p-6">
                      <Mail className="h-6 w-6 text-kendrah-purple mt-1" />
                      <div>
                        <h3 className="font-medium text-lg">E-mail</h3>
                        <p className="text-gray-600 mt-1">sac@kendrah.com</p>
                        <p className="text-gray-500 text-sm mt-1">Respondemos em até 24 horas</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200">
                    <CardContent className="flex items-start space-x-4 p-6">
                      <MessageSquare className="h-6 w-6 text-kendrah-purple mt-1" />
                      <div>
                        <h3 className="font-medium text-lg">WhatsApp</h3>
                        <p className="text-gray-600 mt-1">+55 (21) 98100-6538</p>
                        <a href="https://wa.me/5511987654321" target="_blank" rel="noopener noreferrer" className="text-kendrah-purple hover:underline text-sm mt-2 inline-block">
                          Iniciar conversa →
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200">
                    
                  </Card>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-xl font-medium mb-4">Perguntas frequentes</h3>
                  <p className="text-gray-600 mb-4">
                    Encontre respostas rápidas para as dúvidas mais comuns sobre o Kendrah.
                  </p>
                  <Link to="/faq">
                    <Button variant="outline" className="border-kendrah-purple text-kendrah-purple hover:bg-kendrah-purple/10">
                      Ver FAQ
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
export default ContactPage;