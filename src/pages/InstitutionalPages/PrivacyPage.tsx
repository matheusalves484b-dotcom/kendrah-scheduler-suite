
import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const PrivacyPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-white to-purple-50 py-16 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-kendrah-black mb-6">
              Política de Privacidade
            </h1>
            <p className="text-lg text-gray-600">
              Última atualização: 16 de Maio de 2025
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
              <p>
                O Kendrah ("nós", "nosso" ou "Kendrah") está comprometido em proteger a privacidade dos dados pessoais de nossos usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos, protegemos e compartilhamos suas informações quando você usa nossa plataforma de agendamento online, aplicativo, site ou qualquer outro recurso disponibilizado por nós (coletivamente, os "Serviços").
              </p>
              <p>
                Esta política foi elaborada em conformidade com a Lei Geral de Proteção de Dados (LGPD) - Lei nº 13.709/2018. Ao utilizar nossos Serviços, você concorda com a coleta e uso de informações de acordo com esta política.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Informações que Coletamos</h2>
              <p>Coletamos os seguintes tipos de informações:</p>

              <h3 className="text-xl font-medium mt-4 mb-2">2.1 Informações de Cadastro</h3>
              <p>
                Quando você se registra para usar o Kendrah, coletamos informações pessoais como:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>Número de telefone</li>
                <li>Informações de pagamento (processadas de forma segura por nossos provedores de pagamento)</li>
              </ul>

              <h3 className="text-xl font-medium mt-4 mb-2">2.2 Informações de Uso</h3>
              <p>
                Coletamos informações sobre como você utiliza nossos Serviços, incluindo:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>Agendamentos realizados</li>
                <li>Serviços cadastrados</li>
                <li>Clientes cadastrados</li>
                <li>Configurações de disponibilidade</li>
                <li>Páginas visitadas e recursos utilizados</li>
                <li>Tempo gasto no aplicativo</li>
              </ul>

              <h3 className="text-xl font-medium mt-4 mb-2">2.3 Informações Técnicas</h3>
              <p>
                Automaticamente coletamos certas informações quando você acessa nossos Serviços, incluindo:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>Endereço IP</li>
                <li>Tipo de dispositivo</li>
                <li>Tipo de navegador</li>
                <li>Sistema operacional</li>
                <li>Identificadores únicos de dispositivos</li>
                <li>Dados de localização (com seu consentimento)</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Como Utilizamos suas Informações</h2>
              <p>
                Utilizamos as informações coletadas para os seguintes propósitos:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>Fornecer, manter e melhorar nossos Serviços</li>
                <li>Processar e gerenciar sua conta e assinatura</li>
                <li>Enviar notificações sobre agendamentos e lembretes</li>
                <li>Enviar comunicações sobre atualizações, recursos e ofertas</li>
                <li>Responder a suas solicitações e fornecer suporte</li>
                <li>Analisar tendências de uso para melhorar a experiência do usuário</li>
                <li>Detectar, prevenir e resolver problemas técnicos e de segurança</li>
                <li>Cumprir obrigações legais e regulatórias</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Compartilhamento de Informações</h2>
              <p>
                Podemos compartilhar suas informações com terceiros nas seguintes circunstâncias:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>Com prestadores de serviços que trabalham em nosso nome para facilitar nossos Serviços (como provedores de hospedagem, processadores de pagamento)</li>
                <li>Para cumprir com obrigações legais, como responder a ordens judiciais e prevenir fraude</li>
                <li>Em conexão com, ou durante negociações de, qualquer fusão, venda de ativos da empresa, financiamento ou aquisição</li>
                <li>Com seu consentimento explícito</li>
              </ul>
              <p>
                Não vendemos, alugamos ou negociamos suas informações pessoais com terceiros para fins de marketing.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Segurança dos Dados</h2>
              <p>
                A segurança de suas informações é importante para nós. Implementamos medidas técnicas, administrativas e organizacionais adequadas para proteger suas informações pessoais contra perda, roubo, uso indevido, acesso não autorizado, divulgação, alteração e destruição.
              </p>
              <p>
                Alguns dos procedimentos de segurança que adotamos incluem:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>Criptografia de dados sensíveis</li>
                <li>Firewalls e sistemas de detecção de intrusão</li>
                <li>Acesso limitado a informações pessoais</li>
                <li>Monitoramento regular de sistemas para detectar vulnerabilidades</li>
                <li>Treinamento de funcionários sobre práticas de segurança</li>
              </ul>
              <p>
                No entanto, nenhum método de transmissão pela Internet ou método de armazenamento eletrônico é 100% seguro. Portanto, não podemos garantir sua segurança absoluta.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Seus Direitos</h2>
              <p>
                De acordo com a LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>Direito de acesso: Você tem o direito de solicitar uma cópia das informações que temos sobre você</li>
                <li>Direito de retificação: Você tem o direito de corrigir dados imprecisos ou incompletos</li>
                <li>Direito de exclusão: Você tem o direito de solicitar que seus dados sejam excluídos</li>
                <li>Direito de restrição: Você tem o direito de solicitar a restrição do processamento de seus dados</li>
                <li>Direito de portabilidade: Você tem o direito de solicitar a transferência dos seus dados para outro controlador</li>
                <li>Direito de oposição: Você tem o direito de se opor ao processamento de seus dados em determinadas circunstâncias</li>
                <li>Direito de não ser submetido a decisões automatizadas: Você tem o direito de não ser submetido a decisões baseadas apenas em processamento automatizado</li>
              </ul>
              <p>
                Para exercer qualquer um desses direitos, entre em contato conosco através do e-mail <a href="mailto:privacidade@kendrah.com" className="text-kendrah-purple hover:underline">privacidade@kendrah.com</a>.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Retenção de Dados</h2>
              <p>
                Mantemos suas informações pessoais pelo tempo necessário para atingir as finalidades descritas nesta Política de Privacidade, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
              </p>
              <p>
                Quando você exclui sua conta, podemos continuar armazenando certas informações conforme necessário para cumprir com nossas obrigações legais, resolver disputas e fazer cumprir nossos acordos.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Cookies e Tecnologias Similares</h2>
              <p>
                Utilizamos cookies e tecnologias similares para coletar informações sobre como você interage com nossos Serviços e para personalizar sua experiência. Você pode configurar seu navegador para recusar todos os cookies ou para indicar quando um cookie está sendo enviado. No entanto, algumas funcionalidades dos Serviços podem não funcionar adequadamente sem cookies.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Alterações nesta Política</h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações publicando a nova Política de Privacidade nesta página e atualizando a data de "Última atualização". Recomendamos que você revise esta Política de Privacidade periodicamente para quaisquer alterações.
              </p>
              <p>
                O uso continuado dos Serviços após a publicação de alterações a esta Política de Privacidade em nosso site constituirá sua aceitação das alterações.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contato</h2>
              <p>
                Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade ou sobre o tratamento de seus dados pessoais, entre em contato conosco pelo e-mail <a href="mailto:privacidade@kendrah.com" className="text-kendrah-purple hover:underline">privacidade@kendrah.com</a>.
              </p>
              <p>
                Nosso Encarregado de Proteção de Dados (DPO) pode ser contatado em: <a href="mailto:dpo@kendrah.com" className="text-kendrah-purple hover:underline">dpo@kendrah.com</a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;
