import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TimeSlot } from "@/types";
import { supabase } from "@/integrations/supabase/client";

const daysOfWeek = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

const generateTimeOptions = () => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      options.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
    }
  }
  return options;
};

const timeOptions = generateTimeOptions();

interface DayAvailability {
  dayOfWeek: number;
  isAvailable: boolean;
  timeSlots: {
    id?: string;
    startTime: string;
    endTime: string;
  }[];
}

const createInitialAvailability = (): DayAvailability[] =>
  daysOfWeek.map((day) => ({
    dayOfWeek: day.value,
    isAvailable: false,
    timeSlots: [{ startTime: "09:00", endTime: "17:00" }],
  }));

const convertTimeSlotsToAvailability = (timeSlots: TimeSlot[]): DayAvailability[] => {
  const availability = createInitialAvailability();

  timeSlots.forEach((slot) => {
    const day = availability.find((item) => item.dayOfWeek === slot.dayOfWeek);
    if (!day) return;

    day.isAvailable = true;
    day.timeSlots = [
      ...day.timeSlots.filter((item) => item.id),
      {
        id: slot.id,
        startTime: slot.startTime.slice(0, 5),
        endTime: slot.endTime.slice(0, 5),
      },
    ];
  });

  availability.forEach((day) => {
    if (day.isAvailable && day.timeSlots.length === 0) {
      day.timeSlots = [{ startTime: "09:00", endTime: "17:00" }];
    }
  });

  return availability;
};

