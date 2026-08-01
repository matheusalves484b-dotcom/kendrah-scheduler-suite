
import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const TermsPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-white to-purple-50 py-16 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-kendrah-black mb-6">
              Termos de Uso
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
                Bem-vindo ao Kendrah ("nós", "nosso" ou "Kendrah"). Ao acessar ou usar nosso serviço de agendamento online, aplicativo, site ou qualquer outro recurso disponibilizado por nós (coletivamente, os "Serviços"), você concorda com estes Termos de Uso. Por favor, leia-os com atenção.
              </p>
              <p>
                Estes Termos de Uso constituem um contrato legalmente vinculativo entre você (seja como indivíduo ou em nome de uma entidade) e o Kendrah em relação ao seu uso dos Serviços. Se você não concordar com estes termos, por favor, não use nossos Serviços.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Descrição dos Serviços</h2>
              <p>
                O Kendrah é uma plataforma de agendamento online que permite aos prestadores de serviços gerenciar suas agendas, clientes e compromissos. Nossos Serviços incluem, mas não estão limitados a:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>Ferramentas de agendamento online</li>
                <li>Gestão de clientes</li>
                <li>Notificações e lembretes</li>
                <li>Gestão de disponibilidade</li>
                <li>Cadastro de serviços</li>
                <li>Relatórios e estatísticas</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Contas e Registro</h2>
              <p>
                Para usar muitos dos recursos do Kendrah, você deve se registrar para uma conta. Quando você registra uma conta, você deve fornecer informações precisas e completas. É sua responsabilidade manter a segurança de sua conta, incluindo manter sua senha confidencial. Você é responsável por todas as atividades que ocorrem sob sua conta.
              </p>
              <p>
                Você concorda em notificar o Kendrah imediatamente sobre qualquer uso não autorizado de sua conta ou qualquer outra violação de segurança.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Planos e Pagamentos</h2>
              <p>
                O Kendrah oferece um plano de assinatura mensal e um período de teste gratuito. Os detalhes específicos sobre preços e o que está incluído em cada plano estão disponíveis em nossa página de Preços.
              </p>
              <p>
                Ao assinar um plano pago, você concorda em pagar todas as taxas aplicáveis conforme descritas na página de Preços. Todos os pagamentos são não-reembolsáveis, exceto conforme exigido por lei ou conforme expressamente estabelecido nestes Termos.
              </p>
              <p>
                Podemos alterar nossas taxas a qualquer momento, mas notificaremos você antes que essas alterações entrem em vigor. O uso continuado dos Serviços após a notificação de uma alteração de preço constitui sua aceitação dos novos preços.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Teste Gratuito</h2>
              <p>
                Oferecemos um teste gratuito de 7 dias para novos usuários. Durante o período de teste, você terá acesso a todos os recursos incluídos em nosso plano pago. Ao final do período de teste, sua conta será automaticamente convertida para uma conta básica (gratuita) com recursos limitados, a menos que você opte por assinar um plano pago.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Cancelamento e Reembolsos</h2>
              <p>
                Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta. Quando você cancela, sua assinatura permanecerá ativa até o final do período de cobrança atual. Não fornecemos reembolsos para períodos de assinatura parcialmente utilizados.
              </p>
              <p>
                Reservamos o direito de suspender ou encerrar sua conta se você violar estes Termos de Uso ou por qualquer outro motivo a nosso critério.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Uso Aceitável</h2>
              <p>
                Você concorda em usar os Serviços apenas para fins legais e de acordo com estes Termos de Uso. Você não usará os Serviços:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>De qualquer maneira que viole qualquer lei ou regulamento aplicável</li>
                <li>Para enviar, receber, carregar, baixar, usar ou reutilizar qualquer material que não esteja em conformidade com nossas políticas de conteúdo</li>
                <li>Para transmitir ou garantir o envio de qualquer material publicitário ou promocional não solicitado ou não autorizado</li>
                <li>Para personificar ou tentar personificar o Kendrah, um funcionário do Kendrah, outro usuário ou qualquer outra pessoa ou entidade</li>
                <li>Para se envolver em qualquer atividade que interfira ou interrompa os Serviços ou servidores e redes conectados aos Serviços</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitação de Responsabilidade</h2>
              <p>
                Em nenhum caso o Kendrah, seus diretores, funcionários, parceiros, agentes, fornecedores ou afiliados serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis, resultantes de:
              </p>
              <ul className="list-disc pl-6 my-4">
                <li>Seu acesso ou uso ou incapacidade de acessar ou usar os Serviços</li>
                <li>Qualquer conduta ou conteúdo de terceiros nos Serviços</li>
                <li>Conteúdo obtido dos Serviços</li>
                <li>Acesso não autorizado, uso ou alteração de suas transmissões ou conteúdo</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Modificações dos Termos</h2>
              <p>
                Reservamos o direito de modificar estes Termos de Uso a qualquer momento. Se fizermos alterações, publicaremos os termos revisados e atualizaremos a data de "Última atualização" no topo destes termos. Se as alterações forem significativas, notificaremos você por e-mail ou através de um aviso em nosso site antes que as alterações entrem em vigor.
              </p>
              <p>
                Seu uso continuado dos Serviços após a publicação de termos revisados significa que você aceita e concorda com as alterações.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">10. Lei Aplicável</h2>
              <p>
                Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar suas disposições de conflito de leis.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contato</h2>
              <p>
                Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco em: <a href="mailto:legal@kendrah.com" className="text-kendrah-purple hover:underline">legal@kendrah.com</a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;
