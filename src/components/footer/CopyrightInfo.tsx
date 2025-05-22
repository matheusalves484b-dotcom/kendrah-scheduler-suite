
import SocialIcons from './SocialIcons';

interface CopyrightInfoProps {
  year: number;
}

const CopyrightInfo = ({ year }: CopyrightInfoProps) => {
  return (
    <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
      <p className="text-gray-400">
        &copy; {year} Kendrah. Todos os direitos reservados.
      </p>
      <SocialIcons />
    </div>
  );
};

export default CopyrightInfo;
