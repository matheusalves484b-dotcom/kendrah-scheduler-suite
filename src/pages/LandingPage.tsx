import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
const LandingPage = () => {
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-kendrah-purple to-kendrah-black text-white py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-10 mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Automatize sua agenda. <br />
                Simplifique sua rotina.
              </h1>
              <p className="text-xl mb-8 text-gray-100">
                Sistema de agendamento online completo para profissionais que valorizam seu tempo e querem crescer.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register">
                  <Button className="text-lg bg-white text-kendrah-purple hover:bg-white/90 px-8 py-6">
                    Teste Grátis por 14 Dias
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="text-lg text-white border-white px-8 py-6 bg-zinc-900 hover:bg-zinc-800">
                    Área do Cliente
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-300">Sem necessidade de cartão de crédito</p>
            </div>
            <div className="lg:w-1/2">
              <img src="/placeholder.svg" alt="Kendrah Dashboard" className="rounded-lg shadow-2xl" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-kendrah-black">Funcionalidades Completas</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo o que você precisa para gerenciar seus agendamentos de forma profissional, em um só lugar.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[{
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>,
            title: "Agenda Online",
            description: "Calendário completo e personalizável para gerenciar seus compromissos com facilidade."
          }, {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>,
            title: "Notificações por WhatsApp",
            description: "Envie lembretes e confirmações automáticas por WhatsApp para seus clientes."
          }, {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>,
            title: "Link Personalizado",
            description: "Receba agendamentos através de um link personalizado que você pode compartilhar com seus clientes."
          }, {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>,
            title: "Cadastro de Serviços",
            description: "Cadastre seus serviços, duração e preços para que seus clientes escolham ao agendar."
          }, {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>,
            title: "Horários Personalizados",
            description: "Configure sua disponibilidade com flexibilidade para cada dia da semana."
          }, {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>,
            title: "Integrações",
            description: "Conecte com ferramentas como Zapier e Make para automatizar ainda mais seus processos."
          }].map((feature, index) => <div key={index} className="kendrah-card flex flex-col items-center text-center hover:border-kendrah-purple/40 transition-colors">
                <div className="text-kendrah-purple mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-kendrah-black">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>)}
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section className="py-20 bg-kendrah-gray/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-kendrah-black">Preço Simples e Transparente</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sem taxas ocultas, sem complicações. Apenas um preço justo por tudo que você precisa.
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="kendrah-card max-w-lg border-2 border-kendrah-purple bg-gray-950">
              <div className="text-center">
                <h3 className="text-xl font-bold text-kendrah-accent">Plano Premium</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-kendrah-accent">R$ 39,90</span>
                  <span className="ml-2 text-zinc-500">/mês</span>
                </div>
                <p className="mt-2 text-gray-500">Cobrado mensalmente</p>
              </div>
              
              <div className="mt-8 space-y-4">
                {["Agendamentos ilimitados", "Notificações por WhatsApp", "Link de agendamento personalizado", "Cadastro ilimitado de serviços", "Horários personalizados", "Integrações com Zapier e Make", "Suporte prioritário", "Atualizações e novidades"].map((feature, index) => <div key={index} className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-kendrah-purple mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-zinc-50">{feature}</span>
                  </div>)}
              </div>
              
              <div className="mt-8">
                <Link to="/register" className="w-full">
                  <Button className="kendrah-button w-full py-6">
                    Experimente Grátis por 14 Dias
                  </Button>
                </Link>
                <p className="text-sm text-center mt-3 text-gray-500">
                  Sem necessidade de cartão de crédito para o teste
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-kendrah-black">O Que Nossos Clientes Dizem</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Profissionais que já transformaram sua rotina com o Kendrah
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
            name: "Mariana Costa",
            role: "Terapeuta",
            quote: "O Kendrah simplificou completamente minha agenda. Reduzi em 80% o tempo que gastava organizando consultas e meus clientes adoraram a facilidade de agendar online."
          }, {
            name: "Rafael Oliveira",
            role: "Coach de Carreira",
            quote: "As notificações automáticas por WhatsApp diminuíram drasticamente o número de faltas. Uma ferramenta que se paga sozinha logo no primeiro mês!"
          }, {
            name: "Camila Souza",
            role: "Esteticista",
            quote: "Interface super intuitiva e fácil de usar. Consegui configurar todo o sistema em menos de 30 minutos e já comecei a receber agendamentos no mesmo dia."
          }].map((testimonial, index) => <div key={index} className="kendrah-card">
                <div className="flex items-center mb-4">
                  <div className="bg-kendrah-purple/10 text-kendrah-purple rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700">"{testimonial.quote}"</p>
              </div>)}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-kendrah-purple text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para simplificar sua rotina?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Comece agora mesmo com 14 dias de teste grátis. Sem compromisso, sem cartão de crédito.
          </p>
          <Link to="/register">
            <Button className="text-lg px-8 py-6 bg-zinc-900 hover:bg-zinc-800 text-zinc-50">
              Criar Minha Conta Grátis
            </Button>
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>;
};
export default LandingPage;