const AvailabilityPage = () => {
  const queryClient = useQueryClient();
  const [availability, setAvailability] = useState<DayAvailability[]>(createInitialAvailability());

  const { data: timeSlots = [], isLoading } = useQuery({
    queryKey: ["timeSlots"],
    queryFn: async (): Promise<TimeSlot[]> => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Sessão expirada. Faça login novamente.");

      const { data, error } = await supabase
        .from("availability_slots")
        .select("id, user_id, day_of_week, start_time, end_time, is_available")
        .eq("user_id", user.id)
        .eq("is_available", true)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;

      return (data ?? []).map((slot) => ({
        id: slot.id,
        userId: slot.user_id,
        dayOfWeek: slot.day_of_week,
        startTime: String(slot.start_time).slice(0, 5),
        endTime: String(slot.end_time).slice(0, 5),
        isAvailable: slot.is_available ?? true,
      }));
    },
  });

  useEffect(() => {
    setAvailability(convertTimeSlotsToAvailability(timeSlots));
  }, [timeSlots]);

  const mutation = useMutation({
    mutationFn: async (data: DayAvailability[]) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Sessão expirada. Faça login novamente.");

      for (const day of data) {
        if (!day.isAvailable) continue;

        for (const slot of day.timeSlots) {
          if (slot.endTime <= slot.startTime) {
            throw new Error(`O horário de término deve ser depois do início em ${daysOfWeek.find((item) => item.value === day.dayOfWeek)?.label}.`);
          }
        }
      }

      const { error: deleteError } = await supabase
        .from("availability_slots")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      const rows = data.flatMap((day) =>
        day.isAvailable
          ? day.timeSlots.map((slot) => ({
              user_id: user.id,
              day_of_week: day.dayOfWeek,
              start_time: slot.startTime,
              end_time: slot.endTime,
              is_available: true,
            }))
          : []
      );

      if (rows.length === 0) return [];

      const { data: saved, error: insertError } = await supabase
        .from("availability_slots")
        .insert(rows)
        .select("id, user_id, day_of_week, start_time, end_time, is_available");

      if (insertError) throw insertError;

      return saved ?? [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
      toast({
        title: "Disponibilidade salva",
        description: "Seus dias e horários de atendimento foram atualizados com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar seus horários de atendimento.",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["timeSlots"] });
    },
  });

  const handleDayToggle = (dayIndex: number) => {
    setAvailability((prev) =>
      prev.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              isAvailable: !day.isAvailable,
              timeSlots: day.timeSlots.length > 0 ? day.timeSlots : [{ startTime: "09:00", endTime: "17:00" }],
            }
          : day
      )
    );
  };

  const handleAddTimeSlot = (dayIndex: number) => {
    setAvailability((prev) =>
      prev.map((day, index) => {
        if (index !== dayIndex) return day;
        const lastSlot = day.timeSlots[day.timeSlots.length - 1] ?? { startTime: "09:00", endTime: "12:00" };
        return {
          ...day,
          timeSlots: [...day.timeSlots, { startTime: lastSlot.endTime, endTime: "18:00" }],
        };
      })
    );
  };

  const handleRemoveTimeSlot = (dayIndex: number, slotIndex: number) => {
    setAvailability((prev) =>
      prev.map((day, index) =>
        index === dayIndex
          ? { ...day, timeSlots: day.timeSlots.filter((_, i) => i !== slotIndex) }
          : day
      )
    );
  };

  const handleTimeChange = (dayIndex: number, slotIndex: number, field: "startTime" | "endTime", value: string) => {
    setAvailability((prev) =>
      prev.map((day, index) => {
        if (index !== dayIndex) return day;
        return {
          ...day,
          timeSlots: day.timeSlots.map((slot, i) =>
            i === slotIndex ? { ...slot, [field]: value } : slot
          ),
        };
      })
    );
  };

  const validateTimeSlots = () => {
    for (const day of availability) {
      if (!day.isAvailable) continue;
      if (day.timeSlots.length === 0) {
        toast({
          title: "Horário não configurado",
          description: `Adicione pelo menos um horário para ${daysOfWeek.find((item) => item.value === day.dayOfWeek)?.label}.`,
          variant: "destructive",
        });
        return false;
      }

      const sortedSlots = [...day.timeSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
      for (let i = 0; i < sortedSlots.length; i++) {
        if (sortedSlots[i].endTime <= sortedSlots[i].startTime) {
          toast({
            title: "Horário inválido",
            description: `O término deve ser depois do início em ${daysOfWeek.find((item) => item.value === day.dayOfWeek)?.label}.`,
            variant: "destructive",
          });
          return false;
        }
        if (i < sortedSlots.length - 1 && sortedSlots[i].endTime > sortedSlots[i + 1].startTime) {
          toast({
            title: "Horários sobrepostos",
            description: `Existem horários sobrepostos em ${daysOfWeek.find((item) => item.value === day.dayOfWeek)?.label}.`,
            variant: "destructive",
          });
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = () => {
    if (validateTimeSlots()) mutation.mutate(availability);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <DashboardHeader
          title="Disponibilidade"
          subtitle="Configure os dias e horários em que você está disponível para atendimentos"
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando configurações de disponibilidade...</p>
          </div>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Dias e horários de atendimento</CardTitle>
                <CardDescription>
                  Marque os dias em que você atende e escolha os horários. Você pode adicionar mais de um intervalo no mesmo dia.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {availability.map((day, dayIndex) => (
                    <div key={day.dayOfWeek} className="rounded-md border p-4">
                      <div className="mb-4 flex items-center">
                        <Checkbox
                          id={`day-${day.dayOfWeek}`}
                          checked={day.isAvailable}
                          onCheckedChange={(checked) => {
                            if (checked !== day.isAvailable) handleDayToggle(dayIndex);
                          }}
                        />
                        <label htmlFor={`day-${day.dayOfWeek}`} className="ml-2 cursor-pointer font-medium">
                          {daysOfWeek.find((d) => d.value === day.dayOfWeek)?.label}
                        </label>
                      </div>

                      {day.isAvailable && (
                        <div className="space-y-4">
                          {day.timeSlots.map((slot, slotIndex) => (
                            <div key={slot.id ?? `${day.dayOfWeek}-${slotIndex}`} className="flex items-center space-x-3">
                              <div className="grid flex-1 grid-cols-2 gap-3">
                                <div>
                                  <label className="text-sm text-muted-foreground">Início</label>
                                  <Select value={slot.startTime} onValueChange={(value) => handleTimeChange(dayIndex, slotIndex, "startTime", value)}>
                                    <SelectTrigger><SelectValue placeholder="Início" /></SelectTrigger>
                                    <SelectContent>
                                      {timeOptions.map((time) => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm text-muted-foreground">Término</label>
                                  <Select value={slot.endTime} onValueChange={(value) => handleTimeChange(dayIndex, slotIndex, "endTime", value)}>
                                    <SelectTrigger><SelectValue placeholder="Término" /></SelectTrigger>
                                    <SelectContent>
                                      {timeOptions.map((time) => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {day.timeSlots.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => handleRemoveTimeSlot(dayIndex, slotIndex)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                  </svg>
                                  <span className="sr-only">Remover horário</span>
                                </Button>
                              )}
                            </div>
                          ))}

                          <Button type="button" variant="outline" size="sm" onClick={() => handleAddTimeSlot(dayIndex)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M5 12h14" /><path d="M12 5v14" />
                            </svg>
                            Adicionar intervalo
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="button"
                className="bg-kendrah-purple hover:bg-kendrah-purple/90"
                onClick={handleSave}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Salvando..." : "Salvar disponibilidade"}
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AvailabilityPage;
