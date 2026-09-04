import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const PricingPage = () => {
  const includedFeatures = ["Agendamento online ilimitado", "Painel administrativo completo", "Notificações via WhatsApp", "Cadastro ilimitado de clientes", "Cadastro ilimitado de serviços", "Relatórios e estatísticas", "Suporte via chat", "Atualizações gratuitas"];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-white to-purple-50 py-16 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-kendrah-black mb-6">Preços Simples e Transparentes</h1>
            <p className="text-xl text-gray-600 mb-8">Um único plano com tudo o que você precisa</p>
          </div>
        </section>
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row gap-8 justify-center">
              <Card className="border border-gray-200 w-full max-w-md">
                <CardHeader className="text-center"><CardTitle className="text-2xl font-bold">Teste Gratuito</CardTitle><div className="mt-4 mb-2"><span className="text-4xl font-bold">7 dias</span></div><CardDescription>Acesso completo a todas as funcionalidades</CardDescription></CardHeader>
                <CardContent className="mt-2"><ul className="space-y-2">{includedFeatures.map((feature, index) => <li key={index} className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><span className="text-gray-600">{feature}</span></li>)}</ul></CardContent>
                <CardFooter className="flex justify-center"><Link to="/register"><Button variant="outline" className="border-kendrah-purple text-kendrah-purple hover:bg-kendrah-purple/10 w-full">Começar Agora</Button></Link></CardFooter>
              </Card>
              <Card className="border border-kendrah-purple bg-white shadow-lg w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-kendrah-purple text-white px-4 py-1 text-sm font-medium">Recomendado</div>
                <CardHeader className="text-center"><CardTitle className="text-2xl font-bold">Plano Mensal</CardTitle><div className="mt-4 mb-2"><span className="text-4xl font-bold">R$ 39,90</span><span className="text-gray-500">/mês</span></div><CardDescription>Cobrado mensalmente</CardDescription></CardHeader>
                <CardContent className="mt-2"><ul className="space-y-2">{includedFeatures.map((feature, index) => <li key={index} className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /><span className="text-gray-600">{feature}</span></li>)}</ul></CardContent>
                <CardFooter className="flex justify-center"><Link to="/register"><Button className="bg-kendrah-purple hover:bg-kendrah-purple/90 text-white w-full">Assinar Agora</Button></Link></CardFooter>
              </Card>
            </div>
            <div className="mt-12 text-center"><h3 className="text-2xl font-bold mb-4">Perguntas sobre nossos planos?</h3><p className="text-gray-600 mb-6">Entre em contato conosco ou consulte nossa página de perguntas frequentes</p><div className="flex flex-wrap justify-center gap-4"><Link to="/contact"><Button variant="outline" className="border-kendrah-purple text-kendrah-purple hover:bg-kendrah-purple/10">Fale Conosco</Button></Link><Link to="/faq"><Button variant="outline" className="border-kendrah-purple text-kendrah-purple hover:bg-kendrah-purple/10">Ver FAQ</Button></Link></div></div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
