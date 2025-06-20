
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CopyBookingLink from '@/components/CopyBookingLink';
import { Link2 } from 'lucide-react';

interface BookingLinkCardProps {
  userId: string;
}

const BookingLinkCard = ({ userId }: BookingLinkCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Link de Agendamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Compartilhe este link com seus clientes para que eles possam agendar seus serviços online:
        </p>
        <CopyBookingLink userId={userId} />
      </CardContent>
    </Card>
  );
};

export default BookingLinkCard;
