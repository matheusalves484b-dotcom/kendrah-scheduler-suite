
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQPage = () => {
  const faqs = [
    {
      question: "Como funciona o teste gratuito de 7 dias?",
      answer: "Você tem acesso completo ao sistema durante 7 dias. Você pode cancelar quando quiser. Ao final do período, você pode escolher assinar o plano ou cancelar sem compromisso."
    },
    {
      question: "Posso cancelar quando quiser?",
      answer: "Sim, o cancelamento é simples e imediato. Você pode cancelar sua assinatura a qualquer momento pela página de configurações da sua conta. Não há taxas de cancelamento ou compromisso de permanência."
    },
    {
      question: "Receberei alertas pelo WhatsApp?",
      answer: "Sim! O sistema envia notificações automáticas no seu WhatsApp sobre novos agendamentos, lembretes de compromissos e outras atualizações importantes da sua agenda."
    },
    {
      question: "Preciso instalar algo?",
      answer: "Não. O sistema funciona 100% online, sem downloads. Você pode acessar o Kendrah de qualquer dispositivo com acesso à internet, como computadores, tablets e smartphones."
    },
    {
      question: "Posso personalizar os horários disponíveis para agendamento?",
      answer: "Sim, o Kendrah permite configurar seus horários de trabalho, intervalos, feriados e períodos de descanso. Você tem controle total sobre sua disponibilidade."
    },
    {
      question: "Como meus clientes fazem agendamentos?",
      answer: "Você recebe um link personalizado que pode compartilhar com seus clientes via WhatsApp, e-mail, redes sociais ou incorporar no seu site. Através desse link, eles visualizam sua disponibilidade e podem agendar horários diretamente."
    },
    {
      question: "Quais formas de pagamento são aceitas?",
      answer: "Aceitamos cartões de crédito, PIX e boleto bancário. Os pagamentos são processados de forma segura através da nossa plataforma de pagamentos parceira."
    },
    {
      question: "Existe limite de clientes ou agendamentos?",
      answer: "Não, o plano do Kendrah inclui cadastro ilimitado de clientes e agendamentos, sem cobranças extras por volume de uso."
    },
    {
      question: "É possível usar em mais de um dispositivo?",
      answer: "Sim, você pode acessar sua conta do Kendrah em múltiplos dispositivos simultaneamente, mantendo tudo sincronizado em tempo real."
    },
    {
      question: "Oferecem suporte técnico?",
      answer: "Sim, oferecemos suporte técnico por e-mail e chat de segunda a sexta, das 9h às 18h. Nosso tempo médio de resposta é de até 24 horas úteis."
    },
  ];

  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = searchTerm 
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqs;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-white to-purple-50 py-16 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-kendrah-black mb-6">
              Perguntas Frequentes
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Encontre respostas para as dúvidas mais comuns sobre o Kendrah
            </p>
            
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Buscar pergunta..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-kendrah-purple/30 focus:border-kendrah-purple"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border border-gray-200 rounded-lg px-4 overflow-hidden"
                  >
                    <AccordionTrigger className="text-left font-medium py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 pb-4 pt-1">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhuma pergunta encontrada para "{searchTerm}"</p>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="text-kendrah-purple hover:underline mt-2"
                  >
                    Limpar busca
                  </button>
                </div>
              )}
            </Accordion>

            <div className="mt-16 text-center">
              <h3 className="text-xl font-bold mb-4">Ainda tem dúvidas?</h3>
              <p className="text-gray-600 mb-6">Entre em contato com nossa equipe</p>
              <Link to="/contact">
                <Button className="bg-kendrah-purple hover:bg-kendrah-purple/90">
                  Fale Conosco
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;
