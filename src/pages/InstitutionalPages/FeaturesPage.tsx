
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Button } from '@/components/ui/button';
import { 
  Calendar, MessageSquare, User, Settings, 
  LayoutGrid, CreditCard, Bell, Clock 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FeaturesPage = () => {
  const features = [
    {
      title: "Agendamento Online",
      description: "Disponibilize um link personalizado para seus clientes agendarem horários diretamente na sua agenda.",
      icon: <Calendar className="h-12 w-12 text-kendrah-purple" />
    },
    {
      title: "Calendário Interativo",
      description: "Visualize todos seus compromissos em um calendário organizado e de fácil utilização.",
      icon: <LayoutGrid className="h-12 w-12 text-kendrah-purple" />
    },
    {
      title: "Notificações via WhatsApp",
      description: "Sistema envia lembretes automáticos para você e seus clientes, reduzindo as faltas.",
      icon: <MessageSquare className="h-12 w-12 text-kendrah-purple" />
    },
    {
      title: "Cadastro de Clientes",
      description: "Mantenha todas as informações de seus clientes organizadas em um só lugar.",
      icon: <User className="h-12 w-12 text-kendrah-purple" />
    },
    {
      title: "Cadastro de Serviços",
      description: "Crie e personalize todos os serviços que você oferece, com preços e duração.",
      icon: <CreditCard className="h-12 w-12 text-kendrah-purple" />
    },
    {
      title: "Gestão de Disponibilidade",
      description: "Configure seus horários de trabalho e períodos de descanso com facilidade.",
      icon: <Clock className="h-12 w-12 text-kendrah-purple" />
    },
    {
      title: "Painel Administrativo",
      description: "Interface intuitiva e completa para gerenciar todo seu negócio.",
      icon: <Settings className="h-12 w-12 text-kendrah-purple" />
    },
    {
      title: "Alertas e Lembretes",
      description: "Receba notificações sobre novos agendamentos e compromissos do dia.",
      icon: <Bell className="h-12 w-12 text-kendrah-purple" />
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-white to-purple-50 py-16 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-kendrah-black mb-6">
              Funcionalidades do Kendrah
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Conheça todas as ferramentas que transformarão sua gestão de agendamentos
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl text-kendrah-black">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-kendrah-purple/5 py-16 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h2 className="text-3xl font-bold text-kendrah-black mb-8">
              Pronto para experimentar?
            </h2>
            <Link to="/register">
              <Button size="lg" className="bg-kendrah-purple hover:bg-kendrah-purple/90 text-white font-medium px-8 py-6 text-lg h-auto">
                Teste Grátis por 7 Dias
              </Button>
            </Link>
            <p className="mt-4 text-gray-600">
              Cancele quando quiser
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
